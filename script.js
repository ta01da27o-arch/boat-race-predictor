const stadiums = [
  { name: "桐生", good: true },
  { name: "戸田", good: false },
  { name: "江戸川", good: true },
  { name: "平和島", good: false },
  { name: "蒲郡", good: false },
  { name: "住之江", good: true }
];

const colors = [
  "#ffffff", // 1
  "#000000", // 2
  "#f44336", // 3
  "#2196f3", // 4
  "#ffeb3b", // 5
  "#4caf50"  // 6
];

const grid = document.getElementById("stadiumGrid");
const detail = document.getElementById("detailArea");

/* 24場生成（常時） */
stadiums.forEach(s => {
  const d = document.createElement("div");
  d.className = "stadium" + (s.good ? " good" : "");
  d.textContent = s.name;
  d.onclick = () => loadStadium(s.name);
  grid.appendChild(d);
});

function loadStadium(name) {
  detail.innerHTML = `
    <h3>${name} 4R</h3>

    <h4>各コース決まり手</h4>
    ${makeBars()}

    <h4>各コース入着期待値</h4>
    ${makeExpect()}

    <h4>⭐展開解析</h4>
    <p>
      1コースはスタート不安。<br>
      4・5コースが機力優勢で捲り攻め。<br>
      2コースは差し残し注意。
    </p>

    <h4>買い目</h4>
    <ul>
      <li>4-5-2</li>
      <li>5-4-2</li>
      <li>4-2-5</li>
    </ul>
  `;
}

function makeBars() {
  let html = "";
  for (let i = 0; i < 6; i++) {
    const v = 30 + i * 7;
    html += `
      <div class="box">
        ${i+1}コース
        <div class="bar" style="width:${v}%;background:${colors[i]}"></div>
        ${v}%
      </div>
    `;
  }
  return html;
}

function makeExpect() {
  let html = "";
  for (let i = 0; i < 6; i++) {
    const v = 40 + i * 6;
    html += `
      <div class="box">
        <div class="bar" style="width:${v}%;background:${colors[i]}">
          ${i+1}コース
        </div>
      </div>
    `;
  }
  return html;
}