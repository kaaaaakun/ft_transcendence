from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import playersViewSet

router = DefaultRouter()
router.register(r'player', playersViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
