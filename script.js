// ================================
// UI切替＆24場グリッド
// ================================

const stadiumScreen=document.getElementById("stadiumScreen");
const raceScreen=document.getElementById("raceScreen");
const playerScreen=document.getElementById("playerScreen");

const stadiumGrid=document.querySelector(".stadium-grid");
const raceGrid=document.querySelector(".race-grid");
const raceTitle=document.getElementById("raceTitle");
const backBtn=document.getElementById("backBtn");

const stadiums=[
 '桐生','戸田','江戸川','平和島','多摩川','浜名湖','蒲郡','常滑',
 '津','三国','びわこ','住之江','尼崎','鳴門','丸亀','児島',
 '宮島','徳山','下関','若松','芦屋','福岡','唐津','大村'
];

function createStadiumButtons(){
 stadiumGrid.innerHTML="";
 stadiums.forEach(n=>{
  const d=document.createElement("div");
  d.className="stadium";
  d.textContent=n;
  d.onclick=()=>selectStadium(n);
  stadiumGrid.appendChild(d);
 });
}
createStadiumButtons();

function selectStadium(n){
 raceTitle.textContent=n;
 stadiumScreen.classList.add("hidden");
 raceScreen.classList.remove("hidden");
 createRaceButtons();
}

function createRaceButtons(){
 raceGrid.innerHTML="";
 for(let i=1;i<=12;i++){
  const d=document.createElement("div");
  d.className="race";
  d.textContent=i+"R";
  d.onclick=()=>playerScreen.classList.remove("hidden");
  raceGrid.appendChild(d);
 }
}

backBtn.onclick=()=>{
 raceScreen.classList.add("hidden");
 stadiumScreen.classList.remove("hidden");
 playerScreen.classList.add("hidden");
};

// ================================
// ダミー決まり手
// ================================

function rand(min,max){
 return Math.floor(Math.random()*(max-min+1))+min;
}

function injectDummy(){
 setCourse(1,["逃げ","差され","捲られ","捲差"]);
 setCourse(2,["逃がし","差し","捲り"]);
 for(let i=3;i<=6;i++) setCourse(i,["差し","捲り","捲差"]);
}

function setCourse(c,labels){
 document.querySelectorAll(`.kimarite-course.c${c} .kimarite-row`)
 .forEach(r=>{
  const lab=r.querySelector(".label").textContent.trim();
  if(!labels.includes(lab)) return;
  const v=rand(10,80);
  r.querySelector(".value").textContent=v+"%";
  r.querySelector(".bar div").style.width=v+"%";
 });
}

// ================================
// 総合期待度
// ================================

function calcExpectation(){

 const totals=[];

 for(let i=1;i<=6;i++){
  let t=0;
  document.querySelectorAll(`.kimarite-course.c${i} .kimarite-row`)
  .forEach(r=>{
   t+=parseInt(r.querySelector(".value").textContent)||0;
  });
  totals.push(t);
 }

 const max=Math.max(...totals,1);

 totals.forEach((v,i)=>{
  const p=Math.round(v/max*100);
  const row=document.querySelector(`.expectation-row.c${i+1}`);
  row.querySelector(".expectation-value").textContent=p+"%";
  row.querySelector(".expectation-bar div").style.width=p+"%";
 });

 detectRaceType();
 updatePrediction();
 updateAttackGraphs();
 generateComment();
 generateBets(totals);
}

function getVal(c){
 return parseInt(
  document.querySelector(`.expectation-row.c${c} .expectation-value`)
  .textContent
 )||0;
}

// ================================
// 展開タイプ細分化AI
// ================================

let currentRaceType="混戦型";

function detectRaceType(){

 const arr=[];
 for(let i=1;i<=6;i++) arr.push({c:i,v:getVal(i)});
 arr.sort((a,b)=>b.v-a.v);

 const top=arr[0], second=arr[1];
 const one=arr.find(x=>x.c===1).v;

 if(top.c===1 && top.v>=70 && top.v-second.v>=15)
   currentRaceType="イン逃げ型";

 else if(top.c===2 && top.v>=60)
   currentRaceType="差し主導型";

 else if(top.c>=3 && top.v>=65)
   currentRaceType="まくり一撃型";

 else if(one<=30 && top.c!==1)
   currentRaceType="波乱型";

 else if(top.v-second.v<=10)
   currentRaceType="混戦型";

 else
   currentRaceType="外攻め主導型";

 document.getElementById("race-type").textContent=
  "展開タイプ："+currentRaceType;
}

// ================================
// 二重グラフ：予測バーAI
// ================================

function updatePrediction(){

 for(let i=1;i<=6;i++){

  const base=getVal(i);
  let mod=1;

  switch(currentRaceType){

   case "イン逃げ型":
    if(i===1) mod=1.25;
    else if(i===2) mod=1.05;
    else mod=0.8;
    break;

   case "差し主導型":
    if(i===2) mod=1.3;
    else if(i===1) mod=0.85;
    else mod=1.05;
    break;

   case "まくり一撃型":
    if(i>=3 && i<=5) mod=1.35;
    else if(i===1) mod=0.75;
    else mod=1;
    break;

   case "外攻め主導型":
    if(i>=3) mod=1.2;
    else mod=0.9;
    break;

   case "波乱型":
    mod=rand(80,120)/100;
    break;

   case "混戦型":
    mod=0.9+Math.random()*0.2;
    break;
  }

  let pred=Math.round(base*mod);
  pred=Math.max(Math.min(pred,100),0);

  const row=document.querySelector(`.expectation-row.c${i}`);

  let pbar=row.querySelector(".prediction-bar");
  if(!pbar){
   pbar=document.createElement("div");
   pbar.className="prediction-bar";
   row.querySelector(".expectation-bar").appendChild(pbar);
  }

  pbar.style.width=pred+"%";
 }
}

// ================================
// ③-A 攻め指数AI（三重グラフ）
// ================================

function getAttackPower(course){

 const rows=document.querySelectorAll(
  `.kimarite-course.c${course} .kimarite-row`
 );

 let attack=0;

 rows.forEach(r=>{
  const lab=r.querySelector(".label").textContent.trim();
  const v=parseInt(r.querySelector(".value").textContent)||0;

  if(lab==="捲り") attack+=v*1.2;
  if(lab==="捲差") attack+=v*1.0;
  if(lab==="差し") attack+=v*0.8;
  if(lab==="逃げ") attack+=v*0.6;
 });

 return attack;
}

function buildAttackBars(){

 for(let i=1;i<=6;i++){

  const row=document.querySelector(`.expectation-row.c${i}`);
  const box=row.querySelector(".expectation-bar");

  if(!box.querySelector(".attack-base")){
   box.innerHTML=`
    <div class="attack-base"></div>
    <div class="prediction-bar"></div>
    <div class="attack-ai"></div>
   `;
  }
 }
}

function updateAttackGraphs(){

 const raw=[];
 for(let i=1;i<=6;i++) raw.push(getAttackPower(i));

 const max=Math.max(...raw,1);

 for(let i=1;i<=6;i++){

  const row=document.querySelector(`.expectation-row.c${i}`);

  const baseBar=row.querySelector(".attack-base");
  const aiBar=row.querySelector(".attack-ai");

  const basePercent=Math.round(raw[i-1]/max*100);

  let aiVal=basePercent;

  if(currentRaceType==="イン逃げ型" && i===1) aiVal*=1.2;
  if(currentRaceType==="まくり一撃型" && i>=3) aiVal*=1.3;
  if(currentRaceType==="波乱型") aiVal*=rand(80,130)/100;

  aiVal=Math.max(Math.min(Math.round(aiVal),100),0);

  baseBar.style.width=basePercent+"%";
  aiBar.style.width=aiVal+"%";
 }
}

// ================================
// 展開コメント
// ================================

function generateComment(){

 let txt="";

 switch(currentRaceType){
  case "イン逃げ型": txt="イン主導の堅い展開。逃げ中心。"; break;
  case "差し主導型": txt="差し有力。イン残り注意。"; break;
  case "まくり一撃型": txt="外から一撃まくり濃厚。"; break;
  case "外攻め主導型": txt="攻め艇優勢。展開速い。"; break;
  case "波乱型": txt="波乱含み。高配当注意。"; break;
  case "混戦型": txt="拮抗戦。展開次第。"; break;
 }

 document.querySelector(".analysis-text").textContent=txt;
}

// ================================
// 買い目AI
// ================================

function generateBets(tot){

 const arr=tot.map((v,i)=>({c:i+1,v}));
 arr.sort((a,b)=>b.v-a.v);

 const a=arr[0].c,b=arr[1].c,c=arr[2].c;

 const rows=document.querySelectorAll(".bet-row");

 if(rows[0]) rows[0].querySelector(".bet-content").textContent=`${a}-${b}-${c}`;
 if(rows[1]) rows[1].querySelector(".bet-content").textContent=`${a}-${c}-${b}`;
 if(rows[2]) rows[2].querySelector(".bet-content").textContent=`${b}-${a}-${c}`;
}

// ================================
// 初期実行
// ================================

setTimeout(()=>{
 injectDummy();
 buildAttackBars();
 calcExpectation();
},300);