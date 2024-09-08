import { Teact } from '@/js/teact';

function App() {
  const [score, setScore] = Teact.useState({ player1: 0, player2: 0 });

  // `useCallback` を使って `setCanvasRef` をメモ化
  const setCanvasRef = Teact.useCallback((canvas) => {
    if (canvas !== null) {
      const context = canvas.getContext('2d');

      const paddleWidth = 10, paddleHeight = 100, ballSize = 10;
      let paddle1Y = (canvas.height - paddleHeight) / 2;
      let paddle2Y = (canvas.height - paddleHeight) / 2;
      let ballX = canvas.width / 2;
      let ballY = canvas.height / 2;
      let ballSpeedX = 5, ballSpeedY = 5;
      let paddle1Speed = 0, paddle2Speed = 5;

      function drawRect(x, y, width, height, color) {
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
      }

      function drawBall(x, y, size, color) {
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2, true);
        context.fill();
      }

      function movePaddle() {
        if (paddle1Y + paddle1Speed > 0 && paddle1Y + paddleHeight + paddle1Speed < canvas.height) {
          paddle1Y += paddle1Speed;
        }
        if (paddle2Y + ballSpeedY > 0 && paddle2Y + paddleHeight + ballSpeedY < canvas.height) {
          paddle2Y += ballSpeedY;
        }
      }

      function moveBall() {
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        if (ballY + ballSize > canvas.height || ballY - ballSize < 0) {
          ballSpeedY = -ballSpeedY;
        }

        if (ballX - ballSize < paddleWidth && ballY > paddle1Y && ballY < paddle1Y + paddleHeight) {
          ballSpeedX = -ballSpeedX;
        } else if (ballX + ballSize > canvas.width - paddleWidth && ballY > paddle2Y && ballY < paddle2Y + paddleHeight) {
          ballSpeedX = -ballSpeedX;
        }

        if (ballX - ballSize < 0) {
          setScore(score => {
            const newScore = { ...score, player2: score.player2 + 1 };
            return newScore;
          });
          resetBall();
        } else if (ballX + ballSize > canvas.width) {
          setScore(score => {
            const newScore = { ...score, player1: score.player1 + 1 };
            return newScore;
          });
          resetBall();
        }
      }

      function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX;
      }

      function draw() {
        drawRect(0, 0, canvas.width, canvas.height, '#1E1E2C');
        drawRect(0, paddle1Y, paddleWidth, paddleHeight, 'white');
        drawRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight, 'white');
        drawBall(ballX, ballY, ballSize, '#FFD700');
      }

      function update() {
        movePaddle();
        moveBall();
        draw();
      }

      const intervalId = setInterval(update, 1000 / 60);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, []); // 空の依存配列で、最初のレンダリング時のみ `setCanvasRef` が生成される

  return Teact.createElement(
    'div',
    null,
    Teact.createElement(
      'div',
      {
        id: 'scoreBoard',
        className: 'pt-0',
        style: { textAlign: 'center', color: 'white', fontSize: '72px' }
      },
      `${score.player1} : ${score.player2}`
    ),
    Teact.createElement(
      'div',
      {
        id: 'gameContainer',
        style: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
      },
      Teact.createElement(
        'div',
        {
          id: 'leftPlayer',
          style: { writingMode: 'vertical-rl', textAlign: 'center', fontSize: '32px', color: 'white', marginRight: '30px' }
        },
        'A'  // 左プレイヤー名
      ),
      Teact.createElement(
        'div',
        {
          style: { position: 'relative', width: '600px', height: '400px', backgroundColor: '#1E1E2C' }
        },
        Teact.createElement('canvas', { id: 'pongCanvas', ref: setCanvasRef, width: 600, height: 400 }) // callback ref を利用
      ),
      Teact.createElement(
        'div',
        {
          id: 'rightPlayer',
          style: { writingMode: 'vertical-rl', textAlign: 'center', fontSize: '32px', color: 'white', marginLeft: '30px' }
        },
        'D'  // 右プレイヤー名
      )
    )
  );
}

const element = Teact.createElement(App);
const container = document.getElementById('app');
Teact.render(element, container);
