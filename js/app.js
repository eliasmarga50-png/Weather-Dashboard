
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const locationButton = document.getElementById("location-button");
const searchFeedback = document.getElementById("search-feedback");

const weatherSection = document.getElementById("weather-section");
const welcomeSection = document.getElementById("welcome-section");
const currentCity = document.getElementById("current-city");
const currentDate = document.getElementById("current-date");
const currentTemperature = document.getElementById("current-temperature");
const currentWeatherIcon = document.getElementById("current-weather-icon");
const currentCondition = document.getElementById("current-condition");
const feelsLike = document.getElementById("feels-like");
const feelsDetail = document.getElementById("feels-detail");
const humidityValue = document.getElementById("humidity-value");
const windValue = document.getElementById("wind-value");
const precipitationValue = document.getElementById("precipitation-value");
const forecastContainer = document.getElementById("forecast-container");

const celsiusButton = document.getElementById("celsius-button");
const fahrenheitButton = document.getElementById("fahrenheit-button");

const recentSearchesSection = document.getElementById("recent-searches-section");
const recentSearchesContainer = document.getElementById("recent-searches-container");
const clearHistoryButton = document.getElementById("clear-history-button");

const aiSection = document.getElementById("ai-assistant-section");
const aiRefreshButton = document.getElementById("ai-refresh-button");
const aiInsightsContainer = document.getElementById("ai-insights-container");
const aiQuestionForm = document.getElementById("ai-question-form");
const aiQuestionInput = document.getElementById("ai-question-input");
const aiQuestionButton = document.getElementById("ai-question-button");
const aiAnswerContainer = document.getElementById("ai-answer-container");

const toast = document.getElementById("global-toast");

let currentWeatherData = null;
let currentLocationData = null;
let temperatureUnit = getTemperatureUnit();
let weatherRequestInProgress = false;
let aiInsightsRequestInProgress = false;
let aiQuestionRequestInProgress = false;
let toastTimeout = null;

function showToast(message, type = "error") {
    clearTimeout(toastTimeout);

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

function setSearchFeedback(message = "", type = "") {
    searchFeedback.textContent = message;
    searchFeedback.className = `feedback-message ${type}`.trim();
}

function setButtonLoading(button, loading) {
    button.disabled = loading;
    button.classList.toggle("is-loading", loading);
    button.setAttribute("aria-busy", String(loading));
}

function setTemperatureButtons() {
    const isCelsius = temperatureUnit === "celsius";

    celsiusButton.classList.toggle("active", isCelsius);
    fahrenheitButton.classList.toggle("active", !isCelsius);

    celsiusButton.setAttribute("aria-pressed", String(isCelsius));
    fahrenheitButton.setAttribute("aria-pressed", String(!isCelsius));
}

function convertTemperature(value) {
    if (temperatureUnit === "fahrenheit") {
        return (value * 9 / 5) + 32;
    }

    return value;
}

function formatTemperature(value) {
    return `${Math.round(convertTemperature(value))}°`;
}

function formatForecastDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString(undefined, {
        weekday: "short"
    });
}

function formatCurrentDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric"
        });
    }

    return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric"
    });
}

function getWeatherDisplay(code) {
    const info = getWeatherInfo(code);

    return {
        description: info.description || "Unknown weather",
        icon: info.icon || "🌡️"
    };
}

function renderCurrentWeather(weatherData, locationData) {
    const current = weatherData.current;
    const condition = getWeatherDisplay(current.weather_code);

    currentCity.textContent =
        locationData.name || locationData.city || "Unknown location";

    if (locationData.country) {
        currentCity.textContent += `, ${locationData.country}`;
    }

    currentDate.textContent = formatCurrentDate(current.time);

    currentTemperature.textContent = formatTemperature(
        current.temperature_2m
    );

    currentWeatherIcon.textContent = condition.icon;
    currentCondition.textContent = condition.description;

    feelsLike.textContent = `Feels like ${formatTemperature(
        current.apparent_temperature
    )}`;

    feelsDetail.textContent = formatTemperature(
        current.apparent_temperature
    );

    humidityValue.textContent = `${current.relative_humidity_2m}%`;
    windValue.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    precipitationValue.textContent = `${current.precipitation ?? 0} mm`;
}

function renderForecast(weatherData) {
    const daily = weatherData.daily;

    forecastContainer.replaceChildren();

    daily.time.forEach((date, index) => {
        const condition = getWeatherDisplay(daily.weather_code[index]);

        const card = document.createElement("article");
        card.className = "forecast-card";

        const day = document.createElement("div");
        day.className = "forecast-day";
        day.textContent = index === 0 ? "Today" : formatForecastDate(date);

        const icon = document.createElement("span");
        icon.className = "forecast-icon";
        icon.textContent = condition.icon;
        icon.setAttribute("aria-label", condition.description);

        const description = document.createElement("div");
        description.className = "forecast-condition";
        description.textContent = condition.description;

        const temperatures = document.createElement("div");
        temperatures.className = "forecast-temperatures";

        const high = document.createElement("span");
        high.className = "forecast-high";
        high.textContent = formatTemperature(
            daily.temperature_2m_max[index]
        );

        const low = document.createElement("span");
        low.className = "forecast-low";
        low.textContent = formatTemperature(
            daily.temperature_2m_min[index]
        );

        temperatures.append(high, low);

        const precipitation = document.createElement("div");
        precipitation.className = "forecast-precipitation";
        precipitation.textContent =
            `💧 ${daily.precipitation_probability_max[index] ?? 0}%`;

        card.append(
            day,
            icon,
            description,
            temperatures,
            precipitation
        );

        forecastContainer.appendChild(card);
    });
}

function renderWeatherDashboard(weatherData, locationData) {
    currentWeatherData = weatherData;
    currentLocationData = locationData;

    weatherSection.hidden = false;
    welcomeSection.hidden = true;
    aiSection.hidden = false;

    renderCurrentWeather(weatherData, locationData);
    renderForecast(weatherData);
    setTemperatureButtons();

    aiAnswerContainer.replaceChildren();

    generateAIWeatherInsights();

    window.scrollTo({
        top: weatherSection.offsetTop - 20,
        behavior: "smooth"
    });
}

function renderTemperature() {
    if (!currentWeatherData || !currentLocationData) {
        return;
    }

    renderCurrentWeather(currentWeatherData, currentLocationData);
    renderForecast(currentWeatherData);
    setTemperatureButtons();
}

function showWeatherLoading() {
    weatherSection.hidden = false;
    welcomeSection.hidden = true;

    currentCity.textContent = "Loading weather...";
    currentDate.textContent = "Please wait";
    currentTemperature.textContent = "--°";
    currentCondition.textContent = "Fetching weather data";
    currentWeatherIcon.textContent = "🌤️";

    feelsLike.textContent = "Feels like --°";
    feelsDetail.textContent = "--°";
    humidityValue.textContent = "--%";
    windValue.textContent = "-- km/h";
    precipitationValue.textContent = "-- mm";

    forecastContainer.replaceChildren();

    for (let index = 0; index < 5; index++) {
        const card = document.createElement("div");
        card.className = "forecast-card skeleton";
        card.style.height = "180px";
        forecastContainer.appendChild(card);
    }

    aiSection.hidden = true;
}

function normalizeLocation(location) {
    return {
        name: location.name || location.city || "Unknown location",
        country: location.country || "",
        latitude: location.latitude,
        longitude: location.longitude
    };
}

async function searchWeatherByCity(city) {
    if (weatherRequestInProgress) {
        return;
    }

    const normalizedCity = city.trim();

    if (!normalizedCity) {
        setSearchFeedback("Please enter a city name.", "error");
        cityInput.focus();
        return;
    }

    weatherRequestInProgress = true;
    setButtonLoading(searchButton, true);
    setSearchFeedback("Searching for weather...");
    showWeatherLoading();

    try {
        const location = await searchCity(normalizedCity);

        if (!location) {
            throw new Error("City not found. Try another city name.");
        }

        const normalizedLocation = normalizeLocation(location);

        const weatherData = await getWeather(
            normalizedLocation.latitude,
            normalizedLocation.longitude
        );

        if (!weatherData || !weatherData.current || !weatherData.daily) {
            throw new Error("Weather information is unavailable for this city.");
        }

        addRecentSearch(normalizedLocation.name);

        renderWeatherDashboard(weatherData, normalizedLocation);

        cityInput.value = "";
        setSearchFeedback(
            `Weather loaded for ${normalizedLocation.name}.`,
            "success"
        );

        renderRecentSearches();
    } catch (error) {
        weatherSection.hidden = true;
        welcomeSection.hidden = false;
        aiSection.hidden = true;

        setSearchFeedback(
            error.message || "Unable to load weather. Please try again.",
            "error"
        );

        showToast(
            error.message || "Something went wrong while loading weather."
        );
    } finally {
        weatherRequestInProgress = false;
        setButtonLoading(searchButton, false);
    }
}

async function handleLocationSearch() {
    if (weatherRequestInProgress) {
        return;
    }

    weatherRequestInProgress = true;
    locationButton.disabled = true;
    setButtonLoading(searchButton, true);
    setSearchFeedback("Getting your location...");
    showWeatherLoading();

    try {
        const location = await getCurrentLocation();

        const latitude = location.latitude;
        const longitude = location.longitude;

        const weatherData = await getWeather(latitude, longitude);

        if (!weatherData || !weatherData.current || !weatherData.daily) {
            throw new Error("Unable to retrieve weather for your location.");
        }

        const locationData = {
            name: location.name || "Your location",
            country: location.country || "",
            latitude,
            longitude
        };

        renderWeatherDashboard(weatherData, locationData);

        setSearchFeedback("Weather for your current location loaded.", "success");
    } catch (error) {
        weatherSection.hidden = true;
        welcomeSection.hidden = false;
        aiSection.hidden = true;

        setSearchFeedback(
            error.message || "Unable to access your location.",
            "error"
        );

        showToast(
            error.message || "Location request failed."
        );
    } finally {
        weatherRequestInProgress = false;
        locationButton.disabled = false;
        setButtonLoading(searchButton, false);
    }
}

function renderRecentSearches() {
    const searches = getRecentSearches();

    recentSearchesContainer.replaceChildren();

    if (!searches || searches.length === 0) {
        recentSearchesSection.hidden = true;
        return;
    }

    recentSearchesSection.hidden = false;

    searches.forEach(city => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "recent-search-item";
        button.textContent = `⌕ ${city}`;
        button.setAttribute("aria-label", `Search weather for ${city}`);

        button.addEventListener("click", () => {
            searchWeatherByCity(city);
        });

        recentSearchesContainer.appendChild(button);
    });
}

function clearSearchHistory() {
    clearRecentSearches();
    renderRecentSearches();
    showToast("Recent searches cleared.", "success");
}

function renderAIContent(text, container) {
    container.replaceChildren();

    const lines = text.split("\n");
    let currentParagraph = null;

    lines.forEach(line => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
            currentParagraph = null;
            return;
        }

        const headingMatch = trimmedLine.match(
            /^\*{0,2}(#{1,3}\s+|\*\*)(.+?)(?:\*\*)?$/
            );

        if (headingMatch) {
            const heading = document.createElement("h3");
            heading.textContent = headingMatch[2].replace(/\*\*/g, "").trim();
            container.appendChild(heading);
            currentParagraph = null;
            return;
        }

        if (/^[-*]\s/.test(trimmedLine)) {
            const paragraph = document.createElement("p");
            paragraph.textContent = `• ${trimmedLine.replace(/^[-*]\s/, "")}`;
            container.appendChild(paragraph);
            currentParagraph = null;
            return;
        }

        if (!currentParagraph) {
            currentParagraph = document.createElement("p");
            container.appendChild(currentParagraph);
        }

        currentParagraph.textContent +=
            `${currentParagraph.textContent ? " " : ""}${trimmedLine.replace(/\*\*/g, "")}`;
    });
}

function showAILoading(container, message) {
    container.replaceChildren();

    const loading = document.createElement("div");
    loading.className = "loading-message";

    const spinner = document.createElement("span");
    spinner.className = "loading-spinner";
    spinner.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.textContent = message;

    loading.append(spinner, text);
    container.appendChild(loading);
}

async function generateAIWeatherInsights() {
    if (!currentWeatherData || aiInsightsRequestInProgress) {
        return;
    }

    aiInsightsRequestInProgress = true;
    aiRefreshButton.disabled = true;
    aiRefreshButton.classList.add("is-loading");
    aiRefreshButton.setAttribute("aria-busy", "true");

    showAILoading(
        aiInsightsContainer,
        "Analyzing current weather and forecast..."
    );

    try {
        const insights = await generateWeatherInsights(currentWeatherData);
        renderAIContent(insights, aiInsightsContainer);
    } catch (error) {
        aiInsightsContainer.replaceChildren();

        const errorMessage = document.createElement("p");
        errorMessage.className = "ai-answer error";
        errorMessage.textContent =
            error.message || "Unable to generate weather insights.";

        aiInsightsContainer.appendChild(errorMessage);

        showToast("AI weather insights could not be generated.");
    } finally {
        aiInsightsRequestInProgress = false;
        aiRefreshButton.disabled = false;
        aiRefreshButton.classList.remove("is-loading");
        aiRefreshButton.setAttribute("aria-busy", "false");
    }
}

async function handleAIQuestion(question) {
    if (!currentWeatherData || aiQuestionRequestInProgress) {
        return;
    }

    const normalizedQuestion = question.trim();

    if (!normalizedQuestion) {
        aiQuestionInput.focus();
        return;
    }

    aiQuestionRequestInProgress = true;
    aiQuestionButton.disabled = true;
    aiQuestionButton.classList.add("is-loading");
    aiQuestionButton.setAttribute("aria-busy", "true");
    aiQuestionInput.disabled = true;

    showAILoading(
        aiAnswerContainer,
        "Your weather assistant is thinking..."
    );

    try {
        const answer = await askWeatherQuestion(
            normalizedQuestion,
            currentWeatherData
        );

        const answerCard = document.createElement("div");
        answerCard.className = "ai-answer";
        renderAIContent(answer, answerCard);

        aiAnswerContainer.replaceChildren(answerCard);
        aiQuestionInput.value = "";
    } catch (error) {
        const errorCard = document.createElement("div");
        errorCard.className = "ai-answer error";
        errorCard.textContent =
            error.message || "Unable to answer your question right now.";

        aiAnswerContainer.replaceChildren(errorCard);

        showToast("Your AI request could not be completed.");
    } finally {
        aiQuestionRequestInProgress = false;
        aiQuestionButton.disabled = false;
        aiQuestionButton.classList.remove("is-loading");
        aiQuestionButton.setAttribute("aria-busy", "false");
        aiQuestionInput.disabled = false;
    }
}

function initializeTemperaturePreference() {
    temperatureUnit = getTemperatureUnit() || "celsius";

    setTemperatureButtons();
}

searchForm.addEventListener("submit", event => {
    event.preventDefault();

    searchWeatherByCity(cityInput.value);
});

locationButton.addEventListener("click", handleLocationSearch);

celsiusButton.addEventListener("click", () => {
    if (temperatureUnit === "celsius") {
        return;
    }

    temperatureUnit = "celsius";
    setTemperatureUnit(temperatureUnit);
    renderTemperature();
});

fahrenheitButton.addEventListener("click", () => {
    if (temperatureUnit === "fahrenheit") {
        return;
    }

    temperatureUnit = "fahrenheit";
    setTemperatureUnit(temperatureUnit);
    renderTemperature();
});

clearHistoryButton.addEventListener("click", clearSearchHistory);

aiRefreshButton.addEventListener("click", generateAIWeatherInsights);

aiQuestionForm.addEventListener("submit", event => {
    event.preventDefault();
    handleAIQuestion(aiQuestionInput.value);
});

cityInput.addEventListener("input", () => {
    if (searchFeedback.classList.contains("error")) {
        setSearchFeedback();
    }
});

initializeTemperaturePreference();
renderRecentSearches();
