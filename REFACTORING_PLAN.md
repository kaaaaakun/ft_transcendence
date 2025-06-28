# ft_transcendence リファクタリング計画

## 概要
このドキュメントは、ft_transcendenceプロジェクトのコードベース分析結果と、必要なリファクタリング作業をまとめたものです。

## 🔴 高優先度（セキュリティ・パフォーマンス）

### 1. セキュリティ問題

#### 1.1 ハードコードされた設定値の環境変数化
**対象箇所:**
- `/api/conf/trans/settings.py` (行46): デフォルトシークレットキー
- `/api/conf/utils/blockchain_controller.py` (行96): ガス制限のハードコード

**現在の問題:**
- 設定値がソースコードに露出している
- 環境ごとの設定変更が困難
- セキュリティリスクが存在

**改善案:**
```python
# 環境変数での管理を徹底
DEFAULT_GAS_LIMIT = int(os.getenv('BLOCKCHAIN_GAS_LIMIT', '500000'))
SECRET_KEY = os.getenv('SECRET_KEY')
```

**作業内容:**
- [ ] settings.pyの設定値を環境変数に移行
- [ ] blockchain_controller.pyのハードコード値を環境変数に移行
- [ ] .env.sampleファイルの更新
- [ ] docker-compose.ymlの環境変数設定更新

#### 1.2 JWT有効期限の見直しとセキュリティ強化
**対象箇所:**
- `/api/conf/user/utils.py` (行63-78): トークン検証のエラーハンドリング
- JWT設定ファイル

**現在の問題:**
- JWT有効期限が30日と長期間
- セッションハイジャックのリスク増大
- トークン検証のエラーハンドリングが不完全

**改善案:**
- JWT有効期限を1-7日に短縮
- リフレッシュトークンの実装検討
- より厳密なトークン検証の実装

**作業内容:**
- [ ] JWT有効期限を適切な期間（1-7日）に変更
- [ ] トークン検証のエラーハンドリング強化
- [ ] セキュリティテストの追加
- [ ] ドキュメントの更新

#### 1.3 入力検証とサニタイゼーションの強化
**対象箇所:**
- `/api/conf/user/views.py` (行104): JSONパースのエラーハンドリング不足
- `/api/conf/user/serializers.py` (行94-95): ファイルパス検証なし
- ファイルアップロード処理全般

**現在の問題:**
- 入力値の検証が不完全
- ファイルアップロード時のセキュリティチェック不足
- SQLインジェクション、XSSのリスク

**改善案:**
```python
# より厳密な入力検証
def validate_file_upload(file):
    allowed_extensions = ['.jpg', '.png', '.gif']
    max_size = 5 * 1024 * 1024  # 5MB
    
    if not any(file.name.lower().endswith(ext) for ext in allowed_extensions):
        raise ValidationError('許可されていないファイル形式です')
    
    if file.size > max_size:
        raise ValidationError('ファイルサイズが大きすぎます')
```

**作業内容:**
- [ ] 入力検証ロジックの強化
- [ ] ファイルアップロードのセキュリティチェック追加
- [ ] サニタイゼーション処理の実装
- [ ] セキュリティテストの追加

### 2. パフォーマンス問題

#### 2.1 N+1クエリ問題の解決
**対象箇所:**
- `/api/conf/user/utils.py` (行28-39): ループ内でのDB呼び出し
- フレンド関係取得時の効率性問題
- MatchDetail取得処理

**現在の問題:**
- ループ内での個別DB呼び出し
- 不要なクエリの実行
- レスポンス時間の増大

**改善案:**
```python
# select_related/prefetch_relatedの使用
match_details = MatchDetail.objects.filter(
    user_id=user.id
).select_related('match')

# バルク処理での最適化
user_matches = Match.objects.filter(
    participants__in=[user_id]
).prefetch_related('participants')
```

**作業内容:**
- [ ] N+1クエリの特定と分析
- [ ] select_related/prefetch_relatedの適用
- [ ] クエリパフォーマンステストの追加
- [ ] Django Debug Toolbarでの検証

#### 2.2 不要なデータ取得の最適化
**対象箇所:**
- `/api/conf/user/serializers.py` (行15): `fields = '__all__'` の使用
- 必要以上の情報を含むレスポンス

**現在の問題:**
- 不要なフィールドの取得・送信
- ネットワーク帯域の無駄使用
- レスポンスサイズの増大

**改善案:**
```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar']  # 必要なフィールドのみ
```

**作業内容:**
- [ ] シリアライザーのフィールド指定を明示的に
- [ ] APIレスポンスサイズの最適化
- [ ] 不要な関連データ取得の削除

## 🟡 中優先度（アーキテクチャ）

### 3. 責任の分離

#### 3.1 サービス層の導入
**対象箇所:**
- `/api/conf/user/views.py`: ビューにビジネスロジックが混在
- `/api/conf/user/serializers.py` (行96-104): ファイル保存ロジックがシリアライザーに混在

**現在の問題:**
- ビューに複雑なビジネスロジックが含まれている
- 責任の分離ができていない
- テストが困難

**改善案:**
```python
# サービス層の導入
class UserService:
    @staticmethod
    def handle_user_deletion(user, requesting_user):
        # ビジネスロジックをここに集約
        if user.deleted_at is not None:
            raise User.DoesNotExist
        
        user.deleted_at = timezone.now()
        user.save()
        return user

    @staticmethod
    def create_user_response(user):
        # レスポンス作成ロジックを分離
        pass
```

**作業内容:**
- [ ] UserServiceクラスの作成
- [ ] ビューからビジネスロジックの分離
- [ ] シリアライザーの責任範囲の明確化
- [ ] サービス層のテスト追加

#### 3.2 長すぎる関数の分割
**対象箇所:**
- `/api/conf/user/views.py` UserView.delete() (行53-99): 47行の長い関数
- `/api/conf/user/utils.py` create_response() (行27-61): 複雑なデータ組み立てロジック

**現在の問題:**
- Single Responsibility Principleに違反
- 可読性とメンテナンス性の低下
- テストの困難さ

**改善案:**
```python
def delete(self, request, pk=None):
    user = self._validate_user_deletion(pk, request.user)
    self._perform_user_deletion(user)
    return self._create_deletion_response(user)

def _validate_user_deletion(self, pk, requesting_user):
    # バリデーションロジック
    pass

def _perform_user_deletion(self, user):
    # 削除処理ロジック
    pass

def _create_deletion_response(self, user):
    # レスポンス作成ロジック
    pass
```

**作業内容:**
- [ ] 長い関数を小さな関数に分割
- [ ] 各関数の責任を明確に定義
- [ ] プライベートメソッドの適切な使用
- [ ] 単体テストの追加

### 4. エラーハンドリングの統一

#### 4.1 カスタム例外クラスの作成
**対象箇所:**
- `/api/conf/user/views.py` (行94-98): 汎用的すぎるエラーハンドリング
- プロジェクト全体のエラーハンドリング

**現在の問題:**
- エラーレスポンス形式の不統一
- エラー情報の不足
- デバッグの困難さ

**改善案:**
```python
# カスタム例外クラス
class UserNotFoundError(Exception):
    pass

class UserDeletionError(Exception):
    pass

class ValidationError(Exception):
    def __init__(self, message, field=None):
        self.message = message
        self.field = field
```

**作業内容:**
- [ ] カスタム例外クラスの作成
- [ ] 統一されたエラーレスポンス形式の定義
- [ ] エラーハンドリングミドルウェアの実装
- [ ] ログ出力の標準化

#### 4.2 JavaScript側のエラーハンドリング統一
**対象箇所:**
- JavaScript各ページコンポーネント
- API呼び出し処理

**現在の問題:**
- エラーハンドリングパターンの不統一
- ユーザビリティの低下
- エラー情報の表示方法が統一されていない

**改善案:**
```javascript
// 統一されたエラーハンドリング
class ApiError extends Error {
    constructor(message, status, field = null) {
        super(message);
        this.status = status;
        this.field = field;
    }
}

// 共通のエラーハンドリング関数
function handleApiError(error) {
    if (error instanceof ApiError) {
        showErrorMessage(error.message, error.field);
    } else {
        showErrorMessage('予期しないエラーが発生しました');
    }
}
```

**作業内容:**
- [ ] エラーハンドリングの統一パターン作成
- [ ] 共通エラー処理関数の実装
- [ ] ユーザーフレンドリーなエラーメッセージの作成
- [ ] エラー状態の適切な表示

## 🟢 低優先度（コード品質）

### 5. 重複コード除去

#### 5.1 共通ユーザー検証ロジック
**対象箇所:**
- `/api/conf/user/views.py` (行77-81): 削除済みユーザーチェックが重複
- `/api/conf/user/utils.py` (行8-14, 31-39): ゲーム記録取得ロジックが冗長

**改善案:**
```python
# 共通のユーザー検証ヘルパー関数
def validate_active_user(user):
    if user.deleted_at is not None:
        raise User.DoesNotExist
    return user

def get_user_or_404(user_id):
    try:
        user = User.objects.get(id=user_id)
        return validate_active_user(user)
    except User.DoesNotExist:
        raise Http404("ユーザーが見つかりません")
```

**作業内容:**
- [ ] 共通ユーティリティ関数の作成
- [ ] 重複コードの除去
- [ ] 統一されたユーザー検証ロジックの適用

#### 5.2 JavaScript共通コンポーネント
**対象箇所:**
- JavaScript各ページコンポーネント
- フォーム処理とエラーハンドリングパターンの重複

**改善案:**
```javascript
// 再利用可能なフォームコンポーネント
class BaseForm {
    constructor(formElement) {
        this.form = formElement;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        // 共通のフォーム処理ロジック
    }
}
```

**作業内容:**
- [ ] 基底フォームクラスの作成
- [ ] 共通UIコンポーネントの抽出
- [ ] 重複するイベントハンドリングの統一

### 6. 命名・ドキュメント

#### 6.1 命名規則の統一
**対象箇所:**
- `/api/conf/user/models.py` (行59): `ft_authenticate` - 一貫しない命名
- `/api/conf/user/utils.py` (行16): `access_id` - 意味が不明確

**改善案:**
- 統一された命名規則の策定
- より説明的な変数名・関数名の使用
- プロジェクト全体での命名規則の適用

**作業内容:**
- [ ] 命名規則ガイドラインの作成
- [ ] 既存コードの命名見直し
- [ ] Lintルールでの命名規則強制

#### 6.2 ドキュメントの充実
**対象箇所:**
- APIエンドポイントのドキュメント
- コード内コメント
- 設計ドキュメント

**改善案:**
- OpenAPIドキュメントの充実
- 重要な処理にコメント追加
- アーキテクチャドキュメントの作成

**作業内容:**
- [ ] OpenAPIスキーマの詳細化
- [ ] コードコメントの追加
- [ ] README.mdの改善
- [ ] 開発者向けドキュメント作成

## 実装スケジュール

### フェーズ1（1-2週間）：セキュリティ対応
1. ハードコードされた設定値の環境変数化
2. JWT有効期限の見直し
3. 入力検証の強化

### フェーズ2（2-3週間）：パフォーマンス改善
1. N+1クエリ問題の解決
2. 不要なデータ取得の最適化
3. パフォーマンステストの追加

### フェーズ3（3-4週間）：アーキテクチャ改善
1. サービス層の導入
2. エラーハンドリングの統一
3. 長い関数の分割

### フェーズ4（2-3週間）：コード品質向上
1. 重複コード除去
2. 命名規則の統一
3. ドキュメント充実

## 注意事項

1. **テスト**: 各リファクタリング後は必ず既存機能のテストを実行
2. **段階的実装**: 一度に大きな変更を行わず、小さな単位で実装
3. **コードレビュー**: すべての変更についてピアレビューを実施
4. **バックアップ**: 重要な変更前は必ずブランチを作成
5. **パフォーマンス測定**: 改善前後のパフォーマンス測定を実施

## 成功指標

- セキュリティ脆弱性の数: 0件
- ページ読み込み時間: 50%短縮
- コードカバレッジ: 80%以上
- Lint警告数: 0件
- 技術的負債の削減: 70%減