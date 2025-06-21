const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

class ContractManager {
  constructor() {
    this.contractsDir = path.join(__dirname, 'contracts');
    this.artifactsDir = path.join(__dirname, 'artifacts');
    this.deploymentsDir = path.join(__dirname, 'deployments');
    this.configFile = path.join(__dirname, 'contract-structure.json');
  }

  /**
   * コントラクトをコンパイルしてJSONファイルを更新
   */
  async compileAndUpdateJson(contractName) {
    try {
      console.log(`📦 Compiling ${contractName}...`);
      await hre.run('compile');

      const artifactPath = path.join(this.artifactsDir, 'contracts', `${contractName}.sol`, `${contractName}.json`);
      
      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Artifact not found: ${artifactPath}`);
      }

      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      
      // 既存の設定ファイルを読み込み
      let contractConfig = {};
      if (fs.existsSync(this.configFile)) {
        contractConfig = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      }

      // ABIとバイトコードを更新
      contractConfig.abi = artifact.abi;
      contractConfig.bytecode = {
        object: artifact.bytecode,
        sourceMap: artifact.deployedBytecode?.sourceMap || ''
      };
      contractConfig.metadata.updated = new Date().toISOString();

      // ファイルに保存
      fs.writeFileSync(this.configFile, JSON.stringify(contractConfig, null, 2));
      
      console.log(`✅ Updated contract configuration: ${this.configFile}`);
      return contractConfig;
    } catch (error) {
      console.error('❌ Error compiling contract:', error);
      throw error;
    }
  }

  /**
   * デプロイ情報をJSONに記録
   */
  async recordDeployment(contractName, networkName, deploymentInfo) {
    try {
      const configPath = this.configFile;
      let contractConfig = {};
      
      if (fs.existsSync(configPath)) {
        contractConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }

      if (!contractConfig.deployment) {
        contractConfig.deployment = { networks: {} };
      }

      contractConfig.deployment.networks[networkName] = {
        address: deploymentInfo.address,
        transactionHash: deploymentInfo.transactionHash,
        blockNumber: deploymentInfo.blockNumber,
        gasUsed: deploymentInfo.gasUsed,
        constructorArgs: deploymentInfo.constructorArgs,
        deployedAt: new Date().toISOString(),
        deployer: deploymentInfo.deployer
      };

      fs.writeFileSync(configPath, JSON.stringify(contractConfig, null, 2));
      
      console.log(`📝 Recorded deployment for ${contractName} on ${networkName}`);
      console.log(`📍 Address: ${deploymentInfo.address}`);
      
      return contractConfig;
    } catch (error) {
      console.error('❌ Error recording deployment:', error);
      throw error;
    }
  }

  /**
   * デプロイ済みコントラクトの情報を取得
   */
  getDeploymentInfo(networkName) {
    try {
      if (!fs.existsSync(this.configFile)) {
        return null;
      }

      const contractConfig = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      return contractConfig.deployment?.networks?.[networkName] || null;
    } catch (error) {
      console.error('❌ Error reading deployment info:', error);
      return null;
    }
  }

  /**
   * ABIファイルを別途エクスポート
   */
  exportAbi(contractName) {
    try {
      const contractConfig = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      
      if (!contractConfig.abi) {
        throw new Error('ABI not found in contract configuration');
      }

      const abiPath = path.join(__dirname, `${contractName}-abi.json`);
      fs.writeFileSync(abiPath, JSON.stringify(contractConfig.abi, null, 2));
      
      console.log(`📄 Exported ABI to: ${abiPath}`);
      return abiPath;
    } catch (error) {
      console.error('❌ Error exporting ABI:', error);
      throw error;
    }
  }

  /**
   * フロントエンド用の設定ファイルを生成
   */
  generateFrontendConfig(networkName) {
    try {
      const contractConfig = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      const deploymentInfo = this.getDeploymentInfo(networkName);

      if (!deploymentInfo) {
        throw new Error(`No deployment found for network: ${networkName}`);
      }

      const frontendConfig = {
        contractName: contractConfig.metadata.name,
        address: deploymentInfo.address,
        abi: contractConfig.abi,
        network: networkName,
        deployedAt: deploymentInfo.deployedAt
      };

      const frontendConfigPath = path.join(__dirname, `frontend-config-${networkName}.json`);
      fs.writeFileSync(frontendConfigPath, JSON.stringify(frontendConfig, null, 2));
      
      console.log(`🌐 Generated frontend config: ${frontendConfigPath}`);
      return frontendConfigPath;
    } catch (error) {
      console.error('❌ Error generating frontend config:', error);
      throw error;
    }
  }
}

module.exports = ContractManager;
