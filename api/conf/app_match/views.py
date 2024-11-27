from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils.decorators import method_decorator
from django.db import transaction, DatabaseError

from .models import Match, MatchDetail
from tournament.models import Tournament
from .serializers import MatchSerializer, MatchDetailSerializer
from .utils import ( increment_score, validate_and_update_matchdetail,
    get_matchdetail_with_related_data, update_when_match_end, json_playerposition_from_matchdetails )
from tournament.utils import ( is_round_end, update_tournamentplayer_win_to_await, is_tournament_end,
    update_tournament_status, create_next_tournament_match )
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

class LocalMatchView(APIView):
    def get(self, request):
        cookie_tournament_id = request.COOKIES.get('tournament_id')
        # Is there a match with the start status?
        if cookie_tournament_id is None:
            # will be implemented in the future.
            # PlayNowの場合はこちらになり、cookieにtournament_idがないので、player positionのレスポンスをデフォルトで返す
            return Response({"error": "tournament_id is required."}, status = status.HTTP_404_NOT_FOUND)
        try:
            tournament = Tournament.objects.get(id=cookie_tournament_id)
            if tournament.status != 'start':
                return Response({"error": "Tournament is over."}, status = status.HTTP_400_BAD_REQUEST)
            
            displayable_match_id = Match.objects.get(tournament_id = cookie_tournament_id, status = 'start').id

            response_data = json_playerposition_from_matchdetails(get_matchdetail_with_related_data(displayable_match_id))
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

class LocalScoreView(APIView):
    def patch(self, request):
        match_id = request.data.get('match_id')
        player_id = request.data.get('player_id')

        if match_id is None or player_id is None:
            return Response({"error": "match_id and player_id are required."}, status = status.HTTP_400_BAD_REQUEST)
        try:
            match = Match.objects.get(id=match_id)
            if match.status == 'end':
                return Response({"error": "Match is over."}, status = status.HTTP_400_BAD_REQUEST)

            # スコアをインクリメントしたMatchDetailのインスタンスを取得
            matchdetail_instance = increment_score(match_id, player_id)
            if matchdetail_instance is None:
                return Response({"error": "MatchDetail not found."}, status = status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                matchdetail = validate_and_update_matchdetail(matchdetail_instance)

                # 対戦が終了した時の処理
                if matchdetail.score >= END_OF_GAME_SCORE:
                    # Prepare variables use several times
                    tournament_id = Match.objects.get(id=match_id).tournament_id
                    # シンプルなテーブル更新処理
                    update_when_match_end(match_id, player_id, tournament_id)

                    # トーナメントラウンドが終了した時の処理
                    if is_round_end(tournament_id):
                        update_tournamentplayer_win_to_await(tournament_id)

                    # トーナメントの終了判定
                    if is_tournament_end(tournament_id):
                        update_tournament_status(tournament_id.id, 'end')
                    else:
                        create_next_tournament_match(tournament_id.id)

            # Responseの作成
            response_data = json_playerposition_from_matchdetails(get_matchdetail_with_related_data(match_id))
            return Response(response_data, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response(e.detail, status = status.HTTP_400_BAD_REQUEST)
        except Match.DoesNotExist:
            return Response({"error": "Match not found."}, status = status.HTTP_404_NOT_FOUND)
        except MatchDetail.DoesNotExist:
            return Response({"error": "MatchDetail not found."}, status = status.HTTP_404_NOT_FOUND)
        except DatabaseError as e:
            return Response({"error": str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
