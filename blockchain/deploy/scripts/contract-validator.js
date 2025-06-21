const fs = require('fs');
const path = require('path');

class ContractValidator {
  constructor() {
    this.contractsDir = path.join(__dirname, 'contracts');
    this.configFile = path.join(__dirname, 'contract-structure.json');
  }

  /**
   * JSON設定ファイルの妥当性を検証
   */
  validateConfig() {
    try {
      if (!fs.existsSync(this.configFile)) {
        throw new Error('Contract configuration file not found');
      }

      const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      
      // 必須フィールドの検証
      this.validateMetadata(config.metadata);
      this.validateSource(config.source);
      this.validateInterface(config.interface);
      
      console.log('✅ Contract configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  validateMetadata(metadata) {
    const required = ['name', 'version', 'description'];
    for (const field of required) {
      if (!metadata[field]) {
        throw new Error(`Missing required metadata field: ${field}`);
      }
    }
  }

  validateSource(source) {
    const required = ['pragma', 'contractName'];
    for (const field of required) {
      if (!source[field]) {
        throw new Error(`Missing required source field: ${field}`);
      }
    }
  }

  validateInterface(interface) {
    if (!interface.functions || !Array.isArray(interface.functions)) {
      throw new Error('Interface must have functions array');
    }
    
    if (!interface.events || !Array.isArray(interface.events)) {
      throw new Error('Interface must have events array');
    }
  }

  /**
   * コントラクトの情報を表示
   */
  displayContractInfo() {
    try {
      const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      
      console.log('\n📋 Contract Information');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Name: ${config.metadata.name}`);
      console.log(`Version: ${config.metadata.version}`);
      console.log(`Description: ${config.metadata.description}`);
      console.log(`License: ${config.metadata.license}`);
      
      if (config.deployment && config.deployment.networks) {
        console.log('\n🌐 Deployments:');
        Object.entries(config.deployment.networks).forEach(([network, info]) => {
          console.log(`  ${network}: ${info.address}`);
        });
      }
      
      console.log('\n📝 Functions:');
      config.interface.functions.forEach(func => {
        console.log(`  - ${func.name}(${func.parameters.map(p => p.type).join(', ')}) ${func.stateMutability}`);
      });
      
      console.log('\n📡 Events:');
      config.interface.events.forEach(event => {
        console.log(`  - ${event.name}(${event.parameters.map(p => p.type).join(', ')})`);
      });
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
    } catch (error) {
      console.error('❌ Error displaying contract info:', error.message);
    }
  }

  /**
   * 設定ファイルからSolidityコードを生成（参考用）
   */
  generateSolidityFromJson() {
    try {
      const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      
      let solidityCode = `// SPDX-License-Identifier: ${config.metadata.license}\n`;
      solidityCode += `pragma solidity ${config.source.pragma};\n\n`;
      solidityCode += `contract ${config.source.contractName} {\n`;
      
      // State variables
      config.interface.stateVariables.forEach(variable => {
        solidityCode += `    ${variable.type} ${variable.visibility} ${variable.name};\n`;
      });
      
      // Events
      config.interface.events.forEach(event => {
        const params = event.parameters.map(p => `${p.type} ${p.name}`).join(', ');
        solidityCode += `\n    event ${event.name}(${params});\n`;
      });
      
      // Constructor
      if (config.interface.constructor) {
        const params = config.interface.constructor.parameters.map(p => `${p.type} ${p.name}`).join(', ');
        solidityCode += `\n    constructor(${params}) {\n`;
        solidityCode += `        // Constructor implementation\n`;
        solidityCode += `    }\n`;
      }
      
      // Functions
      config.interface.functions.forEach(func => {
        const params = func.parameters.map(p => `${p.type} ${p.name}`).join(', ');
        const returns = func.returnParameters.length > 0 ? 
          ` returns (${func.returnParameters.map(r => r.type).join(', ')})` : '';
        
        solidityCode += `\n    function ${func.name}(${params}) ${func.visibility} ${func.stateMutability}${returns} {\n`;
        solidityCode += `        // Function implementation\n`;
        solidityCode += `    }\n`;
      });
      
      solidityCode += `}\n`;
      
      const outputPath = path.join(__dirname, 'generated', 'Generated.sol');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, solidityCode);
      
      console.log(`📄 Generated Solidity code: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('❌ Error generating Solidity code:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const validator = new ContractValidator();
  const command = process.argv[2];
  
  switch (command) {
    case 'validate':
      validator.validateConfig();
      break;
    case 'info':
      validator.displayContractInfo();
      break;
    case 'generate':
      validator.generateSolidityFromJson();
      break;
    default:
      console.log('Usage: node contract-validator.js [validate|info|generate]');
  }
}

module.exports = ContractValidator;
