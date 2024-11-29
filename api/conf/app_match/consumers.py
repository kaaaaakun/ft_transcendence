from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from asgiref.sync import sync_to_async
from asyncio import sleep
import json

from .game_logic import GameManager, LocalSimpleScoreManager, TournamentScoreManager
from .models import Match, MatchDetail
from .utils import ( sort_matchdetails_by_playerid, 
    get_matchdetail_with_related_data, update_when_match_end, )
from utils.websocket import get_tournament_id_from_scope
from tournament.utils import ( is_round_end, update_tournamentplayer_win_to_await, is_tournament_end,
    update_tournament_status, create_next_tournament_match )

FRAME = 30 # フロントを見つつ調整
END_GAME_SCORE = 3 # deploy時には11に変更

# エラハンを完全無視、冗長さは少し無視してコーディングした

# Baseクラス
class LocalBaseMatchConsumer(AsyncWebsocketConsumer):
    async def connect(self): # クライアントからのWS接続時に呼び出される
        await self.accept()
        self.frame_rate = 1 / FRAME
        self.is_running = True
        asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        self.is_running = False

    async def receive(self, text_data): # クライアントからのメッセージ受信時に呼び出される
        data = json.loads(text_data)
        if "left" in data:
            self._handle_paddle_input(data["left"], self.game_manager.left_paddle)
        if "right" in data:
            self._handle_paddle_input(data["right"], self.game_manager.right_paddle)

    def _handle_paddle_input(self, paddle_data, paddle):
        key = paddle_data["key"]
        action = paddle_data["action"]
        if key == "PaddleUpKey" and action == "push":
            paddle.set_movement(-1)
        elif key == "PaddleDownKey" and action == "push":
            paddle.set_movement(1)
        elif action == "release":
            paddle.set_movement(0)

    async def game_loop(self):
        """ゲームループはサブクラスで実装"""
        raise NotImplementedError("Subclasses must implement game_loop")

class LocalSimpleMatchConsumer(LocalBaseMatchConsumer):
    async def connect(self):
        await super().connect() # 親クラスのconnectメソッドを呼び出している
        self.game_manager = GameManager(score_manager=LocalSimpleScoreManager())

    async def game_loop(self):
        while self.is_running:
            self.game_manager.update_game_state()
            await self.send(text_data=json.dumps(self.game_manager.get_game_state()))
            if (
                self.game_manager.score_manager.get_score("left") == END_GAME_SCORE or
                self.game_manager.score_manager.get_score("right") == END_GAME_SCORE
            ):
                self.is_running = False
            await asyncio.sleep(self.frame_rate)
        await self.close()

# Localでのトーナメントマッチの処理（リモートプレイヤーの導入時に削除予定）
class LocalTournamentMatchConsumer(LocalBaseMatchConsumer):
    async def connect(self):
        self.tournament_id = get_tournament_id_from_scope(self.scope)

        def fetch_match_and_details():
            match = Match.objects.get(tournament_id=self.tournament_id, status='start')
            matchdetails = list(sort_matchdetails_by_playerid(get_matchdetail_with_related_data(match.id)))
            return match, matchdetails

        match, matchdetails = await sync_to_async(fetch_match_and_details)()
        self.match_id = match.id
        self.sorted_matchedetails = matchdetails

        position_matchdetail = {
            "left": self.sorted_matchedetails[0].id,
            "right": self.sorted_matchedetails[1].id
        }

        await super().connect()
        self.game_manager = GameManager(score_manager=TournamentScoreManager(position_matchdetail))

    async def game_loop(self):
        while self.is_running:
            self.game_manager.update_game_state()
            await self.send(text_data=json.dumps(self.game_manager.get_game_state()))
            if (
                self.game_manager.score_manager.get_score("left") == END_GAME_SCORE or
                self.game_manager.score_manager.get_score("right") == END_GAME_SCORE
            ):
                self.is_running = False
                asyncio.create_task(self.finalize_game_state())
            await asyncio.sleep(self.frame_rate)
        await self.close()

    async def finalize_game_state(self):
        def sync_finalize():
            # RDBのMatchDetailのスコアを更新して、Redisのスコアを削除
            self.sorted_matchedetails[0].score = self.game_manager.score_manager.get_score("left")
            self.sorted_matchedetails[1].score = self.game_manager.score_manager.get_score("right")
            self.sorted_matchedetails[0].save()
            self.sorted_matchedetails[1].save()
            self.game_manager.score_manager.delete_score()
            # 勝者の判定
            if self.game_manager.score_manager.get_score("left") == END_GAME_SCORE:
                winner_id = self.sorted_matchedetails[0].player_id
            else:
                winner_id = self.sorted_matchedetails[1].player_id
            # 関連するRDBの更新処理
            update_when_match_end(self.match_id, winner_id, self.tournament_id)
            # トーナメントラウンドが終了した時の処理
            if is_round_end(self.tournament_id):
                update_tournamentplayer_win_to_await(self.tournament_id)
            # トーナメントが終了した時の処理
            if is_tournament_end(self.tournament_id):
                update_tournament_status(self.tournament_id, 'end')
            else:
                create_next_tournament_match(self.tournament_id)            
        await sync_to_async(sync_finalize)()
