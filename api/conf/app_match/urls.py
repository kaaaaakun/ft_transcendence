from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import matchesViewSet, match_detailsViewSet, LocalMatchView, LocalScoreView

router = DefaultRouter()
router.register(r'match', matchesViewSet, basename='match')
router.register(r'detail', match_detailsViewSet, basename='detail')

urlpatterns = [
    path('', include(router.urls)),
    path('local/', LocalMatchView.as_view(), name='local'),
    path('local/score/', LocalScoreView.as_view(), name='local_score'),
]
