"""
ブロックチェーンマネージャーの設定
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# 環境変数を読み込み
load_dotenv()

class BlockchainConfig:
    def __init__(self):
        # ネットワーク設定
        self.NETWORK = os.getenv('ETHEREUM_NETWORK', 'sepolia')
        self.RPC_URL = os.getenv('SEPOLIA_RPC_URL')
        self.PRIVATE_KEY = os.getenv('PRIVATE_KEY')
        
        # ファイルパス
        self.BASE_DIR = Path(__file__).parent.parent
        self.CONTRACTS_DIR = self.BASE_DIR / 'contracts'
        self.ABI_DIR = self.BASE_DIR / 'abi'
        
        # ガス設定
        self.GAS_LIMIT = int(os.getenv('GAS_LIMIT', '3000000'))
        self.GAS_PRICE = os.getenv('GAS_PRICE', 'auto')
        
        # 設定検証
        self._validate_config()
    
    def _validate_config(self):
        """設定を検証"""
        if not self.RPC_URL:
            raise ValueError(".envファイルにSEPOLIA_RPC_URLが必要です")
        
        if not self.PRIVATE_KEY:
            raise ValueError(".envファイルにPRIVATE_KEYが必要です")
        
        # ディレクトリが存在しない場合は作成
        self.ABI_DIR.mkdir(exist_ok=True)
    
    def get_contract_path(self, contract_name):
        """コントラクトファイルのパスを取得"""
        return self.CONTRACTS_DIR / f"{contract_name}.sol"
    
    def get_abi_path(self, contract_name):
        """ABIファイルのパスを取得"""
        return self.ABI_DIR / f"{contract_name}.json"

# グローバル設定インスタンス
config = BlockchainConfig()
