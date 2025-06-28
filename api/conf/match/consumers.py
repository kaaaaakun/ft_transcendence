from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from asgiref.sync import sync_to_async
from asyncio import sleep
import json
import copy

from django.conf import settings
from .game_logic import GameManager, LocalSimpleScoreManager, TournamentScoreManager
from .models import Match
from tournament.models import Tournament

FRAME = 20 # フレームレート最適化（30fps→20fps）
END_GAME_SCORE = settings.END_GAME_SCORE

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
        # ゲーム状態をキャッシュして無駄な計算を減らす
        last_game_state = None
        frames_since_score_check = 0
        
        while self.is_running:
            self.game_manager.update_game_state()
            current_game_state = self.game_manager.get_game_state()
            
            # 状態が変化した時のみ送信（帯域幅節約）
            if current_game_state != last_game_state:
                await self.send(text_data=json.dumps(current_game_state))
                last_game_state = copy.deepcopy(current_game_state)
            
            # スコアチェックを毎フレームではなく10フレームごとに実行
            frames_since_score_check += 1
            if frames_since_score_check >= 10:
                if (
                    self.game_manager.score_manager.get_score("left") == END_GAME_SCORE or
                    self.game_manager.score_manager.get_score("right") == END_GAME_SCORE
                ):
                    self.is_running = False
                frames_since_score_check = 0
            
            await asyncio.sleep(self.frame_rate)
        await self.close()
