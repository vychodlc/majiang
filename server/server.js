const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let clients = []

wss.broadcast = function broadcast(flag,user) {
  wss.clients.forEach(function each(client) {
    if(flag == 0){
      client.send(user.name + "加入麻将室大厅");
    }
    if(flag == 1){
      client.send(user.name + ":" + user.msg);	
    }
    if(flag == 2){
      client.send(user.name + "退出麻将室大厅");	
    }
  });
};
wss.on('connection', function connection(client, req) {
  let user = {name:req.url.slice(7)};
  wss.broadcast(0,user);
  client.on('message', function incoming(data) {
    user.msg = data;
    wss.broadcast(1,user);
  });
  client.on('close', function incoming(msg) {
    wss.broadcast(2,user);
  });
});