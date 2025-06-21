from web3 import Web3

# InfuraまたはAlchemyのエンドポイントURL
INFURA_URL = "https://sepolia.infura.io/v3/6c1109f241ab4df28479c8335bfcd384"  # 自分のプロジェクトIDに置き換えてください

# コントラクトのアドレスとABI
CONTRACT_ADDRESS = "0xc0E6bD0c26F33F3D9cd9AcA62F9eAbC87d9c82Ae"  # コントラクトアドレスに置き換えてください
CONTRACT_ABI = [
    {
        "constant": False,
        "inputs": [{"name": "_message", "type": "string"}],
        "name": "addMessage",
        "outputs": [],
        "type": "function",
    }
]

# ウォレットの秘密鍵とアドレス
PRIVATE_KEY = "xx"  # 実際の秘密鍵に置き換えてください
WALLET_ADDRESS = "xx"   # ウォレットのアドレス（秘密鍵に対応するアドレス）

# メッセージ
MESSAGE = "2024/11/12_18:01"  # 送信したいメッセージ

# Web3インスタンスの作成
web3 = Web3(Web3.HTTPProvider(INFURA_URL))
if not web3.is_connected():
    print("Ethereumネットワークに接続できません。")
    exit()

# コントラクトのインスタンスを作成
contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# nonce（トランザクションカウント）を取得
nonce = web3.eth.get_transaction_count(WALLET_ADDRESS)

# トランザクションの構築
transaction = contract.functions.addMessage(MESSAGE).build_transaction({
    'from': WALLET_ADDRESS,
    'nonce': nonce,
    'gas': 200000,
    'gasPrice': web3.eth.gas_price
})

# トランザクションに署名
signed_tx = web3.eth.account.sign_transaction(transaction, private_key=PRIVATE_KEY)

# トランザクションを送信
tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
print(f"トランザクションが送信されました。トランザクションハッシュ: {tx_hash.hex()}")

# トランザクションの確認待ち
receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

# レシートの情報を確認
if receipt["status"] == 1:
    print("トランザクションは成功しました")
else:
    print("トランザクションは失敗しました")

print("TransactionHash:", receipt["transactionHash"].hex())
print("ガス使用量:", receipt["gasUsed"])
print("ブロック番号:", receipt["blockNumber"])
print("イベントログ:", receipt["logs"])


