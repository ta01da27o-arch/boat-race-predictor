// ===============================
// 24場
// ===============================
const stadiums = [
 "桐生","戸田","江戸川","平和島","多摩川","浜名湖","蒲郡","常滑",
 "津","三国","びわこ","住之江","尼崎","鳴門","丸亀","児島",
 "宮島","徳山","下関","若松","芦屋","福岡","唐津","大村"
];

let selectedStadium = 0;

// ===============================
// 初期画面生成
// ===============================
const stadiumGrid=document.querySelector(".stadium-grid");
const raceGrid=document.querySelector(".race-grid");

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
  d.onclick=()=>selectRace();
  raceGrid.appendChild(d);
}

document.getElementById("backBtn").onclick=()=>{
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("stadiumScreen").classList.remove("hidden");
};

// ===============================
// 画面遷移
// ===============================
function selectStadium(i){
 selectedStadium=i;
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
// 過去傾向ダミー
// ===============================
const pastTrend=[
 [60,55,50,45,40,35],[58,54,50,46,42,38],[55,52,49,45,40,36],
 [62,57,53,48,44,39],[59,55,51,47,42,38],[63,58,54,49,45,40],
 [60,56,52,48,44,39],[58,54,50,46,42,38],[55,52,48,44,40,36],
 [61,56,52,48,44,39],[59,55,51,47,42,38],[57,53,49,45,40,36],
 [62,57,53,48,44,39],[60,55,51,47,42,38],[58,54,50,46,42,38],
 [61,56,52,48,44,39],[59,55,51,47,42,38],[57,53,49,45,40,36],
 [63,58,54,49,45,40],[59,55,51,47,42,38],[57,53,49,45,40,36],
 [62,57,53,48,44,39],[60,55,51,47,42,38],[58,54,50,46,42,38]
];

// ===============================
// メイン計算
// ===============================
function calcAll(){

 let base=[],predict=[],ai=[];
 let trend=pastTrend[selectedStadium];

 for(let i=0;i<6;i++){
   const b=Math.floor(40+Math.random()*40);
   const p=Math.floor(35+Math.random()*45);

   const wBase=0.35+Math.random()*0.1;
   const wPred=1-wBase;

   const raw=Math.round(b*wBase+p*wPred);
   const corrected=Math.round(raw*0.8+trend[i]*0.2);

   base.push(b);
   predict.push(p);
   ai.push(corrected);
 }

 updateExpectationBars(base,predict,ai);
 updateKimarite();
 updateRaceType(ai);
 updateAnalysis(ai);
 updateBets(ai);
 updateHitRate(base,predict,ai);
 createHoleColumn();
 updateHoleBets(ai);
 updateTrustMeter(ai);
}

// ===============================
// 総合期待度
// ===============================
function updateExpectationBars(base,predict,ai){

 const rows=document.querySelectorAll(".expectation-row");
 const colors=["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
 const light=["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];

 rows.forEach((row,i)=>{
   const box=row.querySelector(".expectation-bar");
   box.innerHTML="";

   [base[i],predict[i],ai[i]].forEach((v,j)=>{
     const line=document.createElement("div");
     line.style.display="flex";
     line.style.alignItems="center";
     line.style.marginBottom="4px";

     const outer=document.createElement("div");
     outer.style.flex="1";
     outer.style.height="14px";
     outer.style.background=light[i];
     outer.style.border="1px solid #333";
     outer.style.borderRadius="4px";

     const bar=document.createElement("div");
     bar.style.height="100%";
     bar.style.width=v+"%";
     bar.style.background=colors[i];

     outer.appendChild(bar);
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
// 展開タイプ
// ===============================
function updateRaceType(ai){

 const inner=ai[0];
 const mid=(ai[1]+ai[2]+ai[3])/3;
 const outer=(ai[4]+ai[5])/2;

 let type="バランス型";

 if(inner>mid+10&&inner>outer+10) type="イン逃げ主導型";
 else if(mid>inner&&mid>outer) type="中枠主導型";
 else if(outer>inner&&outer>mid) type="外枠波乱型";

 document.getElementById("race-type").textContent="展開タイプ : "+type;
}

// ===============================
// 展開解析
// ===============================
function updateAnalysis(ai){
 const s=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
 const main=s[0].i;
 const sub=s[1].i;

 let t="";
 if(main===1) t="イン有利展開。";
 else if(main<=3) t="中枠中心。";
 else t="外枠波乱。";

 t+=` 軸${main} 対抗${sub}`;

 document.querySelector(".analysis-text").textContent=t;
}

// ===============================
// 買い目（本命・対抗・逃げ）
// ===============================
function updateBets(ai){

 const s=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

 const main=s[0].i;
 const sub=s[1].i;
 const third=s[2].i;

 const others=[1,2,3,4,5,6].filter(n=>![main,sub,third].includes(n));

 const cols=document.querySelectorAll(".bet-col");

 setCol(cols[0],[
  `${main}-${sub}-${third}`,
  `${main}-${third}-${sub}`,
  `${sub}-${main}-${third}`
 ]);

 setCol(cols[1],[
  `${sub}-${main}-${third}`,
  `${third}-${main}-${sub}`,
  `${sub}-${third}-${main}`
 ]);

 setCol(cols[2],[
  `1-${others[0]}-${others[1]}`,
  `1-${others[1]}-${others[0]}`,
  `1-${others[2]||others[0]}-${others[3]||others[1]}`
 ]);
}

// ===============================
// 穴枠自動生成
// ===============================
function createHoleColumn(){

 if(document.querySelectorAll(".bet-col").length>=4) return;

 const box=document.querySelector(".bet-box");

 const col=document.createElement("div");
 col.className="bet-col";

 const title=document.createElement("div");
 title.className="bet-title";
 title.textContent="穴";

 col.appendChild(title);

 for(let i=0;i<3;i++){
   const d=document.createElement("div");
   d.className="bet-item";
   col.appendChild(d);
 }

 box.appendChild(col);
}

// ===============================
// 穴買い目
// ===============================
function updateHoleBets(ai){

 const s=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
 const hole=s.slice(3).map(x=>x.i);

 while(hole.length<3){
   for(let i=1;i<=6;i++){
     if(!hole.includes(i)) hole.push(i);
     if(hole.length>=3) break;
   }
 }

 const col=document.querySelectorAll(".bet-col")[3];

 setCol(col,[
  `${hole[0]}-${hole[1]}-${hole[2]}`,
  `${hole[0]}-${hole[2]}-${hole[1]}`,
  `${hole[1]}-${hole[0]}-${hole[2]}`
 ]);
}

// ===============================
function setCol(col,arr){
 col.querySelectorAll(".bet-item").forEach((el,i)=>{
   el.textContent=arr[i]||"";
 });
}

// ===============================
// 的中率シミュレーション
// ===============================
function updateHitRate(base,predict,ai){

 const rows=document.querySelectorAll(".hitrate-row");
 const light=["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];
 const colors=["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];

 rows.forEach((r,i)=>{
   const rate=Math.round((base[i]+predict[i]+ai[i])/3);

   r.querySelector(".hitrate-value").textContent=rate+"%";

   const outer=r.querySelector(".hitrate-bar");
   const bar=outer.querySelector("div");

   outer.style.background=light[i];
   bar.style.width=rate+"%";
   bar.style.background=colors[i];
 });
}

// ===============================
// 信頼度メーター自動生成
// ===============================
function updateTrustMeter(ai){

 let sec=document.getElementById("trustSection");
 if(!sec){
   sec=document.createElement("section");
   sec.id="trustSection";
   sec.style.marginTop="20px";
   document.getElementById("playerScreen").appendChild(sec);
 }

 const max=Math.max(...ai);
 const min=Math.min(...ai);
 const avg=Math.round(ai.reduce((a,b)=>a+b,0)/6);

 let hardness=Math.round((max/100)*100);
 let volatility=Math.round((max-min)*1.2);
 if(volatility>100) volatility=100;

 let trust=hardness-volatility;
 if(trust<0) trust=0;

 sec.innerHTML=`
 <h2>信頼度メーター</h2>

 ${makeTrustRow("堅さ",hardness,"#33cc66")}
 ${makeTrustRow("荒れ",volatility,"#ff3333")}
 ${makeTrustRow("総合",trust,"#ffcc00")}
 `;
}

function makeTrustRow(label,val,color){
 return `
 <div style="display:flex;align-items:center;margin-bottom:6px;">
  <span style="width:80px;">${label}</span>
  <div style="flex:1;height:14px;border:1px solid #333;background:#eee;border-radius:4px;margin:0 8px;">
    <div style="height:100%;width:${val}%;background:${color};"></div>
  </div>
  <span>${val}%</span>
 </div>
 `;
}