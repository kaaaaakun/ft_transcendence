from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.db import DatabaseError

from .models import Match, MatchDetail
from utils.decorators import admin_only

END_OF_GAME_SCORE = 11

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()

@method_decorator(admin_only, name = 'dispatch')
class MatchDetailViewSet(viewsets.ModelViewSet):
    queryset = MatchDetail.objects.all()
# end

class LocalSimpleMatchView(APIView):
    def get(self):
        try:
            response_data = {'left': {'player_name': 'L'},
                            'right': {'player_name': 'R'}
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class SimpleMatchView(APIView):
    def get(self, request):
        return Response({"message": "GET request received"}, status = status.HTTP_200_OK) # TBD
