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
// 初期表示（DOM読み込み後に実行）
document.addEventListener("DOMContentLoaded", ()=>{

  const stadiumGrid = document.querySelector(".stadium-grid");
  const raceGrid = document.querySelector(".race-grid");
  
if(!stadiumGrid || !raceGrid) return;

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

});

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

function selectRace(i){
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

// ===============================
// 実オッズ連動（本物）
// ===============================

// 実オッズが取れていればそれを使用
let oddsModel = window.realOdds && window.realOdds.length === 6
  ? window.realOdds.map(v => Number(v))
  : ai.map(v => Math.max(1.8, 30 - v * 0.25)); // 取得失敗時の保険

// 的中期待確率
let hitP = window.hitExpectation / 100;

// 各艇の期待値 
  let expectedValues = oddsModel.map((odds,i)=>{
  return hitP * odds * (ai[i] / 100);
}); 

// グローバル保存（安定版）
window.expectedValues = expectedValues;
window.profitFlags = expectedValues.map(ev => Number(ev) >= 1.15);

window.latestAI = [...ai]; // コピー保存

/* ===============================
   期待値ベース的中率（新）
=============================== */

// 期待値から逆算した的中確率
let hitRates = expectedValues.map((ev,i)=>{
  const odds = oddsModel[i];
  if(!odds || odds <= 0) return 0;
  return ev / odds * 100;
});

// 全体的中率（平均）
let newHitExpectation = hitRates.reduce((a,b)=>a+b,0) / hitRates.length;

// 安定化（0〜100%制限）
newHitExpectation = Math.max(1, Math.min(99, newHitExpectation));

// グローバル上書き
window.hitExpectation = newHitExpectation;

// ===== UI更新 =====

updateExpectationBars(base,predict,ai);
updateKimarite(base);
updateRaceTypeByAI(ai);
updateBets(ai);
updateHitRateSimulation(base,predict,ai);
updateTrustMeter(ai);
updateProfitHighlight();
updateAnalysis(ai);

window.autoPicks = buyList;

/* ===============================
   自動買い目生成（AI予想エンジン）
=============================== */

let buyList = [];

// ベース資金（自由に変えてOK）
const totalMoney = 1000;

// プラス期待値艇だけ抽出
window.expectedValues.forEach((ev,i)=>{

  if(window.profitFlags[i]){

    buyList.push({
      course: i+1,
      ai: ai[i],
      ev: ev
    });

  }

});

// 何もなければ上位AIから保険買い
if(buyList.length === 0){

  const sorted = ai
    .map((v,i)=>({course:i+1, ai:v}))
    .sort((a,b)=>b.ai - a.ai)
    .slice(0,2);

  sorted.forEach(v=>{
    buyList.push({
      course: v.course,
      ai: v.ai,
      ev: 1
    });
  });

}

// AI評価合計
const sumAI = buyList.reduce((s,v)=>s+v.ai,0);

// 資金配分
buyList.forEach(v=>{
  v.bet = Math.round(totalMoney * (v.ai / sumAI));
});

// グローバル保存（UIや拡張用）
window.autoBets = buyList;

}

/* ===============================
   期待値プラス艇 色分け表示（確実版）
=============================== */
function updateProfitHighlight(){

  const boatBoxes = document.querySelectorAll(".expectation-bar");

  boatBoxes.forEach((box,i)=>{

    if(window.profitFlags && window.profitFlags[i]){

      box.style.background = "linear-gradient(135deg,#e8fff0,#b6f5c8)";
      box.style.border = "2px solid #2ecc71";
      box.style.boxShadow = "0 0 10px rgba(46,204,113,0.6)";
      box.style.opacity = "1";

    }else{

      box.style.background = "#f5f5f5";
      box.style.border = "1px solid #ccc";
      box.style.boxShadow = "none";
      box.style.opacity = "0.6";
    }

  });
}

/* ===============================
   資金配分ロジック（簡易ケリー）
=============================== */

if(!window.betAmounts) window.betAmounts = [];

const totalBank = 10000; // 仮想資金

// latestAI が無い場合も落ちない安全構造
window.betAmounts = (window.latestAI || []).map((v,i)=>{

  if(!window.profitFlags || !window.profitFlags[i]) return 0;

  const hitP = (window.hitExpectation || 50) / 100;

  // 想定オッズ逆算
  const odds = window.expectedValues[i] / hitP;

  let ratio = (window.expectedValues[i] - 1) / (odds - 1);

  // 安全係数（半分ケリー）
  ratio *= 0.5;

  if(ratio < 0 || !isFinite(ratio)) ratio = 0;

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
// 展開解析（記者風＋決まり手＋風・水面 融合）
// ===============================
function updateAnalysis(ai){

  const el = document.querySelector("#analysisSection .analysis-text");
  if(!el) return;

  if(!window.expectedValues || !window.realKimarite){
    el.textContent = "⏳ データ解析中…";
    return;
  }

  /* ===== 安全な外部値 ===== */
  const windEvalSafe   = window.windEval   ?? "normal";
  const windSpeedSafe = window.windSpeed  ?? 0;
  const windDirSafe   = window.windDir    ?? "";
  const waveLevelSafe = window.waveLevel  ?? 0;

  /* ===== 期待値分析 ===== */
  const ev = window.expectedValues;
  const maxEV = Math.max(...ev);
  const topCourse = ev.indexOf(maxEV) + 1;
  const profitCount = window.profitFlags
    ? window.profitFlags.filter(v => v).length
    : 0;

  /* ===== 決まり手平均 ===== */
  let escapeAvg = 0;
  let attackAvg = 0;

  window.realKimarite.forEach(k=>{
    escapeAvg += k.escape;
    attackAvg += (k.sashi + k.makuri + k.makuriSashi);
  });

  escapeAvg /= 6;
  attackAvg /= 6;

/* ===== モーター評価（隠れ機力） ===== */
let motorScore = 0;

// 想定データ（どれか使えるものだけでOK）
const motor2Rate   = window.motor2Rate   ?? 0;   // モーター2連率
const motorRecent3 = window.motorRecent3 ?? 0;   // 直近3着内回数
const isLowRank    = window.isLowRank    ?? false; // B2・新人判定

// ＋1：隠れ高評価モーター
if(
  motor2Rate >= 0.30 ||                 // 上位30%
  motorRecent3 >= 5 ||                  // 直近好走
  (isLowRank && motorRecent3 >= 4)      // 格下×機力
){
  motorScore = 1;
}

// −1：弱モーター
else if(
  motor2Rate <= 0.15 ||                 // 下位30%
  motorRecent3 <= 2                     // 直近不振
){
  motorScore = -1;
}

  /* ===== 展開コメント ===== */
  let comment = "";

/* ===== コース別記者コメント ===== */
let courseComment = "";

if(topCourse === 1){
  if(escapeAvg >= 55){
    courseComment =
      "🎯 1号艇が踏み込めば隊形は即決。イン逃げ濃厚の流れ。";
  } else {
    courseComment =
      "⚠ 1号艇は主役も万全ではない。スタートで包まれる懸念。";
  }
}
else if(topCourse === 2){
  courseComment =
    "👀 2号艇が差し構え。インの踏み遅れがあれば一気に台頭。";
}
else if(topCourse === 3){
  courseComment =
    "🔥 3号艇が握って主導権。捲り一撃が展開のカギを握る。";
}
else if(topCourse === 4){
  courseComment =
    "⚡ 4号艇が攻め役。展開が向けば外から一気に突き抜ける。";
}
else if(topCourse === 5){
  courseComment =
    "🌪 5号艇が不気味な存在。展開の隙を突く差しが警戒点。";
}
else if(topCourse === 6){
  courseComment =
    "🎲 6号艇が展開の波乱要因。スタート一発で空気が変わる。";
}

/* ===== 決まり手タイプ判定 ===== */
let kimariteType = "";
let kimariteComment = "";

if(escapeAvg >= 60){
  kimariteType = "escape";
  kimariteComment =
    "🚤 イン逃げが最有力。スタート踏み込めば隊形は即決。";
}
else if(attackAvg >= 60){
  kimariteType = "attack";
  kimariteComment =
    "⚡ 差し・捲り主体の展開。外の一撃が決まりやすい水面。";
}
else if(attackAvg >= escapeAvg){
  kimariteType = "mix";
  kimariteComment =
    "🔄 逃げと攻めが拮抗。隊形次第で決まり手が入れ替わる。";
}
else{
  kimariteType = "neutral";
  kimariteComment =
    "📊 決まり手は横一線。展開読みが重要な一戦。";
}

  if(maxEV >= 1.3 && escapeAvg >= 55){
    comment =
      `🔥 ${topCourse}コースを軸にイン主導の展開。` +
      `逃げ成立率も高く、堅め決着が濃厚。`;
  }
  else if(attackAvg >= 55){
    comment =
      `⚡ 差し・捲り勢が優勢。` +
      `スタート次第で外から一気の波乱も十分。`;
  }
  else if(profitCount >= 3){
    comment =
      `💰 期待値プラス艇が複数。` +
      `狙い目は分散し、高配当狙いの一戦。`;
  }
  else if(maxEV < 0.9){
    comment =
      `⚠ 決まり手に決定打なく荒れ模様。` +
      `無理な勝負は避けたいレース。`;
  }
  else{
    comment =
      `📊 力関係は拮抗。` +
      `決まり手次第で主導権が入れ替わる展開。`;
  }

  /* ===== 水面・風評価 ===== */
  let waterComment = "";

  if(windSpeedSafe >= 5){
    waterComment = "🌬 強風水面でスタートが乱れやすい。";
  }
  else if(windDirSafe === "向かい" && escapeAvg >= 55){
    waterComment = "🌬 向かい風でインは過信禁物。";
  }
  else if(windDirSafe === "追い" && escapeAvg >= 55){
    waterComment = "🌬 追い風がイン逃げを後押し。";
  }
  else if(waveLevelSafe >= 2){
    waterComment = "🌊 水面が荒れ、差し・捲りが届きやすい。";
  }
  else{
    waterComment = "🌊 水面は比較的安定。";
  }

  /* ===== レース総合判断 ===== */
  let raceJudgement = "";

  if(maxEV >= 1.30 && profitCount >= 2 && windEvalSafe !== "bad"){
    raceJudgement =
      "💰 攻めたい一戦。\n" +
      "期待値・展開ともに噛み合い、本線勝負が可能。";
  }
  else if(maxEV >= 1.10 && profitCount >= 1 && windEvalSafe === "normal"){
    raceJudgement =
      "🤔 判断が分かれる一戦。\n" +
      "決まり手次第で主導権が入れ替わる。";
  }
  else{
    raceJudgement =
      "🚫 手を出しづらいレース。\n" +
      "外的条件の影響が大きく、再現性に欠ける。";
  }

/* ===== コース別記者コメント ===== */
let courseTag = "";
let courseComment = "";

if(topCourse === 1){
  if(escapeAvg >= 55){
    courseTag = "🟢【信頼】";
    courseComment = "1号艇が踏み込めば隊形は即決。イン逃げ濃厚。";
  } else {
    courseTag = "🟡【注意】";
    courseComment = "1号艇が主役も盤石ではない。スタートが鍵。";
  }
}
else if(topCourse <= 3){
  courseTag = "🟡【注意】";
  courseComment =
    `${topCourse}号艇が展開の鍵。` +
    "攻めが決まれば主導権を握る。";
}
else{
  courseTag = "🔴【穴】";
  courseComment =
    `${topCourse}号艇は外枠。` +
    "展開待ちだが一撃がハマれば波乱。";
}

/* ★ 展開コメントに合体 */
comment += "\n\n" + courseTag + courseComment;

  /* ===== 最終出力 ===== */
el.textContent =
  comment +
  "\n" + kimariteComment +
  "\n\n" + raceJudgement +
  "\n" + waterComment;
  
  console.log("analysis updated");


  /* ===== %表示（完全復活） ===== */

  const avgAI = ai.reduce((a,b)=>a + Number(b),0) / ai.length;

  const aiPowerEl = document.getElementById("aiPower");
  const hitRateEl = document.getElementById("hitRate");

  if(aiPowerEl){
    aiPowerEl.textContent = avgAI.toFixed(1) + "%";
  }

  if(hitRateEl){
    hitRateEl.textContent =
      Number(window.hitExpectation).toFixed(1) + "%";
  }
}
// ===============================
// 買い目（重複完全排除）
function updateBets(ai){

  const boxCols = document.querySelectorAll(".bet-col");

  if(!window.expectedValues || !window.realOdds){
    return;
  }

  // ===== 期待値プラス艇のみ抽出 =====
  let plusBoats = [];

  for(let i=0;i<6;i++){
    if(window.profitFlags[i]){
      plusBoats.push({
        course: i+1,
        ai: ai[i],
        odds: Number(window.realOdds[i]),
        ev: window.expectedValues[i]
      });
    }
  }

  // 無ければAI上位2艇を保険
  if(plusBoats.length < 2){

    const sorted = ai
      .map((v,i)=>({course:i+1, ai:v}))
      .sort((a,b)=>b.ai-a.ai)
      .slice(0,2);

    plusBoats = sorted.map(v=>({
      course: v.course,
      ai: v.ai,
      odds: Number(window.realOdds[v.course-1]),
      ev: 1
    }));
  }

  // ===== 組み合わせ生成（三連単） =====
  let combos = [];

  plusBoats.forEach(a=>{
    plusBoats.forEach(b=>{
      plusBoats.forEach(c=>{
        if(a.course!==b.course && b.course!==c.course && a.course!==c.course){

          const evScore =
            (a.ev + b.ev + c.ev) *
            (a.ai/100) *
            (b.ai/100) *
            (c.ai/100);

          combos.push({
            text: `${a.course}-${b.course}-${c.course}`,
            score: evScore
          });

        }
      });
    });
  });

  // ===== 期待値スコア順 =====
  combos.sort((a,b)=>b.score - a.score);

  const best = combos.slice(0,9);

  // ===== UI反映 =====
  boxCols.forEach((col,j)=>{
    const items = col.querySelectorAll(".bet-item");

    items.forEach((el,i)=>{
      el.textContent = best[j*3+i]?.text || "";
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

setTimeout(()=>{
  updateTodayDate();
  console.log("日付更新OK");
},500);

// ===============================
// 出走表API取得（テスト）
// ===============================

function getTodayString(){

  const d = new Date();

  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");

  return `${y}${m}${day}`;
}

/* ===============================
   実オッズ取得（テスト版）
=============================== */

function fetchRealOdds(){

  const url = "https://raw.githubusercontent.com/ta01da27o-arch/boat-race-predictor/refs/heads/main/odds_sample.json";

  fetch(url)
    .then(res => res.json())
    .then(data => {

      // odds配列を保存
      window.realOdds = data.odds || data;

      // 表示
      showOddsOnScreen(window.realOdds);

    })
    .catch(err => {

      showOddsOnScreen(["通信失敗"]);
      console.log("オッズ取得失敗", err);

    });

}

// 初回取得
fetchRealOdds();

/* ===============================
   オッズ表示（簡易UI）
=============================== */

function showOddsOnScreen(odds){

  let box = document.getElementById("oddsBox");

  if(!box){
    box = document.createElement("div");
    box.id = "oddsBox";
    box.style.margin = "12px";
    box.style.padding = "10px";
    box.style.border = "2px solid #333";
    document.getElementById("playerScreen").appendChild(box);
  }

  box.innerHTML = "<h3>実オッズ取得</h3>" +
    odds.map((v,i)=>`<p>${i+1}コース : ${v}</p>`).join("");
}

// 初回取得
window.addEventListener("load", ()=>{
  fetchRealOdds();
});

setTimeout(()=>{
  fetchRealOdds();
},1000);


setTimeout(()=>{

  let box = document.createElement("div");
  box.style.border="3px solid red";
  box.style.padding="10px";
  box.style.margin="10px";
  box.innerHTML="🔥 テスト表示 成功";

  document.body.appendChild(box);

},1000);
