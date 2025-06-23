const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const weatherDisplay = document.getElementById('weather-display');
const forecastDisplay = document.getElementById('forecast-display');
const messageDisplay = document.getElementById('message');

const API_KEY = '';
const BASE_URL_WEATHERAPI = 'https://api.weatherapi.com/v1/';

async function fetchWeatherData(city) {
    if (!city) {
        console.error("City name cannot be empty.");
        messageDisplay.textContent = "Please enter a city name.";
        weatherDisplay.innerHTML = '';
        forecastDisplay.innerHTML = '';
        return null;
    }
    const url = `${BASE_URL_WEATHERAPI}forecast.json?key=${API_KEY}&q=${city}&days=3`;

    try {
        messageDisplay.textContent = 'Loading...';
        weatherDisplay.innerHTML = '<div class="loading-spinner"></div>';
        forecastDisplay.innerHTML = '';

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 400 && errorData.error && errorData.error.code === 1006) {
                // Specific error code for "No matching location found"
                throw new Error(`City not found: ${city}.`);
            } else {
                throw new Error(`API error: ${errorData.error ? errorData.error.message : response.statusText}`);
            }
        }

        const data = await response.json(); 
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        messageDisplay.textContent = `Error: ${error.message}. Please try again.`;
        weatherDisplay.innerHTML = '';
        forecastDisplay.innerHTML = '';
        return null;
    }
}

function displayCurrentWeather(data) {
    if (!data || !data.current || !data.location) {
        weatherDisplay.innerHTML = '';
        // messageDisplay is already updated by fetchWeatherData on error
        return;
    }
    const { name, country } = data.location;
    const { temp_c, condition, humidity, wind_kph, feelslike_c } = data.current;

    weatherDisplay.innerHTML = `
        <h2 class="city-name">${name}, ${country}</h2>
        <img class="weather-icon" src="${condition.icon}" alt="${condition.text}">
        <p class="temperature">${Math.round(temp_c)}°C</p>
        <p class="description">${condition.text}</p>
        <p class="details">Feels like: ${Math.round(feelslike_c)}°C | Humidity: ${humidity}% | Wind: ${wind_kph} km/h</p>
    `;
    messageDisplay.textContent = '';
}


function displayForecast(data) {
    if (!data || !data.forecast || !data.forecast.forecastday) {
        forecastDisplay.innerHTML = '';
        return;
    }

    forecastDisplay.innerHTML = '';
    data.forecast.forecastday.forEach(day => {
        const date = new Date(day.date);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon"

        const minTemp = day.day.mintemp_c;
        const maxTemp = day.day.maxtemp_c;
        const conditionText = day.day.condition.text;
        const conditionIcon = day.day.condition.icon;

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');

        forecastCard.innerHTML = `
            <div class="day">${dayOfWeek}</div>
            <img class="icon" src="${conditionIcon}" alt="${conditionText}">
            <div class="temp">${Math.round(maxTemp)}°C / ${Math.round(minTemp)}°C</div>
            <div class="desc">${conditionText}</div>
        `;
        forecastDisplay.appendChild(forecastCard);
    });
}


searchButton.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    const weatherData = await fetchWeatherData(city);
    if (weatherData) {
        displayCurrentWeather(weatherData);
        displayForecast(weatherData);
    }
});


cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

messageDisplay.textContent = 'Enter a city to get weather.';