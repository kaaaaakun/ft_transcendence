from rest_framework import serializers
from .models import Match, MatchDetail
from tournament.models import Tournament, TournamentPlayer
from player.models import Player

STATUS_CHOICES = ['start', 'end']
RESULT_CHOICES = ['win', 'lose', 'await']

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

    def validate(self, data):
        # dataのフィールド欠如
        if 'tournament_id' not in data:
            raise serializers.ValidationError("key 'tournament_id' is required.")
        if 'status' not in data:
            raise serializers.ValidationError("key 'status' is required.")

        # dataのフィールド値が期待と異なる
        if data['status'] not in STATUS_CHOICES:
            raise serializers.ValidationError("Match 'status' is invalid value.")

        # dataのForeignKeyの値が、新しいデータの追加条件に適合していない
        tournament = data.get('tournament_id')
        if tournament.status == 'end':
            raise serializers.ValidationError("Cannot create a match for a tournament that has already ended.")
        
        return data

class MatchDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchDetail
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
            raise serializers.ValidationError("Match 'score' can't set below 0.")
        if data['result'] not in RESULT_CHOICES:
            raise serializers.ValidationError("Matchdetail 'result' is invalid value.")

        # dataのForeignKeyの値が、新しいデータの追加条件に適合していない
        match = data.get('match_id')
        if match.status == 'end':
            raise serializers.ValidationError("Cannot create a matchdetail for a match that has already ended.")

        tournament = match.tournament_id
        player = data.get('player_id')
        if not TournamentPlayer.objects.filter(tournament_id = tournament, player_id = player).exists():
            raise serializers.ValidationError("This player is not part of Tournament player.")

        if not self.instance and MatchDetail.objects.filter(match_id=match, player_id=player).exists():
            raise serializers.ValidationError("Matchdetail is already exist.")
        
        return data
