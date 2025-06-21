"""
ft_transcendenceプロジェクトのブロックチェーンマネージャー
スマートコントラクトのデプロイと相互作用を管理
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from datetime import datetime

from .config import config
from .contract_deployer import ContractDeployer
from .contract_interface import ContractInterface, TournamentContract, MatchContract


class BlockchainManager:
    """ft_transcendenceのメインブロックチェーン管理クラス"""
    
    def __init__(self):
        self.deployer = ContractDeployer()
        self.deployed_contracts = {}
        self.contract_registry_path = config.BASE_DIR / 'deployed_contracts.json'
        
        # Load existing deployments
        self._load_deployed_contracts()
    
    def _load_deployed_contracts(self):
        """Load deployed contract addresses from registry"""
        if self.contract_registry_path.exists():
            with open(self.contract_registry_path, 'r') as f:
                self.deployed_contracts = json.load(f)
            print(f"📋 Loaded {len(self.deployed_contracts)} deployed contracts")
        else:
            self.deployed_contracts = {}
            print("📋 No existing contract registry found")
    
    def _save_deployed_contracts(self):
        """Save deployed contract addresses to registry"""
        with open(self.contract_registry_path, 'w') as f:
            json.dump(self.deployed_contracts, f, indent=2)
        print(f"💾 Saved contract registry with {len(self.deployed_contracts)} contracts")
    
    def deploy_contract(self, contract_name: str, constructor_args: List[Any] = None, 
                       metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Deploy a smart contract"""
        print(f"🚀 Deploying {contract_name}...")
        
        # Deploy contract
        result = self.deployer.deploy_contract(contract_name, constructor_args, metadata)
        
        if result['success']:
            # Register deployed contract
            contract_info = {
                'address': result['contract_address'],
                'transaction_hash': result['transaction_hash'],
                'deployer': result['deployer'],
                'deployed_at': datetime.now().isoformat(),
                'constructor_args': constructor_args or [],
                'metadata': metadata or {},
                'network': config.NETWORK
            }
            
            self.deployed_contracts[contract_name] = contract_info
            self._save_deployed_contracts()
            
            print(f"✅ {contract_name} deployed and registered successfully")
        
        return result
    
    def get_contract_interface(self, contract_name: str) -> ContractInterface:
        """Get contract interface for interaction"""
        if contract_name not in self.deployed_contracts:
            raise ValueError(f"Contract {contract_name} not found in registry")
        
        contract_info = self.deployed_contracts[contract_name]
        address = contract_info['address']
        
        # Return specialized interfaces for known contracts
        if contract_name.lower() in ['tournament', 'tournamentcontract']:
            return TournamentContract(address, contract_name)
        elif contract_name.lower() in ['match', 'matchcontract']:
            return MatchContract(address, contract_name)
        else:
            return ContractInterface(address, contract_name)
    
    def deploy_tournament_system(self, django_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Deploy complete tournament system (Tournament + Match contracts)"""
        print("🏆 Deploying Tournament System...")
        
        results = {}
        
        # Deploy Tournament contract
        tournament_args = []
        if django_data and 'tournament_settings' in django_data:
            settings = django_data['tournament_settings']
            tournament_args = [
                settings.get('max_tournaments', 1000),
                settings.get('min_participants', 2),
                settings.get('max_participants', 64)
            ]
        
        tournament_result = self.deploy_contract(
            'Tournament', 
            tournament_args,
            {'type': 'tournament_system', 'django_data': django_data}
        )
        results['tournament'] = tournament_result
        
        if tournament_result['success']:
            # Deploy Match contract
            match_args = [tournament_result['contract_address']]  # Reference to tournament contract
            
            match_result = self.deploy_contract(
                'Match',
                match_args,
                {'type': 'match_system', 'tournament_contract': tournament_result['contract_address']}
            )
            results['match'] = match_result
            
            if match_result['success']:
                print("🎯 Tournament system deployed successfully!")
                return {
                    'success': True,
                    'tournament_address': tournament_result['contract_address'],
                    'match_address': match_result['contract_address'],
                    'details': results
                }
        
        print("❌ Tournament system deployment failed")
        return {
            'success': False,
            'details': results
        }
    
    def create_tournament_from_django(self, django_tournament_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create blockchain tournament from Django tournament data"""
        try:
            tournament_contract = self.get_contract_interface('Tournament')
            
            # Extract tournament data
            name = django_tournament_data.get('name', 'Unnamed Tournament')
            max_participants = django_tournament_data.get('max_participants', 8)
            entry_fee = django_tournament_data.get('entry_fee', 0)
            
            # Convert entry fee to wei if needed
            if entry_fee > 0:
                entry_fee = tournament_contract.w3.to_wei(entry_fee, 'ether')
            
            # Create tournament on blockchain
            result = tournament_contract.create_tournament(name, max_participants, entry_fee)
            
            if result['success']:
                # Extract tournament ID from events
                tournament_id = None
                for event in result.get('events', []):
                    if event['event'] == 'TournamentCreated':
                        tournament_id = event['args'].get('tournamentId')
                        break
                
                return {
                    'success': True,
                    'blockchain_tournament_id': tournament_id,
                    'transaction_hash': result['transaction_hash'],
                    'block_number': result['block_number']
                }
            else:
                return result
        
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to create tournament: {str(e)}"
            }
    
    def create_match_from_django(self, django_match_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create blockchain match from Django match data"""
        try:
            match_contract = self.get_contract_interface('Match')
            
            # Extract match data
            player1 = django_match_data.get('player1_address')
            player2 = django_match_data.get('player2_address')
            tournament_id = django_match_data.get('blockchain_tournament_id', 0)
            
            if not player1 or not player2:
                raise ValueError("Player addresses are required")
            
            # Create match on blockchain
            result = match_contract.create_match(player1, player2, tournament_id)
            
            if result['success']:
                # Extract match ID from events
                match_id = None
                for event in result.get('events', []):
                    if event['event'] == 'MatchCreated':
                        match_id = event['args'].get('matchId')
                        break
                
                return {
                    'success': True,
                    'blockchain_match_id': match_id,
                    'transaction_hash': result['transaction_hash'],
                    'block_number': result['block_number']
                }
            else:
                return result
        
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to create match: {str(e)}"
            }
    
    def record_match_result(self, blockchain_match_id: int, player1_score: int, 
                           player2_score: int, tournament_id: int = None) -> Dict[str, Any]:
        """Record match result on blockchain"""
        try:
            results = {}
            
            # Record score in Match contract
            match_contract = self.get_contract_interface('Match')
            match_result = match_contract.record_score(blockchain_match_id, player1_score, player2_score)
            results['match_score'] = match_result
            
            if match_result['success']:
                # Finalize match
                finalize_result = match_contract.finalize_match(blockchain_match_id)
                results['match_finalize'] = finalize_result
                
                # If part of tournament, record in tournament contract
                if tournament_id is not None:
                    tournament_contract = self.get_contract_interface('Tournament')
                    
                    # Determine winner
                    match_data = match_contract.get_match(blockchain_match_id)
                    winner = match_data.get('winner', '')
                    
                    if winner:
                        tournament_result = tournament_contract.record_match_result(
                            tournament_id, blockchain_match_id, winner
                        )
                        results['tournament_update'] = tournament_result
                
                return {
                    'success': True,
                    'results': results
                }
            else:
                return match_result
        
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to record match result: {str(e)}"
            }
    
    def get_user_stats(self, user_address: str) -> Dict[str, Any]:
        """Get comprehensive user statistics from blockchain"""
        try:
            stats = {
                'address': user_address,
                'tournaments': [],
                'matches': [],
                'total_tournaments': 0,
                'total_matches': 0,
                'wins': 0,
                'losses': 0,
                'win_rate': 0
            }
            
            # Get tournament data
            if 'Tournament' in self.deployed_contracts:
                tournament_contract = self.get_contract_interface('Tournament')
                tournament_ids = tournament_contract.get_user_tournaments(user_address)
                stats['tournaments'] = tournament_ids
                stats['total_tournaments'] = len(tournament_ids)
            
            # Get match data
            if 'Match' in self.deployed_contracts:
                match_contract = self.get_contract_interface('Match')
                match_history = match_contract.get_match_history(user_address)
                stats['matches'] = match_history
                stats['total_matches'] = len(match_history)
                
                # Calculate win/loss
                for match in match_history:
                    if match.get('winner', '').lower() == user_address.lower():
                        stats['wins'] += 1
                    elif match.get('status') == 'finished':
                        stats['losses'] += 1
                
                # Calculate win rate
                if stats['total_matches'] > 0:
                    stats['win_rate'] = stats['wins'] / stats['total_matches']
            
            return {
                'success': True,
                'stats': stats
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to get user stats: {str(e)}"
            }
    
    def get_contract_status(self) -> Dict[str, Any]:
        """Get status of all deployed contracts"""
        status = {
            'total_contracts': len(self.deployed_contracts),
            'network': config.NETWORK,
            'contracts': {}
        }
        
        for name, info in self.deployed_contracts.items():
            try:
                contract = self.get_contract_interface(name)
                contract_info = contract.get_contract_info()
                
                status['contracts'][name] = {
                    'address': info['address'],
                    'deployed_at': info['deployed_at'],
                    'status': 'active',
                    'functions': len(contract_info['functions']),
                    'events': len(contract_info['events'])
                }
            except Exception as e:
                status['contracts'][name] = {
                    'address': info['address'],
                    'deployed_at': info['deployed_at'],
                    'status': 'error',
                    'error': str(e)
                }
        
        return status
    
    def emergency_pause_contracts(self) -> Dict[str, Any]:
        """Emergency pause functionality (if supported by contracts)"""
        results = {}
        
        for contract_name in self.deployed_contracts:
            try:
                contract = self.get_contract_interface(contract_name)
                
                # Try to pause if function exists
                if hasattr(contract.contract.functions, 'pause'):
                    result = contract.send_transaction('pause')
                    results[contract_name] = result
                else:
                    results[contract_name] = {'success': False, 'error': 'Pause function not available'}
            
            except Exception as e:
                results[contract_name] = {'success': False, 'error': str(e)}
        
        return results


# Global blockchain manager instance
blockchain_manager = BlockchainManager()


# Convenience functions for Django integration
def deploy_tournament_system(django_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """Convenience function to deploy tournament system"""
    return blockchain_manager.deploy_tournament_system(django_data)


def create_tournament(django_tournament_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convenience function to create tournament from Django data"""
    return blockchain_manager.create_tournament_from_django(django_tournament_data)


def create_match(django_match_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convenience function to create match from Django data"""
    return blockchain_manager.create_match_from_django(django_match_data)


def record_match_result(blockchain_match_id: int, player1_score: int, 
                       player2_score: int, tournament_id: int = None) -> Dict[str, Any]:
    """Convenience function to record match result"""
    return blockchain_manager.record_match_result(
        blockchain_match_id, player1_score, player2_score, tournament_id
    )


def get_user_stats(user_address: str) -> Dict[str, Any]:
    """Convenience function to get user statistics"""
    return blockchain_manager.get_user_stats(user_address)
