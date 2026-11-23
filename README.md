
# Weatherly — Weather Dashboard

Weatherly is a responsive weather dashboard built with HTML, CSS, and vanilla JavaScript. It provides real-time weather conditions, five-day forecasts, location-based weather, temperature conversion, recent searches, and AI-powered weather insights using Google's Gemini API.

## Features

- Search weather by city
- Current weather conditions
- Five-day weather forecast
- Current location weather using Geolocation
- Celsius and Fahrenheit conversion
- Recent searches saved using LocalStorage
- AI-powered weather summaries
- AI weather question-and-answer assistant
- Responsive design for mobile, tablet, and desktop
- Loading states and error handling
- Accessible keyboard navigation and focus indicators

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Open-Meteo Weather API
- Open-Meteo Geocoding API
- Google Gemini API
- LocalStorage
- Browser Geolocation API

## Project Structure

```text
weather-dashboard/
├── index.html
├── README.md
├── .gitignore
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── weather.js
    ├── location.js
    ├── storage.js
    ├── gemini.js
    ├── config.js
    └── config.example.js
```

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd weather-dashboard
```

### 2. Configure Gemini API

Create your Gemini API key using Google AI Studio.

Create `js/config.js`:

```javascript
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
```

Replace the placeholder with your actual API key.

### 3. Run the application

Use VS Code Live Server or another local development server to serve the project.

Open the application in your browser.

## APIs

### Open-Meteo

Weather data and geocoding are provided by Open-Meteo.

https://open-meteo.com/

### Google Gemini

Gemini powers weather summaries, activity suggestions, clothing recommendations, and interactive weather questions.

https://ai.google.dev/

## Security

The Gemini API key is excluded from Git using `.gitignore`.

However, this application calls Gemini directly from the browser. This means the API key can be exposed to users through browser developer tools or network inspection.

For production deployment, use a backend API to securely store the key and proxy Gemini requests.

## Data Storage

Recent searches and temperature preferences are stored locally using browser LocalStorage.

No database is required.

## Browser Requirements

- Modern browser
- JavaScript enabled
- Internet connection
- Location permission for current-location functionality
- Gemini API key for AI features

## License

This project is intended for educational and portfolio purposes.
