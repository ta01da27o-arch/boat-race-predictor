// ===============================
// 24場名
// ===============================
const stadiums=[
"桐生","戸田","江戸川","平和島","多摩川","浜名湖","蒲郡","常滑",
"津","三国","びわこ","住之江","尼崎","鳴門","丸亀","児島",
"宮島","徳山","下関","若松","芦屋","福岡","唐津","大村"
];

let selectedStadium=0;

// ===============================
// 初期表示
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
 const r=document.createElement("div");
 r.className="race";
 r.textContent=i+"R";
 r.onclick=()=>selectRace();
 raceGrid.appendChild(r);
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
 calcAllLinked();
}

// ===============================
// 完全連動基礎値
// ===============================
function generateTruePower(){
 let arr=[];
 for(let i=0;i<6;i++){
  let base=45+Math.random()*30;
  if(i===0) base+=8;
  if(i===1) base+=4;
  if(i>=4) base-=4;
  arr.push(Math.round(base));
 }
 return arr;
}

// ===============================
function rand(min,max){
 return Math.floor(Math.random()*(max-min+1))+min;
}
function clamp(v){
 if(v<0) return 0;
 if(v>100) return 100;
 return v;
}

// ===============================
// 決まり手連動
// ===============================
function generateKimarite(tp){
 let raw=[
  tp[0]*1.4,
  tp[1]*1.1,
  tp[2]*1.0,
  tp[3]*0.9,
  tp[4]*0.8,
  tp[5]*0.7
 ];
 const sum=raw.reduce((a,b)=>a+b,0);
 return raw.map(v=>Math.round(v/sum*100));
}

// ===============================
// メイン完全連動
// ===============================
function calcAllLinked(){

 const truePower=generateTruePower();

 let base=[];
 let predict=[];

 truePower.forEach(v=>{
  base.push(clamp(v+rand(-6,6)));
  predict.push(clamp(v+rand(-8,8)));
 });

 const kimariteAdv=generateKimarite(truePower);

 let ai=[];
 for(let i=0;i<6;i++){
  ai.push(clamp(Math.round(
   base[i]*0.4+
   predict[i]*0.4+
   kimariteAdv[i]*0.2
  )));
 }

 drawExpectation(base,predict,ai);
 drawKimarite(kimariteAdv);
 updateRaceType(ai);
 updateAnalysis(ai);
 updateBets(ai);
 updateHitRate(base,predict,ai);
 updateTrust(ai);
}

// ===============================
// 総合期待度 完全再現描画
// ===============================
const colors=["#ffffff","#f2f2f2","#ffe5e5","#e6f0ff","#fff6cc","#e8ffe8"];

function drawExpectation(base,predict,ai){

 const wrap=document.querySelector(".expectation-wrap");
 wrap.innerHTML="";

 for(let i=0;i<6;i++){

  const box=document.createElement("div");
  box.className="expect-box";
  box.style.background=colors[i];
  box.innerHTML=`
   <div class="course">${i+1}</div>
   <div class="lines"></div>
   <div class="total">${ai[i]}%</div>
  `;

  const lines=box.querySelector(".lines");

  renderLine(lines,"実績",base[i]);
  renderLine(lines,"予測",predict[i]);
  renderLine(lines,"AI",ai[i]);

  wrap.appendChild(box);
 }
}

function renderLine(parent,label,val){

 const row=document.createElement("div");
 row.className="line";

 const lab=document.createElement("span");
 lab.textContent=label;

 const barbox=document.createElement("div");
 barbox.className="barbox";

 const bar=document.createElement("div");
 bar.className="bar";
 bar.style.width=val+"%";

 const txt=document.createElement("span");
 txt.className="val";
 txt.textContent=val+"%";

 barbox.appendChild(bar);
 barbox.appendChild(txt);

 row.appendChild(lab);
 row.appendChild(barbox);

 parent.appendChild(row);
}

// ===============================
// 決まり手表示
// ===============================
function drawKimarite(arr){
 document.querySelectorAll(".kimarite-row").forEach((r,i)=>{
  const v=arr[i%6];
  r.querySelector(".bar div").style.width=v+"%";
  r.querySelector(".value").textContent=v+"%";
 });
}

// ===============================
// 展開タイプ
// ===============================
function updateRaceType(ai){

 const inner=ai[0];
 const middle=(ai[1]+ai[2]+ai[3])/3;
 const outer=(ai[4]+ai[5])/2;

 let type="バランス型";

 if(inner>middle+10) type="イン逃げ主導型";
 else if(middle>inner+8) type="中枠攻め型";
 else if(outer>middle+8) type="外伸び波乱型";

 document.getElementById("race-type").textContent="展開タイプ : "+type;
}

// ===============================
// 展開解析
// ===============================
function updateAnalysis(ai){

 const s=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

 let txt="";
 if(s[0].i===1) txt="イン主導で逃げ有利展開。";
 else if(s[0].i<=3) txt="中枠中心で展開が動く流れ。";
 else txt="外枠浮上で波乱含み。";

 txt+=`\n軸は${s[0].i}コース、相手本線${s[1].i}コース。`;

 document.querySelector(".analysis-text").textContent=txt;
}

// ===============================
// 買い目完全連動
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
 `1-${others[2]}-${others[3]}`
 ]);

 setCol(cols[3],[
 `${others[0]}-${others[1]}-${others[2]}`,
 `${others[1]}-${others[0]}-${others[2]}`,
 `${others[2]}-${others[0]}-${others[1]}`
 ]);
}

function setCol(col,arr){
 col.querySelectorAll(".bet-item").forEach((el,i)=>{
  el.textContent=arr[i]||"";
 });
}

// ===============================
// 的中率シミュレーション
// ===============================
function updateHitRate(base,predict,ai){

 document.querySelectorAll(".hitrate-row").forEach((row,i)=>{
  const rate=Math.round((base[i]+predict[i]+ai[i])/3);
  row.querySelector(".hitrate-value").textContent=rate+"%";
  row.querySelector(".hitrate-bar div").style.width=rate+"%";
 });
}

// ===============================
// 信頼度メーター
// ===============================
function updateTrust(ai){

 const max=Math.max(...ai);
 const min=Math.min(...ai);

 const solidity=clamp(Math.round((max-min)*1.4));
 const avg=ai.reduce((a,b)=>a+b,0)/6;

 const variance=ai.reduce((s,v)=>s+Math.abs(v-avg),0)/6;
 const volatility=clamp(Math.round(variance*1.5));

 let trust=solidity-volatility;
 if(trust<0) trust=0;

 const box=document.getElementById("confidenceSection");

 box.innerHTML=`
 <h2>信頼度メーター</h2>
 ${trustRow("堅さ",solidity,"#33cc66")}
 ${trustRow("荒れ指数",volatility,"#ff3333")}
 ${trustRow("総合信頼度",trust,"#ffcc00")}
 `;
}

function trustRow(label,val,color){
 return `
 <div class="trust-row">
  <span>${label}</span>
  <div class="trust-bar">
   <div style="width:${val}%;background:${color}"></div>
  </div>
  <span>${val}%</span>
 </div>
 `;
}
