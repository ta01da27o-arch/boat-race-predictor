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

  const barColors = [
    "#ffffff", // 1 白
    "#000000", // 2 黒
    "#e53935", // 3 赤
    "#1e88e5", // 4 青
    "#fdd835", // 5 黄
    "#43a047"  // 6 緑
  ];

  const bgColors = [
    "#ffffff",
    "#e0e0e0",
    "#ffcdd2",
    "#bbdefb",
    "#fff9c4",
    "#c8e6c9"
  ];

  const labels = ["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{

    const box = row.querySelector(".expectation-bar");
    box.innerHTML = "";

    const values = [base[i], predict[i], ai[i]];

    values.forEach((val,idx)=>{

      const line = document.createElement("div");
      line.style.display="flex";
      line.style.alignItems="center";
      line.style.margin="4px 0";

      // ラベル
      const label = document.createElement("div");
      label.textContent = labels[idx];
      label.style.width="45px";
      label.style.fontSize="12px";

      // 背景バー（100%）
      const bg = document.createElement("div");
      bg.style.flex="1";
      bg.style.height="16px";
      bg.style.background = bgColors[i];
      bg.style.position="relative";

      // 実バー（伸縮）
      const bar = document.createElement("div");
      bar.style.height="100%";
      bar.style.width = val + "%";
      bar.style.background = barColors[i];

      const thick = i===0 ? "3px" : "1px";
      bar.style.border = `solid black ${thick}`;
      bar.style.boxSizing="border-box";

      bg.appendChild(bar);

      // %表示
      const percent = document.createElement("div");
      percent.textContent = val + "%";
      percent.style.width="45px";
      percent.style.textAlign="right";
      percent.style.fontSize="12px";
      percent.style.marginLeft="6px";

      line.appendChild(label);
      line.appendChild(bg);
      line.appendChild(percent);

      box.appendChild(line);
    });
  });
}

// ===============================
// 決まり手
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
    text="1コースがスタート優勢。イン主導で安定展開。";
  }
  else if(main<=3){
    text="中枠勢が主導権争い。動きやすい展開。";
  }
  else{
    text="外枠伸び優勢。波乱含み。";
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