#!/bin/bash

# Elasticsearch用のPKCS#12キーストアを作成するスクリプト
# 生成されたPEMファイルからキーストアを作成

SSL_DIR="../ssl"
CERT_DIR="certs"

# 証明書ディレクトリを作成
mkdir -p "$CERT_DIR"

# ElasticsearchのPKCS#12キーストアを作成
echo "Creating Elasticsearch keystore..."
openssl pkcs12 -export -out "$CERT_DIR/elasticsearch.p12" \
  -inkey "$SSL_DIR/elasticsearch.key" \
  -in "$SSL_DIR/elasticsearch.crt" \
  -certfile "$SSL_DIR/ca.crt" \
  -password pass:elastic

# 権限設定
chmod 600 "$CERT_DIR"/*.p12

echo "Keystore created successfully: $CERT_DIR/elasticsearch.p12"