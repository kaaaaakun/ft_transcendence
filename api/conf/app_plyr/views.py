from rest_framework import viewsets
from .models import Player
from .serializers import PlayerSerializer

# start: ユースケースでは本来必要ないが、データの確認のために追加
class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
# end
