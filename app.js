let data = {};
let currentVenue = "";
let currentRace = "";

async function loadData() {
    const response = await fetch('data.json');
    data = await response.json();
    showVenues();
}

function showVenues() {
    const container = document.getElementById('venues-container');
    container.innerHTML = '';
    for (let venue in data) {
        const div = document.createElement('div');
        div.textContent = venue;
        div.className = 'venue';
        if (!data[venue]['開催中']) div.classList.add('gray');
        else div.onclick = () => showRaces(venue);
        container.appendChild(div);
    }
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('race-screen').classList.add('hidden');
    document.getElementById('entry-screen').classList.add('hidden');
}

function showRaces(venue) {
    currentVenue = venue;
    const container = document.getElementById('races-container');
    container.innerHTML = '';
    document.getElementById('venue-name').textContent = venue;
    const races = data[venue]['レース'];
    for (let race in races) {
        const div = document.createElement('div');
        div.textContent = race;
        div.className = 'race';
        div.onclick = () => showEntries(race);
        container.appendChild(div);
    }
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('race-screen').classList.remove('hidden');
    document.getElementById('entry-screen').classList.add('hidden');
}

function showEntries(race) {
    currentRace = race;
    const container = document.getElementById('entries-container');
    container.innerHTML = '';
    document.getElementById('race-name').textContent = race;
    const entries = data[currentVenue]['レース'][race]['出走表'];
    entries.forEach(entry => {
        const div = document.createElement('div');
        div.textContent = `${entry.コース}コース: ${entry.選手名}`;
        div.className = 'entry';
        container.appendChild(div);
    });
    document.getElementById('decision-text').textContent = data[currentVenue]['レース'][race]['決まり手'];
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('race-screen').classList.add('hidden');
    document.getElementById('entry-screen').classList.remove('hidden');
}

function goBack(level) {
    if (level === 'main') showVenues();
    if (level === 'race') showRaces(currentVenue);
}

window.onload = loadData;