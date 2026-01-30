// ===============================
// 24場名
// ===============================
const stadiums = [
 "桐生","戸田","江戸川","平和島","多摩川","浜名湖","蒲郡","常滑",
 "津","三国","びわこ","住之江","尼崎","鳴門","丸亀","児島",
 "宮島","徳山","下関","若松","芦屋","福岡","唐津","大村"
];

// ===============================
const stadiumGrid=document.querySelector(".stadium-grid");
const raceGrid=document.querySelector(".race-grid");

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

// ===============================
document.getElementById("backBtn").onclick=()=>{
 document.getElementById("raceScreen").classList.add("hidden");
 document.getElementById("stadiumScreen").classList.remove("hidden");
};

// ===============================
let currentStadiumIndex=0;

function selectStadium(i){
 currentStadiumIndex=i;
 document.getElementById("stadiumScreen").classList.add("hidden");
 document.getElementById("raceScreen").classList.remove("hidden");
 document.getElementById("raceTitle").textContent=stadiums[i];
}

function selectRace(){
 document.getElementById("raceScreen").classList.add("hidden");
 document.getElementById("playerScreen").classList.remove("hidden");
 calcAll(currentStadiumIndex);
}

// ===============================
// コース補正（実戦寄り）
// ===============================
const courseBias=[25,15,10,6,3,1];

// ===============================
// 場ごとの展開向き係数
// ===============================
const pastTrend=[
 [70,55,45,35,25,15],[65,55,50,40,30,20],[60,55,45,40,30,20],
 [75,60,50,40,30,20],[65,55,45,35,25,15],[60,50,40,30,20,10],
 [70,60,50,40,30,20],[65,55,45,35,25,15],
 [60,50,40,30,20,10],[70,60,50,40,30,20],
 [65,55,45,35,25,15],[60,50,40,30,20,10],
 [70,60,50,40,30,20],[65,55,45,35,25,15],
 [60,50,40,30,20,10],[70,60,50,40,30,20],
 [65,55,45,35,25,15],[60,50,40,30,20,10],
 [70,60,50,40,30,20],[65,55,45,35,25,15],
 [60,50,40,30,20,10],[70,60,50,40,30,20],
 [65,55,45,35,25,15],[60,50,40,30,20,10]
];

// ===============================
// メイン計算
// ===============================
function calcAll(idx){

 let base=[],predict=[],ai=[];
 const trend=pastTrend[idx];

 for(let i=0;i<6;i++){

  // 実績＝過去傾向を基準
  const b=trend[i];

  // 予測＝場傾向＋コース補正
  const p=Math.min(100,Math.round(b*0.6+courseBias[i]*2));

  // AI＝実績＋予測＋展開向き
  const a=Math.min(100,Math.round(
     b*0.4+p*0.4+trend[i]*0.2
  ));

  base.push(b);
  predict.push(p);
  ai.push(a);
 }

 updateExpectationBars(base,predict,ai);
 updateKimariteFromAI(ai);
 updateRaceType(ai);
 updateAnalysisJournal(ai);
 updateBets(ai);
 updateHitRate(base,predict,ai);
 updateTrust(ai);
}

// ===============================
// 総合期待度
// ===============================
function updateExpectationBars(base,predict,ai){

 document.querySelectorAll(".expectation-row").forEach((row,i)=>{
  const box=row.querySelector(".expectation-bar");
  box.innerHTML="";

  [base[i],predict[i],ai[i]].forEach(v=>{
   const outer=document.createElement("div");
   outer.style.height="12px";
   outer.style.border="1px solid #333";
   outer.style.margin="3px 0";
   outer.style.position="relative";

   const bar=document.createElement("div");
   bar.style.height="100%";
   bar.style.width=v+"%";
   bar.style.background="#4caf50";

   outer.appendChild(bar);
   box.appendChild(outer);
  });

  row.querySelector(".expectation-value").textContent=ai[i]+"%";
 });
}

// ===============================
// 決まり手（NaN防止）
// ===============================
function updateKimariteFromAI(ai){

 document.querySelectorAll(".kimarite-row").forEach((row,i)=>{
  const base = ai[i%6] || 10;
  const v = Math.max(5,Math.min(95,Math.round(base*(0.6+Math.random()*0.4))));
  row.querySelector(".bar div").style.width=v+"%";
  row.querySelector(".value").textContent=v+"%";
 });
}

// ===============================
// 展開タイプ
// ===============================
function updateRaceType(ai){

 const inner=ai[0];
 const mid=(ai[1]+ai[2]+ai[3])/3;
 const out=(ai[4]+ai[5])/2;

 let type="";

 if(inner>mid+12) type="イン逃げ主導型";
 else if(mid>inner&&mid>out) type="中枠攻め型";
 else if(out>inner) type="外伸び波乱型";
 else type="混戦バランス型";

 document.getElementById("race-type").textContent="展開タイプ : "+type;
}

// ===============================
// 記者風展開解析
// ===============================
function updateAnalysisJournal(ai){

 const order=ai.map((v,i)=>({v,i:i+1}))
               .sort((a,b)=>b.v-a.v);

 const main=order[0].i;
 const sub=order[1].i;
 const third=order[2].i;
 const low1=order[4].i;
 const low2=order[5].i;

 let text="";

 if(main===1){
  text+=`1コースがスタートから踏み込み主導権を握る展開が濃厚。`;
 }else if(main<=3){
  text+=`${main}コースが果敢に仕掛けレースを動かしそうだ。`;
 }else{
  text+=`${main}コースの伸びが目立ち波乱含みの流れ。`;
 }

 text+=`\n相手筆頭は${sub}コース。${third}コースも展開ひとつで絡む。`;

 text+=`\n一方で${low1}・${low2}コースは位置取り厳しく苦戦模様。`;

 text+=`\n軸は${main}コース中心で組み立てたい。`;

 document.querySelector(".analysis-text").textContent=text;
}

// ===============================
// 買い目
// ===============================
function updateBets(ai){

 const s=ai.map((v,i)=>({v,i:i+1}))
           .sort((a,b)=>b.v-a.v);

 const a=s[0].i,b=s[1].i,c=s[2].i;

 const mainArr=[`${a}-${b}-${c}`,`${a}-${c}-${b}`,`${b}-${a}-${c}`];
 const subArr=[`${b}-${c}-${a}`,`${b}-${a}-${c}`,`${c}-${b}-${a}`];

 const escapeArr=[`1-${b}-${c}`,`1-${c}-${b}`,`1-${b}-${a}`];

 const cols=document.querySelectorAll(".bet-col");

 setCol(cols[0],mainArr);
 setCol(cols[1],subArr);
 setCol(cols[2],escapeArr);
}

function setCol(col,arr){
 col.querySelectorAll(".bet-item")
    .forEach((el,i)=>el.textContent=arr[i]||"");
}

// ===============================
// 的中率
// ===============================
function updateHitRate(base,predict,ai){

 document.querySelectorAll(".hitrate-row").forEach((row,i)=>{
  const r=Math.round((base[i]+predict[i]+ai[i])/3);
  row.querySelector(".hitrate-value").textContent=r+"%";
  row.querySelector(".hitrate-bar div").style.width=r+"%";
 });
}

// ===============================
// 信頼度
// ===============================
function updateTrust(ai){

 const max=Math.max(...ai);
 const min=Math.min(...ai);
 const spread=max-min;

 let trust=Math.round(100-spread*1.1);
 if(trust<0)trust=0;

 let box=document.getElementById("trustMeter");

 if(!box){
  box=document.createElement("div");
  box.id="trustMeter";
  box.style.margin="15px";
  document.getElementById("playerScreen").appendChild(box);
 }

 box.innerHTML=`
  <h2>信頼度メーター</h2>
  <p>展開差：${spread}</p>
  <p><strong>総合信頼度：${trust}%</strong></p>
 `;
  }
