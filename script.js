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
// コース色固定
// ===============================
const courseColors = ["#ffffff","#000000","#ff0000","#0000ff","#ffff00","#00ff00"];

// ===============================
// 初期表示
// ===============================
const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");

stadiums.forEach((name,i)=>{
  const div = document.createElement("div");
  div.className = "stadium";
  div.textContent = name;
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
  document.getElementById("raceTitle").textContent = stadiums[i];
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

  let base=[], predict=[], ai=[];
  const trend = pastTrend[stadiumIndex];

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
  updateBets(ai); // ← 修正版
  updateHitRateSimulation(base,predict,ai);
  updateTrustMeter(ai);
}

// ===============================
// 総合期待度（3本バー＋ラベル固定）
// ===============================
function updateExpectationBars(base,predict,ai){

  const labels=["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{

    const barBox=row.querySelector(".expectation-bar");
    barBox.innerHTML="";

    [base[i],predict[i],ai[i]].forEach((val,j)=>{

      const wrap=document.createElement("div");
      wrap.style.display="flex";
      wrap.style.alignItems="center";
      wrap.style.marginBottom="2px";

      const label=document.createElement("span");
      label.textContent=labels[j];
      label.style.width="40px";
      label.style.fontSize="12px";
      wrap.appendChild(label);

      const outer=document.createElement("div");
      outer.style.flex="1";
      outer.style.height="14px";
      outer.style.border="1px solid #333";
      outer.style.borderRadius="4px";
      outer.style.background="#ddd";

      const bar=document.createElement("div");
      bar.style.height="100%";
      bar.style.width=val+"%";
      bar.style.background=courseColors[i];

      outer.appendChild(bar);
      wrap.appendChild(outer);
      barBox.appendChild(wrap);
    });

    row.querySelector(".expectation-value").textContent=ai[i]+"%";
  });
}

// ===============================
// 決まり手（安定）
// ===============================
function updateKimarite(base){

  document.querySelectorAll(".kimarite-row").forEach((row,i)=>{

    const baseVal=base[i]||0;
    let v=Math.round(baseVal*0.85+Math.random()*10);

    v=Math.max(1,Math.min(100,v));

    const bar=row.querySelector(".bar div");
    const value=row.querySelector(".value");

    if(bar) bar.style.width=v+"%";
    if(value) value.textContent=v+"%";
  });
}

// ===============================
// 展開タイプ
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
// 展開解析（記者風）
// ===============================
function updateAnalysis(ai){

  const order=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

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
// 買い目（修正版・重複なし・逃げ正常）
// ===============================
function updateBets(ai){

  const sorted=ai.map((v,i)=>({v,i:i+1}))
                 .sort((a,b)=>b.v-a.v);

  const a=sorted[0].i;
  const b=sorted[1].i;
  const c=sorted[2].i;

  const rest=[1,2,3,4,5,6].filter(n=>![a,b,c].includes(n));

  const bets=[];

  // 本命
  bets.push(`${a}-${b}-${c}`);
  bets.push(`${a}-${c}-${b}`);
  bets.push(`${b}-${a}-${c}`);

  // 対抗
  bets.push(`${b}-${c}-${a}`);
  bets.push(`${c}-${b}-${a}`);
  bets.push(`${b}-${c}-${rest[0]}`);

  // 逃げ（1固定・重複なし）
  const escape=[a,b,c,...rest].filter(n=>n!==1);

  let i=0;
  while(bets.length<9 && i<escape.length-1){
    if(escape[i]!==escape[i+1]){
      bets.push(`1-${escape[i]}-${escape[i+1]}`);
    }
    i++;
  }

  const unique=[...new Set(bets)].slice(0,9);

  const cols=document.querySelectorAll(".bet-col");

  cols.forEach((col,colIndex)=>{
    const items=col.querySelectorAll(".bet-item");
    items.forEach((el,i)=>{
      el.textContent=unique[colIndex*3+i]||"";
    });
  });
}

// ===============================
// 的中率（1本バー）
// ===============================
function updateHitRateSimulation(base,predict,ai){

  document.querySelectorAll(".hitrate-row").forEach((row,i)=>{

    const rate=Math.round((base[i]+predict[i]+ai[i])/3);

    row.querySelector(".hitrate-value").textContent=rate+"%";

    const bar=row.querySelector(".hitrate-bar div");
    bar.style.width=rate+"%";
    bar.style.background=courseColors[i];

    row.querySelector(".hitrate-bar").style.border="1px solid #333";
    row.querySelector(".hitrate-bar").style.height="14px";
  });
}

// ===============================
// 信頼度メーター
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
