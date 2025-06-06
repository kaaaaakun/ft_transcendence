import random
import redis
from rest_framework import viewsets
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

import traceback


from room.utils import RoomKey
from room.models import RoomMembers

from user.utils import get_user_by_auth
from user.exceptions import AuthError


from django.utils.decorators import method_decorator
from django.db import transaction

from .models import Tournament, TournamentPlayer
from utils.decorators import admin_only
from .utils import get_latest_unfinished_tournament

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()

@method_decorator(admin_only, name = 'dispatch')
class TournamentPlayerViewSet(viewsets.ModelViewSet):
    queryset = TournamentPlayer.objects.all()
# :end

class JoinTournamentView(APIView):
    def __init__(self):
        self.redis_client = redis.StrictRedis(
            host="in_memory_db",
            port=6379,
            db=0,
            decode_responses=False  # 文字列として取得
        )
    def post(self, request):
        tournament_type = request.data.get('type')
        if tournament_type not in [4, 8]:  # 4P または 8P のみ許可
            return Response({'error': 'Invalid tournament type'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = get_user_by_auth(request.headers.get('Authorization'))
            if not user:
                raise AuthError('Authorization header is required.')

            with transaction.atomic():

                existing_participation = TournamentPlayer.objects.filter(
                    user=user,
                    tournament__is_finished=False,  # tournament経由でアクセス
                    tournament__type=tournament_type  # tournament経由でアクセス
                ).select_related('tournament').first()

                if existing_participation:
                    # 既に参加中のトーナメントがある場合、その情報を返す
                    tournament = existing_participation.tournament
                    room_data = self._get_room_data(tournament)

                    response_data = {
                        'id': tournament.id,
                        'tournament_type': tournament.type,
                        'room_id': f"tournament_{tournament.id}",
                        'current_players': room_data.get('entry_count', 1),
                        'max_players': tournament.type,
                        'is_full': int(room_data.get('entry_count', 1)) >= tournament.type,
                        'user_entry_number': existing_participation.entry_number,
                        'message': 'Already joined this tournament'
                    }

                    return Response(response_data, status=status.HTTP_200_OK)

                tournament = get_latest_unfinished_tournament(tournament_type)


                if tournament:
                    # 既存のトーナメントに参加する場合
                    room_type = self._get_room_type(tournament_type)
                    current_count = RoomKey.increment_entry_count(
                        room_type,
                        tournament.id
                    )

                    if current_count == -1:
                        # 定員オーバーまたはルームが存在しない場合、新しいトーナメントを作成
                        tournament = self._create_new_tournament(tournament_type, user)
                        room_data = self._get_room_data(tournament)
                    else:
                        # 既存のトーナメントに参加
                        self._add_user_to_existing_tournament(tournament, user)
                        room_data = self._get_room_data(tournament)
                else:
                    # 新しいトーナメントを作成
                    tournament = self._create_new_tournament(tournament_type, user)
                    room_data = self._get_room_data(tournament)

                # 3. ROOM_MEMBERSデータを作成する
                RoomMembers.objects.get_or_create(
                    room_id=f"tournament_{tournament.id}",
                    user=user
                )

                response_data = {
                    'id': tournament.id,
                    'tournament_type': tournament.type,
                    'room_id': f"tournament_{tournament.id}",
                    'current_players': room_data.get('entry_count', 1),
                    'max_players': tournament.type,
                    'is_full': int(room_data.get('entry_count', 1)) >= tournament.type,
                    'user_entry_number': self._get_user_entry_number(tournament, user)
                }

                return Response(response_data, status=status.HTTP_201_CREATED)

        except AuthError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            with open('error_log.txt', 'a') as f:
                f.write(f"Error: {str(e)}\n")
                f.write(traceback.format_exc() + "\n")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _get_room_type(self, tournament_type):
        """トーナメントタイプに基づいてルームタイプを決定"""
        return f"WAITING_{tournament_type}P"

    def _create_new_tournament(self, tournament_type, user):
            """新しいトーナメントを作成"""
            # TOURNAMENTSデータを作成
            tournament = Tournament.create(type=tournament_type)

            # ROOMSデータを作成（Redis）
            room_type = self._get_room_type(tournament_type)
            RoomKey.create_room(
                room_type=room_type,
                table_id=tournament.id,
                tournament_id=tournament.id
            )

            # 最初のプレイヤーを追加
            TournamentPlayer.objects.create(
                tournament=tournament,
                user=user,
                entry_number=0,
                round=1
            )

            return tournament

    def _add_user_to_existing_tournament(self, tournament, user):
        """既存のトーナメントにユーザーを追加"""
        # 既に参加しているかチェック
        if TournamentPlayer.objects.filter(tournament=tournament, user=user).exists():
            raise ValidationError("User already joined this tournament")

        # 次のエントリー番号を取得
        existing_players_count = TournamentPlayer.objects.filter(tournament=tournament).count()

        if existing_players_count >= tournament.type:
            raise ValidationError("Tournament is already full")

        TournamentPlayer.objects.create(
            tournament=tournament,
            user=user,
            entry_number=existing_players_count,
            round=1
        )

    def _get_room_data(self, tournament):
        """Redisからルームデータを取得"""
        room_type = self._get_room_type(tournament.type)
        return RoomKey.get_room(room_type, tournament.id)

    def _get_user_entry_number(self, tournament, user):
        """ユーザーのエントリー番号を取得"""
        try:
            player = TournamentPlayer.objects.get(tournament=tournament, user=user)
            return player.entry_number
        except TournamentPlayer.DoesNotExist:
            return None


class TournamentDetailView(APIView):
    def __init__(self):
        self.redis_client = redis.StrictRedis(
            host="in_memory_db",
            port=6379,
            db=0,
            decode_responses=False
        )

    def get(self, request, tournament_id):
        """
        tournament_idをもとにroom名やトーナメント詳細情報を返す
        """
        try:
            user = get_user_by_auth(request.headers.get('Authorization'))
            if not user:
                raise AuthError('Authorization header is required.')

            # トーナメントの存在確認
            try:
                tournament = Tournament.objects.get(id=tournament_id)
            except Tournament.DoesNotExist:
                return Response(
                    {'error': 'Tournament not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # ユーザーがこのトーナメントに参加しているかチェック
            try:
                tournament_player = TournamentPlayer.objects.get(
                    tournament=tournament,
                    user=user
                )
            except TournamentPlayer.DoesNotExist:
                return Response(
                    {'error': 'User not participating in this tournament'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Room情報を取得
            room_type = self._get_room_type(tournament.type)
            room_id = f"room.{room_type}.{tournament.id}"
            room_data = self._get_room_data(tournament)

            # トーナメント参加者リストを取得
            tournament_players = TournamentPlayer.objects.filter(
                tournament=tournament
            ).select_related('user').order_by('entry_number')

            players_data = []
            for player in tournament_players:
                players_data.append({
                    'user_id': player.user.id,
                    'display_name': player.user.display_name,
                    'entry_number': player.entry_number,
                    'round': player.round
                })

            response_data = {
                'tournament_id': tournament.id,
                'tournament_type': tournament.type,
                'is_finished': tournament.is_finished,
                'room_id': room_id,
                'room_name': room_id,
                'websocket_url': f"room.{room_type}.{tournament.id}",
                'current_players': len(players_data),
                'max_players': tournament.type,
                'is_full': len(players_data) >= tournament.type,
                'user_entry_number': tournament_player.entry_number,
                'players': players_data,
                'room_status': self._get_room_status(room_data, len(players_data), tournament.type)
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except AuthError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            print(f"ERROR in TournamentDetailView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _get_room_type(self, tournament_type):
        """トーナメントタイプに基づいてルームタイプを決定"""
        return f"WAITING_{tournament_type}P"

    def _get_room_data(self, tournament):
        """Redisからルームデータを取得"""
        room_type = self._get_room_type(tournament.type)
        return RoomKey.get_room(room_type, tournament.id)

    def _get_room_status(self, room_data, current_players, max_players):
        """ルームの状態を判定"""
        if not room_data:
            return 'not_created'

        if current_players >= max_players:
            return 'full'
        elif current_players > 0:
            return 'waiting'
        else:
            return 'empty'
