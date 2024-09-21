#!/bin/bash

# 署名証明書を生成するシェルスクリプト

# 環境変数をロード
source ../../.env

# 出力ディレクトリ
SSL_DIR="../ssl"
KEY_FILE="$SSL_DIR/ft_transcendence.key"
CSR_FILE="$SSL_DIR/ft_transcendence.csr"
CRT_FILE="$SSL_DIR/ft_transcendence.crt"

# SSL ディレクトリが存在しない場合は作成
mkdir -p "$SSL_DIR"

# 鍵ペアを生成 (RSA アルゴリズム)
openssl genpkey -algorithm RSA -out "$KEY_FILE"

# 証明書署名要求 (CSR) を生成
openssl req -new -key "$KEY_FILE" -out "$CSR_FILE" \
  -subj "/C=${CSR_COUNTRY}/ST=${CSR_STATE}/L=${CSR_LOCALITY}/O=${CSR_ORGANIZATION}/OU=${CSR_ORGANIZATIONAL_UNIT}/CN=${CSR_COMMON_NAME}"

# CSR を使用して自己署名証明書を生成 (有効期限365日)
openssl x509 -req -days 365 -in "$CSR_FILE" -signkey "$KEY_FILE" -out "$CRT_FILE"
