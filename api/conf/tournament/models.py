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
    def update_status(cls, tournament):
        if tournament.is_finished:
            raise ValueError("Cannot update status for a finished tournament.")
        tournament.is_finished = True
        tournament.save()

class TournamentPlayer(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete = models.CASCADE)
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    entry_number = models.IntegerField()
    round = models.IntegerField(default = 1)

    class Meta:
        db_table = 'tournament_players'
        constraints = [
            models.UniqueConstraint(fields = ['tournament', 'user'], name = 'unique_tournament_user')
        ]

    @classmethod
    def create_tournament_players(cls, tournament, users):
        if tournament.is_finished:
            raise ValueError("Cannot create a tournament player for a finished tournament.")
        if len(users) != tournament.type:
            raise ValueError("Number of users must match the tournament type.")
        for i, user in enumerate(users):
            entry_number = i
            cls.objects.create(tournament = tournament, user = user, entry_number = entry_number)
        return cls.objects.filter(tournament = tournament)

    @classmethod
    def increment_round(cls, tournament, user):
        cls.objects.filter(tournament = tournament, user = user).update(round = F('round') + 1)
