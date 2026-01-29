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

let currentStadiumIndex = 0;

// ===============================
// 初期表示生成
// ===============================
const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");

stadiums.forEach((name,i)=>{
  const div=document.createElement("div");
  div.className="stadium";
  div.textContent=name;
  div.onclick=()=>{
    currentStadiumIndex = i;
    selectStadium();
  };
  stadiumGrid.appendChild(div);
});

for(let i=1;i<=12;i++){
  const div=document.createElement("div");
  div.className="race";
  div.textContent=i+"R";
  div.onclick=()=>selectRace();
  raceGrid.appendChild(div);
}

document.getElementById("backBtn").onclick=()=>{
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("stadiumScreen").classList.remove("hidden");
};

// ===============================
// 画面遷移
// ===============================
function selectStadium(){
  document.getElementById("stadiumScreen").classList.add("hidden");
  document.getElementById("raceScreen").classList.remove("hidden");
  document.getElementById("raceTitle").textContent=stadiums[currentStadiumIndex];
}

function selectRace(){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  calcAll();
}
// ===============================
// メイン計算（唯一のcalcAll）
// ===============================
function calcAll(){

  let base=[];
  let predict=[];
  let ai=[];

  for(let i=0;i<6;i++){
    const b = Math.floor(40+Math.random()*40);
    const p = Math.floor(35+Math.random()*45);

    // 学習風重み
    const weightB = 0.35 + Math.random()*0.1;
    const weightP = 1 - weightB;

    const a = Math.round(b*weightB + p*weightP);

    base.push(b);
    predict.push(p);
    ai.push(a);
  }

  updateExpectationBars(base,predict,ai);
  updateKimarite();
  updateRaceType(ai);
  updateAnalysis(ai);
  updateMainBets(ai);
  updateHoleBets(ai);
  updateHitRateSimulation(base,predict,ai);

  // 信頼度は③で統合
}

// ===============================
// 総合期待度バー
// ===============================
function updateExpectationBars(base,predict,ai){

  const colors = ["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const labels = ["実績","予測","AI"];
  const light  = ["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{

    const box = row.querySelector(".expectation-bar");
    box.innerHTML="";

    [base[i],predict[i],ai[i]].forEach((val,j)=>{

      const line=document.createElement("div");
      line.className="bar-line";

      const label=document.createElement("span");
      label.className="bar-label";
      label.textContent=labels[j];

      const outer=document.createElement("div");
      outer.style.flex="1";
      outer.style.height="14px";
      outer.style.border="1px solid #333";
      outer.style.background=light[i];
      outer.style.borderRadius="4px";
      outer.style.position="relative";

      const bar=document.createElement("div");
      bar.style.height="100%";
      bar.style.width=val+"%";
      bar.style.background=colors[i];
      bar.style.border="1px solid #000";

      const txt=document.createElement("span");
      txt.className="bar-text";
      txt.textContent=val+"%";

      outer.appendChild(bar);
      outer.appendChild(txt);
      line.appendChild(label);
      line.appendChild(outer);
      box.appendChild(line);
    });

    row.querySelector(".expectation-value").textContent=ai[i]+"%";
  });
}

// ===============================
// 決まり手（ダミー）
// ===============================
function updateKimarite(){
  document.querySelectorAll(".kimarite-row").forEach(row=>{
    const v=Math.floor(10+Math.random()*75);
    row.querySelector(".bar div").style.width=v+"%";
    row.querySelector(".value").textContent=v+"%";
  });
}

// ===============================
// 展開タイプ
// ===============================
function updateRaceType(ai){

  const inner = ai[0];
  const middle = (ai[1]+ai[2]+ai[3])/3;
  const outer = (ai[4]+ai[5])/2;

  let type="";

  if(inner>middle+10 && inner>outer+15) type="イン逃げ主導型";
  else if(middle>inner && middle>outer) type="中枠攻め合い型";
  else if(outer>inner && outer>middle) type="外伸び波乱型";
  else if(Math.max(...ai)-Math.min(...ai)<8) type="超混戦型";
  else type="バランス型";

  document.getElementById("race-type").textContent="展開タイプ : "+type;
}

// ===============================
// 展開解析
// ===============================
function updateAnalysis(ai){

  const order = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const main = order[0].i;
  const sub  = order[1].i;

  let txt="";

  if(main===1) txt="1コースが主導権。イン有利展開。";
  else if(main<=3) txt="中枠中心で流れが動く。";
  else txt="外枠優勢で波乱含み。";

  txt += `\n軸は${main}コース、対抗${sub}コース。`;

  document.querySelector(".analysis-text").textContent = txt;
}

// ===============================
// 本命・対抗・逃げ 買い目
// ===============================
function updateMainBets(ai){

  const sorted = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const main = sorted[0].i;
  const sub  = sorted[1].i;
  const third= sorted[2].i;

  const others = [1,2,3,4,5,6].filter(n=>![main,sub,third].includes(n));

  const cols = document.querySelectorAll(".bet-col");

  if(cols.length < 3) return;

  setCol(cols[0],[
    `${main}-${sub}-${third}`,
    `${main}-${third}-${sub}`,
    `${sub}-${main}-${third}`
  ]);

  setCol(cols[1],[
    `${sub}-${main}-${third}`,
    `${third}-${main}-${sub}`,
    `${sub}-${third}-${main}`
  ]);

  setCol(cols[2],[
    `1-${others[0]}-${others[1]}`,
    `1-${others[1]}-${others[0]}`,
    `1-${others[2]}-${others[3]}`
  ]);
}

// ===============================
// 穴買い目
// ===============================
function updateHoleBets(ai){

  const sorted = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const hole = sorted.slice(3).map(x=>x.i);

  const col = document.querySelectorAll(".bet-col")[3];
  if(!col) return;

  setCol(col,[
    `${hole[0]}-${hole[1]}-${hole[2]}`,
    `${hole[0]}-${hole[2]}-${hole[1]}`,
    `${hole[1]}-${hole[0]}-${hole[2]}`
  ]);
}

// ===============================
// 汎用列セット
// ===============================
function setCol(col,arr){
  col.querySelectorAll(".bet-item").forEach((el,i)=>{
    el.textContent = arr[i] || "";
  });
}

// ===============================
// 的中率シミュレーション
// ===============================
function updateHitRateSimulation(base,predict,ai){

  const rows = document.querySelectorAll("#hitRateSection .hitrate-row");

  const colors = ["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const light  = ["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];

  rows.forEach((row,i)=>{

    const rate = Math.round((base[i]+predict[i]+ai[i])/3);

    const val = row.querySelector(".hitrate-value");
    const outer = row.querySelector(".hitrate-bar");
    const bar = outer.querySelector("div");

    val.textContent = rate+"%";

    outer.style.background = light[i];
    bar.style.width = rate+"%";
    bar.style.background = colors[i];
  });
}
// ===============================
// 過去傾向データ（24場 × 6艇）
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
// AI＋過去傾向 統合補正
// ===============================
function applyTrendCorrection(ai, stadiumIndex){

  const trend = pastTrend[stadiumIndex] || [50,50,50,50,50,50];

  return ai.map((v,i)=>{
    return Math.round(v*0.7 + trend[i]*0.3);
  });
}

// ===============================
// 信頼度メーター計算
// ===============================
function calcTrust(ai){

  const max = Math.max(...ai);
  const min = Math.min(...ai);
  const avg = ai.reduce((a,b)=>a+b,0)/ai.length;

  // 堅さ：上位集中
  let solidity = Math.round((max - min) * 1.4);
  if(solidity>100) solidity=100;

  // 荒れ：ばらつき
  let volatility = Math.round(
    ai.reduce((s,v)=>s+Math.abs(v-avg),0)/ai.length * 1.6
  );
  if(volatility>100) volatility=100;

  // 総合信頼度
  let trust = solidity - volatility*0.6;
  trust = Math.round(Math.max(0,Math.min(100,trust)));

  return {solidity,volatility,trust};
}

// ===============================
// 信頼度メーター描画
// ===============================
function renderTrustMeter(solidity,volatility,trust){

  let box = document.getElementById("confidenceSection");

  if(!box){
    box = document.createElement("section");
    box.id="confidenceSection";
    box.style.marginTop="20px";
    document.getElementById("playerScreen").appendChild(box);
  }

  box.innerHTML = `
    <h2>信頼度メーター</h2>

    <div class="confidence-row" style="display:flex;align-items:center;margin-bottom:6px;">
      <span style="width:110px;">堅さ</span>
      <div style="flex:1;height:14px;border:1px solid #333;background:#e5ffe5;border-radius:4px;margin:0 8px;">
        <div style="width:${solidity}%;height:100%;background:#33cc66;border:1px solid #000;"></div>
      </div>
      <span>${solidity}%</span>
    </div>

    <div class="confidence-row" style="display:flex;align-items:center;margin-bottom:6px;">
      <span style="width:110px;">荒れ指数</span>
      <div style="flex:1;height:14px;border:1px solid #333;background:#ffe5e5;border-radius:4px;margin:0 8px;">
        <div style="width:${volatility}%;height:100%;background:#ff3333;border:1px solid #000;"></div>
      </div>
      <span>${volatility}%</span>
    </div>

    <div class="confidence-row" style="display:flex;align-items:center;margin-bottom:6px;">
      <span style="width:110px;">総合信頼度</span>
      <div style="flex:1;height:14px;border:1px solid #333;background:#fff7cc;border-radius:4px;margin:0 8px;">
        <div style="width:${trust}%;height:100%;background:#ffcc00;border:1px solid #000;"></div>
      </div>
      <span>${trust}%</span>
    </div>
  `;
}

// ===============================
// calcAll 上書き最終統合版
// ===============================
// ※①②のcalcAllをこれに置き換え
function calcAllFinal(stadiumIndex=0){

  let base=[];
  let predict=[];
  let ai=[];

  for(let i=0;i<6;i++){
    const b = Math.floor(40+Math.random()*40);
    const p = Math.floor(35+Math.random()*45);

    const weightB = 0.35 + Math.random()*0.1;
    const weightP = 1 - weightB;

    const a = Math.round(b*weightB + p*weightP);

    base.push(b);
    predict.push(p);
    ai.push(a);
  }

  // 過去傾向反映
  const correctedAI = applyTrendCorrection(ai, stadiumIndex);

  // 表示更新
  updateExpectationBars(base,predict,correctedAI);
  updateKimarite();
  updateRaceType(correctedAI);
  updateAnalysis(correctedAI);
  updateMainBets(correctedAI);
  updateHoleBets(correctedAI);
  updateHitRateSimulation(base,predict,correctedAI);

  // 信頼度
  const trustData = calcTrust(correctedAI);
  renderTrustMeter(
    trustData.solidity,
    trustData.volatility,
    trustData.trust
  );
}

// ===============================
// レース選択時に最終版を呼ぶ
// ===============================
function selectRace(){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");

  // 仮：場インデックス0（後で連動可能）
  calcAllFinal(0);
}