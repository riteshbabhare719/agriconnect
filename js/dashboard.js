/* ============================================================
   DASHBOARD.JS — Farmer Dashboard summary widgets
 
   Reuses helpers from other scripts when they are loaded:
     crops.js   -> cropEmoji, escapeHtml, harvestCountdown, stageBadgeClass
     weather.js -> fetchWeatherLive, fetchWeatherMock
   Add these to dashboard.html (see order below). If they are
   missing, this file still works with simpler fallbacks.
 
     <script src="js/main.js"></script>
     <script src="js/crops.js"></script>
     <script src="js/weather.js"></script>
     <script src="js/dashboard.js"></script>
   ============================================================ */
 
/* ---------- safe fallbacks if the helper scripts are not loaded ---------- */
const dash = {
  esc: (v) => (typeof escapeHtml === 'function')
    ? escapeHtml(v)
    : String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  emoji: (c) => (typeof cropEmoji === 'function') ? cropEmoji(c.name, c.type) : '🌾',
  countdown: (d) => (typeof harvestCountdown === 'function') ? harvestCountdown(d) : '',
  badge: (s) => (typeof stageBadgeClass === 'function')
    ? stageBadgeClass(s)
    : 'badge ' + (s === 'Healthy' ? '' : 'badge-wheat'),
};
 
/* Static tips (the first tip slot is replaced by the live weather advisory) */
const FARMING_TIPS = [
  { icon: '🌦️', text: 'Check the 5-day forecast before planning spraying or harvesting.' },
  { icon: '🍊', text: 'Mulch the basin of orange trees and keep irrigation even. Uneven watering is a common cause of fruit drop.' },
  { icon: '🪤', text: 'Check pheromone traps in cotton every week. Rising pink bollworm moth catches mean it is time to act.' },
  { icon: '📈', text: 'Compare prices at nearby mandis (Nagpur, Katol, Amravati) and add transport cost before you decide where to sell.' },
];
 
function greetingForHour(hour) {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
 
function getWelcomeLocation(user) {
  const profile = AGRI.get(AGRI.KEYS.PROFILE, {}) || {};
  const u = user || {};
  const parts = [profile.village || u.village, profile.district || u.district].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Nagpur, Maharashtra';
}
 
function renderWelcome(user) {
  const h1 = document.querySelector('.welcome-bar h1');
  if (h1) {
    // The static HTML always says "Good Morning"; make it follow the time of day.
    h1.innerHTML = `${greetingForHour(new Date().getHours())}, <span id="welcomeName"></span> 👋`;
  }
  const nameEl = document.getElementById('welcomeName');
  if (nameEl) nameEl.textContent = user?.name || 'Farmer';
 
  const loc = document.getElementById('welcomeLocation');
  if (loc) loc.textContent = getWelcomeLocation(user);
}
 
function renderSummaryWeather(w) {
  const el = document.getElementById('summaryWeather');
  if (!el) return;
  el.innerHTML = `<span class="value">${w.temp}°C</span><p class="label">${dash.esc(w.cond)} today</p>`;
}
 
function renderTips(advisoryText) {
  const tipsEl = document.getElementById('farmingTips');
  if (!tipsEl) return;
  const tips = FARMING_TIPS.map((t, i) =>
    (i === 0 && advisoryText) ? { icon: '🌦️', text: advisoryText } : t
  );
  tipsEl.innerHTML = tips.map(t => `
    <div class="card tip-card"><span class="tip-icon">${t.icon}</span><p class="mb-0">${dash.esc(t.text)}</p></div>
  `).join('');
}
 
/* Weather is async: show sample data instantly, then upgrade to live data. */
async function loadSummaryWeather() {
  const fallback = AGRI.mock.forecast[0];
  renderSummaryWeather({ temp: fallback.temp, cond: fallback.cond });
 
  if (typeof fetchWeatherLive !== 'function') return;
  try {
    const live = await fetchWeatherLive();
    renderSummaryWeather({ temp: live.temp, cond: live.condition });
    renderTips(live.advisory);
  } catch (err) {
    console.warn('Dashboard: live weather unavailable, keeping sample data.', err);
  }
}
 
function renderDashboard() {
  const user = AGRI.currentUser();
  renderWelcome(user);
 
  AGRI.seedIfEmpty(AGRI.KEYS.CROPS, AGRI.mock.crops);
  const crops = AGRI.get(AGRI.KEYS.CROPS, AGRI.mock.crops);
  const marketTop = AGRI.mock.marketPrices[0];
  const availableTransport = AGRI.mock.transport.filter(t => t.available).length;
 
  document.getElementById('summaryCrops').innerHTML =
    `<span class="value">${crops.length}</span><p class="label">Crops being tracked</p>`;
  document.getElementById('summaryMarket').innerHTML =
    `<span class="value">₹${marketTop.avg.toLocaleString('en-IN')}</span>` +
    `<p class="label">${dash.esc(marketTop.crop)} avg. per quintal (sample)</p>`;
  document.getElementById('summaryTransport').innerHTML =
    `<span class="value">${availableTransport}</span><p class="label">Vehicles available nearby</p>`;
 
  const cropsPreview = document.getElementById('myCropsPreview');
  if (crops.length === 0) {
    cropsPreview.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <span class="emoji">🌱</span>
        <p>No crops yet. Add your first crop to start tracking it.</p>
      </div>`;
  } else {
    cropsPreview.innerHTML = crops.slice(0, 4).map(c => {
      const countdown = dash.countdown(c.harvestDate);
      return `
      <div class="card crop-card">
        <div class="crop-top">
          <span class="crop-emoji">${dash.emoji(c)}</span>
          <span class="${dash.badge(c.status)}">${dash.esc(c.status)}</span>
        </div>
        <h3 style="margin:8px 0 2px;">${dash.esc(c.name)}</h3>
        <p class="crop-meta">Stage: ${dash.esc(c.stage)}</p>
        ${countdown ? `<p class="crop-meta" style="font-weight:600;">${countdown}</p>` : ''}
      </div>`;
    }).join('');
  }
 
  renderTips(null);       // static tips first, upgraded below if live weather loads
  loadSummaryWeather();
}
 
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('summaryCrops')) return;
  AGRI.requireLogin();
  renderDashboard();
});
 