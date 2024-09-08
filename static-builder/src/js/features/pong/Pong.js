import '@/scss/styles.scss';
import { BaseLayout } from '@/js/layouts/BaseLayout';
import { Teact } from '@/js/teact';

function Pong() {
  const [state, setState] = Teact.useState(0);
  let score1 = 0;
  let score2 = 0;

  const startGame = () => {
    const gameContainer = document.createElement('div');
    gameContainer.id = 'gameContainer';
    gameContainer.style.display = 'flex';
    gameContainer.style.justifyContent = 'center';
    gameContainer.style.alignItems = 'center';

    const leftPlayer = document.createElement('div');
    leftPlayer.id = 'leftPlayer';
    leftPlayer.style.writingMode = 'vertical-rl';
    leftPlayer.style.textAlign = 'center';
    leftPlayer.style.fontSize = '32px';
    leftPlayer.style.color = 'white';
    leftPlayer.style.marginRight = '30px';
    leftPlayer.textContent = 'A';

    const rightPlayer = document.createElement('div');
    rightPlayer.id = 'rightPlayer';
    rightPlayer.style.writingMode = 'vertical-rl';
    rightPlayer.style.textAlign = 'center';
    rightPlayer.style.fontSize = '32px';
    rightPlayer.style.color = 'white';
    rightPlayer.style.marginLeft = '30px';
    rightPlayer.textContent = 'D';

    const canvasContainer = document.createElement('div');
    canvasContainer.style.position = 'relative';
    canvasContainer.style.width = '600px';
    canvasContainer.style.height = '400px';
    canvasContainer.style.backgroundColor = '#1E1E2C';

    const canvas = document.createElement('canvas');
    canvas.id = 'pongCanvas';
    canvas.width = 600;
    canvas.height = 400;

    canvasContainer.appendChild(canvas);
    gameContainer.appendChild(leftPlayer);
    gameContainer.appendChild(canvasContainer);
    gameContainer.appendChild(rightPlayer);
    document.getElementById('pong').appendChild(gameContainer);

    const context = canvas.getContext('2d');

    const paddleWidth = 10, paddleHeight = 100, ballSize = 10;
    let paddle1Y = (canvas.height - paddleHeight) / 2;
    let paddle2Y = (canvas.height - paddleHeight) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 5, ballSpeedY = 5;
    let paddle1Speed = 0, paddle2Speed = 0;

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

    function drawText(text, x, y, font = '48px sans-serif', color = 'white') {
      context.font = font;
      context.fillStyle = color;
      context.textAlign = 'center';
      context.fillText(text, x, y);
    }

    function movePaddle() {
      if (paddle1Y + paddle1Speed > 0 && paddle1Y + paddleHeight + paddle1Speed < canvas.height) {
        paddle1Y += paddle1Speed;
      }
      if (paddle2Y + paddle2Speed > 0 && paddle2Y + paddleHeight + paddle2Speed < canvas.height) {
        paddle2Y += paddle2Speed;
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
      }
      if (ballX + ballSize > canvas.width - paddleWidth && ballY >= paddle2Y && ballY <= paddle2Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        console.log('hit');
      }
      
      if (ballX - ballSize < 0) {
        score2++;
        resetBall();
      } else if (ballX + ballSize > canvas.width) {
        score1++;
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
      if (score1 === 10 || score2 === 10) {}else {
        drawBall(ballX, ballY, ballSize, '#FFD700');
      }
      // スコアを描画
      drawText(`${score1}`, canvas.width / 4, 50, '48px sans-serif', score1 === 10 ? 'yellow' : 'white');
      drawText(`${score2}`, (canvas.width / 4) * 3, 50, '48px sans-serif', score2 === 10 ? 'yellow' : 'white');
    }

    function update() {
      movePaddle();
      moveBall();
      draw();
      if (score1 === 10 || score2 === 10) {
        clearInterval(intervalId);
        drawText(`${score1 > score2 ? 'Player 1' : 'Player 2'} wins!`, canvas.width / 2, canvas.height / 2);
      }
      setState(state => state + 1);
    }

    function keyDownHandler(e) {
      // 1P（W: 上、S: 下）と2P（↑: 上、↓: 下）のキー割り当て
      if (e.key === 'ArrowUp') {
        paddle2Speed = -6;  // 2P（右側）
      } else if (e.key === 'ArrowDown') {
        paddle2Speed = 6;   // 2P（右側）
      } else if (e.key === 'w' || e.key === 'W') {
        paddle1Speed = -6;  // 1P（左側）
      } else if (e.key === 's' || e.key === 'S') {
        paddle1Speed = 6;   // 1P（左側）
      }
    }

    function keyUpHandler(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        paddle2Speed = 0;  // 2P（右側）
      } else if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
        paddle1Speed = 0;  // 1P（左側）
      }
    }

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    const intervalId = setInterval(update, 1000 / 60);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      gameContainer.remove();
    };
  };

  if (state === 0) {
    startGame();
  }

  return BaseLayout();
}

export {Pong};
