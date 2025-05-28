## 🧩 スタック構成

* **Solidity**: スマートコントラクト言語（例：v0.8.x）
* **Hardhat**: Ethereum開発環境
* **Docker + Dockerfile**
* **Infura / Alchemy**: Sepoliaノード接続用（RPC URL）
* **.env**: 秘密鍵とRPC情報の管理

---

## 📁 プロジェクト構成例

```
my-dapp/
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

## 🔨 1. Solidityスマートコントラクト作成

📄 `contracts/MyContract.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyContract {
    string public message;

    constructor(string memory _message) {
        message = _message;
    }

    function updateMessage(string memory _newMessage) public {
        message = _newMessage;
    }
}
```

---

## 💻 2. デプロイスクリプト

📄 `scripts/deploy.js`

```js
const hre = require("hardhat");

async function main() {
  const MyContract = await hre.ethers.getContractFactory("MyContract");
  const contract = await MyContract.deploy("Hello, Sepolia!");

  await contract.deployed();

  console.log("MyContract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## ⚙️ 3. Hardhat設定ファイル

📄 `hardhat.config.js`

```js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

---

## 🔐 4. `.env`ファイル（※絶対にGit管理しない）

📄 `.env`

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

* `PRIVATE_KEY`: デプロイに使用するウォレットの秘密鍵（頭に0xは不要）
* `SEPOLIA_RPC_URL`: InfuraやAlchemyで発行したSepolia RPCエンドポイント

---

## 🐳 5. Dockerfile 作成

📄 `Dockerfile`

```Dockerfile
FROM node:18

WORKDIR /app

COPY . .

RUN npm install

CMD ["npx", "hardhat", "run", "scripts/deploy.js", "--network", "sepolia"]
```

📄 `.dockerignore`

```
node_modules
.env
```

---

## 🚀 6. Dockerビルド＆実行

### ① `.env`を**ローカルに保存**したまま、Dockerに渡す：

```bash
docker build -t my-hardhat-project .
docker run --env-file .env my-hardhat-project
```

### ✅ 出力例：

```
MyContract deployed to: 0x1234567890abcdef...
```

---

## 💡 補足情報

| 項目        | 内容                                                          |
| --------- | ----------------------------------------------------------- |
| テストETHの入手 | [Sepolia Faucet](https://sepoliafaucet.com/) で入手可能          |
| コントラクト確認  | [Etherscan Sepolia](https://sepolia.etherscan.io/) でアドレスを検索 |
| デバッグ      | `console.log()`可（Hardhatではデバッグ容易）                           |
| セキュリティ    | `.env`は**絶対に**Gitに含めないこと                                    |

