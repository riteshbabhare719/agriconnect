/* ============================================================
   PROFILE.JS — Farmer Profile view/edit (localStorage demo)
   FUTURE: replace with fetch(`${AGRI.api.base}/users/me`)
   ============================================================ */
 
// Only used if someone reaches this page with no saved profile.
// Matches the demo farmer created at login (auth.js).
const DEFAULT_PROFILE = {
  name: 'Ramesh Patil', mobile: '9876543210', email: 'ramesh.patil@example.com',
  state: 'Maharashtra', district: 'Nagpur', village: 'Katol',
  farmArea: '10 acres', mainCrops: 'Orange, Cotton, Soybean, Tur', language: 'en',
};
 
const EDITABLE_FIELDS = ['name', 'mobile', 'email', 'state', 'district', 'village', 'farmArea', 'mainCrops'];
 
/* ---------- helpers ---------- */
 
// Profile values are user-typed and inserted with innerHTML: escape them.
function profEsc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}
 
// "+91 98765 43210" / "098765 43210" -> "9876543210"
function profNormalizeMobile(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}
 
function loadProfile() {
  AGRI.seedIfEmpty(AGRI.KEYS.PROFILE, DEFAULT_PROFILE);
  return AGRI.get(AGRI.KEYS.PROFILE, DEFAULT_PROFILE);
}
 
/* ---------- view ---------- */
 
function renderProfileView() {
  const p = loadProfile();
  const view = document.getElementById('profileView');
  if (!view) return;
 
  const field = (label, value) => `
    <div>
      <p class="text-muted mb-0" style="font-size:0.85rem;">${label}</p>
      <strong>${profEsc(value) || '—'}</strong>
    </div>`;
 
  view.innerHTML = `
    <div class="grid grid-2">
      ${field('Full Name', p.name)}
      ${field('Mobile', p.mobile)}
      ${field('Email', p.email)}
      ${field('State', p.state)}
      ${field('District', p.district)}
      ${field('Village', p.village)}
      ${field('Farm Area', p.farmArea)}
      ${field('Main Crops', p.mainCrops)}
    </div>`;
 
  document.getElementById('profileNameHeading').textContent = p.name || 'Farmer';
  // Join only the parts that exist, so there are no stray commas
  document.getElementById('profileLocHeading').textContent =
    [p.village, p.district, p.state].filter(Boolean).join(', ');
}
 
/* ---------- edit modal ---------- */
 
function openEditProfile() {
  const p = loadProfile();
  EDITABLE_FIELDS.forEach(key => {
    const el = document.getElementById('edit_' + key);
    if (el) el.value = p[key] ?? '';
  });
  document.getElementById('profileEditModal').classList.add('show');
}
function closeEditProfile() {
  document.getElementById('profileEditModal').classList.remove('show');
}
 
// Returns an error message, or '' if everything is fine
function validateProfile(v) {
  if (v.name.length < 2) return 'Please enter your full name.';
  if (!/^[6-9]\d{9}$/.test(profNormalizeMobile(v.mobile))) return 'Enter a valid 10-digit mobile number.';
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return 'Enter a valid email address.';
 
  const allowed = AGRI.VIDARBHA_DISTRICTS;          // defined in main.js
  if (!v.district) return 'Please select your district.';
  if (allowed && !allowed.includes(v.district)) return 'Please select a Vidarbha district.';
 
  if (v.village.length < 2) return 'Please enter your village.';
  return '';
}
 
function initProfileForm() {
  const form = document.getElementById('profileEditForm');
  if (!form) return;
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
 
    const values = {};
    EDITABLE_FIELDS.forEach(key => {
      const el = document.getElementById('edit_' + key);
      values[key] = el ? String(el.value).trim() : '';
    });
    values.state = 'Maharashtra';                    // this phase serves Vidarbha only
 
    const error = validateProfile(values);
    if (error) { AGRI.toast(error, 'error'); return; }
    values.mobile = profNormalizeMobile(values.mobile);
 
    const updated = { ...loadProfile(), ...values };
    AGRI.set(AGRI.KEYS.PROFILE, updated);
 
    // Keep the login session in step with the profile, otherwise the dashboard
    // greeting and weather location would still show the old name/district.
    const user = AGRI.currentUser();
    if (user) {
      AGRI.set(AGRI.KEYS.USER, {
        ...user,
        name: updated.name,
        state: updated.state,
        district: updated.district,
        village: updated.village,
      });
    }
 
    renderProfileView();
    closeEditProfile();
    AGRI.toast('Profile updated successfully.');
  });
}
 
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('profileView')) return;
  AGRI.requireLogin();
  renderProfileView();
  initProfileForm();
  document.getElementById('editProfileBtn')?.addEventListener('click', openEditProfile);
});