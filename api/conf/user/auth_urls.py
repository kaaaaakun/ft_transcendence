from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserLoginView
from .views import UserPasswordResetView
from .views import UserSecretQuestionView
from .views import UserCurrentView

router = DefaultRouter()

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('password-reset/secret-question/', UserSecretQuestionView.as_view(), name='password_reset'),
    path('password-reset/', UserPasswordResetView.as_view(), name='secret_question'),
    path('current-user/', UserCurrentView.as_view(), name='current_user'),
]
