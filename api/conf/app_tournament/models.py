from django.db import models
from django.db.models import F
from user.models import User

TOURNAMENT_TYPE_CHOICES = [
    (4, 4),
    (8, 8),
]

class Tournament(models.Model):
    type = models.IntegerField(
        choices = TOURNAMENT_TYPE_CHOICES
    )
    is_finished = models.BooleanField(default = False)

    class Meta:
        db_table = 'tournaments'

    @classmethod
    def create(cls, type):
        return cls.objects.create(type = type)

    @classmethod
    def update_status(cls, tournament_id):
        cls.objects.filter(id = tournament_id).update(is_finished = True)

class TournamentPlayer(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete = models.CASCADE)
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    entry_number = models.IntegerField()
    round = models.IntegerField(default = 1)

    class Meta:
        db_table = 'tournament_players'

    @classmethod
    def create(cls, tournament_id, user_id, entry_number):
        if tournament_id.is_finished:
            raise ValueError("Cannot create a tournament player for a finished tournament.")
        if cls.objects.filter(tournament_id = tournament_id, user_id = user_id).exists():
            raise ValueError("User is already registered for this tournament.")
        return cls.objects.create(tournament_id = tournament_id, user_id = user_id, entry_number = entry_number)
    
    @classmethod
    def increment_round(cls, tournament_id, user_id):
        cls.objects.filter(tournament_id = tournament_id, user_id = user_id).update(round = F('round') + 1)
