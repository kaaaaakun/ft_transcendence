from .models import players
from .serializers import playersSerializer
from rest_framework.exceptions import ValidationError

# Validate multiple player
# args: 文字列の配列
# return: playersインスタンスのリスト
def validate_players(player_names):
	valid_players_data = []
	for name in player_names:
		player_data = {"name": name}
		player_serializer = playersSerializer(data=player_data)
		if player_serializer.is_valid(raise_exception = True):
			valid_players_data.append(player_serializer.validated_data)
		else:
			raise ValidationError(player_serializer.errors)
	return valid_players_data

# 複数のプレイヤーをDBに登録する
# args: playersインスタンス(validated)のリスト
# return: playersオブジェクトのリスト
def register_players(valid_players_data):
	created_players = []
	for player_data in valid_players_data:
			player = players.objects.create(**player_data)
			created_players.append(player)
	return created_players
