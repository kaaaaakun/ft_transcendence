from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"^api/ws/room\.(?P<room_type>WAITING_4P|WAITING_8P)\.(?P<room_id>\w+)/$", consumers.TournamentWaitRoomConsumer.as_asgi()),
    re_path(r"^api/ws/room\.(?P<room_type>SIMPLE|TOURNAMENT_MATCH)\.(?P<room_id>\w+)/$", consumers.MatchRoomConsumer.as_asgi())
]
