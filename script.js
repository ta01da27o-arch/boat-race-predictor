const stadiums = [
"桐生","戸田","江戸川","平和島","多摩川","浜名湖",
"蒲郡","常滑","津","三国","びわこ","住之江",
"尼崎","鳴門","丸亀","児島","宮島","徳山",
"下関","若松","芦屋","福岡","唐津","大村"
];

const grid = document.getElementById("stadiumGrid");
const header = document.getElementById("headerText");
const detail = document.getElementById("detail");

let candidateCount = Math.floor(Math.random()*6)+8;
header.textContent = `候補レース数 ${candidateCount}R`;

stadiums.forEach(name => {
  const d = document.createElement("div");
  d.className = "stadium";
  d.textContent = name;
  d.onclick = () => openDetail(name);
  grid.appendChild(d);
});

function openDetail(name) {
  grid.style.display = "none";
  detail.classList.remove("hidden");
  document.getElementById("stadiumName").textContent = name;
  renderPlayers();
}

function back() {
  detail.classList.add("hidden");
  grid.style.display = "grid";
}

function renderPlayers() {
  const wrap = document.getElementById("players");
  wrap.innerHTML = "";

  for (let c=1;c<=6;c++) {
    const div = document.createElement("div");
    div.className="player";
    div.innerHTML=`<strong>${c}コース</strong><div id="bars${c}"></div>`;
    wrap.appendChild(div);
    renderBars(c);
  }
  analyze();
}

function renderBars(c) {
  const bars=document.getElementById(`bars${c}`);
  bars.innerHTML="";
  let patterns=[];

  if(c===1) patterns=["逃げ","差され","捲られ","捲り差され"];
  else if(c===2) patterns=["逃がし","差し","捲り"];
  else patterns=["差し","捲り","捲り差し"];

  patterns.forEach(p=>{
    const v=Math.floor(Math.random()*40)+10;
    bars.innerHTML+=`
      <div class="bar">
        <div class="bar-fill" style="width:${v}%"></div>
        <div class="bar-text">${p} ${v}%</div>
      </div>`;
  });
}

function analyze(){
  const attack=[4,5];
  const head=attack[Math.floor(Math.random()*attack.length)];
  const second=2;
  const thirds=[1,3,6].filter(n=>n!==head);

  document.getElementById("analysisText").textContent=
    `${attack.join("・")}コースが攻めの中心。
内側は抵抗弱く、${second}コースの差しが有力。
展開は外寄り。`;

  let bets="";
  thirds.slice(0,3).forEach(t=>{
    bets+=`${head}-${second}-${t}<br>`;
  });
  document.getElementById("betsText").innerHTML=bets;
}