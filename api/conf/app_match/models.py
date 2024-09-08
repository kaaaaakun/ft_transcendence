from django.db import models
from tournament.models import Tournament
from player.models import Player

class Match(models.Model):
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    status = models.CharField(max_length=10)

class MatchDetail(models.Model):
    match_id = models.ForeignKey(Match, on_delete=models.CASCADE)
    player_id = models.ForeignKey(Player, on_delete=models.CASCADE)
    score = models.IntegerField()
    result = models.CharField(max_length=10)