from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, TournamentPlayerViewSet

router = DefaultRouter()
router.register(r'tournament', TournamentViewSet)
router.register(r'player', TournamentPlayerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
