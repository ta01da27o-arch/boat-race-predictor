/* ===========================
   完全統合フル script.js（％表示対応）
=========================== */

const stadiumGrid=document.querySelector(".stadium-grid");
const raceGrid=document.querySelector(".race-grid");

const stadiumScreen=document.getElementById("stadiumScreen");
const raceScreen=document.getElementById("raceScreen");
const playerScreen=document.getElementById("playerScreen");

const raceTitle=document.getElementById("raceTitle");
const backBtn=document.getElementById("backBtn");

const analysisText=document.querySelector(".analysis-text");
const raceTypeBox=document.getElementById("race-type");

/* ===========================
   場生成
=========================== */

const stadiumNames=[
"桐生","戸田","江戸川","平和島",
"多摩川","浜名湖","蒲郡","常滑",
"津","三国","びわこ","住之江",
"尼崎","鳴門","丸亀","児島",
"宮島","徳山","下関","若松",
"芦屋","福岡","唐津","大村"
];

stadiumNames.forEach(name=>{
 const btn=document.createElement("div");
 btn.className="stadium";
 btn.textContent=name;
 btn.onclick=()=>{
   stadiumScreen.classList.add("hidden");
   raceScreen.classList.remove("hidden");
   raceTitle.textContent=name+" レース選択";
   createRaces();
 };
 stadiumGrid.appendChild(btn);
});

function createRaces(){
 raceGrid.innerHTML="";
 for(let i=1;i<=12;i++){
  const btn=document.createElement("div");
  btn.className="race";
  btn.textContent=i+"R";
  btn.onclick=()=>{
    raceScreen.classList.add("hidden");
    playerScreen.classList.remove("hidden");
    calculateAll();
  };
  raceGrid.appendChild(btn);
 }
}

backBtn.onclick=()=>{
 raceScreen.classList.add("hidden");
 stadiumScreen.classList.remove("hidden");
};

/* ===========================
   メイン処理
=========================== */

function calculateAll(){
 generateKimarite();
 generateAI();
 normalizeTotal();
 judgeRaceType();
 generateAnalysis();
 generateBets();
}

/* ===========================
   決まり手
=========================== */

function generateKimarite(){
 document.querySelectorAll(".kimarite-row").forEach(row=>{
  const v=Math.floor(Math.random()*70)+10;
  row.querySelector(".bar div").style.width=v+"%";
  row.querySelector(".value").textContent=v+"%";
 });
}

/* ===========================
   AI + %表示付き3本グラフ
=========================== */

function generateAI(){

 document.querySelectorAll(".expectation-row").forEach(row=>{

  const box=row.querySelector(".expectation-bar");

  const base=Math.floor(Math.random()*60)+20;
  const predict=Math.floor(Math.random()*60)+20;
  const ai=Math.floor((base+predict)/2+Math.random()*20);

  box.innerHTML=`
   <div class="attack-base">
     <span class="bar-text">${base}%</span>
   </div>
   <div class="attack-predict">
     <span class="bar-text">${predict}%</span>
   </div>
   <div class="attack-ai">
     <span class="bar-text">${ai}%</span>
   </div>
  `;

  box.children[0].style.width=base+"%";
  box.children[1].style.width=predict+"%";
  box.children[2].style.width=ai+"%";

  row.dataset.score=ai;
 });

}

/* ===========================
   総合正規化
=========================== */

function normalizeTotal(){

 let total=0;
 document.querySelectorAll(".expectation-row").forEach(r=>{
  total+=Number(r.dataset.score);
 });

 document.querySelectorAll(".expectation-row").forEach(r=>{
  const v=Math.round((r.dataset.score/total)*100);
  r.querySelector(".expectation-value").textContent=v+"%";
  r.dataset.final=v;
 });
}

/* ===========================
   展開タイプ
=========================== */

function judgeRaceType(){

 const v=[...document.querySelectorAll(".expectation-row")]
 .map(r=>Number(r.dataset.final));

 let type="混戦型";

 if(v[0]>40) type="逃げ主導型";
 else if(v[2]>38) type="まくり一撃型";
 else if(v[1]>35) type="差し中心型";

 raceTypeBox.textContent="展開タイプ："+type;
}

/* ===========================
   展開解析
=========================== */

function generateAnalysis(){

 const rows=[...document.querySelectorAll(".expectation-row")]
 .sort((a,b)=>b.dataset.final-a.dataset.final);

 const top=rows[0].querySelector(".course-no").textContent;
 const second=rows[1].querySelector(".course-no").textContent;

 analysisText.textContent=
`主導権は${top}コースが握る展開。
${second}コースが追走し有力。

スタート隊形次第では波乱も想定。`;
}

/* ===========================
   買い目生成（3枠）
=========================== */

function generateBets(){

 const rows=[...document.querySelectorAll(".expectation-row")]
 .sort((a,b)=>b.dataset.final-a.dataset.final);

 const a=rows[0].querySelector(".course-no").textContent;
 const b=rows[1].querySelector(".course-no").textContent;
 const c=rows[2].querySelector(".course-no").textContent;

 const bets=[
  `${a}-${b}-${c}`,
  `${a}-${c}-${b}`,
  `${b}-${a}-${c}`,
  `${b}-${c}-${a}`,
  `${b}-${a}-${c}`,
  `${c}-${b}-${a}`,
  `1-${b}-${c}`,
  `1-${c}-${b}`,
  `1-${b}-${a}`
 ];

 document.querySelectorAll(".bet-content").forEach((el,i)=>{
  if(bets[i]) el.textContent=bets[i];
 });
}

/* ===========================
   初期
=========================== */

calculateAll();