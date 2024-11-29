from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from asgiref.sync import sync_to_async
from asyncio import sleep
import json

from .game_logic import GameManager, SimpleScoreManager, TournamentScoreManager
from .models import Match, MatchDetail
from .utils import ( sort_matchdetails_by_playerid, 
    get_matchdetail_with_related_data, update_when_match_end, )
from utils.websocket import get_tournament_id_from_scope
from tournament.utils import ( is_round_end, update_tournamentplayer_win_to_await, is_tournament_end,
    update_tournament_status, create_next_tournament_match )

FRAME = 10
END_GAME_SCORE = 3 # deploy時には11に変更

# 冗長さとエラハンを完全無視してコーディングした
# redisのデータ削除処理がないので、redisのデータが残り続ける
class SMatchConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # ゲームロジック管理用のインスタンスを作成
        self.game_manager = GameManager(score_manager = SimpleScoreManager())
        self.frame_rate = 1 / FRAME
        self.is_running = True
        # ゲームループを開始
        asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        self.is_running = False

    async def receive(self, text_data):
        # クライアントからの入力をパドルに反映
        data = json.loads(text_data)
        if "left" in data:
            self._handle_paddle_input(data["left"], self.game_manager.left_paddle)
        if "right" in data:
            self._handle_paddle_input(data["right"], self.game_manager.right_paddle)

    async def game_loop(self):
        while self.is_running:
            # ゲーム状態を更新
            self.game_manager.update_game_state()
            # クライアントにゲームの現在の状態を送信
            await self.send(text_data=json.dumps(self.game_manager.get_game_state()))
            # どちらかのスコアがENDに達したらゲームを終了
            if self.game_manager.score_manager.get_score("left") == END_GAME_SCORE or self.game_manager.score_manager.get_score("right") == END_GAME_SCORE:
                self.is_running = False
            # 次のフレームまで待機
            await asyncio.sleep(self.frame_rate)
        # websocketを閉じる
        await self.close()

    def _handle_paddle_input(self, paddle_data, paddle):
        """パドルの入力処理を担当"""
        key = paddle_data["key"]
        action = paddle_data["action"]
        if key == "PaddleUpKey" and action == "push":
            paddle.set_movement(1)
        elif key == "PaddleDownKey" and action == "push":
            paddle.set_movement(-1)
        elif action == "release":
            paddle.set_movement(0)

class TMatchConsumer(AsyncWebsocketConsumer):
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

        await self.accept()
        self.game_manager = GameManager(score_manager=TournamentScoreManager(position_matchdetail))
        self.frame_rate = 1 / FRAME
        self.is_running = True
        asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        self.is_running = False

    async def receive(self, text_data):
        data = json.loads(text_data)
        if "left" in data:
            self._handle_paddle_input(data["left"], self.game_manager.left_paddle)
        if "right" in data:
            self._handle_paddle_input(data["right"], self.game_manager.right_paddle)

    async def game_loop(self):
        while self.is_running:
            self.game_manager.update_game_state()
            await self.send(text_data=json.dumps(self.game_manager.get_game_state()))
            # ゲーム終了条件の確認
            if (
                self.game_manager.score_manager.get_score("left") == END_GAME_SCORE or
                self.game_manager.score_manager.get_score("right") == END_GAME_SCORE
            ):
                self.is_running = False
                # ゲーム終了後の同期処理を非同期タスクとして実行
                asyncio.create_task(self.finalize_game_state())
            await asyncio.sleep(self.frame_rate)
        await self.close()

    def _handle_paddle_input(self, paddle_data, paddle):
        key = paddle_data["key"]
        action = paddle_data["action"]
        if key == "PaddleUpKey" and action == "push":
            paddle.set_movement(1)
        elif key == "PaddleDownKey" and action == "push":
            paddle.set_movement(-1)
        elif action == "release":
            paddle.set_movement(0)

    async def finalize_game_state(self):
        # 終了時の処理を同期的に実行
        def sync_finalize():
            self.sorted_matchedetails[0].score = self.game_manager.score_manager.get_score("left")
            self.sorted_matchedetails[1].score = self.game_manager.score_manager.get_score("right")
            self.sorted_matchedetails[0].save()
            self.sorted_matchedetails[1].save()

            if self.game_manager.score_manager.get_score("left") == END_GAME_SCORE:
                winner_id = self.sorted_matchedetails[0].player_id
            else:
                winner_id = self.sorted_matchedetails[1].player_id

            # RDBの更新処理
            update_when_match_end(self.match_id, winner_id, self.tournament_id)

            # トーナメントラウンドが終了した時の処理
            if is_round_end(self.tournament_id):
                update_tournamentplayer_win_to_await(self.tournament_id)

            # トーナメントの終了判定
            if is_tournament_end(self.tournament_id):
                update_tournament_status(self.tournament_id, 'end')
            else:
                create_next_tournament_match(self.tournament_id)

        # 非同期コンテキストから同期関数を呼び出す
        await sync_to_async(sync_finalize)()