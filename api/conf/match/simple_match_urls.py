from django.urls import path
from .views import SimpleMatchView, SimpleMatchCreateView

urlpatterns = [
    path('', SimpleMatchView.as_view(), name = 'simple-match'),
    path('create/', SimpleMatchCreateView.as_view(), name = 'simple-match-create'),
]
