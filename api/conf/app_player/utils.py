from .models import Player
from .serializers import PlayerSerializer
from rest_framework.exceptions import ValidationError

# Validate multiple player
# args: 文字列の配列
# return: Playerインスタンスのリスト
def validate_players(player_names):
	valid_players_data = []
	for name in player_names:
		player_data = {"name": name}
		player_serializer = PlayerSerializer(data=player_data)
		if player_serializer.is_valid(raise_exception = True):
			valid_players_data.append(player_serializer.validated_data)
		else:
			raise ValidationError(player_serializer.errors)
	return valid_players_data

# 複数のプレイヤーをDBに登録する
# args: Playerインスタンス(validated)のリスト
# return: Playerオブジェクトのリスト
def register_players(valid_players_data):
	players = []
	for player_data in valid_players_data:
			player = Player.objects.create(**player_data)
			players.append(player)
	return players
