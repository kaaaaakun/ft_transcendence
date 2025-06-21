"""
ft_transcendenceプロジェクトのブロックチェーンモジュール
Web3.pyを使用してEthereumスマートコントラクトに直接アクセス
"""

from .config import config, BlockchainConfig
from .contract_deployer import ContractDeployer
from .contract_interface import ContractInterface, TournamentContract, MatchContract
from .blockchain_manager import (
    BlockchainManager, 
    blockchain_manager,
    deploy_tournament_system,
    create_tournament,
    create_match,
    record_match_result,
    get_user_stats
)

__version__ = "1.0.0"
__all__ = [
    # Configuration
    'config',
    'BlockchainConfig',
    
    # Core classes
    'ContractDeployer',
    'ContractInterface',
    'TournamentContract',
    'MatchContract',
    'BlockchainManager',
    
    # Manager instance
    'blockchain_manager',
    
    # Convenience functions
    'deploy_tournament_system',
    'create_tournament',
    'create_match',
    'record_match_result',
    'get_user_stats'
]
