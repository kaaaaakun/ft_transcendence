import '@/scss/styles.scss'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { Teact } from '@/js/libs/teact'
import { useNavigate } from '@/js/libs/router'
import { api } from '@/js/infrastructures/api/fetch'

// 定数設定
const BACKGROUND_COLOR = '#1E1E2C'
const PADDLE_WIDTH = 5
const UPDATE_INTERVAL = 1000 / 60

const RemoteGame = ({ params }) => {
  // URL の :id (Match テーブルの主キー)
  const { id: dbMatchId } = params || {}
  const navigate = useNavigate()

  // --- 状態管理 ---
  // ルームID (REST から取得: e.g. "room.SIMPLE.12345")
  const [roomId, setRoomId] = Teact.useState(null)
  // プレイヤー情報
  const [players, setPlayers] = Teact.useState({ left: null, right: null })
  // ゲームの動的状態 (パドル位置、スコア、ボール位置)
  const [gameState, setGameState] = Teact.useState({
    left:  { paddlePosition: 0, score: 0 },
    right: { paddlePosition: 0, score: 0 },
    ballPosition: { x: WALL_X_LIMIT / 2, y: WALL_Y_LIMIT / 2 },
  })
  // マッチ開始／終了フラグ
  const [matchStarted, setMatchStarted] = Teact.useState(false)
  const [matchEnded, setMatchEnded] = Teact.useState(false)
  // 結果情報
  const [winner, setWinner] = Teact.useState(null)
  const [redirectUrl, setRedirectUrl] = Teact.useState(null)

  // --- 1) REST で room_id を取得 ---
  Teact.useEffect(() => {
    if (!dbMatchId) return
    api.get(`/api/matches/${dbMatchId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Match fetch failed: ${res.status}`)
        return res.json()
      })
      .then(data => {
        // レスポンス例: { room_id: "room.SIMPLE.12345" }
        setRoomId(data.room_id)
      })
      .catch(err => {
        console.error('Error fetching room_id:', err)
        navigate('/')
      })
  }, [dbMatchId])

  // --- 2) WebSocket 接続とメッセージ処理 ---
  Teact.useEffect(() => {
    if (!roomId) return
    const baseWsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost'
    // roomId をフルに使って接続
    const wsUrl = `${baseWsUrl}/api/ws/${roomId}`
    const socket = new WebSocket(wsUrl)

    // Arrow キー状態
    let upPressed = false
    let downPressed = false

    // キー入力メッセージ化
    const makeKeyMsg = (key, pressed) => {
      if (key !== 'ArrowUp' && key !== 'ArrowDown') return null
      if ((key === 'ArrowUp' && upPressed === pressed) ||
          (key === 'ArrowDown' && downPressed === pressed)) return null
      if (key === 'ArrowUp') upPressed = pressed
      if (key === 'ArrowDown') downPressed = pressed
      return {
        key: key === 'ArrowUp' ? 'PaddleUpKey' : 'PaddleDownKey',
        action: pressed ? 'push' : 'release'
      }
    }

    const onKeyDown = e => {
      const msg = makeKeyMsg(e.key, true)
      if (msg && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(msg))
    }
    const onKeyUp = e => {
      const msg = makeKeyMsg(e.key, false)
      if (msg && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(msg))
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    let intervalId = null
    // メッセージ受信
    socket.addEventListener('message', evt => {
      const data = JSON.parse(evt.data)
      switch (data.type) {
        case 'start':
          setPlayers(data.players)
          setMatchStarted(true)
          intervalId = setInterval(draw, UPDATE_INTERVAL)
          break
        case 'update':
          setGameState({ left: data.left, right: data.right, ballPosition: data.ballPosition })
          break
        case 'end':
          setGameState({ left: data.left, right: data.right, ballPosition: data.ballPosition })
          setWinner(data.winner)
          setRedirectUrl(data.redirectUrl)
          setMatchEnded(true)
          clearInterval(intervalId)
          break
      }
    })

    // 描画関数
    function draw() {
      const canvas = document.getElementById('pongCanvas')
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = BACKGROUND_COLOR
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = 'white'
      ctx.setLineDash([5,5])
      ctx.beginPath()
      ctx.moveTo(canvas.width/2,0)
      ctx.lineTo(canvas.width/2,canvas.height)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = 'white'
      const { left, right } = gameState
      ctx.fillRect(0, left.paddlePosition - PADDLE_HEIGHT/2, PADDLE_WIDTH, PADDLE_HEIGHT)
      ctx.fillRect(canvas.width - PADDLE_WIDTH, right.paddlePosition - PADDLE_HEIGHT/2, PADDLE_WIDTH, PADDLE_HEIGHT)

      if (!matchEnded) {
        ctx.beginPath()
        ctx.arc(gameState.ballPosition.x, gameState.ballPosition.y, BALL_RADIUS, 0, Math.PI*2)
        ctx.fill()
      }

      ctx.font = '48px sans-serif'
      ctx.fillText(left.score, canvas.width/4, 50)
      ctx.fillText(right.score, (canvas.width/4)*3, 50)

      if (matchEnded) {
        ctx.fillText(`${winner} wins!`, canvas.width/2 - 100, canvas.height/2)
      }
    }

    // クリーンアップ
    return () => {
      clearInterval(intervalId)
      socket.close()
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [roomId])

  // --- 3) 終了後リダイレクト ---
  Teact.useEffect(() => {
    if (matchEnded && redirectUrl) navigate(redirectUrl)
  }, [matchEnded, redirectUrl])

  // --- レンダリング ---
  return matchStarted
    ? HeaderWithTitleLayout(
        Teact.createElement(
          'div',
          { className: 'd-flex justify-content-center align-items-center' },
          Teact.createElement('canvas', { id: 'pongCanvas', width: WALL_X_LIMIT, height: WALL_Y_LIMIT })
        )
      )
    : HeaderWithTitleLayout(
        Teact.createElement(
          'h1',
          { className: 'text-center text-light' },
          'Waiting for opponent...'
        )
      )
}

export { RemoteGame }
