#!/bin/bash

# 署名証明書を生成するシェルスクリプト

source ../../.env

mkdir -p ../ssl

# 鍵ペアを生成
openssl genpkey -algorithm RSA -out ../ssl/inception.key

# 証明書署名要求を生成
openssl req -new -key ../ssl/inception.key -out ../ssl/inception.csr \
	-subj "/C=${CSR_COUNTRY}/ST=${CSR_STATE}/L=${CSR_LOCALITY}/O=${CSR_ORGANIZATION}/OU=${CSR_ORGANIZATIONAL_UNIT}/CN=${CSR_COMMON_NAME}"

# 証明書を署名
openssl x509 -req -days 365 -in ../ssl/inception.csr -signkey ../ssl/inception.key -out ../ssl/inception.crt
