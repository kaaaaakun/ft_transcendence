from django.db import DatabaseError

from .models import Match, MatchDetail
from room.models import RoomMembers
from room.utils import RoomKey

SIMPLE_WAITING_ROOM_LIMIT = 5

def create_simple_match_response(waiting_simple_room_keys):
    room_members = RoomMembers.objects.filter(room_id__in = waiting_simple_room_keys)
    response_data = []
    for member in room_members:
        room_id = member.room_id
        table_id = RoomKey.get_table_id_from_key(room_id)
 
        user = member.user
        display_name = user.display_name        
       
        response_data.append({
            'match_id': table_id,
            'display_name': display_name
        })
    return response_data

def try_join_match(match_id, user):
    try:
        match = Match.objects.get(id = match_id)
        if match.is_finished:
            return {"error": "Match is already finished."}, False
        tournamant_id = match.tournament_id
        if tournamant_id is None:
            room_data = RoomKey.get_room(room_type = "SIMPLE", table_id = match_id)
            room_id = RoomKey.generate_key(room_type = "SIMPLE", table_id = match_id)
        else:
            room_data = RoomKey.get_room(room_type = "TOURNAMENT_MATCH", table_id = match_id)
            room_id = RoomKey.generate_key(room_type = "TOURNAMENT_MATCH", table_id = match_id, tournament_id = tournamant_id)
        if not room_data:
            return {"error": "Room does not exist."}, False
        entry_count = RoomKey.increment_entry_count(room_type = room_data["type"], table_id = match_id)
        if entry_count == -1:
            return {"error": "Match is full."}, False
        RoomMembers.objects.create(room_id = room_id, user = user)
        room_members = RoomMembers.objects.filter(room_id = room_id)
        if room_members.count() != 2:
            return {"error": "RoomMembers count is not as expected."}, False
        for i, member in enumerate(room_members):
            if i == 0:
                is_left_side = True
            else:
                is_left_side = False
            MatchDetail.objects.create(match = match, user = member.user, is_left_side = is_left_side)
        return {"match_id": match_id}, True     
    except Match.DoesNotExist:
        return {"error": "Match does not exist."}, False
    except DatabaseError:
        RoomKey.decrement_entry_count(room_type = room_data["type"], table_id = match_id)
        return {"error": "Database error occurred."}, False
    
def try_create_simple_match(user):
    try:
        active_simple_matches = Match.objects.filter(is_finished = False, tournament__isnull = True)
        if active_simple_matches.exists():
            room_keys = []
            for match in active_simple_matches:
                room_key = RoomKey.generate_key(room_type = "SIMPLE", table_id = match.id)
                room_keys.append(room_key)
            room_members = RoomMembers.objects.filter(room_id__in = room_keys, user = user)
            if room_members.exists(): # room_members will be deleted if the match_detail is created.
                return {"error": "You already have an active room members."}, False
            match_details = MatchDetail.objects.filter(match__in = active_simple_matches, user = user)
            if match_details.exists():
                return {"error": "You already have an active match detail."}, False
        waiting_simple_room_keys = RoomKey.get_keys_by_type_and_entry_count("SIMPLE", 2)
        if len(waiting_simple_room_keys) < SIMPLE_WAITING_ROOM_LIMIT:
            match = Match.objects.create()
            room_key = RoomKey.create_room(room_type = "SIMPLE", table_id = match.id, match_id = match.id)
            RoomMembers.objects.create(room_id = room_key, user = user)
            return {"match_id": match.id}, True
        else:
            return {"error": "Waiting room limit reached."}, False
    except DatabaseError:
        return {"error": "Database error occurred."}, False
