#!/bin/bash

# ELK Stack用SSL証明書生成スクリプト
# 各コンテナ間の内部通信用にSSL証明書を作成

# 環境変数をロード
source ../../.env

# 出力ディレクトリ
SSL_DIR="."
mkdir -p "$SSL_DIR"

# CA証明書の作成
echo "Creating CA certificate..."
openssl genrsa -out "$SSL_DIR/ca.key" 2048
openssl req -new -x509 -days 365 -key "$SSL_DIR/ca.key" -out "$SSL_DIR/ca.crt" \
  -subj "/C=${CSR_COUNTRY}/ST=${CSR_STATE}/L=${CSR_LOCALITY}/O=${CSR_ORGANIZATION}/OU=${CSR_ORGANIZATIONAL_UNIT}/CN=ELK-Stack-CA"

# Elasticsearch用証明書の作成
echo "Creating Elasticsearch certificate..."
openssl genrsa -out "$SSL_DIR/elasticsearch.key" 2048
openssl req -new -key "$SSL_DIR/elasticsearch.key" -out "$SSL_DIR/elasticsearch.csr" \
  -subj "/C=${CSR_COUNTRY}/ST=${CSR_STATE}/L=${CSR_LOCALITY}/O=${CSR_ORGANIZATION}/OU=${CSR_ORGANIZATIONAL_UNIT}/CN=elasticsearch"

# SAN（Subject Alternative Name）設定ファイルの作成
cat > "$SSL_DIR/elasticsearch_san.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = elasticsearch
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

openssl x509 -req -days 365 -in "$SSL_DIR/elasticsearch.csr" -CA "$SSL_DIR/ca.crt" -CAkey "$SSL_DIR/ca.key" -CAcreateserial -out "$SSL_DIR/elasticsearch.crt" -extensions v3_req -extfile "$SSL_DIR/elasticsearch_san.ext"

# Kibana用証明書の作成
echo "Creating Kibana certificate..."
openssl genrsa -out "$SSL_DIR/kibana.key" 2048
openssl req -new -key "$SSL_DIR/kibana.key" -out "$SSL_DIR/kibana.csr" \
  -subj "/C=${CSR_COUNTRY}/ST=${CSR_STATE}/L=${CSR_LOCALITY}/O=${CSR_ORGANIZATION}/OU=${CSR_ORGANIZATIONAL_UNIT}/CN=kibana"

cat > "$SSL_DIR/kibana_san.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = kibana
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

openssl x509 -req -days 365 -in "$SSL_DIR/kibana.csr" -CA "$SSL_DIR/ca.crt" -CAkey "$SSL_DIR/ca.key" -CAcreateserial -out "$SSL_DIR/kibana.crt" -extensions v3_req -extfile "$SSL_DIR/kibana_san.ext"

# Logstash用証明書の作成
echo "Creating Logstash certificate..."
openssl genrsa -out "$SSL_DIR/logstash.key" 2048
openssl req -new -key "$SSL_DIR/logstash.key" -out "$SSL_DIR/logstash.csr" \
  -subj "/C=${CSR_COUNTRY}/ST=${CSR_STATE}/L=${CSR_LOCALITY}/O=${CSR_ORGANIZATION}/OU=${CSR_ORGANIZATIONAL_UNIT}/CN=logstash"

cat > "$SSL_DIR/logstash_san.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = logstash
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

openssl x509 -req -days 365 -in "$SSL_DIR/logstash.csr" -CA "$SSL_DIR/ca.crt" -CAkey "$SSL_DIR/ca.key" -CAcreateserial -out "$SSL_DIR/logstash.crt" -extensions v3_req -extfile "$SSL_DIR/logstash_san.ext"

# 一時ファイルの削除
rm -f "$SSL_DIR"/*.csr "$SSL_DIR"/*.ext "$SSL_DIR"/*.srl

# 権限設定
chmod 600 "$SSL_DIR"/*.key
chmod 644 "$SSL_DIR"/*.crt

echo "SSL certificates created successfully!"
echo "Files created:"
echo "- CA: ca.crt, ca.key"
echo "- Elasticsearch: elasticsearch.crt, elasticsearch.key"
echo "- Kibana: kibana.crt, kibana.key"  
echo "- Logstash: logstash.crt, logstash.key"