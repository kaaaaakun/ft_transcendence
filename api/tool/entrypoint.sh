#!/bin/sh

# マイグレーション(modelのDBへの反映)を実行
python manage.py migrate

# 管理者ユーザーを作成。admin/にアクセスするとDBがみやすい。
python manage.py createsuperuser --noinput || true

# DockerfileでCMDに指定されたコマンドを実行する
exec "$@"
