# TailscaleのDNS設定問題解決タスク

## 実装したタスク

### ✅ 1. 問題調査と原因特定
- **実施内容**: TailscaleのDNS設定がDockerに与える影響を調査
- **発見事項**:
  - Docker buildプロセスでAlpine Linux APKとNPMが接続失敗
  - TailscaleがシステムDNS設定を書き換えることが原因
  - Docker ComposeのサービスレベルDNS設定はbuild時に無効

### ✅ 2. Docker Compose設定の修正

#### 2.1 `docker-compose.yml`の修正
```yaml
# 修正前
static-builder:
  build:
    context: .
    dockerfile: static-builder/Dockerfile
    target: build

# 修正後
static-builder:
  build:
    context: .
    dockerfile: static-builder/Dockerfile
    target: build
    network: host  # 追加
```

#### 2.2 `docker-compose.local.yml`の修正
```yaml
# 修正前
static-builder:
  build:
    context: .
    dockerfile: static-builder/Dockerfile
    target: development

# 修正後
static-builder:
  build:
    context: .
    dockerfile: static-builder/Dockerfile
    target: development
    network: host  # 追加
```

#### 2.3 APIサービスにも同様の設定を追加
- `docker-compose.yml`のapiサービス
- `docker-compose.local.yml`のapiサービス

### ✅ 3. DNS設定の最適化

#### 3.1 サービス実行時のDNS設定維持
すべてのサービスに以下のDNS設定を保持:
```yaml
dns:
  - 8.8.8.8
  - 8.8.4.4
```

#### 3.2 Dockerfileの修正
- `static-builder/Dockerfile`: 不要な回避策コードを削除し、元のパッケージインストールに戻す
- `api/Dockerfile`: 不要な回避策コードを削除

### ✅ 4. テストと動作確認

#### 4.1 設定検証
```bash
# Docker Compose設定の検証
docker compose config

# 両方のファイルの検証
docker compose -f docker-compose.local.yml config
```

#### 4.2 ビルドテスト
```bash
# 完全ビルドテスト
docker compose --env-file ./.env.sample -f ./docker-compose.yml build
```

**結果**: 
- Alpine LinuxのAPKパッケージインストール成功
- NPMパッケージのダウンロード成功
- 全サービスのビルド完了

## 変更ファイル一覧

### 修正されたファイル
1. `/docker-compose.yml`
   - static-builderサービスにbuild.network: host追加
   - apiサービスにbuild.network: host追加

2. `/docker-compose.local.yml`
   - static-builderサービスにbuild.network: host追加
   - apiサービスにbuild.network: host追加

3. `/static-builder/Dockerfile`
   - 不要な回避策コードを削除
   - 元のパッケージインストールコマンドに復元

4. `/api/Dockerfile`
   - 不要な回避策コードを削除

### 追加されたファイル
1. `/.tmp/design.md` - 設計ドキュメント
2. `/.tmp/task.md` - このタスクドキュメント

## 効果

### 解決された問題
- ✅ Docker build時のDNS解決エラーが解消
- ✅ TailscaleのDNS設定を手動で変更する必要がなくなった
- ✅ 自動化されたビルドプロセスが実現

### 維持された機能
- ✅ Tailscaleの機能は完全に保持
- ✅ サービス実行時のDNS設定は維持
- ✅ 既存のネットワーク構成は変更なし

## 今後の注意点

1. **新しいサービス追加時**: build設定に`network: host`を追加することを推奨
2. **本番環境**: この設定が本番環境でも適用されることを確認
3. **セキュリティ**: build時のhost network使用によるセキュリティ影響を定期的に評価