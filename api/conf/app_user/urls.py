from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserLoginView
from .views import UserRegisterView
from .views import UserPasswordResetView
from .views import UserDeleteView
router = DefaultRouter()

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('register/', UserRegisterView.as_view(), name='register'),
    path('<str:login_name>/password_reset/', UserPasswordResetView.as_view(), name='password_reset'),
    path('<str:login_name>/', UserDeleteView.as_view(), name='delete'),
]
