from rest_framework.exceptions import ValidationError
from django.db.models import F

from .models import Tournament, TournamentPlayer
from .serializers import TournamentSerializer , TournamentPlayerSerializer

# トーナメントの参加者を取得する
# args: tournament_id
# return: TournamentPlayerのインスタンスのリスト
def get_tournamentplayer_with_related_data(tournament_id):
    return TournamentPlayer.objects.filter(tournament_id=tournament_id).select_related('tournament_id', 'player_id').order_by('id')

# トーナメントのデータセットを作成する
# args: TournamentPlayerのインスタンスのリスト, MatchDetailのインスタンス2つ
# return: トーナメントデータセット
def create_tournament_dataset(tournamentplayer_with_related):
    tournament_dataset = {}
    participants = []
    await_players = tournamentplayer_with_related.filter(status = 'await')
    for tournamentplayer in tournamentplayer_with_related:
        participants.append(create_tournament_data(tournamentplayer,
                                                    (await_players.count() >= 2 and
                                                    ((await_players[0].player_id == tournamentplayer.player_id) or
                                                    (await_players[1].player_id == tournamentplayer.player_id)))))
    tournament_dataset['participants'] = participants
    tournament_dataset['tournament_id'] = tournamentplayer_with_related[0].tournament_id.id
    return tournament_dataset

# トーナメントデータを作成する
# args: TournamentPlayerのインスタンス, 次のプレイヤーかどうか
# return: トーナメントデータ
def create_tournament_data(tournamentplayer, is_next_player):
    return {
        "player": {
            "name": tournamentplayer.player_id.name
        },
        "tournament_players": {
            "victory_count": tournamentplayer.victory_count
        },
        "next_player": is_next_player
    }

# トーナメントを作成する
# args: Playerインスタンスのリスト
# return: Tournamentのインスタンス, TournamentPlayerのインスタンスのリスト
def create_tournament(players):
    tournament = Tournament.create(validate_tournament(len(players), 'start'))
    valid_tournament_players = validate_tournament_players(tournament.id, players)
    tournament_players = TournamentPlayer.create_players(valid_tournament_players)
    return tournament, tournament_players

# 次のトーナメントマッチを作成する
# args: tournament_id
# return: Matchのインスタンス, MatchDetailのインスタンス2つ
def create_next_tournament_match(tournament_id):
    from match.utils import create_match
    tournamentplayers = TournamentPlayer.objects.filter(tournament_id = tournament_id, status = 'await')
    if (tournamentplayers.count() < 2):
        raise ValidationError("Not enough players with status 'await' to create a match.")
    return create_match(tournament_id, tournamentplayers[0].player_id, tournamentplayers[1].player_id)


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
    for player in players:
        valid_tournament_players.append(validate_tournament_player(tournament_id, player.id, status, victory_count))
    return valid_tournament_players

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
