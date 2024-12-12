from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^api/ws/local-simple-match/$', consumers.LocalSimpleMatchConsumer.as_asgi()),
    re_path(r'^api/ws/local-tournament-match/$', consumers.LocalTournamentMatchConsumer.as_asgi()),
]