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
│   ├── deploy.js         # デプロイスクリプト
│   ├── contract-manager.js   # JSON管理
│   └── contract-validator.js # JSON検証
├── schemas/              # JSONスキーマ
│   └── contract-schema.json
├── test/                 # テストファイル
├── contract-structure.json  # コントラクト定義
├── hardhat.config.js    # Hardhat設定
├── package.json         # Node.js依存関係
└── README.md
```

# Blockchain Deploy Service

ft_transcendenceのDjango APIから呼び出すEthereumスマートコントラクトのデプロイサービスです。トーナメント、マッチ、ユーザー情報をブロックチェーンに記録するために使用します。

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

## 📋 Django統合

### 1. 環境変数の設定

```bash
# blockchain/deploy/.env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=YOUR_PRIVATE_KEY_WITHOUT_0x
```

### 2. Python連携モジュールの使用

```python
# Django views.py または models.py
from blockchain.deploy.scripts.blockchain_deployer import BlockchainDeployer

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    contract_address = models.CharField(max_length=42, null=True, blank=True)
    deployment_tx_hash = models.CharField(max_length=66, null=True, blank=True)
    
    def deploy_tournament_contract(self):
        """トーナメント用コントラクトをデプロイ"""
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

### 3. API エンドポイントでの使用

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

### 4. Match モデルでの使用例

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

## 🔧 Django設定

### Django settings.py への追加

```python
# api/conf/trans/settings.py

# Blockchain設定
BLOCKCHAIN_DEPLOY_PATH = '/Users/kaaaaakun_/Desktop/42tokyo/ft_transcendence/blockchain/deploy'
BLOCKCHAIN_NETWORK = 'sepolia'  # 本番環境では 'mainnet'

# ブロックチェーン関連の設定
BLOCKCHAIN_SETTINGS = {
    'NETWORK': BLOCKCHAIN_NETWORK,
    'DEPLOY_PATH': BLOCKCHAIN_DEPLOY_PATH,
    'AUTO_DEPLOY': False,  # True にすると自動デプロイ
    'TIMEOUT': 300,  # デプロイタイムアウト（秒）
}
```

### URLパターンの追加

```python
# tournament/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('tournament/<int:tournament_id>/deploy/', views.deploy_tournament_contract, name='deploy-tournament'),
    path('tournament/<int:tournament_id>/contract-info/', views.get_contract_info, name='tournament-contract-info'),
]

# match/urls.py
urlpatterns = [
    path('match/<int:match_id>/deploy/', views.deploy_match_contract, name='deploy-match'),
    path('match/<int:match_id>/contract-info/', views.get_match_contract_info, name='match-contract-info'),
]
```

## 🔧 JSONデータ管理

### 自動生成されるファイル

1. **contract-structure.json**: 完全なコントラクト定義
2. **MyContract-abi.json**: ABI専用ファイル  
3. **deployment-response.json**: Django APIに返すレスポンス
4. **deployment-error.json**: エラー時の詳細情報

### Django APIレスポンス例

```json
{
  "success": true,
  "deployment": {
    "address": "0x1234567890abcdef...",
    "transactionHash": "0xabcdef1234567890...",
    "blockNumber": 123456,
    "gasUsed": "150000",
    "deployer": "0x...",
    "metadata": {
      "tournamentId": "123",
      "purpose": "Tournament contract"
    },
    "deployedAt": "2025-06-22T00:00:00Z"
  }
}
```

## 🎯 ft_transcendence統合パターン

### 1. トーナメント作成時の自動デプロイ

```python
# tournament/views.py
@api_view(['POST'])
def create_tournament(request):
    serializer = TournamentSerializer(data=request.data)
    if serializer.is_valid():
        tournament = serializer.save()
        
        # ブロックチェーンデプロイを自動実行
        if settings.BLOCKCHAIN_SETTINGS['AUTO_DEPLOY']:
            try:
                result = tournament.deploy_tournament_contract()
                return Response({
                    'tournament': TournamentSerializer(tournament).data,
                    'blockchain': result
                })
            except Exception as e:
                # デプロイ失敗時はトーナメントは作成済み
                return Response({
                    'tournament': TournamentSerializer(tournament).data,
                    'blockchain_error': str(e)
                })
        else:
            return Response({
                'tournament': TournamentSerializer(tournament).data,
                'blockchain': None
            })
```

### 2. マッチ結果の記録

```python
# match/views.py
@api_view(['PATCH'])
def update_match_result(request, match_id):
    match = Match.objects.get(id=match_id)
    
    # マッチ結果を更新
    match.winner_id = request.data.get('winner_id')
    match.score_player1 = request.data.get('score_player1')
    match.score_player2 = request.data.get('score_player2')
    match.save()
    
    # ブロックチェーンコントラクトが存在する場合は結果を記録
    if match.contract_address:
        # Note: この部分は将来的にスマートコントラクトの関数呼び出しに拡張
        pass
    
    return Response(MatchSerializer(match).data)
```

### 3. ユーザーの統計情報記録

```python
# user/models.py
class User(AbstractUser):
    blockchain_address = models.CharField(max_length=42, null=True, blank=True)
    
    def get_blockchain_stats(self):
        """ユーザーのブロックチェーン統計を取得"""
        matches_with_contracts = self.matches_as_player1.filter(
            contract_address__isnull=False
        ).union(
            self.matches_as_player2.filter(contract_address__isnull=False)
        )
        
        return {
            'total_blockchain_matches': matches_with_contracts.count(),
            'contracts': [match.contract_address for match in matches_with_contracts]
        }
```

## 🚀 デプロイコマンド

### 直接実行（開発・テスト用）

```bash
# 基本デプロイ
npm run deploy

# DBデータを使用したデプロイ
npm run deploy:with-data -- --network sepolia sample-data/db-deployment-data.json
```

### Python経由での実行（本番用）

```python
# Python APIからの呼び出し
from blockchain.deploy.scripts.blockchain_deployer import BlockchainDeployer

deployer = BlockchainDeployer()
result = deployer.deploy_contract(deployment_data, network="sepolia")
```

## 🔐 セキュリティ

⚠️ **重要**: 以下のファイルは絶対にGitにコミットしないでください：
- `.env` - 秘密鍵とRPC URLが含まれています
- `deployment-response.json` - 一時的なレスポンスファイル
- `deployment-error.json` - エラー詳細ファイル

### 本番環境での注意事項

1. **秘密鍵管理**: 本番環境では専用のウォレットアドレスを使用
2. **ガス料金**: メインネットでは十分なETHを準備
3. **RPC接続**: Infura/Alchemyの専用プランを使用
4. **エラーハンドリング**: Django側でブロックチェーンエラーを適切に処理

## 📊 ログとモニタリング

### Django ログ設定例

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'blockchain_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/blockchain.log',
        },
    },
    'loggers': {
        'blockchain': {
            'handlers': ['blockchain_file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### ログ記録の実装

```python
import logging

blockchain_logger = logging.getLogger('blockchain')

class Tournament(models.Model):
    def deploy_tournament_contract(self):
        blockchain_logger.info(f"Starting deployment for tournament {self.id}")
        
        try:
            result = deployer.deploy_contract(deployment_data)
            blockchain_logger.info(f"Deployment successful: {result['deployment']['address']}")
            return result
        except Exception as e:
            blockchain_logger.error(f"Deployment failed for tournament {self.id}: {str(e)}")
            raise
```

## 🧪 テスト

### Django テストでの使用

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

## 🔄 開発ワークフロー

### 1. 開発環境でのテスト
```bash
# Hardhatローカルネットワークを起動
npm run node

# ローカルデプロイでテスト
npm run deploy:local
```

### 2. Sepoliaでのテスト
```bash
# Sepoliaテストネットにデプロイ
npm run deploy:with-data -- --network sepolia sample-data/db-deployment-data.json
```

### 3. Django統合テスト
```python
# Django shell での動作確認
python manage.py shell

>>> from tournament.models import Tournament
>>> tournament = Tournament.objects.create(name="Test")
>>> result = tournament.deploy_tournament_contract()
>>> print(result['deployment']['address'])
```

## 📈 将来の拡張予定

1. **スマートコントラクト機能の拡張**
   - トーナメントの進行管理
   - 賞金プールの管理
   - 投票・評価システム

2. **Django統合の強化**
   - WebSocket経由でのリアルタイム更新
   - ブロックチェーンイベントの監視
   - 自動的なデータ同期

3. **セキュリティ機能**
   - マルチシグウォレット対応
   - ロールベースアクセス制御
   - 監査ログの強化

このシステムにより、ft_transcendenceのDjango APIから簡単にブロックチェーン機能を活用できます。

## 📝 補足情報

| 項目              | 内容                                                                |
| ----------------- | ------------------------------------------------------------------- |
| テスト ETH の入手 | [Sepolia Faucet](https://sepoliafaucet.com/) で入手可能             |
| コントラクト確認  | [Etherscan Sepolia](https://sepolia.etherscan.io/) でアドレスを検索 |
| Django統合        | `BlockchainDeployer`クラスでPythonから直接呼び出し可能               |
| API エンドポイント| RESTful APIでトーナメント・マッチのコントラクトデプロイ              |
| ログ管理          | Django loggingでブロックチェーン操作を記録                          |
| セキュリティ      | `.env`は**絶対に**Git に含めないこと                                |

## 🔗 関連ドキュメント

- [DB_INTEGRATION.md](./DB_INTEGRATION.md) - データベース連携の詳細
- [deployment-data-schema.json](./schemas/deployment-data-schema.json) - 入力データスキーマ
- [contract-schema.json](./schemas/contract-schema.json) - コントラクト定義スキーマ

---

**ft_transcendence プロジェクトでのブロックチェーン統合により、トーナメントやマッチの結果を透明性と改ざん耐性を持ってブロックチェーンに記録できます。**
