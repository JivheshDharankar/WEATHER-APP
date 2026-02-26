// DOM Elements
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const loadingState = document.querySelector("#loading");
const errorState = document.querySelector("#error");
const weatherContent = document.querySelector("#weather-content");

// Weather data elements
const locationEl = document.querySelector("#location");
const dayEl = document.querySelector("#day");
const dateEl = document.querySelector("#date");
const timeEl = document.querySelector("#time");
const temperatureEl = document.querySelector("#temperature");
const conditionEl = document.querySelector("#condition");
const weatherIconEl = document.querySelector("#weather-icon");
const feelsLikeEl = document.querySelector("#feels-like");
const humidityEl = document.querySelector("#humidity");
const windSpeedEl = document.querySelector("#wind-speed");
const uvIndexEl = document.querySelector("#uv-index");
const pressureEl = document.querySelector("#pressure");
const visibilityEl = document.querySelector("#visibility");
const cloudCoverEl = document.querySelector("#cloud-cover");

// Initialize — show idle state, don't auto-fetch (avoids "Location Not Found"
// flash on Netlify / restricted environments where the API call fails silently)
window.addEventListener("DOMContentLoaded", () => {
  createParticles();
  showIdle();
});

// Create animated particles background
function createParticles() {
  const particlesBg = document.getElementById("particles-bg");
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    const size = Math.random() * 4 + 1;
    const xPos = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = Math.random() * 10 + 10;

    const drift = Math.round(Math.random() * 100 - 50);
    const animName = `particleFloat_${i}`;

    const keyframe = document.createElement("style");
    keyframe.textContent = `
      @keyframes ${animName} {
        to { transform: translateY(100vh) translateX(${drift}px); opacity: 0; }
      }
    `;
    document.head.appendChild(keyframe);

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${xPos}%;
      top: -${size}px;
      animation: ${animName} ${duration}s linear ${delay}s infinite;
      opacity: ${Math.random() * 0.5 + 0.3};
    `;

    particlesBg.appendChild(particle);
  }
}

// Search button click handler
searchBtn.addEventListener("click", handleSearch);

// Enter key handler
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

// Handle search
function handleSearch() {
  const location = searchInput.value.trim();

  if (!location) {
    searchInput.focus();
    searchInput.classList.add("shake");
    setTimeout(() => searchInput.classList.remove("shake"), 500);
    return;
  }

  fetchWeather(location);
  userInitiated = true;
  searchInput.value = "";
}

// Track the error-recovery timeout so it can be cancelled if a new fetch
// starts before the 3-second window expires.
let errorTimeoutId = null;

// Track whether a user search is in progress (vs. a background/auto fetch)
let userInitiated = false;

// Fetch weather data
async function fetchWeather(location) {
  clearTimeout(errorTimeoutId);
  showLoading();

  const url = `https://api.weatherapi.com/v1/current.json?key=c7236d36debb4636a18170654262201&q=${encodeURIComponent(location)}&aqi=no`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Location not found");
    }

    const data = await response.json();
    updateUI(data);
    showWeatherContent();
  } catch (error) {
    console.error("Error fetching weather:", error);
    showError();
  }
}

// Update UI with weather data
function updateUI(data) {
  // Location
  locationEl.textContent = `${data.location.name}, ${data.location.country}`;

  const [datePart, timePart] = data.location.localtime.split(" ");
  const [year, month, day]   = datePart.split("-").map(Number);
  const [hours, minutes]     = timePart.split(":").map(Number);
  const localDateTime        = new Date(year, month - 1, day, hours, minutes);
  
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  dayEl.textContent = days[localDateTime.getDay()];
  dateEl.textContent = `${months[localDateTime.getMonth()]} ${localDateTime.getDate()}, ${localDateTime.getFullYear()}`;
  timeEl.textContent = localDateTime.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true 
  });

  // Temperature
  temperatureEl.textContent = Math.round(data.current.temp_c);
  feelsLikeEl.textContent = Math.round(data.current.feelslike_c);

  // Condition & icon
  conditionEl.textContent = data.current.condition.text;
  weatherIconEl.src = `https:${data.current.condition.icon}`.replace("64x64", "128x128");
  weatherIconEl.alt = data.current.condition.text;

  // Details
  humidityEl.textContent = `${data.current.humidity}%`;
  windSpeedEl.textContent = `${Math.round(data.current.wind_kph)} km/h`;
  uvIndexEl.textContent = data.current.uv;
  pressureEl.textContent = `${Math.round(data.current.pressure_mb)} mb`;
  visibilityEl.textContent = `${Math.round(data.current.vis_km)} km`;
  cloudCoverEl.textContent = `${data.current.cloud}%`;

  // Update theme based on weather condition
  updateTheme(data.current.condition.text, data.current.is_day);
  
  // Create weather animations
  createWeatherAnimation(data.current.condition.text);
}

// Update theme based on weather
function updateTheme(condition, isDay) {
  const body = document.body;
  

 
  body.classList.remove("sunny", "rainy", "cloudy", "night", "snowy");

  if (!isDay) {
    body.classList.add("night");
    return;
  }

  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) {
    body.classList.add("sunny");
  } else if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle") || lowerCondition.includes("thunder")) {
    body.classList.add("rainy");
  
  } else if (lowerCondition.includes("snow") || lowerCondition.includes("sleet") || lowerCondition.includes("blizzard")) {
    body.classList.add("snowy");
  } else if (lowerCondition.includes("cloud") || lowerCondition.includes("overcast") || lowerCondition.includes("mist") || lowerCondition.includes("fog")) {
    body.classList.add("cloudy");
  } else {
    body.classList.add("sunny");
  }
}

// Create weather-specific animations
function createWeatherAnimation(condition) {
  const weatherAnimation = document.getElementById("weather-animation");
  weatherAnimation.innerHTML = ""; // Clear previous animations

  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle")) {
    createRain(weatherAnimation);
  } else if (lowerCondition.includes("snow")) {
    createSnow(weatherAnimation);
  } else if (lowerCondition.includes("cloud") || lowerCondition.includes("overcast")) {
    createClouds(weatherAnimation);
  }
}

// Create rain animation
function createRain(container) {
  const raindrops = 100;
  
  for (let i = 0; i < raindrops; i++) {
    const raindrop = document.createElement("div");
    raindrop.className = "raindrop";
    
    const xPos = Math.random() * 100;
    const duration = Math.random() * 0.5 + 0.5;
    const delay = Math.random() * 2;
    
    raindrop.style.cssText = `
      left: ${xPos}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: ${Math.random() * 0.3 + 0.4};
    `;
    
    container.appendChild(raindrop);
  }
}

// Create snow animation
function createSnow(container) {
  const snowflakes = 50;
  
  for (let i = 0; i < snowflakes; i++) {
    const snowflake = document.createElement("div");
    snowflake.className = "snowflake";
    
    const xPos = Math.random() * 100;
    const size = Math.random() * 5 + 3;
    const duration = Math.random() * 5 + 5;
    const delay = Math.random() * 5;
    
    snowflake.style.cssText = `
      left: ${xPos}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    
    container.appendChild(snowflake);
  }
}

// Create clouds animation
function createClouds(container) {
  const cloudCount = 5;
  
  for (let i = 0; i < cloudCount; i++) {
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    
    const width = Math.random() * 100 + 80;
    const height = width * 0.4;
    const yPos = Math.random() * 30 + 10;
    const duration = Math.random() * 20 + 20;
    const delay = Math.random() * 5;
    
    cloud.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      top: ${yPos}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    
    container.appendChild(cloud);
  }
}

// Show idle/welcome state (on first load — no search yet)
function showIdle() {
  loadingState.style.display = "none";
  errorState.style.display = "none";
  weatherContent.style.display = "none";
  document.getElementById("idle-state").style.display = "block";
}

// Show loading state
function showLoading() {
  document.getElementById("idle-state").style.display = "none";
  loadingState.style.display = "block";
  errorState.style.display = "none";
  weatherContent.style.display = "none";
}

// Show error state — only if the user actually typed a search
function showError() {
  // If this wasn't user-initiated (e.g. a background fetch), just go idle
  if (!userInitiated) {
    showIdle();
    return;
  }

  loadingState.style.display = "none";
  errorState.style.display = "block";
  weatherContent.style.display = "none";

  // After 3 seconds return to idle (not loading), and reset the flag
  errorTimeoutId = setTimeout(() => {
    if (weatherContent.style.display === "none") {
      errorState.style.display = "none";
      document.getElementById("idle-state").style.display = "block";
    }
    userInitiated = false;
  }, 3000);
}

// Show weather content
function showWeatherContent() {
  document.getElementById("idle-state").style.display = "none";
  loadingState.style.display = "none";
  errorState.style.display = "none";
  weatherContent.style.display = "block";
}


const shakeStyle = document.createElement("style");
shakeStyle.textContent = `.shake { animation: shake 0.5s ease-in-out; }`;
document.head.appendChild(shakeStyle);
