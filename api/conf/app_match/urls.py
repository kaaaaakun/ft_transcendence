from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, MatchDetailViewSet, LocalScoreView

router = DefaultRouter()
router.register(r'match', MatchViewSet, basename='match')
router.register(r'detail', MatchDetailViewSet, basename='detail')

urlpatterns = [
    path('', include(router.urls)),
    path('local/score/', LocalScoreView.as_view(), name='local_score'),
]