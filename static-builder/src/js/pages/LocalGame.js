import '@/scss/styles.scss'
import { api } from '@/js/infrastructures/api/fetch'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { Teact } from '@/js/libs/teact'

// バックエンドと共通の定数

// フロントのみの定数
const BACKGROUND_COLOR = '#1E1E2C'
const PADDLE_WIDTH = 5

const LocalGame = () => {
  const [endMatch, setEndMatch] = Teact.useState(false)
  const [gameData, setGameData] = Teact.useState(null)

  Teact.useEffect(() => {
    api
      .get('/api/matches/local')
      .then(response => response.json())
      .then(data => {
        setGameData(data)
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }, [])

  // API の結果を待つ
  if (!gameData) {
    return HeaderWithTitleLayout(
      Teact.createElement(
        'div',
        { className: 'container' },
        Teact.createElement(
          'h1',
          { className: 'text-center text-light' },
          'Loading...',
        ),
      ),
    )
  }

  console.log('gameData', gameData)
  const leftPlayerName = gameData.left.player_name
  const rightPlayerName = gameData.right.player_name
  let winner = null

  Teact.useEffect(() => {
    const canvas = document.getElementById('pongCanvas')
    const context = canvas.getContext('2d')

    // バックエンドからの情報(最初は時差があるためフロントで初期値を設定)
    let rightPaddleY = (canvas.height - PADDLE_HEIGHT) / 2
    let leftPaddleY = (canvas.height - PADDLE_HEIGHT) / 2
    let ballX = canvas.width / 2
    let ballY = canvas.height / 2
    let rightScore = 0
    let leftScore = 0

    function clearCanvas() {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }

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

    function drawDashedLine(x, color = 'white') {
      context.strokeStyle = color
      context.lineWidth = 2
      context.setLineDash([5, 5]) // 点線のパターン
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, canvas.height)
      context.stroke()
      context.setLineDash([]) // 点線をリセット
    }

    function draw() {
      clearCanvas()
      drawRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOR)
      drawDashedLine(canvas.width / 2)
      drawRect(
        canvas.width - PADDLE_WIDTH,
        rightPaddleY - PADDLE_HEIGHT / 2,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        'white',
      )
      drawRect(
        0,
        leftPaddleY - PADDLE_HEIGHT / 2,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        'white',
      )
      if (winner === null) {
        drawBall(ballX, ballY, BALL_RADIUS, '#FFD700')
      }
      drawText(
        `${rightScore}`,
        canvas.width / 4,
        50,
        '48px sans-serif',
        rightScore >= END_GAME_SCORE - 1 ? 'yellow' : 'white',
      )
      drawText(
        `${leftScore}`,
        (canvas.width / 4) * 3,
        50,
        '48px sans-serif',
        leftScore >= END_GAME_SCORE - 1 ? 'yellow' : 'white',
      )
    }

    function update() {
      draw()
      if (leftScore === END_GAME_SCORE || rightScore === END_GAME_SCORE) {
        winner = leftScore === END_GAME_SCORE ? rightPlayerName : leftPlayerName
        drawText(`${winner} wins!`, canvas.width / 2, canvas.height / 2)
        setEndMatch(true)
        clearInterval(intervalId)
        return
      }
    }

    // NOTE: キーの状態を保持する
    const paddleStates = {
      isRightPaddleUp: false,
      isRightPaddleDown: false,
      isLeftPaddleUp: false,
      isLeftPaddleDown: false,
    }
    const keyMappings = {
      ArrowUp: {
        paddle: 'right',
        key: 'PaddleUpKey',
        state: 'isRightPaddleUp',
      },
      ArrowDown: {
        paddle: 'right',
        key: 'PaddleDownKey',
        state: 'isRightPaddleDown',
      },
      w: { paddle: 'left', key: 'PaddleUpKey', state: 'isLeftPaddleUp' },
      W: { paddle: 'left', key: 'PaddleUpKey', state: 'isLeftPaddleUp' },
      s: { paddle: 'left', key: 'PaddleDownKey', state: 'isLeftPaddleDown' },
      S: { paddle: 'left', key: 'PaddleDownKey', state: 'isLeftPaddleDown' },
    }

    function handleKeyPush(key, isPushed) {
      const mapping = keyMappings[key]
      if (!mapping) return null

      const { state } = mapping
      if (isPushed !== paddleStates[state]) {
        paddleStates[state] = isPushed
        return {
          [mapping.paddle]: {
            key: mapping.key,
            action: isPushed ? 'push' : 'release',
          },
        }
      }
      return null
    }

    function handleKeyEvent(e, isPushed) {
      const message = handleKeyPush(e.key, isPushed)
      if (message && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message))
      }
    }

    const keyDownHandler = e => handleKeyEvent(e, true)
    const keyUpHandler = e => handleKeyEvent(e, false)

    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)

    // const url = 'ws://localhost:8080/api/ws/matches' // mokc-server用
    // const url = "ws://localhost:80/api/ws/local-simple-match/"; //memo
    const baseWsUrl = import.meta.env.VITE_WEBSOCKET_URL ?? 'wss://localhost'
    const url = `${baseWsUrl}/api/ws/local-simple-match/`
    const socket = new WebSocket(url)
    console.log('socket', socket)
    socket.addEventListener('message', event => {
      const gameState = JSON.parse(event.data)
      console.log(gameState)
      ballX = gameState.ballPosition.x
      ballY = gameState.ballPosition.y
      rightPaddleY = gameState.right.paddlePosition
      leftPaddleY = gameState.left.paddlePosition
      rightScore = gameState.right.score
      leftScore = gameState.left.score
    })

    const intervalId = setInterval(update, 1000 / 60)

    return () => {
      clearInterval(intervalId)
      // socket.close()
      document.removeEventListener('keydown', keyDownHandler)
      document.removeEventListener('keyup', keyUpHandler)
    }
  }, [])

  return HeaderWithTitleLayout(
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
            leftPlayerName,
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
            rightPlayerName,
          ),
        ),
      ),
    ),
  )
}

export { LocalGame }
