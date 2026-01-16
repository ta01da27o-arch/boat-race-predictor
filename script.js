/* ===== 既存部分そのまま ===== */
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
const analysisResult = document.getElementById("analysisResult");
const rankBars = document.getElementById("rankBars");

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
  desc.innerHTML = "イン有利傾向<br>冬季は捲り控えめ";
  lanesDiv.innerHTML = "";
  rankBars.innerHTML = "";
  analysisResult.innerHTML = "選手番号を入力してください";
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
    const finish = lane.querySelector(".finish");

    input.oninput = () => {
      if (!input.value) return;
      const rates = dummyRates(i, Number(input.value));
      laneData[i-1] = { lane: i, rates };
      finish.innerHTML = finishHTML(i, rates);
      updateRanks();
      updateFinishPrediction();
    };

    lanesDiv.appendChild(lane);
  }
}

/* ===== 仮データ ===== */
function dummyRates(lane, n) {
  if (lane === 1) {
    return {
      escape: 40 + n % 25,
      diffed: 15,
      makurare: 15,
      makuriDiffed: 10
    };
  }
  return {
    diff: 15 + n % 15,
    makuri: 20 + n % 20,
    makuriDiff: 10 + n % 10
  };
}

/* ===== 決まり手表示 ===== */
function finishHTML(lane, f) {
  if (lane === 1) {
    return row("逃げ", f.escape)
      + row("差され", f.diffed)
      + row("捲られ", f.makurare)
      + row("捲り差され", f.makuriDiffed);
  }
  return row("差し", f.diff)
    + row("捲り", f.makuri)
    + row("捲り差し", f.makuriDiff);
}

function row(label, v) {
  return `
    <div class="finish-row">
      <div class="finish-label">${label}</div>
      <div class="finish-bar-bg">
        <div class="finish-bar" style="width:${v}%"></div>
      </div>${v}%
    </div>
  `;
}

/* ===== 入着期待値 ===== */
function updateRanks() {
  if (laneData.filter(Boolean).length < 6) return;
  rankBars.innerHTML = "";

  laneData.forEach(d => {
    let value;
    if (d.lane === 1) {
      value = d.rates.escape -
        (d.rates.diffed + d.rates.makurare + d.rates.makuriDiffed) / 2;
    } else {
      value = Math.max(...Object.values(d.rates));
    }
    value = Math.max(5, Math.min(95, Math.round(value)));

    d.power = value;

    rankBars.innerHTML += `
      <div class="rank-row">
        <div class="rank-label">${d.lane}コース</div>
        <div class="rank-bar-bg">
          <div class="rank-bar" style="width:${value}%"></div>
        </div>${value}%
      </div>
    `;
  });
}

/* ===== ⭐ 1〜3着率算出 ===== */
function updateFinishPrediction() {
  if (laneData.filter(Boolean).length < 6) return;

  const total = laneData.reduce((s, d) => s + d.power, 0);

  const rates = laneData.map(d => ({
    lane: d.lane,
    rate1: Math.round((d.power / total) * 100),
  }));

  rates.sort((a, b) => b.rate1 - a.rate1);

  const first = rates[0];
  const second = rates[1];
  const third = rates[2];

  analysisResult.innerHTML = `
    <strong>⭐ 1〜3着率（最終予測）</strong><br><br>
    1着：${first.lane}コース ${first.rate1}%<br>
    2着：${second.lane}コース ${Math.round(first.rate1 * 0.65)}%<br>
    3着：${third.lane}コース ${Math.round(first.rate1 * 0.45)}%
  `;
}