# ft_transcendence
  
## 概要

**ft_transcendence** は、42のカリキュラムに基づいて開発された、PongゲームをベースとしたWebアプリケーションです。
ユーザー認証、リアルタイム対戦、プロフィール管理、ブロックチェーンでの結果管理など、モダンなWeb技術を活用したフルスタックプロジェクトです。

## 主な機能

- ユーザー登録・ログイン（JWT対応）
- Pongゲームのローカル、オンライン対戦（WebSocket使用）
- フレンド管理
- プロフィール編集・アバターアップロード
- 試合履歴・ブロックチェーンでの安全なデータ保管

## 技術スタック

- **フロントエンド**: Javascript, Bootstrap
- **バックエンド**: Django, WebSocket, JWT
- **データベース**: PostgreSQL, (redis)
- **インフラ**: Docker, Nginx, ELK
- **ブロックチェーン**: イーサリアムテストネット（https://sepolia.etherscan.io/）

## セットアップ方法

1. リポジトリをクローン
    ```bash
    git clone this-repo
    cd ft_transcendence
    ```
2. 環境変数ファイルを作成し、必要な値を設定
    .env.sampleを参照している場合、ファイル作成は不要です
3. 環境変数ファイルのBLOCKCHAIN_PRIVATE_KEYにウォレットの秘密鍵を記載
　　！.env.sampleを利用する場合はリポジトリをアップロードしないように注意
    sepoliaEHTがウォレットに必要です
4. Dockerで起動
   ```bash
   make
   ```
5. `https://localhost` でアプリケーションにアクセス

## ディレクトリ構成

```
ft_transcendence/
├── api/                    # バックエンド
├── config/                 # フロント、バック共通の設定
├── elk/                    # ELK 設定
├── reverseproxy/           # nginx 設定
├── static-builder/         # フロントエンド 
├── docker-compose.yml
├── Makefile
├── README.md
└── ...
```

## 42 Setup
Vertual BoxでUbuntuを設定した。
メモリ：8G、プロセッサー：4、ディスクサイズ：100G

makeで何度か失敗したが、Ubuntuをライブモードとかいうお手軽版で動かしてた模様。（そんな選択はしてないけど）
インストールには時間がかかるが、このときにUbuntuデスクトップが表示されてて使えそうに思えるが、目的のためにはまだ使えない。
Ubuntuの再起動を促されるまで待つこと！、かつリスタート後に``df -h``で/dev/sda2が/にマウントされていることを確認

```
sudo apt-get update
sudo apt-get install git
sudo apt install vim
sudo apt install make
cd Desktop
git clone this-repo
cd this-repo
git switch feat/for-submit
cp .env.sample .env
#ブロックチェーンのプライベートキーを入力
```
https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository
のコマンドを全部コピペして実行して成功すること。
```
sudo make
```

## ライセンス
このプロジェクトは42の教育目的で作成されています。
