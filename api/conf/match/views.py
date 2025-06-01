from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.db import DatabaseError

from .models import Match, MatchDetail
from .utils import create_simple_match_response, try_join_match
from user.utils import get_user_by_auth
from user.exceptions import AuthError
from room.models import RoomMembers
from room.utils import RoomKey
from utils.decorators import admin_only

SIMPLE_WAITING_ROOM_LIMIT = 5

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()

@method_decorator(admin_only, name = 'dispatch')
class MatchDetailViewSet(viewsets.ModelViewSet):
    queryset = MatchDetail.objects.all()
# end

class LocalSimpleMatchView(APIView):
    def get(self, request): # request is not used in this case, but it is required by the APIView
        try:
            response_data = {'left': {'player_name': 'L'},
                            'right': {'player_name': 'R'}
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class SimpleMatchView(APIView):
    def get(self, request):
        match_type = request.query_params.get('type')
        if match_type == 'remote':
            try:
                user = get_user_by_auth(request.headers.get('Authorization'))
                if not user:
                    raise AuthError('Authorization header is incorrect.')
                waiting_simple_room_keys = RoomKey.get_keys_by_type_and_entry_count("SIMPLE", 2)
                if not waiting_simple_room_keys:
                    return Response([], status = status.HTTP_200_OK)
                return Response(create_simple_match_response(waiting_simple_room_keys), status = status.HTTP_200_OK)
            except AuthError as e:
                return Response({"error": str(e)}, status = status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"error": "Invalid match type."}, status = status.HTTP_400_BAD_REQUEST)

class SimpleMatchCreateView(APIView):
    def post(self, request):
        match_type = request.data.get('type')
        if match_type != 'remote':
            return Response({"error": "Invalid match type."}, status = status.HTTP_400_BAD_REQUEST)
        try:
            user = get_user_by_auth(request.headers.get('Authorization'))
            if not user:
                raise AuthError('Authorization header is incorrect.')
            waiting_simple_room_keys = RoomKey.get_keys_by_type_and_entry_count("SIMPLE", 2)
            if len(waiting_simple_room_keys) < SIMPLE_WAITING_ROOM_LIMIT:
                match = Match.objects.create()
                room_key = RoomKey.create_room(room_type = "SIMPLE", table_id = match.id, match_id = match.id)
                RoomMembers.objects.create(room_id = room_key, user = user)
                return Response({"match_id": match.id}, status = status.HTTP_201_CREATED)
            else:
                return Response({"error": "Waiting room limit reached."}, status = status.HTTP_400_BAD_REQUEST)

        except AuthError as e:
            return Response({"error": str(e)}, status = status.HTTP_401_UNAUTHORIZED)
        except DatabaseError as e:
            return Response({"error": "Database error occurred."}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class SimpleMatchJoinView(APIView):
    def post(self, request):
        match_id = request.data.get('match_id')
        if not match_id:
            return Response({"error": "Match ID is required."}, status = status.HTTP_400_BAD_REQUEST)
        try:
            user = get_user_by_auth(request.headers.get('Authorization'))
            if not user:
                raise AuthError('Authorization header is incorrect.')
            response, success = try_join_match(match_id, user)
            if not success:
                return Response(response, status = status.HTTP_400_BAD_REQUEST)
            return Response(response, status = status.HTTP_201_CREATED)
        except AuthError as e:
            return Response({"error": str(e)}, status = status.HTTP_401_UNAUTHORIZED)
        except DatabaseError as e:
            return Response({"error": "Database error occurred."}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
