// ===============================
// 24場名 + JSONファイル紐付け
// ===============================
const stadiums = [
  { name:"桐生", file:"data/stadiums/kiryu.json" },
  { name:"戸田", file:"data/stadiums/toda.json" },
  { name:"江戸川", file:"data/stadiums/edogawa.json" },
  { name:"平和島", file:"data/stadiums/heiwajima.json" },
  { name:"多摩川", file:"data/stadiums/tamagawa.json" },
  { name:"浜名湖", file:"data/stadiums/hamanako.json" },
  { name:"蒲郡", file:"data/stadiums/gamagori.json" },
  { name:"常滑", file:"data/stadiums/tokoname.json" },
  { name:"津", file:"data/stadiums/tsu.json" },
  { name:"三国", file:"data/stadiums/mikuni.json" },
  { name:"びわこ", file:"data/stadiums/biwako.json" },
  { name:"住之江", file:"data/stadiums/suminoe.json" },
  { name:"尼崎", file:"data/stadiums/amagasaki.json" },
  { name:"鳴門", file:"data/stadiums/naruto.json" },
  { name:"丸亀", file:"data/stadiums/marugame.json" },
  { name:"児島", file:"data/stadiums/kojima.json" },
  { name:"宮島", file:"data/stadiums/miyajima.json" },
  { name:"徳山", file:"data/stadiums/tokuyama.json" },
  { name:"下関", file:"data/stadiums/shimonoseki.json" },
  { name:"若松", file:"data/stadiums/wakamatsu.json" },
  { name:"芦屋", file:"data/stadiums/ashiya.json" },
  { name:"福岡", file:"data/stadiums/fukuoka.json" },
  { name:"唐津", file:"data/stadiums/karatsu.json" },
  { name:"大村", file:"data/stadiums/omura.json" }
];

// ===============================
const courseColors = ["#ffffff","#000000","#ff0000","#0000ff","#ffff00","#00ff00"];

const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");

stadiums.forEach((stadium,i)=>{
  const div = document.createElement("div");
  div.className = "stadium";
  div.textContent = stadium.name;
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

document.getElementById("backBtn").onclick = () => {
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("stadiumScreen").classList.remove("hidden");
};

// ===============================
let currentStadiumIndex = 0;

function selectStadium(i){
  currentStadiumIndex = i;
  document.getElementById("stadiumScreen").classList.add("hidden");
  document.getElementById("raceScreen").classList.remove("hidden");
  document.getElementById("raceTitle").textContent = stadiums[i].name;
}

async function selectRace(){
  document.getElementById("raceScreen").classList.add("hidden");
  document.getElementById("playerScreen").classList.remove("hidden");
  await calcAllWithJSON(currentStadiumIndex);
}

// ===============================
async function calcAllWithJSON(stadiumIndex){

  const file = stadiums[stadiumIndex].file;
  let jsonData = [];

  try{
    const resp = await fetch(file);
    jsonData = await resp.json();
  }catch(e){
    console.error("JSON取得エラー:", e);
  }

  const base = jsonData.base || [50,50,50,50,50,50];
  const predict = jsonData.predict || [50,50,50,50,50,50];
  const ai = jsonData.ai || [50,50,50,50,50,50];

  updateExpectationBars(base,predict,ai);
  updateKimarite(base);
  updateRaceTypeByAI(ai);
  updateAnalysis(ai);
  updateBets(ai);
  updateHitRateSimulation(base,predict,ai);
  updateTrustMeter(ai);
}

// ===============================
function updateExpectationBars(base,predict,ai){

  const labels = ["実績","予測","AI"];

  document.querySelectorAll(".expectation-row").forEach((row,i)=>{

    const barBox = row.querySelector(".expectation-bar");
    barBox.innerHTML = "";

    [base[i],predict[i],ai[i]].forEach((val,j)=>{

      const container = document.createElement("div");
      container.style.display="flex";
      container.style.alignItems="center";
      container.style.marginBottom="2px";

      const label = document.createElement("span");
      label.textContent = labels[j];
      label.style.width="40px";
      label.style.fontSize="12px";
      label.style.marginRight="6px";

      const outer = document.createElement("div");
      outer.style.flex="1";
      outer.style.height="14px";
      outer.style.border="1px solid #333";
      outer.style.borderRadius="4px";
      outer.style.background="#ddd";

      const bar = document.createElement("div");
      bar.style.height="100%";
      bar.style.width = val + "%";
      bar.style.background = courseColors[i];

      outer.appendChild(bar);
      container.appendChild(label);
      container.appendChild(outer);

      barBox.appendChild(container);
    });

    row.querySelector(".expectation-value").textContent = ai[i] + "%";
  });
}

// ===============================
function updateKimarite(base){
  const rows = document.querySelectorAll(".kimarite-row");
  rows.forEach((row,i)=>{
    const baseVal = base[i] || 0;
    let v = Math.round(baseVal*0.85 + Math.random()*10);
    v = Math.max(1,Math.min(100,v));
    row.querySelector(".bar div").style.width = v + "%";
    row.querySelector(".value").textContent = v + "%";
  });
}

// ===============================
function updateRaceTypeByAI(ai){

  const inner = ai[0];
  const middle = (ai[1]+ai[2]+ai[3])/3;
  const outer = (ai[4]+ai[5])/2;

  let type="";

  if(inner>middle+10 && inner>outer+15) type="イン逃げ主導型";
  else if(middle>inner && middle>outer) type="中枠攻め合い型";
  else if(outer>inner && outer>middle) type="外伸び波乱型";
  else if(Math.max(...ai)-Math.min(...ai)<8) type="超混戦型";
  else type="バランス型";

  document.getElementById("race-type").textContent="展開タイプ : "+type;
}

// ===============================
// 📰 新・競艇新聞超え 展開解析
// ===============================
function updateAnalysis(ai){

  const ranked = ai.map((v,i)=>({score:v, course:i+1}))
                   .sort((a,b)=>b.score-a.score);

  const top = ranked[0];
  const second = ranked[1];
  const third = ranked[2];
  const bottom = ranked[5];

  const gapTopSecond = top.score - second.score;
  const gapAll = top.score - bottom.score;

  const inner = ai[0];
  const middle = (ai[1] + ai[2] + ai[3]) / 3;
  const outer = (ai[4] + ai[5]) / 2;

  let tone = "";
  let text = "";

  if(gapAll > 35) tone = "堅い決着濃厚";
  else if(gapAll > 22) tone = "本命優勢";
  else if(gapAll > 12) tone = "混戦模様";
  else tone = "大波乱警戒";

  if(inner > middle + 10 && inner > outer + 15){

    if(gapTopSecond > 15){
      text = `1コースがスタートから主導権を完全掌握。
先マイから独走態勢に持ち込み後続を大きく引き離す展開。
${second.course}コースが差しで続き対抗一番手。
${third.course}コースは展開待ちで三着争いまで。
内枠中心の堅い決着が濃厚となりそうだ。`;
    }else{
      text = `1コースが先行態勢に入るが後続も鋭く迫る流れ。
${second.course}コースの差しがどこまで食い下がるかが焦点。
${third.course}コースも展開を突いて浮上可能。
イン有利ながら一波乱含みの一戦となりそうだ。`;
    }

  }else if(middle > inner && middle > outer){

    text = `2・3・4コース勢が果敢に仕掛け主導権争いが激化。
1コースは包まれ気味で先マイに苦戦する展開。
${top.course}コースが攻めの中心となりレースを支配。
${second.course}コースが差し構えで続く形。
着順入れ替わり頻発の混戦レースとなりそうだ。`;

  }else if(outer > inner && outer > middle){

    text = `外枠勢の伸び足が目立ち一気に攻勢。
${top.course}コースのまくり差しが豪快に決まる可能性十分。
${second.course}コースも続き高配当演出の場面も。
イン勢は抵抗するも押し切りは容易でなく波乱含みの展開。`;

  }else if(gapAll < 8){

    text = `各コース実力差ほとんどなく横一線の争い。
スタートひとつで隊形が激変する超混戦レース。
${top.course}コースがやや優勢も断定は禁物。
波乱決着も十分想定される一戦だ。`;

  }else{

    text = `内外の力関係が拮抗したバランス型の展開。
${top.course}コースが中心視されるが後続も虎視眈々。
${second.course}コースが差し構え、
${third.course}コースが攻めて展開を作る流れ。
読みづらく妙味十分の一戦となりそうだ。`;

  }

  text += `（総評：${tone}）`;

  document.querySelector(".analysis-text").textContent = text;
}

// ===============================
function updateBets(ai){

  const sorted = ai.map((v,i)=>({v,i:i+1})).sort((a,b)=>b.v-a.v);

  const main = sorted[0].i;
  const sub = sorted[1].i;
  const third = sorted[2].i;

  const all=[1,2,3,4,5,6];

  let bets=[];

  bets.push(`${main}-${sub}-${third}`);
  bets.push(`${main}-${third}-${sub}`);
  bets.push(`${sub}-${main}-${third}`);
  bets.push(`${sub}-${third}-${main}`);
  bets.push(`${third}-${main}-${sub}`);
  bets.push(`${third}-${sub}-${main}`);

  all.forEach(a=>{
    all.forEach(b=>{
      if(a!==1 && b!==1 && a!==b){
        bets.push(`1-${a}-${b}`);
      }
    });
  });

  bets=[...new Set(bets)].slice(0,9);

  const cols=document.querySelectorAll(".bet-col");

  cols.forEach((col,j)=>{
    const items=col.querySelectorAll(".bet-item");
    items.forEach((el,i)=>{
      el.textContent = bets[j*3+i] || "";
    });
  });
}

// ===============================
function updateHitRateSimulation(base,predict,ai){

  const rows=document.querySelectorAll(".hitrate-row");

  rows.forEach((row,i)=>{

    let rate=Math.round((base[i]+predict[i]+ai[i])/3);
    rate=Math.max(1,Math.min(100,rate));

    row.querySelector(".hitrate-value").textContent = rate+"%";

    const bar=row.querySelector(".hitrate-bar div");

    bar.style.width = rate + "%";
    bar.style.background = courseColors[i];

    const container=row.querySelector(".hitrate-bar");
    container.style.border="1px solid #333";
    container.style.height="14px";
    container.style.borderRadius="4px";
    container.style.background="#ddd";
  });
}

// ===============================
function updateTrustMeter(ai){

  const max=Math.max(...ai);
  const min=Math.min(...ai);

  let solidity=Math.round((max-min)*1.5);

  const avg=ai.reduce((a,b)=>a+b,0)/6;

  let variance=Math.round(
    ai.reduce((s,v)=>s+Math.abs(v-avg),0)/6*1.8
  );

  solidity=Math.min(100,solidity);
  variance=Math.min(100,variance);

  let trust=Math.round(solidity-variance*0.6);
  trust=Math.max(0,Math.min(100,trust));

  let box=document.getElementById("trustMeter");

  if(!box){
    box=document.createElement("div");
    box.id="trustMeter";
    box.style.margin="16px 10px";
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

// ===============================
function updateTodayDate(){

  const now = new Date();

  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  const el = document.getElementById("todayDate");

  if(el){
    el.textContent = `${y}年${m}月${d}日`;
  }
}

updateTodayDate();
