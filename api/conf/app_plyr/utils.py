from .models import Player
from .serializers import PlayerSerializer
from rest_framework.exceptions import ValidationError

# 複数のプレイヤーをDBに登録する
# args: 文字列の配列
# return: Playerオブジェクトのリスト
# serializerでvalidationし、DBに登録する。
def register_players(player_names):
	players = []
	for name in player_names:
		player_data = {"name", name}
		player_serializer = PlayerSerializer(data=player_data)
		if player_serializer.is_valid(raise_exception = True):
			player = player_serializer.save() # save to DB
			players.append(player)
		else:
			raise ValidationError(player_serializer.errors)
	return players
