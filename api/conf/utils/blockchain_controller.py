import json
import os
from web3 import Web3
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
        private_key = getattr(settings, 'BLOCKCHAIN_PRIVATE_KEY', None)
        contract_address = getattr(settings, 'BLOCKCHAIN_CONTRACT_ADDRESS', None)

        # Web3初期化
        cls._w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        # POAミドルウェアを追加（新しいバージョンのweb3.py用）
        try:
            from web3.middleware import ExtraDataToPOAMiddleware
            cls._w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
        except ImportError:
            # 古いバージョンの場合は何もしない
            pass
        
        # プライベートキーの設定
        cls._private_key = private_key
        
        # アカウント設定
        if cls._private_key:
            cls._account = cls._w3.eth.account.from_key(private_key)
        
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

            # まず現在のディレクトリから探す
            abi_path = 'MyContract.json'
            if os.path.exists(abi_path):
                with open(abi_path, 'r') as file:
                    return json.load(file)['abi']
            
            # 次にblockchainディレクトリから探す
            abi_path = os.path.join(
                settings.BASE_DIR,
                'blockchain/deploy/artifacts/contracts/MyContract.sol/MyContract.json'
            )
            if os.path.exists(abi_path):
                with open(abi_path, 'r') as file:
                    return json.load(file)['abi']
            
            print(f"ABIファイルが見つかりません: {abi_path}")
            return None
        except Exception as e:
            print(f"ABI読み込みエラー: {e}")
            return None
    
    @classmethod
    def store_match_result(cls, match_id, match_time, user_id1, display_name1, score1, user_id2, display_name2, score2):
        """試合結果を保存（string型対応版）"""
        
        # dry-runモードのチェック
        if getattr(settings, 'BLOCKCHAIN_PRIVATE_KEY', None) == 'dry-run':
            print("dry-runモードのため、試合結果は保存されません。")
            return {'success': False, 'error': 'dry-runモードでは保存できません'}

        cls._initialize()
        if not cls._contract or not cls._account:
            return {'success': False, 'error': 'ブロックチェーン接続エラー'}
        
        try:
            # 全パラメータをstring型として渡す
            transaction = cls._contract.functions.storeMatchResult(
                str(match_id),
                str(match_time),
                str(user_id1),
                str(display_name1),
                str(score1),
                str(user_id2),
                str(display_name2),
                str(score2)
            ).build_transaction({
                'from': cls._account.address,
                'gas': 500000,
                'gasPrice': cls._w3.eth.gas_price,
                'nonce': cls._w3.eth.get_transaction_count(cls._account.address),
            })
            
            signed_txn = cls._w3.eth.account.sign_transaction(transaction, cls._private_key)
            # 新しいWeb3.pyバージョンでは raw_transaction を使用
            raw_tx = getattr(signed_txn, 'raw_transaction', getattr(signed_txn, 'rawTransaction', None))
            tx_hash = cls._w3.eth.send_raw_transaction(raw_tx)
            tx_receipt = cls._w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {'success': True, 'tx_hash': tx_hash.hex()}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def get_match_result(cls, match_id):
        """試合結果を取得（string型対応版）"""
        cls._initialize()
        if not cls._contract:
            return None

        try:
            result = cls._contract.functions.getMatchResult(str(match_id)).call()
            # 8つの戻り値に対応
            return {
                'match_id': result[0],
                'match_time': result[1],
                'user_id1': result[2],
                'display_name1': result[3],
                'score1': result[4],
                'user_id2': result[5],
                'display_name2': result[6],
                'score2': result[7]
            }
        except Exception as e:
            print(f"取得エラー: {e}")
            return None
