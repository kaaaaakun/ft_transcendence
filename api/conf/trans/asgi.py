"""
ASGI config for trans project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trans.settings')
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from match.routing import websocket_urlpatterns as match_websocket_urlpatterns
from room.routing import websocket_urlpatterns as room_websocket_urlpatterns

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter([
        *match_websocket_urlpatterns,
        *room_websocket_urlpatterns,
        ]),
})
