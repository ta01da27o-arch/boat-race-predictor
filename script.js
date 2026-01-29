// ===============================
// script.js
// ===============================

// --- データ取得・初期化など ---
let raceData = []; // 各場のレースデータ
let playerData = []; // 選手データ
let totalExpectations = []; // 総合期待度データ

// 初期化処理
function initApp() {
  renderRaceGrid();        // 24場グリッド
  renderPlayerInputs();    // 選手番号入力欄
  renderDecisions();       // 決まり手欄
  renderExpectationBars(totalExpectations); // 総合期待度バー
  renderAnalysis();        // 展開解析欄
  renderBetOptions();      // 買い目欄
  renderSimulation();      // 的中率シュミレーション欄
  renderConfidenceMeter(); // 信頼度メーター欄
}

// ===============================
// 24場グリッド表示
// ===============================
function renderRaceGrid() {
  const container = document.getElementById("raceGrid");
  container.innerHTML = ""; 
  for (let i = 1; i <= 24; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.textContent = `場${i}`;
    container.appendChild(cell);
  }
}

// ===============================
// 選手番号入力欄
// ===============================
function renderPlayerInputs() {
  const container = document.getElementById("playerInputs");
  container.innerHTML = "";
  for (let i = 1; i <= 6; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = "6";
    input.placeholder = `選手${i}`;
    input.addEventListener("input", () => calcAll());
    container.appendChild(input);
  }
}

// ===============================
// 決まり手欄
// ===============================
function renderDecisions() {
  const container = document.getElementById("decisions");
  container.innerHTML = "決まり手情報を取得中...";
}

// ===============================
// 総合期待度欄（バー表示）
// ===============================
function renderExpectationBars(expectations) {
  const container = document.getElementById("expectationContainer");
  container.innerHTML = "";

  expectations.forEach(exp => {
    const row = document.createElement("div");
    row.className = "expectation-row";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.marginBottom = "4px";

    // ラベル
    const label = document.createElement("div");
    label.textContent = exp.label;
    label.style.width = "60px";
    label.style.marginRight = "8px";
    row.appendChild(label);

    // バー枠
    const barBox = document.createElement("div");
    barBox.style.position = "relative";
    barBox.style.flexGrow = "1";
    barBox.style.height = "20px";
    barBox.style.background = "#eee";
    barBox.style.borderRadius = "4px";
    barBox.style.overflow = "hidden";
    barBox.style.paddingRight = "4px"; // ←バー内ラベルのための内側余白

    const barFill = document.createElement("div");
    barFill.style.height = "100%";
    barFill.style.width = `${exp.value * 100}%`;
    barFill.style.background = "#33cc66";
    barFill.style.position = "relative";

    // バー内固定ラベル（30%）
    const innerLabel = document.createElement("span");
    innerLabel.textContent = "30%";  // 固定表示
    innerLabel.style.position = "absolute";
    innerLabel.style.right = "4px";  // バー枠内に収まる
    innerLabel.style.top = "50%";
    innerLabel.style.transform = "translateY(-50%)";
    innerLabel.style.fontSize = "12px";
    innerLabel.style.color = "#fff";
    innerLabel.style.fontWeight = "bold";

    barFill.appendChild(innerLabel);
    barBox.appendChild(barFill);
    row.appendChild(barBox);

    // 総合期待度（元々の値、右端に表示）
    const totalValue = document.createElement("div");
    totalValue.textContent = `${Math.round(exp.value * 100)}%`; // 例: 50%
    totalValue.style.width = "40px";
    totalValue.style.marginLeft = "8px";
    row.appendChild(totalValue);

    container.appendChild(row);
  });
}

// ===============================
// 展開解析欄
// ===============================
function renderAnalysis() {
  const container = document.getElementById("analysis");
  container.innerHTML = "展開解析情報を取得中...";
}

// ===============================
// 買い目欄
// ===============================
function renderBetOptions() {
  const container = document.getElementById("betOptions");
  container.innerHTML = "買い目候補を表示...";
}

// ===============================
// 的中率シュミレーション欄
// ===============================
function renderSimulation() {
  const container = document.getElementById("simulation");
  container.innerHTML = "シミュレーション結果を表示...";
}

// ===============================
// 信頼度メーター欄
// ===============================
function renderConfidenceMeter() {
  const container = document.getElementById("confidenceMeter");
  container.innerHTML = "信頼度メーター表示...";
}

// ===============================
// 全計算
// ===============================
function calcAll() {
  // ここで各欄の計算をまとめて実行
  // 例: 総合期待度再計算
  totalExpectations = [
    {label: "実績", value: Math.random()}, // 仮データ
    {label: "展開", value: Math.random()},
    {label: "スピード", value: Math.random()}
  ];
  renderExpectationBars(totalExpectations);
}

// ===============================
// 初期化呼び出し
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});
