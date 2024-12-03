import '@/scss/styles.scss'
import { DefaultButton } from '@/js/components/ui/button'
import { api } from '@/js/infrastructures/api/fetch'
import { tournamentsApi } from '@/js/infrastructures/api/tournamentApi'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { useLocation, useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

// バックエンドと共通の定数
const BACKGROUND_COLOR = '#1E1E2C';
const WALL_X_LIMIT = 500
const WALL_Y_LIMIT = 300
const BALL_RADIUS = 2 // TODO:ask ちょっと小さすぎ？
const PADDLE_WIDTH = 30

// フロントのみの定数
const PADDLE_HEIGHT = 10

function fetchTournament(endMatch) {
  if (!endMatch) {
    return
  }
  const navigate = useNavigate()
  tournamentsApi
    .fetchLocalTournament()
    .then(data => {
      console.log('Success:', data)
      navigate('/tournament', { data })
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

const Pong = () => {
  const [endMatch, setEndMatch] = Teact.useState(false)
  const loc = useLocation()
  if (!loc.state) {
    return BaseLayout(
      Teact.createElement(
        'div',
        { className: 'container' },
        Teact.createElement(
          'h1',
          { className: 'text-center text-light' },
          'Error',
        ),
      ),
    )
  }
  console.log(loc.state)
  const data = loc.state.data
  const matchId = data.players[0].match_details.match_id
  const player1Name = data.players[0].player.name
  const player2Name = data.players[1].player.name
  let winner = null

  Teact.useEffect(() => {
    const canvas = document.getElementById('pongCanvas')
    const context = canvas.getContext('2d')

    // 描画に必要な変更される情報
    let rightPaddleY = (canvas.height - PADDLE_WIDTH) / 2
    let leftPaddleY = (canvas.height - PADDLE_WIDTH) / 2
    let ballX = canvas.width / 2
    let ballY = canvas.height / 2
    let rightScore = 0
    let leftScore = 0

    // パドルの操作
    let isLeftPaddleUp = false
    let isLeftPaddleDown = false
    let isRightPaddleUp = false
    let isRightPaddleDown = false

    function drawRect(x, y, width, height, color) {
      context.fillStyle = color
      context.fillRect(x, y, width, height)
    }

    function drawBall(x, y, size, color) {
      context.fillStyle = color
      context.beginPath()
      context.arc(x, y, size, 0, Math.PI * 2, true)
      context.fill()
    }

    function drawText(text, x, y, font = '48px sans-serif', color = 'white') {
      context.font = font
      context.fillStyle = color
      context.textAlign = 'center'
      context.fillText(text, x, y)
    }

    // 描画系
    function draw() {
      drawRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOR) //canvasの描画
      drawRect(0, rightPaddleY, PADDLE_HEIGHT, PADDLE_WIDTH, 'white') //パドルの描画(left)
      drawRect(canvas.width - PADDLE_HEIGHT, leftPaddleY, PADDLE_HEIGHT, PADDLE_WIDTH, 'white') //パドルの描画(right)
      if (winner === null) {
        drawBall(ballX, ballY, BALL_RADIUS, '#FFD700')
      }
      // スコアを描画
      drawText(
        `${rightScore}`,
        canvas.width / 4,
        50,
        '48px sans-serif',
        rightScore === 10 ? 'yellow' : 'white',
      )
      drawText(
        `${leftScore}`,
        (canvas.width / 4) * 3,
        50,
        '48px sans-serif',
        leftScore === 10 ? 'yellow' : 'white',
      )
    }

    function update() {
      draw()
      if (winner !== null) {
        clearInterval(intervalId)
        drawText(
          `${winner.player.name} wins!`,
          canvas.width / 2,
          canvas.height / 2,
        )
        setEndMatch(true)
      }
    }

    // 1P（W: 上、S: 下）と2P（↑: 上、↓: 下）のキー割り当て
    function keyDownHandler(e) {
        let message;
    
        if (e.key === 'ArrowUp' && !isRightPaddleUp) {
            message =  {"right": { "key": "PaddleUpKey", "action": "push" }}
            isRightPaddleUp = true;
        } else if (e.key === 'ArrowDown'&& !isRightPaddleDown) {
            message =  {"right": { "key": "PaddleDownKey", "action": "push" }}
            isRightPaddleDown = true;
        } else if ((e.key === 'w' || e.key === 'W') && !isLeftPaddleUp) {
            message =  {"left": { "key": "PaddleUpKey", "action": "push" }}
            isLeftPaddleUp = true;
        } else if ((e.key === 's' || e.key === 'S') && !isLeftPaddleDown) {
            message =  {"left": { "key": "PaddleDownKey", "action": "push" }}
            isLeftPaddleDown = true;
        } else { 
            return
        }
        socket.send(JSON.stringify(message));
    }

    function keyUpHandler(e) {
        let message;
    
        if (e.key === 'ArrowUp' && isRightPaddleUp) {
            message =  {"right": { "key": "PaddleUpKey", "action": "release" }}
            isRightPaddleUp = false;
        } else if (e.key === 'ArrowDown'&& isRightPaddleDown) {
            message =  {"right": { "key": "PaddleDownKey", "action": "release" }}
            isRightPaddleDown = false;
        } else if ((e.key === 'w' || e.key === 'W') && isLeftPaddleUp) {
            message =  {"left": { "key": "PaddleUpKey", "action": "release" }}
            isLeftPaddleUp = false;
        } else if ((e.key === 's' || e.key === 'S') && isLeftPaddleDown) {
            message =  {"left": { "key": "PaddleDownKey", "action": "release" }}
            isLeftPaddleDown = false;
        } else { 
            return
        }
        socket.send(JSON.stringify(message));
    }

    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)

    const socket = new WebSocket('ws://localhost:8080/api/ws/matches');
    // 接続が確立したとき
    socket.addEventListener('open', () => {
      console.log('サーバーに接続しました');
      socket.send('こんにちは、サーバー！');
    });

    // サーバーからメッセージを受信したとき
    socket.addEventListener('message', (event) => {
      const gameState = JSON.parse(event.data);
      ballX = gameState.ballPosition.x;
      ballY = gameState.ballPosition.y;
      rightPaddleY = gameState.right.paddlePosition;
      leftPaddleY = gameState.left.paddlePosition;
      rightScore =  gameState.right.score;
      leftScore =  gameState.left.score;
      
    });

    // エラーが発生したとき
    socket.addEventListener('error', (error) => {
      console.error('エラーが発生しました:', error);
    });

    // 接続が閉じられたとき
    socket.addEventListener('close', () => {
      console.log('接続が閉じられました');
    });

    const intervalId = setInterval(update, 1000 / 60)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('keydown', keyDownHandler)
      document.removeEventListener('keyup', keyUpHandler)
    }
  }, [])

  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container' },
      Teact.createElement(
        'div',
        {
          id: 'pong',
          className: 'd-flex justify-content-center align-items-center',
        },
        Teact.createElement(
          'div',
          { className: 'd-flex align-items-center justify-content-center' },
          Teact.createElement(
            'div',
            {
              id: 'leftPlayer',
              className: 'text-center fs-2 text-white me-3',
              style: { writingMode: 'vertical-rl' },
            },
            player1Name,
          ),
          Teact.createElement(
            'div',
            {
              className: 'position-relative',
              style: {
                width: `${WALL_X_LIMIT}px`,
                height: `${WALL_Y_LIMIT}px`,
                backgroundColor: BACKGROUND_COLOR,
              },
            },
            Teact.createElement('canvas', {
              id: 'pongCanvas',
              width: WALL_X_LIMIT,
              height: WALL_Y_LIMIT,
            }),
          ),
          Teact.createElement(
            'div',
            {
              id: 'rightPlayer',
              className: 'text-center fs-2 text-white ms-3',
              style: { writingMode: 'vertical-rl' },
            },
            player2Name,
          ),
        ),
      ),
      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto', id: 'utilButton' },
        endMatch
          ? DefaultButton({
              text: 'トーナメント画面へ',
              onClick: () => fetchTournament(endMatch),
            })
          : null,
      ),
    ),
  )
}

export { Pong }
