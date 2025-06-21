"""
デプロイ済みスマートコントラクトとのインターフェース機能
"""

import json
import time
from decimal import Decimal
from typing import Dict, List, Any, Optional, Union
from web3 import Web3
from web3.contract import Contract
from .config import config


class ContractInterface:
    """デプロイ済みスマートコントラクトとの相互作用を管理するクラス"""
    
    def __init__(self, contract_address: str, contract_name: str):
        self.w3 = Web3(Web3.HTTPProvider(config.RPC_URL))
        self.account = self.w3.eth.account.from_key(config.PRIVATE_KEY)
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.contract_name = contract_name
        
        # ネットワーク接続を確認
        if not self.w3.is_connected():
            raise ConnectionError(f"Ethereumネットワークに接続できません: {config.RPC_URL}")
        
        # コントラクトを読み込み
        self.contract = self._load_contract()
    
    def _load_contract(self) -> Contract:
        """ABIファイルからコントラクトインスタンスを作成"""
        abi_path = config.get_abi_path(self.contract_name)
        
        if not abi_path.exists():
            raise FileNotFoundError(f"コントラクト {self.contract_name} のABIファイルが見つかりません")
        
        with open(abi_path, 'r') as abi_file:
            abi_data = json.load(abi_file)
        
        return self.w3.eth.contract(
            address=self.contract_address,
            abi=abi_data['abi']
        )
    
    def call_function(self, function_name: str, *args, **kwargs) -> Any:
        """読み取り専用関数を呼び出し（トランザクション不要）"""
        try:
            function = getattr(self.contract.functions, function_name)
            result = function(*args).call()
            
            print(f"📖 {function_name}({args}) を呼び出しました -> {result}")
            return result
        
        except Exception as e:
            print(f"❌ 関数呼び出しに失敗しました: {function_name}({args}) - {str(e)}")
            raise
    
    def send_transaction(self, function_name: str, *args, **kwargs) -> Dict[str, Any]:
        """コントラクトの状態を変更するトランザクションを送信"""
        try:
            # トランザクションパラメータを抽出
            value = kwargs.pop('value', 0)  # 送信するETH
            gas_limit = kwargs.pop('gas_limit', config.GAS_LIMIT)
            
            print(f"🚀 トランザクションを送信中: {function_name}({args})")
            
            # 関数を取得
            function = getattr(self.contract.functions, function_name)
            
            # ガス価格を取得
            if config.GAS_PRICE == 'auto':
                gas_price = self.w3.eth.gas_price
            else:
                gas_price = self.w3.to_wei(config.GAS_PRICE, 'gwei')
            
            # トランザクションを構築
            transaction = function(*args).build_transaction({
                'from': self.account.address,
                'value': value,
                'gas': gas_limit,
                'gasPrice': gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
            })
            
            # トランザクションに署名して送信
            signed_txn = self.w3.eth.account.sign_transaction(transaction, config.PRIVATE_KEY)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            print(f"📝 トランザクションを送信しました: {tx_hash.hex()}")
            print("⏳ 確認を待機中...")
            
            # トランザクションレシートを待機
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
            
            if tx_receipt.status == 1:
                print(f"✅ ブロック {tx_receipt.blockNumber} でトランザクションが確認されました")
                
                # イベントがあれば解析
                events = self._parse_events(tx_receipt)
                
                return {
                    'success': True,
                    'transaction_hash': tx_hash.hex(),
                    'block_number': tx_receipt.blockNumber,
                    'gas_used': tx_receipt.gasUsed,
                    'events': events,
                    'function_name': function_name,
                    'args': args
                }
            else:
                raise Exception("Transaction failed")
        
        except Exception as e:
            print(f"❌ Transaction failed: {function_name}({args}) - {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'function_name': function_name,
                'args': args
            }
    
    def _parse_events(self, tx_receipt) -> List[Dict[str, Any]]:
        """Parse events from transaction receipt"""
        events = []
        
        try:
            # Get all events from the receipt
            rich_logs = self.contract.events.get_logs(fromBlock=tx_receipt.blockNumber, toBlock=tx_receipt.blockNumber)
            
            for log in rich_logs:
                if log.transactionHash == tx_receipt.transactionHash:
                    events.append({
                        'event': log.event,
                        'args': dict(log.args),
                        'block_number': log.blockNumber,
                        'transaction_hash': log.transactionHash.hex()
                    })
        
        except Exception as e:
            print(f"⚠️ Could not parse events: {str(e)}")
        
        return events
    
    def get_contract_info(self) -> Dict[str, Any]:
        """Get basic contract information"""
        return {
            'address': self.contract_address,
            'name': self.contract_name,
            'network': config.NETWORK,
            'functions': [f.function_identifier for f in self.contract.all_functions()],
            'events': [e.event_name for e in self.contract.events]
        }
    
    def estimate_gas(self, function_name: str, *args, **kwargs) -> int:
        """Estimate gas for a function call"""
        try:
            function = getattr(self.contract.functions, function_name)
            
            # Build transaction for estimation
            transaction = function(*args).build_transaction({
                'from': self.account.address,
                'value': kwargs.get('value', 0)
            })
            
            estimated_gas = self.w3.eth.estimate_gas(transaction)
            print(f"⛽ Estimated gas for {function_name}: {estimated_gas}")
            
            return estimated_gas
        
        except Exception as e:
            print(f"❌ Gas estimation failed: {str(e)}")
            return config.GAS_LIMIT
    
    def get_balance(self, address: Optional[str] = None) -> Decimal:
        """Get ETH balance of an address"""
        if address is None:
            address = self.account.address
        
        address = Web3.to_checksum_address(address)
        balance_wei = self.w3.eth.get_balance(address)
        balance_eth = self.w3.from_wei(balance_wei, 'ether')
        
        return Decimal(str(balance_eth))
    
    def wait_for_confirmation(self, tx_hash: str, timeout: int = 300) -> Dict[str, Any]:
        """Wait for transaction confirmation"""
        try:
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=timeout)
            
            return {
                'confirmed': tx_receipt.status == 1,
                'block_number': tx_receipt.blockNumber,
                'gas_used': tx_receipt.gasUsed,
                'transaction_hash': tx_hash
            }
        
        except Exception as e:
            return {
                'confirmed': False,
                'error': str(e),
                'transaction_hash': tx_hash
            }


class TournamentContract(ContractInterface):
    """Specialized interface for Tournament smart contract"""
    
    def create_tournament(self, name: str, max_participants: int, entry_fee: int = 0) -> Dict[str, Any]:
        """Create a new tournament"""
        return self.send_transaction('createTournament', name, max_participants, value=entry_fee)
    
    def join_tournament(self, tournament_id: int, entry_fee: int = 0) -> Dict[str, Any]:
        """Join a tournament"""
        return self.send_transaction('joinTournament', tournament_id, value=entry_fee)
    
    def start_tournament(self, tournament_id: int) -> Dict[str, Any]:
        """Start a tournament"""
        return self.send_transaction('startTournament', tournament_id)
    
    def record_match_result(self, tournament_id: int, match_id: int, winner: str) -> Dict[str, Any]:
        """Record match result"""
        return self.send_transaction('recordMatchResult', tournament_id, match_id, winner)
    
    def get_tournament(self, tournament_id: int) -> Dict[str, Any]:
        """Get tournament details"""
        return self.call_function('getTournament', tournament_id)
    
    def get_tournament_participants(self, tournament_id: int) -> List[str]:
        """Get tournament participants"""
        return self.call_function('getTournamentParticipants', tournament_id)
    
    def get_user_tournaments(self, user_address: str) -> List[int]:
        """Get tournaments for a user"""
        return self.call_function('getUserTournaments', user_address)


class MatchContract(ContractInterface):
    """Specialized interface for Match smart contract"""
    
    def create_match(self, player1: str, player2: str, tournament_id: int = 0) -> Dict[str, Any]:
        """Create a new match"""
        return self.send_transaction('createMatch', player1, player2, tournament_id)
    
    def record_score(self, match_id: int, player1_score: int, player2_score: int) -> Dict[str, Any]:
        """Record match score"""
        return self.send_transaction('recordScore', match_id, player1_score, player2_score)
    
    def finalize_match(self, match_id: int) -> Dict[str, Any]:
        """Finalize a match"""
        return self.send_transaction('finalizeMatch', match_id)
    
    def get_match(self, match_id: int) -> Dict[str, Any]:
        """Get match details"""
        return self.call_function('getMatch', match_id)
    
    def get_player_matches(self, player_address: str) -> List[int]:
        """Get matches for a player"""
        return self.call_function('getPlayerMatches', player_address)
    
    def get_match_history(self, player_address: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get match history for a player"""
        match_ids = self.get_player_matches(player_address)
        
        # Get recent matches
        recent_match_ids = match_ids[-limit:] if len(match_ids) > limit else match_ids
        
        matches = []
        for match_id in recent_match_ids:
            match_data = self.get_match(match_id)
            matches.append(match_data)
        
        return matches
