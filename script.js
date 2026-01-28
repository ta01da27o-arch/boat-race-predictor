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
// メイン計算
// ===============================
function calcAll(){

  let base=[];
  let predict=[];
  let ai=[];

  for(let i=0;i<6;i++){
    const b = Math.floor(40+Math.random()*40);
    const p = Math.floor(35+Math.random()*45);
    const a = Math.round(b*0.4 + p*0.6);

    base.push(b);
    predict.push(p);
    ai.push(a);
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
      bar.style.border = (i===0)? "2px solid #000" : "1px solid #000";
      bar.style.boxSizing="border-box";

      const barText = document.createElement("span");
      barText.className="bar-text";
      barText.textContent = val + "%";

      barOuter.appendChild(bar);
      barOuter.appendChild(barText);

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

  const max=Math.max(...ai);
  const min=Math.min(...ai);

  let type="";
  if(inner > middle+10 && inner > outer+15) type="イン逃げ主導型";
  else if(middle > inner && middle > outer) type="中枠攻め合い型";
  else if(outer > inner && outer > middle) type="外伸び波乱型";
  else if(max-min < 8) type="超混戦型";
  else type="バランス型";

  document.getElementById("race-type").textContent =
    "展開タイプ : " + type;
}

// ===============================
// 展開解析
// ===============================
function updateAnalysis(ai){
  const order = ai
    .map((v,i)=>({v,i:i+1}))
    .sort((a,b)=>b.v-a.v);

  const main = order[0].i;
  const sub = order[1].i;

  let text="";
  if(main===1) text="1コースがスタート優勢。イン主導で展開は安定傾向。";
  else if(main<=3) text="中枠勢が主導権争い。展開が動きやすいレース。";
  else text="外枠の伸びが優勢。波乱展開も十分。";

  text += `\n軸候補は ${main}コース。対抗は ${sub}コース。`;

  document.querySelector(".analysis-text").textContent=text;
}

// ===============================
// 買い目（完成版そのまま）
// ===============================
function updateBets(ai){

  const sorted = ai
    .map((v,i)=>({v,i:i+1}))
    .sort((a,b)=>b.v-a.v);

  const main = sorted[0].i;
  const sub  = sorted[1].i;
  const third= sorted[2].i;

  const others = [1,2,3,4,5,6].filter(n=>n!==1);

  const cols = document.querySelectorAll(".bet-col");

  // 本命
  setCol(cols[0],[
    `${main}-${sub}-${third}`,
    `${main}-${third}-${sub}`,
    `${sub}-${main}-${third}`
  ]);

  // 対抗
  setCol(cols[1],[
    `${sub}-${main}-${third}`,
    `${third}-${main}-${sub}`,
    `${sub}-${third}-${main}`
  ]);

  // 逃げ（1頭固定）
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
// 的中率シミュレーション（見出し保持版）
// ===============================
function updateHitRateSimulation(base,predict,ai){

  // ★ sectionではなく listのみ取得（重要）
  const rows = document.querySelectorAll("#hitRateSection .hitrate-row");

  const colors = ["#ffffff","#000000","#ff3333","#3366ff","#ffcc00","#33cc66"];

  rows.forEach((row,i)=>{

    const hitRate = Math.round((base[i]+predict[i]+ai[i])/3);

    const value = row.querySelector(".hitrate-value");
    const bar = row.querySelector(".hitrate-bar div");

    value.textContent = hitRate + "%";
    bar.style.width = hitRate + "%";
    bar.style.background = colors[i];
  });
}