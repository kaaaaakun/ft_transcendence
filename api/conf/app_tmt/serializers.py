from rest_framework import serializers
from .models import Tournament, TournamentPlayer

STATUS_CHOICES = ['start', 'end']
MIN_PLAYERS = 1
MAX_PLAYERS = 8

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

    def validate(self, data):
        if 'status' not in data:
            raise serializers.ValidationError("key 'status' is required.")
        if 'num_of_player' not in data:
            raise serializers.ValidationError("key 'num_of_player' is required.")
        if data['status'] not in STATUS_CHOICES:
            raise serializers.ValidationError("Tournament 'status' is invalid value.")
        if data['num_of_player'] < MIN_PLAYERS or MAX_PLAYERS < data['num_of_player']:
            raise serializers.ValidationError(f"Tournament 'num_of_player':{data['num_of_player']} is invalid.")
        if (data['num_of_player'] & (data['num_of_player'] - 1)) != 0: #https://programming-place.net/ppp/contents/c/rev_res/math012.html#way1
            raise serializers.ValidationError(f"Tournament 'num_of_player':{data['num_of_player']} must be a power of 2.")
        return data

class TournamentPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentPlayer
        fields = '__all__'
