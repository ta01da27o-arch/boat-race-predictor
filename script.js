const stadiums = [
  "桐生","戸田","江戸川","平和島","多摩川","浜名湖",
  "蒲郡","常滑","津","三国","びわこ","住之江",
  "尼崎","鳴門","丸亀","児島","宮島","徳山",
  "下関","若松","芦屋","福岡","唐津","大村"
];

const grid = document.getElementById("stadiumGrid");
const screenStadium = document.getElementById("screen-stadium");
const screenDetail = document.getElementById("screen-detail");
const detailHeader = document.getElementById("detailHeader");
const desc = document.getElementById("stadiumDescription");
const lanesDiv = document.getElementById("lanes");
const rankBars = document.getElementById("rankBars");
const analysisResult = document.getElementById("analysisResult");
const buyResult = document.getElementById("buyResult");
const trustResult = document.getElementById("trustResult");

document.getElementById("backBtn").onclick = () => {
  screenDetail.classList.add("hidden");
  screenStadium.classList.remove("hidden");
};

stadiums.forEach(name => {
  const d = document.createElement("div");
  d.className = "stadium-card";
  d.textContent = name;
  d.onclick = () => openDetail(name);
  grid.appendChild(d);
});

let laneData = [];

function openDetail(name) {
  screenStadium.classList.add("hidden");
  screenDetail.classList.remove("hidden");
  detailHeader.textContent = name;
  desc.innerHTML = "イン有利傾向 / 冬季は捲り控えめ";
  lanesDiv.innerHTML = "";
  rankBars.innerHTML = "";
  analysisResult.innerHTML = "";
  buyResult.innerHTML = "";
  trustResult.innerHTML = "";
  laneData = [];

  for (let i = 1; i <= 6; i++) {
    const lane = document.createElement("div");
    lane.className = "lane";
    lane.innerHTML = `
      <div class="lane-title">${i}コース</div>
      <input type="number" placeholder="選手番号">
      <div class="finish"></div>
    `;
    const input = lane.querySelector("input");
    input.oninput = () => {
      if (!input.value) return;
      laneData[i-1] = calcPower(i, Number(input.value));
      renderAll();
    };
    lanesDiv.appendChild(lane);
  }
}

function calcPower(lane, n) {
  let score;
  if (lane === 1) {
    score = 45 + n % 20 - 20;
  } else {
    score = 20 + n % 40;
  }
  return { lane, score: Math.max(5, score) };
}

function renderAll() {
  if (laneData.filter(Boolean).length < 6) return;

  laneData.sort((a,b)=>b.score-a.score);
  const total = laneData.reduce((s,d)=>s+d.score,0);

  rankBars.innerHTML = "";
  laneData.forEach((d,i)=>{
    const kill = i>=4;
    rankBars.innerHTML += `
      <div class="rank-row ${kill?"kill":""}">
        <div class="rank-label">${d.lane}C</div>
        <div class="rank-bar-bg">
          <div class="rank-bar" style="width:${d.score}%"></div>
        </div>${d.score}%
      </div>
    `;
  });

  const main = laneData[0];
  const sub = laneData[1];
  const third = laneData[2];

  analysisResult.innerHTML =
    `主導権は${main.lane}コース。<br>
     ${sub.lane}コースが追走、${third.lane}コースが展開待ち。`;

  buyResult.innerHTML = `
    ${main.lane}-${sub.lane}-${third.lane}<br>
    ${sub.lane}-${main.lane}-${third.lane}<br>
    ${main.lane}-${third.lane}-${sub.lane}<br>
    ${sub.lane}-${third.lane}-${main.lane}
  `;

  const topRate = (main.score+sub.score)/total*100;
  trustResult.innerHTML =
    topRate>65 ? "A（堅い）" :
    topRate>55 ? "B（標準）" : "C（荒れ注意）";
}