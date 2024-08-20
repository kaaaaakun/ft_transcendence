##############
# base stage #
##############
# 軽そうなbaseイメージを選択(https://hub.docker.com/_/python)
FROM python:3.9-slim AS base

# ビルド時のみ利用する変数
## version of installed packages
ARG PSYCOPG_VERSION=3.1.8
ARG DJANGO_VERSION=4.2
## misc


# コンテナ起動後にも利用する環境変数
## Djangoのsuperuser作成時のデフォルト値(https://kamatimaru.hatenablog.com/entry/2021/02/28/030646)
ENV DJANGO_PROJECT_NAME trans
ENV DJANGO_PROJECT_DIR /${DJANGO_PROJECT_NAME}/
RUN export SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())') && \
    echo "SECRET_KEY=${SECRET_KEY}" >> /etc/environment
ENV SECRET_KEY=$SECRET_KEY

# 必要なソフト(bainary)をインストール
RUN apt-get update
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

# Create a Django project
RUN django-admin startproject ${DJANGO_PROJECT_NAME}

# Create Django apps
WORKDIR ${DJANGO_PROJECT_DIR}
RUN python manage.py startapp plyr
RUN python manage.py startapp tmt
RUN python manage.py startapp mtch

# project, appsのファイルをコピー
COPY conf/project/* ${DJANGO_PROJECT_DIR}${DJANGO_PROJECT_NAME}/
COPY conf/app_plyr/* ${DJANGO_PROJECT_DIR}plyr/
COPY conf/app_tmt/* ${DJANGO_PROJECT_DIR}tmt/
COPY conf/app_mtch/* ${DJANGO_PROJECT_DIR}mtch/

# appsで定めたモデルをDBに反映する準備
RUN python ${DJANGO_PROJECT_DIR}manage.py makemigrations

# コンテナ起動後に利用するファイルをコピー
COPY tool/entrypoint.sh ${DJANGO_PROJECT_DIR}
RUN chmod +x ${DJANGO_PROJECT_DIR}entrypoint.sh


##################################
# development_djangoserver stage #
##################################
FROM base AS development_djangoserver

# コンテナ内で"run"コマンドを実行すると、Djangoの開発サーバーが起動するようにaliasを設定
RUN echo "alias run='python manage.py runserver 0.0.0.0:8000'" >> ~/.bashrc

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
