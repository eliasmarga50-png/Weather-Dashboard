
const STORAGE_KEYS = {
    recentSearches: "weatherDashboardRecentSearches",
    temperatureUnit: "weatherDashboardTemperatureUnit"
};

function getRecentSearches() {
    try {
        const searches = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.recentSearches)
        );

        return Array.isArray(searches) ? searches : [];
    } catch {
        return [];
    }
}

function saveRecentSearch(cityData) {
    const searches = getRecentSearches();

    const newSearch = {
        name: cityData.name,
        displayName: cityData.displayName,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
        country: cityData.country || "",
        admin1: cityData.admin1 || ""
    };

    const filteredSearches = searches.filter((search) => {
        return (
            search.latitude !== newSearch.latitude ||
            search.longitude !== newSearch.longitude
        );
    });

    filteredSearches.unshift(newSearch);

    const limitedSearches = filteredSearches.slice(0, 8);

    localStorage.setItem(
        STORAGE_KEYS.recentSearches,
        JSON.stringify(limitedSearches)
    );

    return limitedSearches;
}

function clearRecentSearches() {
    localStorage.removeItem(STORAGE_KEYS.recentSearches);
}

function getTemperaturePreference() {
    const savedUnit = localStorage.getItem(STORAGE_KEYS.temperatureUnit);

    return savedUnit === "fahrenheit" ? "fahrenheit" : "celsius";
}

function saveTemperaturePreference(unit) {
    localStorage.setItem(STORAGE_KEYS.temperatureUnit, unit);
}
