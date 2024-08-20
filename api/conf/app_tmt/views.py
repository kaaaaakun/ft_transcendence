from rest_framework import viewsets
from .models import Tournament, TournamentPlayer
from .serializers import TournamentSerializer, TournamentPlayerSerializer

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

class TournamentPlayerViewSet(viewsets.ModelViewSet):
    queryset = TournamentPlayer.objects.all()
    serializer_class = TournamentPlayerSerializer