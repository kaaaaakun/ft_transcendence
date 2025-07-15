from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import json
import redis
import asyncio
from asgiref.sync import sync_to_async
from django.conf import settings
import logging
logger = logging.getLogger('django')
from .game_logic import GameManager, ScoreManager, Paddle
from utils.redis_client import get_redis
from tournament.models import TournamentPlayer
from match.models import MatchDetail
from tournament.models import TournamentPlayer

from .models import RoomMembers
from match.models import Match
from match.models import MatchDetail
from .utils import RoomKey
from user.utils import get_user_by_auth
import urllib.parse
from tournament.models import Tournament
from django.db.models import F

FRAME = 30 # フロントを見つつ調整
END_GAME_SCORE = settings.END_GAME_SCORE

class RoomConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.redis_client = get_redis()
        self.room_type = None
        self.room_id = None
        self.user = None
        self.room_group_name = None
        self.next_send_duration = 0
    
    async def connect(self):
        self.room_type = self.scope['url_route']['kwargs']['room_type']
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f"room.{self.room_type}.{self.room_id}"
        self.user = await self.get_user_by_auth()
        if not self.user:
            await self.close(code=4001)
            return
        logger.debug(f"DEBUG: User {self.user.display_name} connecting to {self.room_group_name}")
        await self.accept()

    async def get_auth_header(self):
        """ヘッダーからAuthorizationトークンを取得"""
        auth_header = None
        for header_name, header_value in self.scope.get('headers', []):
            if header_name == b'authorization':
                auth_header = header_value.decode()
                return auth_header

        query_string = self.scope.get('query_string', b'').decode()
        logger.debug(f"DEBUG: Query string: {query_string}")

        if query_string:
            try:
                parsed_query = urllib.parse.parse_qs(query_string)

                if 'token' in parsed_query:
                    token = parsed_query['token'][0]
                    auth_header = f"Bearer {token}"
                    return auth_header

            except Exception as e:
                logger.error(f"DEBUG: Error parsing query string: {e}")

        return None
    
    async def get_user_by_auth(self):
        """認証ヘッダーをチェックし、ユーザーを取得"""
        auth_header = await self.get_auth_header()
        if not auth_header:
            return None

        user = await sync_to_async(get_user_by_auth)(auth_header)
        if not user:
            return None

        return user

    async def periodic_status_update(self):
        """定期的にルームステータスを送信"""
        try:
            while True:
                logger.debug(f"DEBUG: Sending room status for {self.room_group_name}")
                await asyncio.sleep(self.next_send_duration)
                await self.broadcast_room_status()
        except asyncio.CancelledError:
            logger.error(f"DEBUG: Status update task cancelled for {self.room_group_name}") 
            pass
    
    async def broadcast_room_status(self):
        logger.debug(f"DEBUG: Broadcasting called")
        pass

    def get_room_data(self):
        """Redisからルーム情報を取得、存在しない場合は作成"""
        try:
            if not self.room_id or not self.room_type:
                logger.error("ERROR: Room ID or type is not set")
                return None

            # 既存のルーム情報を取得（get_roomでデコード済み）
            room_data = RoomKey.get_room(self.room_type, self.room_id)

            if room_data:
                return room_data
            else:
                return RoomKey.create_room(self.room_type, self.room_id, self.room_id)

        except Exception as e:
            logger.error(f"ERROR: get_room_data: {e}")
            return None
    
    def add_user_to_active_connections(self):
        """ユーザーを現在の接続者リストに追加"""
        try:
            # 現在接続中のユーザーリスト（短期間）
            active_users_key = f"active_users:{self.room_group_name}"
            self.redis_client.sadd(active_users_key, self.user.id)
            self.redis_client.expire(active_users_key, 3600)  # 1時間で期限切れ
            logger.debug(f"DEBUG: User {self.user.display_name} added to active connections")
        except Exception as e:
            logger.error(f"ERROR: add_user_to_active_connections: {e}")

    def get_connected_users(self):
        """現在接続中のユーザーリストを取得"""
        try:
            active_users_key = f"active_users:{self.room_group_name}"
            user_ids = self.redis_client.smembers(active_users_key)
            connected_users = []

            for user_id in user_ids:
                try:
                    from user.models import User
                    user = User.objects.get(id=int(user_id))
                    connected_users.append({
                        'user_id': user.id,
                        'display_name': user.display_name,
                        'status': 'connected'
                    })
                except Exception as e:
                    logger.error(f"ERROR: Failed to get connected user {user_id}: {e}")
                    continue

            logger.debug(f"DEBUG: Retrieved {len(connected_users)} connected users")
            return connected_users
        except Exception as e:
            logger.error(f"ERROR: get_connected_users: {e}")
            return []
class TournamentWaitRoomConsumer(RoomConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.status_task = None
        self.match_task = None
        self.next_send_duration = 2

    async def connect(self):
        await super().connect()

        room_data = await sync_to_async(self.get_room_data)()
        if not room_data:
            await self.send(text_data=json.dumps({
                'error': 'Room not found or invalid'
            }))
            await self.close()
            return

        is_existing_member = await sync_to_async(self.is_existing_tournament_member)()

        if not is_existing_member:
            await self.close(code=4002)  # User not a tournament member


        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await sync_to_async(self.add_user_to_active_connections)()
        await self.initialize_tournament()
        self.status_task = asyncio.create_task(self.periodic_status_update())
        self.match_task = asyncio.create_task(self.periodic_match_update())

        await self.broadcast_room_status()

    async def disconnect(self, close_code):
        if self.status_task:
            logger.debug(f"DEBUG: Cancelling status task for room {self.room_group_name}")
            self.status_task.cancel()
            
        if self.match_task:
            logger.debug(f"DEBUG: Cancelling match task for room {self.room_group_name}")
            self.match_task.cancel()

        if self.room_group_name and self.user:
            await sync_to_async(self.remove_user_from_active_connections)()

            logger.debug(f"DEBUG: {self.user.display_name} disconnected from {self.room_group_name}")

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

    async def periodic_match_update(self):
        """定期的にトーナメントマッチを更新"""
        try:
            while True:
                await asyncio.sleep(3)  # 3秒間隔で更新
                await self.update_tournament_matches()
        except asyncio.CancelledError:
            pass

    async def initialize_tournament(self):
        """トーナメントの最初のラウンドマッチを作成"""
        try:
            if not self.room_id:
                logger.error("ERROR: Room ID is not set")
                return
            if self.room_type != 'WAITING_4P' and self.room_type != 'WAITING_8P':
                logger.error(f"ERROR: Invalid room type {self.room_type} for tournament initialization")
                return
            tournament_id = int(self.room_id)
            
            # 既にマッチが存在するかチェック
            matches_exist = await sync_to_async(
                lambda: Match.objects.filter(tournament_id=tournament_id).exists()
            )()
            
            if matches_exist:
                logger.debug(f"DEBUG: Matches already exist for tournament {tournament_id}")
                return
            
            logger.debug(f"DEBUG: Creating first round matches for tournament {tournament_id}")
            
            tournament = await sync_to_async(Tournament.objects.get)(id=tournament_id)
            created_matches = await sync_to_async(Match.initialize_first_round_matches)(tournament)
            
            logger.debug(f"DEBUG: Created {len(created_matches)} first round matches")
            
        except Exception as e:
            logger.error(f"ERROR: initialize_tournament: {e}")

    async def update_tournament_matches(self):
        """次のラウンドのマッチを定期的にチェック・作成"""
        try:
            if not self.room_id:
                logger.error("ERROR: Room ID is not set")
                return
            tournament_id = int(self.room_id)
            tournament = await sync_to_async(Tournament.objects.get)(id=tournament_id)
            
            if tournament.is_finished:
                logger.debug(f"DEBUG: Tournament {tournament_id} is already finished")
                return
            
            await sync_to_async(Match.create_next_round_matches)(tournament)
        
            
        except Exception as e:
            logger.error(f"ERROR: update_tournament_matches: {e}")

    async def broadcast_room_status(self, user_disconnected=None):
        """ルームの現在の状況を全員に通知"""
        current_count = await sync_to_async(self.get_current_entry_count)()
        connected_users = await sync_to_async(self.get_connected_users)()
        tournament_members = await sync_to_async(self.get_tournament_members)()
        tournament_capacity = self.get_tournament_capacity()
        if current_count == -1:
            return

        # 人数が達した場合
        if current_count >= tournament_capacity:
            common_message_data = {
                'type': 'room_ready',
                'entry_count': current_count,
                'members': tournament_members,
                'connected_members': connected_users,
            }

            await self.channel_layer.group_send(
                self.room_group_name,
                common_message_data
            )
            
            # 各接続中ユーザーに個別のmatch_ongoing情報を送信
            
        else:
            # まだ人数が足りない場合
            message_data = {
                'type': 'room_update',
                'entry_count': current_count,
                'waiting_for': tournament_capacity - current_count,
                'members': tournament_members,
                'connected_members': connected_users
            }
            if user_disconnected:
                message_data['user_disconnected'] = user_disconnected

            await self.channel_layer.group_send(
                self.room_group_name,
                message_data
            )

    def get_ongoing_match_for_user(self):
        """指定されたユーザーの進行中マッチ情報を取得"""
        try:
            logger.debug(f"DEBUG: Getting ongoing match for user {self.user.display_name} in room {self.room_group_name}")
            if not self.room_id:
                logger.debug("ERROR: Room ID is not set")
                return None

            tournament_id = int(self.room_id)
            
            # 指定されたユーザーの進行中マッチを検索
            ongoing_match_details = MatchDetail.objects.filter(
                user=self.user,
                match__tournament_id=tournament_id,
                match__is_finished=False
            ).select_related('match').first()
            
            if ongoing_match_details:
                match_id = ongoing_match_details.match.id
                logger.debug(f"DEBUG: Found ongoing match {match_id} for user {self.user.display_name} in tournament {tournament_id}")
                return f"{match_id}"
            
            return None
            
        except Exception as e:
            logger.debug(f"ERROR: get_ongoing_match_for_user: {e}")
            return None

    def get_tournament_capacity(self):
        """トーナメントの定員を取得（PostgreSQLのtournamentテーブルから取得）"""
        try:
            if self.room_type == 'WAITING_4P':
                return 4
            elif self.room_type == 'WAITING_8P':
                return 8
            else:
                logger.debug(f"WARNING: Invalid room type {self.room_type} for tournament capacity")
                return 0
        except Exception as e:
            logger.debug(f"ERROR: get_tournament_capacity: {e}")
            return 0

    # チャンネルグループからのメッセージハンドラー
    async def room_ready(self, event):
        """ルームが準備完了したときの処理"""
        ongoing_match_info = await sync_to_async(self.get_ongoing_match_for_user)()
        await self.send(text_data=json.dumps({
            'status': 'room_ready',
            'entry_count': event['entry_count'],
            'members': event['members'],
            'connected_members': event['connected_members'],
            'match_ongoing': ongoing_match_info if ongoing_match_info else False,
        }))

    async def individual_match_info(self, event):
        """個別のマッチ情報を処理（本人のみに送信）"""
        target_user_id = event['target_user_id']
        
        if self.user and self.user.id == target_user_id:
            await self.send(text_data=json.dumps({
                'match_ongoing': event['match_ongoing']
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

    def is_existing_tournament_member(self):
        """ユーザーが既にトーナメントメンバーかチェック（PostgreSQLのtournament_playersテーブルを確認）"""
        try:
            if not self.room_id or not self.user:
                logger.debug("ERROR: Room ID or user is not set")
                return False
            tournament_id = int(self.room_id)

            exists = TournamentPlayer.objects.filter(
                tournament_id=tournament_id,
                user=self.user
            ).exists()

            logger.debug(f"DEBUG: Checking tournament_players for user {self.user.display_name} in tournament {tournament_id}: {exists}")
            return exists
        except Exception as e:
            logger.debug(f"ERROR: is_existing_tournament_member: {e}")
            return False

    def remove_user_from_active_connections(self):
        """ユーザーを現在の接続者リストから削除"""
        try:
            active_users_key = f"active_users:{self.room_group_name}"
            removed = self.redis_client.srem(active_users_key, self.user.id)
            logger.debug(f"DEBUG: User {self.user.display_name} removed from active connections (removed: {removed})")
        except Exception as e:
            logger.debug(f"ERROR: remove_user_from_active_connections: {e}")

    def get_tournament_members(self):
        """トーナメント参加者リストを取得（PostgreSQLのtournament_playersテーブルから取得）"""
        try:
            if not self.room_id or not self.room_type:
                logger.debug("ERROR: Room ID or type is not set")
                return []
            tournament_id = int(self.room_id)
            tournament_players = TournamentPlayer.objects.filter(
                tournament_id=tournament_id
            ).select_related('user').order_by('entry_number')

            members = []
            for tournament_player in tournament_players:
                try:
                    user = tournament_player.user
                    members.append({
                        'user_id': user.id,
                        'display_name': user.display_name,
                        'entry_number': tournament_player.entry_number,
                        'round': tournament_player.round,
                        'player': {
                            'name': user.display_name
                        },
                        'tournament_players': {
                            'victory_count': 0
                        },
                        'next_player': False
                    })
                except Exception as e:
                    logger.debug(f"ERROR: Failed to process tournament_player {tournament_player.id}: {e}")
                    continue

            logger.debug(f"DEBUG: Retrieved {len(members)} tournament members from PostgreSQL for tournament {tournament_id}")
            return members

        except Exception as e:
            logger.debug(f"ERROR: get_tournament_members: {e}")
            return []

    def get_current_entry_count(self):
        """現在のentry_countをPostgreSQLのトーナメント参加者数と同期"""
        try:
            if not self.room_id or not self.room_type:
                logger.error("ERROR: Room ID or type is not set")
                return -1
            tournament_id = self.room_id
            actual_count = TournamentPlayer.objects.filter(
                tournament_id=tournament_id
            ).count()
            key = RoomKey.generate_key(self.room_type, self.room_id)
            self.redis_client.hset(key, "entry_count", actual_count)
            return actual_count
        except Exception as e:
            logger.error(f"ERROR: get_current_entry_count: {e}")
            return -1

class MatchRoomConsumer(RoomConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.next_send_duration = 1 / FRAME
        self.game_manager = None

    async def connect(self):
        try:
            await super().connect()

            room_data = await sync_to_async(self.get_room_data)()
            if not room_data:
                logger.error(f"ERROR: Room data not found for {self.room_group_name}")
                await self.send(text_data=json.dumps({
                    'error': f'Room not found or invalid {self.room_id}'
                }))
                await self.close()
                return
            
            match = await sync_to_async(lambda: Match.objects.filter(id=self.room_id).first())()
            if not match:
                logger.error(f"ERROR: Match with ID {self.room_id} not found")
                await self.close(code=4001)
                return
            if match.is_finished:
                logger.error(f"ERROR: Match with ID {self.room_id} is already finished")
                await self.close(code=4002)
                return

            logger.debug(f"DEBUG: Room data for {self.room_group_name} : {self.channel_name}")
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            self.add_user_to_active_connections()
            connected_users = await sync_to_async(self.get_connected_users)()
            if not connected_users:
                logger.error(f"ERROR: No connected users found for room {self.room_id}")
                await self.close(code=4002)
                return

            if len(connected_users) == 2 and not self.redis_client.exists(f"room:{self.room_group_name}:game_running"):
                try:
                    logger.debug(f"DEBUG: Starting periodic status update task for room {self.room_group_name}")
                    
                    self.game_manager = GameManager(
                        score_manager=ScoreManager(self.room_group_name),
                        room_group_name=self.room_group_name,
                    )
                    await self.game_manager.get_player_display_name(self.room_id)
                    await self.game_manager.get_tournament_id(self.room_id)
                    logger.debug(f"DEBUG: GameManager initialized for room {self.room_group_name}")
                except Exception as e:
                    logger.error(f"ERROR: Failed to initialize game manager for room {self.room_group_name}: {e}", exc_info=True)
                    await self.close(code=4003)
                    return
            self.status_task = asyncio.create_task(self.broadcast_room_status())
        except Exception as e:
            logger.error(f"ERROR: connect: {e}", exc_info=True)
            await self.close(code=4000)
            return
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        logger.debug(f"DEBUG: Received data in room {self.room_group_name}: {data}")
        if self.paddle is None:
            logger.error(f"ERROR: Paddle is not initialized for user {self.user.display_name} in room {self.room_group_name}")
            return
        self.paddle.set_movement(data)

    async def disconnect(self, close_code):
        if self.room_id and self.user:
            await sync_to_async(self.remove_user_from_active_connections)()

            logger.debug(f"DEBUG: {self.user.display_name} disconnected from {self.room_id}")

        # チャンネルグループから退室
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def get_create_paddle(self):
            match_details = await sync_to_async(
                lambda: MatchDetail.objects.filter(match_id=self.room_id).select_related('user')
            )()
            if not await sync_to_async(match_details.exists)():
                logger.error(f"ERROR: No match details found for match {self.room_id}")
                await self.close(code=4003)
                return
            if await sync_to_async(match_details.count)() != 2:
                logger.error(f"ERROR: Too many match details found for match {self.room_id}")
                await self.close(code=4004)
                return
            match_list = await sync_to_async(list)(match_details)
            if match_list[0].user_id == self.user.id:
                self.paddle = Paddle(is_left=match_list[0].is_left_side, room_group_name=self.room_group_name)
            elif match_list[1].user_id == self.user.id:
                self.paddle = Paddle(is_left=match_list[1].is_left_side, room_group_name=self.room_group_name)
            else:
                logger.error(f"ERROR: User {self.user.display_name} is not part of match {self.room_id}")
                await self.close(code=4005)
                return

    async def broadcast_room_status(self):
        logger.debug(f"DEBUG: game start")
        try:
            if self.game_manager:
                logger.debug("game manager run")
                self.redis_client.set(f"room:{self.room_group_name}:game_running", 'true')
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_start',
                        'left_player': self.game_manager.left_display_name,
                        'right_player': self.game_manager.right_display_name
                    })
                await self.get_create_paddle()
                await asyncio.sleep(3)
                while True:
                    await asyncio.sleep(self.next_send_duration)
                    self.game_manager.update_game_state()
                    game_state = self.game_manager.get_game_state()
                    logger.debug(f"DEBUG: Broadcasting game state for room {self.room_id}: {game_state} : {self.room_group_name}")
                    game_state['type'] = 'update'
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'game_message',
                            'message': game_state
                        }
                    )
                    if (
                        self.game_manager.score_manager.get_score("left") == END_GAME_SCORE or
                        self.game_manager.score_manager.get_score("right") == END_GAME_SCORE
                    ):
                        logger.debug(f"[{self.room_group_name}] ゲーム終了！")
                        self.redis_client.set(f"room:{self.room_group_name}:game_running", 'false')
                        break
                try:
                    await sync_to_async(Match.objects.filter(id=self.room_id).update)(is_finished=True)
                    await sync_to_async(MatchDetail.objects.filter(match_id=self.room_id, is_left_side=True).update)(
                        score=self.game_manager.score_manager.get_score("left")
                    )
                    await sync_to_async(MatchDetail.objects.filter(match_id=self.room_id, is_left_side=False).update)(
                        score=self.game_manager.score_manager.get_score("right")
                    )
                    game_state = self.game_manager.get_game_state()
                    left_player_score = game_state.get('left', {}).get('score', 0)
                    right_player_score = game_state.get('right', {}).get('score', 0)
                    winner = self.game_manager.left_user_id if left_player_score > right_player_score else self.game_manager.right_user_id
                    await sync_to_async(TournamentPlayer.objects.filter(tournament_id=self.game_manager.tournament_id, user_id=winner ).update)(round=F('round') + 1)
                    redirect_url = "/" if not self.game_manager.tournament_id else f"/remote/tournament/{self.game_manager.tournament_id}/"
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'game_end',
                            'game_state': self.game_manager.get_game_state(),
                            'left_player': self.game_manager.left_display_name,
                            'right_player': self.game_manager.right_display_name,
                            'redirectUrl': redirect_url
                        }
                    )
                except Exception as e:
                    logger.error(f"ERROR: Failed to update match details for {self.room_id}: {e}", exc_info=True)

        except Exception as e:
            logger.error(f"ERROR: broadcast_room_status: {e}", exc_info=True)
            await self.close(code=4000)



    async def game_message(self, event):
        game_state = event["message"]
        await self.send(text_data=json.dumps(game_state))

    async def game_start(self, event):
        """ゲーム開始の処理"""
        left_player = event.get('left_player', {})
        right_player = event.get('right_player', {})
        await self.send(text_data=json.dumps({
            'type': 'start',
            'players': {
                'left': {
                    'display_name': left_player
                    },
                'right': {
                    'display_name': right_player
                },
            },
        }))
    
    async def game_end(self, event):
        """ゲーム終了の処理"""
        try:
            game_state = event.get('game_state', {})
            logger.debug(f"DEBUG: Game end event: {event}")
            left_player_score = game_state.get('left', {}).get('score', 0)
            right_player_score = game_state.get('right', {}).get('score', 0)
            left_player = event.get('left_player', '')
            right_player = event.get('right_player', '')
            if left_player_score > right_player_score:
                winner = left_player
            elif right_player_score > left_player_score:
                winner = right_player
            else:
                logger.error(f"Error: Game ended in a draw for room {self.room_group_name}")
                winner = "Draw"
            logger.debug(f"DEBUG: Game ended with winner: {winner} in room {self.room_group_name}")
            await self.send(text_data=json.dumps({
                'type': 'end',
                'left': game_state.get('left', {}),
                'right': game_state.get('right', {}),
                'winner': winner,
                'redirectUrl': event.get('redirectUrl', None)
            }))
        except Exception as e:
            logger.error(f"ERROR: game_end: {e}", exc_info=True)
            await self.close(code=4000)
            return

