import random

from rest_framework import viewsets
from .models import Tournament, tournament_players
from .serializers import TournamentSerializer, tournament_playersSerializer
from rest_framework.exceptions import ValidationError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from player.utils import validate_players, register_players
from .utils import create_tournament, create_next_tournament_match, create_tournament_dataset, get_tournamentplayer_with_related_data
from player.serializers import PlayerSerializer

from django.utils.decorators import method_decorator
from utils.decorators import admin_only

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

@method_decorator(admin_only, name = 'dispatch')
class tournament_playersViewSet(viewsets.ModelViewSet):
    queryset = tournament_players.objects.all()
    serializer_class = tournament_playersSerializer
# :end

class LocalTournamentView(APIView):
    def post(self, request):
        player_names = request.data.get('players', [])
        if not player_names:
            return Response("player names are required.", status=status.HTTP_400_BAD_REQUEST)
        # プレイヤー名をシャッフル
        random.shuffle(player_names)
        # PlayerをDBに登録
        try:
            players = register_players(validate_players(player_names))
        except ValidationError as e:
            return Response(e.detail, status = status.HTTP_400_BAD_REQUEST)
        
        # Tournament, tournament_playersをDBに登録
        try:
            tournament, tournament_players = create_tournament(players)
        except ValidationError as e:
            return Response(e.detail, status = status.HTTP_400_BAD_REQUEST)

        try:
            match, matchdetail1, matchdetail2 = create_next_tournament_match(tournament.id)
        except ValidationError as e:
            return Response(e.detail, status = status.HTTP_400_BAD_REQUEST)

        response_data = create_tournament_dataset(get_tournamentplayer_with_related_data(tournament.id), matchdetail1, matchdetail2)
        return Response(response_data, status = status.HTTP_201_CREATED)
