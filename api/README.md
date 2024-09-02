# API
## セットアップ
以下のコマンドを実行したのち、http://localhost:8000/api + /endpointにアクセスすると利用できる
```
$ > cd api
$ > make
$ > docker exec -it api-backend-1 bash
$container > run
```

## APIエンドポイントの一覧
must update here.. api.yamlを参照

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
├── docker-compose.yml # 開発フェーズのコンテナ作成用
├── Makefile # 開発フェーズのコンテナ作成用
├── README.md
├── .env.sampme # 開発フェーズのコンテナ作成用
├── conf # Djangoアプリなどの動作に必要なファイル。Dockerfileでコンテナへコピーする。
│   ├── app_xxx # アプリ毎にディレクトリとソースファイルを作成
│   │   ├── ~~.py
│   │   └── ~~.py
│   ├── app_player # example
│   │   ├── admin.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── utils # APIへのアクセス制御デコレーターの保管場所
│   │   ├── __init__.py # 空ファイル
│   │   └── decorators.py
│   └── project # プロジェクトディレクトリのソースファイル
│       ├── settings.py
│       ├── urls.py
│       └── dev # 開発フェーズの設定用
│           └── settings.py
└── tool # ファイルが1つだけなら親ディレクトリにファイルを移動するかも
    └── entrypoint.sh
```