const fs = require('fs');
const fetch = require('node-fetch');

(async () => {
  const apiKey = process.env.WEATHER_API_KEY;
  const location = process.env.LOCATION; // "Chesapeake,Virginia,US"
  
  if (!apiKey || !location) {
    console.error("Missing WEATHER_API_KEY or LOCATION environment variables.");
    process.exit(1);
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const forecastData = {
      location: data.name,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      description: data.weather[0].description,
      updated_at: new Date().toISOString()
    };

    fs.writeFileSync('forecast.json', JSON.stringify(forecastData, null, 2), 'utf-8');
    console.log("Weather data updated successfully.");
  } catch (error) {
    console.error("Error fetching or writing weather data:", error);
    process.exit(1);
  }
})();
