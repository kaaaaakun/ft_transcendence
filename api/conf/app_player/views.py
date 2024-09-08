from rest_framework import viewsets
from .models import Player
from .serializers import PlayerSerializer

from django.utils.decorators import method_decorator
from utils.decorators import admin_only

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
# end
