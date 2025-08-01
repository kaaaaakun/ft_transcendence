##############
# base stage #
##############
# 軽そうなbaseイメージを選択(https://hub.docker.com/_/python)
FROM python:3.9-slim AS base

# コンテナ起動後にも利用する環境変数(secretは.envへ)
ENV DJANGO_PROJECT_NAME=trans
ENV DJANGO_PROJECT_DIR=/${DJANGO_PROJECT_NAME}/
ENV BIND_ADDRESS=0.0.0.0
ENV BIND_PORT=8000
ENV DJANGO_SETTINGS_MODULE=trans.settings

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

# APIサーバーおよび接続されたコンテナの操作に必要なライブラリのインストール
RUN pip install --upgrade pip
COPY ./api/tool/requirements.txt tool/requirements.txt
RUN pip install --no-cache-dir -r tool/requirements.txt

WORKDIR ${DJANGO_PROJECT_DIR}

# abi
COPY ./api/blockchain/deploy/artifacts/contracts/MyContract.sol/MyContract.json ${DJANGO_PROJECT_DIR}

# confディレクトリのファイルをコンテナ内にコピー
COPY ./api/conf/ ${DJANGO_PROJECT_DIR}

# configディレクトリのファイルをコンテナ内にコピー
COPY ./config/* ${DJANGO_PROJECT_DIR}config/

# コンテナ起動後に利用するファイルをコピー
COPY ./api/tool/entrypoint.sh ${DJANGO_PROJECT_DIR}
RUN chmod +x ${DJANGO_PROJECT_DIR}entrypoint.sh


##########################
# development_asgi stage #
##########################
FROM base AS development_asgi

# dev用の制限が緩いsettings.pyをコピー
COPY ./api/dev/settings.py ${DJANGO_PROJECT_DIR}${DJANGO_PROJECT_NAME}/
# コンテナ内で"test"コマンドを実行すると、Djangoのtestが実行できるようにaliasを設定
RUN echo "alias test='python manage.py test'" >> ~/.bashrc
# コンテナ内で"run"コマンドを実行すると、Djangoの開発サーバーが起動するようにaliasを設定
RUN echo "alias run='python manage.py runserver ${BIND_ADDRESS}:${BIND_PORT}'" >> ~/.bashrc

ENTRYPOINT [ "/trans/entrypoint.sh" ]
# コンテナに入ってからbashに切り替え手動でrunする。
CMD ["sleep", "infinity"]


#########################
# deploy_asgi stage #
#########################
FROM base AS deploy_asgi

ENTRYPOINT [ "/trans/entrypoint.sh" ]
CMD ["sh", "-c", "daphne -b ${BIND_ADDRESS} -p ${BIND_PORT} ${DJANGO_PROJECT_NAME}.asgi:application"]
