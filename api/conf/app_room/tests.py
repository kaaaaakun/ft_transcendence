from django.test import TestCase
from django.db import IntegrityError

from .models import RoomMembers
from user.tests import create_test_user_4

#---------------
# Helper function to create Data
#---------------
def create_test_room_members_4():
    users = create_test_user_4()
    roomMembers = []
    for user in users:
        roomMembers.append(RoomMembers.objects.create(room_id = 'test_room', user = user))
    return roomMembers

#--------------
# Test cases for RoomMembers model
#--------------
class RoomMembersTestCase(TestCase):
    def test_create_room_members(self):
        roomMembers = create_test_room_members_4()
        self.assertEqual(len(roomMembers), 4)
        for i, roomMember in enumerate(roomMembers):
            self.assertEqual(roomMember.room_id, 'test_room')

    def test_unique_constraint(self):
        users = create_test_user_4()
        roomMember1 = RoomMembers.objects.create(room_id = 'test_room', user = users[0])
        with self.assertRaises(IntegrityError):
            roomMember2 = RoomMembers.objects.create(room_id = 'test_room', user = users[0])
