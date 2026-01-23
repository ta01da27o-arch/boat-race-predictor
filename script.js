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

stadiums.forEach(name => {
  const div = document.createElement('div');
  div.className = 'stadium';
  div.textContent = name;
  div.onclick = () => {
    document.querySelectorAll('.stadium').forEach(b => b.classList.remove('candidate'));
    div.classList.add('candidate');
    raceTitle.textContent = name;
    stadiumScreen.classList.add('hidden');
    raceScreen.classList.remove('hidden');
    createRace();
  };
  stadiumGrid.appendChild(div);
});

function createRace() {
  raceGrid.innerHTML = '';
  for (let i = 1; i <= 12; i++) {
    const r = document.createElement('div');
    r.className = 'race';
    r.textContent = i + 'R';
    r.onclick = () => {
      document.querySelectorAll('.race').forEach(b => b.classList.remove('candidate'));
      r.classList.add('candidate');
      playerScreen.classList.remove('hidden');
    };
    raceGrid.appendChild(r);
  }
}

backBtn.onclick = () => {
  raceScreen.classList.add('hidden');
  stadiumScreen.classList.remove('hidden');
  playerScreen.classList.add('hidden');
};