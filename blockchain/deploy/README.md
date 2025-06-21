# Blockchain Deploy Service

ft_transcendenceのDjango APIから**直接**Ethereumスマートコントラクトをデプロイ・操作するサービスです。PythonのWeb3ライブラリを使用してNode.jsを挟まずにブロックチェーンにアクセスします。

## 🧩 技術スタック

- **Solidity ^0.8.20**: スマートコントラクト言語
- **Python 3.x + Web3.py**: Django APIからの直接ブロックチェーンアクセス
- **py-solc-x**: Pythonでのコントラクトコンパイル
- **Ethereum (Sepolia)**: テストネットワーク
- **Docker**: コンテナ化されたデプロイ環境

## 📁 プロジェクト構成

```
blockchain/deploy/
├── contracts/              # Solidityコントラクト
│   └── MyContract.sol
├── python/                 # Python直接アクセス用
│   ├── blockchain_manager.py    # メインクラス
│   ├── contract_deployer.py     # デプロイ機能
│   ├── contract_interface.py    # コントラクト操作
│   └── config.py               # 設定管理
├── abi/                   # コンパイル済みABI
│   └── MyContract.json
├── sample-data/          # サンプルデータ
│   └── deployment-data.json
├── requirements.txt      # Python依存関係
├── .env.sample          # 環境変数テンプレート
└── README.md
```

## 🚀 Python直接アクセス方式

### アーキテクチャ

```
Django/Python → Web3.py → Ethereum RPC → Blockchain
```

### 基本的な使用方法

```python
# Django models.py または views.py
from blockchain.deploy.python.blockchain_manager import BlockchainManager

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    contract_address = models.CharField(max_length=42, null=True, blank=True)
    
    def deploy_blockchain_contract(self):
        """Pythonから直接ブロックチェーンにコントラクトをデプロイ"""
        manager = BlockchainManager()
        
        constructor_args = [f"Tournament: {self.name}"]
        
        # 直接デプロイ実行
        result = manager.deploy_contract(
            contract_name="MyContract",
            constructor_args=constructor_args,
            metadata={
                "deployer": "tournament_system",
                "tournamentId": str(self.id)
            }
        )
        
        if result['success']:
            self.contract_address = result['contract_address']
            self.save()
        
        return result
    
    def update_contract_message(self, new_message):
        """デプロイ済みコントラクトのメッセージを更新"""
        if not self.contract_address:
            raise ValueError("Contract not deployed")
        
        manager = BlockchainManager()
        result = manager.call_contract_function(
            contract_address=self.contract_address,
            function_name="updateMessage",
            args=[new_message]
        )
        
        return result
    
    def get_contract_message(self):
        """コントラクトからメッセージを取得"""
        if not self.contract_address:
            return None
        
        manager = BlockchainManager()
        result = manager.read_contract_function(
            contract_address=self.contract_address,
            function_name="getMessage"
        )
        
        return result
```