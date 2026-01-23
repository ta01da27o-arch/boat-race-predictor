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