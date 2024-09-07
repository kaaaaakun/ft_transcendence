##############
# base stage #
##############
# 軽そうなbaseイメージを選択(https://hub.docker.com/_/python)
FROM python:3.9-slim AS base

# ビルド時のみ利用する変数
## version of installed packages
ARG PSYCOPG_VERSION=3.1.8
ARG DJANGO_VERSION=4.2
ARG DJANGO_REST_VERSION=3.15.2
ARG GUNICORN_VERSION=23.0.0
## misc


# コンテナ起動後にも利用する環境変数(secretは.envへ)
ENV DJANGO_PROJECT_NAME trans
ENV DJANGO_PROJECT_DIR /${DJANGO_PROJECT_NAME}/
RUN export SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())') && \
    echo "SECRET_KEY=${SECRET_KEY}" >> /etc/environment
ENV SECRET_KEY=$SECRET_KEY
ENV BIND_ADDRESS 0.0.0.0
ENV BIND_PORT 8000

# install for deploy
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

# clean up to reduce the size of the image
RUN rm -rf /var/lib/apt/lists/*

# Djangoとpsycopg(postgreSQL操作に必要)のインストール
## https://docs.djangoproject.com/ja/5.0/ref/databases/#postgresql-notes
## https://docs.djangoproject.com/ja/5.0/faq/install/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir psycopg==${PSYCOPG_VERSION}
RUN pip install --no-cache-dir Django==${DJANGO_VERSION}
RUN pip install --no-cache-dir djangorestframework==${DJANGO_REST_VERSION}
RUN pip install --no-cache-dir gunicorn==${GUNICORN_VERSION}

# Create a Django project
RUN django-admin startproject ${DJANGO_PROJECT_NAME}

# Create Django apps
WORKDIR ${DJANGO_PROJECT_DIR}
RUN python manage.py startapp player
RUN python manage.py startapp tournament
RUN python manage.py startapp match

# project, appsのファイルをコピー
COPY conf/project/* ${DJANGO_PROJECT_DIR}${DJANGO_PROJECT_NAME}/
COPY conf/app_player/* ${DJANGO_PROJECT_DIR}player/
COPY conf/app_tournament/* ${DJANGO_PROJECT_DIR}tournament/
COPY conf/app_match/* ${DJANGO_PROJECT_DIR}match/

# Create utils Directory and Copy files
RUN mkdir -p ${DJANGO_PROJECT_DIR}utils
COPY conf/utils/* ${DJANGO_PROJECT_DIR}utils/

# appsで定めたモデルをDBに反映する準備
RUN python ${DJANGO_PROJECT_DIR}manage.py makemigrations

# コンテナ起動後に利用するファイルをコピー
COPY tool/entrypoint.sh ${DJANGO_PROJECT_DIR}
RUN chmod +x ${DJANGO_PROJECT_DIR}entrypoint.sh

############################
# development common stage #
############################
FROM base AS development_common

# dev用の制限が緩いsettings.pyをコピー
COPY dev/settings.py ${DJANGO_PROJECT_DIR}${DJANGO_PROJECT_NAME}/

# コンテナ内で"test"コマンドを実行すると、Djangoのtestが実行できるようにaliasを設定
RUN echo "alias test='python manage.py test'" >> ~/.bashrc


##################################
# development_djangoserver stage #
##################################
FROM development_common AS development_djangoserver

# コンテナ内で"run"コマンドを実行すると、Djangoの開発サーバーが起動するようにaliasを設定
RUN echo "alias run='python manage.py runserver ${BIND_ADDRESS}:${BIND_PORT}'" >> ~/.bashrc

ENTRYPOINT [ "/trans/entrypoint.sh" ]
CMD ["sleep", "infinity"]

##########################
# development_wsgi stage #
##########################
FROM development_common AS development_wsgi

# コンテナ内で"run"コマンドを実行すると、Gunicornが起動するようにaliasを設定
RUN echo "alias run='gunicorn ${DJANGO_PROJECT_NAME}.wsgi:application --bind ${BIND_ADDRESS}:${BIND_PORT}'" >> ~/.bashrc

ENTRYPOINT [ "/trans/entrypoint.sh" ]
CMD ["sleep", "infinity"]

##########################
# development_asgi stage #
##########################
FROM development_common AS development_asgi


#########################
# deploy_wsgi stage #
#########################
FROM base AS deploy_wsgi

ENTRYPOINT [ "/trans/entrypoint.sh" ]
CMD [ "sh", "-c", "gunicorn ${DJANGO_PROJECT_NAME}.wsgi:application --bind ${BIND_ADDRESS}:${BIND_PORT}" ]


#########################
# deploy_asgi stage #
#########################
FROM base AS deploy_asgi
