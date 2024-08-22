from .models import Tournament
from .serializers import TournamentSerializer
from rest_framework.exceptions import ValidationError

# Validate Tournament
# args: トーナメントの参加人数, トーナメントのステータス
# return: Tournamentのインスタンス
def validate_tournament(num_of_player, status):
    tournament_data = {
        'num_of_player': num_of_player,
        'status': status
    }
    tournament_serializer = TournamentSerializer(data = tournament_data)
    if tournament_serializer.is_valid(raise_exception = True):
        return tournament_serializer.validated_data
    else:
        raise ValidationError(tournament_serializer.errors)

# トーナメントをDBに登録する
# args: Tournament(validated)のインスタンス
# return: Tournamentのオブジェクト
def register_tournament(valid_tournament):
    return Tournament.objects.create(**valid_tournament)