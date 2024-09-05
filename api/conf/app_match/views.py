from rest_framework import viewsets
from .models import Match, match_details
from .serializers import MatchSerializer, match_detailsSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import ( increment_score, validate_and_update_matchdetail,
    get_matchdetail_with_related_data, update_when_match_end, create_ponggame_dataset )
from rest_framework.exceptions import ValidationError
from tournament.utils import ( update_tournamentplayer_status, increment_tournamentplayer_vcount, 
    is_round_end, update_tournamentplayer_win_to_await, is_tournament_end, update_tournament_status )

from django.utils.decorators import method_decorator
from utils.decorators import admin_only

END_OF_GAME_SCORE = 10

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

@method_decorator(admin_only, name = 'dispatch')
class match_detailsViewSet(viewsets.ModelViewSet):
    queryset = match_details.objects.all()
    serializer_class = match_detailsSerializer
# end

class LocalMatchView(APIView):
    def get(self, request):
        match_id = Match.objects.filter(status = 'start').first().id
        if match_id is None:
            return Response({"error": "Match with start status not found."}, status=status.HTTP_404_NOT_FOUND)
        response_data = create_ponggame_dataset(get_matchdetail_with_related_data(match_id))
        return Response(response_data, status=status.HTTP_200_OK)

class LocalScoreView(APIView):
    def patch(self, request):
        match_id = request.data.get('matchdetail', {}).get('match_id')
        player_id = request.data.get('matchdetail', {}).get('player_id')

        if match_id is None or player_id is None:
            return Response({"error": "match_id and player_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        # スコアをインクリメントしたmatch_detailsのインスタンスを取得
        matchdetail_instance = increment_score(match_id, player_id)
        if matchdetail_instance is None:
            return Response({"error": "match_details not found."}, status=status.HTTP_404_NOT_FOUND)

        # match_detailsのDB情報を更新
        try:
            matchdetail = validate_and_update_matchdetail(matchdetail_instance)
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

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
            else: # create_next_match(to be implemented)
                pass

        # Responseの作成
        response_data = create_ponggame_dataset(get_matchdetail_with_related_data(match_id))
        return Response(response_data, status=status.HTTP_200_OK)
