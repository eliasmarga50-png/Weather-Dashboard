
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

const recentSearchesContainer = document.getElementById("recent-searches");
const clearSearchesButton = document.getElementById("clear-searches");

let currentWeatherData = null;
let currentCityData = null;
let currentUnitPreference = getTemperaturePreference();

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

locationButton.addEventListener("click", loadLocationWeather);

celsiusButton.addEventListener("click", () => {
    setTemperatureUnit("celsius");
});

fahrenheitButton.addEventListener("click", () => {
    setTemperatureUnit("fahrenheit");
});

clearSearchesButton.addEventListener("click", () => {
    clearRecentSearches();
    renderRecentSearches();
    showStatus("Recent searches cleared.", "success");
});

async function loadCityWeather(city) {
    setLoading(true);
    showStatus(`Searching weather for ${city}...`);

    try {
        const cityData = await searchCity(city);

        const weatherData = await getWeather(
            cityData.latitude,
            cityData.longitude
        );

        const normalizedCity = {
            name: cityData.name,
            displayName: getFullLocationName(cityData),
            latitude: cityData.latitude,
            longitude: cityData.longitude,
            country: cityData.country || "",
            admin1: cityData.admin1 || ""
        };

        currentCityData = normalizedCity;
        currentWeatherData = weatherData;

        saveRecentSearch(normalizedCity);
        renderRecentSearches();
        renderWeatherDashboard(normalizedCity, weatherData);

        weatherDashboard.classList.remove("hidden");
        cityInput.value = "";

        showStatus(`Weather loaded for ${cityData.name}.`, "success");
    } catch (error) {
        showStatus(
            error.message || "Something went wrong. Please try again.",
            "error"
        );
    } finally {
        setLoading(false);
    }
}

async function loadLocationWeather() {
    setLoading(true);
    showStatus("Detecting your location...");

    try {
        const coordinates = await getCurrentLocation();

        const weatherData = await getWeather(
            coordinates.latitude,
            coordinates.longitude
        );

        const locationData = {
            name: "Your Location",
            displayName: "Your Location",
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            country: "",
            admin1: ""
        };

        currentCityData = locationData;
        currentWeatherData = weatherData;

        saveRecentSearch(locationData);
        renderRecentSearches();
        renderWeatherDashboard(locationData, weatherData);

        weatherDashboard.classList.remove("hidden");

        showStatus("Weather loaded for your current location.", "success");
    } catch (error) {
        showStatus(
            error.message || "Unable to detect your location.",
            "error"
        );
    } finally {
        setLoading(false);
    }
}

async function loadRecentWeather(search) {
    setLoading(true);
    showStatus(`Loading weather for ${search.displayName}...`);

    try {
        const weatherData = await getWeather(
            search.latitude,
            search.longitude
        );

        currentCityData = search;
        currentWeatherData = weatherData;

        saveRecentSearch(search);
        renderRecentSearches();
        renderWeatherDashboard(search, weatherData);

        weatherDashboard.classList.remove("hidden");

        showStatus(`Weather loaded for ${search.displayName}.`, "success");
    } catch (error) {
        showStatus(
            error.message || "Unable to retrieve weather data.",
            "error"
        );
    } finally {
        setLoading(false);
    }
}

function renderWeatherDashboard(cityData, weatherData) {
    const current = weatherData.current;
    const timezone = weatherData.timezone;
    const condition = getWeatherInfo(current.weather_code);

    locationName.textContent = cityData.displayName;
    localTime.textContent = `Local time: ${formatLocalTime(current.time, timezone)}`;
    mainWeatherIcon.textContent = condition.icon;
    weatherDescription.textContent = condition.description;

    humidityElement.textContent = current.relative_humidity_2m;
    windSpeedElement.textContent = current.wind_speed_10m.toFixed(1);
    precipitationElement.textContent = current.precipitation.toFixed(1);

    renderTemperature();
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

    const unitSymbol = currentUnitPreference === "celsius" ? "°C" : "°F";

    currentUnit.textContent = unitSymbol;

    document.querySelectorAll(".temperature-unit-small").forEach((element) => {
        element.textContent = unitSymbol;
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
            <p class="forecast-rain">💧 ${rainProbability ?? 0}% rain</p>
        `;

        forecastGrid.appendChild(forecastCard);
    }
}

function setTemperatureUnit(unit) {
    currentUnitPreference = unit;
    saveTemperaturePreference(unit);

    celsiusButton.classList.toggle("active", unit === "celsius");
    fahrenheitButton.classList.toggle("active", unit === "fahrenheit");

    if (currentWeatherData) {
        renderTemperature();
    }
}

function renderRecentSearches() {
    const searches = getRecentSearches();

    recentSearchesContainer.innerHTML = "";

    if (searches.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-searches";
        emptyMessage.textContent = "No recent searches.";

        recentSearchesContainer.appendChild(emptyMessage);
        return;
    }

    searches.forEach((search) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "recent-search-item";
        button.textContent = search.displayName;

        button.addEventListener("click", () => {
            loadRecentWeather(search);
        });

        recentSearchesContainer.appendChild(button);
    });
}

function showStatus(message, type = "") {
    searchStatus.textContent = message;
    searchStatus.className = `search-status ${type}`;
}

function setLoading(isLoading) {
    searchButton.disabled = isLoading;
    locationButton.disabled = isLoading;
    cityInput.disabled = isLoading;

    searchButton.textContent = isLoading ? "Loading..." : "Search";
    locationButton.textContent = isLoading
        ? "Please wait..."
        : "📍 Use My Location";
}

function initializeApp() {
    celsiusButton.classList.toggle(
        "active",
        currentUnitPreference === "celsius"
    );

    fahrenheitButton.classList.toggle(
        "active",
        currentUnitPreference === "fahrenheit"
    );

    renderRecentSearches();
}

initializeApp();
