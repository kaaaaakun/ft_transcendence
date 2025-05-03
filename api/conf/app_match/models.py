from django.db import models
from tournament.models import Tournament
from user.models import User

MATCH_TX_STATUS_CHOICES = [
    ('pending','pending'), 
    ('success', 'success'), 
    ('failure', 'failure')
]

class Match(models.Model):
    tournament = models.ForeignKey(
        Tournament, 
        on_delete = models.CASCADE, 
        null = True
    )
    created_at = models.DateTimeField(auto_now_add = True)
    is_finished = models.BooleanField(default = False)
    tx_status = models.CharField(
        max_length = 8,
        choices = MATCH_TX_STATUS_CHOICES,
        null = True,
        blank = True
    )
    tx_address = models.CharField(
        max_length = 100, 
        null = True,
        blank = True    
    )

    class Meta:
        db_table = 'matches'

    @classmethod
    def create_for_tournament(cls, tournament):
        if tournament.is_finished:
            raise ValueError("Cannot create a match for a finished tournament.")
        return cls.objects.create(tournament = tournament)

    @classmethod
    def update_is_finished(cls, match):
        match.is_finished = True
        match.save()
        return match

    @classmethod
    def update_tx_status(cls, match, status):
        match.tx_status = status
        match.full_clean()
        match.save()
        return match

    @classmethod
    def update_tx_address(cls, match, address):
        match.tx_address = address
        match.save()
        return match

class MatchDetail(models.Model):
    match = models.ForeignKey(Match, on_delete = models.CASCADE)
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    score = models.IntegerField(default = 0)

    class Meta:
        db_table = 'match_details'

    @classmethod
    def create(cls, match, user):
        if match.is_finished:
            raise ValueError("Cannot create a match detail for a finished match.")
        return cls.objects.create(
            match = match,
            user = user,
        )
