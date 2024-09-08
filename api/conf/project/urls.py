from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/player/', include('player.urls')),
    path('api/tournament/', include('tournament.urls')),
    path('api/match/', include('match.urls')),
]
