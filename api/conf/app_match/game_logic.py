import math
import random

# フィールド
WALL_X_LIMIT = 500
WALL_Y_LIMIT = 300
# ボール
BALL_RADIUS = 2
BALL_INITIAL_X = WALL_X_LIMIT / 2
BALL_INITIAL_Y = WALL_Y_LIMIT / 2
BALL_INITIAL_SPEED = 10
BALL_RADIAN = random.uniform(-0.25, 0.25 * math.pi) * random.choice([1, -1]) # -45°~45° or 135°~225°
# パドル
PADDLE_WIDTH = 30
PADDLE_CLEARANCE = 0
PADDLE_INITIAL_Y = WALL_Y_LIMIT / 2
PADDLE_INITIAL_X_LEFT = PADDLE_CLEARANCE
PADDLE_INITIAL_X_RIGHT = WALL_X_LIMIT - PADDLE_CLEARANCE
PADDLE_Y_MIN = 0 + (PADDLE_WIDTH / 2)
PADDLE_Y_MAX = WALL_Y_LIMIT - (PADDLE_WIDTH / 2)
PADDLE_SPEED = 1

class GameManager:
    def __init__(self):
        self.ball = Ball()
        self.wall = Wall()
        self.left_paddle = Paddle(is_left = True)
        self.right_paddle = Paddle(is_left = False)
        self.left_score = 0
        self.right_score = 0

    def update_game_state(self):
        # ボールとパドルの位置を更新
        self.ball.update_position()
        self.left_paddle.update_position()
        self.right_paddle.update_position()

        # 衝突判定
        if self.wall.is_collision(self.ball):
            self.ball.set_radian(-self.ball.radian)

        if self.left_paddle.is_collision(self.ball):
            self.ball.bounce += 1
            self.ball.paddle_refrection(self.left_paddle)
            if self.ball.bounce == 1:
                self.ball.set_speed(self.ball.speed * 2)
        elif self.right_paddle.is_collision(self.ball):
            self.ball.bounce += 1
            self.ball.paddle_refrection(self.right_paddle)
            if self.ball.bounce == 1:
                self.ball.set_speed(self.ball.speed * 2)

        # ゴール判定
        if self.wall.is_goal(self.ball):
            if self.ball.isGoalLeft:
                self.left_score += 1
            else:
                self.right_score += 1
            print("Goal!")
            self.ball.reset()

    def get_game_state(self):
        return {
            "left": {
                "paddlePosition": self.left_paddle.y,
                "score": self.left_score
            },
            "right": {
                "paddlePosition": self.right_paddle.y,
                "score": self.right_score
            },
            "ballPosition": {
                "x": self.ball.x,
                "y": self.ball.y
            }
        }

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
        relative_position = (self.y - paddle.y) / (PADDLE_WIDTH / 2)
        max_radian = math.pi / 3  # 最大反射角（60°）
        new_radian = max(-max_radian, min(max_radian, math.pi / 4 * relative_position))  # -60° ~ 60°
        if not paddle.is_left: # 右パドルの場合は角度を反転
            new_radian = math.pi - new_radian
        self.set_radian(new_radian)

    def calculate_velocity_components(self, speed, radian):
        self.vx = speed * math.cos(radian)
        self.vy = speed * math.sin(radian)

class Wall:
    def is_collision(self, ball):
        # ボールが壁に衝突したかどうかをチェック
        if (ball.y - BALL_RADIUS) <= 0 or WALL_Y_LIMIT <= (ball.y + BALL_RADIUS):
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
    def __init__(self, is_left):
        self.is_left = is_left # True:左側, False:右側
        if self.is_left:
            self.x = PADDLE_INITIAL_X_LEFT
        else:
            self.x = PADDLE_INITIAL_X_RIGHT
        self.y = PADDLE_INITIAL_Y
        self.movement_state = 0 # 0:stop, 1:up, -1:down

    def set_movement(self, state):
        self.movement_state = state

    def update_position(self):
        if self.movement_state == 0:
            return
        y = self.y + self.movement_state * PADDLE_SPEED
        if y < PADDLE_Y_MIN or PADDLE_Y_MAX < y:
            # パドルがフィールド外に出る場合はポジションを更新しない
            return
        self.y = y

    def is_collision(self, ball):
        if self.is_left:
            if ( # ボールの左端がパドルより右側にある and ボールの中心がパドルの範囲内にある
                (ball.x - BALL_RADIUS) <= self.x and
                self.y - (PADDLE_WIDTH / 2) <= ball.y <= self.y + (PADDLE_WIDTH / 2)
            ):
                return True
        else:
            if (
                self.x <= (ball.x + BALL_RADIUS) and
                self.y - (PADDLE_WIDTH / 2) <= ball.y <= self.y + (PADDLE_WIDTH / 2)
            ):
                return True
        return False