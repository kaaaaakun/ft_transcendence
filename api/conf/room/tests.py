from django.test import TestCase
from django.db import IntegrityError

from .models import RoomMembers
from .utils import RoomKey
from user.tests import create_test_user, create_test_user_4

#---------------
# Helper function to create Data
#---------------
def create_room_simple(table_id):
    room_type = "SIMPLE"
    table_id = table_id
    match_id = table_id
    tournament_id = None
    return RoomKey.create_room(room_type, table_id, match_id, tournament_id)

def create_room_tournament_match():
    room_type = "TOURNAMENT_MATCH"
    table_id = 2
    match_id = 2
    tournament_id = 1
    return RoomKey.create_room(room_type, table_id, match_id, tournament_id)

def create_room_waiting_4p():
    room_type = "WAITING_4P"
    table_id = 3
    match_id = None
    tournament_id = 3
    return RoomKey.create_room(room_type, table_id, match_id, tournament_id)

def create_room_waiting_8p():
    room_type = "WAITING_8P"
    table_id = 4
    match_id = None
    tournament_id = 4
    return RoomKey.create_room(room_type, table_id, match_id, tournament_id)

def create_test_room_members_simple():
    user = create_test_user('z', 'z', 'z', 'z', 'z')
    create_room_simple(1)
    return RoomMembers.objects.create(room_id = 'room:SIMPLE:1', user = user)

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

#--------------
# Test cases for Room model(Redis)
#--------------
class RoomTestCase(TestCase):
    def setUp(self):
        self.room_type = "SIMPLE"
        self.table_id = 1
        self.match_id = 1
        self.tournament_id = 1
        self.key = RoomKey.create_room(self.room_type, self.table_id, self.match_id, self.tournament_id)

    def test_create_room(self):
        room_data = RoomKey.get_room(self.room_type, self.table_id)
        self.assertEqual(room_data['type'], self.room_type)
        self.assertEqual(room_data['entry_count'], '1')
        self.assertEqual(room_data['match_id'], str(self.match_id))
        self.assertEqual(room_data['tournament_id'], str(self.tournament_id))

    def test_increment_entry_count(self):
        entry_count = RoomKey.increment_entry_count(self.room_type, self.table_id)
        self.assertEqual(entry_count, 2)  # Incremented from 1 to 2

    def test_invalid_room_type(self):
        with self.assertRaises(ValueError):
            RoomKey.create_room("INVALID_TYPE", self.table_id)
