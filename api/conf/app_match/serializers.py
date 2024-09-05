from rest_framework import serializers
from .models import matches, match_details
from tournament.models import Tournament, tournament_players
from player.models import Player

MATCH_STATUS_CHOICES = ['start', 'end']
MATCHDETAIL_RESULT_CHOICES = ['win', 'lose', 'await']

class matchesSerializer(serializers.ModelSerializer):
    class Meta:
        model = matches
        fields = '__all__'

    def validate(self, data):
        # dataのフィールド欠如
        if 'tournament_id' not in data:
            raise serializers.ValidationError("key 'tournament_id' is required.")
        if 'status' not in data:
            raise serializers.ValidationError("key 'status' is required.")

        # dataのフィールド値が期待と異なる
        if data['status'] not in MATCH_STATUS_CHOICES:
            raise serializers.ValidationError("matches 'status' is invalid value.")

        # dataのForeignKeyの値が、新しいデータの追加条件に適合していない
        tournament = data.get('tournament_id')
        if tournament.status == 'end':
            raise serializers.ValidationError("Cannot create a match for a tournament that has already ended.")
        
        return data

class match_detailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = match_details
        fields = '__all__'

    def validate(self, data):
        # dataのフィールド欠如
        if 'match_id' not in data:
            raise serializers.ValidationError("key 'match_id' is required.")
        if 'player_id' not in data:
            raise serializers.ValidationError("key 'player_id' is required.")
        if 'score' not in data:
            raise serializers.ValidationError("key 'score' is required.")
        if 'result' not in data:
            raise serializers.ValidationError("key 'result' is required.")

        # dataのフィールド値が期待と異なる
        if data['score'] < 0:
            raise serializers.ValidationError("matches 'score' can't set below 0.")
        if data['result'] not in MATCHDETAIL_RESULT_CHOICES:
            raise serializers.ValidationError("matchesdetail 'result' is invalid value.")

        # dataのForeignKeyの値が、新しいデータの追加条件に適合していない
        match = data.get('match_id')
        if match.status == 'end':
            raise serializers.ValidationError("Cannot create a matchdetail for a match that has already ended.")

        tournament = match.tournament_id
        player = data.get('player_id')
        if not tournament_players.objects.filter(tournament_id = tournament, player_id = player).exists():
            raise serializers.ValidationError("This player is not part of Tournament player.")

        if not self.instance and match_details.objects.filter(match_id=match, player_id=player).exists():
            raise serializers.ValidationError("matchesdetail is already exist.")
        
        return data
