import '@/scss/styles.scss'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/libs/teact'
import { useNavigate, useLocation } from '@/js/libs/router'
import { DefaultButton } from '@/js/components/ui/button'
import { api } from '@/js/infrastructures/api/fetch'

function fetchTournament() {
  const navigate = useNavigate()
  api
    .get('/api/tournaments/local/')
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => {
          throw new Error(errData.error || 'Unknown error occurred')
        })
      }
      return response.json()
    })
    .then(data => {
      console.log('Success:', data)
      navigate('/tournament', { data })
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

const Pong = () => {
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
  let score1 = data.players[0].match_details.score
  let score2 = data.players[1].match_details.score
  const player1Name = data.players[0].player.name
  const player2Name = data.players[1].player.name
  const player1Id = data.players[0].match_details.player_id
  const player2Id = data.players[1].match_details.player_id
  let winner = null

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
    let ballSpeedX = 0
    let ballSpeedY = 0
    let paddle1Speed = 0
    let paddle2Speed = 0
    let canStart = true

    const startButton = document.createElement('button')
    startButton.className = 'btn btn-primary btn-lg bg-darkblue'
    startButton.textContent = 'ボール発射'
    document.getElementById('utilButton').appendChild(startButton)
    startButton.addEventListener('click', startPong)



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

    function scoreGoal(playerId) {
      ballSpeedX = 0
      ballSpeedY = 0
      api
        .patch('/api/matches/local/score/', {
          match_id: matchId,
          player_id: playerId,
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.json() // レスポンスをJSONとしてパース
        })
        .then(data => {
          canStart = true
          if (playerId === player1Id) {
            score1 = data.players[0].match_details.score
          } else {
            score2 = data.players[1].match_details.score
          }
          if (data.match_end === true) {
            winner = score1 > score2 ? data.players[0] : data.players[1]
          }
          console.log('Success:', data) // サーバーからのレスポンスデータを処理
        })
        .catch(error => {
          console.error('Error:', error) // エラー処理
        })
      resetBall()
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
        scoreGoal(player2Id)
      } else if (ballX + ballSize > canvas.width) {
        scoreGoal(player1Id)
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
      if (winner === null) {
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
      if (winner !== null) {
        clearInterval(intervalId)
        drawText(
          `${winner.player.name} wins!`,
          canvas.width / 2,
          canvas.height / 2,
        )
      }
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

    function startPong(e) {
      if (canStart === true) {
        ballSpeedX = 5
        ballSpeedY = 5
        canStart = false
      }
    }

    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)
    // document.addEventListener('click', startPong)

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
                width: '600px',
                height: '400px',
                backgroundColor: '#1E1E2C',
              },
            },
            Teact.createElement('canvas', {
              id: 'pongCanvas',
              width: '600',
              height: '400',
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
        { className: 'd-grid gap-2 col-3 mx-auto' },
        DefaultButton({
          text: '対戦へ',
          onClick: () => fetchTournament(),
        }),
      ),
    ),
  )
}

export { Pong }
