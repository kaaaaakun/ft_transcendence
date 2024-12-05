const service = module.exports = {};

/**
 * 
 * @param {object} ws WebSocket connection.
 */
service.onMatchStatus = async (ws) => {
  // ランダムなボールとパドルの位置
  const ballPositions = [
    { x: 330, y: 220 },
    { x: 340, y: 270 },
    { x: 100, y: 130 },
    { x: 440, y: 20 },
    { x: 40, y: 200 },
    { x: 240, y: 30 },
    { x: 200, y: 100 },
  ];
  const paddlePositions = [30, 50, 270];

  let time = 0
  let leftScore = 0
  let rightScore = 0

  // ランダムな match status の生成
  const generateRandomMatchStatus = () => ({
    left: {
      paddlePosition: paddlePositions[Math.floor(Math.random() * paddlePositions.length)],
      score: leftScore,
    },
    right: {
      paddlePosition: paddlePositions[Math.floor(Math.random() * paddlePositions.length)],
      score: rightScore,
    },
    ballPosition: ballPositions[Math.floor(Math.random() * ballPositions.length)],
  });

  // 定期的に送信されるように
  const intervalId = setInterval(() => {
    const matchStatus = generateRandomMatchStatus();
      if (time % 10000) {
        if (leftScore % 2 == 0)
            rightScore++
        leftScore++
      }
      time++

    ws.send(JSON.stringify(matchStatus));
  }, 500);

  // Clean up the interval if the WebSocket closes
  ws.on('close', () => {
    clearInterval(intervalId);
  });
};

/**
 *
 * @param {object} ws WebSocket connection.
 * @param {object} options
 * @param {string} options.path The path in which the message was received.
 * @param {object} options.query The query parameters used when connecting to the server.
 * @param {object} options.message The received message.
 * @param {object} options.message.payload.left
 * @param {string} options.message.payload.left.key
 * @param {string} options.message.payload.left.action
 * @param {object} options.message.payload.right
 * @param {string} options.message.payload.right.key
 * @param {string} options.message.payload.right.action
 */
 service.sendKeyInput = async (ws, { message, path, query }) => {
  try {
  } catch (error) {
    console.error("Error handling key input:", error.message);
  }
};

