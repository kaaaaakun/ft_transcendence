from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, TournamentPlayerViewSet, LocalTournamentCreateView

router = DefaultRouter()
router.register(r'tmt', TournamentViewSet)
router.register(r'plyr', TournamentPlayerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('newl/', LocalTournamentCreateView.as_view(), name='local_tournament_create'),
]
