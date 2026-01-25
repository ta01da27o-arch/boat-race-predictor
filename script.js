// ================================
// 画面切り替え＆24場グリッド
// ================================

const stadiumScreen = document.getElementById('stadiumScreen');
const raceScreen = document.getElementById('raceScreen');
const playerScreen = document.getElementById('playerScreen');

const stadiumGrid = document.querySelector('.stadium-grid');
const raceGrid = document.querySelector('.race-grid');

const raceTitle = document.getElementById('raceTitle');
const backBtn = document.getElementById('backBtn');

const stadiums = [
  '桐生','戸田','江戸川','平和島',
  '多摩川','浜名湖','蒲郡','常滑',
  '津','三国','びわこ','住之江',
  '尼崎','鳴門','丸亀','児島',
  '宮島','徳山','下関','若松',
  '芦屋','福岡','唐津','大村'
];

createStadiumButtons();

function createStadiumButtons() {
  stadiumGrid.innerHTML = '';
  stadiums.forEach(name => {
    const div = document.createElement('div');
    div.className = 'stadium';
    div.textContent = name;
    div.onclick = () => selectStadium(name);
    stadiumGrid.appendChild(div);
  });
}

function selectStadium(name) {
  raceTitle.textContent = name;
  stadiumScreen.classList.add('hidden');
  raceScreen.classList.remove('hidden');
  createRaceButtons();
}

function createRaceButtons() {
  raceGrid.innerHTML = '';
  for (let i = 1; i <= 12; i++) {
    const div = document.createElement('div');
    div.className = 'race';
    div.textContent = i + 'R';
    div.onclick = () => {
      playerScreen.classList.remove('hidden');
    };
    raceGrid.appendChild(div);
  }
}

backBtn.onclick = () => {
  raceScreen.classList.add('hidden');
  stadiumScreen.classList.remove('hidden');
  playerScreen.classList.add('hidden');
};


// ================================
// 決まり手 → 総合期待度AI
// ================================

document.addEventListener("DOMContentLoaded", () => {

  function getKimariteValues(course) {

    const rows = document.querySelectorAll(
      `.kimarite-course.c${course} .kimarite-row`
    );

    const data = {};

    rows.forEach(row => {
      const label = row.querySelector(".label").textContent.trim();
      const valueText = row.querySelector(".value").textContent.replace("%", "");
      const value = parseFloat(valueText) || 0;

      data[label] = value;
    });

    return data;
  }

  function calculateExpectation(course) {

    const k = getKimariteValues(course);
    let score = 0;

    if (course === 1) {
      score =
        (k["逃げ"] || 0) * 1.2 -
        (k["差され"] || 0) * 0.6 -
        (k["捲られ"] || 0) * 0.6 -
        (k["捲差"] || 0) * 0.4;
    }
    else if (course === 2) {
      score =
        (k["差し"] || 0) * 1.0 +
        (k["捲り"] || 0) * 0.6 -
        (k["逃がし"] || 0) * 0.4;
    }
    else {
      score =
        (k["差し"] || 0) * 0.8 +
        (k["捲り"] || 0) * 1.0 +
        (k["捲差"] || 0) * 0.7;
    }

    return Math.max(score, 0);
  }

  function updateExpectations() {

    const rawScores = [];

    for (let i = 1; i <= 6; i++) {
      rawScores.push(calculateExpectation(i));
    }

    const maxScore = Math.max(...rawScores, 1);

    rawScores.forEach((score, index) => {

      const percent = Math.round((score / maxScore) * 100);

      const row = document.querySelector(`.expectation-row.c${index + 1}`);

      if (!row) return;

      const bar = row.querySelector(".expectation-bar div");
      const value = row.querySelector(".expectation-value");

      if (bar) bar.style.width = percent + "%";
      if (value) value.textContent = percent + "%";
    });

    // AI連動
    generateRaceComment();
    generateBetsAllPatterns();
  }

  const observer = new MutationObserver(updateExpectations);

  document.querySelectorAll(".value").forEach(el => {
    observer.observe(el, {
      childList: true,
      characterData: true,
      subtree: true
    });
  });

  updateExpectations();
});


// ================================
// 展開解析コメントAI（安定版）
// ================================

function generateRaceComment() {

  const scores = [];

  for (let i = 1; i <= 6; i++) {
    const row = document.querySelector(`.expectation-row.c${i}`);
    if (!row) continue;

    const valueText = row.querySelector(".expectation-value").textContent;
    const value = parseInt(valueText.replace("%", "")) || 0;

    scores.push({ course: i, value });
  }

  if (scores.length === 0) return;

  scores.sort((a, b) => b.value - a.value);

  const top = scores[0];
  const second = scores[1];

  let comment = "";

  if (top.value >= 80 && top.value - second.value >= 20) {

    if (top.course === 1) {
      comment = "イン優勢の堅い展開。逃げ中心。";
    } else {
      comment = `${top.course}コース主導の攻め展開。波乱含み。`;
    }

  } 
  else if (top.value >= 60) {

    if (top.course === 1) {
      comment = "イン有利だが差し・まくり警戒。";
    } else {
      comment = "攻め手有利の展開。まくり中心。";
    }

  } 
  else {
    comment = "各艇拮抗。混戦模様で高配当注意。";
  }

  const commentBox = document.querySelector("#race-comment");

  if (commentBox) {
    commentBox.textContent = comment;
  }
}


// ================================
// 全展開型 買い目自動算出AI
// ================================

function generateBetsAllPatterns() {

  const scores = [];

  for (let i = 1; i <= 6; i++) {

    const row = document.querySelector(`.expectation-row.c${i}`);
    if (!row) continue;

    const valueText = row.querySelector(".expectation-value").textContent;
    const value = parseInt(valueText.replace("%", "")) || 0;

    scores.push({ course: i, value });
  }

  if (scores.length < 3) return;

  scores.sort((a, b) => b.value - a.value);

  const top3 = scores.slice(0, 3).map(s => s.course);

  const patterns = [
    [top3[0], top3[1], top3[2]],
    [top3[0], top3[2], top3[1]],
    [top3[1], top3[0], top3[2]],
    [top3[1], top3[2], top3[0]],
    [top3[2], top3[0], top3[1]],
    [top3[2], top3[1], top3[0]]
  ];

  const betBox = document.querySelector("#bet-list");

  if (!betBox) return;

  betBox.innerHTML = "";

  patterns.forEach(p => {
    const div = document.createElement("div");
    div.className = "bet-item";
    div.textContent = `${p[0]}-${p[1]}-${p[2]}`;
    betBox.appendChild(div);
  });
}
// ========================================
// ダミーデータ自動生成（後で実データ差替可）
// ========================================

function randomPercent(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function injectDummyKimarite() {

  // 1コース（特殊）
  setKimarite(1, ["逃げ","差され","捲られ","捲差"]);

  // 2コース（特殊）
  setKimarite(2, ["逃がし","差し","捲り"]);

  // 3〜6コース
  for (let i = 3; i <= 6; i++) {
    setKimarite(i, ["差し","捲り","捲差"]);
  }
}

function setKimarite(course, labels) {

  const rows = document.querySelectorAll(
    `.kimarite-course.c${course} .kimarite-row`
  );

  rows.forEach(row => {

    const label = row.querySelector(".label").textContent.trim();

    if (!labels.includes(label)) return;

    const value = randomPercent(5, 80);

    const bar = row.querySelector(".bar div");
    const text = row.querySelector(".value");

    if (bar) bar.style.width = value + "%";
    if (text) text.textContent = value + "%";
  });
}


// ========================================
// 総合期待度 自動計算
// ========================================

function calculateTotalExpectation() {

  const scores = [];

  for (let i = 1; i <= 6; i++) {

    const rows = document.querySelectorAll(
      `.kimarite-course.c${i} .kimarite-row`
    );

    let total = 0;

    rows.forEach(row => {
      const val = parseInt(
        row.querySelector(".value").textContent.replace("%","")
      ) || 0;

      total += val;
    });

    scores.push(total);
  }

  const max = Math.max(...scores, 1);

  scores.forEach((score, index) => {

    const percent = Math.round(score / max * 100);

    const row = document.querySelector(`.expectation-row.c${index+1}`);

    if (!row) return;

    row.querySelector(".expectation-bar div").style.width = percent + "%";
    row.querySelector(".expectation-value").textContent = percent + "%";
  });

  generateFullRaceComment(scores);
  generateBets(scores);
}


// ========================================
// 展開解析（全展開型）
// ========================================

function generateFullRaceComment(scores) {

  const ranked = scores
    .map((v,i)=>({course:i+1, value:v}))
    .sort((a,b)=>b.value-a.value);

  const top = ranked[0];
  const second = ranked[1];

  let comment = "";

  if (top.value - second.value >= 30) {

    if (top.course === 1) {
      comment = "イン圧倒的優勢。逃げ濃厚の一本調子。";
    } else {
      comment = `${top.course}コース中心の主導権。攻め展開濃厚。`;
    }

  } 
  else if (top.value >= 60) {

    if (top.course === 1) {
      comment = "イン有利だが差し・まくり逆転余地あり。";
    } else {
      comment = "攻めとインの力拮抗。展開次第。";
    }

  } 
  else {

    comment = "全艇拮抗の混戦。高配当狙いの展開。";
  }

  const box = document.querySelector(".analysis-text");

  if (box) box.textContent = comment;
}


// ========================================
// 買い目自動算出（シンプル高速型）
// ========================================

function generateBets(scores) {

  const ranked = scores
    .map((v,i)=>({course:i+1, value:v}))
    .sort((a,b)=>b.value-a.value);

  const first = ranked[0].course;
  const second = ranked[1].course;
  const third = ranked[2].course;

  const betRows = document.querySelectorAll(".bet-row");

  if (betRows[0])
    betRows[0].querySelector(".bet-content").textContent =
      `${first}-${second}-${third}`;

  if (betRows[1])
    betRows[1].querySelector(".bet-content").textContent =
      `${first}-${third}-${second}`;

  if (betRows[2])
    betRows[2].querySelector(".bet-content").textContent =
      `${second}-${first}-${third}`;
}


// ========================================
// 初期自動実行
// ========================================

setTimeout(() => {

  injectDummyKimarite();
  calculateTotalExpectation();

}, 300);