from django.db import models
from tournament.models import Tournament
from player.models import Player

class Match(models.Model):
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    status = models.CharField(max_length=10)

    class Meta:
        db_table = 'matches'

    @classmethod
    def update_status(cls, match_id, status):
        cls.objects.filter(id = match_id).update(status = status)

class MatchDetail(models.Model):
    match_id = models.ForeignKey(Match, on_delete=models.CASCADE)
    player_id = models.ForeignKey(Player, on_delete=models.CASCADE)
    score = models.IntegerField()
    result = models.CharField(max_length=10)

    class Meta:
        db_table = 'match_details'

    @classmethod
    def create(cls, valid_data):
        return cls.objects.create(**valid_data)
    
    @classmethod
    def update_result(cls, matchdetail_id, player_id, result):
        cls.objects.filter(id = matchdetail_id, player_id = player_id).update(result = result)