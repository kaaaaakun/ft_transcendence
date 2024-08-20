from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from plyr.views import PlayerViewSet
from tmt.views import TournamentViewSet, TournamentPlayerViewSet
from mtch.views import MatchViewSet, MatchDetailViewSet

router = DefaultRouter()
router.register(r'plyr', PlayerViewSet)
router.register(r'tmt', TournamentViewSet)
router.register(r'tmtplyr', TournamentPlayerViewSet)
router.register(r'mtch', MatchViewSet)
router.register(r'mtchdtl', MatchDetailViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
]
