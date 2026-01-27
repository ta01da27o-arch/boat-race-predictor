// ================================
// 画面切替
// ================================

const stadiumScreen = document.getElementById("stadiumScreen");
const raceScreen = document.getElementById("raceScreen");
const playerScreen = document.getElementById("playerScreen");

const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");
const raceTitle = document.getElementById("raceTitle");
const backBtn = document.getElementById("backBtn");

const stadiums=[
"桐生","戸田","江戸川","平和島","多摩川","浜名湖","蒲郡","常滑",
"津","三国","びわこ","住之江","尼崎","鳴門","丸亀","児島",
"宮島","徳山","下関","若松","芦屋","福岡","唐津","大村"
];

function createStadiumButtons(){
 stadiumGrid.innerHTML="";
 stadiums.forEach(name=>{
  const d=document.createElement("div");
  d.className="stadium";
  d.textContent=name;
  d.onclick=()=>selectStadium(name);
  stadiumGrid.appendChild(d);
 });
}
createStadiumButtons();

function selectStadium(name){
 raceTitle.textContent=name;
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
  d.onclick=()=>{
    raceScreen.classList.add("hidden");
    playerScreen.classList.remove("hidden");
    injectDummy();
    calcExpectation();
  };
  raceGrid.appendChild(d);
 }
}

backBtn.onclick=()=>{
 playerScreen.classList.add("hidden");
 raceScreen.classList.add("hidden");
 stadiumScreen.classList.remove("hidden");
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
// 共通取得
// ================================

function getVal(c){
 return parseInt(
  document.querySelector(`.expectation-row.c${c} .expectation-value`).textContent
 )||0;
}

// ================================
// 攻め指数AI
// ================================

function getAttackPower(course){
 const rows=document.querySelectorAll(`.kimarite-course.c${course} .kimarite-row`);
 let v=0;

 rows.forEach(r=>{
  const l=r.querySelector(".label").textContent.trim();
  const p=parseInt(r.querySelector(".value").textContent)||0;

  if(l==="捲り") v+=p*1.2;
  if(l==="捲差") v+=p*1.0;
  if(l==="差し") v+=p*0.8;
  if(l==="逃げ") v+=p*0.6;
 });

 return v;
}

// ================================
// 攻め指数バー生成
// ================================

function buildAttackBars(){
 for(let i=1;i<=6;i++){
  const row=document.querySelector(`.expectation-row.c${i}`);
  if(!row) continue;

  const box=row.querySelector(".expectation-bar");

  if(!box.querySelector(".attack-base")){
   box.innerHTML=`
    <div class="attack-base"></div>
    <div class="attack-predict"></div>
    <div class="attack-ai"></div>
   `;
  }
 }
}

// ================================
// 攻め指数更新
// ================================

function updateAttackGraphs(){

 let raw=[];
 for(let i=1;i<=6;i++) raw.push(getAttackPower(i));

 const max=Math.max(...raw,1);

 for(let i=1;i<=6;i++){

  const row=document.querySelector(`.expectation-row.c${i}`);
  const base=row.querySelector(".attack-base");
  const pred=row.querySelector(".attack-predict");
  const ai=row.querySelector(".attack-ai");

  const baseP=Math.round(raw[i-1]/max*100);

  let p=baseP*(i===1?1.1:i===2?1.05:i>=5?0.9:1);
  if(p>100) p=100;

  let aiVal=Math.round(baseP*(0.9+Math.random()*0.3));
  if(aiVal>100) aiVal=100;

  base.style.width=baseP+"%";
  pred.style.width=p+"%";
  ai.style.width=aiVal+"%";
 }
}

// ================================
// 展開タイプAI
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

 document.getElementById("race-type").textContent="展開タイプ："+currentRaceType;
}

// ================================
// 総合期待度算出
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
 });

 buildAttackBars();
 updateAttackGraphs();
 detectRaceType();
 generateComment();
 generateBets(totals);
}

// ================================
// 展開コメント
// ================================

function generateComment(){

 const map={
  "イン逃げ型":"イン主導の堅い展開。",
  "差し主導型":"差し中心の攻防。",
  "まくり一撃型":"外から一気の攻め。",
  "外攻め主導型":"スピード勝負。",
  "波乱型":"高配当注意。",
  "混戦型":"拮抗した展開。"
 };

 document.querySelector(".analysis-text").textContent=map[currentRaceType];
}

// ================================
// 🧠 買い目AI（A案）
// ================================

function generateBets(tot){

 const arr=tot.map((v,i)=>({c:i+1,v}));
 arr.sort((a,b)=>b.v-a.v);

 const a=arr[0].c;
 const b=arr[1].c;
 const c=arr[2].c;
 const d=arr[3].c;

 const rows=document.querySelectorAll(".bet-row");

 const bets=[
  `${a}-${b}-${c}`,
  `${a}-${c}-${b}`,
  `${b}-${a}-${c}`,

  `${b}-${c}-${d}`,
  `${b}-${d}-${c}`,
  `${c}-${b}-${d}`,

  `1-${a}-${b}`,
  `1-${b}-${a}`,
  `1-${a}-${c}`
 ];

 rows.forEach((r,i)=>{
  if(bets[i]) r.querySelector(".bet-content").textContent=bets[i];
 });
}