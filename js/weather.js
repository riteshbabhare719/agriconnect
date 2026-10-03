/* ============================================================
   WEATHER.JS — live weather from Open-Meteo (free, no API key)
   with an automatic fallback to sample data if the request fails.
 
   Location: uses the logged-in farmer's district (from the
   agri_user session) if it is a known Vidarbha district,
   otherwise defaults to Nagpur.
 
   FUTURE: route this through the backend (e.g. FastAPI
   /weather?district=...) to cache responses and hide the source.
   ============================================================ */
 
/* ---------- Vidarbha districts (approx. coordinates) ---------- */
const VIDARBHA_DISTRICTS = {
  nagpur:     { name: 'Nagpur',     lat: 21.1458, lon: 79.0882 },
  amravati:   { name: 'Amravati',   lat: 20.9320, lon: 77.7523 },
  wardha:     { name: 'Wardha',     lat: 20.7453, lon: 78.6022 },
  akola:      { name: 'Akola',      lat: 20.7096, lon: 77.0082 },
  yavatmal:   { name: 'Yavatmal',   lat: 20.3888, lon: 78.1204 },
  buldhana:   { name: 'Buldhana',   lat: 20.5292, lon: 76.1842 },
  washim:     { name: 'Washim',     lat: 20.1119, lon: 77.1332 },
  chandrapur: { name: 'Chandrapur', lat: 19.9615, lon: 79.2961 },
  gadchiroli: { name: 'Gadchiroli', lat: 20.1849, lon: 79.9948 },
  gondia:     { name: 'Gondia',     lat: 21.4624, lon: 80.1920 },
  bhandara:   { name: 'Bhandara',   lat: 21.1670, lon: 79.6500 }
};
 
function getFarmerLocation() {
  try {
    const profile = JSON.parse(localStorage.getItem('agri_profile') || '{}');
    const user = JSON.parse(localStorage.getItem('agri_user') || '{}');
    const key = (profile.district || user.district || '').trim().toLowerCase();
    if (VIDARBHA_DISTRICTS[key]) return VIDARBHA_DISTRICTS[key];
  } catch (e) { /* ignore bad session data */ }
  return VIDARBHA_DISTRICTS.nagpur;
}
 
/* ---------- WMO weather code -> icon + label ---------- */
function describeWeather(code) {
  if (code === 0)  return { icon: '☀️', cond: 'Clear sky' };
  if (code === 1)  return { icon: '🌤️', cond: 'Mostly clear' };
  if (code === 2)  return { icon: '⛅', cond: 'Partly cloudy' };
  if (code === 3)  return { icon: '☁️', cond: 'Overcast' };
  if (code === 45 || code === 48) return { icon: '🌫️', cond: 'Fog' };
  if (code >= 51 && code <= 57) return { icon: '🌦️', cond: 'Drizzle' };
  if (code >= 61 && code <= 67) return { icon: '🌧️', cond: 'Rain' };
  if (code >= 71 && code <= 77) return { icon: '❄️', cond: 'Snow' };
  if (code >= 80 && code <= 82) return { icon: '🌦️', cond: 'Rain showers' };
  if (code >= 95) return { icon: '⛈️', cond: 'Thunderstorm' };
  return { icon: '⛅', cond: 'Cloudy' };
}
 
/* ---------- Farming advisory (rule-based, from the forecast) ---------- */
function buildAdvisory(cur, days) {
  const tips = [];
  const rainSoon = days.slice(0, 2).some(d => d.rainChance >= 60 || d.rainMm >= 5);
  const maxTemp = Math.max(...days.slice(0, 3).map(d => d.max));
 
  if (rainSoon) {
    tips.push('Rain is likely in the next two days. Postpone pesticide and fertilizer spraying, and cover harvested produce.');
  } else {
    tips.push('No heavy rain expected soon. Good window for spraying, weeding and harvesting.');
  }
  if (maxTemp >= 40) {
    tips.push('Very hot days ahead. Irrigate in the early morning or evening to reduce water loss.');
  }
  if (cur.wind >= 25) {
    tips.push('Winds are strong. Avoid spraying today as the drift will waste the product.');
  }
  if (cur.humidity >= 80 && !rainSoon) {
    tips.push('High humidity raises fungal disease risk. Inspect leaves and fruit regularly.');
  }
  return tips.join(' ');
}
 
/* ---------- Sample data (used only if the live request fails) ---------- */
function fetchWeatherMock() {
  return {
    live: false,
    location: 'Nagpur, Maharashtra',
    temp: 29,
    condition: 'Partly Cloudy',
    icon: '⛅',
    humidity: 68,
    rainfall: '4 mm today',
    windSpeed: '12 km/h',
    advisory: 'Rain is expected tomorrow. Consider postponing pesticide spraying and cover harvested produce.',
    forecast: (window.AGRI && AGRI.mock && AGRI.mock.forecast) ? AGRI.mock.forecast : []
  };
}
 
/* ---------- Live data from Open-Meteo ---------- */
async function fetchWeatherLive() {
  const loc = getFarmerLocation();
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${loc.lat}&longitude=${loc.lon}`
    + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max'
    + '&timezone=Asia%2FKolkata&forecast_days=5';
 
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);   // give up after 8s
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error('Weather request failed: ' + res.status);
    const j = await res.json();
 
    const now = describeWeather(j.current.weather_code);
    const cur = {
      temp: Math.round(j.current.temperature_2m),
      humidity: Math.round(j.current.relative_humidity_2m),
      wind: Math.round(j.current.wind_speed_10m)
    };
 
    const days = j.daily.time.map((dateStr, i) => {
      const d = describeWeather(j.daily.weather_code[i]);
      const dayName = i === 0
        ? 'Today'
        : new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
      return {
        day: dayName,
        icon: d.icon,
        cond: d.cond,
        max: Math.round(j.daily.temperature_2m_max[i]),
        min: Math.round(j.daily.temperature_2m_min[i]),
        rainMm: j.daily.precipitation_sum[i] || 0,
        rainChance: j.daily.precipitation_probability_max[i] || 0
      };
    });
 
    return {
      live: true,
      location: `${loc.name}, Maharashtra`,
      temp: cur.temp,
      condition: now.cond,
      icon: now.icon,
      humidity: cur.humidity,
      rainfall: `${days[0].rainMm} mm today`,
      windSpeed: `${cur.wind} km/h`,
      advisory: buildAdvisory(cur, days),
      forecast: days
    };
  } finally {
    clearTimeout(timer);
  }
}
 
/* ---------- Rendering ---------- */
function renderWeather(data) {
  const cur = document.getElementById('currentWeather');
  if (cur) {
    const badge = data.live
      ? '<span class="badge">🟢 Live data</span>'
      : '<span class="badge badge-wheat">Sample data (offline)</span>';
 
    cur.innerHTML = `
      <div class="flex-between flex-wrap gap-16">
        <div>
          <p class="text-muted" style="margin-bottom:4px;">${data.location} ${badge}</p>
          <div style="font-size:3rem;line-height:1;">${data.icon} ${data.temp}°C</div>
          <p style="margin-top:6px;">${data.condition}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:16px;flex:1 1 260px;">
          <div><p class="text-muted mb-0" style="font-size:0.85rem;">Humidity</p><strong>${data.humidity}%</strong></div>
          <div><p class="text-muted mb-0" style="font-size:0.85rem;">Rainfall</p><strong>${data.rainfall}</strong></div>
          <div><p class="text-muted mb-0" style="font-size:0.85rem;">Wind</p><strong>${data.windSpeed}</strong></div>
        </div>
      </div>`;
  }
 
  const advisory = document.getElementById('weatherAdvisory');
  if (advisory) advisory.textContent = data.advisory;
 
  const forecastEl = document.getElementById('forecastRow');
  if (forecastEl) {
    forecastEl.innerHTML = data.forecast.map(f => {
      // live data has max/min; the old mock data has a single temp
      const temp = (f.max !== undefined) ? `${f.max}° / ${f.min}°C` : `${f.temp}°C`;
      const rain = (f.rainChance !== undefined)
        ? `<p class="text-muted" style="font-size:0.8rem;margin:2px 0 0;">💧 ${f.rainChance}% rain</p>`
        : '';
      return `
        <div class="card text-center">
          <p style="font-weight:600;margin-bottom:6px;">${f.day}</p>
          <div style="font-size:2rem;">${f.icon}</div>
          <p style="margin:6px 0 0;">${temp}</p>
          <p class="text-muted" style="font-size:0.85rem;margin:2px 0 0;">${f.cond}</p>
          ${rain}
        </div>`;
    }).join('');
  }
}
 
function renderWeatherLoading() {
  const cur = document.getElementById('currentWeather');
  if (cur) cur.innerHTML = '<div class="skeleton" style="height:110px;"></div>';
}
 
async function initWeather() {
  renderWeatherLoading();
  try {
    renderWeather(await fetchWeatherLive());
  } catch (err) {
    console.warn('Live weather unavailable, using sample data:', err);
    renderWeather(fetchWeatherMock());
  }
}
 
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('currentWeather')) initWeather();
});