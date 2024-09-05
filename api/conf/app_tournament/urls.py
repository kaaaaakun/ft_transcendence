from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, tournament_playersViewSet, LocalTournamentView

router = DefaultRouter()
router.register(r'tournament', TournamentViewSet)
router.register(r'player', tournament_playersViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('local/', LocalTournamentView.as_view(), name='local_tournament'),
]
