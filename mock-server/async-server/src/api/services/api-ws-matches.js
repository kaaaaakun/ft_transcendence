const service = module.exports = {};

/**
 * 
 * @param {object} ws WebSocket connection.
 */
service.onMatchStatus = async (ws) => {
  ws.send('Message from the server: Implement here your business logic that sends messages to a client after it connects.');
};
/**
 * 
 * @param {object} ws WebSocket connection.
 * @param {object} options
 * @param {string} options.path The path in which the message was received.
 * @param {object} options.query The query parameters used when connecting to the server.
 * @param {object} options.message The received message.
 * @param {object} options.message.payload.left
 * @param {boolean} options.message.payload.left.isUp
 * @param {object} options.message.payload.right
 * @param {boolean} options.message.payload.right.isUp
 */
service.sendKeyInput = async (ws, { message, path, query }) => {
  ws.send('Message from the server: Implement here your business logic that reacts on messages sent from a client.');
};
