from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserLoginView
from .views import UserPasswordResetView
router = DefaultRouter()

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('<str:login_name>/password_reset/', UserPasswordResetView.as_view(), name='password_reset'),
]
