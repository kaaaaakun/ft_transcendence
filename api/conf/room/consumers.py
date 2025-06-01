from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import json
import redis
import asyncio
from asgiref.sync import sync_to_async
from django.conf import settings

from .models import RoomMembers
from .utils import RoomKey
from user.utils import get_user_by_auth
import urllib.parse


class RoomConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.redis_client = redis.StrictRedis(host="in_memory_db", port=6379, db=0)
        self.room_id = None
        self.user = None
        self.room_group_name = None
        self.status_task = None
        self.is_new_member = False  # 新規メンバーかどうかのフラグ

    async def get_auth_header(self):

        auth_header = None
        for header_name, header_value in self.scope.get('headers', []):
            if header_name == b'authorization':
                auth_header = header_value.decode()
                print(f"DEBUG: Found Authorization header")
                return auth_header

        query_string = self.scope.get('query_string', b'').decode()
        print(f"DEBUG: Query string: {query_string}")

        if query_string:
            try:
                parsed_query = urllib.parse.parse_qs(query_string)
                print(f"DEBUG: Parsed query: {parsed_query}")

                if 'token' in parsed_query:
                    token = parsed_query['token'][0]
                    auth_header = f"Bearer {token}"
                    print(f"DEBUG: Found token in query parameters")
                    return auth_header

            except Exception as e:
                print(f"DEBUG: Error parsing query string: {e}")

        return None

    async def connect(self):
        # URLからroom_id を取得
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f"room_{self.room_id}"

        auth_header = await self.get_auth_header()

        if not auth_header:
            await self.close(code=4001)  # Unauthorized
            return

        self.user = await sync_to_async(get_user_by_auth)(auth_header)
        if not self.user:
            await self.close(code=4001)  # Unauthorized
            return

        print(f"DEBUG: User {self.user.display_name} connecting to {self.room_id}")

        await self.accept()

        # Redisからルーム情報を取得・作成
        room_data = await sync_to_async(self.get_or_create_room_data)()
        if not room_data:
            await self.send(text_data=json.dumps({
                'error': 'Room not found or invalid'
            }))
            await self.close()
            return

        # ユーザーがすでにトーナメントメンバーかチェック
        is_existing_member = await sync_to_async(self.is_existing_tournament_member)()

        if not is_existing_member:
            # 新規メンバーの場合のみ追加処理
            result = await sync_to_async(self.add_tournament_member)()
            if result == -1:
                await self.send(text_data=json.dumps({
                    'error': 'Room is full or error occurred'
                }))
                await self.close()
                return
            self.is_new_member = True
            print(f"DEBUG: {self.user.display_name} added as new tournament member")
        else:
            print(f"DEBUG: {self.user.display_name} is already a tournament member, skipping addition")

        # チャンネルグループに参加
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # ユーザーを現在の接続者リストに追加（再接続でも毎回追加）
        await sync_to_async(self.add_user_to_active_connections)()

        # 定期的なステータス更新を開始
        self.status_task = asyncio.create_task(self.periodic_status_update())

        # 即座に現在の状況を通知
        await self.broadcast_room_status()

    async def disconnect(self, close_code):
        # 定期更新タスクを停止
        if self.status_task:
            self.status_task.cancel()

        if self.room_id and self.user:
            # ユーザーを現在の接続者リストから削除（トーナメント参加者リストからは削除しない）
            await sync_to_async(self.remove_user_from_active_connections)()

            print(f"DEBUG: {self.user.display_name} disconnected from {self.room_id}")

            # 他の参加者に一時的な退室を通知（メンバー数は変わらない）
            await self.broadcast_room_status(user_disconnected=self.user.display_name)

        # チャンネルグループから退室
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            elif message_type == 'get_status':
                # 手動でステータス要求された場合
                await self.broadcast_room_status()

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON'}))

    async def periodic_status_update(self):
        """定期的にルームステータスを更新"""
        try:
            while True:
                await asyncio.sleep(2)  # 2秒間隔で更新
                await self.broadcast_room_status()
        except asyncio.CancelledError:
            pass

    async def broadcast_room_status(self, user_disconnected=None):
        """ルームの現在の状況を全員に通知"""
        current_count = await sync_to_async(self.get_current_entry_count)()
        connected_users = await sync_to_async(self.get_connected_users)()
        tournament_members = await sync_to_async(self.get_tournament_members)()

        if current_count == -1:
            return

        # 4人に達した場合
        if current_count >= 4:
            # 定期更新を停止
            if self.status_task:
                self.status_task.cancel()

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'room_ready',
                    'entry_count': current_count,
                    'members': tournament_members,
                    'connected_members': connected_users
                }
            )
        else:
            # まだ人数が足りない場合
            message_data = {
                'type': 'room_update',
                'entry_count': current_count,
                'waiting_for': 4 - current_count,
                'members': tournament_members,
                'connected_members': connected_users
            }
            if user_disconnected:
                message_data['user_disconnected'] = user_disconnected

            await self.channel_layer.group_send(
                self.room_group_name,
                message_data
            )

    # チャンネルグループからのメッセージハンドラー
    async def room_ready(self, event):
        await self.send(text_data=json.dumps({
            'status': 'room_ready',
            'entry_count': event['entry_count'],
            'members': event['members'],
            'connected_members': event['connected_members']
        }))

    async def room_update(self, event):
        message = {
            'status': 'waiting',
            'entry_count': event['entry_count'],
            'waiting_for': event['waiting_for'],
            'members': event['members'],
            'connected_members': event['connected_members']
        }
        if 'user_disconnected' in event:
            message['user_disconnected'] = event['user_disconnected']

        await self.send(text_data=json.dumps(message))

    def get_or_create_room_data(self):
        """Redisからルーム情報を取得、存在しない場合は作成"""
        try:
            room_parts = self.room_id.split('.')
            if len(room_parts) == 3:
                room_type = room_parts[1]
                table_id = int(room_parts[2])

                # 既存のルーム情報を取得（get_roomでデコード済み）
                room_data = RoomKey.get_room(self.redis_client, room_type, table_id)

                if room_data:
                    return room_data
                else:
                    # ルームが存在しない場合は作成
                    RoomKey.create_room(
                        self.redis_client,
                        room_type,
                        table_id,
                        tournament_id=1  # 適切な値に設定
                    )
                    # 初期のentry_countを0に設定
                    key = RoomKey.generate_key(room_type, table_id)
                    self.redis_client.hset(key, "entry_count", 0)

                    return {
                        'type': room_type,
                        'entry_count': '0',
                        'match_id': '',
                        'tournament_id': '1'
                    }
            return None
        except Exception as e:
            print(f"ERROR: get_or_create_room_data: {e}")
            return None

    def is_existing_tournament_member(self):
        """ユーザーが既にトーナメントメンバーかチェック"""
        try:
            tournament_members_key = f"tournament_members:{self.room_id}"
            return self.redis_client.sismember(tournament_members_key, self.user.id)
        except Exception as e:
            print(f"ERROR: is_existing_tournament_member: {e}")
            return False


    def add_tournament_member(self):
        """ユーザーをトーナメント参加者として永続的に追加（新規の場合のみ）"""
        try:
            tournament_members_key = f"tournament_members:{self.room_id}"

            # 既に参加している場合は何もしない
            if self.redis_client.sismember(tournament_members_key, self.user.id):
                print(f"DEBUG: User {self.user.display_name} already in tournament members")
                return self.get_current_entry_count()

            # PostgreSQLで既に登録済みかチェック
            from tournament.models import TournamentPlayer
            room_parts = self.room_id.split('.')
            if len(room_parts) == 3:
                tournament_id = int(room_parts[2])

                # PostgreSQLに既に存在する場合は、Redisに追加するだけ
                if TournamentPlayer.objects.filter(
                    tournament_id=tournament_id,
                    user=self.user
                ).exists():
                    # Redisに追加（同期のため）
                    self.redis_client.sadd(tournament_members_key, self.user.id)
                    self.redis_client.expire(tournament_members_key, 86400)
                    print(f"DEBUG: User {self.user.display_name} already in PostgreSQL, syncing to Redis")
                    return self.get_current_entry_count()

            # ここには到達しないはず（WebSocket接続前に必ずJoinTournamentViewを通るため）
            print(f"WARNING: User {self.user.display_name} connecting without prior tournament join")
            return -1

        except Exception as e:
            print(f"ERROR: add_tournament_member: {e}")
            return -1

    def add_user_to_active_connections(self):
        """ユーザーを現在の接続者リストに追加"""
        try:
            # 現在接続中のユーザーリスト（短期間）
            active_users_key = f"active_users:{self.room_id}"
            self.redis_client.sadd(active_users_key, self.user.id)
            self.redis_client.expire(active_users_key, 3600)  # 1時間で期限切れ
            print(f"DEBUG: User {self.user.display_name} added to active connections")
        except Exception as e:
            print(f"ERROR: add_user_to_active_connections: {e}")

    def remove_user_from_active_connections(self):
        """ユーザーを現在の接続者リストから削除"""
        try:
            active_users_key = f"active_users:{self.room_id}"
            removed = self.redis_client.srem(active_users_key, self.user.id)
            print(f"DEBUG: User {self.user.display_name} removed from active connections (removed: {removed})")
        except Exception as e:
            print(f"ERROR: remove_user_from_active_connections: {e}")

    def get_tournament_members(self):
        """トーナメント参加者リストを取得（永続的なメンバー）"""
        try:
            tournament_members_key = f"tournament_members:{self.room_id}"
            user_ids = self.redis_client.smembers(tournament_members_key)
            members = []

            for user_id in user_ids:
                try:
                    from user.models import User
                    user = User.objects.get(id=int(user_id.decode()))
                    members.append({
                        'user_id': user.id,
                        'display_name': user.display_name,
                        'status': 'member',
                        # TournamentBracket形式に合わせて追加
                        'player': {
                            'name': user.display_name
                        },
                        'tournament_players': {
                            'victory_count': 0  # 初期値
                        },
                        'next_player': False
                    })
                except Exception as e:
                    print(f"ERROR: Failed to get user {user_id}: {e}")
                    continue

            print(f"DEBUG: Retrieved {len(members)} tournament members")
            return members
        except Exception as e:
            print(f"ERROR: get_tournament_members: {e}")
            return []

    def get_connected_users(self):
        """現在接続中のユーザーリストを取得"""
        try:
            active_users_key = f"active_users:{self.room_id}"
            user_ids = self.redis_client.smembers(active_users_key)
            connected_users = []

            for user_id in user_ids:
                try:
                    from user.models import User
                    user = User.objects.get(id=int(user_id.decode()))
                    connected_users.append({
                        'user_id': user.id,
                        'display_name': user.display_name,
                        'status': 'connected'
                    })
                except Exception as e:
                    print(f"ERROR: Failed to get connected user {user_id}: {e}")
                    continue

            print(f"DEBUG: Retrieved {len(connected_users)} connected users")
            return connected_users
        except Exception as e:
            print(f"ERROR: get_connected_users: {e}")
            return []

    def get_current_entry_count(self):
        """現在のentry_countを取得"""
        try:
            room_parts = self.room_id.split('.')
            if len(room_parts) == 3:
                room_type = room_parts[1]
                table_id = int(room_parts[2])
                room_data = RoomKey.get_room(self.redis_client, room_type, table_id)

                if room_data and 'entry_count' in room_data:
                    return int(room_data['entry_count'])
            return -1
        except Exception as e:
            print(f"ERROR: get_current_entry_count: {e}")
            return -1

    def get_room_users(self):
        """ルームの参加者リストを取得（後方互換性のため残す）"""
        return self.get_tournament_members()

    def create_room_members(self):
        """ROOM_MEMBERSデータを作成（後方互換性のため残す）"""
        return self.get_tournament_members()
