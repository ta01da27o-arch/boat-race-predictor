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
const stadiumGrid=document.querySelector(".stadium-grid");
const raceGrid=document.querySelector(".race-grid");

stadiums.forEach((s,i)=>{
  const d=document.createElement("div");
  d.className="stadium";
  d.textContent=s.name;
  d.onclick=()=>selectStadium(i);
  stadiumGrid.appendChild(d);
});

for(let i=1;i<=12;i++){
  const d=document.createElement("div");
  d.className="race";
  d.textContent=i+"R";
  d.onclick=()=>selectRace(i);
  raceGrid.appendChild(d);
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
// JSON連動メイン
// ===============================
async function calcAllWithJSON(stadiumIndex){

  const file=stadiums[stadiumIndex].file;
  let jsonData={};

  try{
    const r=await fetch(file);
    jsonData=await r.json();
  }catch(e){
    console.error(e);
  }

  let base=jsonData.base||[50,50,50,50,50,50];
  let predict=jsonData.predict||[50,50,50,50,50,50];
  let ai=jsonData.ai||[50,50,50,50,50,50];

  // =====================================================
  // ✅ ここから最小追加ロジック（既存を壊さない）
  // =====================================================

  const features=jsonData.stadium?.features||{};
  const env=jsonData.environment||{};
  const motors=jsonData.motor_stats||{};

  // コース特徴補正（イン有利）
  if(features.inside_advantage){
    ai[0]+=features.inside_advantage*10;
  }

  // 天候・風補正
  if(env.wind_direction==="追い風"){
    ai[0]+=5;
    ai[1]+=3;
  }
  if(env.wind_direction==="向かい風"){
    ai[4]+=4;
    ai[5]+=5;
  }

  if(env.wind_speed>5){
    ai.forEach((v,i)=>ai[i]-=3);
  }

  // モーター評価加算
  for(let i=1;i<=6;i++){
    if(motors[i]){
      ai[i-1]+=motors[i]*0.2;
    }
  }

  // 上限補正
  ai=ai.map(v=>Math.max(1,Math.min(100,Math.round(v))));

  // =====================================================

  updateExpectationBars(base,predict,ai);
  updateKimarite(base);
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);
  updateTrustMeter(ai);
}

// ===============================
// 以下はあなたの既存コード完全維持
// ===============================

function updateExpectationBars(base,predict,ai){
  const labels=["実績","予測","AI"];
  document.querySelectorAll(".expectation-row").forEach((row,i)=>{
    const barBox=row.querySelector(".expectation-bar");
    barBox.innerHTML="";
    [base[i],predict[i],ai[i]].forEach((val,j)=>{
      const c=document.createElement("div");
      c.style.display="flex";
      c.style.alignItems="center";
      c.style.marginBottom="2px";

      const l=document.createElement("span");
      l.textContent=labels[j];
      l.style.width="40px";
      l.style.fontSize="12px";
      l.style.marginRight="6px";

      const o=document.createElement("div");
      o.style.flex="1";
      o.style.height="14px";
      o.style.border="1px solid #333";
      o.style.borderRadius="4px";
      o.style.background="#ddd";

      const b=document.createElement("div");
      b.style.height="100%";
      b.style.width=val+"%";
      b.style.background=courseColors[i];

      o.appendChild(b);
      c.appendChild(l);
      c.appendChild(o);
      barBox.appendChild(c);
    });
    row.querySelector(".expectation-value").textContent=ai[i]+"%";
  });
}

function updateKimarite(base){
  document.querySelectorAll(".kimarite-row").forEach((row,i)=>{
    let v=Math.round(base[i]*0.85+Math.random()*10);
    v=Math.max(1,Math.min(100,v));
    row.querySelector(".bar div").style.width=v+"%";
    row.querySelector(".value").textContent=v+"%";
  });
}

function updateRaceTypeByAI(ai){
  const inner=ai[0];
  const middle=(ai[1]+ai[2]+ai[3])/3;
  const outer=(ai[4]+ai[5])/2;
  let type="";
  if(inner>middle+10&&inner>outer+15) type="イン逃げ主導型";
  else if(middle>inner&&middle>outer) type="中枠攻め合い型";
  else if(outer>inner&&outer>middle) type="外伸び波乱型";
  else if(Math.max(...ai)-Math.min(...ai)<8) type="超混戦型";
  else type="バランス型";
  document.getElementById("race-type").textContent="展開タイプ : "+type;
}

function updateAnalysis(ai){
  const s=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
  const m=s[0],s2=s[1],s3=s[2];
  let t="";
  if(m.i===1){
    t+=(m.v-s2.v>15)?"インが完全主導権。逃げ切り濃厚。":"イン先手も攻防激化。";
  }else if(m.i<=3){
    t+=(m.v-s2.v>12)?`${m.i}コース攻め切り濃厚。`:"中枠拮抗スタート勝負。";
  }else{
    t+=(m.v-s2.v>10)?`${m.i}コース外伸び波乱。`:"外枠も互角。";
  }
  t+=(s2.v-s3.v<5)?" 三着荒れ注意。":` 三着は${s3.i}優勢。`;
  document.querySelector(".analysis-text").textContent=t;
}

function updateBets(ai){
  const s=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
  const main=s[0].i,sub=s[1].i,third=s[2].i;
  const all=[1,2,3,4,5,6];
  let bets=[
    `${main}-${sub}-${third}`,
    `${main}-${third}-${sub}`,
    `${sub}-${main}-${third}`,
    `${sub}-${third}-${main}`,
    `${third}-${main}-${sub}`,
    `${third}-${sub}-${main}`
  ];
  all.forEach(a=>{
    all.forEach(b=>{
      if(a!==1&&b!==1&&a!==b) bets.push(`1-${a}-${b}`);
    });
  });
  bets=[...new Set(bets)].slice(0,9);
  const cols=document.querySelectorAll(".bet-col");
  cols.forEach((col,j)=>{
    col.querySelectorAll(".bet-item").forEach((el,i)=>{
      el.textContent=bets[j*3+i]||"";
    });
  });
}

function updateHitRateSimulation(base,predict,ai){
  document.querySelectorAll(".hitrate-row").forEach((row,i)=>{
    let r=Math.round((base[i]+predict[i]+ai[i])/3);
    r=Math.max(1,Math.min(100,r));
    row.querySelector(".hitrate-value").textContent=r+"%";
    const bar=row.querySelector(".hitrate-bar div");
    bar.style.width=r+"%";
    bar.style.background=courseColors[i];
  });
}

function updateTrustMeter(ai){
  const max=Math.max(...ai);
  const min=Math.min(...ai);
  let solidity=Math.round((max-min)*1.5);
  const avg=ai.reduce((a,b)=>a+b,0)/6;
  let variance=Math.round(ai.reduce((s,v)=>s+Math.abs(v-avg),0)/6*1.8);
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

function updateTodayDate(){
  const n=new Date();
  const el=document.getElementById("todayDate");
  if(el) el.textContent=`${n.getFullYear()}年${n.getMonth()+1}月${n.getDate()}日`;
}
updateTodayDate();
