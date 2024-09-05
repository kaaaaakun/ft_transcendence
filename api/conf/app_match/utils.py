from .models import Match, MatchDetail
from .serializers import MatchSerializer, MatchDetailSerializer
from rest_framework.exceptions import ValidationError
from django.forms.models import model_to_dict

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
    try:
        matchdetail1 = register_matchdetail(validate_matchdetail_data(match.id, player1.player_id.id, 0, 'await'))
        matchdetail2 = register_matchdetail(validate_matchdetail_data(match.id, player2.player_id.id, 0, 'await'))
    except ValidationError as e:
        raise ValidationError(e.detail)
    return match, matchdetail1, matchdetail2

#
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

# MatchDetailをDBに登録する
# args: MatchDetail(validated)のオブジェクト
# return: MatchDetailのインスタンス
def register_matchdetail(valid_matchdetail):
    return MatchDetail.objects.create(**valid_matchdetail)


# MatchDetailのスコアをインクリメントする（DBへの保存はしない）
# args: match_id: int, player_id: int
# return: MatchDetailのオブジェクト
def increment_score(match_id, player_id):
    try:
        matchdetail_instance = MatchDetail.objects.get(match_id = match_id, player_id = player_id)
        matchdetail_instance.score += 1
        return matchdetail_instance
    except MatchDetail.DoesNotExist:
        return None

# MatchDetailのDB情報を更新する
# args: MatchDetailのインスタンス
# return: MatchDetailのインスタンス
def validate_and_update_matchdetail(matchdetail_instance):
    matchdetail_serializer = MatchDetailSerializer(instance = matchdetail_instance, data = model_to_dict(matchdetail_instance))

    if matchdetail_serializer.is_valid(raise_exception = True):
        return matchdetail_serializer.save()
    else:
        raise ValidationError(matchdetail_serializer.error)

# MatchからMatchDetailとその関連データを取得する
# args: match_id: int
# return: MatchDetailのQuerySet (関連するPlayerおよびMatchデータを含む)
def get_matchdetail_with_related_data(match_id):
    return MatchDetail.objects.filter(match_id=match_id).select_related('player_id', 'match_id')

# 対戦画面に必要なデータを作成する
# args: MatchDetailのリスト
# return: JSON形式のデータ
def create_ponggame_dataset(matchdetails_with_related):
    ponggame_dataset = {}
    for index, matchdetail in enumerate(matchdetails_with_related, start=1):
        ponggame_dataset[index] = create_ponggame_data(matchdetail)

    # add key match_end
    if (matchdetails_with_related[0].match_id.status == 'end'):
        ponggame_dataset['match_end'] = True
    else:
        ponggame_dataset['match_end'] = False

    return ponggame_dataset

# 対戦画面に必要なplayerごとのデータを作成する
# args: MatchDetailのインスタンス (関連するPlayerおよびMatchデータを含む方が良い）
# return: JSON
def create_ponggame_data(matchdetail):
    return {
        'player': {
            'name': matchdetail.player_id.name
        },
        'matchdetail': {
            'player_id': matchdetail.player_id.id,
            'match_id': matchdetail.match_id.id,
            'score': matchdetail.score
        }
    }

def update_when_match_end(match_id, player_id, tournament_id):
    from tournament.utils import ( update_tournamentplayer_status, increment_tournamentplayer_vcount )
    opponent_player_id = get_opponent_player_id(match_id, player_id)
    # Update MatchDetail result
    update_matchdetail_result(match_id, player_id, 'win')
    update_matchdetail_result(match_id, opponent_player_id, 'lose')
    # Update Match status
    update_match_status(match_id, 'end')
    # Update tournament_players status and victory_count
    update_tournamentplayer_status(tournament_id, player_id, 'win')
    update_tournamentplayer_status(tournament_id, opponent_player_id, 'lose')
    increment_tournamentplayer_vcount(tournament_id, player_id)    

def update_matchdetail_result(match_id, player_id, result):
    MatchDetail.objects.filter(match_id = match_id, player_id = player_id).update(result = result)

def get_opponent_player_id(match_id, player_id):
    return MatchDetail.objects.filter(match_id = match_id).exclude(player_id = player_id).first().player_id.id

def update_match_status(match_id, status):
    Match.objects.filter(id = match_id).update(status = status)
