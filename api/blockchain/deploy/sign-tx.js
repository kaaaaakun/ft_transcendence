const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// .envファイルを読み込む関数
function loadEnv() {
    const envPath = path.join(__dirname, './.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
        return envVars;
    }
    return {};
}

async function main() {
    const env = loadEnv();
    const privateKey = env.PRIVATE_KEY;
    
    if (!privateKey || privateKey === 'dry-run') {
        console.error('エラー: .envファイルにPRIVATE_KEYが見つからないか、dry-runに設定されています');
        console.log('.envファイルに有効なプライベートキーを設定してください');
        return;
    }
    
    const contractAddress = env.BLOCKCHAIN_CONTRACT_ADDRESS;

    const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/6c1109f241ab4df28479c8335bfcd384');
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('ウォレットアドレス:', wallet.address);
    
    // コントラクトABI（storeMatchResult関数のみ）
    const abi = [
        "function storeMatchResult(string _matchId, string _matchTime, string _userId1, string _displayName1, string _score1, string _userId2, string _displayName2, string _score2)"
    ];
    
    const iface = new ethers.Interface(abi);
    const data = iface.encodeFunctionData("storeMatchResult", [
        "match_002",
        "1690000000",
        "user_id_01",
        "Alice",
        "10",
        "user_id_02",
        "Bob",
        "8"
    ]);
    
    // 現在のnonceを取得
    const nonce = await provider.getTransactionCount(wallet.address);
    console.log('現在のnonce:', nonce);
    
    // 現在のgas priceを取得
    const feeData = await provider.getFeeData();
    
    const tx = {
        to: contractAddress,
        data: data,
        gasLimit: 500000,
        gasPrice: feeData.gasPrice,
        nonce: nonce,
        chainId: 11155111 // Sepoliaテストネット
    };
    
    console.log('トランザクション詳細:', tx);
    
    const signedTx = await wallet.signTransaction(tx);
    console.log("署名済みトランザクション:", signedTx);
    
    console.log("\ncurlでトランザクションを送信するコマンド:");
    console.log(`curl -X POST https://sepolia.infura.io/v3/6c1109f241ab4df28479c8335bfcd384 \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_sendRawTransaction",
    "params": ["${signedTx}"],
    "id": 1
  }'`);
}

main().catch(console.error);
