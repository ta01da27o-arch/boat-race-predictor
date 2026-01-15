/* ===== 仮・場データ ===== */
const stadiumData = {
  default: {
    1: ["イン有利傾向", "展開次第で差し"]
  }
};

/* ===== 仮・選手データ ===== */
function getDummyPlayerData(number) {
  return {
    grade: ["A1","A2","B1","B2"][number % 4],
    win: (5.0 + (number % 30) * 0.1).toFixed(2),
    local: (4.5 + (number % 20) * 0.1).toFixed(2),
    st: (0.10 + (number % 5) * 0.02).toFixed(2)
  };
}

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
const description = document.getElementById("stadiumDescription");
const monthSelect = document.getElementById("monthSelect");
const backBtn = document.getElementById("backBtn");
const lanes = document.getElementById("lanes");

/* ===== 24場 ===== */
stadiums.forEach(name => {
  const card = document.createElement("div");
  card.className = "stadium-card";
  card.textContent = name;
  card.onclick = () => openDetail(name);
  grid.appendChild(card);
});

/* ===== 詳細 ===== */
function openDetail(name) {
  screenStadium.classList.add("hidden");
  screenDetail.classList.remove("hidden");

  detailHeader.textContent = name;
  description.innerHTML = stadiumData.default[1].join("<br>");

  lanes.innerHTML = "";

  for (let i = 1; i <= 6; i++) {
    const lane = document.createElement("div");
    lane.className = "lane";

    lane.innerHTML = `
      <div class="lane-title">${i}枠</div>
      <input type="number" placeholder="選手番号">
      <div class="player-data">番号入力で仮データ表示</div>
    `;

    const input = lane.querySelector("input");
    const dataDiv = lane.querySelector(".player-data");

    input.oninput = () => {
      if (!input.value) {
        dataDiv.textContent = "番号入力で仮データ表示";
        return;
      }
      const d = getDummyPlayerData(Number(input.value));
      dataDiv.innerHTML =
        `階級：${d.grade} / 全勝率：${d.win}<br>` +
        `当地勝率：${d.local} / 平ST：${d.st}`;
    };

    lanes.appendChild(lane);
  }
}

backBtn.onclick = () => {
  screenDetail.classList.add("hidden");
  screenStadium.classList.remove("hidden");
};