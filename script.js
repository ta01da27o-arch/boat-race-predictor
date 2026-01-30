// ===============================
// 24場名
// ===============================
const stadiums = [
 "桐生","戸田","江戸川","平和島","多摩川","浜名湖","蒲郡","常滑",
 "津","三国","びわこ","住之江","尼崎","鳴門","丸亀","児島",
 "宮島","徳山","下関","若松","芦屋","福岡","唐津","大村"
];

// ===============================
// コース基本有利補正（現実寄り）
// ===============================
const courseAdvantage = [1.25,1.05,0.95,0.85,0.75,0.65];

// ===============================
// 場特性補正（イン有利〜外伸び）
// ===============================
const stadiumBias = [
 1.15,1.05,0.95,1.10,1.00,1.05,1.10,1.05,
 1.00,1.05,1.10,1.15,1.10,1.00,1.05,0.95,
 1.10,1.05,1.00,1.10,1.15,1.10,1.00,1.20
];

// ===============================
// 初期表示
// ===============================
const stadiumGrid=document.querySelector(".stadium-grid");
const raceGrid=document.querySelector(".race-grid");

stadiums.forEach((n,i)=>{
 const d=document.createElement("div");
 d.className="stadium";
 d.textContent=n;
 d.onclick=()=>selectStadium(i);
 stadiumGrid.appendChild(d);
});

for(let i=1;i<=12;i++){
 const d=document.createElement("div");
 d.className="race";
 d.textContent=i+"R";
 d.onclick=()=>selectRace();
 raceGrid.appendChild(d);
}

document.getElementById("backBtn").onclick=()=>{
 document.getElementById("raceScreen").classList.add("hidden");
 document.getElementById("stadiumScreen").classList.remove("hidden");
};

// ===============================
let currentStadium=0;

function selectStadium(i){
 currentStadium=i;
 document.getElementById("stadiumScreen").classList.add("hidden");
 document.getElementById("raceScreen").classList.remove("hidden");
 document.getElementById("raceTitle").textContent=stadiums[i];
}

function selectRace(){
 document.getElementById("raceScreen").classList.add("hidden");
 document.getElementById("playerScreen").classList.remove("hidden");
 calcAll();
}

// ===============================
// 決まり手（実績母体）
// ===============================
function createKimarite(){
 return [
  {win:42, lose:8, over:5, diff:3},
  {give:12, sash:18, maku:10},
  {sash:16, maku:14, diff:8},
  {sash:14, maku:12, diff:7},
  {sash:10, maku:9, diff:5},
  {sash:8, maku:7, diff:4}
 ];
}

// ===============================
// 選手能力（入力値→補正）
// ===============================
function getPlayerPower(){
 const inputs=document.querySelectorAll(".player-input");
 return [...inputs].map(inp=>{
   const v=parseInt(inp.value)||50;
   return Math.min(100,Math.max(30,v));
 });
}

// ===============================
// メイン計算
// ===============================
function calcAll(){

 const kimarite=createKimarite();
 const power=getPlayerPower();

 let base=[], predict=[], ai=[];

 kimarite.forEach((k,i)=>{
   let total=0;
   Object.values(k).forEach(v=>total+=v);

   base[i]=total;

   let pred = total
      * courseAdvantage[i]
      * stadiumBias[currentStadium]
      * (power[i]/50);

   predict[i]=Math.round(pred);

   // 展開向き（内有利＋能力差影響）
   let flow = (i===0?1.15:(i<=2?1.05:0.9));
   let aiScore = pred * flow;

   ai[i]=Math.round(aiScore);
 });

 normalize(base);
 normalize(predict);
 normalize(ai);

 updateKimarite(kimarite);
 updateExpectationBars(base,predict,ai);
 updateRaceType(ai);
 updateAnalysis(ai);
 updateBets(ai);
 updateHitRate(base,predict,ai);
 updateTrust(ai);
}

// ===============================
// 正規化（0〜100）
// ===============================
function normalize(arr){
 const max=Math.max(...arr);
 arr.forEach((v,i)=>arr[i]=Math.round(v/max*100));
}

// ===============================
// 決まり手表示
// ===============================
function updateKimarite(data){
 document.querySelectorAll(".kimarite-course").forEach((box,i)=>{
  const rows=box.querySelectorAll(".kimarite-row");
  const vals=Object.values(data[i]);
  rows.forEach((r,j)=>{
    const v=vals[j]||0;
    r.querySelector(".bar div").style.width=v+"%";
    r.querySelector(".value").textContent=v+"%";
  });
 });
}

// ===============================
// 総合期待度
// ===============================
function updateExpectationBars(base,predict,ai){
 document.querySelectorAll(".expectation-row").forEach((row,i)=>{
  const bar=row.querySelector(".expectation-bar div");
  bar.style.width=ai[i]+"%";
  row.querySelector(".expectation-value").textContent=ai[i]+"%";
 });
}

// ===============================
// 展開タイプ
// ===============================
function updateRaceType(ai){
 const inner=ai[0];
 const mid=(ai[1]+ai[2]+ai[3])/3;
 const out=(ai[4]+ai[5])/2;

 let t="バランス型";
 if(inner>mid+10) t="イン逃げ主導型";
 else if(mid>inner && mid>out) t="中枠攻め型";
 else if(out>inner) t="外伸び波乱型";

 document.getElementById("race-type").textContent="展開タイプ : "+t;
}

// ===============================
// 展開解析
// ===============================
function updateAnalysis(ai){
 const s=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
 document.querySelector(".analysis-text").textContent=
 `主導権は${s[0].i}コース。\n対抗は${s[1].i}コース。`;
}

// ===============================
// 買い目ロジック（矛盾なし）
// ===============================
function updateBets(ai){

 const rank=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

 const main=[ 
  `${rank[0].i}-${rank[1].i}-${rank[2].i}`,
  `${rank[0].i}-${rank[2].i}-${rank[1].i}`,
  `${rank[1].i}-${rank[0].i}-${rank[2].i}`
 ];

 const sub=[
  `${rank[1].i}-${rank[2].i}-${rank[3].i}`,
  `${rank[1].i}-${rank[3].i}-${rank[2].i}`,
  `${rank[2].i}-${rank[1].i}-${rank[3].i}`
 ];

 const escape=[
  `1-${rank[1].i}-${rank[2].i}`,
  `1-${rank[2].i}-${rank[1].i}`,
  `1-${rank[1].i}-${rank[3].i}`
 ];

 const cols=document.querySelectorAll(".bet-col");

 setCol(cols[0],main);
 setCol(cols[1],sub);
 setCol(cols[2],escape);
}

function setCol(col,arr){
 col.querySelectorAll(".bet-item").forEach((e,i)=>{
   e.textContent=arr[i]||"";
 });
}

// ===============================
// 的中率
// ===============================
function updateHitRate(b,p,a){
 document.querySelectorAll(".hitrate-row").forEach((r,i)=>{
  const v=Math.round((b[i]+p[i]+a[i])/3);
  r.querySelector(".hitrate-value").textContent=v+"%";
  r.querySelector(".hitrate-bar div").style.width=v+"%";
 });
}

// ===============================
// 信頼度
// ===============================
function updateTrust(ai){
 const max=Math.max(...ai);
 const min=Math.min(...ai);
 const diff=max-min;

 let trust=Math.round(100-diff);
 trust=Math.max(0,Math.min(100,trust));

 let box=document.getElementById("trustMeter");
 if(!box){
  box=document.createElement("div");
  box.id="trustMeter";
  document.getElementById("playerScreen").appendChild(box);
 }

 box.innerHTML=`
 <h2>信頼度メーター</h2>
 <p>展開差 : ${diff}</p>
 <p><strong>総合信頼度 : ${trust}%</strong></p>
 `;
                         }
