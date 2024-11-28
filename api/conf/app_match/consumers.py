from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from asyncio import sleep
import json

from .game_logic import GameManager, SimpleScoreManager
from utils.websocket import get_tournament_id_from_scope

FRAME = 10
END_GAME_SCORE = 3

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
        await self.accept()
