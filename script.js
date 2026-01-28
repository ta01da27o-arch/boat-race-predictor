// ===============================
// 24場名（正式）
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
// 過去傾向補正値（A）
// ===============================
const pastBias = [18, 8, 0, -5, -10, -15];

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

function selectRace(r){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  calcAll();
}

// ===============================
// メイン計算
// ===============================
function calcAll(){

  let base=[];
  let predict=[];
  let ai=[];

  for(let i=0;i<6;i++){
    const b = Math.floor(40+Math.random()*40);
    const p = Math.floor(35+Math.random()*45);

    base.push(b + pastBias[i]);
    predict.push(p + pastBias[i]);
  }

  for(let i=0;i<6;i++){
    ai.push(Math.round(base[i]*0.4 + predict[i]*0.6));
  }

  normalize(base);
  normalize(predict);
  normalize(ai);

  updateExpectationBars(base,predict,ai);
  updateKimarite();
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);
}

// ===============================
// 正規化（最大100%）
// ===============================
function normalize(arr){
  const max = Math.max(...arr);
  for(let i=0;i<arr.length;i++){
    arr[i] = Math.max(1, Math.round(arr[i] / max * 100));
  }
}

// ===============================
// 総合期待度
// ===============================
function updateExpectationBars(base,predict,ai){

  const colors=["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const labels=["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{

    const box=row.querySelector(".expectation-bar");
    box.innerHTML="";

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
      bar.style.border=(i===0?"2px":"1px")+" solid #000";

      const txt=document.createElement("span");
      txt.className="bar-text";
      txt.textContent=val+"%";

      outer.appendChild(bar);
      outer.appendChild(txt);

      line.appendChild(label);
      line.appendChild(outer);
      box.appendChild(line);
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
    const v=Math.floor(20+Math.random()*70);
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

  let type="";
  if(inner>middle+10) type="イン逃げ主導型";
  else if(middle>outer) type="中枠攻め合い型";
  else if(outer>inner) type="外伸び波乱型";
  else type="バランス型";

  document.getElementById("race-type").textContent="展開タイプ : "+type;
}

// ===============================
// 展開解析
// ===============================
function updateAnalysis(ai){

  const order=ai.map((v,i)=>({v,i:i+1}))
    .sort((a,b)=>b.v-a.v);

  const main=order[0].i;
  const sub=order[1].i;

  let txt="";

  if(main===1) txt="1コースが主導権。逃げ中心展開。";
  else if(main<=3) txt="中枠主導で展開流動的。";
  else txt="外枠強襲で波乱傾向。";

  txt+=`\n軸：${main}コース　対抗：${sub}コース`;

  document.querySelector(".analysis-text").textContent=txt;
}

// ===============================
// 買い目（逃げは必ず1頭）
// ===============================
function updateBets(ai){

  const sorted=[0,1,2,3,4,5]
    .map(i=>({v:ai[i],i:i+1}))
    .sort((a,b)=>b.v-a.v);

  let main=sorted[0].i;
  let sub=sorted[1].i;
  let third=sorted[2].i;

  if(main!==1){
    main=1;
    const others=sorted.filter(x=>x.i!==1);
    sub=others[0].i;
    third=others[1].i;
  }

  const cols=document.querySelectorAll(".bet-col");

  setCol(cols[0],[`${main}-${sub}-${third}`,`${main}-${third}-${sub}`,`${sub}-${main}-${third}`]);
  setCol(cols[1],[`${sub}-${third}-${main}`,`${sub}-${main}-${third}`,`${third}-${sub}-${main}`]);
  setCol(cols[2],[`${main}-${sub}-${third}`,`${main}-${third}-${sub}`,`${sub}-${main}-${third}`]);
}

function setCol(col,arr){
  col.querySelectorAll(".bet-item").forEach((el,i)=>{
    el.textContent=arr[i]||"";
  });
}

// ===============================
// 的中率シミュレーション（連動）
// ===============================
function updateHitRateSimulation(base,predict,ai){

  const cont=document.getElementById("hitRateSection");
  if(!cont) return;

  cont.innerHTML="";

  const colors=["#fff","#000","#ff3333","#3366ff","#ffcc00","#33cc66"];
  const lights=["#fff","#eee","#ffe5e5","#e5f0ff","#fff7cc","#e5ffe5"];

  for(let i=0;i<6;i++){

    const row=document.createElement("div");
    row.className="hitrate-row";
    row.style.display="flex";
    row.style.alignItems="center";
    row.style.marginBottom="6px";

    const label=document.createElement("span");
    label.textContent=i+1;
    label.style.width="28px";
    label.style.textAlign="right";
    label.style.marginRight="8px";

    const outer=document.createElement("div");
    outer.style.flex="1";
    outer.style.height="14px";
    outer.style.border="1px solid #333";
    outer.style.background=lights[i];
    outer.style.position="relative";
    outer.style.borderRadius="4px";

    const rate=Math.round((base[i]+predict[i]+ai[i])/3);

    const bar=document.createElement("div");
    bar.style.height="100%";
    bar.style.width=rate+"%";
    bar.style.background=colors[i];
    bar.style.border="1px solid #000";

    const txt=document.createElement("span");
    txt.className="bar-text";
    txt.textContent=rate+"%";

    outer.appendChild(bar);
    outer.appendChild(txt);

    row.appendChild(label);
    row.appendChild(outer);

    cont.appendChild(row);
  }
}