## 🧩 スタック構成

- **Solidity**: スマートコントラクト言語（例：v0.8.x）
- **Hardhat**: Ethereum 開発環境
- **Docker + Dockerfile**
- **Infura / Alchemy**: Sepolia ノード接続用（RPC URL）
- **.env**: 秘密鍵と RPC 情報の管理

---

## 📁 プロジェクト構成例

```
/
├── contracts/
│   └── MyContract.sol
├── scripts/
│   └── deploy.js
├── hardhat.config.js
├── package.json
├── .env
├── Dockerfile
└── .dockerignore
```

---

## 🔐 `.env`ファイル（※絶対に Git 管理しない）

📄 `.env`

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- `PRIVATE_KEY`: デプロイに使用するウォレットの秘密鍵（頭に 0x は不要）
- `SEPOLIA_RPC_URL`: Infura や Alchemy で発行した Sepolia RPC エンドポイント

### それぞれのキーの取得方法

#### ✅ PRIVATE_KEY の取得方法

- MetaMask を開く。
- 対象のアカウントを選択。
- 「アカウントの詳細」→「秘密鍵のエクスポート」。
- パスワードを入力して表示された秘密鍵（64 桁の 16 進数）をコピー。
  ⚠️ 絶対に他人に見せてはいけません。 .env ファイルは .gitignore に含めること！

#### ✅ RPC_URL の取得方法

これは Sepolia のようなネットワークに接続するための RPC エンドポイント。Infura や Alchemy を使うのが一般的です。

- 🔧 Infura で取得する手順
  - https://infura.io/ に登録 & ログイン。
- 「Create new project」→ 任意の名前を設定。
- 作成したプロジェクトを選び、「Endpoints」から Sepolia を選択。
- 表示される HTTPS の URL をコピー（例: https://sepolia.infura.io/v3/あなたのAPIキー）

---

## ✅ 出力例：

```sh
make deploy
```

実行することで、下記のアドレスが取得できる
このアドレスを使用することで、テストネットに接続できる。

```
MyContract deployed to: 0x1234567890abcdef...
```

---

## 💡 補足情報

| 項目              | 内容                                                                |
| ----------------- | ------------------------------------------------------------------- |
| テスト ETH の入手 | [Sepolia Faucet](https://sepoliafaucet.com/) で入手可能             |
| コントラクト確認  | [Etherscan Sepolia](https://sepolia.etherscan.io/) でアドレスを検索 |
| デバッグ          | `console.log()`可（Hardhat ではデバッグ容易）                       |
| セキュリティ      | `.env`は**絶対に**Git に含めないこと                                |
