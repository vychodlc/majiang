// 定义常量
const allName = [
  'm1','m2','m3','m4','m5','m6','m7','m8','m9',
  's1','s2','s3','s4','s5','s6','s7','s8','s9',
  'p1','p2','p3','p4','p5','p6','p7','p8','p9',
  'z1','z2','z3','z4','z5','z6','z7'
]
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

// 发牌
let cardNums = [];
for(let i=0; i<136; i++) {
  cardNums.push(i)
}
cardNums.sort(() => {return (0.5-Math.random())});
let handCards = [];
let inputCard;
let outputCards = [];

handCards = [];
for(let i=0; i<13; i++) {
  handCards.push(cardNums.pop())
}
inputCard = cardNums.pop();

// 测试牌
//  7小对
handCards = [1,1,5,5,7,7,8,8,20,20,80,80,90]
inputCard = 90
//  正常
handCards = [1,2,3,10,11,47,120,120,120,10,10,10,51]
inputCard = 52
changeHand()
changeOutput()
input()

// 更新手牌
function changeHand() {
  let cards1 = document.getElementsByClassName('cards1')[0];
  cards1.innerHTML = '';
  handCards.sort((a,b)=>{return a-b})
  for(let i=0; i<handCards.length; i++) {
    let cardItem = document.createElement("div");
    cardItem.className = 'card';
    cardItem.style.backgroundImage = 'url("static/'+allCards[handCards[i]]+'.gif")';
    cardItem.setAttribute("onclick","output("+handCards[i]+")");
    cards1.appendChild(cardItem);
  }
}
// 更新牌堆
function changeOutput() {
  let output = document.getElementById('outputcards1');
  output.innerHTML = '';
  for(let i=0; i<outputCards.length; i++) {
    let cardItem = document.createElement("div");
    cardItem.className = 'card';
    cardItem.style.backgroundImage = 'url("static/'+allCards[outputCards[i]]+'.gif")';
    output.appendChild(cardItem);
  }
}
// 抓牌
function input() {
  let cards1 = document.getElementsByClassName('cards1')[0];
  let cardItem = document.createElement("div");
  cardItem.className = 'card inputCard';
  cardItem.style.backgroundImage = 'url("static/'+allCards[inputCard]+'.gif")'
  cardItem.setAttribute("onclick","output("+inputCard+")");
  cards1.appendChild(cardItem);
}
// 出牌
function output(num) {
  // let hand = handCards.concat(inputCard);
  // let output_card = hand.splice(hand.indexOf(num),1);
  // handCards = hand.sort((a, b)=>{return a - b});
  // outputCards.push(output_card);
  // changeHand();
  // changeOutput();

  // inputCard = parseInt(Math.random()*120)
  // input()
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