#!/bin/bash

# ブロックチェーン用SSH鍵生成スクリプト
# Generate SSH keys for blockchain environment

set -e

# 設定
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSH_DIR="$(dirname "$SCRIPT_DIR")"
KEYS_DIR="$SSH_DIR/keys"
PROJECT_NAME="ft_transcendence"

# 色付きの出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 使用方法
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Generate SSH keys for blockchain environment"
    echo ""
    echo "Options:"
    echo "  -e, --env <env>     Environment (dev|staging|prod) [default: dev]"
    echo "  -f, --force         Force overwrite existing keys"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e dev           # Generate keys for development"
    echo "  $0 -e prod -f       # Force generate keys for production"
}

# パラメータのデフォルト値
ENV="dev"
FORCE=false

# パラメータの解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENV="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# 環境の検証
if [[ ! "$ENV" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Invalid environment: $ENV. Must be one of: dev, staging, prod"
    exit 1
fi

# 必要なディレクトリの作成
mkdir -p "$KEYS_DIR"

# 鍵ファイルのパス
PRIVATE_KEY="$KEYS_DIR/blockchain_${ENV}_rsa"
PUBLIC_KEY="$KEYS_DIR/blockchain_${ENV}_rsa.pub"

# 既存の鍵の確認
if [[ -f "$PRIVATE_KEY" && "$FORCE" != true ]]; then
    log_warn "SSH key already exists: $PRIVATE_KEY"
    log_warn "Use --force to overwrite"
    exit 0
fi

# 鍵の生成
log_info "Generating SSH key for environment: $ENV"
log_info "Private key: $PRIVATE_KEY"
log_info "Public key: $PUBLIC_KEY"

# SSH鍵の生成（RSA 4096bit）
ssh-keygen -t rsa -b 4096 -f "$PRIVATE_KEY" -N "" -C "${PROJECT_NAME}_blockchain_${ENV}@$(hostname)"

# 権限の設定
chmod 600 "$PRIVATE_KEY"
chmod 644 "$PUBLIC_KEY"

# 成功メッセージ
log_info "SSH keys generated successfully!"
log_info "Private key: $PRIVATE_KEY"
log_info "Public key: $PUBLIC_KEY"
log_info ""
log_info "Next steps:"
log_info "1. Copy the public key to your blockchain server:"
log_info "   cat \"$PUBLIC_KEY\""
log_info "2. Add the public key to ~/.ssh/authorized_keys on the remote server"
log_info "3. Run the SSH config generation script:"
log_info "   $SSH_DIR/scripts/generate-ssh-config.sh -e $ENV"

# 公開鍵の内容を表示
log_info ""
log_info "Public key content:"
echo "----------------------------------------"
cat "$PUBLIC_KEY"
echo "----------------------------------------"