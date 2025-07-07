const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 3002, path: '/api/ws/room.SIMPLE.123' });

wss.on('connection', ws => {
  // start
  setTimeout(() => {
    ws.send(JSON.stringify({ type: 'start', players: { left: 'Alice', right: 'Bob' } }));
  }, 1000);

  // update (60fps)
  const iv = setInterval(() => {
    ws.send(JSON.stringify({
      type: 'update',
      left:  { paddlePosition: Math.random() * 300, score: 0 },
      right: { paddlePosition: Math.random() * 300, score: 0 },
      ballPosition: { x: Math.random() * 500, y: Math.random() * 300 }
    }));
  }, 1000/300);

  // end after 10s
  setTimeout(() => {
    clearInterval(iv);
    ws.send(JSON.stringify({
      type: 'end',
      left:  { paddlePosition: 0, score: 3 },
      right: { paddlePosition: 0, score: 5 },
      ballPosition: { x: 400, y: 250 },
      winner: 'Bob',
      redirectUrl: '/'
    }));
    ws.close();
  }, 5000);
});
