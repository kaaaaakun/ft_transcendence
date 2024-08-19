##############
# base stage #
##############
# 軽そうなbaseイメージを選択(https://hub.docker.com/_/python)
FROM python:3.9-slim AS base

# インストールするソフトのバージョン指定
ENV PSYCOPG_VERSION 3.1.8
ENV DJANGO_VERSION 4.2

# 環境変数の設定
## Djangoのsuperuser作成時のデフォルト値(https://kamatimaru.hatenablog.com/entry/2021/02/28/030646)
ENV DJANGO_SUPERUSER_USERNAME admin
ENV DJANGO_SUPERUSER_EMAIL admin@example.com
ENV DJANGO_SUPERUSER_PASSWORD pass

RUN apt-get update
# 必要なソフト(bainary)をインストール
## gcc: psycopgのインストールに必要
## libpq-dev: psycopgの動作に必要
RUN apt-get -y install \
    gcc \
    libpq-dev

# install for Debug
RUN apt-get -y install \
    vim \
    curl \
    lsof \
    tree
## clean up to reduce the size of the image
RUN rm -rf /var/lib/apt/lists/*

# Djangoとpsycopg(postgreSQL操作に必要)のインストール
## https://docs.djangoproject.com/ja/5.0/ref/databases/#postgresql-notes
## https://docs.djangoproject.com/ja/5.0/faq/install/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir psycopg==${PSYCOPG_VERSION}
RUN pip install --no-cache-dir Django==${DJANGO_VERSION}
RUN pip install --no-cache-dir djangorestframework


##################################
# development_djangoserver stage #
##################################
FROM base AS development_djangoserver
# Create a Django project
RUN django-admin startproject trans
WORKDIR /trans

# Create Django apps
RUN python manage.py startapp usr
RUN python manage.py startapp tmt
RUN python manage.py startapp mtch
RUN python manage.py startapp gply

# manage.pyのDATABASES設定を変更
COPY tool/update_db_section.py .
RUN chmod +x update_db_section.py
RUN python update_db_section.py
RUN rm update_db_section.py

# appsのファイルをコピー

# appsで定めたモデルをDBに反映する準備
RUN python manage.py makemigrations

# コンテナ起動後に利用するファイルをコピー
COPY tool/entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT [ "/trans/entrypoint.sh" ]
CMD ["sleep", "infinity"]

##########################
# development_asgi stage #
##########################
FROM base AS development_asgi


###############
# build stage #
###############
FROM base AS build
