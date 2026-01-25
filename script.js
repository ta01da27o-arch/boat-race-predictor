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
// 展開コメント自動生成（シンプル型）
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

  scores.sort((a, b) => b.value - a.value);

  const top = scores[0];
  const second = scores[1];

  let comment = "";

  // 強弱判定
  if (top.value >= 80 && top.value - second.value >= 20) {

    if (top.course === 1) {
      comment = "イン優勢の堅い展開。逃げ中心。";
    } else {
      comment = `${top.course}コース主導の攻め展開。波乱含み。`;
    }

  } else if (top.value >= 60) {

    if (top.course === 1) {
      comment = "イン有利だが差し・まくり警戒。";
    } else {
      comment = "攻め手有利の展開。まくり中心。";
    }

  } else {

    comment = "各艇拮抗。混戦模様で高配当注意。";

  }

  const commentBox = document.querySelector("#race-comment");

  if (commentBox) {
    commentBox.textContent = comment;
  }
}


// 総合期待度更新後に連動させる
const commentObserver = new MutationObserver(generateRaceComment);

document.querySelectorAll(".expectation-value").forEach(el => {
  commentObserver.observe(el, {
    childList: true,
    characterData: true,
    subtree: true
  });
});

// 初回生成
generateRaceComment();