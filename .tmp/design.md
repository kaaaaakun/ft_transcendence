# TailscaleのDNS設定問題解決

## 問題の概要

TailscaleをインストールしたLinux環境でDockerコンテナを使用する際、DNS解決で問題が発生していました。

### 発生していた問題
1. **Docker build時のDNS解決失敗**
   - Alpine LinuxのAPKパッケージマネージャーが`dl-cdn.alpinelinux.org`に接続できない
   - NPMパッケージマネージャーが`registry.npmjs.org`に接続できない
   - エラーメッセージ: `temporary error (try again later)`

2. **根本原因**
   - TailscaleがシステムのDNS設定（`/etc/resolv.conf`）を書き換える
   - Docker buildプロセスがTailscaleのDNS設定の影響を受ける
   - Docker Composeのサービスレベルの`dns:`設定はbuild時には適用されない

## 設計方針

### 目標
1. **手動操作の排除**: `tailscale set --accept-dns=false`のような手動操作を不要にする
2. **自動化された解決**: Docker ComposeでTailscaleとDockerが共存できる設定を実現
3. **既存機能の維持**: Tailscaleの機能を損なわずにDNS問題を解決

### 解決策の設計
1. **Docker Compose build設定の強化**
   - `network: host`設定をbuild時に適用
   - ホストネットワークを使用してTailscaleのDNS制限を回避

2. **2段階のDNS設定**
   - Build時: `network: host`でホストのDNS設定を使用
   - Runtime時: `dns:`設定でGoogle DNSを明示的に指定

## 実装対象ファイル

### 修正対象
- `docker-compose.yml`
- `docker-compose.local.yml`
- `static-builder/Dockerfile`
- `api/Dockerfile`

### 設定内容
- 各サービスのbuild設定に`network: host`を追加
- サービス実行時用のDNS設定（8.8.8.8, 8.8.4.4）を維持
- Dockerfileの不要な回避策を削除して元の構成に戻す