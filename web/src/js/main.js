import '@/scss/styles.scss';
import { BaseLayout } from '@/js/layouts/BaseLayout';
import { Teact } from '@/js/teact';

function App() {
  const [state, setState] = Teact.useState(0);
  const [score, setScore] = Teact.useState({ player1: 0, player2: 0 });

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

    const scoreBoard = document.createElement('div');
    scoreBoard.className = 'score-board'; // クラス名を設定
    scoreBoard.style.textAlign = 'center';
    scoreBoard.style.color = 'white';
    scoreBoard.style.fontSize = '72px';
    scoreBoard.style.position = 'absolute';
    scoreBoard.style.top = '250px';
    scoreBoard.style.left = '50%';
    scoreBoard.style.zIndex = '1';
    scoreBoard.style.transform = 'translateX(-50%)';
    scoreBoard.textContent = `${score.player1} : ${score.player2}`;

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
    document.getElementById('pong').appendChild(scoreBoard);
    document.getElementById('pong').appendChild(gameContainer);

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
        setScore(score => ({ ...score, player2: score.player2 + 1 }));
        scoreBoard.textContent = `${score.player1} : ${score.player2}`;
        resetBall();
      } else if (ballX + ballSize > canvas.width) {
        setScore(score => ({ ...score, player1: score.player1 + 1 }));
        scoreBoard.textContent = `${score.player1} : ${score.player2}`;
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
      setState(state => state + 1);
    }

    function keyDownHandler(e) {
      if (e.key === 'ArrowUp') {
        paddle1Speed = -6;
      } else if (e.key === 'ArrowDown') {
        paddle1Speed = 6;
      }
    }

    function keyUpHandler(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        paddle1Speed = 0;
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

const element = Teact.createElement(App);
const container = document.getElementById('app');
Teact.render(element, container);
