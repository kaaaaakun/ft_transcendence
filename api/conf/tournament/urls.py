from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, TournamentPlayerViewSet, JoinTournamentView, TournamentDetailView

router = DefaultRouter()
router.register(r'tournament', TournamentViewSet)
router.register(r'player', TournamentPlayerViewSet)

urlpatterns = [
    path('dev/', include(router.urls)),
    path('', JoinTournamentView.as_view(), name='join_tournament'),
    path('<int:tournament_id>/', TournamentDetailView.as_view(), name='tournament_detail'),
]
