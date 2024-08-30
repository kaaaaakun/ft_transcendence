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
must update here..
URIに'admin'が含まれる場合は、/api/admin/でログインした後でアクセスすると閲覧できる。

## よく使いそうなコマンド
```
test mtch # エンドポイントのテスト。manage.pyのあるディレクトリで 'mtch'はアプリ名に置き換える
```

## フレームワーク
* Django
* DjangoREST

## ディレクトリ構成
```
├── Dockerfile
├── Makefile # 開発フェーズのコンテナ作成用
├── README.md
├── conf # Djangoアプリなどの動作に必要なファイル。Dockerfileでコンテナへコピーする。
│   ├── app_xxx # アプリ毎にディレクトリとソースファイルを作成
│   │   ├── ~~.py
│   │   └── ~~.py
│   ├── app_plyr # example
│   │   ├── admin.py
│   │   ├── models.py
│   │   ├── serializers.py
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
├── docker-compose.yml # 開発フェーズのコンテナ作成用
└── tool # ファイルが1つだけなら親ディレクトリにファイルを移動するかも
    └── entrypoint.sh
```