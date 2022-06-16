const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let players = [];
let curPlayer = 0;
let curCard = 0;

const allCards = [];
const cardCount = 136;
for(let i=0; i<cardCount; i++) {
  allCards.push(i+1)
}
allCards.sort(function() {
  return (0.5-Math.random());
});

function parseURL(url) {
  url = url.slice(2)
  let params = url.split('&');
  let dict = {};
  let param;
  for(let i=0; i<params.length; i++) {
    param = params[i].split('=');
    dict[param[0]] = param[1];
  }
  return dict;
}

wss.broadcast = function broadcast(flag,user,msg='') {
  wss.clients.forEach(function each(client) {
    if(flag == 0){
      let flagExist = false;
      for(let i=0; i<players.length; i++) {
        if(players[i].name==user.name) {
          flagExist=true;
          user.online = 1;
        }
      }
      if(!flagExist) {
        user.handCards = [];
        user.outputCards = [];
        user.inputCard = 0;
        user.online = 1;
        players.push(user);
      }
      client.send(user.name + "加入麻将室大厅");
    }
    if(flag == 1){
      client.send(user.name + ":" + user.msg);	
    }
    if(flag == 2){
      client.send(user.name + "退出麻将室大厅");
    }
    if(flag == 3){
      client.send(msg);
    }
  });
};
wss.on('connection', function connection(client, req) {
  let query = parseURL(req.url);
  client.userId = query.name;
  wss.broadcast(0,query);
  client.on('message', function incoming(data) {
    if(data=='start') {
      startGame()
    } else if(data.indexOf('card')!=-1) {
      let card = parseInt(data.slice(4));
      wss.broadcast(3,query.name+"出了一张"+card);
      /* 
       判断 吃、碰、杠、胡
      */
      let index = getUserIndex(user);
      players[index].outputCards.push(card);
      let cardIndex = getCardIndex(players[index].handCards,card);
      players[index].handCards.splice(cardIndex,1);
      players[index].handCards.sort(sequence);
    } else {
      query.msg = data;
      wss.broadcast(1,query);
    }
  });
  client.on('close', function incoming(msg) {
    wss.broadcast(2,query);
    for(let i=0; i<players.length; i++) {
      if(players[i].name==query.name) players[i].online = 0
    }
  });
});

function getUserIndex(user) {
  for(let i=0; i<players.length; i++) {
    if(players[i].name==user) {
      return i
    }
  }
}

function getCardIndex(cards,card) {
  for(let i=0; i<cards.length; i++) {
    if(players[i].name==user) {
      return i
    }
  }
}

function sequence(a,b){
  return a - b;
}

function startGame() {
  wss.clients.forEach(function each(client) {
    client.send('游戏开始');
    let user = client.userId;
    let index = getUserIndex(user);
    if(players[index].name==user) {
      for(let i=0; i<13; i++) {
        players[index].handCards.push(allCards.pop())
      }
    }
    players[index].handCards.sort(sequence);
    client.send('你当前的手牌是:'+players[index].handCards+'\n当前正在出牌的玩家是:'+players[curPlayer].name);
    if(index==curPlayer) {
      curCard = allCards.pop();
      players[curPlayer].handCards.push(curCard);
      client.send('你当前抓到的牌是:'+curCard)
    }
  })
}