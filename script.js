// ===============================
// 24場名 + JSONファイル紐付け
// ===============================
const stadiums = [
  { name:"桐生", file:"data/stadiums/kiryu.json" },
  { name:"戸田", file:"data/stadiums/toda.json" },
  { name:"江戸川", file:"data/stadiums/edogawa.json" },
  { name:"平和島", file:"data/stadiums/heiwajima.json" },
  { name:"多摩川", file:"data/stadiums/tamagawa.json" },
  { name:"浜名湖", file:"data/stadiums/hamanako.json" },
  { name:"蒲郡", file:"data/stadiums/gamagori.json" },
  { name:"常滑", file:"data/stadiums/tokoname.json" },
  { name:"津", file:"data/stadiums/tsu.json" },
  { name:"三国", file:"data/stadiums/mikuni.json" },
  { name:"びわこ", file:"data/stadiums/biwako.json" },
  { name:"住之江", file:"data/stadiums/suminoe.json" },
  { name:"尼崎", file:"data/stadiums/amagasaki.json" },
  { name:"鳴門", file:"data/stadiums/naruto.json" },
  { name:"丸亀", file:"data/stadiums/marugame.json" },
  { name:"児島", file:"data/stadiums/kojima.json" },
  { name:"宮島", file:"data/stadiums/miyajima.json" },
  { name:"徳山", file:"data/stadiums/tokuyama.json" },
  { name:"下関", file:"data/stadiums/shimonoseki.json" },
  { name:"若松", file:"data/stadiums/wakamatsu.json" },
  { name:"芦屋", file:"data/stadiums/ashiya.json" },
  { name:"福岡", file:"data/stadiums/fukuoka.json" },
  { name:"唐津", file:"data/stadiums/karatsu.json" },
  { name:"大村", file:"data/stadiums/omura.json" }
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

async function selectRace(i){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  await calcAllWithJSON(currentStadiumIndex);
}

// ===============================
// JSON連動メイン計算
// ===============================
async function calcAllWithJSON(stadiumIndex){

  const file = stadiums[stadiumIndex].file;
  let jsonData = [];

  try{
    const resp = await fetch(file);
    jsonData = await resp.json();
  }catch(e){
    console.error("JSON取得エラー:", e);
  }

  const base = jsonData.base || [50,50,50,50,50,50];
  const predict = jsonData.predict || [50,50,50,50,50,50];
  const ai = jsonData.ai || [50,50,50,50,50,50];

  updateExpectationBars(base,predict,ai);
  updateKimarite(base);
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);
  updateTrustMeter(ai);
}
// ===============================
  // 追加ロジック① 天候カーブ補正
  // ===============================
  const weather = jsonData.weather || {
    wind: 0,
    wave: 0,
    rain: 0
  };

  const weatherCurve = (v)=>{
    return Math.sign(v) * Math.pow(Math.abs(v),1.3);
  };

  const windEffect = weatherCurve(weather.wind) * 0.8;
  const waveEffect = weatherCurve(weather.wave) * 0.6;
  const rainEffect = weatherCurve(weather.rain) * 0.4;

  // ===============================
  // 追加ロジック② コース特徴補正
  // ===============================
  const courseFeature = jsonData.courseFeature || [
    1.12, // 1コース有利
    1.05,
    1.00,
    0.97,
    0.94,
    0.90
  ];

  // ===============================
  // 追加ロジック③ 過去平均との差分補正
  // ===============================
  const pastAvg = jsonData.pastAvg || [50,50,50,50,50,50];

  // ===============================
  // AIへ統合反映（既存AIを壊さず加算）
  // ===============================
  for(let i=0;i<6;i++){

    // 天候は外ほど影響大
    const weatherPower = (i+1)/6;

    ai[i] =
      ai[i]
      * courseFeature[i]
      + (windEffect + waveEffect + rainEffect) * weatherPower
      + (ai[i] - pastAvg[i]) * 0.6;

    // 安全ガード
    if(isNaN(ai[i])) ai[i]=50;

    ai[i] = Math.round(Math.max(1,Math.min(100,ai[i])));
  }
  // ===============================
  // 追加ロジック④ モーター評価反映
  // ===============================
  const motor = jsonData.motor || [50,50,50,50,50,50];

  for(let i=0;i<6;i++){
    const motorBoost = (motor[i] - 50) * 0.35;
    ai[i] = ai[i] + motorBoost;
  }

  // ===============================
  // 追加ロジック⑤ 全体バランス正規化
  // ===============================
  let sum = ai.reduce((a,b)=>a+b,0);

  if(sum > 0){
    const targetTotal = 300; // 平均50×6を基準に収束

    for(let i=0;i<6;i++){
      ai[i] = ai[i] / sum * targetTotal;
    }
  }

  // ===============================
  // 追加ロジック⑥ 最終ガード処理
  // ===============================
  for(let i=0;i<6;i++){

    if(isNaN(ai[i]) || !isFinite(ai[i])){
      ai[i] = 50;
    }

    ai[i] = Math.round(ai[i]);

    if(ai[i] < 1) ai[i] = 1;
    if(ai[i] > 100) ai[i] = 100;
  }