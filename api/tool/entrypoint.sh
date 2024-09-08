#!/bin/sh

# マイグレーション(modelのDBへの反映)を実行
python ${DJANGO_PROJECT_DIR}manage.py migrate

# 管理者ユーザーを作成。admin/にアクセスするとDBがみやすい。
python ${DJANGO_PROJECT_DIR}manage.py createsuperuser --noinput || true

# DockerfileでCMDに指定されたコマンドを実行する
exec "$@"
