const fs = require('fs');
const fetch = require('node-fetch');

(async () => {
  // Coordinates for Chesapeake, VA
  const latitude = 36.7682;
  const longitude = -76.2875;
  
  const pointsUrl = `https://api.weather.gov/points/${latitude},${longitude}`;

  try {
    // Fetch the points data to get the forecastHourly URL
    let response = await fetch(pointsUrl);
    if (!response.ok) {
      throw new Error(`Points API request failed: ${response.status} - ${response.statusText}`);
    }
    const pointsData = await response.json();
    const forecastHourlyUrl = pointsData.properties.forecastHourly;
    
    // Fetch the hourly forecast
    response = await fetch(forecastHourlyUrl, {
      headers: {
        'User-Agent': 'GitHub Action Weather Updater (willpatpost)' 
        // NWS asks for a User-Agent identifying who you are; you can use a brief description here.
      }
    });
    if (!response.ok) {
      throw new Error(`Forecast API request failed: ${response.status} - ${response.statusText}`);
    }
    const forecastData = await response.json();

    // The forecast data contains periods, each is an hourly forecast
    const periods = forecastData.properties.periods;
    // We'll take the first period as the "current" conditions
    const current = periods[0];

    const dataToWrite = {
      location: "Chesapeake, VA, US",
      temperature: current.temperature, // Numeric value
      temperature_unit: current.temperatureUnit, // Typically 'F'
      wind_speed: current.windSpeed,
      short_forecast: current.shortForecast,
      detailed_forecast: current.detailedForecast,
      updated_at: new Date().toISOString()
    };

    fs.writeFileSync('forecast.json', JSON.stringify(dataToWrite, null, 2), 'utf-8');
    console.log("Weather data updated successfully from NWS.");
  } catch (error) {
    console.error("Error fetching or writing weather data:", error);
    process.exit(1);
  }
})();
