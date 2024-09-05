from django.db import models
from player.models import players

class Tournament(models.Model):
    num_of_player = models.IntegerField()
    status = models.CharField(max_length=10)

# 外部キーを利用する。
# Ref: https://blog.css-net.co.jp/entry/2023/05/24/105218 (基本, 引数の意味)
# Ref: https://qiita.com/taiyaki/items/a2bed64395c7af530dfb (別のアプリからの参照)
class tournament_players(models.Model):
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    player_id = models.ForeignKey(players, on_delete=models.CASCADE)
    victory_count = models.IntegerField()
    status = models.CharField(max_length=10)