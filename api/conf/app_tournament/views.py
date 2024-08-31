import random

from rest_framework import viewsets
from .models import Tournament, TournamentPlayer
from .serializers import TournamentSerializer, TournamentPlayerSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from player.utils import validate_players, register_players
from .utils import create_tournament
from player.serializers import PlayerSerializer

from django.utils.decorators import method_decorator
from utils.decorators import admin_only

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

@method_decorator(admin_only, name = 'dispatch')
class TournamentPlayerViewSet(viewsets.ModelViewSet):
    queryset = TournamentPlayer.objects.all()
    serializer_class = TournamentPlayerSerializer
# :end

class LocalTournamentView(APIView):
    def post(self, request):
        player_names = request.data.get('players', [])
        if not player_names:
            return Response("player names are required.", status=status.HTTP_400_BAD_REQUEST)
        # プレイヤー数のバリデーション
        valid_player_num = [2, 4, 8]
        if (len(player_names) not in valid_player_num):
            return Response("The number of players must be 2, 4, or 8.", status=status.HTTP_400_BAD_REQUEST)
        # プレイヤー名をシャッフル
        random.shuffle(player_names)
        # PlayerをDBに登録
        try:
            players = register_players(validate_players(player_names))
        except ValueError as e:
            return Response(e.detail, status = status.HTTP_400_BAD_REQUEST)
        
        # Tournament, TournamentPlayerをDBに登録
        try:
            tournament, tournament_players = create_tournament(players)
        except ValueError as e:
            return Response(e.detail, status = status.HTTP_400_BAD_REQUEST)


        # TournamentPlayerをDBに登録
        # to be implemented


        # code example. return JSON response
        response = {
            'Tournament_id': tournament.id,
            'Tournament_all': TournamentSerializer(tournament).data,
            'Players_id': [player.id for player in players],
            'Players_all': PlayerSerializer(players, many=True).data
        }

        return Response(response, status = status.HTTP_201_CREATED)
