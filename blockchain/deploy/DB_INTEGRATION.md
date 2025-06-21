# DB連携デプロイシステム使用方法

## 概要

このシステムは、データベースから取得した情報をJSON形式でスマートコントラクトのデプロイに渡すことができます。

## データフロー

```
DB → JSON → deploy-with-data.js → Blockchain
                ↓
         deployment-response.json → DB更新
```

## 使用方法

### 1. JSONファイルを使用したデプロイ

```bash
# サンプルデータでデプロイ
npm run deploy:with-data -- --network sepolia sample-data/db-deployment-data.json
```

### 2. 標準入力を使用したデプロイ

```bash
# パイプラインでのデプロイ
echo '{"contractName":"MyContract","constructorArgs":["Hello"],"metadata":{"deployer":"api","purpose":"test"}}' | npm run deploy:with-data -- --network sepolia stdin
```

### 3. Django/API からの使用

```python
from scripts.blockchain_deployer import BlockchainDeployer

# データベースからデータを取得
tournament = Tournament.objects.get(id=1)

# デプロイデータを作成
deployment_data = {
    "contractName": "MyContract",
    "constructorArgs": [f"Tournament: {tournament.name}"],
    "metadata": {
        "deployer": request.user.username,
        "purpose": f"Tournament contract for {tournament.name}",
        "tournamentId": str(tournament.id)
    }
}

# デプロイ実行
deployer = BlockchainDeployer()
result = deployer.deploy_contract(deployment_data)

# 結果をDBに保存
if result['success']:
    tournament.contract_address = result['deployment']['address']
    tournament.save()
```

## 入力JSONフォーマット

```json
{
  "contractName": "MyContract",
  "constructorArgs": ["arg1", "arg2"],
  "metadata": {
    "deployer": "user_id",
    "purpose": "deployment purpose",
    "gameId": "game_123",
    "tournamentId": "tournament_456"
  },
  "gasSettings": {
    "gasLimit": "auto",
    "gasPrice": "auto"
  }
}
```

## 出力JSONフォーマット

### 成功時

```json
{
  "success": true,
  "deployment": {
    "address": "0x...",
    "transactionHash": "0x...",
    "blockNumber": 123456,
    "gasUsed": "150000",
    "deployer": "0x...",
    "metadata": { ... },
    "deployedAt": "2025-06-22T00:00:00Z"
  },
  "files": {
    "abi": "MyContract-abi.json",
    "config": "frontend-config-sepolia.json"
  }
}
```

### エラー時

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-06-22T00:00:00Z"
}
```

## ft_transcendence での統合例

### Tournament モデルでの使用

```python
class Tournament(models.Model):
    name = models.CharField(max_length=100)
    contract_address = models.CharField(max_length=42, null=True)
    
    def deploy_blockchain_contract(self):
        deployment_data = {
            "contractName": "TournamentContract",
            "constructorArgs": [self.name, str(self.max_players)],
            "metadata": {
                "deployer": "tournament_system",
                "purpose": f"Tournament: {self.name}",
                "tournamentId": str(self.id)
            }
        }
        
        deployer = BlockchainDeployer()
        result = deployer.deploy_contract(deployment_data)
        
        if result['success']:
            self.contract_address = result['deployment']['address']
            self.save()
            return result
        else:
            raise Exception(f"Deployment failed: {result['error']}")
```

### Match モデルでの使用

```python
class Match(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, on_delete=models.CASCADE)
    contract_address = models.CharField(max_length=42, null=True)
    
    def deploy_match_contract(self):
        deployment_data = {
            "contractName": "MatchContract",
            "constructorArgs": [
                self.player1.username,
                self.player2.username,
                str(self.id)
            ],
            "metadata": {
                "deployer": "match_system",
                "purpose": f"Match between {self.player1} and {self.player2}",
                "matchId": str(self.id)
            }
        }
        
        # デプロイ実行...
```

## API エンドポイント例

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def deploy_tournament_contract(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        result = tournament.deploy_blockchain_contract()
        
        return Response({
            'success': True,
            'contract_address': result['deployment']['address'],
            'transaction_hash': result['deployment']['transactionHash']
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=400)
```

このシステムにより、DBのデータを直接ブロックチェーンデプロイに活用できます。
