// ===============================
// 24場名 + JSONファイル紐付け
// ===============================
const stadiums = [
  { name:"桐生", file:"kiryu.json" },
  { name:"戸田", file:"toda.json" },
  { name:"江戸川", file:"edogawa.json" },
  { name:"平和島", file:"heiwajima.json" },
  { name:"多摩川", file:"tamagawa.json" },
  { name:"浜名湖", file:"hamanako.json" },
  { name:"蒲郡", file:"gamagori.json" },
  { name:"常滑", file:"tokoname.json" },
  { name:"津", file:"tsu.json" },
  { name:"三国", file:"mikuni.json" },
  { name:"びわこ", file:"biwako.json" },
  { name:"住之江", file:"suminoe.json" },
  { name:"尼崎", file:"amagasaki.json" },
  { name:"鳴門", file:"naruto.json" },
  { name:"丸亀", file:"marugame.json" },
  { name:"児島", file:"kojima.json" },
  { name:"宮島", file:"miyajima.json" },
  { name:"徳山", file:"tokuyama.json" },
  { name:"下関", file:"shimonoseki.json" },
  { name:"若松", file:"wakamatsu.json" },
  { name:"芦屋", file:"ashiya.json" },
  { name:"福岡", file:"fukuoka.json" },
  { name:"唐津", file:"karatsu.json" },
  { name:"大村", file:"omura.json" }
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

stadiums.forEach((stadium,i)=>{
  const div = document.createElement("div");
  div.className = "stadium";
  div.textContent = stadium.name;
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
  document.getElementById("raceTitle").textContent = stadiums[i].name;
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

/* ===============================
   学習データ 永続化ロード
=============================== */

if(!window.aiLearning){

  const saved = localStorage.getItem("aiLearningData");

  if(saved){
    window.aiLearning = JSON.parse(saved);
  }else{
    window.aiLearning = {
      avgAI: Array(6).fill(50),
      count: Array(6).fill(1)
    };
  }

}

  let base=[], predict=[], ai=[];
  const trend = pastTrend[stadiumIndex];

  // ===============================
  // 天候カーブ補正（簡易モデル）
  // ===============================
  let weatherFactor = 1;
  weatherFactor -= Math.random() * 0.08;

  for(let i=0;i<6;i++){

    const courseBias = [18,6,2,-3,-8,-12][i];

    let b = Math.round(45 + Math.random()*30 + courseBias);
    let p = Math.round(trend[i] + Math.random()*12 - 6);

    const courseFactor = [1.12,1.05,1.0,0.97,0.93,0.88][i];
// ===============================
// スタート巧者補正（コース別平均）
// ===============================
const startSkill = [1.10,1.06,1.02,0.98,0.94,0.90][i];

// ===============================
// 展開有利不利補正（風速×風向×水面×脚質）
// ===============================

// 風向 0=無風 1=追い風 2=向かい風
const windType = Math.floor(Math.random()*3);

// 風速（0〜10m想定）
const windSpeed = Math.random() * 10;

// 水面荒れ（0=穏やか〜1=荒れ）
const waterRough = Math.random();

// 脚質分類
const styleType = i === 0 ? "inner" :
                  i <= 2 ? "attack" : "outer";

let tacticalFactor = 1;

// ---- 風向補正 ----
if(windType === 1){ // 追い風
  if(styleType === "inner") tacticalFactor += 0.04 * (windSpeed/5);
  if(styleType === "outer") tacticalFactor -= 0.03 * (windSpeed/5);
}

if(windType === 2){ // 向かい風
  if(styleType === "outer") tacticalFactor += 0.04 * (windSpeed/5);
  if(styleType === "inner") tacticalFactor -= 0.03 * (windSpeed/5);
}

// ---- 水面荒れ補正 ----
tacticalFactor -= waterRough * 0.06 * (i === 0 ? 1 : 0.4);

if(styleType === "outer"){
  tacticalFactor += waterRough * 0.03;
}

// ---- 範囲制限 ----
tacticalFactor = Math.max(0.85, Math.min(1.15, tacticalFactor));

// ===============================
// AI最終評価値 計算（←ここが重要）
// ===============================

b = Math.max(1,Math.min(100,b));
p = Math.max(1,Math.min(100,p));

let a = Math.round(
 (b*0.45 + p*0.35 + trend[i]*0.2)
 * weatherFactor
 * courseFactor
 * startSkill
 * tacticalFactor
);

a = Math.max(1, Math.min(100, a));

/* ===============================
   決まり手 実効化（排他型モデル）
=============================== */

if(!window.realKimarite) window.realKimarite = [];

// 逃げ成立率をAI評価から算出
let escapeRate = Math.max(20, Math.min(85, a));

// 残り確率
let remain = 100 - escapeRate;

// 展開バランス係数
let diff = a - (base[i] + predict[i] + trend[i]) / 3;

// 比率調整
let sashiRatio = 0.45 - diff * 0.002;
let makuriRatio = 0.35 + diff * 0.001;
let makurisashiRatio = 0.20 + diff * 0.001;

// 正規化
let sumRatio = sashiRatio + makuriRatio + makurisashiRatio;

sashiRatio /= sumRatio;
makuriRatio /= sumRatio;
makurisashiRatio /= sumRatio;

// 実効決まり手
let realSashi = Math.round(remain * sashiRatio);
let realMakuri = Math.round(remain * makuriRatio);
let realMakuriSashi = Math.round(remain * makurisashiRatio);

// 誤差補正
let adjust = 100 - (escapeRate + realSashi + realMakuri + realMakuriSashi);
realSashi += adjust;

// 保存（UIはそのまま動く）
window.realKimarite[i] = {
  escape: escapeRate,
  sashi: realSashi,
  makuri: realMakuri,
  makuriSashi: realMakuriSashi
};
/* ===============================
   学習補正モデル（平均との差学習）
=============================== */

if(!window.aiLearning) window.aiLearning = {
  avgAI: Array(6).fill(50),
  count: Array(6).fill(1)
};

// 過去平均との差を更新
let prevAvg = window.aiLearning.avgAI[i];
let c = window.aiLearning.count[i];

let newAvg = Math.round((prevAvg * c + a) / (c + 1));

window.aiLearning.avgAI[i] = newAvg;
window.aiLearning.count[i] = c + 1;

/* ===============================
   学習データ 永続保存
=============================== */

localStorage.setItem(
  "aiLearningData",
  JSON.stringify(window.aiLearning)
);

// 学習補正値（平均との差を次回反映）
let learnDiff = newAvg - 50;

// AIへ軽く反映（暴走防止で±10まで）
a = a + Math.max(-10, Math.min(10, learnDiff));

a = Math.max(1, Math.min(100, a));

    base.push(b);
    predict.push(p);
    ai.push(a);
  }
/* ===============================
   的中期待確率モデル（信頼度AI化）
=============================== */

// AI評価をコピーして並び替え
let sortedAI = [...ai].sort((a,b)=>b-a);

// 上位差
let gap1 = sortedAI[0] - sortedAI[1];
let gap2 = sortedAI[1] - sortedAI[2];

// 集中度（強い艇にどれだけ集まっているか）
let totalTop = sortedAI[0] + sortedAI[1] + sortedAI[2];
let concentration = totalTop / (ai.reduce((s,v)=>s+v,0));

// 展開荒れ補正（逃げ率が極端なら安定）
let escapeAvg = window.realKimarite
  .map(k=>k.escape)
  .reduce((s,v)=>s+v,0) / window.realKimarite.length;

let chaosFactor = Math.abs(escapeAvg - 60) / 60;

// 的中期待確率（0〜100）
let hitExpectation = 
    gap1 * 1.8 +
    gap2 * 1.2 +
    concentration * 40 -
    chaosFactor * 30;

// 正規化
hitExpectation = Math.round(
  Math.max(5, Math.min(95, hitExpectation))
);

// グローバル保存（UIで使える）
window.hitExpectation = hitExpectation;

/* ===============================
   回収率最大化モデル（期待値フィルター）
=============================== */

// 簡易オッズ想定（強いほど低オッズ）
let oddsModel = ai.map(v=>{
  return Math.max(1.5, 15 - v * 0.12);
});

// 的中期待確率
let hitP = window.hitExpectation / 100;

// 各艇の期待値
let expectedValues = oddsModel.map(odds=>{
  return hitP * odds;
});

// プラス期待値判定
let profitable = expectedValues.map(ev=>ev >= 1);

// グローバル保存
window.expectedValues = expectedValues;
window.profitFlags = profitable;

// ===== UI更新 =====

updateExpectationBars(base,predict,ai);
updateKimarite(base);
updateRaceTypeByAI(ai);
updateAnalysis(ai);
updateBets(ai);
updateHitRateSimulation(base,predict,ai);
updateTrustMeter(ai);

/* ===============================
   自動買い目生成（期待値プラス艇のみ）
=============================== */

let picks = [];

if(window.profitFlags){

  window.profitFlags.forEach((flag,i)=>{
    if(flag){
      picks.push(i+1); // 艇番は1〜6
    }
  });

}

// グローバル保存
window.autoPicks = picks;

// ===== 簡易買い目ロジック =====

let betSuggestions = [];

if(picks.length >= 1){

  // 本命（最強AI評価）
  let main = picks.reduce((best,cur)=>{
    return ai[cur-1] > ai[best-1] ? cur : best;
  }, picks[0]);

  betSuggestions.push(`単勝：${main}`);

  if(picks.length >= 2){
    betSuggestions.push(`2連複：${main}-${picks[1]}`);
  }

  if(picks.length >= 3){
    betSuggestions.push(`穴：${main}-${picks[2]}`);
  }

}

// 保存
window.betSuggestions = betSuggestions;

/* ===============================
   期待値プラス艇 色分け表示（確実版）
=============================== */

setTimeout(()=>{

  const boatBoxes = document.querySelectorAll(".expectation-bar");

  boatBoxes.forEach((box,i)=>{

    if(window.profitFlags && window.profitFlags[i]){

      // プラス期待値 → 強調
      box.style.background = "linear-gradient(135deg,#e8fff0,#b6f5c8)";
      box.style.border = "2px solid #2ecc71";
      box.style.boxShadow = "0 0 10px rgba(46,204,113,0.6)";
      box.style.padding = "6px";
      box.style.borderRadius = "6px";
      box.style.opacity = "1";

    }else{

      // マイナス期待値
      box.style.background = "#f5f5f5";
      box.style.border = "1px solid #ccc";
      box.style.boxShadow = "none";
      box.style.opacity = "0.6";
    }

  });

}, 30); 

}

/* ===============================
   資金配分ロジック（簡易ケリー）
=============================== */

if(!window.betAmounts) window.betAmounts = [];

const totalBank = 10000; // 仮想資金（自由に変更OK）

window.betAmounts = ai.map((v,i)=>{

  if(!window.profitFlags[i]) return 0;

  const odds = window.expectedValues[i] / ((window.hitExpectation||50)/100);

  let ratio = (window.expectedValues[i] - 1) / (odds - 1);

  // 安全係数（半分）
  ratio *= 0.5;

  if(ratio < 0) ratio = 0;

  return Math.round(totalBank * ratio);
});

// ===============================
// 総合期待度（3本バー＋ラベル付き）
// ===============================
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
      label.style.marginRight="6px";

      const outer = document.createElement("div");
      outer.style.flex="1";
      outer.style.height="14px";
      outer.style.border="1px solid #333";
      outer.style.borderRadius="4px";
      outer.style.background="#ddd";

      const bar = document.createElement("div");
      bar.style.height="100%";
      bar.style.width = val + "%";
      bar.style.background = courseColors[i];

      outer.appendChild(bar);
      container.appendChild(label);
      container.appendChild(outer);

      barBox.appendChild(container);
    });

    row.querySelector(".expectation-value").textContent = ai[i] + "%";
  });
}

// ===============================
// 決まり手
// ===============================
function updateKimarite(base){

  const rows = document.querySelectorAll(".kimarite-row");

  rows.forEach((row,i)=>{

    const baseVal = base[i] || 0;

let v = window.realKimarite?.[i]?.escape || Math.round(baseVal*0.85 + Math.random()*10);
    v = Math.max(1,Math.min(100,v));

    row.querySelector(".bar div").style.width = v + "%";
    row.querySelector(".value").textContent = v + "%";

  });
}

// ===============================
// 展開タイプ
// ===============================
function updateRaceTypeByAI(ai){

  const inner = ai[0];
  const middle = (ai[1]+ai[2]+ai[3]) / 3;
  const outer = (ai[4]+ai[5]) / 2;

  let type="";

  if(inner>middle+10 && inner>outer+15) type="イン逃げ主導型";
  else if(middle>inner && middle>outer) type="中枠攻め合い型";
  else if(outer>inner && outer>middle) type="外伸び波乱型";
  else if(Math.max(...ai)-Math.min(...ai)<8) type="超混戦型";
  else type="バランス型";

  document.getElementById("race-type").textContent="展開タイプ : "+type;
}

// ===============================
// 展開解析（記者風）
// ===============================
function updateAnalysis(ai){

  const order = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const main=order[0].i;
  const sub=order[1].i;
  const third=order[2].i;

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

  document.querySelector(".analysis-text").textContent=text;
}
// ===============================
// 買い目（重複完全排除）
function updateBets(ai){

  const sorted = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const main = sorted[0].i;
  const sub = sorted[1].i;
  const third = sorted[2].i;

  const all=[1,2,3,4,5,6];

  let bets=[];

  // 本命・対抗
  bets.push(`${main}-${sub}-${third}`);
  bets.push(`${main}-${third}-${sub}`);
  bets.push(`${sub}-${main}-${third}`);
  bets.push(`${sub}-${third}-${main}`);
  bets.push(`${third}-${main}-${sub}`);
  bets.push(`${third}-${sub}-${main}`);

  // 逃げ固定（1着=1）
  all.forEach(a=>{
    all.forEach(b=>{
      if(a!==1 && b!==1 && a!==b){
        bets.push(`1-${a}-${b}`);
      }
    });
  });

  bets=[...new Set(bets)].slice(0,9);

  const cols=document.querySelectorAll(".bet-col");

  cols.forEach((col,j)=>{
    const items=col.querySelectorAll(".bet-item");
    items.forEach((el,i)=>{
      el.textContent = bets[j*3+i] || "";
    });
  });
}

// ===============================
// 的中率シミュレーション
function updateHitRateSimulation(base,predict,ai){

  const rows=document.querySelectorAll(".hitrate-row");

  rows.forEach((row,i)=>{

    let rate=Math.round((base[i]+predict[i]+ai[i])/3);
    rate=Math.max(1,Math.min(100,rate));

    row.querySelector(".hitrate-value").textContent = rate+"%";

    const bar=row.querySelector(".hitrate-bar div");

    bar.style.width = rate + "%";
    bar.style.background = courseColors[i];

    row.querySelector(".hitrate-bar").style.border="1px solid #333";
    row.querySelector(".hitrate-bar").style.height="14px";
    row.querySelector(".hitrate-bar").style.borderRadius="4px";
    row.querySelector(".hitrate-bar").style.background="#ddd";
  });
}

// ===============================
// 信頼度メーター
function updateTrustMeter(ai){

  // 上位3艇と下位平均との差
  const sorted = [...ai].sort((a,b)=>b-a);

  const topAvg = (sorted[0] + sorted[1] + sorted[2]) / 3;
  const lowAvg = (sorted[3] + sorted[4] + sorted[5]) / 3;

  // 抜け度（強弱差）
  let gap = topAvg - lowAvg;

  // 安定度（平均との差ブレ）
  const avg = ai.reduce((a,b)=>a+b,0)/6;

  let variance = ai.reduce((s,v)=>s+Math.abs(v-avg),0)/6;

  // 学習平均との差反映（あれば）
  let learningStability = 0;

  if(window.aiLearning){
    learningStability = window.aiLearning.avgAI
      .map((v,i)=>Math.abs(v - ai[i]))
      .reduce((a,b)=>a+b,0) / 6;
  }

  // ===== 的中期待確率モデル =====

  let hitExpectation =
      gap * 1.1
    - variance * 0.6
    - learningStability * 0.4;

  // スケーリング
  hitExpectation = Math.round(
    Math.max(5, Math.min(95, hitExpectation))
  );

  // UI表示（今までと同じ場所）
  let box=document.getElementById("trustMeter");

  if(!box){
    box=document.createElement("div");
    box.id="trustMeter";
    box.style.margin="16px 10px";
    box.style.padding="12px";
    box.style.border="2px solid #333";
    box.style.borderRadius="8px";
    document.getElementById("playerScreen").appendChild(box);
  }

  box.innerHTML=`
    <h2>的中期待確率</h2>
    <p>上位抜け度：${Math.round(gap)}</p>
    <p>安定度ブレ：${Math.round(variance)}</p>
    <p>学習誤差：${Math.round(learningStability)}</p>
    <p><strong>総合的中期待：${hitExpectation}%</strong></p>
  `;
}
// ===============================
// 本日の日付 自動表示
// ===============================
function updateTodayDate(){

  const now = new Date();

  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  const el = document.getElementById("todayDate");

  if(el){
    el.textContent = `${y}年${m}月${d}日`;
  }
}

updateTodayDate();
