/* ===== 24場データ（仮） ===== */
const stadiums = [
  "桐生","戸田","江戸川","平和島",
  "多摩川","浜名湖","蒲郡","常滑",
  "津","三国","びわこ","住之江",
  "尼崎","鳴門","丸亀","児島",
  "宮島","徳山","下関","若松",
  "芦屋","福岡","唐津","大村"
];

const goodStadiums = ["桐生","江戸川","住之江","丸亀","大村"];

const grid = document.getElementById("stadiumGrid");

/* index.html 用 */
if (grid) {
  stadiums.forEach(name => {
    const d = document.createElement("div");
    d.className = "stadium" + (goodStadiums.includes(name) ? " good" : "");
    d.textContent = name;
    d.onclick = () => {
      location.href = `race.html?stadium=${encodeURIComponent(name)}`;
    };
    grid.appendChild(d);
  });
}

/* race.html 用 */
const kimarite = document.getElementById("kimarite");
const expect = document.getElementById("expect");

if (kimarite && expect) {
  const colors = ["c1","c2","c3","c4","c5","c6"];

  for (let i = 1; i <= 6; i++) {
    const v1 = 20 + i * 8;
    const v2 = 30 + i * 6;

    kimarite.innerHTML += `
      <div class="box">
        ${i}コース
        <div class="bar ${colors[i-1]}" style="width:${v1}%"></div>
        ${v1}%
      </div>
    `;

    expect.innerHTML += `
      <div class="box">
        <div class="bar ${colors[i-1]}" style="width:${v2}%">
          ${i}コース
        </div>
      </div>
    `;
  }

  const params = new URLSearchParams(location.search);
  const stadium = params.get("stadium");
  if (stadium) {
    document.getElementById("raceTitle").textContent =
      `${stadium}競艇場 4R`;
  }
}