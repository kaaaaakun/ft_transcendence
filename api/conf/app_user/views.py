from rest_framework import viewsets
from .models import User
from django.db.models import Q
from .utils import create_response

class UserView(viewsets.ModelViewSet):
    def get(self, display_name):
        user = User.objects.filter(display_name=display_name)
        return create_response(user)
