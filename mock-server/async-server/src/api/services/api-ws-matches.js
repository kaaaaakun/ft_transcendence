const service = module.exports = {};

/**
 * 
 * @param {object} ws WebSocket connection.
 */
service.onMatchStatus = async (ws) => {
  // Define possible positions for the ball and paddles
  const ballPositions = [
    { x: 0.2, y: 0.3 },
    { x: 0.5, y: 0.5 },
    { x: 0.8, y: 0.7 },
  ];

  const paddlePositions = [0.3, 0.5, 0.7];

  // Function to generate a random match status
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

  // Interval function to send match status every 5 seconds
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
 * Handle key input messages sent from the client.
 * @param {object} ws WebSocket connection.
 * @param {object} options
 * @param {string} options.path The path in which the message was received.
 * @param {object} options.query The query parameters used when connecting to the server.
 * @param {object} options.message The received message.
 * @param {object} options.message.payload The payload containing key input data.
 * @param {object} options.message.payload.left Data for the left paddle.
 * @param {boolean} options.message.payload.left.isUp Whether the left paddle is moving up.
 * @param {object} options.message.payload.right Data for the right paddle.
 * @param {boolean} options.message.payload.right.isUp Whether the right paddle is moving up.
 */
 service.sendKeyInput = async (ws, { message, path, query }) => {
  try {
    // Ensure message.payload exists before destructuring
    const { left, right } = message.payload || {}; // fallback to empty object if payload is undefined

    if (typeof left?.isUp !== "boolean" || typeof right?.isUp !== "boolean") {
      throw new Error("Invalid input format: 'isUp' must be a boolean.");
    }

    // Example logic for reacting to key inputs
    const updatedPaddlePositions = {
      leftPaddlePosition: left.isUp ? 0.6 : 0.4, // Adjust position based on input
      rightPaddlePosition: right.isUp ? 0.6 : 0.4,
    };

    // Notify the client about the new paddle positions
    ws.send(JSON.stringify({
      type: 'PaddleUpdate',
      payload: updatedPaddlePositions,
    }));

    console.log(`Received input: ${JSON.stringify(message.payload)}`);

  } catch (error) {
    console.error("Error handling key input:", error.message);
  }
};

