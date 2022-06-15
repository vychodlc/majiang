const args = process.argv.slice(2)
const name = args[0]

const WebSocket = require('ws');

const ws = new WebSocket(`ws://localhost:8080?name=${name}`);

ws.on('open', function open() {
  ws.send('Hi Server');
});

ws.on('message', function incoming(data) {
  console.log(data);
});