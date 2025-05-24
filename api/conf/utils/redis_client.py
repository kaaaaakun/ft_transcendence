import redis
from django.conf import settings

_pool = redis.ConnectionPool(
    host = settings.REDIS_HOST,
    port = settings.REDIS_PORT,
    db = 0,
    decode_responses=True,
    max_connections=20,
)

def get_redis():
    return redis.Redis(connection_pool = _pool)
