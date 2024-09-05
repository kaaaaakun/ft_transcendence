from rest_framework import viewsets
from .models import players
from .serializers import playersSerializer

from django.utils.decorators import method_decorator
from utils.decorators import admin_only

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class playersViewSet(viewsets.ModelViewSet):
    queryset = players.objects.all()
    serializer_class = playersSerializer
# end
