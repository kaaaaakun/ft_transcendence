"""
Web3.pyを使用したスマートコントラクトデプロイ機能
"""

import json
import time
from pathlib import Path
from solcx import compile_source, install_solc, set_solc_version
from web3 import Web3
from .config import config

class ContractDeployer:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(config.RPC_URL))
        self.account = self.w3.eth.account.from_key(config.PRIVATE_KEY)
        
        # ネットワーク接続を確認
        if not self.w3.is_connected():
            raise ConnectionError(f"Ethereumネットワークに接続できません: {config.RPC_URL}")
    
    def compile_contract(self, contract_name):
        """Solidityコントラクトをコンパイルし、ABIを保存"""
        try:
            # Solidityコンパイラーのバージョンをインストール・設定
            install_solc('0.8.20')
            set_solc_version('0.8.20')
            
            # コントラクトソースを読み込み
            contract_path = config.get_contract_path(contract_name)
            with open(contract_path, 'r') as file:
                contract_source = file.read()
            
            # コントラクトをコンパイル
            compiled_sol = compile_source(contract_source)
            
            # コントラクトインターフェースを取得
            contract_id = f"<stdin>:{contract_name}"
            contract_interface = compiled_sol[contract_id]
            
            # ABIをファイルに保存
            abi_path = config.get_abi_path(contract_name)
            abi_data = {
                'abi': contract_interface['abi'],
                'bytecode': contract_interface['bin'],
                'contract_name': contract_name,
                'compiled_at': time.time()
            }
            
            with open(abi_path, 'w') as abi_file:
                json.dump(abi_data, abi_file, indent=2)
            
            print(f"✅ コントラクト {contract_name} のコンパイルが完了しました")
            return contract_interface
            
        except Exception as e:
            print(f"❌ コントラクトのコンパイルに失敗しました: {str(e)}")
            raise
    
    def load_contract_interface(self, contract_name):
        """ABIファイルからコンパイル済みコントラクトインターフェースを読み込み"""
        abi_path = config.get_abi_path(contract_name)
        
        if not abi_path.exists():
            print(f"ABIファイルが見つかりません。{contract_name}をコンパイルしています...")
            return self.compile_contract(contract_name)
        
        with open(abi_path, 'r') as abi_file:
            abi_data = json.load(abi_file)
        
        return {
            'abi': abi_data['abi'],
            'bin': abi_data['bytecode']
        }
    
    def deploy_contract(self, contract_name, constructor_args=None, metadata=None):
        """スマートコントラクトをブロックチェーンにデプロイ"""
        try:
            print(f"🚀 {contract_name}のデプロイを開始します...")
            
            # コントラクトインターフェースを読み込み
            contract_interface = self.load_contract_interface(contract_name)
            
            # コントラクトインスタンスを作成
            contract = self.w3.eth.contract(
                abi=contract_interface['abi'],
                bytecode=contract_interface['bin']
            )
            
            # コンストラクタ引数を準備
            constructor_args = constructor_args or []
            
            # ガス価格を取得
            if config.GAS_PRICE == 'auto':
                gas_price = self.w3.eth.gas_price
            else:
                gas_price = self.w3.to_wei(config.GAS_PRICE, 'gwei')
            
            # トランザクションを構築
            transaction = contract.constructor(*constructor_args).build_transaction({
                'from': self.account.address,
                'gas': config.GAS_LIMIT,
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
                contract_address = tx_receipt.contractAddress
                
                print(f"✅ コントラクトのデプロイが完了しました！")
                print(f"📋 コントラクトアドレス: {contract_address}")
                print(f"🔍 Etherscan URL: https://sepolia.etherscan.io/address/{contract_address}")
                
                return {
                    'success': True,
                    'contract_address': contract_address,
                    'transaction_hash': tx_hash.hex(),
                    'gas_used': tx_receipt.gasUsed,
                    'block_number': tx_receipt.blockNumber,
                    'deployer': self.account.address,
                    'constructor_args': constructor_args,
                    'metadata': metadata or {}
                }
            else:
                raise Exception("トランザクションが失敗しました")
                
        except Exception as e:
            print(f"❌ デプロイに失敗しました: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'deployer': self.account.address
            }
