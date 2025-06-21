#!/usr/bin/env python3
"""
ブロックチェーンシステムのテストスクリプト
PythonからWeb3.pyを使用した直接アクセスをテスト
"""

import sys
import os
from pathlib import Path

# プロジェクトパスを追加
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_import():
    """モジュールのインポートをテスト"""
    print("📦 モジュールインポートテスト...")
    
    try:
        from python import blockchain_manager, config
        print("✅ ブロックチェーンモジュールのインポートが成功しました")
        return True
    except ImportError as e:
        print(f"❌ インポートエラー: {e}")
        return False

def test_configuration():
    """設定のテスト"""
    print("\n⚙️ 設定テスト...")
    
    try:
        from python import config
        
        print(f"ネットワーク: {config.NETWORK}")
        print(f"RPC URL: {config.RPC_URL[:50]}..." if config.RPC_URL else "RPC URL: 未設定")
        print(f"秘密鍵: {'設定済み' if config.PRIVATE_KEY else '未設定'}")
        
        if not config.RPC_URL:
            print("⚠️ .envファイルにSEPOLIA_RPC_URLを設定してください")
            return False
            
        if not config.PRIVATE_KEY:
            print("⚠️ .envファイルにPRIVATE_KEYを設定してください")
            return False
            
        print("✅ 設定が正常です")
        return True
        
    except Exception as e:
        print(f"❌ 設定エラー: {e}")
        return False

def test_network_connection():
    """ネットワーク接続をテスト"""
    print("\n🌐 ネットワーク接続テスト...")
    
    try:
        from python import blockchain_manager
        
        health = blockchain_manager.health_check()
        
        if health['network_connected']:
            print("✅ ネットワークに接続されています")
            print(f"最新ブロック: {health['latest_block']}")
            print(f"アカウント残高: {health['account_balance']:.6f} ETH")
            return True
        else:
            print("❌ ネットワークに接続できません")
            return False
            
    except Exception as e:
        print(f"❌ 接続エラー: {e}")
        return False

def test_contract_compilation():
    """コントラクトコンパイルをテスト"""
    print("\n🔨 コントラクトコンパイルテスト...")
    
    try:
        from python.contract_deployer import ContractDeployer
        
        deployer = ContractDeployer()
        
        # テスト用の簡単なコントラクトファイルが存在するかチェック
        contracts_dir = Path(__file__).parent / 'contracts'
        if not contracts_dir.exists():
            print("⚠️ contractsディレクトリが見つかりません")
            return False
        
        contract_files = list(contracts_dir.glob('*.sol'))
        if not contract_files:
            print("⚠️ Solidityファイルが見つかりません")
            return False
        
        # 最初のコントラクトファイルでテスト
        test_contract = contract_files[0].stem
        print(f"テストコントラクト: {test_contract}")
        
        try:
            interface = deployer.compile_contract(test_contract)
            print("✅ コントラクトのコンパイルが成功しました")
            return True
        except Exception as e:
            print(f"❌ コンパイルエラー: {e}")
            return False
            
    except Exception as e:
        print(f"❌ コンパイルテストエラー: {e}")
        return False

def test_gas_price():
    """ガス価格の取得をテスト"""
    print("\n⛽ ガス価格テスト...")
    
    try:
        from python.contract_deployer import ContractDeployer
        
        deployer = ContractDeployer()
        gas_price = deployer.w3.eth.gas_price
        gas_price_gwei = deployer.w3.from_wei(gas_price, 'gwei')
        
        print(f"現在のガス価格: {gas_price_gwei:.2f} Gwei")
        print("✅ ガス価格の取得が成功しました")
        return True
        
    except Exception as e:
        print(f"❌ ガス価格取得エラー: {e}")
        return False

def create_env_file():
    """サンプル.envファイルを作成"""
    print("\n📝 サンプル.envファイルを作成中...")
    
    env_content = """# Ethereum Network Configuration
ETHEREUM_NETWORK=sepolia

# RPC Endpoint (Infura, Alchemy, etc.)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Private Key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Gas Configuration
GAS_PRICE=auto
GAS_LIMIT=3000000
"""
    
    env_file = Path(__file__).parent / '.env.sample'
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print(f"✅ サンプル.envファイルを作成しました: {env_file}")
    print("💡 .env.sampleを.envにコピーして設定を編集してください")

def main():
    """メインテスト関数"""
    print("🚀 ft_transcendence ブロックチェーンシステムテスト")
    print("=" * 60)
    
    tests = [
        ("モジュールインポート", test_import),
        ("設定", test_configuration),
        ("ネットワーク接続", test_network_connection),
        ("ガス価格取得", test_gas_price),
        ("コントラクトコンパイル", test_contract_compilation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name}テスト中に予期しないエラー: {e}")
    
    print(f"\n📊 テスト結果: {passed}/{total} 成功")
    
    if passed < total:
        print("\n💡 問題解決のヒント:")
        print("1. .envファイルが正しく設定されているか確認してください")
        print("2. 必要なPythonパッケージがインストールされているか確認してください:")
        print("   pip install -r requirements.txt")
        print("3. インターネット接続とRPCエンドポイントを確認してください")
        
        # サンプル.envファイルを作成
        create_env_file()
    else:
        print("🎉 全てのテストが成功しました！")
        print("システムはブロックチェーンにアクセスする準備ができています。")

if __name__ == "__main__":
    main()
