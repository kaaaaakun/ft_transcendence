from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^api/ws/smatch/$', consumers.LocalSimpleMatchConsumer.as_asgi()),
    re_path(r'^api/ws/tmatch/$', consumers.LocalTournamentMatchConsumer.as_asgi()),
]