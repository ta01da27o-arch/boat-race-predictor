// ===============================
// 24場名
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

function selectRace(){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  calcAll();
}

// ===============================
// メイン計算
// ===============================
function calcAll(){

  let base=[], predict=[], ai=[];

  for(let i=0;i<6;i++){
    const b = Math.floor(40+Math.random()*40);
    const p = Math.floor(35+Math.random()*45);

    // B② 学習風重み調整
    const weightBase = 0.35 + Math.random()*0.1;
    const weightPred = 1 - weightBase;

    const a = Math.round(b*weightBase + p*weightPred);

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

  // ★ C①信頼度メーター追加
  updateTrustMeter(ai);
}

// ===============================
// 総合期待度
// ===============================
function updateExpectationBars(base,predict,ai){

  const colors = ["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const labels = ["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{
    const barBox=row.querySelector(".expectation-bar");
    barBox.innerHTML="";

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

      const text=document.createElement("span");
      text.className="bar-text";
      text.textContent=val+"%";

      outer.appendChild(bar);
      outer.appendChild(text);
      line.appendChild(label);
      line.appendChild(outer);
      barBox.appendChild(line);
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

  const max=Math.max(...ai);
  const min=Math.min(...ai);

  let type="";

  if(inner>middle+10&&inner>outer+15) type="イン逃げ主導型";
  else if(middle>inner&&middle>outer) type="中枠攻め合い型";
  else if(outer>inner&&outer>middle) type="外伸び波乱型";
  else if(max-min<8) type="超混戦型";
  else type="バランス型";

  document.getElementById("race-type").textContent="展開タイプ : "+type;
}

// ===============================
// 展開解析
// ===============================
function updateAnalysis(ai){

  const order=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
  const main=order[0].i;
  const sub=order[1].i;

  let text="";

  if(main===1) text="1コースが主導権。イン有利展開。";
  else if(main<=3) text="中枠中心で流れが動く。";
  else text="外枠優勢で波乱含み。";

  text+=`\n軸は${main}コース、対抗${sub}コース。`;

  document.querySelector(".analysis-text").textContent=text;
}

// ===============================
// 買い目（完成ロジック）
// ===============================
function updateBets(ai){

  const sorted=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const main=sorted[0].i;
  const sub=sorted[1].i;
  const third=sorted[2].i;

  const others=[2,3,4,5,6];

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
}

function setCol(col,arr){
  col.querySelectorAll(".bet-item").forEach((el,i)=>{
    el.textContent=arr[i]||"";
  });
}

// ===============================
// 的中率シミュレーション
// ===============================
function updateHitRateSimulation(base,predict,ai){

  const rows=document.querySelectorAll("#hitRateSection .hitrate-row");

  const colors=["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const light=["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];

  rows.forEach((row,i)=>{

    row.style.display="flex";
    row.style.alignItems="center";
    row.style.marginBottom="6px";

    const rate=Math.round((base[i]+predict[i]+ai[i])/3);

    const val=row.querySelector(".hitrate-value");
    const outer=row.querySelector(".hitrate-bar");
    const bar=outer.querySelector("div");

    val.textContent=rate+"%";
    val.style.width="50px";
    val.style.textAlign="right";
    val.style.marginRight="8px";

    outer.style.flex="1";
    outer.style.height="14px";
    outer.style.border="1px solid #333";
    outer.style.background=light[i];
    outer.style.borderRadius="4px";

    bar.style.height="100%";
    bar.style.width=rate+"%";
    bar.style.background=colors[i];
    bar.style.border="1px solid #000";
  });
}

// ===================================================
// C① 信頼度メーター（基本ロジック）
// ===================================================
function updateTrustMeter(ai){

  // 上位と下位の差 → 堅さ
  const max=Math.max(...ai);
  const min=Math.min(...ai);
  let solidity = max - min;

  // バラつき → 荒れ指数
  const avg = ai.reduce((a,b)=>a+b,0)/6;
  let variance = ai.reduce((s,v)=>s+Math.abs(v-avg),0)/6;

  // 正規化
  solidity = Math.min(100, Math.round(solidity*1.5));
  variance = Math.min(100, Math.round(variance*1.8));

  // 信頼度
  let trust = Math.round(solidity - variance*0.6);
  if(trust<0) trust=0;
  if(trust>100) trust=100;

  // 表示（無ければ自動生成）
  let box=document.getElementById("trustMeter");

  if(!box){
    box=document.createElement("div");
    box.id="trustMeter";
    box.style.margin="16px 0";
    box.style.padding="12px";
    box.style.border="2px solid #333";
    box.style.borderRadius="8px";
    document.getElementById("playerScreen").appendChild(box);
  }

  box.innerHTML=`
    <h2>信頼度メーター</h2>
    <p>堅さスコア：${solidity}</p>
    <p>荒れ指数：${variance}</p>
    <p><strong>総合信頼度：${trust}%</strong></p>
  `;
}