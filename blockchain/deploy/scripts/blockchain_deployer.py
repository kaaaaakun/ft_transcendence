#!/usr/bin/env python3
"""
Django側からブロックチェーンデプロイを実行するためのスクリプト例
"""

import json
import subprocess
import sys
import os
from pathlib import Path

class BlockchainDeployer:
    def __init__(self, blockchain_dir="/Users/kaaaaakun_/Desktop/42tokyo/ft_transcendence/blockchain/deploy"):
        self.blockchain_dir = Path(blockchain_dir)
        
    def deploy_contract(self, deployment_data, network="sepolia"):
        """
        コントラクトをデプロイする
        
        Args:
            deployment_data (dict): デプロイに必要なデータ
            network (str): デプロイ先ネットワーク
            
        Returns:
            dict: デプロイ結果
        """
        try:
            # データをJSONファイルに保存
            data_file = self.blockchain_dir / "temp_deployment_data.json"
            with open(data_file, 'w') as f:
                json.dump(deployment_data, f, indent=2)
            
            # デプロイスクリプトを実行
            cmd = [
                "npm", "run", f"deploy:with-data",
                "--", "--network", network,
                str(data_file)
            ]
            
            print(f"🚀 Executing deployment command: {' '.join(cmd)}")
            
            # blockchain/deployディレクトリで実行
            result = subprocess.run(
                cmd,
                cwd=self.blockchain_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5分でタイムアウト
            )
            
            # 一時ファイルを削除
            data_file.unlink(missing_ok=True)
            
            # 結果を解析
            if result.returncode == 0:
                return self._parse_deployment_result(result.stdout)
            else:
                return {
                    'success': False,
                    'error': result.stderr,
                    'stdout': result.stdout
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _parse_deployment_result(self, stdout):
        """
        デプロイ結果を解析
        """
        try:
            # DEPLOYMENT_RESPONSE: で始まる行を探す
            for line in stdout.split('\n'):
                if line.startswith('DEPLOYMENT_RESPONSE:'):
                    response_json = line.replace('DEPLOYMENT_RESPONSE:', '').strip()
                    return json.loads(response_json)
            
            # 見つからない場合はレスポンスファイルから読み込み
            response_file = self.blockchain_dir / "deployment-response.json"
            if response_file.exists():
                with open(response_file) as f:
                    return json.load(f)
            
            return {
                'success': True,
                'message': 'Deployment completed but response format not found',
                'stdout': stdout
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to parse deployment result: {str(e)}',
                'stdout': stdout
            }

# Django models.py での使用例
"""
from django.db import models
from .blockchain_deployer import BlockchainDeployer

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    contract_address = models.CharField(max_length=42, null=True, blank=True)
    deployment_tx_hash = models.CharField(max_length=66, null=True, blank=True)
    
    def deploy_contract(self):
        deployer = BlockchainDeployer()
        
        deployment_data = {
            "contractName": "MyContract",
            "constructorArgs": [f"Tournament: {self.name}"],
            "metadata": {
                "deployer": "tournament_system",
                "purpose": f"Tournament contract for {self.name}",
                "version": "1.0.0",
                "tournamentId": str(self.id)
            }
        }
        
        result = deployer.deploy_contract(deployment_data)
        
        if result['success']:
            self.contract_address = result['deployment']['address']
            self.deployment_tx_hash = result['deployment']['transactionHash']
            self.save()
            return True
        else:
            print(f"Deployment failed: {result['error']}")
            return False
"""

# CLI使用例
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 blockchain_deployer.py <deployment_data.json>")
        sys.exit(1)
    
    data_file = sys.argv[1]
    
    with open(data_file) as f:
        deployment_data = json.load(f)
    
    deployer = BlockchainDeployer()
    result = deployer.deploy_contract(deployment_data)
    
    print(json.dumps(result, indent=2))
