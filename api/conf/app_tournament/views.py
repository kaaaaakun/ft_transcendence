import random
from rest_framework import viewsets
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from django.utils.decorators import method_decorator

from .models import Tournament, TournamentPlayer
from utils.decorators import admin_only

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()

@method_decorator(admin_only, name = 'dispatch')
class TournamentPlayerViewSet(viewsets.ModelViewSet):
    queryset = TournamentPlayer.objects.all()
# :end
