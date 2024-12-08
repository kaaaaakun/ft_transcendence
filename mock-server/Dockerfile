# ベースイメージとしてNode.js 18を使用
FROM node:18

# 作業ディレクトリを設定
WORKDIR /app

# 必要なグローバルパッケージをインストール
RUN npm install -g @asyncapi/generator@1.9.0 @asyncapi/cli@1.9.0

# asyncapi.yaml ファイルだけをコピー
COPY asyncapi.yaml /app/asyncapi.yaml

# AsyncAPI Generator コマンドを実行
RUN npx ag /app/asyncapi.yaml @asyncapi/nodejs-ws-template -o /async-server -p server=localhost

# 出力結果をホストにコピーするためにエントリポイントを変更
CMD ["tar", "-czvf", "/async-server.tar.gz", "-C", "/async-server", "."]
