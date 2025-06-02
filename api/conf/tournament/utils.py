from rest_framework.exceptions import ValidationError
from django.db.models import F
from room.utils import RoomKey
from .models import Tournament, TournamentPlayer

def get_latest_unfinished_tournament(tournament_type):
    """
    is_finished=False かつ type=tournament_type の最新のトーナメントを取得
    """
    return Tournament.objects.filter(
        is_finished=False,
        type=tournament_type
    ).order_by('-id').first()


