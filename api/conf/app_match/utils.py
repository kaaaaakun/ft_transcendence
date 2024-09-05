from .models import matches, match_details
from .serializers import matchesSerializer, match_detailsSerializer
from rest_framework.exceptions import ValidationError
from django.forms.models import model_to_dict

def create_match(tournament_id, player1, player2):
    match_data = {
        'tournament_id': tournament_id,
        'status': 'start'
    }
    match_serializer = matchesSerializer(data = match_data)
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
# Validate match_details
# args: match_id: int, player_id: int, score: int, result: str
# return: match_detailsのオブジェクト
def validate_matchdetail_data(match_id, player_id, score, result):
    matchdetail_data = {
        'match_id': match_id,
        'player_id': player_id,
        'score': score,
        'result': result
    }
    matchdetail_serializer = match_detailsSerializer(data = matchdetail_data)
    if matchdetail_serializer.is_valid(raise_exception = True):
        return matchdetail_serializer.validated_data
    else:
        raise ValidationError(matchdetail_serializer.error)

# match_detailsをDBに登録する
# args: match_details(validated)のオブジェクト
# return: match_detailsのインスタンス
def register_matchdetail(valid_matchdetail):
    return match_details.objects.create(**valid_matchdetail)


# match_detailsのスコアをインクリメントする（DBへの保存はしない）
# args: match_id: int, player_id: int
# return: match_detailsのオブジェクト
def increment_score(match_id, player_id):
    try:
        matchdetail_instance = match_details.objects.get(match_id = match_id, player_id = player_id)
        matchdetail_instance.score += 1
        return matchdetail_instance
    except match_details.DoesNotExist:
        return None

# match_detailsのDB情報を更新する
# args: match_detailsのインスタンス
# return: match_detailsのインスタンス
def validate_and_update_matchdetail(matchdetail_instance):
    matchdetail_serializer = match_detailsSerializer(instance = matchdetail_instance, data = model_to_dict(matchdetail_instance))

    if matchdetail_serializer.is_valid(raise_exception = True):
        return matchdetail_serializer.save()
    else:
        raise ValidationError(matchdetail_serializer.error)

# matchesからmatch_detailsとその関連データを取得する
# args: match_id: int
# return: match_detailsのQuerySet (関連するPlayerおよびmatchesデータを含む)
def get_matchdetail_with_related_data(match_id):
    return match_details.objects.filter(match_id=match_id).select_related('player_id', 'match_id')

# 対戦画面に必要なデータを作成する
# args: match_detailsのリスト
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
# args: match_detailsのインスタンス (関連するPlayerおよびmatchesデータを含む方が良い）
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
    # Update match_details result
    update_matchdetail_result(match_id, player_id, 'win')
    update_matchdetail_result(match_id, opponent_player_id, 'lose')
    # Update matches status
    update_match_status(match_id, 'end')
    # Update tournament_players status and victory_count
    update_tournamentplayer_status(tournament_id, player_id, 'win')
    update_tournamentplayer_status(tournament_id, opponent_player_id, 'lose')
    increment_tournamentplayer_vcount(tournament_id, player_id)    

def update_matchdetail_result(match_id, player_id, result):
    match_details.objects.filter(match_id = match_id, player_id = player_id).update(result = result)

def get_opponent_player_id(match_id, player_id):
    return match_details.objects.filter(match_id = match_id).exclude(player_id = player_id).first().player_id.id

def update_match_status(match_id, status):
    matches.objects.filter(id = match_id).update(status = status)
