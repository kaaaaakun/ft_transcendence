from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, MatchDetailViewSet, IncrementScoreView

router = DefaultRouter()
router.register(r'mtch', MatchViewSet)
router.register(r'dtl', MatchDetailViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('iscr/', IncrementScoreView.as_view(), name='increment_score'),
]
