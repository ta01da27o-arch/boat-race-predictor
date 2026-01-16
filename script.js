const stadiums = [
  "桐生","戸田","江戸川","平和島","多摩川","浜名湖",
  "蒲郡","常滑","津","三国","びわこ","住之江",
  "尼崎","鳴門","丸亀","児島","宮島","徳山",
  "下関","若松","芦屋","福岡","唐津","大村"
];

const grid = document.getElementById("stadiumGrid");
const detail = document.getElementById("detail");

stadiums.forEach(name => {
  const d = document.createElement("div");
  d.className = "stadium";
  d.textContent = name;
  d.onclick = () => openDetail(name);
  grid.appendChild(d);
});

function openDetail(name) {
  grid.style.display = "none";
  detail.classList.remove("hidden");
  document.getElementById("stadiumName").textContent = name;
  renderPlayers();
}

function back() {
  detail.classList.add("hidden");
  grid.style.display = "grid";
}

function renderPlayers() {
  const wrap = document.getElementById("players");
  wrap.innerHTML = "";

  for (let i = 1; i <= 6; i++) {
    const div = document.createElement("div");
    div.className = "player";
    div.innerHTML = `
      <label>${i}コース</label>
      <input placeholder="選手番号" oninput="update(${i})" />
      <div id="bars${i}"></div>
    `;
    wrap.appendChild(div);
  }
}

function update(course) {
  const bars = document.getElementById(`bars${course}`);
  bars.innerHTML = "";

  const patterns = ["逃げ","差し","捲り","捲り差し"];
  patterns.forEach(p => {
    if (p === "逃げ" && course !== 1) return;

    const val = Math.floor(Math.random() * 50) + 10;
    const row = document.createElement("div");
    row.className = "bar";
    row.innerHTML = `
      <div class="bar-fill" style="width:${val}%;"></div>
      <div class="bar-text">${p} ${val}%</div>
    `;
    bars.appendChild(row);
  });

  analyze();
}

function analyze() {
  const nums = [1,2,3,4,5,6];
  const cut = Math.floor(Math.random()*6)+1;

  const text = `
${cut}コースに不安あり。
4・5コース中心の攻め。
内側は抵抗弱く展開は外。
  `;
  document.getElementById("analysis").textContent = text;

  generateBets(cut);
}

function generateBets(cut) {
  const bets = document.getElementById("bets");
  bets.innerHTML = "買い目<br>";

  const nums = [1,2,3,4,5,6].filter(n => n !== cut);
  let count = 0;

  for (let a of nums) {
    for (let b of nums) {
      for (let c of nums) {
        if (a !== b && b !== c && a !== c) {
          bets.innerHTML += `${a}-${b}-${c}<br>`;
          count++;
          if (count >= 6) return;
        }
      }
    }
  }
}