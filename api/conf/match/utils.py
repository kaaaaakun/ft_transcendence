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
