from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, MatchDetailViewSet, LocalScoreView

router = DefaultRouter()
router.register(r'match', MatchViewSet)
router.register(r'detail', MatchDetailViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('local/score/', LocalScoreView.as_view(), name='local_score'),
]
