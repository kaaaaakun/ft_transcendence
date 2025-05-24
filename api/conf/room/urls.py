from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomMembersViewSet

router = DefaultRouter()
router.register(r'member', RoomMembersViewSet, basename='member')

urlpatterns = [
    path('', include(router.urls)),
]
