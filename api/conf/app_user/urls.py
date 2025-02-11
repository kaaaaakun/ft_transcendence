from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserView

router = DefaultRouter()

urlpatterns = [
    path('user/<str:display_name>', UserView.as_view(), name='user'),
]
