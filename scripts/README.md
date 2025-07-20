# 自動デプロイシステム

## 概要

mainブランチの変更を10分間隔で検知し、deployブランチを自動的にrebaseして再デプロイするシステムです。

## ファイル構成

- `auto-deploy.sh`: 自動デプロイスクリプト本体
- `README.md`: このドキュメント

## セットアップ手順

### 1. スクリプトの確認

スクリプトが実行可能になっているか確認：

```bash
ls -la scripts/auto-deploy.sh
```

実行権限がない場合は以下で付与：

```bash
chmod +x scripts/auto-deploy.sh
```

### 2. 手動テスト実行

cronに登録する前に、手動でスクリプトの動作を確認：

```bash
./scripts/auto-deploy.sh
```

ログファイルの確認：

```bash
tail -f /tmp/auto-deploy.log
```

### 3. cronジョブの設定

crontabを編集：

```bash
crontab -e
```

以下の行を追加（10分間隔で実行）：

```bash
*/10 * * * * /home/tokazaki/Desktop/ft_transcendence/scripts/auto-deploy.sh
```

### 4. cronジョブの確認

設定されたcronジョブを確認：

```bash
crontab -l
```

cronサービスの状態確認：

```bash
sudo systemctl status cron
```

## 動作フロー

1. **mainブランチのpull**: リモートから最新のmainブランチを取得
2. **deployブランチに移動**: 作業ブランチをdeployに切り替え
3. **rebase実行**: mainブランチの変更をdeployブランチに適用
4. **変更検知**: rebase前後でコミットハッシュを比較
5. **デプロイ実行**: 変更があった場合のみ`make re`を実行

## ログ機能

- **ログファイル**: `/tmp/auto-deploy.log`
- **ログローテーション**: 10MBを超えると`.old`ファイルに移動
- **ログ形式**: `[YYYY-MM-DD HH:MM:SS] メッセージ`

### ログの確認方法

リアルタイムでログを監視：

```bash
tail -f /tmp/auto-deploy.log
```

最新のログを確認：

```bash
cat /tmp/auto-deploy.log
```

## エラーハンドリング

### rebaseコンフリクト時

- 自動的にrebaseを中止
- deployブランチに戻る
- エラーログを出力
- 手動での解決が必要

### make re失敗時

- エラーログを出力
- deployブランチに戻る
- 次回の実行時に再試行

## トラブルシューティング

### スクリプトが実行されない

1. cronサービスの確認：
   ```bash
   sudo systemctl status cron
   ```

2. crontabの確認：
   ```bash
   crontab -l
   ```

3. スクリプトの実行権限確認：
   ```bash
   ls -la scripts/auto-deploy.sh
   ```

### rebaseコンフリクトが発生した場合

1. 手動でコンフリクトを解決：
   ```bash
   git checkout deploy
   git rebase main
   # コンフリクト解決後
   git rebase --continue
   ```

2. 解決後、次回から自動実行が再開されます

### ログが出力されない場合

1. ログディレクトリの権限確認：
   ```bash
   ls -la /tmp/
   ```

2. 手動実行でエラーチェック：
   ```bash
   ./scripts/auto-deploy.sh
   ```

## 設定のカスタマイズ

スクリプト内の以下の変数で設定を変更可能：

- `REPO_DIR`: リポジトリのパス
- `LOG_FILE`: ログファイルのパス
- `MAX_LOG_SIZE`: ログローテーションのサイズ閾値

## 停止方法

cronジョブを停止する場合：

```bash
crontab -e
```

該当行をコメントアウトまたは削除：

```bash
# */10 * * * * /home/tokazaki/Desktop/ft_transcendence/scripts/auto-deploy.sh
```