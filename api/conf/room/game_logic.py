import math
import random
from django.conf import settings
from asgiref.sync import sync_to_async

from utils.redis_client import get_redis
from match.models import MatchDetail, Match
import logging
logger = logging.getLogger('django')


# フィールド
WALL_X_LIMIT = settings.WALL_X_LIMIT
WALL_Y_LIMIT = settings.WALL_Y_LIMIT
# ボール
BALL_RADIUS = settings.BALL_RADIUS
BALL_INITIAL_X = WALL_X_LIMIT / 2
BALL_INITIAL_Y = WALL_Y_LIMIT / 2
BALL_INITIAL_SPEED = 6
BALL_RADIAN = random.uniform(-0.25, 0.25 * math.pi) * random.choice([1, -1]) # -45°~45° or 135°~225°
# パドル
PADDLE_HEIGHT = settings.PADDLE_HEIGHT
PADDLE_CLEARANCE = 0
PADDLE_INITIAL_Y = WALL_Y_LIMIT / 2
PADDLE_INITIAL_X_LEFT = PADDLE_CLEARANCE
PADDLE_INITIAL_X_RIGHT = WALL_X_LIMIT - PADDLE_CLEARANCE
PADDLE_Y_MIN = 0 + (PADDLE_HEIGHT / 2)
PADDLE_Y_MAX = WALL_Y_LIMIT - (PADDLE_HEIGHT / 2)
PADDLE_SPEED = 15

class GameManager:
    def __init__(self, user_id, score_manager=None, room_group_name=None, primary_connection=False):
        self.room_group_name = room_group_name
        self.score_manager = score_manager
        self.ball =  None
        self.wall = None
        self.left_paddle = None
        self.right_paddle = None
        self.left_user_id = None
        self.right_user_id = None
        self.left_display_name = ""
        self.right_display_name = ""
        self.tournament_id = None
        self.user_id = user_id
        self.paddle = None
        self.primary_connection = primary_connection
        if primary_connection:
            logger.debug(f"GameManager initialized with primary connection for user {user_id} in room {room_group_name}")
            self.ball = Ball()
            self.wall = Wall()
            self.left_paddle = Paddle(is_left = True, room_group_name=room_group_name)
            self.right_paddle = Paddle(is_left = False, room_group_name=room_group_name)


    async def get_player_info(self, room_id):
        try:
            left_player = await sync_to_async(MatchDetail.objects.get)(match_id=room_id, is_left_side=True)
            right_player = await sync_to_async(MatchDetail.objects.get)(match_id=room_id, is_left_side=False)
            logger.debug(f"left_player: {left_player}, right_player: {right_player}")
            self.left_user_id = left_player.user_id
            self.right_user_id = right_player.user_id
            self.left_display_name = await sync_to_async(lambda: left_player.user.display_name)()
            self.right_display_name = await sync_to_async(lambda: right_player.user.display_name)()
            self.left_user_id = await sync_to_async(lambda: left_player.user.id)()
            self.right_user_id = await sync_to_async(lambda: right_player.user.id)()
        except Exception as e:
            logger.error(f"Error getting player display names: {e}")
            self.left_display_name = "Left Player"
            self.right_display_name = "Right Player"
            self.left_user_id = None
            self.right_user_id = None

    async def get_tournament_id(self, room_id):
        try:
            match= await sync_to_async(Match.objects.get)(id=room_id)
            self.tournament_id = match.tournament_id
        except Match.DoesNotExist:
            logger.error(f"MatchDetail for room {room_id} does not exist.")
            return None
        except Exception as e:
            logger.error(f"Error getting tournament ID: {e}")
            return None

    def update_game_state(self):
        if not self.primary_connection:
            logger.debug(f"Skipping game state update for non-primary connection in room {self.room_group_name}")
            return
        self.ball.update_position()
        self.left_paddle.update_position()
        self.right_paddle.update_position()

        if self.wall.is_collision(self.ball):
            self.ball.set_radian(-self.ball.radian)

        if self.left_paddle.is_collision(self.ball):
            self.ball.bounce += 1
            self.ball.paddle_refrection(self.left_paddle)
        elif self.right_paddle.is_collision(self.ball):
            self.ball.bounce += 1
            self.ball.paddle_refrection(self.right_paddle)
        elif self.wall.is_goal(self.ball):
            if self.ball.isGoalLeft:
                self.score_manager.update_score("right", 1)
            else:
                self.score_manager.update_score("left", 1)
            self.ball.reset()

    def get_game_state(self):
        return {
            "left": {
                "paddlePosition": self.left_paddle.y,
                "score": self.score_manager.get_score("left")
            },
            "right": {
                "paddlePosition": self.right_paddle.y,
                "score": self.score_manager.get_score("right")
            },
            "ballPosition": {
                "x": self.ball.x,
                "y": self.ball.y
            }
        }

    def set_paddle_movement(self, paddle_data):
        if self.paddle:
            self.paddle.set_movement(paddle_data)
        else:
            logger.warning(f"Paddle not initialized for user {self.user_id} in room {self.room_group_name}")

    def get_start_message(self):
        return {
            "type": "start",
            'players': {
                "left": {
                    "display_name": self.left_display_name,
                },
                "right": {
                    "display_name": self.right_display_name,
                },
            }
        }


class ScoreManager:
    def __init__(self, room_group_name):
        self.room_group_name = room_group_name
        self.redis_client = get_redis()

    def update_score(self, side, points):
        current_score = self.redis_client.get(f"room:{self.room_group_name}:score:{side}") or 0
        self.redis_client.set(f"room:{self.room_group_name}:score:{side}", int(current_score) + points)

    def get_score(self, side):
        score = self.redis_client.get(f"room:{self.room_group_name}:score:{side}")
        return int(score) if score else 0

    def delete_score(self):
        self.redis_client.delete(f"room:{self.room_group_name}:score:left")
        self.redis_client.delete(f"room:{self.room_group_name}:score:right")

class Ball:
    def __init__(self):
        self.y = BALL_INITIAL_Y
        self.reset()

    def reset(self):
        self.x = BALL_INITIAL_X
        self.speed = BALL_INITIAL_SPEED
        # ラジアンを右側（-45° ~ 45°）または左側（135° ~ 225°）からランダムに選ぶ
        angle_ranges = [
            random.uniform(-0.25 * math.pi, 0.25 * math.pi),  # -45° ~ +45°
            random.uniform(0.75 * math.pi, 1.25 * math.pi)   # 135° ~ 225°
        ]
        self.radian = random.choice(angle_ranges)
        self.bounce = 0
        self.isGoalLeft = False
        # 計算速度を早めるために、角度とスピードに基づき、XYの移動量を計算してキャッシュしておく
        self.calculate_velocity_components(self.speed, self.radian)

    def update_position(self):
        self.x += self.vx
        self.y += self.vy

    def set_radian(self, new_radian):
        self.radian = new_radian
        # 移動量を再計算
        self.calculate_velocity_components(self.speed, new_radian)

    def set_speed(self, new_speed):
        self.speed = new_speed
        # 移動量を再計算
        self.calculate_velocity_components(new_speed, self.radian)

    def paddle_refrection(self, paddle):
        relative_position = (self.y - paddle.y) / (PADDLE_HEIGHT / 2)
        max_radian = math.pi / 3  # 最大反射角（60°）
        new_radian = max(-max_radian, min(max_radian, math.pi / 4 * relative_position))  # -60° ~ 60°
        if not paddle.is_left: # 右パドルの場合は角度を反転
            new_radian = math.pi - new_radian
        self.set_radian(new_radian)
        if self.bounce == 1:
            self.set_speed(self.speed * 1.7)

    def calculate_velocity_components(self, speed, radian):
        self.vx = speed * math.cos(radian)
        self.vy = speed * math.sin(radian)

class Wall:
    def is_collision(self, ball):
        # ボールが壁に衝突したかどうかをチェック。ただし、radianがすでに反転されている場合は無視
        if ((ball.y - BALL_RADIUS) <= 0 and  ball.vy < 0) \
            or (WALL_Y_LIMIT <= (ball.y + BALL_RADIUS) and ball.vy > 0):
            return True
        return False

    def is_goal(self, ball):
        # ボールがゴールに入ったかどうかをチェック
        # 注釈：パドルとの接触判定でも同じような計算を行っているので、処理が重すぎたら判定場所を変えてもいい（パドルのX位置が壁と同じな前提）
        if (ball.x - BALL_RADIUS) <= 0:
            ball.isGoalLeft = True
            return True
        elif WALL_X_LIMIT <= (ball.x + BALL_RADIUS):
            ball.isGoalLeft = False
            return True
        return False

class Paddle:
    def __init__(self, is_left, room_group_name):
        self.is_left = is_left # True:左側, False:右側
        if self.is_left:
            self.x = PADDLE_INITIAL_X_LEFT
        else:
            self.x = PADDLE_INITIAL_X_RIGHT
        self.y = PADDLE_INITIAL_Y
        self.room_group_name = room_group_name
        self.redis_client = get_redis()
        self.redis_client.hsetnx(f"room:{self.room_group_name}:paddle:{'left' if self.is_left else 'right'}", "movement_state", 0)

    def set_movement(self, paddle_data):
        key = paddle_data.get("key", "")
        action = paddle_data.get("action", "")
        movement_state = 0
        if key == "PaddleUpKey" and action == "push":
            movement_state = -1
        elif key == "PaddleDownKey" and action == "push":
            movement_state = 1
        elif action == "release":
            movement_state = 0
        self.redis_client.hset(f"room:{self.room_group_name}:paddle:{'left' if self.is_left else 'right'}", "movement_state", movement_state)

    def update_position(self):
        movement_state = int(self.redis_client.hget(f"room:{self.room_group_name}:paddle:{'left' if self.is_left else 'right'}", "movement_state")) or 0
        if movement_state == 0:
            return
        y = self.y + movement_state * PADDLE_SPEED
        if y < PADDLE_Y_MIN or PADDLE_Y_MAX < y:
            # パドルがフィールド外に出る場合はポジションを更新しない
            return
        self.y = y

    def is_collision(self, ball):
        if self.is_left:
            if ( # ボールの左端がパドルより右側にある and ボールの中心がパドルの範囲内にある
                (ball.x - BALL_RADIUS) <= self.x and
                self.y - (PADDLE_HEIGHT / 2) <= ball.y <= self.y + (PADDLE_HEIGHT / 2)
            ):
                return True
        else:
            if (
                self.x <= (ball.x + BALL_RADIUS) and
                self.y - (PADDLE_HEIGHT / 2) <= ball.y <= self.y + (PADDLE_HEIGHT / 2)
            ):
                return True
        return False
