
const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function askGemini(prompt, weatherData) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        throw new Error("Please configure your Gemini API key in js/config.js.");
    }

    const context = buildWeatherContext(weatherData);

    const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [
                    {
                        text: `You are a helpful weather assistant. Use the supplied weather information as your factual source. Do not invent weather measurements or claim to have live information beyond the supplied data. Be friendly, practical, concise, and easy to understand. If the user asks something unrelated to weather, politely answer briefly if appropriate, then guide them back to weather topics.

Current weather context:
${context}`
                    }
                ]
            },
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 700
            }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        const apiMessage = data.error?.message || "Gemini request failed.";
        throw new Error(apiMessage);
    }

    const text = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }

    return text;
}

function buildWeatherContext(weatherData) {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const weatherCondition = getWeatherInfo(current.weather_code);

    const forecast = daily.time.map((date, index) => {
        const condition = getWeatherInfo(daily.weather_code[index]);

        return {
            date,
            condition: condition.description,
            maximum: daily.temperature_2m_max[index],
            minimum: daily.temperature_2m_min[index],
            precipitationProbability: daily.precipitation_probability_max[index]
        };
    });

    return JSON.stringify({
        current: {
            temperatureCelsius: current.temperature_2m,
            feelsLikeCelsius: current.apparent_temperature,
            humidityPercent: current.relative_humidity_2m,
            windSpeedKmh: current.wind_speed_10m,
            precipitationMm: current.precipitation,
            condition: weatherCondition.description,
            observationTime: current.time,
            timezone: weatherData.timezone
        },
        forecast
    }, null, 2);
}

async function generateWeatherInsights(weatherData) {
    const prompt = `Analyze the current weather and five-day forecast.

Provide a useful weather report with exactly these sections:

**Weather Summary**
Describe today's weather in 2-3 sentences.

**What to Wear**
Suggest suitable clothing.

**Outdoor Activities**
Recommend whether outdoor activities are suitable and mention precautions.

**Weather Advice**
Provide the most important practical advice based on the forecast.

Keep the answer concise, friendly, and specific to the supplied data.`;

    return askGemini(prompt, weatherData);
}

async function askWeatherQuestion(question, weatherData) {
    const prompt = `The user is asking a question about the weather.

Question: ${question}

Use the provided weather context to answer accurately. If relevant, compare today's weather with the five-day forecast. Keep the answer clear and useful.`;

    return askGemini(prompt, weatherData);
}
