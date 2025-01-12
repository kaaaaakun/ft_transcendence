from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserLoginView
from .views import UserRegisterView
router = DefaultRouter()
# router.register(r'tournament', TournamentViewSet)
# router.register(r'player', TournamentPlayerViewSet)
# router.register(r'login', UserLoginView, basename='login')
# router.register(r'register', UserRegisterView, basename='register')

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('register/', UserRegisterView.as_view(), name='register'),
]
