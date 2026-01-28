// ===============================
// 24場名
// ===============================
const stadiums=[
"桐生","戸田","江戸川","平和島",
"多摩川","浜名湖","蒲郡","常滑",
"津","三国","びわこ","住之江",
"尼崎","鳴門","丸亀","児島",
"宮島","徳山","下関","若松",
"芦屋","福岡","唐津","大村"
];

// ===============================
const stadiumGrid=document.querySelector(".stadium-grid");
const raceGrid=document.querySelector(".race-grid");
const stadiumScreen=document.getElementById("stadiumScreen");
const raceScreen=document.getElementById("raceScreen");
const playerScreen=document.getElementById("playerScreen");
const raceTitle=document.getElementById("raceTitle");

// ===============================
stadiums.forEach((name,i)=>{
 const d=document.createElement("div");
 d.className="stadium";
 d.textContent=name;
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
 raceScreen.classList.add("hidden");
 stadiumScreen.classList.remove("hidden");
};

// ===============================
function selectStadium(i){
 stadiumScreen.classList.add("hidden");
 raceScreen.classList.remove("hidden");
 raceTitle.textContent=stadiums[i];
}

function selectRace(){
 raceScreen.classList.add("hidden");
 playerScreen.classList.remove("hidden");
 calcAll();
}

// ===============================
// メイン計算
// ===============================
function calcAll(){

 let base=[],predict=[],ai=[];

 for(let i=0;i<6;i++){
  const b=Math.floor(40+Math.random()*40);
  const p=Math.floor(35+Math.random()*45);
  const a=Math.round(b*0.4+p*0.6);

  base.push(b);
  predict.push(p);
  ai.push(a);
 }

 updateExpectationBars(base,predict,ai);
 updateKimarite();
 updateRaceTypeByAI(ai);
 updateAnalysis(ai);
 updateBets(ai); // ← 触っていません
 updateHitRateSimulation(base,predict,ai);
}

// ===============================
// 総合期待度
// ===============================
function updateExpectationBars(base,predict,ai){

 const colors=["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
 const light=["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];
 const labels=["実績","予測","AI"];

 document.querySelectorAll(".expectation-row").forEach((row,i)=>{

  const box=row.querySelector(".expectation-bar");
  box.innerHTML="";

  const vals=[base[i],predict[i],ai[i]];

  vals.forEach((v,j)=>{

   const line=document.createElement("div");
   line.className="bar-line";

   const lab=document.createElement("span");
   lab.className="bar-label";
   lab.textContent=labels[j];

   const outer=document.createElement("div");
   outer.style.flex="1";
   outer.style.height="14px";
   outer.style.background=light[i];
   outer.style.border="1px solid #333";
   outer.style.position="relative";
   outer.style.borderRadius="4px";

   const bar=document.createElement("div");
   bar.style.height="100%";
   bar.style.width=v+"%";
   bar.style.background=colors[i];
   bar.style.border=(i===0)?"2px solid #000":"1px solid #000";
   bar.style.boxSizing="border-box";

   const txt=document.createElement("span");
   txt.className="bar-text";
   txt.textContent=v+"%";

   outer.appendChild(bar);
   outer.appendChild(txt);

   line.appendChild(lab);
   line.appendChild(outer);
   box.appendChild(line);
  });

  row.querySelector(".expectation-value").textContent=ai[i]+"%";
 });
}

// ===============================
// 決まり手
// ===============================
function updateKimarite(){
 document.querySelectorAll(".kimarite-row").forEach(r=>{
  const v=Math.floor(10+Math.random()*75);
  r.querySelector(".bar div").style.width=v+"%";
  r.querySelector(".value").textContent=v+"%";
 });
}

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
function updateAnalysis(ai){

 const order=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

 const main=order[0].i;
 const sub=order[1].i;

 let t="";

 if(main===1) t="1コースが主導権を握る展開。イン逃げ濃厚。";
 else if(main<=3) t="中枠中心の攻防。展開が動きやすい。";
 else t="外枠の伸びが目立つ波乱傾向。";

 t+=`\n軸は${main}コース、相手は${sub}コース。`;

 document.querySelector(".analysis-text").textContent=t;
}

// ===============================
// 買い目（完成版そのまま）
// ===============================
function updateBets(ai){

 const sorted=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

 const main=sorted[0].i;
 const sub=sorted[1].i;
 const third=sorted.find(x=>x.i!==main && x.i!==sub).i;

 const cols=document.querySelectorAll(".bet-col");

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

 const others=sorted.map(x=>x.i).filter(n=>n!==1);

 setCol(cols[2],[
  `1-${others[0]}-${others[1]}`,
  `1-${others[1]}-${others[0]}`,
  `1-${others[0]}-${others[2]}`
 ]);
}

function setCol(col,arr){
 col.querySelectorAll(".bet-item").forEach((e,i)=>{
  e.textContent=arr[i]||"";
 });
}

// ===============================
// 的中率シュミレーション（見出し＆バランス修正）
// ===============================
function updateHitRateSimulation(base,predict,ai){

 const box=document.getElementById("hitRateSection");
 if(!box) return;

 box.innerHTML="";

 // 見出し追加
 const title=document.createElement("h2");
 title.textContent="的中率シュミレーション";
 box.appendChild(title);

 const colors=["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
 const light=["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];

 for(let i=0;i<6;i++){

  const row=document.createElement("div");
  row.style.display="flex";
  row.style.alignItems="center";
  row.style.gap="8px";
  row.style.marginBottom="6px";

  const lab=document.createElement("span");
  lab.style.width="36px";
  lab.style.textAlign="right";
  lab.style.fontWeight="bold";
  lab.textContent=i+1;

  const val=document.createElement("span");
  val.style.width="40px";
  val.style.textAlign="right";

  const rate=Math.round((base[i]+predict[i]+ai[i])/3);
  val.textContent=rate+"%";

  const outer=document.createElement("div");
  outer.style.flex="1";
  outer.style.height="14px";
  outer.style.background=light[i];
  outer.style.border="1px solid #333";
  outer.style.position="relative";
  outer.style.borderRadius="4px";

  const bar=document.createElement("div");
  bar.style.height="100%";
  bar.style.width=rate+"%";
  bar.style.background=colors[i];
  bar.style.border="1px solid #000";
  bar.style.boxSizing="border-box";

  outer.appendChild(bar);

  row.appendChild(lab);
  row.appendChild(val);
  row.appendChild(outer);

  box.appendChild(row);
 }
}