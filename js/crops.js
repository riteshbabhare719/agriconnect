/* ============================================================
   CROPS.JS — My Crops CRUD (localStorage-backed demo)
   FUTURE: swap AGRI.get/set(AGRI.KEYS.CROPS, ...) for
   fetch calls to /api/crops (GET/POST/PUT/DELETE).
   ============================================================ */
 
let editingCropId = null;
 
/* ---------- helpers ---------- */
 
// Crop names are typed by the user and inserted with innerHTML,
// so escape them first (prevents broken layout / script injection).
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}
 
// Picks an icon from the crop NAME first, then falls back to the crop TYPE.
function cropEmoji(name, type) {
  const n = (name || '').toLowerCase();
  const byName = [
    [['orange', 'santra', 'mandarin', 'citrus', 'lemon', 'mosambi'], '🍊'],
    [['cotton', 'kapas'], '🌿'],
    [['soybean', 'soyabean', 'tur', 'pigeon', 'arhar', 'gram', 'chana', 'moong', 'urad'], '🫘'],
    [['wheat', 'rice', 'paddy', 'jowar', 'bajra', 'sorghum', 'millet'], '🌾'],
    [['maize', 'corn'], '🌽'],
    [['tomato'], '🍅'],
    [['onion'], '🧅'],
    [['potato'], '🥔'],
    [['chilli', 'chili'], '🌶️'],
    [['brinjal', 'eggplant'], '🍆'],
    [['banana'], '🍌'],
    [['mango'], '🥭'],
    [['grape'], '🍇'],
    [['sugarcane'], '🎋'],
    [['groundnut', 'peanut'], '🥜'],
    [['sunflower'], '🌻'],
  ];
  for (const [words, emoji] of byName) {
    if (words.some(w => n.includes(w))) return emoji;
  }
  const byType = {
    'Cereal': '🌾', 'Vegetable': '🥬', 'Cash Crop': '🌿',
    'Fruit': '🍎', 'Pulse': '🫘', 'Oilseed': '🌻',
  };
  return byType[type] || '🌱';
}
 
// "Harvest in 45 days" / "Harvest date passed" / ''
function harvestCountdown(harvestDate) {
  if (!harvestDate) return '';
  const target = new Date(harvestDate + 'T00:00:00');
  if (isNaN(target)) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target - today) / 86400000);
  if (days > 1)  return `🗓️ Harvest in ${days} days`;
  if (days === 1) return '🗓️ Harvest tomorrow';
  if (days === 0) return '🗓️ Harvest today';
  return '🗓️ Harvest date passed';
}
 
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d) ? iso
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
 
/* ---------- storage ---------- */
 
function loadCrops() {
  AGRI.seedIfEmpty(AGRI.KEYS.CROPS, AGRI.mock.crops);
  return AGRI.get(AGRI.KEYS.CROPS, []);
}
 
function saveCrops(crops) {
  AGRI.set(AGRI.KEYS.CROPS, crops);
}
 
function stageBadgeClass(status) {
  if (status === 'Healthy') return 'badge';
  if (status === 'Pest Alert') return 'badge badge-danger';
  return 'badge badge-wheat';
}
 
/* ---------- rendering ---------- */
 
function renderCrops() {
  const grid = document.getElementById('cropsGrid');
  const empty = document.getElementById('cropsEmpty');
  if (!grid) return;
  const search = (document.getElementById('cropSearch')?.value || '').toLowerCase();
  const crops = loadCrops().filter(c => (c.name || '').toLowerCase().includes(search));
 
  if (crops.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
 
  grid.innerHTML = crops.map(c => {
    const countdown = harvestCountdown(c.harvestDate);
    return `
    <div class="card card-hover crop-card">
      <div class="crop-top">
        <div>
          <span class="crop-emoji">${cropEmoji(c.name, c.type)}</span>
          <h3 style="display:inline;margin-left:8px;">${escapeHtml(c.name)}</h3>
        </div>
        <span class="${stageBadgeClass(c.status)}">${escapeHtml(c.status)}</span>
      </div>
      <p class="crop-meta">Type: ${escapeHtml(c.type)} · Soil: ${escapeHtml(c.soil)} · Area: ${escapeHtml(c.area)}</p>
      <p class="crop-meta">Sown: ${formatDate(c.sowDate)} → Harvest: ${formatDate(c.harvestDate)}</p>
      <p class="crop-meta">Growth stage: <strong>${escapeHtml(c.stage)}</strong></p>
      ${countdown ? `<p class="crop-meta" style="font-weight:600;">${countdown}</p>` : ''}
      <div class="flex flex-wrap gap-8" style="margin-top:14px;">
        <button class="btn btn-outline btn-sm" onclick="viewCrop('${c.id}')">View</button>
        <button class="btn btn-outline btn-sm" onclick="editCrop('${c.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCrop('${c.id}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}
 
/* ---------- modal ---------- */
 
function openCropModal(crop = null) {
  editingCropId = crop ? crop.id : null;
  document.getElementById('cropModalTitle').textContent = crop ? 'Edit Crop' : 'Add New Crop';
  document.getElementById('cropName').value = crop?.name || '';
  document.getElementById('cropType').value = crop?.type || 'Cereal';
  document.getElementById('sowDate').value = crop?.sowDate || '';
  document.getElementById('cropArea').value = crop?.area || '';
  document.getElementById('soilType').value = crop?.soil || 'Loamy';
  document.getElementById('irrigationType').value = crop?.irrigation || 'Drip';
  document.getElementById('harvestDate').value = crop?.harvestDate || '';
  document.getElementById('cropModal').classList.add('show');
}
function closeCropModal() {
  document.getElementById('cropModal').classList.remove('show');
}
 
/* ---------- actions ---------- */
 
function viewCrop(id) {
  const crop = loadCrops().find(c => c.id === id);
  if (!crop) return;
  alert(
    `${crop.name} (${crop.type})\nStage: ${crop.stage}\nStatus: ${crop.status}\n` +
    `Soil: ${crop.soil}\nIrrigation: ${crop.irrigation}\nArea: ${crop.area}\n` +
    `Sown: ${formatDate(crop.sowDate)}\nExpected Harvest: ${formatDate(crop.harvestDate)}`
  );
}
 
function editCrop(id) {
  const crop = loadCrops().find(c => c.id === id);
  if (crop) openCropModal(crop);
}
 
function deleteCrop(id) {
  if (!confirm('Remove this crop from your list?')) return;
  const crops = loadCrops().filter(c => c.id !== id);
  saveCrops(crops);
  renderCrops();
  AGRI.toast('Crop removed.');
}
 
function initCropForm() {
  const form = document.getElementById('cropForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cropName').value.trim();
    if (!name) { AGRI.toast('Please enter a crop name.', 'error'); return; }
 
    const sowDate = document.getElementById('sowDate').value;
    const harvestDate = document.getElementById('harvestDate').value;
    if (sowDate && harvestDate && harvestDate < sowDate) {
      AGRI.toast('Harvest date cannot be before the sowing date.', 'error');
      return;
    }
 
    const crops = loadCrops();
    const data = {
      name,
      type: document.getElementById('cropType').value,
      sowDate,
      area: document.getElementById('cropArea').value.trim(),
      soil: document.getElementById('soilType').value,
      irrigation: document.getElementById('irrigationType').value,
      harvestDate,
    };
 
    if (editingCropId) {
      // Editing keeps the crop's existing growth stage and status
      // (previously these were reset to "Sowing" / "Healthy" on every edit).
      const idx = crops.findIndex(c => c.id === editingCropId);
      if (idx !== -1) crops[idx] = { ...crops[idx], ...data };
      AGRI.toast('Crop updated successfully.');
    } else {
      crops.push({ id: 'c' + Date.now(), ...data, stage: 'Sowing', status: 'Healthy' });
      AGRI.toast('Crop added successfully.');
    }
    saveCrops(crops);
    closeCropModal();
    renderCrops();
  });
}
 
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('cropsGrid')) return;
  AGRI.requireLogin();
  renderCrops();
  initCropForm();
  document.getElementById('addCropBtn')?.addEventListener('click', () => openCropModal());
  document.getElementById('cropSearch')?.addEventListener('input', renderCrops);
});