from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserLoginView
from .views import UserSignUpView
router = DefaultRouter()
# router.register(r'tournament', TournamentViewSet)
# router.register(r'player', TournamentPlayerViewSet)
# router.register(r'login', UserLoginView, basename='login')
# router.register(r'signup', UserSignUpView, basename='signup')

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('signup/', UserSignUpView.as_view(), name='signup'),
]
