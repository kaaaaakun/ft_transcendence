from rest_framework import serializers
from .models import Match, MatchDetail

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

class MatchDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchDetail
        fields = '__all__'
