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
  const div=document.createElement("div");
  div.className="stadium";
  div.textContent=stadium.name;
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
let currentStadiumIndex=0;

function selectStadium(i){
  currentStadiumIndex=i;
  document.getElementById("stadiumScreen").classList.add("hidden");
  document.getElementById("raceScreen").classList.remove("hidden");
  document.getElementById("raceTitle").textContent=stadiums[i].name;
}

async function selectRace(){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  await calcAllWithJSON(currentStadiumIndex);
}

// ===============================
// JSON連動統合計算
// ===============================
async function calcAllWithJSON(index){

  let data={};

  try{
    const res=await fetch(stadiums[index].file);
    data=await res.json();
  }catch(e){
    console.error(e);
  }

  const trend=data.course_trend || {};
  const motor=data.motor_stats || {};
  const env=data.environment || {};
  const players=data.players || {};
  const feature=data.stadium?.features || {};

  let base=[],predict=[],ai=[];

  for(let i=1;i<=6;i++){

    const trendWin=trend[i]?.win || 10;
    const trendPlace=trend[i]?.place || 20;

    let val = trendWin*0.6 + trendPlace*0.4;

    const motorPower = motor[i] || 30;
    val += (motorPower-30)*0.8;

    const st = players[i]?.avg_st || 0.18;
    val += (0.2-st)*40;

    const rate = players[i]?.win_rate || 5;
    val += (rate-5)*6;

    if(i===1){
      val *= feature.inside_advantage || 1;
    }

    if(env.wind_direction==="追い風"){
      if(i>=4) val+=6;
    }
    if(env.wind_direction==="向かい風"){
      if(i<=2) val+=6;
    }

    base.push(Math.round(val));
    predict.push(Math.round(val*0.95+Math.random()*6));
    ai.push(Math.round(val*1.05+Math.random()*8));
  }

  normalize(base);
  normalize(predict);
  normalize(ai);

  updateExpectationBars(base,predict,ai);
  updateKimariteFromJSON(players);
  updateRaceTypeByAI(ai);
  updateAnalysisAdvanced(ai,data);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);
  updateTrustMeter(ai);
}

// ===============================
function normalize(arr){
  arr.forEach((v,i)=>{
    arr[i]=Math.max(1,Math.min(100,v));
  });
}

// ===============================
// 決まり手(JSON反映)
// ===============================
function updateKimariteFromJSON(players){

  const rows=document.querySelectorAll(".kimarite-row");

  rows.forEach((row,idx)=>{

    const course=Math.floor(idx/4)+1;
    const labels=["逃げ","差され","捲られ","捲差","逃がし","差し","捲り"];

    const type=row.querySelector(".label").textContent;

    let v = players[course]?.kimarite?.[type] || Math.round(10+Math.random()*40);

    row.querySelector(".bar div").style.width=v+"%";
    row.querySelector(".value").textContent=v+"%";
  });
}

// ===============================
// 展開解析（新聞超え）
// ===============================
function updateAnalysisAdvanced(ai,data){

  const order=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const m=order[0],s=order[1],t=order[2];

  const env=data.environment;
  const feat=data.stadium.features;

  let text="";

  if(m.i===1){
    text+=`イン有利水面らしく1コースが主導権濃厚。`;
    if(m.v-s.v>12) text+="スタート決めれば独走態勢も十分。";
    else text+="差し勢の食い下がりが鍵。";
  }
  else if(m.i<=3){
    text+=`${m.i}コースの機力と伸びが目立つ。`;
    text+="一気のまくり攻勢でイン包囲へ。";
  }
  else{
    text+=`外枠勢の伸び足が優勢。`;
    text+="展開ひとつで高配当突入も。";
  }

  if(env.wind_speed>4){
    text+=` 強風気味で隊形乱れやすく波乱含み。`;
  }

  if(feat.inside_advantage>0.7){
    text+=` 水面特性はイン寄り。基本は内中心。`;
  }

  if(s.v-t.v<5){
    text+=` 三着争いは大混戦でヒモ荒れ警戒。`;
  }

  document.querySelector(".analysis-text").textContent=text;
}

// ===============================
// 既存関数（維持）
// ===============================
// updateExpectationBars
// updateRaceTypeByAI
// updateBets
// updateHitRateSimulation
// updateTrustMeter
// （←あなたのコードそのまま機能）

// ===============================
// 日付
// ===============================
function updateTodayDate(){
  const d=new Date();
  const el=document.getElementById("todayDate");
  if(el) el.textContent=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
}
updateTodayDate();
