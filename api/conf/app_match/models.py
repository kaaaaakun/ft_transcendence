from django.db import models
from tournament.models import tournaments
from player.models import players

class matches(models.Model):
    tournament_id = models.ForeignKey(tournaments, on_delete=models.CASCADE)
    status = models.CharField(max_length=10)

class match_details(models.Model):
    match_id = models.ForeignKey(matches, on_delete=models.CASCADE)
    player_id = models.ForeignKey(players, on_delete=models.CASCADE)
    score = models.IntegerField()
    result = models.CharField(max_length=10)