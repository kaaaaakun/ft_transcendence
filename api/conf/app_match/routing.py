from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^api/ws/smatch/$', consumers.SMatchConsumer.as_asgi()),
    re_path(r'^api/ws/tmatch/$', consumers.TMatchConsumer.as_asgi()),
]