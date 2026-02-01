// ===============================
// 24場名
// ===============================
const stadiums = [
  "桐生","戸田","江戸川","平和島",
  "多摩川","浜名湖","蒲郡","常滑",
  "津","三国","びわこ","住之江",
  "尼崎","鳴門","丸亀","児島",
  "宮島","徳山","下関","若松",
  "芦屋","福岡","唐津","大村"
];

// ===============================
// コース色固定
// ===============================
const courseColors = ["#ffffff","#000000","#ff0000","#0000ff","#ffff00","#00ff00"];

// ===============================
// 初期表示
// ===============================
const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");

stadiums.forEach((name,i)=>{
  const div = document.createElement("div");
  div.className = "stadium";
  div.textContent = name;
  div.onclick = () => selectStadium(i);
  stadiumGrid.appendChild(div);
});

for(let i=1;i<=12;i++){
  const div = document.createElement("div");
  div.className = "race";
  div.textContent = i + "R";
  div.onclick = () => selectRace(i);
  raceGrid.appendChild(div);
}

document.getElementById("backBtn").onclick = () => {
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("stadiumScreen").classList.remove("hidden");
};

// ===============================
// 画面遷移
// ===============================
let currentStadiumIndex = 0;

function selectStadium(i){
  currentStadiumIndex = i;
  document.getElementById("stadiumScreen").classList.add("hidden");
  document.getElementById("raceScreen").classList.remove("hidden");
  document.getElementById("raceTitle").textContent = stadiums[i];
}

function selectRace(){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  calcAllWithTrend(currentStadiumIndex);
}

// ===============================
// 過去傾向データ
// ===============================
const pastTrend = [
  [60,50,45,40,35,30],[55,50,50,45,40,35],[50,45,50,40,35,30],[60,55,50,45,40,35],
  [55,50,45,40,35,30],[50,45,40,35,30,25],[60,55,50,45,40,35],[55,50,45,40,35,30],
  [50,45,40,35,30,25],[60,55,50,45,40,35],[55,50,45,40,35,30],[50,45,40,35,30,25],
  [60,55,50,45,40,35],[55,50,45,40,35,30],[50,45,40,35,30,25],[60,55,50,45,40,35],
  [55,50,45,40,35,30],[50,45,40,35,30,25],[60,55,50,45,40,35],[55,50,45,40,35,30],
  [50,45,40,35,30,25],[60,55,50,45,40,35],[55,50,45,40,35,30],[50,45,40,35,30,25]
];

// ===============================
// メイン計算
// ===============================
function calcAllWithTrend(stadiumIndex){

  let base=[], predict=[], ai=[];
  const trend = pastTrend[stadiumIndex];

  for(let i=0;i<6;i++){

    const courseBias = [18,6,2,-3,-8,-12][i];

    let b = Math.round(45 + Math.random()*30 + courseBias);
    let p = Math.round(trend[i] + Math.random()*12 - 6);

    b = Math.max(1,Math.min(100,b));
    p = Math.max(1,Math.min(100,p));

    let a = Math.round(b*0.45 + p*0.35 + trend[i]*0.2);
    a = Math.max(1,Math.min(100,a));

    base.push(b);
    predict.push(p);
    ai.push(a);
  }

  updateExpectationBars(base,predict,ai);
  updateKimarite(base);
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);
  updateTrustMeter(ai);
}
// ===============================
// 総合期待度バー（3本バー＋ラベル付き）
function updateExpectationBars(base,predict,ai){

  const labels = ["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{

    const barBox = row.querySelector(".expectation-bar");
    barBox.innerHTML = "";

    [base[i],predict[i],ai[i]].forEach((val,j)=>{

      const container = document.createElement("div");
      container.style.display="flex";
      container.style.alignItems="center";
      container.style.marginBottom="2px";

      const label = document.createElement("span");
      label.textContent = labels[j];
      label.style.width="40px";
      label.style.fontSize="12px";
      label.style.marginRight="4px";
      container.appendChild(label);

      const outer = document.createElement("div");
      outer.style.flex="1";
      outer.style.height="14px";
      outer.style.border="1px solid #333";
      outer.style.borderRadius="4px";
      outer.style.background="#ddd";
      outer.style.position="relative";

      const bar = document.createElement("div");
      bar.style.height="100%";
      bar.style.width = val + "%";
      bar.style.background = courseColors[i];

      outer.appendChild(bar);
      container.appendChild(outer);
      barBox.appendChild(container);
    });

    row.querySelector(".expectation-value").textContent = ai[i] + "%";
  });
}

// ===============================
// 決まり手
function updateKimarite(base){

  const rows = document.querySelectorAll(".kimarite-row");

  rows.forEach((row,i)=>{

    const baseVal = base[i] || 0;

    let v = Math.round(baseVal * 0.85 + Math.random()*10);

    v = Math.max(1,Math.min(100,v));

    const bar = row.querySelector(".bar div");
    const value = row.querySelector(".value");

    if(bar) bar.style.width = v + "%";
    if(value) value.textContent = v + "%";
  });
}

// ===============================
// 展開タイプ
function updateRaceTypeByAI(ai){

  const inner = ai[0];
  const middle = (ai[1]+ai[2]+ai[3]) / 3;
  const outer = (ai[4]+ai[5]) / 2;

  let type="";

  if(inner > middle+10 && inner > outer+15){
    type="イン逃げ主導型";
  }
  else if(middle > inner && middle > outer){
    type="中枠攻め合い型";
  }
  else if(outer > inner && outer > middle){
    type="外伸び波乱型";
  }
  else if(Math.max(...ai) - Math.min(...ai) < 8){
    type="超混戦型";
  }
  else{
    type="バランス型";
  }

  document.getElementById("race-type").textContent =
    "展開タイプ : " + type;
}

// ===============================
// 展開解析（記者風コメント強化）
function updateAnalysis(ai){

  const order = ai
    .map((v,i)=>({v,i:i+1}))
    .sort((a,b)=>b.v-a.v);

  const main  = order[0].i;
  const sub   = order[1].i;
  const third= order[2].i;

  let text="";

  if(main===1){

    text=`スタート踏み込む1コースが先マイ体勢。
握って回る${sub}コースが差しで続き内有利の決着濃厚。
${third}コースは展開待ちで三着争いまで。
外枠勢は展開向かず厳しい一戦となりそうだ。`;

  }
  else if(main<=3){

    text=`${main}コースが攻めて主導権を奪う展開。
${sub}コースが内から抵抗し激しい攻防戦。
${third}コースが展開突いて浮上。
波乱含みのレース展開となりそうだ。`;

  }
  else{

    text=`外枠勢が果敢に仕掛け主導権争い。
${main}コースのまくり差しが決まる可能性。
${sub}コースが続き高配当も視野。
イン勢は苦戦必至の流れだ。`;

  }

  document.querySelector(".analysis-text").textContent = text;
}
// ===============================
// part3 安定修正版（24場対応）

function updatePart3(card, base, predict, ai){

  const expect = base.map((v,i)=> Math.round((v + predict[i] + ai[i]) / 3));

  updateBets(card, expect);
  updateHitRateSimulation(card, base, predict, ai);
  updateTrustMeter(card, expect);
}

// ===============================

function updateBets(card, expect){

  const betBox = card.querySelector(".betList");
  if(!betBox) return;

  const bets = generateBets(expect);

  betBox.innerHTML = "";

  bets.forEach(bet=>{
    const div = document.createElement("div");
    div.className = "bet-item";
    div.textContent = bet;
    betBox.appendChild(div);
  });
}

// ===============================

function updateHitRateSimulation(card, base,predict,ai){

  const rows = card.querySelectorAll(".hitrate-row");

  if(!rows.length) return;

  rows.forEach((row,i)=>{

    let rate = Math.round((base[i] + predict[i] + ai[i]) / 3);
    rate = Math.max(1, Math.min(100, rate));

    const valueBox = row.querySelector(".hitrate-value");
    const barWrap  = row.querySelector(".hitrate-bar");

    let barInner = barWrap.querySelector("div");
    if(!barInner){
      barInner = document.createElement("div");
      barWrap.appendChild(barInner);
    }

    if(valueBox){
      valueBox.textContent = rate + "%";
      valueBox.style.marginLeft = "12px";
    }

    barWrap.style.border = "1px solid #333";
    barWrap.style.height = "14px";
    barWrap.style.background = "#ddd";
    barWrap.style.marginLeft = "12px";

    barInner.style.width = rate + "%";
    barInner.style.height = "100%";
    barInner.style.background = courseColors[i];
  });
}

// ===============================

function updateTrustMeter(card, expect){

  const meter = card.querySelector(".trustMeterBar");
  const label = card.querySelector(".trustMeterValue");

  if(!meter || !label) return;

  const avg = expect.reduce((a,b)=>a+b,0) / expect.length;
  const trust = Math.round(Math.min(100, Math.max(10, avg)));

  meter.style.width = trust + "%";

  if(trust >= 75){
    meter.style.background = "#00cc00";
  }else if(trust >= 50){
    meter.style.background = "#ffaa00";
  }else{
    meter.style.background = "#ff4444";
  }

  label.textContent = trust + "%";
}