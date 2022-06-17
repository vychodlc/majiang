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

let handCards = [1,3,4,10,12,22,23,24,90,91,92,93,94];
let inputCard = 102;
let outputCards = [103,7,2,87,28];
changeHand()
changeOutput()
input()

function changeHand() {
  let cards1 = document.getElementsByClassName('cards1')[0];
  cards1.innerHTML = '';
  for(let i=0; i<handCards.length; i++) {
    let cardItem = document.createElement("div");
    cardItem.className = 'card';
    cardItem.style.backgroundImage = 'url("static/'+allCards[handCards[i]]+'.gif")';
    cardItem.setAttribute("onclick","output("+handCards[i]+")");
    cards1.appendChild(cardItem);
  }
}

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

function input() {
  let cards1 = document.getElementsByClassName('cards1')[0];
  let cardItem = document.createElement("div");
  cardItem.className = 'card inputCard';
  cardItem.style.backgroundImage = 'url("static/'+allCards[inputCard]+'.gif")'
  cardItem.setAttribute("onclick","output("+inputCard+")");
  cards1.appendChild(cardItem);
}

function output(num) {
  let hand = handCards.concat(inputCard);
  let output_card = hand.splice(hand.indexOf(num),1);
  handCards = hand.sort((a, b)=>{return a - b});
  outputCards.push(output_card);
  changeHand();
  changeOutput();

  inputCard = parseInt(Math.random()*120)
  input()
}