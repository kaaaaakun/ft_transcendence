# Blockchain Deploy Service

ft_transcendenceのDjango APIから操作するEthereumスマートコントラクトのデプロイサービスです。PythonからJavaScript/Hardhatのデプロイスクリプトを呼び出してブロックチェーンにコントラクトをデプロイします。

## 🧩 技術スタック

- **Solidity ^0.8.20**: スマートコントラクト言語
- **Hardhat ^2.24.1**: Ethereum開発環境（JavaScript）
- **Python 3.x**: Django APIからの操作
- **Node.js 22**: Hardhat実行環境
- **Docker**: コンテナ化されたデプロイ環境

## 📁 プロジェクト構成

```
blockchain/deploy/
├── contracts/              # Solidityコントラクト
│   └── MyContract.sol
├── scripts/               # スクリプト類
│   ├── deploy.js         # 基本デプロイスクリプト
│   ├── deploy-with-data.js   # DB連携デプロイスクリプト
│   ├── contract-manager.js   # JSON管理
│   ├── contract-validator.js # JSON検証
│   └── blockchain_deployer.py # Python連携モジュール
├── schemas/              # JSONスキーマ
│   └── deployment-data-schema.json
├── sample-data/          # サンプルデータ
│   └── db-deployment-data.json
├── contract-structure.json  # コントラクト定義
├── DB_INTEGRATION.md     # DB連携詳細ドキュメント
└── README.md
```

## 🚀 Python（Django）からの操作方法

このサービスは、**Python（Django）からJavaScript/Hardhatのデプロイスクリプトを呼び出す**設計になっています。JavaScript部分はそのままで、Pythonから操作します。

### アーキテクチャ

```
Django/Python → BlockchainDeployer.py → JavaScript/Hardhat → Blockchain
```

### 基本的な使用方法

```python
# Django models.py または views.py
from blockchain.deploy.scripts.blockchain_deployer import BlockchainDeployer

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    contract_address = models.CharField(max_length=42, null=True, blank=True)
    
    def deploy_blockchain_contract(self):
        """PythonからJavaScriptのデプロイスクリプトを実行"""
        deployer = BlockchainDeployer()
        
        deployment_data = {
            "contractName": "MyContract",
            "constructorArgs": [f"Tournament: {self.name}"],
            "metadata": {
                "deployer": "tournament_system",
                "tournamentId": str(self.id)
            }
        }
        
        # 内部でnpm run deploy:with-dataを実行
        result = deployer.deploy_contract(deployment_data)
        
        if result['success']:
            self.contract_address = result['deployment']['address']
            self.save()
        
        return result
```

### JavaScript側（そのまま）

```bash
# 直接的なJavaScript実行も可能
npm run deploy
npm run deploy:with-data -- --network sepolia sample-data/db-deployment-data.json
```

### 開発・テスト用コマンド

```bash
# Hardhatローカルネットワーク
npm run node
npm run deploy:local

# JSON管理
npm run contract:info
npm run contract:validate
```

## 📋 Django統合パターン

### 1. Tournament モデルでの使用

```python
# tournament/models.py
class Tournament(models.Model):
    name = models.CharField(max_length=100)
    contract_address = models.CharField(max_length=42, null=True, blank=True)
    deployment_tx_hash = models.CharField(max_length=66, null=True, blank=True)
    
    def deploy_tournament_contract(self):
        """トーナメント用コントラクトをデプロイ"""
        from blockchain.deploy.scripts.blockchain_deployer import BlockchainDeployer
        
        deployer = BlockchainDeployer()
        
        deployment_data = {
            "contractName": "MyContract",
            "constructorArgs": [f"Tournament: {self.name}"],
            "metadata": {
                "deployer": "tournament_system",
                "purpose": f"Tournament contract for {self.name}",
                "version": "1.0.0",
                "tournamentId": str(self.id)
            }
        }
        
        result = deployer.deploy_contract(deployment_data)
        
        if result['success']:
            self.contract_address = result['deployment']['address']
            self.deployment_tx_hash = result['deployment']['transactionHash']
            self.save()
            return result
        else:
            raise Exception(f"Deployment failed: {result['error']}")
```

### 2. API エンドポイントでの使用

```python
# tournament/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Tournament

@api_view(['POST'])
def deploy_tournament_contract(request, tournament_id):
    """トーナメント用スマートコントラクトをデプロイ"""
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        
        if tournament.contract_address:
            return Response({
                'success': False,
                'error': 'Contract already deployed'
            }, status=400)
        
        result = tournament.deploy_tournament_contract()
        
        return Response({
            'success': True,
            'contract_address': result['deployment']['address'],
            'transaction_hash': result['deployment']['transactionHash'],
            'etherscan_url': f"https://sepolia.etherscan.io/address/{result['deployment']['address']}"
        })
        
    except Tournament.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Tournament not found'
        }, status=404)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
```

### 3. Match モデルでの使用

```python
# match/models.py
class Match(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_player2')
    contract_address = models.CharField(max_length=42, null=True, blank=True)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    def deploy_match_contract(self):
        """マッチ用コントラクトをデプロイ"""
        from blockchain.deploy.scripts.blockchain_deployer import BlockchainDeployer
        
        deployer = BlockchainDeployer()
        
        deployment_data = {
            "contractName": "MyContract",
            "constructorArgs": [
                f"Match: {self.player1.username} vs {self.player2.username}",
                str(self.id)
            ],
            "metadata": {
                "deployer": "match_system",
                "purpose": f"Match between {self.player1.username} and {self.player2.username}",
                "matchId": str(self.id),
                "player1": self.player1.username,
                "player2": self.player2.username
            }
        }
        
        result = deployer.deploy_contract(deployment_data)
        
        if result['success']:
            self.contract_address = result['deployment']['address']
            self.save()
            return result
        else:
            raise Exception(f"Match contract deployment failed: {result['error']}")
```

## 🔧 セットアップ

### 1. 環境変数の設定

```bash
# blockchain/deploy/.env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=YOUR_PRIVATE_KEY_WITHOUT_0x
```

### 2. 依存関係のインストール

```bash
cd blockchain/deploy
npm install
```

### 3. Django設定

```python
# api/conf/trans/settings.py

# Blockchain設定
BLOCKCHAIN_DEPLOY_PATH = '/Users/kaaaaakun_/Desktop/42tokyo/ft_transcendence/blockchain/deploy'
BLOCKCHAIN_NETWORK = 'sepolia'  # 本番環境では 'mainnet'
```

## 🚀 使用例

### Django Shell での動作確認

```python
# Django shell での動作確認
python manage.py shell

>>> from tournament.models import Tournament
>>> tournament = Tournament.objects.create(name="Test Tournament")
>>> result = tournament.deploy_tournament_contract()
>>> print(result['deployment']['address'])
0x1234567890abcdef...
```

### APIエンドポイント

```bash
# トーナメント用コントラクトをデプロイ
curl -X POST http://localhost:8000/api/tournament/1/deploy/

# レスポンス例
{
  "success": true,
  "contract_address": "0x1234567890abcdef...",
  "transaction_hash": "0xabcdef1234567890...",
  "etherscan_url": "https://sepolia.etherscan.io/address/0x1234567890abcdef..."
}
```

## 🧪 テスト

### Hardhatローカルテスト

```bash
# ローカルネットワークを起動
npm run node

# ローカルデプロイでテスト
npm run deploy:local
```

### Django テスト

```python
# tournament/tests.py
from django.test import TestCase
from unittest.mock import patch, MagicMock

class TournamentBlockchainTest(TestCase):
    @patch('blockchain.deploy.scripts.blockchain_deployer.BlockchainDeployer')
    def test_tournament_deployment(self, mock_deployer):
        # モックの設定
        mock_instance = MagicMock()
        mock_deployer.return_value = mock_instance
        mock_instance.deploy_contract.return_value = {
            'success': True,
            'deployment': {
                'address': '0x1234567890abcdef',
                'transactionHash': '0xabcdef1234567890'
            }
        }
        
        # テスト実行
        tournament = Tournament.objects.create(name="Test Tournament")
        result = tournament.deploy_tournament_contract()
        
        # アサーション
        self.assertTrue(result['success'])
        self.assertIsNotNone(tournament.contract_address)
```

## 🔐 セキュリティ

⚠️ **重要**: 以下のファイルは絶対にGitにコミットしないでください：
- `.env` - 秘密鍵とRPC URLが含まれています

### 本番環境での注意事項

1. **秘密鍵管理**: 本番環境では専用のウォレットアドレスを使用
2. **ガス料金**: メインネットでは十分なETHを準備
3. **RPC接続**: Infura/Alchemyの専用プランを使用
4. **エラーハンドリング**: Django側でブロックチェーンエラーを適切に処理

## 📊 生成されるファイル

### デプロイ後に自動生成される主要ファイル

1. **deployment-response.json**: Django APIに返すレスポンス
2. **MyContract-abi.json**: ABI専用ファイル  
3. **contract-structure.json**: 完全なコントラクト定義

### Django APIレスポンス例

```json
{
  "success": true,
  "deployment": {
    "address": "0x1234567890abcdef...",
    "transactionHash": "0xabcdef1234567890...",
    "blockNumber": 123456,
    "gasUsed": "150000",
    "metadata": {
      "tournamentId": "123",
      "purpose": "Tournament contract"
    },
    "deployedAt": "2025-06-22T00:00:00Z"
  }
}
```

## 📝 補足情報

| 項目              | 内容                                                                |
| ----------------- | ------------------------------------------------------------------- |
| テスト ETH の入手 | [Sepolia Faucet](https://sepoliafaucet.com/) で入手可能             |
| コントラクト確認  | [Etherscan Sepolia](https://sepolia.etherscan.io/) でアドレスを検索 |
| Django統合        | `BlockchainDeployer`クラスでPythonから直接呼び出し可能               |
| JavaScript部分    | Hardhat/Node.jsのコードはそのまま。Pythonが操作するだけ             |
| セキュリティ      | `.env`は**絶対に**Git に含めないこと                                |

## 🔗 関連ドキュメント

- [DB_INTEGRATION.md](./DB_INTEGRATION.md) - データベース連携の詳細
- [deployment-data-schema.json](./schemas/deployment-data-schema.json) - 入力データスキーマ

---

**Python（Django）からJavaScript/Hardhatのデプロイスクリプトを呼び出すことで、ft_transcendenceプロジェクトでブロックチェーン機能を簡単に統合できます。**
