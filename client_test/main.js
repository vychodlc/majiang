let url = window.location.search;
document.getElementById('username').value = url.slice(-1);

const allCards = [
  'm1','m1','m1','m1',
  'm2','m2','m2','m2',
  'm3','m3','m3','m3',
  'm4','m4','m4','m4',
  'm5','m5','m5','m5',
  'm6','m6','m6','m6',
  'm7','m7','m7','m7',
  'm8','m8','m8','m8',
  'm9','m9','m9','m9',
  's1','s1','s1','s1',
  's2','s2','s2','s2',
  's3','s3','s3','s3',
  's4','s4','s4','s4',
  's5','s5','s5','s5',
  's6','s6','s6','s6',
  's7','s7','s7','s7',
  's8','s8','s8','s8',
  's9','s9','s9','s9',
  'p1','p1','p1','p1',
  'p2','p2','p2','p2',
  'p3','p3','p3','p3',
  'p4','p4','p4','p4',
  'p5','p5','p5','p5',
  'p6','p6','p6','p6',
  'p7','p7','p7','p7',
  'p8','p8','p8','p8',
  'p9','p9','p9','p9',
  'z1','z1','z1','z1',
  'z2','z2','z2','z2',
  'z3','z3','z3','z3',
  'z4','z4','z4','z4',
  'z5','z5','z5','z5',
  'z6','z6','z6','z6',
  'z7','z7','z7','z7',
]

function inputFunc(num) {
  for(let j=0; j<playersDiv.length; j++) {
    if(playersDiv[j].getElementsByClassName('name')[0].innerText==selfPlayer) {
      playersDiv[j].getElementsByClassName('inputCard')[0].innerHTML = '';
      let cardItem = document.createElement("div");
      cardItem.className = 'card';
      cardItem.style.backgroundImage = 'url("static/'+allCards[num]+'.gif")';
      cardItem.setAttribute("onclick","outputFunc("+num+")");
      playersDiv[j].getElementsByClassName('inputCard')[0].appendChild(cardItem);
    }
  }
}

function changeHand() {
  for(let j=0; j<playersDiv.length; j++) {
    let player = playersDiv[j].getElementsByClassName('handCards')[0];
    player.innerHTML = '';
    for(let i=0; i<handCards.length; i++) {
      let cardItem = document.createElement("div");
      cardItem.className = 'card';
      if(playersDiv[j].getElementsByClassName('name')[0].innerText==selfPlayer) {
        cardItem.setAttribute("onclick","outputFunc("+handCards[i]+")");
        cardItem.style.backgroundImage = 'url("static/'+allCards[handCards[i]]+'.gif")';
      } else {
        cardItem.style.backgroundImage = 'url("static/pai.gif")';
      }
      player.appendChild(cardItem);
    }
  }
}

function changeOutput() {
  for(let j=0; j<playersDiv.length; j++) {
    let player = playersDiv[j].getElementsByClassName('outputCards')[0];
    let oneOutputCards = outputCards[j].outputCards;
    player.innerHTML = '';
    for(let i=0; i<oneOutputCards.length; i++) {
      let cardItem = document.createElement("div");
      cardItem.className = 'card';
      cardItem.style.backgroundImage = 'url("static/'+allCards[oneOutputCards[i]]+'.gif")';
      player.appendChild(cardItem);
    }
  }
}

function getUserIndex(name) {
  for(let i=0; i<players.length; i++) {
    if(players[i].name==name) {
      return i
    }
  }
}

function outputFunc(num) {
  if(selfPlayer==players[curPlayerIndex].name) {
    ws.send(JSON.stringify({
      name: selfPlayer,
      handCards: handCards.concat(inputCard),
      output: num
    }));
    playersDiv[curPlayerIndex].getElementsByClassName('inputCard')[0].innerHTML = '';
  }
}

function sendMsg(data) {
  ws.send(JSON.stringify(data));
}

function login() {
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  let roomid = document.getElementById('roomid').value;
  if(username!='') {
  // if(username!=''&&username==password&&roomid==1) {
    // var ws = new WebSocket(`ws://localhost:8082?name=${username}&room=${roomid}`);
    ws = new WebSocket(`ws://localhost:8082?name=${username}&room=1`);
    ws.onopen = function(e) {
      console.log('建立连接，状态:' + ws.readyState);
    };
    ws.onmessage = function(e) {
      // 登陆成功
      let msg = e.data;
      if(e.data=='游戏开始') {
        document.getElementsByClassName('login')[0].style.display = 'none';
        document.getElementsByClassName('table')[0].style.display = '';
      } else if(e.data.indexOf('你的名字')!=-1) {
        selfPlayer = e.data.slice(5);
        console.log('selfPlayer',selfPlayer);
      } else if(e.data.indexOf('所有玩家')!=-1) {
        players = JSON.parse(e.data.slice(5));
        for(let i=0; i<players.length; i++) {  
          for(let j=0; j<playersDiv.length; j++) {
            if(i==j) {
              playersDiv[i].getElementsByClassName('name')[0].innerHTML = players[i].name;
            }
          }
        }
      } else if(e.data.indexOf('当前手牌')!=-1) {
        handCards = e.data.split(':')[1].split(',').map(item=>{return parseInt(item)});
        changeHand();
      } else if(e.data.indexOf('当前牌堆')!=-1) {
        console.log(e.data);
        outputCards = JSON.parse(e.data.slice(5));
        changeOutput();
      } else if(e.data.indexOf('当前出牌')!=-1) {
        curPlayerIndex = e.data.split(':')[1];
      } else if(e.data.indexOf('你抓到了')!=-1) {
        inputCard = parseInt(e.data.split(':')[1])
        inputFunc(inputCard);
      }
    };
  } else {
    alert('登录失败')
  }
}

let ws;
let playersDiv = document.getElementsByClassName('player');
let players = [];
let scores = ['1223','2222','2231','2221'];
let selfPlayer = '';
let curPlayerIndex = '';
let inputCard;
let handCards = [];
let outputCards = [];
