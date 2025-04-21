from django.db import models
from tournament.models import Tournament
from user.models import User

MATCH_TX_STATUS_CHOICES = [
    ('pending','pending'), 
    ('success', 'success'), 
    ('failure', 'failure')
]

class Match(models.Model):
    tournament_id = models.ForeignKey(
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
        return cls.objects.create(tournament_id = tournament)

    @classmethod
    def update_is_finished(cls, match_id, boolean):
        updated = cls.objects.filter(pk = match_id).update(is_finished = boolean)
        if updated == 0:
            raise cls.DoesNotExist(f"Match with id {match_id} does not exist.")
        return updated

    @classmethod
    def update_tx_status(cls, match_id, status):
        updated = cls.objects.filter(pk = match_id).update(tx_status = status)
        if updated == 0:
            raise cls.DoesNotExist(f"Match with id {match_id} does not exist.")
        return updated

    @classmethod
    def update_tx_address(cls, match_id, address):
        updated = cls.objects.filter(pk = match_id).update(tx_address = address)
        if updated == 0:
            raise cls.DoesNotExist(f"Match with id {match_id} does not exist.")
        return updated

class MatchDetail(models.Model):
    match_id = models.ForeignKey(Match, on_delete = models.CASCADE)
    user_id = models.ForeignKey(User, on_delete = models.CASCADE)
    score = models.IntegerField(default = 0)

    class Meta:
        db_table = 'match_details'

    @classmethod
    def create(cls, match_id, user_id):
        if match_id.is_finished:
            raise ValueError("Cannot create a match detail for a finished match.")
        return cls.objects.create(
            match_id = match_id,
            user_id = user_id,
        )
