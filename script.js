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

  const colors=["#ffffff","#000000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const labels=["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{
    const box=row.querySelector(".expectation-bar");
    box.innerHTML="";

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
      outer.style.background=getLightColor(i);
      outer.style.position="relative";
      outer.style.borderRadius="4px";

      const bar=document.createElement("div");
      bar.style.height="100%";
      bar.style.width=val+"%";
      bar.style.background=colors[i];
      bar.style.border="1px solid #000";
      bar.style.boxSizing="border-box";

      const text=document.createElement("span");
      text.className="bar-text";
      text.textContent=val+"%";

      outer.appendChild(bar);
      outer.appendChild(text);

      line.appendChild(label);
      line.appendChild(outer);
      box.appendChild(line);
    });

    row.querySelector(".expectation-value").textContent=ai[i]+"%";
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
    const v=Math.floor(10+Math.random()*75);
    row.querySelector(".bar div").style.width=v+"%";
    row.querySelector(".value").textContent=v+"%";
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
  if(inner>middle+10 && inner>outer+15) type="イン逃げ主導型";
  else if(middle>inner && middle>outer) type="中枠攻め合い型";
  else if(outer>inner && outer>middle) type="外伸び波乱型";
  else type="バランス型";

  document.getElementById("race-type").textContent="展開タイプ : "+type;
}

// ===============================
// 展開解析
// ===============================
function updateAnalysis(ai){

  const sorted=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const main=sorted[0].i;
  const sub=sorted[1].i;

  let text="";
  if(main===1) text="1コースが主導権。イン優勢展開。";
  else if(main<=3) text="中枠主導で混戦傾向。";
  else text="外枠優勢で波乱含み。";

  text+=`\n軸候補 ${main} 対抗 ${sub}`;

  document.querySelector(".analysis-text").textContent=text;
}

// ===============================
// 買い目（完全分離ロジック）
// ===============================
function updateBets(ai){

  const order=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const a1=order[0].i;
  const a2=order[1].i;
  const a3=order[2].i;
  const a4=order[3].i;

  // --- 本命 ---
  const mainBets=[
    `${a1}-${a2}-${a3}`,
    `${a1}-${a3}-${a2}`,
    `${a2}-${a1}-${a3}`
  ];

  // --- 対抗 ---
  const subBets=[
    `${a2}-${a1}-${a4}`,
    `${a2}-${a4}-${a1}`,
    `${a3}-${a2}-${a1}`
  ];

  // --- 逃げ（1固定） ---
  let escapeTargets=[a1,a2,a3,a4,a5=order[4].i,a6=order[5].i]
    .filter(n=>n!==1);

  const e1=escapeTargets[0];
  const e2=escapeTargets[1];

  const escapeBets=[
    `1-${e1}-${e2}`,
    `1-${e2}-${e1}`,
    `1-${escapeTargets[2]}-${e1}`
  ];

  const cols=document.querySelectorAll(".bet-col");

  setCol(cols[0],mainBets);
  setCol(cols[1],subBets);
  setCol(cols[2],escapeBets);
}

function setCol(col,arr){
  const items=col.querySelectorAll(".bet-item");
  items.forEach((el,i)=>el.textContent=arr[i]||"");
}

// ===============================
// 的中率シュミレーション
// ===============================
function updateHitRateSimulation(base,predict,ai){

  const container=document.getElementById("hitRateSection");
  if(!container) return;

  container.innerHTML="";

  const colors=["#ffffff","#000000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const light=["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];

  for(let i=0;i<6;i++){

    const row=document.createElement("div");
    row.className="hitrate-row";
    row.style.display="flex";
    row.style.alignItems="center";
    row.style.marginBottom="6px";

    const label=document.createElement("span");
    label.style.width="26px";
    label.style.textAlign="right";
    label.style.marginRight="10px";
    label.textContent=(i+1);

    const outer=document.createElement("div");
    outer.style.flex="1";
    outer.style.height="14px";
    outer.style.border="1px solid #333";
    outer.style.background=light[i];
    outer.style.position="relative";
    outer.style.borderRadius="4px";

    const rate=Math.round((base[i]+predict[i]+ai[i])/3);

    const bar=document.createElement("div");
    bar.style.height="100%";
    bar.style.width=rate+"%";
    bar.style.background=colors[i];
    bar.style.border="1px solid #000";
    bar.style.boxSizing="border-box";

    const text=document.createElement("span");
    text.className="bar-text";
    text.textContent=rate+"%";

    outer.appendChild(bar);
    outer.appendChild(text);

    row.appendChild(label);
    row.appendChild(outer);

    container.appendChild(row);
  }
}