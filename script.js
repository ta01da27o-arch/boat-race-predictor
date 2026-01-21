// ===============================
// 要素取得
// ===============================
const stadiumScreen = document.getElementById("stadiumScreen");
const raceScreen = document.getElementById("raceScreen");

const stadiumGrid = document.querySelector(".stadium-grid");
const raceGrid = document.querySelector(".race-grid");

const backBtn = document.getElementById("backBtn");
const raceTitle = document.getElementById("raceTitle");

// 追加エリア（存在しなければ無視される）
const playerInput = document.getElementById("playerInput");
const kimariteSection = document.getElementById("kimariteSection");

// ===============================
// 初期表示制御
// ===============================
raceScreen.classList.add("hidden");
if (playerInput) playerInput.classList.add("hidden");
if (kimariteSection) kimariteSection.classList.add("hidden");

// ===============================
// 24場データ（仮）
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
// 24場グリッド生成
// ===============================
stadiums.forEach(name => {
  const btn = document.createElement("div");
  btn.className = "stadium stadium-btn";
  btn.textContent = name;

  btn.addEventListener("click", () => {
    // 画面切替
    stadiumScreen.classList.add("hidden");
    raceScreen.classList.remove("hidden");

    raceTitle.textContent = `${name} レース番号`;

    createRaceButtons();
  });

  stadiumGrid.appendChild(btn);
});

// ===============================
// レース番号生成
// ===============================
function createRaceButtons() {
  raceGrid.innerHTML = "";

  for (let r = 1; r <= 12; r++) {
    const btn = document.createElement("div");
    btn.className = "race race-btn";
    btn.textContent = `${r}R`;

    btn.addEventListener("click", () => {
      // レース番号画面は残したまま下に表示
      if (playerInput) playerInput.classList.remove("hidden");
      if (kimariteSection) kimariteSection.classList.remove("hidden");

      // 候補R（ピンク）
      document
        .querySelectorAll(".race-btn")
        .forEach(b => b.classList.remove("selected"));

      btn.classList.add("selected");
    });

    raceGrid.appendChild(btn);
  }
}

// ===============================
// 戻るボタン
// ===============================
if (backBtn) {
  backBtn.addEventListener("click", () => {
    raceScreen.classList.add("hidden");
    stadiumScreen.classList.remove("hidden");

    if (playerInput) playerInput.classList.add("hidden");
    if (kimariteSection) kimariteSection.classList.add("hidden");
  });
}