#!/bin/bash

# 自動デプロイスクリプト
# 10分間隔でmainブランチの変更をチェックし、deployブランチをrebaseして再デプロイ

# 設定
REPO_DIR="/home/tokazaki/Desktop/ft_transcendence"
LOG_FILE="/tmp/auto-deploy.log"
MAX_LOG_SIZE=10485760  # 10MB

# ログローテーション関数
rotate_log() {
    if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE") -gt $MAX_LOG_SIZE ]; then
        mv "$LOG_FILE" "$LOG_FILE.old"
        touch "$LOG_FILE"
    fi
}

# ログ出力関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# エラー時の処理
handle_error() {
    log "ERROR: $1"
    # deployブランチに戻る
    git checkout deploy 2>/dev/null
    exit 1
}

# メイン処理開始
main() {
    log "=== Auto Deploy Script Started ==="
    
    # ログローテーション
    rotate_log
    
    # リポジトリディレクトリに移動
    cd "$REPO_DIR" || handle_error "Failed to change to repository directory: $REPO_DIR"
    
    # 現在のブランチを保存
    current_branch=$(git branch --show-current)
    log "Current branch: $current_branch"
    
    # 1. mainブランチをpull
    log "Checking main branch for updates..."
    git checkout main || handle_error "Failed to checkout main branch"
    
    # mainブランチの更新前のコミットハッシュを取得
    before_main=$(git rev-parse HEAD)
    log "Main branch hash before pull: $before_main"
    
    # リモートからpull
    git pull origin main || handle_error "Failed to pull main branch"
    
    # mainブランチの更新後のコミットハッシュを取得
    after_main=$(git rev-parse HEAD)
    log "Main branch hash after pull: $after_main"
    
    # 2. deployブランチに移動
    log "Switching to deploy branch..."
    git checkout deploy || handle_error "Failed to checkout deploy branch"
    
    # deployブランチのrebase前のコミットハッシュを取得
    before_deploy=$(git rev-parse HEAD)
    log "Deploy branch hash before rebase: $before_deploy"
    
    # 3. mainからrebase
    log "Rebasing deploy branch with main..."
    if ! git rebase main; then
        log "Rebase conflict detected. Manual intervention required."
        log "Aborting rebase..."
        git rebase --abort
        handle_error "Rebase failed due to conflicts"
    fi
    
    # deployブランチのrebase後のコミットハッシュを取得
    after_deploy=$(git rev-parse HEAD)
    log "Deploy branch hash after rebase: $after_deploy"
    
    # 4. 変更があったかチェック
    if [ "$before_deploy" != "$after_deploy" ]; then
        log "Changes detected. Starting deployment..."
        log "Executing 'make re'..."
        
        # make reを実行
        if make re; then
            log "Deployment completed successfully"
            log "=== Auto Deploy Script Finished Successfully ==="
        else
            handle_error "Deployment failed during 'make re'"
        fi
    else
        log "No changes detected. Skipping deployment."
        log "=== Auto Deploy Script Finished (No Changes) ==="
    fi
}

# スクリプト実行
main "$@"