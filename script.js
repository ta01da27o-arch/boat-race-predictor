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
}

// ===============================
// 総合期待度（完成仕様）
// ===============================
function updateExpectationBars(base,predict,ai){

  const colors = [
    "#ffffff", // 1コース 白
    "#000000", // 2 黒
    "#e53935", // 3 赤
    "#1e88e5", // 4 青
    "#fdd835", // 5 黄
    "#43a047"  // 6 緑
  ];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{

    const barBox = row.querySelector(".expectation-bar");
    barBox.innerHTML="";

    const makeLine=(val)=>{

      const line=document.createElement("div");
      line.style.display="flex";
      line.style.alignItems="center";
      line.style.margin="4px 0";

      const barOuter=document.createElement("div");
      barOuter.style.flex="1";
      barOuter.style.height="14px";
      barOuter.style.border = i===0 ? "3px solid #000" : "1px solid #333";
      barOuter.style.background="#eee";
      barOuter.style.position="relative";

      const bar=document.createElement("div");
      bar.style.height="100%";
      bar.style.width=val+"%";
      bar.style.background=colors[i];

      barOuter.appendChild(bar);
      line.appendChild(barOuter);

      return line;
    };

    barBox.appendChild(makeLine(base[i]));
    barBox.appendChild(makeLine(predict[i]));
    barBox.appendChild(makeLine(ai[i]));

    row.querySelector(".expectation-value").textContent = ai[i] + "%";
  });
}

// ===============================
// 決まり手（安全）
// ===============================
function updateKimarite(){

  document.querySelectorAll(".kimarite-row").forEach(row=>{

    const v = Math.floor(10 + Math.random()*75);

    const bar = row.querySelector(".bar div");
    const val = row.querySelector(".value");

    bar.style.width = v + "%";
    val.textContent = v + "%";
  });
}

// ===============================
// 展開タイプAI
// ===============================
function updateRaceTypeByAI(ai){

  const inner = ai[0];
  const middle = (ai[1]+ai[2]+ai[3])/3;
  const outer = (ai[4]+ai[5])/2;

  const max=Math.max(...ai);
  const min=Math.min(...ai);

  let type="";

  if(inner > middle+10 && inner > outer+15){
    type="イン逃げ主導型";
  }
  else if(middle > inner && middle > outer){
    type="中枠攻め合い型";
  }
  else if(outer > inner && outer > middle){
    type="外伸び波乱型";
  }
  else if(max-min < 8){
    type="超混戦型";
  }
  else{
    type="バランス型";
  }

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

  if(main===1){
    text="1コースがスタート優勢。イン主導で展開は安定傾向。";
  }
  else if(main<=3){
    text="中枠勢が主導権争い。展開が動きやすいレース。";
  }
  else{
    text="外枠の伸びが優勢。波乱展開も十分。";
  }

  text += `\n軸候補は ${main}コース。対抗は ${sub}コース。`;

  document.querySelector(".analysis-text").textContent=text;
}

// ===============================
// 買い目生成
// ===============================
function updateBets(ai){

  const order = ai
    .map((v,i)=>({v,i:i+1}))
    .sort((a,b)=>b.v-a.v);

  const main = order[0].i;
  const sub = order[1].i;
  const third = order[2].i;

  const cols = document.querySelectorAll(".bet-col");

  setCol(cols[0],[
    `${main}-${sub}-${third}`,
    `${main}-${third}-${sub}`,
    `${sub}-${main}-${third}`
  ]);

  setCol(cols[1],[
    `${sub}-${third}-${main}`,
    `${sub}-${main}-${third}`,
    `${third}-${sub}-${main}`
  ]);

  setCol(cols[2],[
    `1-${sub}-${third}`,
    `1-${third}-${sub}`,
    `1-${sub}-${main}`
  ]);
}

function setCol(col,arr){
  const items = col.querySelectorAll(".bet-item");
  items.forEach((el,i)=>{
    el.textContent = arr[i] || "";
  });
}