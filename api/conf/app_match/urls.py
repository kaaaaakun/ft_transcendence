from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, MatchDetailViewSet, LocalSimpleMatchView, LocalTournamentMatchView

router = DefaultRouter()
router.register(r'match', MatchViewSet, basename='match')
router.register(r'detail', MatchDetailViewSet, basename='detail')

urlpatterns = [
    path('', include(router.urls)),
    path('local/', LocalSimpleMatchView.as_view(), name='local'),
    path('localtournament/', LocalTournamentMatchView.as_view(), name='localtournament'),
]
