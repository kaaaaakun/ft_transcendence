##############
# base stage #
##############
# 軽そうなbaseイメージを選択(https://hub.docker.com/_/python)
FROM python:3.9-slim AS base

## softのバージョンを指定
ENV PSYCOPG_VERSION 3.1.8
ENV DJANGO_VERSION 4.2

RUN apt-get update
RUN apt-get -y install \
    gcc
## install for Debug
RUN apt-get -y install \
    vim \
    curl
## clean up to reduce the size of the image
RUN rm -rf /var/lib/apt/lists/*

# Djangoとpsycopg(postgreSQL操作に必要)のインストール
## https://docs.djangoproject.com/ja/5.0/ref/databases/#postgresql-notes
## https://docs.djangoproject.com/ja/5.0/faq/install/
RUN pip install --upgrade pip
RUN pip install psycopg==${PSYCOPG_VERSION}
RUN pip install --no-cache-dir Django==${DJANGO_VERSION}


##################################
# development_djangoserver stage #
##################################
FROM base AS development_djangoserver
## プロジェクトディレクトリの作成が、rootディレクトリでいいのかは要検討
RUN django-admin startproject ft_transcendence
WORKDIR /ft_transcendence
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


##########################
# development_asgi stage #
##########################
FROM base AS development_asgi


###############
# build stage #
###############
FROM base AS build
