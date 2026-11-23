
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

async function searchCity(city) {
    const url = new URL(GEOCODING_API);

    url.searchParams.set("name", city);
    url.searchParams.set("count", "5");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to search for this city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please enter a valid city name.");
    }

    return data.results[0];
}

async function getWeather(latitude, longitude) {
    const url = new URL(WEATHER_API);

    url.searchParams.set("latitude", latitude);
    url.searchParams.set("longitude", longitude);
    url.searchParams.set(
        "current",
        "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m"
    );
    url.searchParams.set(
        "daily",
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
    );
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "5");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to retrieve weather data.");
    }

    return response.json();
}

function getWeatherInfo(code) {
    const weatherConditions = {
        0: { description: "Clear sky", icon: "☀️" },
        1: { description: "Mainly clear", icon: "🌤️" },
        2: { description: "Partly cloudy", icon: "⛅" },
        3: { description: "Overcast", icon: "☁️" },
        45: { description: "Fog", icon: "🌫️" },
        48: { description: "Depositing rime fog", icon: "🌫️" },
        51: { description: "Light drizzle", icon: "🌦️" },
        53: { description: "Moderate drizzle", icon: "🌦️" },
        55: { description: "Dense drizzle", icon: "🌧️" },
        56: { description: "Light freezing drizzle", icon: "🌧️" },
        57: { description: "Dense freezing drizzle", icon: "🌧️" },
        61: { description: "Light rain", icon: "🌦️" },
        63: { description: "Moderate rain", icon: "🌧️" },
        65: { description: "Heavy rain", icon: "🌧️" },
        66: { description: "Light freezing rain", icon: "🌧️" },
        67: { description: "Heavy freezing rain", icon: "🌧️" },
        71: { description: "Light snow", icon: "🌨️" },
        73: { description: "Moderate snow", icon: "❄️" },
        75: { description: "Heavy snow", icon: "❄️" },
        77: { description: "Snow grains", icon: "❄️" },
        80: { description: "Light rain showers", icon: "🌦️" },
        81: { description: "Moderate rain showers", icon: "🌧️" },
        82: { description: "Violent rain showers", icon: "⛈️" },
        85: { description: "Light snow showers", icon: "🌨️" },
        86: { description: "Heavy snow showers", icon: "❄️" },
        95: { description: "Thunderstorm", icon: "⛈️" },
        96: { description: "Thunderstorm with hail", icon: "⛈️" },
        99: { description: "Thunderstorm with heavy hail", icon: "⛈️" }
    };

    return weatherConditions[code] || {
        description: "Unknown weather",
        icon: "🌡️"
    };
}

function convertTemperature(celsius, unit) {
    if (unit === "fahrenheit") {
        return (celsius * 9 / 5) + 32;
    }

    return celsius;
}

function formatTemperature(temperature, unit) {
    return Math.round(convertTemperature(temperature, unit));
}

function formatDate(dateString, timezone) {
    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: timezone
    });
}

function formatLocalTime(dateString, timezone) {
    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone
    });
}
