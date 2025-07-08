import '@/scss/styles.scss'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { Teact } from '@/js/libs/teact'
import { useNavigate } from '@/js/libs/router'
import { api } from '@/js/infrastructures/api/fetch'

// 定数
const PADDLE_WIDTH = 5
const BACKGROUND_COLOR = '#1E1E2C'
const UPDATE_INTERVAL = 1000 / 60

const RemoteGame = ({ params }) => {
  const { id } = params || {}
  const navigate = useNavigate()

  // 状態管理
  const [roomId, setRoomId] = Teact.useState(null)
  const [matchStarted, setMatchStarted] = Teact.useState(false)
  const [matchEnded, setMatchEnded] = Teact.useState(false)
  const [leftPlayerName, setLeftPlayerName] = Teact.useState('')
  const [rightPlayerName, setRightPlayerName] = Teact.useState('')

  // REST で room_id を取得
  Teact.useEffect(() => {
    if (!id) {
      return
    }
    api
      .get(`/api/matches/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status)
        }
        return response.json()
      })
      .then(json => setRoomId(json.room_id))
      .catch(() => navigate('/'))
  }, [id])

  // WebSocket 接続と描画ループ
  Teact.useEffect(() => {
    if (!roomId) {
      return
    }
    const token = localStorage.getItem('access_token')
    const socket = new WebSocket(
      `${import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost'}/api/ws/${roomId}?token=${encodeURIComponent(token)}`,
    )

    // 初期配置およびゲーム状態
    let leftPaddleY = (WALL_Y_LIMIT - PADDLE_HEIGHT) / 2
    let rightPaddleY = (WALL_Y_LIMIT - PADDLE_HEIGHT) / 2
    let ballX = WALL_X_LIMIT / 2
    let ballY = WALL_Y_LIMIT / 2
    let leftScore = 0
    let rightScore = 0
    let leftName = ''
    let rightName = ''
    let winnerName = ''
    let intervalId = null

    // 描画ユーティリティ
    const clearCanvas = (ctx, canvas) =>
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    const drawRect = (ctx, x, y, w, h, color) => {
      ctx.fillStyle = color
      ctx.fillRect(x, y, w, h)
    }
    const drawBall = (ctx, x, y, r, color) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    const drawText = (
      ctx,
      text,
      x,
      y,
      font = '48px sans-serif',
      color = 'white',
    ) => {
      ctx.font = font
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.fillText(text, x, y)
    }
    const drawDashedLine = (ctx, x, canvas) => {
      ctx.strokeStyle = 'white'
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 描画ループ
    function update() {
      const canvas = document.getElementById('pongCanvas')
      if (!canvas) {
        return
      }
      const ctx = canvas.getContext('2d')
      clearCanvas(ctx, canvas)
      drawRect(ctx, 0, 0, canvas.width, canvas.height, BACKGROUND_COLOR)
      drawDashedLine(ctx, canvas.width / 2, canvas)
      drawRect(ctx, 0, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white')
      drawRect(
        ctx,
        canvas.width - PADDLE_WIDTH,
        rightPaddleY,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        'white',
      )
      drawBall(ctx, ballX, ballY, BALL_RADIUS, 'white')
      drawText(ctx, `${leftScore}`, canvas.width / 4, 50)
      drawText(ctx, `${rightScore}`, (canvas.width / 4) * 3, 50)
      ctx.font = '18px sans-serif'
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.fillText(leftName, canvas.width / 4, 70)
      ctx.fillText(rightName, (canvas.width / 4) * 3, 70)
      if (winnerName) {
        drawText(
          ctx,
          `${winnerName} wins!`,
          canvas.width / 2,
          canvas.height / 2,
          '36px sans-serif',
        )
      }
    }

    socket.onmessage = e => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'start') {
        const leftInfo = msg.players.left
        const rightInfo = msg.players.right
        leftName = leftInfo.display_name
        rightName = rightInfo.display_name
        // プレイヤー名を state に反映
        setLeftPlayerName(leftName)
        setRightPlayerName(rightName)
        setMatchStarted(true)
        update()
        intervalId = setInterval(update, UPDATE_INTERVAL)
      } else if (msg.type === 'update') {
        leftPaddleY = msg.left.paddlePosition - PADDLE_HEIGHT / 2
        rightPaddleY = msg.right.paddlePosition - PADDLE_HEIGHT / 2
        ballX = msg.ballPosition.x
        ballY = msg.ballPosition.y
        leftScore = msg.left.score
        rightScore = msg.right.score
      } else if (msg.type === 'end') {
        leftPaddleY = msg.left.paddlePosition - PADDLE_HEIGHT / 2
        rightPaddleY = msg.right.paddlePosition - PADDLE_HEIGHT / 2
        leftScore = msg.left.score
        rightScore = msg.right.score
        winnerName = msg.winner
        setMatchEnded(true)
        clearInterval(intervalId)
        update()
        setTimeout(() => navigate(msg.redirectUrl), 6000)
      }
    }

    const keyHandler = e => {
      if (socket.readyState !== WebSocket.OPEN) {
        return
      }
      /* biome-ignore lint/style/useNamingConvention: 実際のキー入力（'ArrowUp'）（'ArrowDown'）をそのまま使用しているため */
      const map = { ArrowUp: 'PaddleUpKey', ArrowDown: 'PaddleDownKey' }
      if (!map[e.key]) {
        return
      }
      const action = e.type === 'keydown' ? 'push' : 'release'
      socket.send(JSON.stringify({ key: map[e.key], action }))
    }
    document.addEventListener('keydown', keyHandler)
    document.addEventListener('keyup', keyHandler)

    return () => {
      clearInterval(intervalId)
      socket.close()
      document.removeEventListener('keydown', keyHandler)
      document.removeEventListener('keyup', keyHandler)
    }
  }, [roomId, matchEnded])

  // レンダリング
  if (!roomId) {
    return HeaderWithTitleLayout(
      Teact.createElement(
        'h1',
        { className: 'text-center text-light' },
        'Loading...',
      ),
    )
  }
  if (!matchStarted) {
    return HeaderWithTitleLayout(
      Teact.createElement(
        'h1',
        { className: 'text-center text-light' },
        'Waiting for players...',
      ),
    )
  }
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
  )
}

export { RemoteGame }
