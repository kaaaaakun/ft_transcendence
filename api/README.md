# API
## セットアップ
以下のコマンドを実行したのち、http://localhost:8000/api + /endpointにアクセスすると利用できる  
```
$ > cd api
$ > make
$ > docker exec -it dev-api bash
$container > run
```

## APIエンドポイントの一覧
openapi.yamlを参照

DBのテーブルにアクセスするuriは、25％ではadminにのみ公開している。(ex. tournaments/tournaments)  
/api/admin/でログインしたら利用できる。

## よく使いそうなコマンド
```
test match # エンドポイントのテスト。manage.pyのあるディレクトリで 'match'はアプリ名に置き換える
```

## フレームワーク
* Django
* DjangoREST

## ディレクトリ構成
```
├── Dockerfile
├── Makefile # 開発フェーズのコンテナ作成用
├── README.md
├── .dockerignore
├── conf # Djangoの動作に必要なファイル。Dockerfileでコンテナへコピーする。
│   ├── xxx # アプリ毎にディレクトリとソースファイルを作成
│   │   ├── ~~.py
│   │   └── ~~.py
│   ├── match # example
│   │   ├── admin.py
│   │   ├── consumers.py # WS接続管理の親玉
│   │   ├── routing.py # WS接続のルーティングを管理
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py # HTTP接続管理の親玉
│   ├── utils # APIへのアクセス制御デコレーターの保管場所
│   │   ├── __init__.py # 空ファイル
│   │   ├── decorators.py
│   │   └── websocket.py
│   └── trans # プロジェクトディレクトリのソースファイル
│       ├── asgi.py
│       ├── settings.py
│       └── urls.py
├── dev # 開発フェーズ専用のファイル類
│   ├── docker-compose.yml
│   ├── index.html # APIエンドポイントを利用してゲーム画面をざっくり再現できるファイル。ブラウザでひらく。
│   ├── settings.py
│   └── .env.sample
└── tool
    └── entrypoint.sh # コンテナ起動後に実行するコマンド集
    └── requirements.txt
```

## 新たなappを追加する時は下記のコマンドを実行
configの内容が必要なので、コピーして使用する。

```sh
cd api/conf
mkdir config
cp ../../config/* config/
python3 manage.py startapp {new_app}
rm -rf config 
```

## モデルを変更した時は下記のコマンドを実行
```sh
python3 -m pip install -r tool/requirements.txt
cd api/conf
python3 manage.py makemigrations
```

ローカルに不要なインストールをしたくない場合、dev-apiコンテナ上で行うこともできる。
```
$ > cd api
$ > make
$ > docker exec -it dev-api bash
$container > python3 makemigrations
```
これによってアプリ内のmigrationsディレクトリに新しい設定ファイルが生成される。
コンテナ内にある設定ファイルを``docker cp``コマンドでローカルにコピーできる。

## SECRET_KEY の作成方法
```sh
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```
