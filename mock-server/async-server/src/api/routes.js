const util = require('util');
const { Router } = require('express');
const { pathParser } = require('../lib/path');
const { yellow } = require('../lib/colors');
const { onMatchStatus, sendKeyInput } = require('./services/api-ws-matches');
const router = Router();
module.exports = router;
router.ws('/api/ws/matches', async (ws, req) => {
  const path = pathParser(req.path);
  console.log(`${yellow(path)} client connected.`);
  await onMatchStatus(ws);
  ws.on('message', async (msg) => {
    console.log(`${yellow(path)} message was received:`);
    console.log(util.inspect(msg, { depth: null, colors: true }));
    await sendKeyInput(ws, { message: msg, path, query: req.query });
  });
});
