#!/usr/bin/env node

/**
 * JSON形式でのコントラクト管理のデモスクリプト
 */

const ContractManager = require('./contract-manager');
const ContractValidator = require('./contract-validator');

async function demo() {
  console.log('🚀 JSON形式コントラクト管理デモ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const manager = new ContractManager();
  const validator = new ContractValidator();

  try {
    // 1. JSON設定の検証
    console.log('1️⃣ JSON設定の検証');
    const isValid = validator.validateConfig();
    if (!isValid) {
      throw new Error('Invalid configuration');
    }
    console.log('');

    // 2. コントラクト情報の表示
    console.log('2️⃣ コントラクト情報の表示');
    validator.displayContractInfo();

    // 3. ABI エクスポートのシミュレーション
    console.log('3️⃣ ABI エクスポート');
    try {
      manager.exportAbi('MyContract');
    } catch (error) {
      console.log('   ⚠️ ABI未生成（コンパイル後に利用可能）');
    }
    console.log('');

    // 4. デプロイ情報の確認
    console.log('4️⃣ デプロイ情報の確認');
    const sepoliaDeployment = manager.getDeploymentInfo('sepolia');
    if (sepoliaDeployment) {
      console.log(`   ✅ Sepolia deployment found: ${sepoliaDeployment.address}`);
    } else {
      console.log('   ℹ️ Sepoliaデプロイ情報なし（デプロイ後に利用可能）');
    }
    console.log('');

    // 5. Solidityコード生成のデモ
    console.log('5️⃣ Solidityコード生成（JSON設定から）');
    validator.generateSolidityFromJson();
    console.log('');

    console.log('✅ デモ完了！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💡 使用可能なコマンド:');
    console.log('   npm run contract:info       - コントラクト情報表示');
    console.log('   npm run contract:validate   - JSON設定検証');
    console.log('   npm run contract:generate   - Solidityコード生成');
    console.log('   npm run deploy              - デプロイ実行');
    console.log('');

  } catch (error) {
    console.error('❌ デモエラー:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  demo();
}

module.exports = demo;
