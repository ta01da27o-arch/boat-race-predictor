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
    const b = Math.floor(40+Math.random()*40);
    const p = Math.floor(35+Math.random()*45);

    // B② 学習風重み調整
    const weightBase = 0.35 + Math.random()*0.1;
    const weightPred = 1 - weightBase;

    const a = Math.round(b*weightBase + p*weightPred);

    base.push(b);
    predict.push(p);
    ai.push(a);
  }

  updateExpectationBars(base,predict,ai);
  updateKimarite();
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);

  // ★ C①信頼度メーター追加
  updateTrustMeter(ai);
}

// ===============================
// 総合期待度
// ===============================
function updateExpectationBars(base,predict,ai){

  const colors = ["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const labels = ["実績","予測","AI"];

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
// 買い目（完成ロジック）
// ===============================
function updateBets(ai){

  const sorted=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const main=sorted[0].i;
  const sub=sorted[1].i;
  const third=sorted[2].i;

  const others=[2,3,4,5,6];

  const cols=document.querySelectorAll(".bet-col");

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

function setCol(col,arr){
  col.querySelectorAll(".bet-item").forEach((el,i)=>{
    el.textContent=arr[i]||"";
  });
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

// ===================================================
// C① 信頼度メーター（基本ロジック）
// ===================================================
function updateTrustMeter(ai){

  // 上位と下位の差 → 堅さ
  const max=Math.max(...ai);
  const min=Math.min(...ai);
  let solidity = max - min;

  // バラつき → 荒れ指数
  const avg = ai.reduce((a,b)=>a+b,0)/6;
  let variance = ai.reduce((s,v)=>s+Math.abs(v-avg),0)/6;

  // 正規化
  solidity = Math.min(100, Math.round(solidity*1.5));
  variance = Math.min(100, Math.round(variance*1.8));

  // 信頼度
  let trust = Math.round(solidity - variance*0.6);
  if(trust<0) trust=0;
  if(trust>100) trust=100;

  // 表示（無ければ自動生成）
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
// C② 信頼度メーター強化ロジック（追加統合）
// ===============================

// 信頼度計算メイン
function updateConfidenceMeter(base, predict, ai){

  const hardness = calcHardness(ai);
  const volatility = calcVolatility(ai);
  const reliability = calcReliability(hardness, volatility);

  renderConfidence(hardness, volatility, reliability);
}

// -------------------------------
// 堅さスコア（上位集中度）
// -------------------------------
function calcHardness(ai){

  const sorted = [...ai].sort((a,b)=>b-a);

  const top3 = sorted[0] + sorted[1] + sorted[2];
  const total = ai.reduce((a,b)=>a+b,0);

  return Math.round((top3 / total) * 100);
}

// -------------------------------
// 荒れ指数（ばらつき）
// -------------------------------
function calcVolatility(ai){

  const avg = ai.reduce((a,b)=>a+b,0) / ai.length;

  const variance = ai.reduce((sum,v)=>{
    return sum + Math.pow(v - avg,2);
  },0) / ai.length;

  return Math.round(Math.sqrt(variance));
}

// -------------------------------
// 総合信頼度
// -------------------------------
function calcReliability(hardness, volatility){

  let score = hardness - volatility;

  if(score < 0) score = 0;
  if(score > 100) score = 100;

  return score;
}

// -------------------------------
// 表示反映
// -------------------------------
function renderConfidence(hardness, volatility, reliability){

  const box = document.getElementById("confidenceSection");
  if(!box) return;

  box.innerHTML = `
    <h2>信頼度メーター</h2>

    <div class="confidence-row">
      <span>堅さスコア</span>
      <div class="conf-bar"><div style="width:${hardness}%"></div></div>
      <span>${hardness}%</span>
    </div>

    <div class="confidence-row">
      <span>荒れ指数</span>
      <div class="conf-bar"><div style="width:${Math.min(volatility,100)}%"></div></div>
      <span>${volatility}</span>
    </div>

    <div class="confidence-row">
      <span>総合信頼度</span>
      <div class="conf-bar"><div style="width:${reliability}%"></div></div>
      <span>${reliability}%</span>
    </div>
  `;
}
// ===============================
// C③：最終信頼度メーター（過去傾向＋AI連動）
// ===============================

// ダミー過去傾向データ（24場）
const pastTrends = [
  {hard:65,vol:20},{hard:60,vol:25},{hard:58,vol:22},{hard:62,vol:18},
  {hard:55,vol:30},{hard:68,vol:15},{hard:63,vol:20},{hard:57,vol:28},
  {hard:59,vol:24},{hard:61,vol:21},{hard:64,vol:19},{hard:56,vol:27},
  {hard:60,vol:23},{hard:62,vol:20},{hard:58,vol:25},{hard:59,vol:22},
  {hard:61,vol:21},{hard:57,vol:26},{hard:63,vol:18},{hard:56,vol:28},
  {hard:60,vol:24},{hard:62,vol:22},{hard:59,vol:25},{hard:61,vol:20}
];

// ===============================
// 信頼度計算関数
// ===============================
function calcHardness(ai){
  // 1位軸のAIスコアを堅さに変換
  const sorted = [...ai].sort((a,b)=>b-a);
  return Math.min(Math.round(sorted[0]*1.2),100);
}

function calcVolatility(ai){
  // 上位3艇の差を荒れ指数に変換
  const sorted = [...ai].sort((a,b)=>b-a);
  return Math.min(Math.round((sorted[0]-sorted[2])*2),100);
}

function calcReliability(hardness, volatility){
  // 総合信頼度
  let rel = hardness - volatility;
  if(rel<0) rel=0;
  if(rel>100) rel=100;
  return rel;
}

// ===============================
// 過去傾向＋AI統合 信頼度
// ===============================
function updateConfidenceMeterFinal(base,predict,ai,stadiumIndex){

  const hardness = calcHardness(ai);
  const volatility = calcVolatility(ai);
  const reliability = calcReliability(hardness, volatility);

  const past = pastTrends[stadiumIndex] || {hard:60,vol:25};

  // 過去データとAIを統合（重み 60:40）
  const finalHard = Math.round(hardness*0.6 + past.hard*0.4);
  const finalVol  = Math.round(volatility*0.6 + past.vol*0.4);

  let finalReliability = finalHard - finalVol;
  if(finalReliability<0) finalReliability=0;
  if(finalReliability>100) finalReliability=100;

  renderConfidenceFinal(finalHard, finalVol, finalReliability);
}

// ===============================
// 信頼度表示（横並びバー）
// ===============================
function renderConfidenceFinal(hardness, volatility, reliability){

  let box = document.getElementById("confidenceSection");
  if(!box){
    // 初回はセクションを作成
    box = document.createElement("section");
    box.id = "confidenceSection";
    box.style.marginTop = "20px";
    document.getElementById("playerScreen").appendChild(box);
  }

  box.innerHTML = `
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
// calcAll() 呼び出し末尾に追加
// ===============================
// 使用例: stadiumIndex を選択場に置き換える
// const stadiumIndex = 0; // 選択場インデックス
// updateConfidenceMeterFinal(base,predict,ai,stadiumIndex);
// ===============================
// E：総合買い目AI化（穴買い目追加）
// ===============================

// ① 買い目欄HTML自動生成（末尾追加用）
(function createHoleBetSection() {
  const betSection = document.getElementById("betSection");
  if (!betSection) return;

  // 穴買い目欄
  const holeCol = document.createElement("div");
  holeCol.className = "bet-col";

  const title = document.createElement("div");
  title.className = "bet-title";
  title.textContent = "穴";
  holeCol.appendChild(title);

  for (let i = 0; i < 3; i++) {
    const item = document.createElement("div");
    item.className = "bet-item";
    holeCol.appendChild(item);
  }

  betSection.querySelector(".bet-box").appendChild(holeCol);

  // スタイル調整：4分割表示
  const cols = betSection.querySelectorAll(".bet-col");
  cols.forEach(col => col.style.flex = "1");
  betSection.querySelector(".bet-box").style.display = "flex";
  betSection.querySelector(".bet-box").style.gap = "8px";
})();

// ② 総合買い目AI化関数（本命・対抗・逃げ + 穴）
function updateTotalBets(base, predict, ai, confidence) {
  const sorted = ai
    .map((v,i)=>({v,i:i+1}))
    .sort((a,b)=>b.v-a.v);

  const main = sorted[0].i;      // 本命
  const sub  = sorted[1].i;      // 対抗
  const third= sorted[2].i;      // 3着候補

  const others = [1,2,3,4,5,6].filter(n=>n!==main && n!==sub);

  const cols = document.querySelectorAll(".bet-col");

  if (cols.length < 4) return;

  // 本命
  setCol(cols[0], [
    `${main}-${sub}-${third}`,
    `${main}-${third}-${sub}`,
    `${sub}-${main}-${third}`
  ]);

  // 対抗
  setCol(cols[1], [
    `${sub}-${main}-${third}`,
    `${third}-${main}-${sub}`,
    `${sub}-${third}-${main}`
  ]);

  // 逃げ（1固定）
  setCol(cols[2], [
    `1-${others[0]}-${others[1]}`,
    `1-${others[1]}-${others[0]}`,
    `1-${others[2]}-${others[3]}`
  ]);

  // 穴（総合スコア低め + confidence低めコースをピック）
  const holeCandidates = sorted.slice(3).map(x => x.i);
  const hole1 = holeCandidates[0] || others[0];
  const hole2 = holeCandidates[1] || others[1];
  const hole3 = holeCandidates[2] || others[2];

  setCol(cols[3], [
    `${hole1}-${hole2}-${hole3}`,
    `${hole1}-${hole3}-${hole2}`,
    `${hole2}-${hole1}-${hole3}`
  ]);
}

// ③ 既存calcAll()内での呼び出し例
// calcAll()の末尾に追加するイメージ
// updateTotalBets(base, predict, ai, confidenceScore);

// ④ 汎用setCol関数を既存コードから流用
// function setCol(col, arr) {...} は既存のまま使用可能
// ===============================
// 穴買い目（低スコアコース）表示
// calcAll() 内で自動更新
// ===============================
function updateHoleBets(ai){
  const cols = document.querySelectorAll(".bet-col");
  if(cols.length < 4) return; // 穴欄が存在するか確認

  // スコア降順でソート
  const sorted = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  // 上位3つは本命・対抗・逃げで使用済みなので穴候補は下位
  const holeCandidates = sorted.slice(3).map(x=>x.i); 

  // 候補が少ない場合は穴候補を補完
  const others = [1,2,3,4,5,6].filter(n=>!holeCandidates.includes(n));

  const hole1 = holeCandidates[0] || others[0];
  const hole2 = holeCandidates[1] || others[1];
  const hole3 = holeCandidates[2] || others[2];

  // 穴欄に買い目セット
  const holeCol = cols[3]; 
  holeCol.querySelectorAll(".bet-item").forEach((el,i)=>{
    if(i===0) el.textContent = `${hole1}-${hole2}-${hole3}`;
    else if(i===1) el.textContent = `${hole1}-${hole3}-${hole2}`;
    else if(i===2) el.textContent = `${hole2}-${hole1}-${hole3}`;
  });
}

// ===============================
// calcAll() 内で呼び出し例
// ===============================
function calcAll(){
  let base=[];
  let predict=[];
  let ai=[];

  for(let i=0;i<6;i++){
    const b = Math.floor(40+Math.random()*40);
    const p = Math.floor(35+Math.random()*45);
    const a = Math.round(b*0.4 + p*0.6);

    base.push(b);
    predict.push(p);
    ai.push(a);
  }

  updateExpectationBars(base,predict,ai);
  updateKimarite();
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);

  // ←ここで穴買い目を自動更新
  updateHoleBets(ai);
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
// 過去傾向反映版メイン計算
// ===============================
function calcAllWithTrend(stadiumIndex){

  let base=[];
  let predict=[];
  let ai=[];
  let trend = pastTrend[stadiumIndex]; // 選択された場の過去傾向

  for(let i=0;i<6;i++){
    const b = Math.floor(40+Math.random()*40);
    const p = Math.floor(35+Math.random()*45);
    const t = trend[i]; // 過去傾向
    const a = Math.round(b*0.3 + p*0.5 + t*0.2); // 補正AIスコア

    base.push(b);
    predict.push(p);
    ai.push(a);
  }

  // 既存関数連動
  updateExpectationBars(base,predict,ai);
  updateKimarite();
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHoleBets(ai);          // 穴買い目
  updateHitRateSimulation(base,predict,ai);
  updateTrustMeter(ai);         // 信頼度メーター
}

// ===============================
// 穴買い目（末尾追加用）
// ===============================
function updateHoleBets(ai){
  const sorted = ai
    .map((v,i)=>({v,i:i+1}))
    .sort((a,b)=>b.v-a.v);

  const main = sorted[0].i;
  const sub  = sorted[1].i;
  const third= sorted[2].i;

  const others = [1,2,3,4,5,6].filter(n=>![main,sub,third].includes(n));

  const col = document.querySelector("#betSection .bet-col.hole"); // 穴用列

  setCol(col, [
    `${others[0]}-${others[1]}-${others[2]}`,
    `${others[1]}-${others[0]}-${others[2]}`,
    `${others[2]}-${others[0]}-${others[1]}`
  ]);
}
// ===============================
// calcAll() 末尾追加：統合更新（信頼度＋穴買い目）
// ===============================
function updateAllDisplays(ai, base, predict) {
  // 本命・対抗・逃げ買い目更新
  updateBets(ai);

  // 穴買い目更新
  updateHoleBets(ai);

  // 総合期待度バー更新
  updateExpectationBars(base, predict, ai);

  // 的中率バー更新
  updateHitRateSimulation(base, predict, ai);

  // 信頼度メーター更新
  updateTrustMeter(ai);
}

// ===============================
// 穴買い目（末尾追加用）
// ===============================
function updateHoleBets(ai){
  const sorted = ai
    .map((v,i)=>({v,i:i+1}))
    .sort((a,b)=>b.v-a.v);

  const main = sorted[0].i;
  const sub  = sorted[1].i;
  const third= sorted[2].i;

  const others = [1,2,3,4,5,6].filter(n => ![main,sub,third].includes(n));

  const col = document.querySelectorAll(".bet-col")[3]; // 穴列
  const bets = [
    `${others[0]}-${others[1]}-${others[2]}`,
    `${others[0]}-${others[2]}-${others[1]}`,
    `${others[1]}-${others[0]}-${others[2]}`
  ];

  setCol(col, bets);
}

// ===============================
// 信頼度メーター更新（末尾追加用）
// ===============================
function updateTrustMeter(ai){
  const meter = document.querySelector(".trust-meter-bar div");
  const scoreText = document.querySelector(".trust-score");

  // 簡易スコア例: 平均AI値で総合信頼度を算出
  const avg = Math.round(ai.reduce((a,b)=>a+b,0)/ai.length);
  const volatility = Math.max(...ai)-Math.min(...ai); // 荒れ指数

  meter.style.width = avg + "%";            // 総合信頼度バー
  scoreText.textContent = `総合信頼度: ${avg}%  荒れ指数: ${volatility}`;
}
// ===============================
// 過去傾向反映＋AI補正（末尾追加）
// ===============================

// 過去データダミー（本来はDBやAPIから取得）
const pastPerformance = {
  1: { win: 45, place: 30 }, 2: { win: 40, place: 35 },
  3: { win: 38, place: 32 }, 4: { win: 35, place: 30 },
  5: { win: 33, place: 28 }, 6: { win: 30, place: 25 }
};

// calcAll() 内で呼び出すだけで、自動補正
function applyPastTrendCorrection(ai){
  const corrected = ai.map((v,i)=>{
    const past = pastPerformance[i+1] || {win:35, place:30};
    // 過去勝率・連対率をAI期待度に加味
    const trendScore = Math.round(v*0.7 + past.win*0.3);
    return trendScore;
  });
  return corrected;
}

// ===============================
// 最終補正後の更新（全画面連動）
// ===============================
function updateAllWithTrend(base,predict,ai){

  const correctedAI = applyPastTrendCorrection(ai);

  updateExpectationBars(base,predict,correctedAI);
  updateKimarite();
  updateRaceTypeByAI(correctedAI);
  updateAnalysis(correctedAI);
  updateBets(correctedAI);
  updateHoleBets(correctedAI); // 追加穴買い目
  updateHitRateSimulation(base,predict,correctedAI);
  updateConfidenceMeter(correctedAI); // 信頼度バー表示
}

// ===============================
// 信頼度バー（末尾追加）
// ===============================
function updateConfidenceMeter(ai){
  const container = document.getElementById("confidenceMeterSection");
  if(!container) return;

  container.innerHTML="";

  const max = Math.max(...ai);
  const min = Math.min(...ai);

  ai.forEach((v,i)=>{
    const row = document.createElement("div");
    row.className="confidence-row";
    row.style.display="flex";
    row.style.alignItems="center";
    row.style.marginBottom="4px";

    const label = document.createElement("span");
    label.textContent = (i+1)+"";
    label.style.width = "24px";
    label.style.marginRight = "6px";

    const barOuter = document.createElement("div");
    barOuter.style.flex = "1";
    barOuter.style.height = "12px";
    barOuter.style.background = "#eee";
    barOuter.style.border = "1px solid #333";
    barOuter.style.borderRadius = "4px";

    const bar = document.createElement("div");
    bar.style.height = "100%";
    // 信頼度はAI期待度の標準化で算出
    const confidence = Math.round((v - min)/(max-min) * 100);
    bar.style.width = confidence + "%";
    bar.style.background = "#33cc66";

    barOuter.appendChild(bar);
    row.appendChild(label);
    row.appendChild(barOuter);

    container.appendChild(row);
  });
}