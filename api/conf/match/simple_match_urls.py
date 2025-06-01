from django.urls import path
from .views import SimpleMatchView, SimpleMatchCreateView, SimpleMatchJoinView

urlpatterns = [
    path('', SimpleMatchView.as_view(), name = 'simple-match'),
    path('create/', SimpleMatchCreateView.as_view(), name = 'simple-match-create'),
    path('join/', SimpleMatchJoinView.as_view(), name = 'simple-match-join'),
]
