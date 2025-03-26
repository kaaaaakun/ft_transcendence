from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserView
router = DefaultRouter()

urlpatterns = [
    path('', UserView.as_view(), name='user'),
]
