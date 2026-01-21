/* =========================
   24場データ
========================= */
const stadiums = [
  "桐生","戸田","江戸川","平和島",
  "多摩川","浜名湖","蒲郡","常滑",
  "津","三国","びわこ","住之江",
  "尼崎","鳴門","丸亀","児島",
  "宮島","徳山","下関","若松",
  "芦屋","福岡","唐津","大村"
];

const candidateStadiums = ["桐生", "住之江", "丸亀"];

/* =========================
   DOM取得
========================= */
const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");
const stadiumScreen = document.getElementById("stadiumScreen");
const raceScreen = document.getElementById("raceScreen");
const raceTitle = document.getElementById("raceTitle");
const backBtn = document.getElementById("backBtn");

/* =========================
   24場生成
========================= */
stadiums.forEach(name => {
  const btn = document.createElement("button");
  btn.className = "stadium-btn";
  btn.textContent = name;

  if (candidateStadiums.includes(name)) {
    btn.classList.add("active");
  }

  btn.addEventListener("click", () => {
    showRaceScreen(name);
  });

  stadiumGrid.appendChild(btn);
});

/* =========================
   レース画面表示
========================= */
function showRaceScreen(stadiumName) {
  stadiumScreen.classList.add("hidden");
  raceScreen.classList.remove("hidden");

  raceTitle.textContent = stadiumName;

  raceGrid.innerHTML = "";

  for (let i = 1; i <= 12; i++) {
    const btn = document.createElement("button");
    btn.className = "race-btn";
    btn.textContent = `${i}R`;

    if ([4,5,9].includes(i)) {
      btn.classList.add("active");
    }

    raceGrid.appendChild(btn);
  }
}

/* =========================
   戻る
========================= */
backBtn.addEventListener("click", () => {
  raceScreen.classList.add("hidden");
  stadiumScreen.classList.remove("hidden");
});