from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('health/', health_check),
    path('api/admin/', admin.site.urls),
    path('api/players/', include('player.urls')),
    path('api/tournaments/', include('tournament.urls')),
    path('api/matches/', include('match.urls')),
    path('api/users/', include('user.urls')),
]
