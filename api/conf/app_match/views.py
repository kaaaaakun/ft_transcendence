from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.db import DatabaseError

from .models import Match, MatchDetail
from tournament.models import Tournament
from .serializers import MatchSerializer, MatchDetailSerializer
from .utils import ( get_matchdetail_with_related_data, format_player_positions )
from utils.decorators import admin_only

END_OF_GAME_SCORE = 11

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

@method_decorator(admin_only, name = 'dispatch')
class MatchDetailViewSet(viewsets.ModelViewSet):
    queryset = MatchDetail.objects.all()
    serializer_class = MatchDetailSerializer
# end

class LocalSimpleMatchView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            response_data = {'left': {'player_name': 'L'},
                            'right': {'player_name': 'R'}
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class LocalTournamentMatchView(APIView):
    def get(self, request):
        cookie_tournament_id = request.COOKIES.get('tournament_id')
        # Is there a match with the start status?
        if cookie_tournament_id is None:
            return Response({"error": "tournament_id is required."}, status = status.HTTP_404_NOT_FOUND)
        try:
            tournament = Tournament.objects.get(id=cookie_tournament_id)
            if tournament.status != 'start':
                return Response({"error": "Tournament is over."}, status = status.HTTP_400_BAD_REQUEST)
            
            displayable_match_id = Match.objects.get(tournament_id = cookie_tournament_id, status = 'start').id

            response_data = format_player_positions(get_matchdetail_with_related_data(displayable_match_id))
            return Response(response_data, status=status.HTTP_200_OK)

        except Tournament.DoesNotExist:
            return Response({"error": "Tournament not found."}, status = status.HTTP_404_NOT_FOUND)
        except Match.DoesNotExist:
            return Response({"error": "Match with start status not found."}, status = status.HTTP_404_NOT_FOUND)
        except MatchDetail.DoesNotExist:
            return Response({"error": "MatchDetail not found."}, status = status.HTTP_404_NOT_FOUND)
        except DatabaseError as e:
            return Response({"error": str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
