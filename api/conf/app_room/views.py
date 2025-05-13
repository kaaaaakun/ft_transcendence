from rest_framework import viewsets
from django.utils.decorators import method_decorator
from django.db import DatabaseError

from .models import RoomMembers
from utils.decorators import admin_only

# start: ユースケースでは本来必要ないが、データの確認のために追加
@method_decorator(admin_only, name = 'dispatch')
class RoomMembersViewSet(viewsets.ModelViewSet):
    queryset = RoomMembers.objects.all()
