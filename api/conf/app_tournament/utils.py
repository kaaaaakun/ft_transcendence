from .models import Tournament, TournamentPlayer
from .serializers import TournamentSerializer , TournamentPlayerSerializer
from rest_framework.exceptions import ValidationError
from django.db.models import F

def create_tournament(players):
    try:
        tournament = register_tournament(validate_tournament(len(players), 'start'))
    except ValueError as e:
        raise ValidationError(e.detail)
    
    try:
        valid_tournament_players = validate_tournament_players(tournament.id, players)
    except ValidationError as e:
        raise ValidationError(e.detail)
    
    tournament_players = register_tournament_players(valid_tournament_players)
    return tournament, tournament_players

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
        return None

# トーナメントをDBに登録する
# args: Tournament(validated)のインスタンス
# return: Tournamentのオブジェクト
def register_tournament(valid_tournament):
    return Tournament.objects.create(**valid_tournament)

def validate_tournament_player(tournament_id, player_id, status, victory_count):
    tournament_player_data = {
        'tournament_id': tournament_id,
        'player_id': player_id,
        'status': status,
        'victory_count': victory_count
    }
    tournament_player_serializer = TournamentPlayerSerializer(data = tournament_player_data)
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
# args: TournamentPlayer(validated)のインスタンス
# return: TournamentPlayerのオブジェクト
def register_tournament_players(valid_tournament_players_data):
	players = []
	for player_data in valid_tournament_players_data:
			player = TournamentPlayer.objects.create(**player_data)
			players.append(player)
	return players

# TournamentPlayerのステータスを更新する
def update_tournamentplayer_status(tournament_id, player_id, status):
    TournamentPlayer.objects.filter(tournament_id = tournament_id, player_id = player_id).update(status = status)

# TournamentPlayerのvcountをインクリメントする
def increment_tournamentplayer_vcount(tournament_id, player_id):
    TournamentPlayer.objects.filter(tournament_id = tournament_id, player_id = player_id).update(victory_count = F('victory_count') + 1)

# TournamentPlayerでラウンドが終了したかどうかを判定する
def is_round_end(tournament_id):
    tournamentplayers = TournamentPlayer.objects.filter(tournament_id = tournament_id)
    # awaitステータスのプレイヤーがいたらラウンド終了ではない
    if tournamentplayers.filter(status = 'await').exists():
        return False
    return True

# TournamentPlayerのwinをawaitに変更する
def update_tournamentplayer_win_to_await(tournament_id):
    TournamentPlayer.objects.filter(tournament_id = tournament_id, status = 'win').update(status = 'await')

# Tournamentがが終了したかを判定する
def is_tournament_end(tournament_id):
    tournamentplayers = TournamentPlayer.objects.filter(tournament_id = tournament_id)
    # awaitステータスのプレイヤー1人だけの場合はトーナメント終了
    if tournamentplayers.filter(status = 'await').count() == 1:
        tournamentplayers.filter(status = 'await').update(status = 'win')
        return True
    return False

# Tournamentのstatusを更新する
def update_tournament_status(tournament_id, status):
    Tournament.objects.filter(id = tournament_id).update(status = status)
