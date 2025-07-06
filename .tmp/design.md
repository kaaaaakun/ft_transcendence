# ブロックチェーン用SSH設定自動生成機能の設計

## 概要

Makefileにブロックチェーン関連のSSH設定を自動生成する機能を追加する。これにより、ブロックチェーン開発環境でのSSH接続やデプロイ時の認証を自動化できる。

## 現在の状況分析

### 既存のファイル構造
- `Makefile`: SSL証明書の自動生成機能（cert target）を持つ
- `blockchain/deploy/`: Hardhat環境のブロックチェーン関連ファイル
- `blockchain/deploy/hardhat.config.js`: Sepolia ネットワーク設定
- `blockchain/deploy/package.json`: Hardhat toolbox、dotenv等の依存関係

### 課題
- ブロックチェーンサーバーへのSSH接続設定が手動
- デプロイ時の認証設定が環境毎に異なる
- SSH鍵の生成・配置が手動

## 機能要件

### 1. SSH鍵の自動生成
- RSA 4096bit鍵の生成
- 鍵の安全な格納場所（.ssh/blockchain/）
- 環境別鍵の管理（dev, staging, prod）

### 2. SSH設定ファイルの自動生成
- `~/.ssh/config`への設定追加
- Host別の設定管理
- 鍵ファイルパスの自動設定

### 3. ブロックチェーン環境別設定
- Sepolia testnet用設定
- Mainnet用設定
- Local hardhat network用設定

### 4. セキュリティ要件
- 秘密鍵の適切な権限設定（600）
- 公開鍵の配布支援
- 設定ファイルのバックアップ

## 技術設計

### Makefileターゲット設計
```makefile
# SSH関連のターゲット
ssh-setup: ssh-keygen ssh-config
ssh-keygen: # SSH鍵の生成
ssh-config: # SSH設定ファイルの生成
ssh-clean: # SSH設定のクリーンアップ
```

### ディレクトリ構造
```
blockchain/
├── ssh/
│   ├── keys/           # SSH鍵格納
│   ├── config/         # SSH設定テンプレート
│   └── scripts/        # SSH設定スクリプト
└── deploy/
    ├── hardhat.config.js
    └── package.json
```

### 環境変数管理
- `.env.blockchain`: ブロックチェーン専用環境変数
- SSH関連の設定項目
  - `BLOCKCHAIN_SSH_HOST`
  - `BLOCKCHAIN_SSH_USER`
  - `BLOCKCHAIN_SSH_PORT`

## セキュリティ考慮事項

1. **鍵の管理**: 秘密鍵は決してリポジトリにコミットしない
2. **権限設定**: 生成される鍵ファイルは適切な権限（600）を設定
3. **設定の分離**: 本番環境と開発環境の設定を分離
4. **バックアップ**: 重要な設定のバックアップ機能

## 実装優先度

1. **High**: 基本的なSSH鍵生成機能
2. **High**: SSH設定ファイルの自動生成
3. **Medium**: 環境別設定の管理
4. **Low**: 高度なセキュリティ機能（鍵ローテーション等）