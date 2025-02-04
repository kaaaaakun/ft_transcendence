import '@/scss/styles.scss'
import { DefaultButton } from '@/js/components/ui/button'
import { tournamentsApi } from '@/js/infrastructures/api/tournamentApi'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { useLocation, useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

// バックエンドと共通の定数

// フロントのみの定数
const BACKGROUND_COLOR = '#1E1E2C'
const PADDLE_WIDTH = 5

function fetchTournament(endMatch) {
  if (!endMatch) {
    return
  }

  const navigate = useNavigate()
  tournamentsApi
    .fetchLocalTournament()
    .then(data => {
      navigate('/tournament', { data })
    })
    .catch(error => console.error('Error:', error))
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

  const data = loc.state.data
  const leftPlayerName = data.left.player_name
  const rightPlayerName = data.right.player_name
  let winner = null

  Teact.useEffect(() => {
    const canvas = document.getElementById('pongCanvas')
    const context = canvas.getContext('2d')

    // バックエンドからの情報(最初は時差があるためフロントで初期値を設定)
    let rightPaddleY = (canvas.height - __PADDLE_HEIGHT__) / 2
    let leftPaddleY = (canvas.height - __PADDLE_HEIGHT__) / 2
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

    function draw() {
      clearCanvas()
      drawRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOR)
      drawRect(
        canvas.width - PADDLE_WIDTH,
        rightPaddleY - __PADDLE_HEIGHT__ / 2,
        PADDLE_WIDTH,
        __PADDLE_HEIGHT__,
        'white',
      )
      drawRect(
        0,
        leftPaddleY - __PADDLE_HEIGHT__ / 2,
        PADDLE_WIDTH,
        __PADDLE_HEIGHT__,
        'white',
      )
      if (winner === null) {
        drawBall(ballX, ballY, __BALL_RADIUS__, '#FFD700')
      }
      drawText(
        `${rightScore}`,
        canvas.width / 4,
        50,
        '48px sans-serif',
        rightScore >= (__END_GAME_SCORE__ - 1) ? 'yellow' : 'white',
      )
      drawText(
        `${leftScore}`,
        (canvas.width / 4) * 3,
        50,
        '48px sans-serif',
        leftScore >= (__END_GAME_SCORE__ - 1) ? 'yellow' : 'white',
      )
    }

    function update() {
      draw()
      if (leftScore === __END_GAME_SCORE__ || rightScore === __END_GAME_SCORE__) {
        winner = leftScore === __END_GAME_SCORE__ ? rightPlayerName : leftPlayerName
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
    // const url = 'ws://localhost:80/api/ws/local-tournament-match/'
    const baseWsUrl = import.meta.env.VITE_WEBSOCKET_URL ?? 'wss://localhost'
    const url = `${baseWsUrl}/api/ws/local-tournament-match/`
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
            leftPlayerName,
          ),
          Teact.createElement(
            'div',
            {
              className: 'position-relative',
              style: {
                width: `${__WALL_X_LIMIT__}px`,
                height: `${__WALL_Y_LIMIT__}px`,
                backgroundColor: BACKGROUND_COLOR,
              },
            },
            Teact.createElement('canvas', {
              id: 'pongCanvas',
              width: __WALL_X_LIMIT__,
              height: __WALL_Y_LIMIT__,
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
