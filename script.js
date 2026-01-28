// ===============================
// 24場名（正式）
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

function selectRace(r){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  calcAll();
}

// ===============================
// メイン計算（B②組み込み）
// ===============================
function calcAll(){

  let base=[];
  let predict=[];
  let ai=[];

  for(let i=0;i<6;i++){
    const b = Math.floor(40+Math.random()*40);
    const p = Math.floor(35+Math.random()*45);

    base.push(b);
    predict.push(p);
  }

  // ===== 学習風レース傾向判定 =====
  const tempAI = base.map((b,i)=>Math.round(b*0.4 + predict[i]*0.6));

  const max = Math.max(...tempAI);
  const min = Math.min(...tempAI);

  let mode = "normal";

  if(tempAI[0] > max - 5) mode = "solid";       // 堅め
  else if(max - min < 10) mode = "rough";       // 荒れ
  else mode = "normal";                         // 標準

  let wBase, wPredict;

  if(mode === "solid"){
    wBase = 0.5;
    wPredict = 0.3;
  }
  else if(mode === "rough"){
    wBase = 0.25;
    wPredict = 0.55;
  }
  else{
    wBase = 0.35;
    wPredict = 0.45;
  }

  // ===== 重み調整後AI算出 =====
  for(let i=0;i<6;i++){
    const val = Math.round(base[i]*wBase + predict[i]*wPredict);
    ai.push(val);
  }

  updateExpectationBars(base,predict,ai);
  updateKimarite();
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);
}

// ===============================
// 総合期待度
// ===============================
function updateExpectationBars(base,predict,ai){

  const colors = [
    "#ffffff",
    "#000000",
    "#ff3333",
    "#3366ff",
    "#ffcc00",
    "#33cc66"
  ];

  const japaneseLabels = ["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{
    const barBox = row.querySelector(".expectation-bar");
    barBox.innerHTML="";

    const values = [base[i], predict[i], ai[i]];

    values.forEach((val,j)=>{
      const line=document.createElement("div");
      line.className="bar-line";

      const label = document.createElement("span");
      label.className="bar-label";
      label.textContent = japaneseLabels[j];

      const barOuter=document.createElement("div");
      barOuter.style.flex="1";
      barOuter.style.height="14px";
      barOuter.style.border = "1px solid #333";
      barOuter.style.background = getLightColor(i);
      barOuter.style.position="relative";
      barOuter.style.borderRadius="4px";

      const bar=document.createElement("div");
      bar.style.height="100%";
      bar.style.width=val+"%";
      bar.style.background=colors[i];
      bar.style.border="1px solid #000";
      bar.style.boxSizing="border-box";

      barOuter.appendChild(bar);

      line.appendChild(label);
      line.appendChild(barOuter);
      barBox.appendChild(line);
    });

    row.querySelector(".expectation-value").textContent = ai[i] + "%";
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
    const v = Math.floor(10 + Math.random()*75);
    row.querySelector(".bar div").style.width = v + "%";
    row.querySelector(".value").textContent = v + "%";
  });
}

// ===============================
// 展開タイプ
// ===============================
function updateRaceTypeByAI(ai){

  const inner = ai[0];
  const middle = (ai[1]+ai[2]+ai[3])/3;
  const outer = (ai[4]+ai[5])/2;

  let type="";

  if(inner > middle+10) type="イン逃げ主導型";
  else if(middle > inner && middle > outer) type="中枠攻め合い型";
  else if(outer > inner) type="外伸び波乱型";
  else type="バランス型";

  document.getElementById("race-type").textContent =
    "展開タイプ : " + type;
}

// ===============================
// 展開解析
// ===============================
function updateAnalysis(ai){

  const order = ai.map((v,i)=>({v,i:i+1}))
                 .sort((a,b)=>b.v-a.v);

  const main = order[0].i;
  const sub  = order[1].i;

  let text="";

  if(main===1)
    text="1コース主導で堅めの流れになりやすい展開。";
  else if(main<=3)
    text="中枠勢の仕掛けが鍵を握る展開。";
  else
    text="外枠の伸び次第で波乱含み。";

  text += `\n軸候補は ${main}コース、対抗は ${sub}コース。`;

  document.querySelector(".analysis-text").textContent=text;
}

// ===============================
// 買い目（完成版維持）
// ===============================
function updateBets(ai){

  const sorted = ai
    .map((v,i)=>({v,i:i+1}))
    .sort((a,b)=>b.v-a.v);

  const main = sorted[0].i;
  const sub  = sorted[1].i;
  const third= sorted[2].i;

  const others = [2,3,4,5,6];

  const cols = document.querySelectorAll(".bet-col");

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
    el.textContent = arr[i] || "";
  });
}

// ===============================
// 的中率シミュレーション（横並び版）
// ===============================
function updateHitRateSimulation(base,predict,ai){

  const rows = document.querySelectorAll("#hitRateSection .hitrate-row");

  const colors = ["#ffffff","#000000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const lightColors = ["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];

  rows.forEach((row,i)=>{

    row.style.display="flex";
    row.style.alignItems="center";

    const hitRate = Math.round((base[i]+predict[i]+ai[i])/3);

    const value = row.querySelector(".hitrate-value");
    const barOuter = row.querySelector(".hitrate-bar");
    const bar = row.querySelector(".hitrate-bar div");

    value.textContent = hitRate + "%";
    value.style.width="60px";
    value.style.textAlign="right";
    value.style.marginRight="8px";

    barOuter.style.flex="1";
    barOuter.style.height="14px";
    barOuter.style.border="1px solid #333";
    barOuter.style.background=lightColors[i];
    barOuter.style.borderRadius="4px";

    bar.style.height="100%";
    bar.style.width=hitRate+"%";
    bar.style.background=colors[i];
  });
}