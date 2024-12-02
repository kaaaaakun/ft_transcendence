const service = module.exports = {};

/**
 * 
 * @param {object} ws WebSocket connection.
 */
service.onMatchStatus = async (ws) => {
  // ランダムなボールとパドルの位置
  const ballPositions = [
    { x: 0.2, y: 0.3 },
    { x: 0.5, y: 0.5 },
    { x: 0.8, y: 0.7 },
  ];
  const paddlePositions = [0.3, 0.5, 0.7];

  // ランダムな match status の生成
  const generateRandomMatchStatus = () => ({
    left: {
      paddlePosition: paddlePositions[Math.floor(Math.random() * paddlePositions.length)],
      score: Math.floor(Math.random() * 10), // Random score for demonstration
    },
    right: {
      paddlePosition: paddlePositions[Math.floor(Math.random() * paddlePositions.length)],
      score: Math.floor(Math.random() * 10),
    },
    ballPosition: ballPositions[Math.floor(Math.random() * ballPositions.length)],
  });

  // 定期的に送信されるように
  const intervalId = setInterval(() => {
    const matchStatus = generateRandomMatchStatus();

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
    ws.send('入力を受け付けました。');
  } catch (error) {
    console.error("Error handling key input:", error.message);
  }
};

