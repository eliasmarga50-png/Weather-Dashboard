
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const locationButton = document.getElementById("location-button");
const searchStatus = document.getElementById("search-status");
const weatherDashboard = document.getElementById("weather-dashboard");

const locationName = document.getElementById("location-name");
const localTime = document.getElementById("local-time");
const mainWeatherIcon = document.getElementById("main-weather-icon");
const currentTemperature = document.getElementById("current-temperature");
const currentUnit = document.getElementById("current-unit");
const weatherDescription = document.getElementById("weather-description");

const humidityElement = document.getElementById("humidity");
const windSpeedElement = document.getElementById("wind-speed");
const feelsLikeElement = document.getElementById("feels-like");
const precipitationElement = document.getElementById("precipitation");

const forecastGrid = document.getElementById("forecast-grid");
const celsiusButton = document.getElementById("celsius-button");
const fahrenheitButton = document.getElementById("fahrenheit-button");

let currentWeatherData = null;
let currentCityData = null;
let currentUnitPreference = "celsius";

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        showStatus("Please enter a city name.", "error");
        cityInput.focus();
        return;
    }

    await loadCityWeather(city);
});

async function loadCityWeather(city) {
    setLoading(true);
    showStatus(`Searching weather for ${city}...`);

    try {
        const cityData = await searchCity(city);
        const weatherData = await getWeather(cityData.latitude, cityData.longitude);

        currentCityData = cityData;
        currentWeatherData = weatherData;

        renderWeatherDashboard(cityData, weatherData);
        showStatus(`Weather loaded for ${cityData.name}.`, "success");

        weatherDashboard.classList.remove("hidden");
    } catch (error) {
        showStatus(error.message || "Something went wrong. Please try again.", "error");
    } finally {
        setLoading(false);
    }
}

function renderWeatherDashboard(cityData, weatherData) {
    const current = weatherData.current;
    const timezone = weatherData.timezone;
    const condition = getWeatherInfo(current.weather_code);

    locationName.textContent = getFullLocationName(cityData);
    localTime.textContent = `Local time: ${formatLocalTime(current.time, timezone)}`;
    mainWeatherIcon.textContent = condition.icon;
    weatherDescription.textContent = condition.description;

    humidityElement.textContent = current.relative_humidity_2m;
    windSpeedElement.textContent = current.wind_speed_10m.toFixed(1);
    precipitationElement.textContent = current.precipitation.toFixed(1);

    renderTemperature();
    renderForecast(weatherData.daily, timezone);
}

function getFullLocationName(cityData) {
    const parts = [
        cityData.name,
        cityData.admin1,
        cityData.country
    ].filter(Boolean);

    return [...new Set(parts)].join(", ");
}

function renderTemperature() {
    if (!currentWeatherData) return;

    const current = currentWeatherData.current;

    const temperature = convertTemperature(
        current.temperature_2m,
        currentUnitPreference
    );

    const feelsLike = convertTemperature(
        current.apparent_temperature,
        currentUnitPreference
    );

    currentTemperature.textContent = Math.round(temperature);
    feelsLikeElement.textContent = feelsLike.toFixed(1);
    currentUnit.textContent = currentUnitPreference === "celsius" ? "°C" : "°F";

    document.querySelectorAll(".temperature-unit-small").forEach((element) => {
        element.textContent = currentUnitPreference === "celsius" ? "°C" : "°F";
    });

    renderForecast(currentWeatherData.daily, currentWeatherData.timezone);
}

function renderForecast(daily, timezone) {
    forecastGrid.innerHTML = "";

    for (let index = 0; index < daily.time.length; index++) {
        const condition = getWeatherInfo(daily.weather_code[index]);

        const maxTemperature = formatTemperature(
            daily.temperature_2m_max[index],
            currentUnitPreference
        );

        const minTemperature = formatTemperature(
            daily.temperature_2m_min[index],
            currentUnitPreference
        );

        const rainProbability = daily.precipitation_probability_max[index];

        const forecastCard = document.createElement("article");
        forecastCard.className = "forecast-card";

        forecastCard.innerHTML = `
            <h3 class="forecast-date">${formatDate(daily.time[index], timezone)}</h3>
            <span class="forecast-icon">${condition.icon}</span>
            <p class="forecast-description">${condition.description}</p>
            <p class="forecast-temperatures">${maxTemperature}° / ${minTemperature}°</p>
            <p class="forecast-rain">
                💧 ${rainProbability ?? 0}% rain
            </p>
        `;

        forecastGrid.appendChild(forecastCard);
    }
}

celsiusButton.addEventListener("click", () => {
    setTemperatureUnit("celsius");
});

fahrenheitButton.addEventListener("click", () => {
    setTemperatureUnit("fahrenheit");
});

function setTemperatureUnit(unit) {
    currentUnitPreference = unit;

    celsiusButton.classList.toggle("active", unit === "celsius");
    fahrenheitButton.classList.toggle("active", unit === "fahrenheit");

    if (currentWeatherData) {
        renderTemperature();
    }
}

function showStatus(message, type = "") {
    searchStatus.textContent = message;
    searchStatus.className = `search-status ${type}`;
}

function setLoading(isLoading) {
    searchButton.disabled = isLoading;
    cityInput.disabled = isLoading;
    searchButton.textContent = isLoading ? "Loading..." : "Search";
}

locationButton.addEventListener("click", () => {
    showStatus("Location search will be implemented in Commit 3.");
});
