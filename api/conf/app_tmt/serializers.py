from rest_framework import serializers
from .models import Tournament, TournamentPlayer

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class TournamentPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentPlayer
        fields = '__all__'
