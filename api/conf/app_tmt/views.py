from rest_framework import viewsets
from .models import Tournament, TournamentPlayer
from .serializers import TournamentSerializer, TournamentPlayerSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from plyr.utils import validate_players, register_players
from .utils import validate_tournament, register_tournament

# start: ユースケースでは本来必要ないが、データの確認のために追加
class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

class TournamentPlayerViewSet(viewsets.ModelViewSet):
    queryset = TournamentPlayer.objects.all()
    serializer_class = TournamentPlayerSerializer
# :end

class LocalTournamentCreateView(APIView):
    def post(self, request):
        player_names = request.data.get('players', [])
        if not player_names:
            return Response("player names are required.", status=status.HTTP_400_BAD_REQUEST)
        
        # PlayerをDBに登録
        try:
            players = register_players(validate_players(player_names))
        except ValueError as e:
            return Response(e.detail, status = status.HTTP_400_BAD_REQUEST)
        
        # TournamentをDBに登録
        try:
            tournament = register_tournament(validate_tournament(len(players), 'start'))
        except ValueError as e:
            return Response(e.detail, status = status.HTTP_400_BAD_REQUEST)

        # TournamentPlayerをDBに登録
        # to be implemented

        return Response("Tournament created successfully.", status = status.HTTP_201_CREATED)
