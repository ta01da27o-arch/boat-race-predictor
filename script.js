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
  laneData = [];
  analysisResult.textContent = "選手番号を入力してください";

  for (let i = 1; i <= 6; i++) {
    const lane = document.createElement("div");
    lane.className = "lane";

    lane.innerHTML = `
      <div class="lane-title">${i}枠</div>
      <input type="number" placeholder="選手番号">
      <div class="finish"></div>
    `;

    const input = lane.querySelector("input");
    const finish = lane.querySelector(".finish");

    input.oninput = () => {
      if (!input.value) return;
      const rates = dummyFinish(i, Number(input.value));
      laneData[i-1] = { lane: i, rates };
      finish.innerHTML = finishHTML(i, rates);
      analyze();
    };

    lanesDiv.appendChild(lane);
  }
}

/* ===== 仮データ生成 ===== */
function dummyFinish(lane, n) {

  /* 1コース：守備系 */
  if (lane === 1) {
    return {
      escape: 45 + n % 20,        // 逃げ
      diffed: 15 + n % 15,        // 差され
      makurare: 10 + n % 10,      // 捲られ
      makuriDiffed: 8 + n % 10    // 捲り差され
    };
  }

  /* 2〜6コース：攻撃系 */
  return {
    diff: 15 + n % 15,
    makuri: 20 + n % 20,
    makuriDiff: 10 + n % 10
  };
}

/* ===== 表示 ===== */
function finishHTML(lane, f) {
  if (lane === 1) {
    return `
      ${row("逃げ", f.escape)}
      ${row("差され", f.diffed)}
      ${row("捲られ", f.makurare)}
      ${row("捲り差され", f.makuriDiffed)}
    `;
  }

  return `
    ${row("差し", f.diff)}
    ${row("捲り", f.makuri)}
    ${row("捲り差し", f.makuriDiff)}
  `;
}

function row(label, value) {
  return `
    <div class="finish-row">
      <div class="finish-label">${label}</div>
      <div class="finish-bar-bg">
        <div class="finish-bar" style="width:${value}%"></div>
      </div>${value}%
    </div>
  `;
}

/* ===== ⭐ 展開解析 ===== */
function analyze() {
  if (laneData.filter(Boolean).length < 6) return;

  /* 攻め役（2〜6） */
  const attackers = laneData.filter(d => d.lane !== 1);

  attackers.forEach(d => {
    const max = Object.entries(d.rates)
      .reduce((a,b)=>a[1]>b[1]?a:b);
    d.main = max[0];
    d.power = max[1];
  });

  const leader = attackers.reduce((a,b)=>a.power>b.power?a:b);

  /* 1コースの耐性 */
  const one = laneData[0];
  const weak = Object.entries(one.rates)
    .filter(([k]) => k !== "escape")
    .reduce((a,b)=>a[1]>b[1]?a:b);

  analysisResult.innerHTML = `
    ⭐ 主導権：${leader.lane}枠（${label(leader.main)}）<br>
    ⭐ 1コース弱点：${label1(weak[0])}
  `;
}

function label(t) {
  return {
    diff:"差し",
    makuri:"捲り",
    makuriDiff:"捲り差し"
  }[t];
}

function label1(t) {
  return {
    diffed:"差され",
    makurare:"捲られ",
    makuriDiffed:"捲り差され"
  }[t];
}