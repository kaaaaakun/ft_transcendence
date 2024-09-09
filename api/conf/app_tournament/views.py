import random

from rest_framework import viewsets
from .models import Tournament, TournamentPlayer
from .serializers import TournamentSerializer, TournamentPlayerSerializer
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
class TournamentPlayerViewSet(viewsets.ModelViewSet):
    queryset = TournamentPlayer.objects.all()
    serializer_class = TournamentPlayerSerializer
# :end

class LocalTournamentView(APIView):
    def get(self, request):
        cookie_tournament_id = request.COOKIES.get('tournament_id')
        # Is there a match with the start status?
        if cookie_tournament_id is None:
            return Response({"error": "tournament_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            tournament = Tournament.objects.get(id=cookie_tournament_id)
        except Tournament.DoesNotExist:
            return Response({"error": "Tournament not found."}, status=status.HTTP_404_NOT_FOUND)
        
        response_data = create_tournament_dataset(get_tournamentplayer_with_related_data(tournament.id))
        return Response(response_data, status=status.HTTP_200_OK)

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
        
        # Tournament, TournamentPlayerをDBに登録
        try:
            tournament, tournament_players = create_tournament(players)
        except ValidationError as e:
            return Response(e.detail, status = status.HTTP_400_BAD_REQUEST)

        try:
            create_next_tournament_match(tournament.id)
        except ValidationError as e:
            return Response(e.detail, status = status.HTTP_400_BAD_REQUEST)

        response_data = create_tournament_dataset(get_tournamentplayer_with_related_data(tournament.id))
        return Response(response_data, status = status.HTTP_201_CREATED)
