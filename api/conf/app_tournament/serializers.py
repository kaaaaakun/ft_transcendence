from rest_framework import serializers
from .models import Tournament, TournamentPlayer

TOURNAMENT_STATUS_CHOICES = ['start', 'end']
TOURNAMENT_PLAYER_STATUS_CHOICES = ['start', 'end', 'await']
NUM_OF_PLAYER_CHOICES = [2, 4, 8]

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

    def validate(self, data):
        if 'status' not in data:
            raise serializers.ValidationError("key 'status' is required.")
        if 'num_of_player' not in data:
            raise serializers.ValidationError("key 'num_of_player' is required.")
        if data['status'] not in TOURNAMENT_STATUS_CHOICES:
            raise serializers.ValidationError("Tournament 'status' is invalid value.")
        if data['num_of_player'] not in NUM_OF_PLAYER_CHOICES:
            raise serializers.ValidationError(f"Tournament 'num_of_player':{data['num_of_player']} is invalid.")
        return data

class TournamentPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentPlayer
        fields = '__all__'

    def validate(self, data):
        if 'tournament_id' not in data:
            raise serializers.ValidationError("key 'tournament_id' is required.")
        if 'player_id' not in data:
            raise serializers.ValidationError("key 'player_id' is required.")
        if 'status' not in data:
            raise serializers.ValidationError("key 'status' is required.")
        if 'victory_count' not in data:
            raise serializers.ValidationError("key 'victory_count' is required.")
        if data['status'] not in TOURNAMENT_PLAYER_STATUS_CHOICES:
            raise serializers.ValidationError("TournamentPlayer 'status' is invalid value.")
        if data['victory_count'] < 0:
            raise serializers.ValidationError("TournamentPlayer 'victory_count' must be a non-negative integer.")
        
        tournament = Tournament.objects.get(id = data['tournament_id'].id)
        if tournament.status == 'end':
            raise serializers.ValidationError("Cannot create a tournamentplayer for a tournament that has already ended.")
        
        return data
