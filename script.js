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
// 初期表示
// ===============================
const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");

stadiums.forEach((name,i)=>{
  const div=document.createElement("div");
  div.className="stadium";
  div.textContent=name;
  div.onclick=()=>selectStadium(i);
  stadiumGrid.appendChild(div);
});

for(let i=1;i<=12;i++){
  const div=document.createElement("div");
  div.className="race";
  div.textContent=i+"R";
  div.onclick=()=>selectRace(i);
  raceGrid.appendChild(div);
}

document.getElementById("backBtn").onclick=()=>{
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("stadiumScreen").classList.remove("hidden");
};

// ===============================
// 画面遷移
// ===============================
function selectStadium(i){
  document.getElementById("stadiumScreen").classList.add("hidden");
  document.getElementById("raceScreen").classList.remove("hidden");
  document.getElementById("raceTitle").textContent=stadiums[i];
}

function selectRace(){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  calcAll();
}

// ===============================
// メイン計算
// ===============================
function calcAll(){
  let base=[], predict=[], ai=[];
  for(let i=0;i<6;i++){
    const b=Math.floor(40+Math.random()*40);
    const p=Math.floor(35+Math.random()*45);

    // B② 学習風重み調整
    const weightBase = 0.35 + Math.random()*0.1;
    const weightPred = 1 - weightBase;
    const a = Math.round(b*weightBase + p*weightPred);

    base.push(b);
    predict.push(p);
    ai.push(a);
  }

  // 各種表示更新
  updateExpectationBars(base,predict,ai);
  updateKimarite();
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);

  // 信頼度・穴買い目を含む統合更新
  updateAllDisplays(ai,base,predict);
}

// ===============================
// 総合期待度
// ===============================
function updateExpectationBars(base,predict,ai){
  const colors=["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const labels=["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{
    const barBox=row.querySelector(".expectation-bar");
    barBox.innerHTML="";
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
      outer.style.background=getLightColor(i);
      outer.style.position="relative";
      outer.style.borderRadius="4px";

      const bar=document.createElement("div");
      bar.style.height="100%";
      bar.style.width=val+"%";
      bar.style.background=colors[i];
      bar.style.border="1px solid #000";

      const text=document.createElement("span");
      text.className="bar-text";
      text.textContent=val+"%";

      outer.appendChild(bar);
      outer.appendChild(text);
      line.appendChild(label);
      line.appendChild(outer);
      barBox.appendChild(line);
    });
    row.querySelector(".expectation-value").textContent=ai[i]+"%";
  });
}

function getLightColor(i){
  return ["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"][i];
}

// ===============================
// 決まり手
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
function updateRaceTypeByAI(ai){
  const inner=ai[0];
  const middle=(ai[1]+ai[2]+ai[3])/3;
  const outer=(ai[4]+ai[5])/2;

  const max=Math.max(...ai);
  const min=Math.min(...ai);

  let type="";
  if(inner>middle+10&&inner>outer+15) type="イン逃げ主導型";
  else if(middle>inner&&middle>outer) type="中枠攻め合い型";
  else if(outer>inner&&outer>middle) type="外伸び波乱型";
  else if(max-min<8) type="超混戦型";
  else type="バランス型";

  document.getElementById("race-type").textContent="展開タイプ : "+type;
}

// ===============================
// 展開解析
// ===============================
function updateAnalysis(ai){
  const order=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
  const main=order[0].i;
  const sub=order[1].i;
  let text="";
  if(main===1) text="1コースが主導権。イン有利展開。";
  else if(main<=3) text="中枠中心で流れが動く。";
  else text="外枠優勢で波乱含み。";
  text+=`\n軸は${main}コース、対抗${sub}コース。`;
  document.querySelector(".analysis-text").textContent=text;
}
// ===============================
// 買い目（本命・対抗・逃げ）
// ===============================
function updateBets(ai){
  const sorted=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
  const main=sorted[0].i;
  const sub=sorted[1].i;
  const third=sorted[2].i;
  const others=[1,2,3,4,5,6].filter(n=>![main,sub,third].includes(n));

  const cols=document.querySelectorAll(".bet-col");

  // 本命
  setCol(cols[0],[
    `${main}-${sub}-${third}`,
    `${main}-${third}-${sub}`,
    `${sub}-${main}-${third}`
  ]);

  // 対抗
  setCol(cols[1],[
    `${sub}-${main}-${third}`,
    `${third}-${main}-${sub}`,
    `${sub}-${third}-${main}`
  ]);

  // 逃げ（1固定）
  setCol(cols[2],[
    `1-${others[0]}-${others[1]}`,
    `1-${others[1]}-${others[0]}`,
    `1-${others[2]}-${others[3]}`
  ]);
}

// ===============================
// 汎用セット関数
// ===============================
function setCol(col,arr){
  col.querySelectorAll(".bet-item").forEach((el,i)=>{
    el.textContent=arr[i]||"";
  });
}

// ===============================
// 穴買い目（末尾追加用）
// ===============================
(function createHoleBetSection(){
  const betSection = document.getElementById("betSection");
  if(!betSection) return;

  const holeCol=document.createElement("div");
  holeCol.className="bet-col hole";
  const title=document.createElement("div");
  title.className="bet-title";
  title.textContent="穴";
  holeCol.appendChild(title);

  for(let i=0;i<3;i++){
    const item=document.createElement("div");
    item.className="bet-item";
    holeCol.appendChild(item);
  }

  betSection.querySelector(".bet-box").appendChild(holeCol);

  // 4分割表示調整
  const cols = betSection.querySelectorAll(".bet-col");
  cols.forEach(col => col.style.flex="1");
  betSection.querySelector(".bet-box").style.display="flex";
  betSection.querySelector(".bet-box").style.gap="8px";
})();

// 穴買い目自動更新
function updateHoleBets(ai){
  const sorted = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
  const others = [1,2,3,4,5,6].filter(n=>!sorted.slice(0,3).map(x=>x.i).includes(n));
  const holeCol = document.querySelectorAll(".bet-col")[3]; // 穴
  const bets = [
    `${others[0]}-${others[1]}-${others[2]}`,
    `${others[0]}-${others[2]}-${others[1]}`,
    `${others[1]}-${others[0]}-${others[2]}`
  ];
  setCol(holeCol,bets);
}

// ===============================
// 的中率シミュレーション
// ===============================
function updateHitRateSimulation(base,predict,ai){
  const rows=document.querySelectorAll("#hitRateSection .hitrate-row");
  const colors=["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const light=["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];

  rows.forEach((row,i)=>{
    row.style.display="flex";
    row.style.alignItems="center";
    row.style.marginBottom="6px";

    const rate=Math.round((base[i]+predict[i]+ai[i])/3);
    const val=row.querySelector(".hitrate-value");
    const outer=row.querySelector(".hitrate-bar");
    const bar=outer.querySelector("div");

    val.textContent=rate+"%";
    val.style.width="50px";
    val.style.textAlign="right";
    val.style.marginRight="8px";

    outer.style.flex="1";
    outer.style.height="14px";
    outer.style.border="1px solid #333";
    outer.style.background=light[i];
    outer.style.borderRadius="4px";

    bar.style.height="100%";
    bar.style.width=rate+"%";
    bar.style.background=colors[i];
    bar.style.border="1px solid #000";
  });
}

// ===============================
// 信頼度メーター（C①基本）
// ===============================
function updateTrustMeter(ai){
  const max=Math.max(...ai);
  const min=Math.min(...ai);
  let solidity = max-min;
  const avg = ai.reduce((a,b)=>a+b,0)/6;
  let variance = ai.reduce((s,v)=>s+Math.abs(v-avg),0)/6;
  solidity = Math.min(100, Math.round(solidity*1.5));
  variance = Math.min(100, Math.round(variance*1.8));
  let trust=Math.round(solidity-variance*0.6);
  if(trust<0) trust=0;
  if(trust>100) trust=100;

  let box=document.getElementById("trustMeter");
  if(!box){
    box=document.createElement("div");
    box.id="trustMeter";
    box.style.margin="16px 0";
    box.style.padding="12px";
    box.style.border="2px solid #333";
    box.style.borderRadius="8px";
    document.getElementById("playerScreen").appendChild(box);
  }
  box.innerHTML=`
    <h2>信頼度メーター</h2>
    <p>堅さスコア：${solidity}</p>
    <p>荒れ指数：${variance}</p>
    <p><strong>総合信頼度：${trust}%</strong></p>
  `;
}

// ===============================
// 統合更新（本命・対抗・逃げ・穴・的中率・信頼度）
// ===============================
function updateAllDisplays(ai,base,predict){
  updateBets(ai);          // 本命・対抗・逃げ
  updateHoleBets(ai);      // 穴買い目
  updateExpectationBars(base,predict,ai);  // 総合期待度
  updateHitRateSimulation(base,predict,ai); // 的中率
  updateTrustMeter(ai);    // 信頼度
}
// ===============================
// 過去傾向データ（ダミー、0～100）
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
// 過去傾向＋AI補正版 calcAll
// ===============================
function calcAllWithTrend(stadiumIndex){
  let base=[], predict=[], ai=[];
  const trend = pastTrend[stadiumIndex];

  for(let i=0;i<6;i++){
    const b = Math.floor(40+Math.random()*40);
    const p = Math.floor(35+Math.random()*45);
    const t = trend[i]; // 過去傾向
    const a = Math.round(b*0.3 + p*0.5 + t*0.2); // 補正AIスコア
    base.push(b); predict.push(p); ai.push(a);
  }

  // 既存関数連動
  updateExpectationBars(base,predict,ai);
  updateKimarite();
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);         // 本命・対抗・逃げ
  updateHoleBets(ai);     // 穴買い目
  updateHitRateSimulation(base,predict,ai);
  updateConfidenceMeterFinal(ai, stadiumIndex); // 信頼度最終版
}

// ===============================
// 過去傾向＋AI統合 信頼度計算（C③）
// ===============================
function updateConfidenceMeterFinal(ai, stadiumIndex){
  const hardness = calcHardness(ai);
  const volatility = calcVolatility(ai);
  const reliability = calcReliability(hardness, volatility);

  const past = pastTrend[stadiumIndex] || [60,50,45,40,35,30];
  const pastHard = Math.round((past[0]+past[1]+past[2])/3);
  const pastVol  = Math.round(Math.abs(past[0]-past[2]));

  // AI60% + 過去傾向40%で最終信頼度
  const finalHard = Math.round(hardness*0.6 + pastHard*0.4);
  const finalVol  = Math.round(volatility*0.6 + pastVol*0.4);
  let finalRel = finalHard - finalVol;
  if(finalRel<0) finalRel=0; if(finalRel>100) finalRel=100;

  renderConfidenceFinal(finalHard, finalVol, finalRel);
}

// ===============================
// 信頼度バー描画（C③）
// ===============================
function renderConfidenceFinal(hardness, volatility, reliability){
  let box=document.getElementById("confidenceSection");
  if(!box){
    box=document.createElement("section");
    box.id="confidenceSection";
    box.style.marginTop="20px";
    document.getElementById("playerScreen").appendChild(box);
  }

  box.innerHTML=`
    <h2>最終信頼度メーター（過去傾向＋AI）</h2>

    <div class="confidence-row" style="display:flex;align-items:center;margin-bottom:6px;">
      <span style="width:120px;">堅さスコア</span>
      <div class="conf-bar" style="flex:1;height:14px;border:1px solid #333;background:#eee;border-radius:4px;margin:0 8px;">
        <div style="width:${hardness}%;height:100%;background:#33cc66;border:1px solid #000;box-sizing:border-box;"></div>
      </div>
      <span>${hardness}%</span>
    </div>

    <div class="confidence-row" style="display:flex;align-items:center;margin-bottom:6px;">
      <span style="width:120px;">荒れ指数</span>
      <div class="conf-bar" style="flex:1;height:14px;border:1px solid #333;background:#ffe5e5;border-radius:4px;margin:0 8px;">
        <div style="width:${Math.min(volatility,100)}%;height:100%;background:#ff3333;border:1px solid #000;box-sizing:border-box;"></div>
      </div>
      <span>${volatility}</span>
    </div>

    <div class="confidence-row" style="display:flex;align-items:center;margin-bottom:6px;">
      <span style="width:120px;">総合信頼度</span>
      <div class="conf-bar" style="flex:1;height:14px;border:1px solid #333;background:#fff7cc;border-radius:4px;margin:0 8px;">
        <div style="width:${reliability}%;height:100%;background:#ffcc00;border:1px solid #000;box-sizing:border-box;"></div>
      </div>
      <span>${reliability}%</span>
    </div>
  `;
}

// ===============================
// 堅さスコア/荒れ指数/総合信頼度算出補助
// ===============================
function calcHardness(ai){
  const sorted=[...ai].sort((a,b)=>b-a);
  return Math.min(Math.round(sorted[0]*1.2),100);
}

function calcVolatility(ai){
  const sorted=[...ai].sort((a,b)=>b-a);
  return Math.min(Math.round((sorted[0]-sorted[2])*2),100);
}

function calcReliability(hardness,volatility){
  let rel=hardness-volatility;
  if(rel<0) rel=0;
  if(rel>100) rel=100;
  return rel;
}

// ===============================
// 過去傾向補正（AI期待度に加味）
// ===============================
function applyPastTrendCorrection(ai){
  return ai.map((v,i)=>{
    const past = pastTrend[0][i] || 35; // ダミー過去値
    return Math.round(v*0.7 + past*0.3);
  });
}

// ===============================
// 最終更新関数（全画面連動）
// ===============================
function updateAllWithTrend(base,predict,ai,stadiumIndex){
  const correctedAI = applyPastTrendCorrection(ai);

  updateExpectationBars(base,predict,correctedAI);
  updateKimarite();
  updateRaceTypeByAI(correctedAI);
  updateAnalysis(correctedAI);
  updateBets(correctedAI);
  updateHoleBets(correctedAI);          // 穴買い目
  updateHitRateSimulation(base,predict,correctedAI);
  updateConfidenceMeterFinal(correctedAI, stadiumIndex); // 信頼度最終版
}