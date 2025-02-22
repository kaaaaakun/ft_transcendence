from rest_framework.exceptions import ValidationError
from django.forms.models import model_to_dict

from .models import Match, MatchDetail
from .serializers import MatchSerializer, MatchDetailSerializer

def create_match(tournament_id, player1, player2):
    match_data = {
        'tournament_id': tournament_id,
        'status': 'start'
    }
    match_serializer = MatchSerializer(data = match_data)
    if match_serializer.is_valid(raise_exception = True):
        match = match_serializer.save()
    else:
        raise ValidationError(match_serializer.error)
    matchdetail1 = MatchDetail.create(validate_matchdetail_data(match.id, player1.id, 0, 'await'))
    matchdetail2 = MatchDetail.create(validate_matchdetail_data(match.id, player2.id, 0, 'await'))
    return match, matchdetail1, matchdetail2

# Validate MatchDetail
# args: match_id: int, player_id: int, score: int, result: str
# return: MatchDetailのオブジェクト
def validate_matchdetail_data(match_id, player_id, score, result):
    matchdetail_data = {
        'match_id': match_id,
        'player_id': player_id,
        'score': score,
        'result': result
    }
    matchdetail_serializer = MatchDetailSerializer(data = matchdetail_data)
    if matchdetail_serializer.is_valid(raise_exception = True):
        return matchdetail_serializer.validated_data
    else:
        raise ValidationError(matchdetail_serializer.error)

# MatchからMatchDetailとその関連データを取得する
# args: match_id: int
# return: MatchDetailのQuerySet (関連するPlayerおよびMatchデータを含む)
def get_matchdetail_with_related_data(match_id):
    return MatchDetail.objects.filter(match_id=match_id).select_related('player_id', 'match_id')

# MatchDetailをPlayerID順でソートする
def sort_matchdetails_by_playerid(matchdetails_with_related):
    if (matchdetails_with_related[0].player_id.id < matchdetails_with_related[1].player_id.id):
        return matchdetails_with_related
    else:
        return matchdetails_with_related[::-1]

# MatchDetailからJSON形式のプレイヤー配置データを作成する
def format_player_positions(matchdetails_with_related):
    sorted_matchdetails = sort_matchdetails_by_playerid(matchdetails_with_related)
    dataset = {'left': {'player_name': sorted_matchdetails[0].player_id.name},
              'right': {'player_name': sorted_matchdetails[1].player_id.name}
    }
    return dataset

def update_when_match_end(match_id, player_id, tournament_id):
    from tournament.models import TournamentPlayer
    opponent_player_id = get_opponent_player_id(match_id, player_id)
    
    # Update MatchDetail result
    MatchDetail.update_result(MatchDetail.objects.filter(match_id = match_id, player_id = player_id).first().id, player_id.id, 'win')
    MatchDetail.update_result(MatchDetail.objects.filter(match_id = match_id, player_id = opponent_player_id).first().id, opponent_player_id, 'lose')
    # Update Match status
    Match.update_status(match_id, 'end')
    
    # NOTE: player_idは player_id.idとしないとidが取得できないので注意
    # Update TournamentPlayer status and victory_count
    TournamentPlayer.update_status(player_id.id, player_id.id, 'win')
    TournamentPlayer.update_status(opponent_player_id, opponent_player_id, 'lose')
    TournamentPlayer.increment_victory_count(player_id.id, player_id.id)


def get_opponent_player_id(match_id, player_id):
    return MatchDetail.objects.filter(match_id = match_id).exclude(player_id = player_id).first().player_id.id
