from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserLoginView
router = DefaultRouter()

urlpatterns = [

    path('login/', UserLoginView.as_view(), name='login'),


]
