#!/bin/sh

set -e  # エラーが発生したらスクリプトを停止する

echo "Running migrations..."
python ${DJANGO_PROJECT_DIR}manage.py migrate

echo "Create test data..."
python ${DJANGO_PROJECT_DIR}manage.py loaddata ${DJANGO_PROJECT_DIR}fixtures/initial_data.json

echo "Creating superuser if not exists..."
python ${DJANGO_PROJECT_DIR}manage.py createsuperuser --noinput || true

echo "Checking Django settings..."
python ${DJANGO_PROJECT_DIR}manage.py check || exit 1

echo "Starting application..."
exec "$@"
