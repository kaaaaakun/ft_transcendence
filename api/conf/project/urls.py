from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/players/', include('player.urls')),
    path('api/tournaments/', include('tournament.urls')),
    path('api/matches/', include('match.urls')),
]
