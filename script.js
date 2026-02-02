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
const courseColors = ["#ffffff","#000000","#ff0000","#0000ff","#ffff00","#00ff00"];

// ===============================
const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");

let currentStadiumIndex = 0;
let currentTrend = [60,50,45,40,35,30]; // デフォルト

// ===============================
// 初期表示
// ===============================
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
// 場選択 → JSON読み込み
// ===============================
async function selectStadium(i){

  currentStadiumIndex=i;

  document.getElementById("stadiumScreen").classList.add("hidden");
  document.getElementById("raceScreen").classList.remove("hidden");

  document.getElementById("raceTitle").textContent=stadiums[i].name;

  try{
    const res = await fetch(`/data/stadiums/${stadiums[i].file}`);
    const data = await res.json();

    // 👉 kiryu.json の trend をそのまま使用
    currentTrend = data.trend;

    console.log("読み込み成功:", data);

  }catch(e){
    console.warn("JSON読み込み失敗 → デフォルト使用", e);
    currentTrend = [60,50,45,40,35,30];
  }
}

// ===============================
function selectRace(){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  calcAllWithTrend();
}

// ===============================
// メイン計算（JSON連動）
// ===============================
function calcAllWithTrend(){

  let base=[], predict=[], ai=[];
  const trend=currentTrend;

  for(let i=0;i<6;i++){

    const courseBias=[18,6,2,-3,-8,-12][i];

    let b=Math.round(45+Math.random()*30+courseBias);
    let p=Math.round(trend[i]+Math.random()*12-6);

    b=Math.max(1,Math.min(100,b));
    p=Math.max(1,Math.min(100,p));

    let a=Math.round(b*0.45+p*0.35+trend[i]*0.2);
    a=Math.max(1,Math.min(100,a));

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
// 総合期待度
// ===============================
function updateExpectationBars(base,predict,ai){

  const labels=["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{

    const box=row.querySelector(".expectation-bar");
    box.innerHTML="";

    [base[i],predict[i],ai[i]].forEach((val,j)=>{

      const c=document.createElement("div");
      c.style.display="flex";
      c.style.alignItems="center";
      c.style.marginBottom="2px";

      const l=document.createElement("span");
      l.textContent=labels[j];
      l.style.width="40px";
      l.style.fontSize="12px";

      const o=document.createElement("div");
      o.style.flex="1";
      o.style.height="14px";
      o.style.border="1px solid #333";
      o.style.background="#ddd";

      const b=document.createElement("div");
      b.style.height="100%";
      b.style.width=val+"%";
      b.style.background=courseColors[i];

      o.appendChild(b);
      c.appendChild(l);
      c.appendChild(o);
      box.appendChild(c);
    });

    row.querySelector(".expectation-value").textContent=ai[i]+"%";
  });
}

// ===============================
function updateKimarite(base){

  document.querySelectorAll(".kimarite-row").forEach((row,i)=>{
    let v=Math.round(base[i%6]*0.85+Math.random()*10);
    v=Math.max(1,Math.min(100,v));
    row.querySelector(".bar div").style.width=v+"%";
    row.querySelector(".value").textContent=v+"%";
  });
}

// ===============================
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

// ===============================
function updateAnalysis(ai){

  const order=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const m=order[0].i;
  const s=order[1].i;
  const t=order[2].i;

  let text="";

  if(m===1){
    text=`1コース主導。${s}が続き${t}が三着争い。`;
  }else if(m<=3){
    text=`${m}コース攻勢。激しい主導権争い。`;
  }else{
    text=`外枠仕掛け波乱含み。高配当注意。`;
  }

  document.querySelector(".analysis-text").textContent=text;
}

// ===============================
function updateBets(ai){

  const s=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const m=s[0].i, sub=s[1].i, t=s[2].i;

  let bets=[
    `${m}-${sub}-${t}`,`${m}-${t}-${sub}`,
    `${sub}-${m}-${t}`,`${sub}-${t}-${m}`,
    `${t}-${m}-${sub}`,`${t}-${sub}-${m}`
  ];

  for(let a=2;a<=6;a++){
    for(let b=2;b<=6;b++){
      if(a!==b) bets.push(`1-${a}-${b}`);
    }
  }

  bets=[...new Set(bets)].slice(0,9);

  document.querySelectorAll(".bet-col").forEach((col,j)=>{
    col.querySelectorAll(".bet-item").forEach((el,i)=>{
      el.textContent=bets[j*3+i]||"";
    });
  });
}

// ===============================
function updateHitRateSimulation(base,predict,ai){

  document.querySelectorAll(".hitrate-row").forEach((row,i)=>{

    let rate=Math.round((base[i]+predict[i]+ai[i])/3);
    rate=Math.max(1,Math.min(100,rate));

    row.querySelector(".hitrate-value").textContent=rate+"%";

    const bar=row.querySelector(".hitrate-bar div");
    bar.style.width=rate+"%";
    bar.style.background=courseColors[i];

    const box=row.querySelector(".hitrate-bar");
    box.style.border="1px solid #333";
    box.style.height="14px";
    box.style.background="#ddd";
  });
}

// ===============================
function updateTrustMeter(ai){

  const max=Math.max(...ai);
  const min=Math.min(...ai);

  let solidity=Math.min(100,Math.round((max-min)*1.5));

  const avg=ai.reduce((a,b)=>a+b,0)/6;

  let variance=Math.min(100,Math.round(
    ai.reduce((s,v)=>s+Math.abs(v-avg),0)/6*1.8
  ));

  let trust=Math.max(0,Math.min(100,Math.round(solidity-variance*0.6)));

  let box=document.getElementById("trustMeter");

  if(!box){
    box=document.createElement("div");
    box.id="trustMeter";
    box.style.margin="16px 10px";
    box.style.padding="12px";
    box.style.border="2px solid #333";
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
// 日付
// ===============================
function updateTodayDate(){
  const n=new Date();
  const el=document.getElementById("todayDate");
  if(el) el.textContent=`${n.getFullYear()}年${n.getMonth()+1}月${n.getDate()}日`;
}
updateTodayDate();