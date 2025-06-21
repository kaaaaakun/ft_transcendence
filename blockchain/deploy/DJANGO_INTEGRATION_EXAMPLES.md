# Django統合サンプルコード

## Tournament モデルの統合例

```python
# api/conf/tournament/models.py
from django.db import models
from django.contrib.auth.models import User
import logging

blockchain_logger = logging.getLogger('blockchain')

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    max_players = models.IntegerField(default=8)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # ブロックチェーン関連フィールド
    contract_address = models.CharField(max_length=42, null=True, blank=True)
    deployment_tx_hash = models.CharField(max_length=66, null=True, blank=True)
    deployed_at = models.DateTimeField(null=True, blank=True)
    deployment_status = models.CharField(
        max_length=20, 
        choices=[
            ('pending', 'Pending'),
            ('deployed', 'Deployed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    
    def deploy_tournament_contract(self, deployer_user=None):
        """トーナメント用スマートコントラクトをデプロイ"""
        if self.contract_address:
            raise ValueError("Contract already deployed")
        
        try:
            from blockchain.deploy.scripts.blockchain_deployer import BlockchainDeployer
            
            blockchain_logger.info(f"Starting deployment for tournament {self.id}: {self.name}")
            
            deployer = BlockchainDeployer()
            
            deployment_data = {
                "contractName": "MyContract",
                "constructorArgs": [
                    f"Tournament: {self.name}",
                    str(self.max_players)
                ],
                "metadata": {
                    "deployer": deployer_user.username if deployer_user else "system",
                    "purpose": f"Tournament contract for {self.name}",
                    "version": "1.0.0",
                    "tournamentId": str(self.id),
                    "maxPlayers": str(self.max_players)
                }
            }
            
            result = deployer.deploy_contract(deployment_data, network="sepolia")
            
            if result['success']:
                self.contract_address = result['deployment']['address']
                self.deployment_tx_hash = result['deployment']['transactionHash']
                self.deployed_at = timezone.now()
                self.deployment_status = 'deployed'
                self.save()
                
                blockchain_logger.info(
                    f"Tournament {self.id} deployed successfully: {self.contract_address}"
                )
                
                return result
            else:
                self.deployment_status = 'failed'
                self.save()
                raise Exception(f"Deployment failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            self.deployment_status = 'failed'
            self.save()
            blockchain_logger.error(f"Deployment failed for tournament {self.id}: {str(e)}")
            raise
    
    @property
    def etherscan_url(self):
        """Etherscan URLを取得"""
        if self.contract_address:
            return f"https://sepolia.etherscan.io/address/{self.contract_address}"
        return None
```

## Tournament Views の統合例

```python
# api/conf/tournament/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Tournament
from .serializers import TournamentSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deploy_tournament_contract(request, tournament_id):
    """トーナメント用スマートコントラクトをデプロイ"""
    tournament = get_object_or_404(Tournament, id=tournament_id)
    
    # 権限チェック（作成者またはスタッフのみ）
    if tournament.created_by != request.user and not request.user.is_staff:
        return Response({
            'error': 'Permission denied'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # 既にデプロイ済みかチェック
    if tournament.contract_address:
        return Response({
            'error': 'Contract already deployed',
            'contract_address': tournament.contract_address,
            'etherscan_url': tournament.etherscan_url
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        result = tournament.deploy_tournament_contract(deployer_user=request.user)
        
        return Response({
            'success': True,
            'tournament': TournamentSerializer(tournament).data,
            'blockchain': {
                'contract_address': result['deployment']['address'],
                'transaction_hash': result['deployment']['transactionHash'],
                'etherscan_url': tournament.etherscan_url,
                'block_number': result['deployment']['blockNumber'],
                'gas_used': result['deployment']['gasUsed']
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_tournament_contract_info(request, tournament_id):
    """トーナメントのコントラクト情報を取得"""
    tournament = get_object_or_404(Tournament, id=tournament_id)
    
    if not tournament.contract_address:
        return Response({
            'deployed': False,
            'status': tournament.deployment_status
        })
    
    return Response({
        'deployed': True,
        'contract_address': tournament.contract_address,
        'transaction_hash': tournament.deployment_tx_hash,
        'deployed_at': tournament.deployed_at,
        'etherscan_url': tournament.etherscan_url,
        'status': tournament.deployment_status
    })
```

## Match モデルの統合例

```python
# api/conf/match/models.py
class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_player2')
    
    # マッチ結果
    winner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='won_matches')
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    
    # ブロックチェーン関連
    contract_address = models.CharField(max_length=42, null=True, blank=True)
    deployment_tx_hash = models.CharField(max_length=66, null=True, blank=True)
    
    def deploy_match_contract(self):
        """マッチ用コントラクトをデプロイ"""
        try:
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
                    "purpose": f"Match contract for {self.player1.username} vs {self.player2.username}",
                    "matchId": str(self.id),
                    "tournamentId": str(self.tournament.id) if self.tournament else None,
                    "player1": self.player1.username,
                    "player2": self.player2.username
                }
            }
            
            result = deployer.deploy_contract(deployment_data)
            
            if result['success']:
                self.contract_address = result['deployment']['address']
                self.deployment_tx_hash = result['deployment']['transactionHash']
                self.save()
                return result
            else:
                raise Exception(f"Match contract deployment failed: {result.get('error')}")
                
        except Exception as e:
            blockchain_logger.error(f"Match {self.id} deployment failed: {str(e)}")
            raise
```

## API URL設定例

```python
# api/conf/tournament/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # 既存のURL...
    path('<int:tournament_id>/deploy/', views.deploy_tournament_contract, name='deploy-tournament'),
    path('<int:tournament_id>/contract/', views.get_tournament_contract_info, name='tournament-contract'),
]

# api/conf/match/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # 既存のURL...
    path('<int:match_id>/deploy/', views.deploy_match_contract, name='deploy-match'),
    path('<int:match_id>/contract/', views.get_match_contract_info, name='match-contract'),
]
```

## Django Admin の統合

```python
# api/conf/tournament/admin.py
from django.contrib import admin
from .models import Tournament

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ['name', 'max_players', 'deployment_status', 'contract_address', 'deployed_at']
    list_filter = ['deployment_status', 'deployed_at']
    readonly_fields = ['contract_address', 'deployment_tx_hash', 'deployed_at']
    
    actions = ['deploy_contracts']
    
    def deploy_contracts(self, request, queryset):
        """選択されたトーナメントのコントラクトをバッチデプロイ"""
        for tournament in queryset.filter(contract_address__isnull=True):
            try:
                tournament.deploy_tournament_contract(deployer_user=request.user)
                self.message_user(request, f"Tournament {tournament.name} deployed successfully")
            except Exception as e:
                self.message_user(request, f"Failed to deploy {tournament.name}: {str(e)}", level='ERROR')
    
    deploy_contracts.short_description = "Deploy selected tournaments to blockchain"
```

これらのサンプルコードにより、Django APIからブロックチェーンデプロイを完全に統合できます。
