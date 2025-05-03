import redis

class RoomKey:
    @staticmethod
    def generate_key(room_type: str, table_id: int) -> str:
        return f"room:{room_type}:{table_id}"

    @staticmethod
    def create_room(redis_client: redis.Redis, room_type: str, table_id: int, match_id: int = None, tournament_id: int = None):
        key = RoomKey.generate_key(room_type, table_id)
        room_data = {
            "type": room_type,
            "entry_count": 1,
            "match_id": match_id if match_id is not None else "",
            "tournament_id": tournament_id if tournament_id is not None else "",
        }
        redis_client.hmset(key, room_data)

    @staticmethod
    def get_room(redis_client: redis.Redis, room_type: str, table_id: int) -> dict:
        key = RoomKey.generate_key(room_type, table_id)
        return redis_client.hgetall(key)

    @staticmethod
    def increment_entry_count(redis_client: redis.Redis, room_type: str, table_id: int) -> int:
        key = RoomKey.generate_key(room_type, table_id)
        type_bytes = redis_client.hget(key, "type")
        entry_count_bytes = redis_client.hget(key, "entry_count")
        if type_bytes is None or entry_count_bytes is None:
            return -1

        type = type_bytes.decode()
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
