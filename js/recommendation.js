/* ============================================================
   RECOMMENDATION.JS — Crop Recommendation (RULE-BASED DEMO)
 
   This is NOT a trained ML model. Each crop has a rough "comfort
   range" for soil, temperature, humidity, rainfall and pH. The score
   shows how closely the farmer's inputs fit each crop's range.
   The ranges are approximate rules of thumb for demo purposes.
 
   FUTURE: replace getRecommendations() with
     fetch(`${AGRI.api.base}/ai/recommend`, { method:'POST', body: JSON.stringify(inputs) })
   which would call a trained model on the FastAPI backend.
   ============================================================ */
 
/* Approximate comfort ranges. Rainfall is on the same scale as the form
   hint (mm). soils[0] is the best soil; the others are acceptable. */
const CROP_PROFILES = [
  { name: 'Cotton', emoji: '🌿', season: 'Kharif',
    soils: ['Black Soil', 'Loamy', 'Clayey'], temp: [21, 32], humidity: [50, 85], rain: [60, 120], ph: [6.0, 8.0],
    tip: 'Sown in June-July after good rain. Watch for pink bollworm and sucking pests.' },
  { name: 'Soybean', emoji: '🫘', season: 'Kharif',
    soils: ['Black Soil', 'Loamy'], temp: [22, 30], humidity: [55, 85], rain: [80, 150], ph: [6.0, 7.5],
    tip: 'Sown in June-July. Use certified seed and watch for yellow mosaic virus.' },
  { name: 'Tur (Pigeon Pea)', emoji: '🫘', season: 'Kharif',
    soils: ['Red Soil', 'Black Soil', 'Loamy', 'Sandy Loam'], temp: [20, 32], humidity: [40, 75], rain: [60, 150], ph: [5.5, 7.5],
    tip: 'Works well as an intercrop with cotton or soybean. Avoid waterlogging.' },
  { name: 'Orange (Nagpur Santra)', emoji: '🍊', season: 'Perennial orchard',
    soils: ['Black Soil', 'Loamy', 'Sandy Loam'], temp: [15, 32], humidity: [50, 90], rain: [70, 130], ph: [6.0, 8.0],
    tip: 'Long-term orchard crop that takes several years to start fruiting. Needs well-drained soil and drip irrigation.' },
  { name: 'Gram (Chana)', emoji: '🫘', season: 'Rabi',
    soils: ['Black Soil', 'Loamy', 'Clayey'], temp: [15, 28], humidity: [30, 65], rain: [40, 90], ph: [6.0, 8.0],
    tip: 'A rabi crop, sown around October-November on residual moisture.' },
  { name: 'Wheat', emoji: '🌾', season: 'Rabi',
    soils: ['Loamy', 'Clayey', 'Black Soil'], temp: [12, 25], humidity: [40, 70], rain: [40, 100], ph: [6.0, 7.5],
    tip: 'A rabi crop, sown around November. Needs several irrigations.' },
  { name: 'Jowar (Sorghum)', emoji: '🌾', season: 'Kharif / Rabi',
    soils: ['Black Soil', 'Red Soil', 'Sandy Loam'], temp: [25, 33], humidity: [40, 75], rain: [40, 100], ph: [6.0, 8.5],
    tip: 'Hardy crop for lower-rainfall fields and a useful fodder source.' },
  { name: 'Maize', emoji: '🌽', season: 'Kharif',
    soils: ['Loamy', 'Sandy Loam'], temp: [18, 30], humidity: [55, 80], rain: [60, 130], ph: [5.8, 7.5],
    tip: 'Needs well-drained soil and good nitrogen supply.' },
  { name: 'Rice (Paddy)', emoji: '🌾', season: 'Kharif',
    soils: ['Clayey', 'Loamy'], temp: [22, 32], humidity: [70, 95], rain: [150, 300], ph: [5.5, 7.0],
    tip: 'Mainly grown in eastern Vidarbha (Gondia, Bhandara, Gadchiroli, Chandrapur). Needs standing water.' },
  { name: 'Groundnut', emoji: '🥜', season: 'Kharif / Summer',
    soils: ['Sandy Loam', 'Red Soil', 'Loamy'], temp: [25, 32], humidity: [50, 75], rain: [50, 110], ph: [6.0, 7.0],
    tip: 'Prefers light, well-drained soil. Heavy black soil can hamper pod development.' },
];
 
/* ---------- scoring ---------- */
 
// 0..1. Inside the range scores 0.85-1.0 (best at the centre).
// Outside it, the score drops towards 0 as the value moves away.
function rangeFit(value, [min, max]) {
  const width = max - min;
  if (value >= min && value <= max) {
    const centre = (min + max) / 2;
    const closeness = 1 - Math.abs(value - centre) / (width / 2);
    return 0.85 + 0.15 * closeness;
  }
  const dist = value < min ? min - value : value - max;
  return Math.max(0, 0.85 * (1 - dist / (width * 0.6)));
}
 
function soilFit(soils, soil) {
  const i = soils.indexOf(soil);
  if (i === 0) return 1;
  if (i > 0) return 0.7;
  return 0.25;
}
 
function scoreCrop(profile, inputs) {
  const parts = [
    { key: 'soil',        weight: 3, fit: soilFit(profile.soils, inputs.soilType) },
    { key: 'temperature', weight: 2, fit: rangeFit(inputs.temperature, profile.temp) },
    { key: 'rainfall',    weight: 2, fit: rangeFit(inputs.rainfall, profile.rain) },
    { key: 'humidity',    weight: 1, fit: rangeFit(inputs.humidity, profile.humidity) },
  ];
  if (inputs.ph !== null) parts.push({ key: 'pH', weight: 1, fit: rangeFit(inputs.ph, profile.ph) });
 
  const totalWeight = parts.reduce((s, p) => s + p.weight, 0);
  const score = Math.round(parts.reduce((s, p) => s + p.weight * p.fit, 0) / totalWeight * 100);
  return { profile, score, parts };
}
 
function getRecommendations(inputs) {
  return CROP_PROFILES
    .map(p => scoreCrop(p, inputs))
    .sort((a, b) => b.score - a.score || a.profile.name.localeCompare(b.profile.name));
}
 
/* ---------- explanations ---------- */
 
function explain(result, inputs) {
  const good = result.parts.filter(p => p.fit >= 0.85).map(p => p.key);
  const check = result.parts.filter(p => p.fit < 0.6).map(p => p.key);
  const lines = [];
  if (good.length) lines.push(`Good fit for your ${good.join(', ')}.`);
  if (check.length) lines.push(`Check: your ${check.join(', ')} ${check.length > 1 ? 'are' : 'is'} outside this crop's comfortable range.`);
  return lines.join(' ');
}
 
// Rough nutrient and pH notes. Real quantities need a soil test.
function nutrientNotes(inputs) {
  const notes = [];
  if (inputs.n !== null && inputs.n < 40) notes.push('Nitrogen looks low. Plan split urea doses and add organic matter.');
  if (inputs.p !== null && inputs.p < 20) notes.push('Phosphorus looks low. DAP at sowing can help.');
  if (inputs.k !== null && inputs.k < 20) notes.push('Potassium looks low. Consider potash as advised by a soil test.');
  if (inputs.ph !== null && inputs.ph < 5.8) notes.push('Soil is on the acidic side. Ask your KVK about liming.');
  if (inputs.ph !== null && inputs.ph > 8.2) notes.push('Soil is on the alkaline side. Organic matter and gypsum may help; confirm with a soil test.');
  return notes;
}
 
/* ---------- rendering ---------- */
 
function scoreBar(score) {
  return `<div style="background:var(--leaf-100);border-radius:999px;height:8px;overflow:hidden;margin:6px 0;">
            <div style="width:${score}%;height:100%;background:var(--leaf-600);border-radius:999px;"></div>
          </div>`;
}
 
function renderResults(results, inputs) {
  const [top, ...rest] = results;
  const others = rest.slice(0, 2);
  const notes = nutrientNotes(inputs);
 
  return `
    <div class="card" style="border-color:var(--leaf-600);">
      <span class="badge">Best match for your field</span>
      <h2 style="margin:10px 0 4px;">${top.profile.emoji} ${top.profile.name}</h2>
      <p class="mb-0"><strong>Suitability score: ${top.score}%</strong> <span class="badge badge-wheat" style="margin-left:6px;">${top.profile.season}</span></p>
      ${scoreBar(top.score)}
      <p class="text-muted">${explain(top, inputs)}</p>
      <p>${top.profile.tip}</p>
      ${notes.length ? `
        <div style="border-top:1px solid var(--border-soft);padding-top:10px;">
          <p style="margin:0 0 4px;font-weight:600;">Soil notes</p>
          ${notes.map(n => `<p class="text-muted" style="margin:2px 0;font-size:0.92rem;">• ${n}</p>`).join('')}
        </div>` : ''}
    </div>
 
    <h3 style="margin:20px 0 10px;">Other options</h3>
    ${others.map(r => `
      <div class="card" style="margin-bottom:12px;">
        <div class="flex-between gap-12">
          <strong>${r.profile.emoji} ${r.profile.name}</strong>
          <span class="badge">${r.score}%</span>
        </div>
        ${scoreBar(r.score)}
        <p class="text-muted mb-0" style="font-size:0.9rem;">${r.profile.tip}</p>
      </div>`).join('')}
 
    <div class="flex flex-wrap gap-12" style="margin-top:8px;">
      <a href="market.html" class="btn btn-outline btn-sm btn-inline">📈 Check prices</a>
      <a href="ai-assistant.html" class="btn btn-outline btn-sm btn-inline">🤖 Ask the assistant</a>
    </div>
    <p class="field-hint" style="margin-top:12px;">⚠️ Demo: a rule-based match against approximate crop ranges, not a trained AI model. Confirm with your local KVK or a soil test before deciding.</p>`;
}
 
/* ---------- form ---------- */
 
function readNumber(id) {
  const raw = document.getElementById(id)?.value;
  if (raw === undefined || raw === null || String(raw).trim() === '') return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}
 
function validate(inputs) {
  if (inputs.temperature === null) return 'Please enter the temperature.';
  if (inputs.humidity === null) return 'Please enter the humidity.';
  if (inputs.rainfall === null) return 'Please enter the rainfall.';
  if (inputs.temperature < -5 || inputs.temperature > 55) return 'Temperature should be between -5 and 55 °C.';
  if (inputs.humidity < 0 || inputs.humidity > 100) return 'Humidity should be between 0 and 100%.';
  if (inputs.rainfall < 0) return 'Rainfall cannot be negative.';
  if (inputs.ph !== null && (inputs.ph < 3 || inputs.ph > 10)) return 'Soil pH should be between 3 and 10.';
  return '';
}
 
function fillSampleValues() {
  const sample = {
    soilType: 'Black Soil', nitrogen: 90, phosphorus: 45, potassium: 40,
    temperature: 28, humidity: 65, rainfall: 100, soilPh: 7.0,
  };
  Object.entries(sample).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
}
 
function initRecommendationForm() {
  const form = document.getElementById('recommendForm');
  if (!form) return;
 
  // Black soil is the most common soil in Vidarbha, so start there
  const soil = document.getElementById('soilType');
  if (soil) soil.value = 'Black Soil';
 
  // Handy for demos and for farmers who want to see how it works
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.insertAdjacentHTML('afterend',
      '<button type="button" id="sampleValuesBtn" class="btn btn-outline btn-block" style="margin-top:10px;">Use sample values</button>');
    document.getElementById('sampleValuesBtn').addEventListener('click', fillSampleValues);
  }
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = {
      soilType: document.getElementById('soilType').value,
      n: readNumber('nitrogen'),
      p: readNumber('phosphorus'),
      k: readNumber('potassium'),
      temperature: readNumber('temperature'),
      humidity: readNumber('humidity'),
      rainfall: readNumber('rainfall'),
      ph: readNumber('soilPh'),
    };
 
    const error = validate(inputs);
    if (error) { AGRI.toast(error, 'error'); return; }
 
    const resultBox = document.getElementById('recommendResult');
    resultBox.innerHTML = '<div class="skeleton" style="height:180px;"></div>';
    resultBox.style.display = 'block';
 
    setTimeout(() => {
      resultBox.innerHTML = renderResults(getRecommendations(inputs), inputs);
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 500);   // short pause so the loading state is visible
  });
}
 
document.addEventListener('DOMContentLoaded', initRecommendationForm);
 