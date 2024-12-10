// Événement pour le bouton de recherche
document.getElementById('searchButton').addEventListener('click', () => {
    const city = document.getElementById('searchInput').value;
    fetchWeatherDataByCity(city);
});

// Événement pour la touche "Enter" dans le champ de recherche
document.getElementById('searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const city = document.getElementById('searchInput').value;
        fetchWeatherDataByCity(city);
        document.getElementById('searchInput').blur(); 
    }
});

// Fonction pour récupérer les données météo par ville
function fetchWeatherDataByCity(city) {
    // Requête pour les données météo actuelles
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => updateCurrentWeather(data))
        .catch(error => {
            console.error('Error fetching weather data:', error);
            showInvalidMessage();
        });

    // Requête pour les prévisions météo
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => updateForecast(data))
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            showInvalidMessage();
        });
}

// Fonction pour récupérer les données météo par coordonnées
function fetchWeatherDataByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`)
        .then(response => response.json())
        .then(data => {
            updateCurrentWeather(data);
            document.getElementById('geoMessage').style.display = 'none';
        })
        .catch(error => console.error('Error fetching weather data:', error));

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`)
        .then(response => response.json())
        .then(data => updateForecast(data))
        .catch(error => console.error('Error fetching forecast data:', error));
}

function updateCurrentWeather(data) {
    // Mettre à jour les informations météo actuelles
    const localTime = new Date(data.dt * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('cityName').textContent = `${data.name} (${localTime})`;
    document.getElementById('temperature').textContent = `${data.main.temp.toFixed(1)}°C`;
    document.getElementById('rainProb').textContent = `Probabilité de pluie: ${data.clouds.all}%`;
    document.getElementById('wind').textContent = `${data.wind.speed} km/h`;
    document.getElementById('weatherImg').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('weatherImg').style.display = 'block'; 
    document.getElementById('weatherContainer').style.display = 'block';
    document.getElementById('forecastContainer').style.display = 'block';
    document.getElementById('conditionsContainer').style.display = 'block';
}

function updateForecast(data) {
    // Mettre à jour les prévisions météo
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = ''; 

    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000); 
        const day = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' });
        const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const dayElement = document.createElement('div');
        dayElement.classList.add('day');

        dayElement.innerHTML = `
            <p>${day} (${time})</p>
            <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png">
            <p>${forecast.main.temp_max.toFixed(1)}°C</p>
        `;

        forecastContainer.appendChild(dayElement);
    });
}

function showInvalidMessage() {
    // Afficher un message d'erreur en cas de ville invalide
    document.getElementById('cityName').textContent = 'Emplacement invalide';
    document.getElementById('temperature').textContent = '--°C';
    document.getElementById('rainProb').textContent = 'Probabilité de pluie: --%';
    document.getElementById('wind').textContent = '-- km/h';
    document.getElementById('weatherImg').src = '';
    document.getElementById('weatherImg').style.display = 'none'; 
    document.getElementById('forecastContainer').style.display = 'none'; 
}

// Vérifier si la géolocalisation est disponible et récupérer les coordonnées actuelles
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherDataByCoords(lat, lon);
    }, error => {
        console.error('Error getting geolocation:', error);
        document.getElementById('geoMessage').style.display = 'block';
    });
} else {
    console.error('Geolocation is not supported by this browser.');
    document.getElementById('geoMessage').style.display = 'block';
}