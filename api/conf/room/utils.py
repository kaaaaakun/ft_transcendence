from utils.redis_client import get_redis

VALID_ROOM_TYPES = ["SIMPLE", "TOURNAMENT_MATCH", "WAITING_4P", "WAITING_8P"]

class RoomKey:
    @staticmethod
    def generate_key(room_type: str, table_id: int) -> str:
        return f"room:{room_type}:{table_id}"

    @staticmethod
    def create_room(room_type: str, table_id: int, match_id: int = None, tournament_id: int = None):
        redis_client = get_redis()
        if room_type not in VALID_ROOM_TYPES:
            raise ValueError(f"Invalid room type: {room_type}")
        key = RoomKey.generate_key(room_type, table_id)
        room_data = {
            "type": room_type,
            "entry_count": 1,
            "match_id": match_id if match_id is not None else "",
            "tournament_id": tournament_id if tournament_id is not None else "",
        }
        redis_client.hset(key, mapping = room_data)
        redis_client.expire(key, 3600)  # Set expiration time to 1 hour
        return key

    @staticmethod
    def get_room(room_type: str, table_id: int) -> dict:
        redis_client = get_redis()
        key = RoomKey.generate_key(room_type, table_id)
        return redis_client.hgetall(key)

    @staticmethod
    def increment_entry_count(room_type: str, table_id: int) -> int:
        redis_client = get_redis()
        key = RoomKey.generate_key(room_type, table_id)
        type_bytes = redis_client.hget(key, "type")
        entry_count_bytes = redis_client.hget(key, "entry_count")
        if type_bytes is None or entry_count_bytes is None:
            return -1

        entry_count = int(entry_count_bytes)

        if type == "SIMPLE" and entry_count >= 2:
            return -1
        elif type == "TOURNAMENT_MATCH" and entry_count >= 2:
            return -1
        elif type == "WAITING_4P" and entry_count >= 4:
            return -1
        elif type == "WAITING_8P" and entry_count >= 8:
            return -1
        return redis_client.hincrby(key, "entry_count", 1)
