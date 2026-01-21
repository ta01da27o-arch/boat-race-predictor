/* =========================
   初期設定
========================= */

// 24場（仮名）
const STADIUMS = [
  "桐生","戸田","江戸川","平和島",
  "多摩川","浜名湖","蒲郡","常滑",
  "津","三国","びわこ","住之江",
  "尼崎","鳴門","丸亀","児島",
  "宮島","徳山","下関","若松",
  "芦屋","福岡","唐津","大村"
];

// テスト用：候補レース（決め打ち）
const CANDIDATE_RACES = [3, 7, 11];

/* =========================
   DOM取得
========================= */
const stadiumScreen = document.getElementById("stadiumScreen");
const raceScreen = document.getElementById("raceScreen");

const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");

const raceTitle = document.getElementById("raceTitle");
const backBtn = document.getElementById("backBtn");

/* =========================
   24場グリッド生成
========================= */
STADIUMS.forEach((name) => {
  const btn = document.createElement("button");
  btn.className = "stadium";
  btn.textContent = name;

  btn.addEventListener("click", () => {
    showRaceScreen(name);
  });

  stadiumGrid.appendChild(btn);
});

/* =========================
   レース番号画面表示
========================= */
function showRaceScreen(stadiumName) {
  stadiumScreen.classList.add("hidden");
  raceScreen.classList.remove("hidden");

  raceTitle.textContent = stadiumName + "（レース選択）";

  raceGrid.innerHTML = "";

  // 1R〜12R生成
  for (let r = 1; r <= 12; r++) {
    const btn = document.createElement("button");
    btn.className = "race-btn";
    btn.textContent = r + "R";

    // ★ 候補レース（ピンク）
    if (CANDIDATE_RACES.includes(r)) {
      btn.classList.add("candidate");
    }

    raceGrid.appendChild(btn);
  }
}

/* =========================
   戻るボタン
========================= */
backBtn.addEventListener("click", () => {
  raceScreen.classList.add("hidden");
  stadiumScreen.classList.remove("hidden");
});