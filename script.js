/* ===== 場データ（仮） ===== */
const stadiumData = {
  桐生: {
    1: ["イン逃げ率高め", "捲り率低下傾向"],
  },
  戸田: {
    1: ["差しが決まりやすい", "スタート重要"],
  }
};

/* ===== 24場一覧 ===== */
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

/* ===== 24場描画 ===== */
stadiums.forEach(name => {
  const card = document.createElement("div");
  card.className = "stadium-card";
  card.textContent = name;

  card.addEventListener("click", () => {
    openDetail(name);
  });

  grid.appendChild(card);
});

/* ===== 詳細画面表示 ===== */
function openDetail(stadiumName) {
  screenStadium.classList.add("hidden");
  screenDetail.classList.remove("hidden");

  detailHeader.textContent = stadiumName;

  updateDescription(stadiumName, monthSelect.value);

  monthSelect.onchange = () => {
    updateDescription(stadiumName, monthSelect.value);
  };
}

/* ===== 説明更新 ===== */
function updateDescription(stadiumName, month) {
  const data = stadiumData[stadiumName]?.[month];

  if (!data) {
    description.innerHTML = "データ準備中";
    return;
  }

  description.innerHTML = data.join("<br>");
}