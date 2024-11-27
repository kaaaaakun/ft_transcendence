from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^api/ws/s_match/$', consumers.SMatchConsumer.as_asgi()),
    re_path(r'^api/ws/t_match/$', consumers.TMatchConsumer.as_asgi()),
]