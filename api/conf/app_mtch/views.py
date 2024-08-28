from rest_framework import viewsets
from .models import Match, MatchDetail
from .serializers import MatchSerializer, MatchDetailSerializer

# start: ユースケースでは本来必要ないが、データの確認のために追加
class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

class MatchDetailViewSet(viewsets.ModelViewSet):
    queryset = MatchDetail.objects.all()
    serializer_class = MatchDetailSerializer
# end
