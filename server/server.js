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
      console.log(players[userIndex].handCards.concat(json.output).sort((a,b)=>{return a-b}));
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
        client.send('你抓到了:'+curCard);
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
      wss.broadcast(3,query,{user:client.userId,output:outputcard});
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
    client.send('所有玩家:'+JSON.stringify(players));
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
      client.send('你抓到了:'+curCard);
    }
  })
}


// 判断胡牌
function checkHu(cards) {
  cards.sort((a,b)=>{return a-b})
  let typeList = [[],[],[],[]]
  let nameCards = cards.map(card=>{
    let fourIndex = parseInt(card/4)
    let cardName = allName[fourIndex]
    let typeIndex = parseInt(parseInt(card/4)/9)
    typeList[typeIndex].push(fourIndex)
    return fourIndex
  })
  // 七小对 胡法判断
  if (nameCards[0]==nameCards[1]&&nameCards[2]==nameCards[3]&&nameCards[4]==nameCards[5]&&nameCards[6]==nameCards[7]&&nameCards[8]==nameCards[9]&&nameCards[10]==nameCards[11]&&nameCards[12]==nameCards[13]) {
    return true;
  }
  // 3*n+2 胡法判断
  let huList = [false,false,false,false]
  for(let i=0; i<4; i++) {
    let alist = formatCard(typeList[i]).join('');
    if(alist.length==0) {
      huList[i] = true
    } else if(alist.length%3==0) {
      huList[i] = judge3(alist)
    } else if(alist.length%3==1) {
      return false
    } else if(alist.length%3==2) {
      huList[i] = judge5(alist)
    }
  }
  return huList.indexOf(false)==-1
}
// 将345格式化成123, 将223格式化成112
function formatCard(item) {
  let index=1;
  let alist = [];
  for(let i=0; i<item.length; i++) {
    if(i==0) {
      alist.push(index);
    } else {
      if(item[i]==item[i-1]) {
        alist.push(index)
      } else if(item[i]-1==item[i-1]) {
        index = index + 1;
        alist.push(index)
      } else {
        index = index + 2;
        alist.push(index)
      }
    }
  }
  return alist;
}
// 判断 3*n 情形
function judge3(cards) {
  cards = formatCard(cards).join('')
  if(cards.length==0) {
    return true;
  } else if(cards.slice(0,3)=='111') {
    if(cards.slice(3).length!=0) {
      return judge3(cards.slice(3))
    } else {
      return true;
    }
  } else if(cards.slice(0,3)=='123'){
    if(cards.slice(3).length!=0) {
      return judge3(cards.slice(3))
    } else {
      return true;
    }
  } else if(cards.indexOf(1)!=-1&&cards.indexOf(2)!=-1&&cards.indexOf(3)!=-1){
    cards = cards.replace('1','').replace('2','').replace('3','')
    if(cards.length!=0) {
      return judge3(cards)
    } else {
      return true;
    }
  } else {
    return false;
  }
}
// 判断 3*n + 2 情形
function judge5(cards) {
  let countList = getNumCount(cards);
  for(let i=0; i<countList.length; i++) {
    if(countList[i]>=2) {
      if(judge3(cards.replace((i+1).toString(),'').replace((i+1).toString(),''))) return true
    }
  }
  return false
}
// 12222334 -> [1,4,2,1,0,...,0] 统计数字出现次数
function getNumCount(num) {
  let numCount = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  let numList = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
  for(let i=0; i<num.length; i++) {
    numCount[numList.indexOf(parseInt(num[i]))]++
  }
  return numCount;
}