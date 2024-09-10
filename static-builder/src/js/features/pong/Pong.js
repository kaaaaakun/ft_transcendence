import '@/scss/styles.scss'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/libs/teact'
import { DefaultButton } from '@/js/components/ui/button'

function Pong( {data} ) {
  const [state, setState] = Teact.useState(0)
  const match_id = data["match_id"]
  document.cookie = "match_id=" + match_id;
  let score1 = data["players"][0]["matchdetail"]["score"]
  let score2 = data["players"][1]["matchdetail"]["score"]
  const player1name = data["players"][0]["player"]["name"]
  const player2name = data["players"][1]["player"]["name"]
  const player1id = data["players"][0]["matchdetail"]["player_id"]
  const player2id = data["players"][1]["matchdetail"]["player_id"]

  Teact.useEffect(() => {
    const canvas = document.getElementById('pongCanvas')
    const context = canvas.getContext('2d')

    const paddleWidth = 10
    const paddleHeight = 100
    const ballSize = 10
    let paddle1Y = (canvas.height - paddleHeight) / 2
    let paddle2Y = (canvas.height - paddleHeight) / 2
    let ballX = canvas.width / 2
    let ballY = canvas.height / 2
    let ballSpeedX = 5
    let ballSpeedY = 5
    let paddle1Speed = 0
    let paddle2Speed = 0

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

    function movePaddle() {
      if (
        paddle1Y + paddle1Speed > 0 &&
        paddle1Y + paddleHeight + paddle1Speed < canvas.height
      ) {
        paddle1Y += paddle1Speed
      }
      if (
        paddle2Y + paddle2Speed > 0 &&
        paddle2Y + paddleHeight + paddle2Speed < canvas.height
      ) {
        paddle2Y += paddle2Speed
      }
    }

    function moveBall() {
      ballX += ballSpeedX
      ballY += ballSpeedY

      if (ballY + ballSize > canvas.height || ballY - ballSize < 0) {
        ballSpeedY = -ballSpeedY
      }

      if (
        ballX - ballSize < paddleWidth &&
        ballY > paddle1Y &&
        ballY < paddle1Y + paddleHeight
      ) {
        ballSpeedX = -ballSpeedX
      }
      if (
        ballX + ballSize > canvas.width - paddleWidth &&
        ballY >= paddle2Y &&
        ballY <= paddle2Y + paddleHeight
      ) {
        ballSpeedX = -ballSpeedX
      }

      if (ballX - ballSize < 0) {
        // response = fetch('127.0.0.1:8000/api/tournaments/local',{
        //   method: 'PATCH',
        //   body: JSON.stringify({
        //       "match_id": match_id,
        //       "player_id": player2id
        //   }),
        // })
        // const result = response.json(); 
        // score2 = result["players"][1]["matchdetail"]["score"]
        score2++;
        resetBall()
      } else if (ballX + ballSize > canvas.width) {
        // response = fetch('127.0.0.1:8000/api/tournaments/local',{
        //   method: 'PATCH',
        //   body: JSON.stringify({
        //       "match_id": match_id,
        //       "player_id": player1id
        //   }),
        // })
        // score1 = result["players"][0]["matchdetail"]["score"]
        score1++;
        resetBall()
      }
    }

    function resetBall() {
      ballX = canvas.width / 2
      ballY = canvas.height / 2
      ballSpeedX = -ballSpeedX
    }

    function draw() {
      drawRect(0, 0, canvas.width, canvas.height, '#1E1E2C')
      drawRect(0, paddle1Y, paddleWidth, paddleHeight, 'white')
      drawRect(
        canvas.width - paddleWidth,
        paddle2Y,
        paddleWidth,
        paddleHeight,
        'white',
      )
      if (score1 !== 10 && score2 !== 10) {
        drawBall(ballX, ballY, ballSize, '#FFD700')
      }
      // スコアを描画
      drawText(
        `${score1}`,
        canvas.width / 4,
        50,
        '48px sans-serif',
        score1 === 10 ? 'yellow' : 'white',
      )
      drawText(
        `${score2}`,
        (canvas.width / 4) * 3,
        50,
        '48px sans-serif',
        score2 === 10 ? 'yellow' : 'white',
      )
    }

    function update() {
      movePaddle()
      moveBall()
      draw()
      if (score1 === 10 || score2 === 10) {
        clearInterval(intervalId)
        drawText(
          `${score1 > score2 ? 'Player 1' : 'Player 2'} wins!`,
          canvas.width / 2,
          canvas.height / 2,
        )
      }
      setState(state => state + 1)
    }

    function keyDownHandler(e) {
      // 1P（W: 上、S: 下）と2P（↑: 上、↓: 下）のキー割り当て
      if (e.key === 'ArrowUp') {
        paddle2Speed = -6 // 2P（右側）
      } else if (e.key === 'ArrowDown') {
        paddle2Speed = 6 // 2P（右側）
      } else if (e.key === 'w' || e.key === 'W') {
        paddle1Speed = -6 // 1P（左側）
      } else if (e.key === 's' || e.key === 'S') {
        paddle1Speed = 6 // 1P（左側）
      }
    }

    function keyUpHandler(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        paddle2Speed = 0 // 2P（右側）
      } else if (
        e.key === 'w' ||
        e.key === 'W' ||
        e.key === 's' ||
        e.key === 'S'
      ) {
        paddle1Speed = 0 // 1P（左側）
      }
    }

    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)

    const intervalId = setInterval(update, 1000 / 60)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('keydown', keyDownHandler)
      document.removeEventListener('keyup', keyUpHandler)
    }
  }, [])

  return BaseLayout(Teact.createElement(
    'div',
    { id: 'pong', style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' } },
    Teact.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'center' } },
      Teact.createElement('div', { id: 'leftPlayer', style: { writingMode: 'vertical-rl', textAlign: 'center', fontSize: '32px', color: 'white', marginRight: '30px' } }, player1name),
      Teact.createElement(
        'div',
        { style: { position: 'relative', width: '600px', height: '400px', backgroundColor: '#1E1E2C' } },
        Teact.createElement('canvas', { id: 'pongCanvas', width: '600', height: '400' })
      ),
      Teact.createElement('div', { id: 'rightPlayer', style: { writingMode: 'vertical-rl', textAlign: 'center', fontSize: '32px', color: 'white', marginLeft: '30px' } }, player2name)
    ),
  ))
}


export { Pong }
