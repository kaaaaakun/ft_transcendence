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
        type_str = redis_client.hget(key, "type")
        entry_count_str = redis_client.hget(key, "entry_count")
        if type_str is None or entry_count_str is None:
            return -1

        entry_count = int(entry_count_str)

        if type_str == "SIMPLE" and entry_count >= 2:
            return -1
        elif type_str == "TOURNAMENT_MATCH" and entry_count >= 2:
            return -1
        elif type_str == "WAITING_4P" and entry_count >= 4:
            return -1
        elif type_str == "WAITING_8P" and entry_count >= 8:
            return -1
        return redis_client.hincrby(key, "entry_count", 1)

    @staticmethod
    def decrement_entry_count(room_type: str, table_id: int) -> int:
        redis_client = get_redis()
        key = RoomKey.generate_key(room_type, table_id)
        return redis_client.hincrby(key, "entry_count", -1)

    @staticmethod
    def get_keys_by_type_and_entry_count(room_type: str, entry_count: int) -> list:
        redis_client = get_redis()
        keys_by_room = redis_client.keys(f"room:{room_type}:*")
        keys_by_entry = []
        for key in keys_by_room:
            room_data = redis_client.hgetall(key)
            if int(room_data["entry_count"]) < entry_count:
                keys_by_entry.append(key)
        return keys_by_entry

    @staticmethod
    def get_table_id_from_key(key: str) -> int:
        parts = key.split(":")
        if len(parts) != 3 or parts[0] != "room":
            raise ValueError(f"Invalid room key format: {key}")
        return int(parts[2])
