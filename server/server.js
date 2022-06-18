const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8082 });

let players = [];
let curPlayer = 0;
let curCard = 0;

const allCards = [];
const cardCount = 136;
for(let i=0; i<cardCount; i++) {
  allCards.push(i)
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

wss.broadcast = function broadcast(flag,user,json='') {
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
        client.send(user.name + "加入麻将室大厅");
        if(players.length==4) {
          setTimeout(() => {
            startGame()
          }, 2000);
        }
      }
    }
    if(flag == 1){
      client.send(user.name + ":" + user.msg);	
    }
    if(flag == 2){
      client.send(user.name + "退出麻将室大厅");
    }
    if(flag == 3){
      let userIndex = getUserIndex(client.userId)
      client.send('当前手牌:'+players[userIndex].handCards);  
      let fourOutputCards = [];
      players.map(player => {
        fourOutputCards.push({
          name: player.name,
          outputCards: player.outputCards
        })
      })
      client.send('当前牌堆:'+JSON.stringify(fourOutputCards));
      client.send('当前出牌:'+curPlayer);
      if(userIndex==curPlayer) {
        curCard = allCards.pop();
        players[curPlayer].handCards.push(curCard);
        client.send('你抓到了:'+curCard)
      }
    }
  });
};
wss.on('connection', function connection(client, req) {
  let query = parseURL(req.url);
  console.log(query);
  client.userId = query.name;
  client.roomId = query.room;
  if(players.length==4) {
    client.send("本房间已经满员");
  } else {
    wss.broadcast(0,query);
    client.send('你的名字:'+query.name);
  }
  client.on('message', function incoming(data) {
    if(data=='start') {
      startGame()
    } else if(data.indexOf('output')!=-1) {
      let parseData = JSON.parse(data);
      let cardIndex = getCardIndex(parseData.handCards,parseData.output);
      let userIndex = getUserIndex(parseData.name);
      let outputcard = players[userIndex].handCards.splice(cardIndex,1)[0];
      players[userIndex].outputCards.push(outputcard);
      players[userIndex].handCards.sort(sequence);
      curPlayer = (curPlayer + 1)%4;
      wss.broadcast(3,query);
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
    if(cards[i]==card) {
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
    client.send('所有玩家:'+JSON.stringify(players))
    let user = client.userId;
    let index = getUserIndex(user);
    if(players[index].name==user) {
      for(let i=0; i<13; i++) {
        players[index].handCards.push(allCards.pop())
      }
    }
    players[index].handCards.sort(sequence);
    client.send('当前手牌:'+players[index].handCards);
    let fourOutputCards = [];
    players.map(player => {
      fourOutputCards.push({
        name: player.name,
        outputCards: player.outputCards
      })
    })
    client.send('当前牌堆:'+JSON.stringify(fourOutputCards));
    client.send('当前出牌:'+curPlayer);
    if(index==curPlayer) {
      curCard = allCards.pop();
      players[curPlayer].handCards.push(curCard);
      client.send('你抓到了:'+curCard)
    }
  })
}