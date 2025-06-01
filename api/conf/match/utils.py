from django.db import DatabaseError

from .models import Match, MatchDetail
from room.models import RoomMembers
from room.utils import RoomKey

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
        if len(room_members) != 2:
            return {"error": "RoomMembers count is not as expected."}, False
        for member in room_members:
            MatchDetail.objects.create(match = match, user = member.user)
        return {"match_id": match_id}, True     
    except Match.DoesNotExist:
        return {"error": "Match does not exist."}, False
    except DatabaseError:
        RoomKey.decrement_entry_count(room_type = room_data["type"], table_id = match_id)
        return {"error": "Database error occurred."}, False