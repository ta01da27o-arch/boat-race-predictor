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
  updateHitRate(ai);  // ← 新規的中率シミュレーション
}

// ===============================
// 総合期待度（完成仕様）
// ===============================
function updateExpectationBars(base,predict,ai){

  const colors = [
    "#ffffff", // 1コース 白
    "#eee",    // 2 薄グレー
    "#ffe5e5", // 3 薄赤
    "#e5f0ff", // 4 薄青
    "#fff7cc", // 5 薄黄
    "#e5ffe5"  // 6 薄緑
  ];

  const barColors = [
    "#ffffff", // 1バー 白
    "#000000", // 2バー 黒
    "#ff3333", // 3バー 赤
    "#3366ff", // 4バー 青
    "#ffcc00", // 5バー 黄
    "#33cc66"  // 6バー 緑
  ];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{

    const barBox = row.querySelector(".expectation-bar");
    barBox.innerHTML="";

    const makeLine=(val,className)=>{
      const line = document.createElement("div");
      line.style.display="flex";
      line.style.alignItems="center";
      line.style.gap="4px";

      const barOuter=document.createElement("div");
      barOuter.style.flex="1";
      barOuter.style.height="12px";
      barOuter.style.background=colors[i];
      barOuter.style.border=i===0 ? "2px solid #000" : "1px solid #333";
      barOuter.style.borderRadius="4px";
      barOuter.style.position="relative";

      const bar=document.createElement("div");
      bar.style.width = val+"%";
      bar.style.height="100%";
      bar.style.background = barColors[i];
      bar.className=className;

      barOuter.appendChild(bar);
      line.appendChild(barOuter);

      // 右端数値
      const text = document.createElement("span");
      text.textContent = val+"%";
      text.style.width="40px";
      text.style.textAlign="right";
      text.style.fontWeight="bold";
      line.appendChild(text);

      return line;
    };

    barBox.appendChild(makeLine(base[i],"attack-base"));
    barBox.appendChild(makeLine(predict[i],"attack-predict"));
    barBox.appendChild(makeLine(ai[i],"attack-ai"));
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

// ===============================
// 的中率シミュレーション
// ===============================
function updateHitRate(ai){

  // HTMLにセクション作成（初回のみ）
  let section = document.getElementById("hitRateSection");
  if(!section){
    section = document.createElement("section");
    section.id="hitRateSection";
    section.innerHTML="<h2>的中率シミュレーション</h2><div id='hitRateText'></div>";
    document.getElementById("playerScreen").appendChild(section);
  }

  const trials = 1000;
  let hit1 = 0, hit2 = 0, hit3 = 0;

  // 簡易モンテカルロ
  for(let t=0;t<trials;t++){
    const pool = [1,2,3,4,5,6];
    const probs = ai.map(v=>v/ai.reduce((a,b)=>a+b,0));
    const finish = [];

    while(finish.length<3){
      const r = Math.random();
      let sum=0;
      for(let i=0;i<pool.length;i++){
        sum+=probs[pool[i]-1];
        if(r<=sum){
          finish.push(pool[i]);
          pool.splice(i,1);
          break;
        }
      }
    }

    // 軸1着的中チェック
    if(finish[0]===1) hit1++;
    if(finish[1]===2) hit2++;
    if(finish[2]===3) hit3++;
  }

  const textDiv = document.getElementById("hitRateText");
  textDiv.innerHTML = `
    1着 1コース: ${(hit1/trials*100).toFixed(1)}%<br>
    2着 2コース: ${(hit2/trials*100).toFixed(1)}%<br>
    3着 3コース: ${(hit3/trials*100).toFixed(1)}%
  `;
}