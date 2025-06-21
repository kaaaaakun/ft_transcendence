# Django統合例
# ft_transcendence/api/conf/blockchain/

"""
DjangoからPythonブロックチェーンモジュールを使用する例

このファイルはDjangoプロジェクトでブロックチェーン機能を統合する方法を示しています。
"""

import json
import logging
from django.conf import settings
from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View

# ブロックチェーンモジュールをインポート
# 注意: blockchain/deploy/python パッケージがPythonパスに含まれている必要があります
try:
    from blockchain.deploy.python import blockchain_manager
    BLOCKCHAIN_AVAILABLE = True
except ImportError as e:
    logging.warning(f"ブロックチェーンモジュールの読み込みに失敗: {e}")
    BLOCKCHAIN_AVAILABLE = False

logger = logging.getLogger(__name__)

class BlockchainIntegrationMixin:
    """Djangoモデルでブロックチェーン統合を提供するMixin"""
    
    def sync_to_blockchain(self):
        """このインスタンスをブロックチェーンに同期"""
        if not BLOCKCHAIN_AVAILABLE:
            logger.warning("ブロックチェーンが利用できません")
            return False
            
        try:
            # サブクラスで実装する必要があります
            raise NotImplementedError("sync_to_blockchain メソッドを実装してください")
        except Exception as e:
            logger.error(f"ブロックチェーン同期に失敗: {e}")
            return False

# Djangoモデルの例
class Tournament(models.Model):
    """トーナメントモデル（例）"""
    name = models.CharField(max_length=200)
    max_players = models.IntegerField(default=8)
    entry_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    blockchain_address = models.CharField(max_length=42, blank=True, null=True)
    blockchain_synced = models.BooleanField(default=False)
    
    def sync_to_blockchain(self):
        """トーナメントをブロックチェーンに同期"""
        if not BLOCKCHAIN_AVAILABLE:
            return False
            
        try:
            tournament_data = {
                'name': self.name,
                'max_players': self.max_players,
                'entry_fee': int(self.entry_fee * 100)  # Wei変換の例
            }
            
            result = blockchain_manager.create_tournament_from_db(tournament_data)
            
            if result['success']:
                # ブロックチェーンのトランザクションからアドレスを取得
                # 実際の実装では、イベントログからトーナメントIDを取得する必要があります
                self.blockchain_synced = True
                self.save()
                return True
            else:
                logger.error(f"トーナメント同期に失敗: {result.get('error')}")
                return False
                
        except Exception as e:
            logger.error(f"トーナメント同期中にエラー: {e}")
            return False

class Match(models.Model):
    """マッチモデル（例）"""
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, null=True, blank=True)
    player1_address = models.CharField(max_length=42)
    player2_address = models.CharField(max_length=42)
    winner_address = models.CharField(max_length=42, blank=True, null=True)
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    blockchain_synced = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def sync_to_blockchain(self):
        """マッチをブロックチェーンに同期"""
        if not BLOCKCHAIN_AVAILABLE:
            return False
            
        try:
            match_data = {
                'player1_address': self.player1_address,
                'player2_address': self.player2_address,
                'tournament_id': 0  # 実際の実装では適切なIDを使用
            }
            
            result = blockchain_manager.create_match_from_db(match_data)
            
            if result['success']:
                self.blockchain_synced = True
                self.save()
                return True
            else:
                logger.error(f"マッチ同期に失敗: {result.get('error')}")
                return False
                
        except Exception as e:
            logger.error(f"マッチ同期中にエラー: {e}")
            return False
    
    def submit_result_to_blockchain(self):
        """マッチ結果をブロックチェーンに提出"""
        if not self.completed or not self.winner_address:
            return False
            
        if not BLOCKCHAIN_AVAILABLE:
            return False
            
        try:
            result = blockchain_manager.sync_match_result(
                self.id,  # マッチID
                self.winner_address,
                self.score1,
                self.score2
            )
            
            if result['success']:
                logger.info(f"マッチ {self.id} の結果をブロックチェーンに記録しました")
                return True
            else:
                logger.error(f"マッチ結果の記録に失敗: {result.get('error')}")
                return False
                
        except Exception as e:
            logger.error(f"マッチ結果記録中にエラー: {e}")
            return False

# Django View の例
@method_decorator(csrf_exempt, name='dispatch')
class BlockchainAPIView(View):
    """ブロックチェーン関連のAPIエンドポイント"""
    
    def post(self, request):
        """POST /api/blockchain/"""
        if not BLOCKCHAIN_AVAILABLE:
            return JsonResponse({
                'success': False,
                'error': 'ブロックチェーンサービスが利用できません'
            })
        
        try:
            data = json.loads(request.body)
            action = data.get('action')
            
            if action == 'deploy_contracts':
                return self.deploy_contracts(data)
            elif action == 'health_check':
                return self.health_check()
            elif action == 'get_stats':
                return self.get_stats()
            else:
                return JsonResponse({
                    'success': False,
                    'error': f'不明なアクション: {action}'
                })
                
        except Exception as e:
            logger.error(f"ブロックチェーンAPI エラー: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    def deploy_contracts(self, data):
        """コントラクトをデプロイ"""
        try:
            # データベースからの初期データを準備
            db_data = {
                'tournament_settings': {
                    'default_max_players': 8,
                    'default_entry_fee': 0
                },
                'match_settings': {
                    'default_match_duration': 3600
                }
            }
            
            result = blockchain_manager.deploy_all_contracts(db_data)
            
            return JsonResponse({
                'success': result['success'],
                'data': result
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    def health_check(self):
        """ヘルスチェック"""
        try:
            health = blockchain_manager.health_check()
            return JsonResponse({
                'success': True,
                'data': health
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    def get_stats(self):
        """統計情報を取得"""
        try:
            stats = blockchain_manager.get_blockchain_stats()
            return JsonResponse({
                'success': True,
                'data': stats
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })

# Django管理コマンドの例
# management/commands/deploy_blockchain.py
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    """ブロックチェーンコントラクトをデプロイするDjango管理コマンド"""
    help = 'ブロックチェーンにスマートコントラクトをデプロイします'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--contracts',
            nargs='+',
            default=['User', 'Tournament', 'Match'],
            help='デプロイするコントラクト名'
        )
        parser.add_argument(
            '--network',
            default='sepolia',
            help='デプロイ先ネットワーク'
        )
    
    def handle(self, *args, **options):
        if not BLOCKCHAIN_AVAILABLE:
            self.stdout.write(
                self.style.ERROR('ブロックチェーンモジュールが利用できません')
            )
            return
        
        try:
            self.stdout.write('🚀 コントラクトデプロイを開始します...')
            
            # データベースからの設定を取得
            db_data = self.get_db_settings()
            
            # 全コントラクトをデプロイ
            result = blockchain_manager.deploy_all_contracts(db_data)
            
            if result['success']:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ {result["total_deployed"]}個のコントラクトが正常にデプロイされました'
                    )
                )
                
                # デプロイされたアドレスを表示
                for name, address in result['deployed_contracts'].items():
                    self.stdout.write(f'📋 {name}: {address}')
                    
            else:
                self.stdout.write(
                    self.style.ERROR('❌ デプロイに失敗しました')
                )
                for name, res in result['results'].items():
                    if not res.get('success', True):
                        self.stdout.write(f'  - {name}: {res.get("error", "不明なエラー")}')
                        
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ デプロイ中にエラーが発生しました: {e}')
            )
    
    def get_db_settings(self):
        """データベースから設定を取得"""
        # 実際の実装では、Djangoの設定やモデルから値を取得
        return {
            'tournament_settings': {
                'default_max_players': 8,
                'default_entry_fee': 0
            },
            'match_settings': {
                'default_match_duration': 3600
            }
        }

# シグナルハンドラーの例
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Tournament)
def sync_tournament_to_blockchain(sender, instance, created, **kwargs):
    """トーナメント作成時に自動的にブロックチェーンに同期"""
    if created and BLOCKCHAIN_AVAILABLE:
        # 非同期でブロックチェーンに同期（推奨）
        # 実際の実装では、CeleryなどのタスクキューWebを使用することをお勧めします
        try:
            instance.sync_to_blockchain()
        except Exception as e:
            logger.error(f"トーナメント自動同期に失敗: {e}")

@receiver(post_save, sender=Match)
def sync_match_to_blockchain(sender, instance, created, **kwargs):
    """マッチ作成時に自動的にブロックチェーンに同期"""
    if created and BLOCKCHAIN_AVAILABLE:
        try:
            instance.sync_to_blockchain()
        except Exception as e:
            logger.error(f"マッチ自動同期に失敗: {e}")
    
    # マッチが完了した場合、結果をブロックチェーンに送信
    elif instance.completed and not created and BLOCKCHAIN_AVAILABLE:
        try:
            instance.submit_result_to_blockchain()
        except Exception as e:
            logger.error(f"マッチ結果自動送信に失敗: {e}")


# URLs設定の例 (urls.py)
"""
from django.urls import path
from .views import BlockchainAPIView

urlpatterns = [
    path('api/blockchain/', BlockchainAPIView.as_view(), name='blockchain-api'),
]
"""

# 設定例 (settings.py)
"""
# ブロックチェーン設定
BLOCKCHAIN_SETTINGS = {
    'NETWORK': 'sepolia',
    'AUTO_SYNC': True,  # 自動同期を有効にするか
    'RETRY_COUNT': 3,   # 失敗時のリトライ回数
    'TIMEOUT': 300,     # トランザクション待機時間（秒）
}
"""
