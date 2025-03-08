from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserLoginView
from .views import UserRegisterView
from .views import UserPasswordResetView
from .views import UserDeleteView
from .views import UserView
from .views import UserUpdateView
from .views import UpdateLastLoginView
router = DefaultRouter()

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('last_login/', UpdateLastLoginView.as_view(), name='last_login'),
    path('register/', UserRegisterView.as_view(), name='register'),
    path('<str:login_name>/password_reset/', UserPasswordResetView.as_view(), name='password_reset'),
    path('update/', UserUpdateView.as_view(), name='user_update'),
    path('<str:login_name>/', UserDeleteView.as_view(), name='delete'),
    path('user/<str:display_name>/', UserView.as_view(), name='user'),
]
