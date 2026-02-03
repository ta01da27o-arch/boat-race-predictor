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
const courseColors = ["#ffffff","#000000","#ff0000","#0000ff","#ffff00","#00ff00"];

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

  // ===============================
  // ✅ モーター補正（NaN完全防止版）
  // ===============================
  const motors = jsonData.motor_stats || {};

  for(let i=1;i<=6;i++){
    if(typeof motors[i] === "number"){
      ai[i-1] += motors[i] * 0.2;
    }
  }
  // ===============================

  updateExpectationBars(base,predict,ai);
  updateKimarite(base);
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);
  updateTrustMeter(ai);
}

// ===============================
// 総合期待度
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
function updateKimarite(base){
  const rows = document.querySelectorAll(".kimarite-row");
  rows.forEach((row,i)=>{
    const baseVal = base[i] || 0;
    let v = Math.round(baseVal*0.85 + Math.random()*10);
    v = Math.max(1,Math.min(100,v));
    row.querySelector(".bar div").style.width = v + "%";
    row.querySelector(".value").textContent = v + "%";
  });
}

// ===============================
function updateRaceTypeByAI(ai){

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
function updateAnalysis(ai){

  const sorted = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const main = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  const gap12 = main.v - second.v;
  const gap23 = second.v - third.v;

  let text="";

  if(main.i===1){
    if(gap12>15) text+="インが完全主導権。逃げ切り濃厚で相手探しの一戦。";
    else text+="インが先手も後続迫る。差し・まくりの攻防に注目。";
  }
  else if(main.i<=3){
    if(gap12>12) text+=`${main.i}コースの攻め鋭く、一気のまくり主体。`;
    else text+="中枠勢拮抗でスタート勝負。";
  }
  else{
    if(gap12>10) text+=`${main.i}コースの外伸び強烈で波乱含み。`;
    else text+="外枠勢も互角で混戦。";
  }

  if(gap12<6) text+=` 相手争い激戦で${second.i}コース中心。`;
  else text+=` 相手筆頭は${second.i}コース。`;

  if(gap23<5) text+=" 三着はヒモ荒れ注意。";
  else text+=` 三着候補は${third.i}コース優勢。`;

  if(main.v>75 && gap12>12) text+=" 堅め決着濃厚。";
  else if(Math.max(...ai)-Math.min(...ai)<10) text+=" 大波乱警戒。";
  else text+=" 本命中心だが波乱余地あり。";

  document.querySelector(".analysis-text").textContent=text;
}

// ===============================
function updateBets(ai){

  const sorted = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const main = sorted[0].i;
  const sub = sorted[1].i;
  const third = sorted[2].i;

  const all=[1,2,3,4,5,6];
  let bets=[];

  bets.push(`${main}-${sub}-${third}`);
  bets.push(`${main}-${third}-${sub}`);
  bets.push(`${sub}-${main}-${third}`);
  bets.push(`${sub}-${third}-${main}`);
  bets.push(`${third}-${main}-${sub}`);
  bets.push(`${third}-${sub}-${main}`);

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
      el.textContent=bets[j*3+i]||"";
    });
  });
}

// ===============================
function updateHitRateSimulation(base,predict,ai){

  const rows=document.querySelectorAll(".hitrate-row");

  rows.forEach((row,i)=>{

    let rate=Math.round((base[i]+predict[i]+ai[i])/3);
    rate=Math.max(1,Math.min(100,rate));

    row.querySelector(".hitrate-value").textContent=rate+"%";

    const bar=row.querySelector(".hitrate-bar div");
    bar.style.width=rate+"%";
    bar.style.background=courseColors[i];

    const container=row.querySelector(".hitrate-bar");
    container.style.border="1px solid #333";
    container.style.height="14px";
    container.style.borderRadius="4px";
    container.style.background="#ddd";
  });
}

// ===============================
function updateTrustMeter(ai){

  const max=Math.max(...ai);
  const min=Math.min(...ai);

  let solidity=Math.round((max-min)*1.5);

  const avg=ai.reduce((a,b)=>a+b,0)/6;

  let variance=Math.round(
    ai.reduce((s,v)=>s+Math.abs(v-avg),0)/6*1.8
  );

  solidity=Math.min(100,solidity);
  variance=Math.min(100,variance);

  let trust=Math.round(solidity-variance*0.6);
  trust=Math.max(0,Math.min(100,trust));

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
    <h2>信頼度メーター</h2>
    <p>堅さスコア：${solidity}</p>
    <p>荒れ指数：${variance}</p>
    <p><strong>総合信頼度：${trust}%</strong></p>
  `;
}

// ===============================
function updateTodayDate(){

  const now=new Date();

  const y=now.getFullYear();
  const m=now.getMonth()+1;
  const d=now.getDate();

  const el=document.getElementById("todayDate");

  if(el) el.textContent=`${y}年${m}月${d}日`;
}

updateTodayDate();
