from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.db import DatabaseError

from .models import Match, MatchDetail
from .utils import create_simple_match_response, try_join_match, try_create_simple_match
from user.utils import get_user_by_auth
from user.exceptions import AuthError
from room.models import RoomMembers
from room.utils import RoomKey
from utils.decorators import admin_only

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
            response, success = try_create_simple_match(user)
            if not success:
                return Response(response, status = status.HTTP_400_BAD_REQUEST)
            return Response(response, status = status.HTTP_201_CREATED)
        except AuthError as e:
            return Response({"error": str(e)}, status = status.HTTP_401_UNAUTHORIZED)

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

class MatchIdView(APIView):
    def get(self, request, match_id):
        try:
            user = get_user_by_auth(request.headers.get('Authorization'))
            if not user:
                raise AuthError('Authorization header is incorrect.')

            match_id_int = int(match_id)
            match = Match.objects.filter(id = match_id_int).first()
            if not match:
                return Response({"error": "Match not found."}, status = status.HTTP_400_BAD_REQUEST)
            if match.is_finished:
                return Response({"error": "Match is already finished."}, status = status.HTTP_400_BAD_REQUEST)

            if match.tournament is None:
                room_type = "SIMPLE"
            else:
                room_type = "TOURNAMENT_MATCH"

            room_id = RoomKey.generate_key(room_type, match_id_int)
            room_membership = RoomMembers.objects.filter(room_id = room_id, user = user).first()
            if not room_membership: # Room_members data will be deleted when the match_detail is created.(Not implemented yet)
                match_participation = MatchDetail.objects.filter(match = match, user = user).first()
                if not match_participation:
                    return Response({"error": "User is not part of this match."}, status = status.HTTP_403_FORBIDDEN)
            return Response({"room_id": room_id}, status = status.HTTP_200_OK)

        except AuthError as e:
            return Response({"error": str(e)}, status = status.HTTP_401_UNAUTHORIZED)
        except (ValueError, TypeError):
            return Response({"error": "Invalid match_id."}, status = status.HTTP_400_BAD_REQUEST)
        except DatabaseError:
            return Response({"error": "Database error occurred."}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
