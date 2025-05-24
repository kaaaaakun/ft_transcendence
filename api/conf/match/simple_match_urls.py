from django.urls import path
from .views import SimpleMatchView

urlpatterns = [
    path('', SimpleMatchView.as_view(), name = 'simple-match'),
]
