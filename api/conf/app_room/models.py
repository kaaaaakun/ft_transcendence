from django.db import models
from user.models import User

class RoomMembers(models.Model):
    room_id = models.CharField(max_length = 100)
    user = models.ForeignKey(User, on_delete = models.CASCADE)

    class Meta:
        db_table = 'room_members'
        constraints = [
            models.UniqueConstraint(fields = ['room_id', 'user'], name = 'unique_room_user')
        ]
