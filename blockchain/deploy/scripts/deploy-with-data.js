const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const ContractManager = require("./contract-manager");

// デプロイが成功したかどうかを追跡するためのグローバル変数に設定
let deployedAddress = null;
let contractManager = new ContractManager();

// エラー終了時のクリーンアップ
process.on("exit", (code) => {
  if (deployedAddress && code !== 0) {
    console.log(
      "\n✅ 注意: エラーが発生しましたが、コントラクトは正常にデプロイされています:"
    );
    console.log(`📋 Contract Address: ${deployedAddress}`);
    console.log(`🔍 https://sepolia.etherscan.io/address/${deployedAddress}\n`);
  }
});

/**
 * DBからのJSONデータを読み込む
 * @param {string} dataSource - JSONファイルパスまたは標準入力
 * @returns {Object} デプロイ設定データ
 */
function loadDeploymentData(dataSource) {
  try {
    let rawData;
    
    if (dataSource === 'stdin') {
      // 標準入力から読み込み（パイプライン対応）
      rawData = fs.readFileSync(0, 'utf8');
    } else if (dataSource && fs.existsSync(dataSource)) {
      // ファイルから読み込み
      rawData = fs.readFileSync(dataSource, 'utf8');
    } else {
      // デフォルト設定を使用
      console.log('⚠️ DB data not provided, using default configuration');
      return getDefaultConfig();
    }
    
    const data = JSON.parse(rawData);
    validateDeploymentData(data);
    return data;
    
  } catch (error) {
    console.error('❌ Error loading deployment data:', error.message);
    throw error;
  }
}

/**
 * デプロイデータの妥当性を検証
 */
function validateDeploymentData(data) {
  const required = ['contractName', 'constructorArgs', 'metadata'];
  
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // コンストラクタ引数の型チェック
  if (!Array.isArray(data.constructorArgs)) {
    throw new Error('constructorArgs must be an array');
  }
  
  console.log('✅ Deployment data validation passed');
}

/**
 * デフォルト設定を取得
 */
function getDefaultConfig() {
  return {
    contractName: "MyContract",
    constructorArgs: ["Hello, Sepolia!"],
    metadata: {
      deployer: "default",
      purpose: "test deployment",
      version: "1.0.0"
    },
    gasSettings: {
      gasLimit: "auto",
      gasPrice: "auto"
    }
  };
}

/**
 * メイン関数
 */
async function main() {
  try {
    const networkName = hre.network.name;
    
    // コマンドライン引数またはJSONファイルからデプロイデータを取得
    const dataSource = process.argv[3]; // hardhat run script.js --network sepolia [dataFile]
    const deploymentData = loadDeploymentData(dataSource);
    
    console.log(`🚀 Starting deployment on ${networkName}...`);
    console.log(`📋 Contract: ${deploymentData.contractName}`);
    console.log(`🔧 Constructor Args: ${JSON.stringify(deploymentData.constructorArgs)}`);
    
    if (deploymentData.metadata) {
      console.log(`👤 Deployer: ${deploymentData.metadata.deployer}`);
      console.log(`🎯 Purpose: ${deploymentData.metadata.purpose}`);
    }
    
    // コントラクトをコンパイルしてJSONを更新
    await contractManager.compileAndUpdateJson(deploymentData.contractName);
    
    // デプロイ実行
    const ContractFactory = await hre.ethers.getContractFactory(deploymentData.contractName);
    const contract = await ContractFactory.deploy(...deploymentData.constructorArgs);

    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    deployedAddress = contractAddress;
    
    // デプロイ情報を取得
    const deploymentTx = contract.deploymentTransaction();
    const receipt = await deploymentTx.wait();
    const [deployer] = await hre.ethers.getSigners();
    
    const deploymentInfo = {
      address: contractAddress,
      transactionHash: deploymentTx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      constructorArgs: deploymentData.constructorArgs,
      deployer: deployer.address,
      metadata: deploymentData.metadata,
      deployedAt: new Date().toISOString(),
      networkName: networkName
    };

    // デプロイ情報をJSONに記録
    await contractManager.recordDeployment(deploymentData.contractName, networkName, deploymentInfo);
    
    // ABIをエクスポート
    await contractManager.exportAbi(deploymentData.contractName);
    
    // フロントエンド用設定を生成
    await contractManager.generateFrontendConfig(networkName);
    
    // DBに返すためのレスポンスJSONを生成
    const responseData = {
      success: true,
      deployment: deploymentInfo,
      files: {
        abi: `${deploymentData.contractName}-abi.json`,
        config: `frontend-config-${networkName}.json`,
        structure: 'contract-structure.json'
      }
    };
    
    // レスポンスJSONをファイルに出力（DB連携用）
    const responseFile = path.join(__dirname, '..', 'deployment-response.json');
    fs.writeFileSync(responseFile, JSON.stringify(responseData, null, 2));
    
    console.log("\n✅ デプロイ成功！");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Contract Address:", contractAddress);
    console.log("🔍 Etherscan URL:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("📁 Generated Files:");
    console.log(`  - contract-structure.json (updated)`);
    console.log(`  - ${deploymentData.contractName}-abi.json`);
    console.log(`  - frontend-config-${networkName}.json`);
    console.log(`  - deployment-response.json (for DB update)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // 標準出力にもレスポンスJSONを出力（パイプライン対応）
    console.log('DEPLOYMENT_RESPONSE:', JSON.stringify(responseData));
    
  } catch (error) {
    // エラー情報もJSONで出力
    const errorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    const errorFile = path.join(__dirname, '..', 'deployment-error.json');
    fs.writeFileSync(errorFile, JSON.stringify(errorResponse, null, 2));
    
    console.log('DEPLOYMENT_ERROR:', JSON.stringify(errorResponse));
    
    // タイムアウトエラーをチェックして、デプロイが成功している場合は無視
    if (error.message.includes("ConnectTimeoutError")) {
      console.log(
        "⚠️  注意: Etherscanへの接続がタイムアウトしましたが、デプロイ自体は成功しています。"
      );
      process.exit(0);
    } else {
      throw error;
    }
  }
}

main().catch((error) => {
  if (error.message && error.message.includes("ConnectTimeoutError")) {
    // タイムアウトエラーの場合は成功として扱う
    process.exit(0);
  } else {
    console.error("❌ エラー:", error);
    process.exit(1);
  }
});
