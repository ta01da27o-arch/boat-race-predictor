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
    const courseBias = [18,6,2,-3,-8,-12][i]; // 実戦寄り補正
    let b = Math.round(45 + Math.random()*30 + courseBias);
    let p = Math.round(trend[i] + Math.random()*12 - 6);

    b = Math.min(100, Math.max(1, b));
    p = Math.min(100, Math.max(1, p));

    let a = Math.round(b*0.45 + p*0.35 + trend[i]*0.2);
    a = Math.min(100, Math.max(1, a));

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
// 総合期待度バー（コース色＋ラベル付き）
// ===============================
function updateExpectationBars(base,predict,ai){

  const courseColors=["#ffffff","#ff0000","#0000ff","#ffff00","#00ff00","#ff00ff"];
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
      outer.style.background="#eee";
      outer.style.position="relative";
      outer.style.borderRadius="4px";

      const bar=document.createElement("div");
      bar.style.height="100%";
      bar.style.width=val+"%";
      bar.style.background=courseColors[i];
      bar.style.border="1px solid #000";

      outer.appendChild(bar);
      line.appendChild(label);
      line.appendChild(outer);
      barBox.appendChild(line);
    });

    row.querySelector(".expectation-value").textContent=ai[i]+"%";
  });
}

// ===============================
// 決まり手
// ===============================
function updateKimarite(base){
  const rows = document.querySelectorAll(".kimarite-row");
  rows.forEach((row,i)=>{
    const baseVal = typeof base[i] === "number" ? base[i] : 0;
    let v = Math.round(baseVal*0.85 + Math.random()*10);
    v = Math.min(100, Math.max(0,v));
    const bar = row.querySelector(".bar div");
    const value = row.querySelector(".value");
    if(bar) bar.style.width = v+"%";
    if(value) value.textContent = v+"%";
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
// 展開解析コメント（記者風強化版）
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
  } else if(main<=3){
    text=`${main}コースが攻めて主導権を奪う展開。
${sub}コースが内から抵抗し激しい攻防戦。
${third}コースが展開突いて浮上。
波乱含みのレース展開となりそうだ。`;
  } else {
    text=`外枠勢が果敢に仕掛け主導権争い。
${main}コースのまくり差しが決まる可能性。
${sub}コースが続き高配当も視野。
イン勢は苦戦必至の流れだ。`;
  }
  document.querySelector(".analysis-text").textContent=text;
}

// ===============================
// 買い目（全9点ユニーク版）
// ===============================
function updateBets(ai){
  const sorted = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
  const main = sorted[0].i;
  const sub = sorted[1].i;
  const third = sorted[2].i;
  const allCourses = [1,2,3,4,5,6];
  const usedCombos = new Set();

  // 本命
  let honmei = [`${main}-${sub}-${third}`,`${main}-${third}-${sub}`,`${sub}-${main}-${third}`];
  honmei = honmei.filter(c=>!usedCombos.has(c));
  honmei.forEach(c=>usedCombos.add(c));

  // 対抗
  let taikou=[];
  outerLoop: for(let i=0;i<allCourses.length;i++){
    for(let j=0;j<allCourses.length;j++){
      for(let k=0;k<allCourses.length;k++){
        if(i!==j && j!==k && i!==k){
          const combo=`${allCourses[i]}-${allCourses[j]}-${allCourses[k]}`;
          if(!usedCombos.has(combo)){
            taikou.push(combo);
            usedCombos.add(combo);
            if(taikou.length>=3) break outerLoop;
          }
        }
      }
    }
  }

  // 逃げ（1固定）
  let nige=[];
  outerLoop2: for(let i=1;i<=allCourses.length;i++){
    for(let j=1;j<=allCourses.length;j++){
      if(i!==1 && j!==1 && i!==j){
        const combo=`1-${i}-${j}`;
        if(!usedCombos.has(combo)){
          nige.push(combo);
          usedCombos.add(combo);
          if(nige.length>=3) break outerLoop2;
        }
      }
    }
  }

  const cols=document.querySelectorAll(".bet-col");
  if(cols.length>=3){
    setCol(cols[0], honmei);
    setCol(cols[1], taikou);
    setCol(cols[2], nige);
  }
}
function setCol(col, arr){
  const items = col.querySelectorAll(".bet-item");
  items.forEach((el,i)=>el.textContent=arr[i]||"");
}

// ===============================
// 的中率バー（コース色＋ラベル付き）
// ===============================
function updateHitRateSimulation(base,predict,ai){
  const rows=document.querySelectorAll(".hitrate-row");
  const courseColors=["#ffffff","#ff0000","#0000ff","#ffff00","#00ff00","#ff00ff"];
  rows.forEach((row,i)=>{
    const rate=Math.round((base[i]+predict[i]+ai[i])/3);
    const val=row.querySelector(".hitrate-value");
    const outer=row.querySelector(".hitrate-bar");
    const bar=outer.querySelector("div");
    val.textContent=rate+"%";
    outer.style.border="1px solid #333";
    outer.style.background="#eee";
    outer.style.height="14px";
    bar.style.width=rate+"%";
    bar.style.background=courseColors[i];
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
  let variance=Math.round(ai.reduce((s,v)=>s+Math.abs(v-avg),0)/6*1.8);
  solidity=Math.min(100,solidity);
  variance=Math.min(100,variance);
  let trust=Math.round(solidity - variance*0.6);
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
