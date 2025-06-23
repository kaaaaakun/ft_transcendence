import json
import os
from web3 import Web3
from web3.middleware import geth_poa_middleware
from django.conf import settings


class BlockchainController:
    """
    MyContractスマートコントラクトとやり取りするスタティッククラス
    インスタンス化不要で使用可能
    """
    
    _w3 = None
    _contract = None
    _account = None
    _private_key = None
    
    @classmethod
    def _initialize(cls):
        """初期化処理（初回呼び出し時のみ実行）"""
        if cls._w3 is not None:
            return  # 既に初期化済み
        
        # 設定読み込み
        rpc_url = getattr(settings, 'BLOCKCHAIN_RPC_URL', 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID')
        cls._private_key = getattr(settings, 'BLOCKCHAIN_PRIVATE_KEY', None)
        contract_address = getattr(settings, 'BLOCKCHAIN_CONTRACT_ADDRESS', None)
        
        # Web3初期化
        cls._w3 = Web3(Web3.HTTPProvider(rpc_url))
        cls._w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # アカウント設定
        if cls._private_key:
            cls._account = cls._w3.eth.account.from_key(cls._private_key)
        
        # ABI読み込み
        contract_abi = cls._load_abi()
        
        # コントラクト初期化
        if contract_address and contract_abi:
            cls._contract = cls._w3.eth.contract(
                address=contract_address,
                abi=contract_abi
            )
    
    @staticmethod
    def _load_abi():
        """ABIファイルを読み込む"""
        try:
            abi_path = os.path.join(
                settings.BASE_DIR,
                'blockchain/deploy/artifacts/contracts/MyContract.sol/MyContract.json'
            )
            with open(abi_path, 'r') as file:
                return json.load(file)['abi']
        except Exception as e:
            print(f"ABI読み込みエラー: {e}")
            return None
    
    @classmethod
    def store_match_result(cls, match_id, match_time, user_id1, score1, user_id2, score2):
        """試合結果を保存"""
        cls._initialize()
        
        if not cls._contract or not cls._account:
            return {'success': False, 'error': 'ブロックチェーン接続エラー'}
        
        try:
            transaction = cls._contract.functions.storeMatchResult(
                match_id, match_time, user_id1, score1, user_id2, score2
            ).build_transaction({
                'from': cls._account.address,
                'gas': 200000,
                'gasPrice': cls._w3.eth.gas_price,
                'nonce': cls._w3.eth.get_transaction_count(cls._account.address),
            })
            
            signed_txn = cls._w3.eth.account.sign_transaction(transaction, cls._private_key)
            tx_hash = cls._w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            tx_receipt = cls._w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {'success': True, 'tx_hash': tx_hash.hex()}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def get_match_result(cls, match_id):
        """試合結果を取得"""
        cls._initialize()
        
        if not cls._contract:
            return None
        
        try:
            result = cls._contract.functions.getMatchResult(match_id).call()
            return {
                'match_id': result[0],
                'match_time': result[1],
                'user_id1': result[2],
                'score1': result[3],
                'user_id2': result[4],
                'score2': result[5]
            }
        except Exception as e:
            print(f"取得エラー: {e}")
            return None
    