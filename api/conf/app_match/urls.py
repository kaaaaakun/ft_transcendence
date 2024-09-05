from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, match_detailsViewSet, LocalMatchView, LocalScoreView

router = DefaultRouter()
router.register(r'match', MatchViewSet, basename='match')
router.register(r'detail', match_detailsViewSet, basename='detail')

urlpatterns = [
    path('', include(router.urls)),
    path('local/', LocalMatchView.as_view(), name='local'),
    path('local/score/', LocalScoreView.as_view(), name='local_score'),
]
