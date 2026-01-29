/* ===============================
   24場名
=============================== */
const stadiums = [
  "桐生","戸田","江戸川","平和島",
  "多摩川","浜名湖","蒲郡","常滑",
  "津","三国","びわこ","住之江",
  "尼崎","鳴門","丸亀","児島",
  "宮島","徳山","下関","若松",
  "芦屋","福岡","唐津","大村"
];

/* ===============================
   初期画面表示
=============================== */
const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");

stadiums.forEach((name,i)=>{
  const div = document.createElement("div");
  div.className = "stadium";
  div.textContent = name;
  div.onclick = () => selectStadium(i);
  stadiumGrid.appendChild(div);
});

for(let i=1;i<=12;i++){
  const div = document.createElement("div");
  div.className = "race";
  div.textContent = i + "R";
  div.onclick = () => selectRace(i);
  raceGrid.appendChild(div);
}

document.getElementById("backBtn").onclick = ()=>{
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("stadiumScreen").classList.remove("hidden");
};

/* ===============================
   画面遷移
=============================== */
let selectedStadiumIndex = 0;

function selectStadium(i){
  selectedStadiumIndex = i;
  document.getElementById("stadiumScreen").classList.add("hidden");
  document.getElementById("raceScreen").classList.remove("hidden");
  document.getElementById("raceTitle").textContent = stadiums[i];
}

function selectRace(raceNum){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  calcAllWithTrend(selectedStadiumIndex);
}

/* ===============================
   ダミー過去傾向データ（24場）
=============================== */
const pastTrend = [
  [60,50,45,40,35,30],[55,50,50,45,40,35],[50,45,50,40,35,30],[60,55,50,45,40,35],
  [55,50,45,40,35,30],[50,45,40,35,30,25],[60,55,50,45,40,35],[55,50,45,40,35,30],
  [50,45,40,35,30,25],[60,55,50,45,40,35],[55,50,45,40,35,30],[50,45,40,35,30,25],
  [60,55,50,45,40,35],[55,50,45,40,35,30],[50,45,40,35,30,25],[60,55,50,45,40,35],
  [55,50,45,40,35,30],[50,45,40,35,30,25],[60,55,50,45,40,35],[55,50,45,40,35,30],
  [50,45,40,35,30,25],[60,55,50,45,40,35],[55,50,45,40,35,30],[50,45,40,35,30,25]
];

/* ===============================
   メイン計算
=============================== */
function calcAllWithTrend(stadiumIndex){
  let base=[], predict=[], ai=[];
  const trend = pastTrend[stadiumIndex];

  for(let i=0;i<6;i++){
    const b = Math.floor(40 + Math.random()*40);
    const p = Math.floor(35 + Math.random()*45);
    const t = trend[i];
    const a = Math.round(b*0.3 + p*0.5 + t*0.2);

    base.push(b);
    predict.push(p);
    ai.push(a);
  }

  // 各表示更新
  updateExpectationBars(base,predict,ai);
  updateKimarite();
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHoleBets(ai);
  updateHitRateSimulation(base,predict,ai);
  updateConfidenceMeterFinal(ai, stadiumIndex);
}

/* ===============================
   総合期待度バー
=============================== */
function updateExpectationBars(base,predict,ai){
  const colors = ["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const labels = ["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{
    const barBox = row.querySelector(".expectation-bar");
    barBox.innerHTML = "";

    [base[i],predict[i],ai[i]].forEach((val,j)=>{
      const line = document.createElement("div");
      line.className = "bar-line";

      const label = document.createElement("span");
      label.className = "bar-label";
      label.textContent = labels[j];

      const outer = document.createElement("div");
      outer.style.flex="1";
      outer.style.height="14px";
      outer.style.border="1px solid #333";
      outer.style.background="#eee";
      outer.style.position="relative";
      outer.style.borderRadius="4px";

      const bar = document.createElement("div");
      bar.style.height="100%";
      bar.style.width=val+"%";
      bar.style.background=colors[i];
      bar.style.border="1px solid #000";

      const text = document.createElement("span");
      text.className="bar-text";
      text.textContent = val+"%";
      text.style.position="absolute";
      text.style.right="4px";
      text.style.top="0";
      text.style.fontSize="10px";

      outer.appendChild(bar);
      outer.appendChild(text);
      line.appendChild(label);
      line.appendChild(outer);
      barBox.appendChild(line);
    });

    row.querySelector(".expectation-value").textContent = ai[i]+"%";
  });
}

/* ===============================
   決まり手
=============================== */
function updateKimarite(){
  document.querySelectorAll(".kimarite-row").forEach(row=>{
    const v = Math.floor(10 + Math.random()*75);
    row.querySelector(".bar div").style.width = v+"%";
    row.querySelector(".value").textContent = v+"%";
  });
}

/* ===============================
   展開タイプ
=============================== */
function updateRaceTypeByAI(ai){
  const inner = ai[0];
  const middle = (ai[1]+ai[2]+ai[3])/3;
  const outer = (ai[4]+ai[5])/2;

  const max=Math.max(...ai);
  const min=Math.min(...ai);

  let type = "";
  if(inner>middle+10 && inner>outer+15) type="イン逃げ主導型";
  else if(middle>inner && middle>outer) type="中枠攻め合い型";
  else if(outer>inner && outer>middle) type="外伸び波乱型";
  else if(max-min<8) type="超混戦型";
  else type="バランス型";

  document.getElementById("race-type").textContent = "展開タイプ : "+type;
}

/* ===============================
   展開解析
=============================== */
function updateAnalysis(ai){
  const order=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
  const main=order[0].i;
  const sub=order[1].i;

  let text="";
  if(main===1) text="1コースが主導権。イン有利展開。";
  else if(main<=3) text="中枠中心で流れが動く。";
  else text="外枠優勢で波乱含み。";
  text += `\n軸は${main}コース、対抗${sub}コース。`;

  document.querySelector(".analysis-text").textContent=text;
}

/* ===============================
   買い目（本命・対抗・逃げ）
=============================== */
function updateBets(ai){
  const sorted=ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
  const main=sorted[0].i;
  const sub=sorted[1].i;
  const third=sorted[2].i;

  const others=[1,2,3,4,5,6].filter(n=>![main,sub,third].includes(n));
  const cols=document.querySelectorAll(".bet-col");

  if(cols.length>=3){
    setCol(cols[0],[`${main}-${sub}-${third}`,`${main}-${third}-${sub}`,`${sub}-${main}-${third}`]);
    setCol(cols[1],[`${sub}-${main}-${third}`,`${third}-${main}-${sub}`,`${sub}-${third}-${main}`]);
    setCol(cols[2],[`1-${others[0]}-${others[1]}`,`1-${others[1]}-${others[0]}`,`1-${others[2]}-${others[3]}`]);
  }
}

function setCol(col,arr){
  col.querySelectorAll(".bet-item").forEach((el,i)=>{
    el.textContent=arr[i]||"";
  });
}

/* ===============================
   穴買い目
=============================== */
function updateHoleBets(ai){
  const sorted = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);
  const main=sorted[0].i;
  const sub=sorted[1].i;
  const third=sorted[2].i;
  const others=[1,2,3,4,5,6].filter(n=>![main,sub,third].includes(n));

  const col=document.querySelectorAll(".bet-col")[3];
  if(!col) return;
  const bets=[`${others[0]}-${others[1]}-${others[2]}`,`${others[0]}-${others[2]}-${others[1]}`,`${others[1]}-${others[0]}-${others[2]}`];
  setCol(col,bets);
}

/* ===============================
   的中率シミュレーション
=============================== */
function updateHitRateSimulation(base,predict,ai){
  const rows=document.querySelectorAll("#hitRateSection .hitrate-row");
  const colors=["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const light=["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];

  rows.forEach((row,i)=>{
    const rate=Math.round((base[i]+predict[i]+ai[i])/3);
    row.querySelector(".hitrate-value").textContent=rate+"%";
    const bar=row.querySelector(".hitrate-bar div");
    row.querySelector(".hitrate-bar").style.background=light[i];
    bar.style.width=rate+"%";
    bar.style.background=colors[i];
  });
}

/* ===============================
   信頼度メーター（過去傾向＋AI統合）
=============================== */
function updateConfidenceMeterFinal(ai,stadiumIndex){
  const max=Math.max(...ai);
  const min=Math.min(...ai);
  const hardness = Math.min(Math.round(max*1.2),100);
  const volatility = Math.min(Math.round((max-ai[2])*2),100);
  let reliability = hardness - volatility;
  if(reliability<0) reliability=0;
  if(reliability>100) reliability=100;

  const past = pastTrend[stadiumIndex] || [60,55,50,45,40,35];
  const finalHard = Math.round(hardness*0.6 + past[0]*0.4);
  const finalVol = Math.round(volatility*0.6 + past[1]*0.4);
  let finalRel = finalHard - finalVol;
  if(finalRel<0) finalRel=0; if(finalRel>100) finalRel=100;

  let box=document.getElementById("confidenceSection");
  if(!box){
    box=document.createElement("section");
    box.id="confidenceSection";
    box.style.marginTop="20px";
    document.getElementById("playerScreen").appendChild(box);
  }

  box.innerHTML=`
    <h2>最終信頼度メーター（過去傾向＋AI）</h2>
    <div class="confidence-row" style="display:flex;align-items:center;margin-bottom:6px;">
      <span style="width:120px;">堅さスコア</span>
      <div class="conf-bar" style="flex:1;height:14px;border:1px solid #333;background:#eee;border-radius:4px;margin:0 8px;">
        <div style="width:${finalHard}%;height:100%;background:#33cc66;border:1px solid #000;box-sizing:border-box;"></div>
      </div>
      <span>${finalHard}%</span>
    </div>
    <div class="confidence-row" style="display:flex;align-items:center;margin-bottom:6px;">
      <span style="width:120px;">荒れ指数</span>
      <div class="conf-bar" style="flex:1;height:14px;border:1px solid #333;background:#ffe5e5;border-radius:4px;margin:0 8px;">
        <div style="width:${Math.min(finalVol,100)}%;height:100%;background:#ff3333;border:1px solid #000;box-sizing:border-box;"></div>
      </div>
      <span>${finalVol}%</span>
    </div>
    <div class="confidence-row" style="display:flex;align-items:center;margin-bottom:6px;">
      <span style="width:120px;">総合信頼度</span>
      <div class="conf-bar" style="flex:1;height:14px;border:1px solid #333;background:#fff7cc;border-radius:4px;margin:0 8px;">
        <div style="width:${finalRel}%;height:100%;background:#ffcc00;border:1px solid #000;box-sizing:border-box;"></div>
      </div>
      <span>${finalRel}%</span>
    </div>
  `;
    }
