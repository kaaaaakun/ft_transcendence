from django.db import models
from django.db.models import F

class Tournament(models.Model):
    num_of_player = models.IntegerField()
    status = models.CharField(max_length=10)

    class Meta:
        db_table = 'tournaments'

    @classmethod
    def create(cls, data):
        return cls.objects.create(num_of_player = data['num_of_player'], status = data['status'])

    @classmethod
    def update_status(cls, tournament_id, status):
        cls.objects.filter(id=tournament_id).update(status=status)

    @classmethod
    def is_round_end(cls, tournament_id):
        tournament_players = TournamentPlayer.objects.filter(tournament_id = tournament_id)
        if tournament_players.filter(status = 'await').exists():
            return False
        return True


# 外部キーを利用する。
# Ref: https://blog.css-net.co.jp/entry/2023/05/24/105218 (基本, 引数の意味)
# Ref: https://qiita.com/taiyaki/items/a2bed64395c7af530dfb (別のアプリからの参照)
class TournamentPlayer(models.Model):
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    victory_count = models.IntegerField()
    status = models.CharField(max_length=10)

    class Meta:
        db_table = 'tournament_players'

    @classmethod
    def create_players(cls, valid_data):
        players = []
        for data in valid_data:
            players.append(cls.objects.create(
                tournament_id = data['tournament_id'], 
                player_id = data['player_id'],
                victory_count = data['victory_count'],
                status = data['status'])
            )
        return players
    
    @classmethod
    def update_status(cls, tournamentplayer_id, player_id, status):
        cls.objects.filter(id = tournamentplayer_id, player_id = player_id).update(status = status)

    @classmethod
    def increment_victory_count(cls, tournamentplayer_id, player_id):
        cls.objects.filter(id = tournamentplayer_id, player_id = player_id).update(victory_count = F('victory_count') + 1)
