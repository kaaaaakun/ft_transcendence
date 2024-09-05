from .models import tournaments, tournament_players
from .serializers import tournamentsSerializer , tournament_playersSerializer
from rest_framework.exceptions import ValidationError
from django.db.models import F

# トーナメントの参加者を取得する
# args: tournament_id
# return: tournament_playersのインスタンスのリスト
def get_tournamentplayer_with_related_data(tournament_id):
    return tournament_players.objects.filter(tournament_id=tournament_id).select_related('tournament_id', 'player_id')

# トーナメントのデータセットを作成する
# args: tournament_playersのインスタンスのリスト, match_detailsのインスタンス2つ
# return: トーナメントデータセット
def create_tournament_dataset(tournamentplayer_with_related, matchdetail1, matchdetail2):
    tournament_dataset = {}
    participants = []
    for tournamentplayer in tournamentplayer_with_related:
        participants.append(create_tournament_data(tournamentplayer,
                                                    (matchdetail1.player_id.id == tournamentplayer.player_id.id
                                                        or matchdetail2.player_id.id == tournamentplayer.player_id.id)))
    tournament_dataset['participants'] = participants
    return tournament_dataset

# トーナメントデータを作成する
# args: tournament_playersのインスタンス, 次のプレイヤーかどうか
# return: トーナメントデータ
def create_tournament_data(tournamentplayer, is_next_player):
    return {
        "player": {
            "name": tournamentplayer.player_id.name
        },
        "tournamentplayer": {
            "victory_count": tournamentplayer.victory_count
        },
        "next_player": is_next_player
    }

# トーナメントを作成する
# args: playersインスタンスのリスト
# return: tournamentsのインスタンス, tournament_playersのインスタンスのリスト
def create_tournament(players):
    try:
        tournament = register_tournament(validate_tournament(len(players), 'start'))
    except ValueError as e:
        raise ValidationError(e.detail)
    
    try:
        valid_tournament_players = validate_tournament_players(tournament.id, players)
    except ValueError as e:
        raise ValidationError(e.detail)
    
    tournament_players = register_tournament_players(valid_tournament_players)
    return tournament, tournament_players

# 次のトーナメントマッチを作成する
# args: tournament_id
# return: matchesのインスタンス, match_detailsのインスタンス2つ
def create_next_tournament_match(tournament_id):
    from match.utils import create_match
    tournamentplayers = tournament_players.objects.filter(tournament_id = tournament_id, status = 'await')
    if (tournamentplayers.count() < 2):
        raise ValidationError("Not enough players with status 'await' to create a match.")
    return create_match(tournament_id, tournamentplayers[0], tournamentplayers[1])


# Validate tournaments
# args: トーナメントの参加人数, トーナメントのステータス
# return: tournamentsのインスタンス
def validate_tournament(num_of_player, status):
    tournament_data = {
        'num_of_player': num_of_player,
        'status': status
    }
    tournament_serializer = tournamentsSerializer(data = tournament_data)
    if tournament_serializer.is_valid(raise_exception = True):
        return tournament_serializer.validated_data
    else:
        return None

# トーナメントをDBに登録する
# args: tournaments(validated)のインスタンス
# return: tournamentsのオブジェクト
def register_tournament(valid_tournament):
    return tournaments.objects.create(**valid_tournament)

def validate_tournament_player(tournament_id, player_id, status, victory_count):
    tournament_player_data = {
        'tournament_id': tournament_id,
        'player_id': player_id,
        'status': status,
        'victory_count': victory_count
    }
    tournament_player_serializer = tournament_playersSerializer(data = tournament_player_data)
    if tournament_player_serializer.is_valid(raise_exception = True):
        return tournament_player_serializer.validated_data
    else:
        raise ValidationError(tournament_player_serializer.errors)
    
def validate_tournament_players(tournament_id, players, status = 'await', victory_count = 0):
    valid_tournament_players = []
    try:
        for player in players:
            valid_tournament_players.append(validate_tournament_player(tournament_id, player.id, status, victory_count))
    except ValidationError as e:
        raise ValidationError(e.detail)
    return valid_tournament_players

# トーナメントプレイヤーをDBに登録する
# args: tournament_players(validated)のインスタンス
# return: tournament_playersのオブジェクト
def register_tournament_players(valid_tournament_players_data):
	players = []
	for player_data in valid_tournament_players_data:
			player = tournament_players.objects.create(**player_data)
			players.append(player)
	return players

# tournament_playersのステータスを更新する
def update_tournamentplayer_status(tournament_id, player_id, status):
    tournament_players.objects.filter(tournament_id = tournament_id, player_id = player_id).update(status = status)

# tournament_playersのvcountをインクリメントする
def increment_tournamentplayer_vcount(tournament_id, player_id):
    tournament_players.objects.filter(tournament_id = tournament_id, player_id = player_id).update(victory_count = F('victory_count') + 1)

# tournament_playersでラウンドが終了したかどうかを判定する
def is_round_end(tournament_id):
    tournamentplayers = tournament_players.objects.filter(tournament_id = tournament_id)
    # awaitステータスのプレイヤーがいたらラウンド終了ではない
    if tournamentplayers.filter(status = 'await').exists():
        return False
    return True

# tournament_playersのwinをawaitに変更する
def update_tournamentplayer_win_to_await(tournament_id):
    tournament_players.objects.filter(tournament_id = tournament_id, status = 'win').update(status = 'await')

# tournamentsがが終了したかを判定する
def is_tournament_end(tournament_id):
    tournamentplayers = tournament_players.objects.filter(tournament_id = tournament_id)
    # awaitステータスのプレイヤー1人だけの場合はトーナメント終了
    if tournamentplayers.filter(status = 'await').count() == 1:
        tournamentplayers.filter(status = 'await').update(status = 'win')
        return True
    return False

# tournamentsのstatusを更新する
def update_tournament_status(tournament_id, status):
    tournaments.objects.filter(id = tournament_id).update(status = status)
