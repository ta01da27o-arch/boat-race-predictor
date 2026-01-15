const stadiums = [
  "桐生","戸田","江戸川","平和島","多摩川","浜名湖",
  "蒲郡","常滑","津","三国","びわこ","住之江",
  "尼崎","鳴門","丸亀","児島","宮島","徳山",
  "下関","若松","芦屋","福岡","唐津","大村"
];

const grid = document.getElementById("stadiumGrid");

stadiums.forEach(name => {
  const card = document.createElement("div");
  card.className = "stadium-card";
  card.textContent = name;
  grid.appendChild(card);
});