from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserView
from friend.views import (
    FriendListByNameView,
    FriendRequestByNameView,
    FriendRequestsListByNameView,
)
from .views import UpdateLastLoginView
from .views import UserUpdateView
from .views import UserProfileView
router = DefaultRouter()

urlpatterns = [
    path('', UserView.as_view(), name='user'),
    path('<str:display_name>/friends', FriendListByNameView.as_view()),
    path('<str:display_name>/friend_requests', FriendRequestsListByNameView.as_view()),
    path('friends/<str:friend_name>', FriendRequestByNameView.as_view()),
    path('last_login/', UpdateLastLoginView.as_view(), name='update_last_login'),
    path('update/', UserUpdateView.as_view(), name='user_update'),
    path('user/<str:display_name>/', UserProfileView.as_view(), name='profile'),
]
