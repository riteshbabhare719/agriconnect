/* ============================================================
   MAIN.JS — shared utilities loaded on every page.
   Handles: navbar, auth-state UI, toasts, localStorage helpers,
   mock data (Vidarbha: orange + cotton focus), language switcher.
 
   BACKEND-READY NOTE:
   Every function that currently reads/writes localStorage is
   named so it can be swapped for a fetch() call to an API
   later (see AGRI.api below) without changing calling code.
 
   NOTE ON PRICES: all mandi prices below are SAMPLE data in
   Rs per quintal, for demo purposes only.
   ============================================================ */
 
const AGRI = {
 
  /* Bump this string whenever the mock data below changes.
     On the next page load, old seeded data in localStorage
     (crops, products, posts, cart) is cleared so the new
     sample data appears. User login/profile are kept. */
  DATA_VERSION: 'vidarbha-1',
 
  /* ---------- storage keys ---------- */
  KEYS: {
    USER: 'agri_user',
    CROPS: 'agri_crops',
    CART: 'agri_cart',
    PRODUCTS: 'agri_products',
    POSTS: 'agri_posts',
    PROFILE: 'agri_profile',
    LANG: 'agri_lang',
    VERSION: 'agri_data_version',
  },
 
  /* ---------- generic localStorage helpers ---------- */
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('AGRI.get error', e);
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
 
  /* ---------- FUTURE API LAYER -----------------------------
     Replace the body of these with fetch('/api/...') calls once
     the backend (FastAPI) is live. Callers already use these names. */
  api: {
    base: '/api', // e.g. fetch(`${AGRI.api.base}/farmers`)
  },
 
  /* ---------- auth state ---------- */
  isLoggedIn() {
    return !!this.get(this.KEYS.USER, null);
  },
  currentUser() {
    return this.get(this.KEYS.USER, null);
  },
  logout() {
    localStorage.removeItem(this.KEYS.USER);
    window.location.href = 'index.html';
  },
 
  /* ---------- toast ---------- */
  toast(msg, type = 'success') {
    let el = document.getElementById('agri-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'agri-toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'toast show' + (type === 'error' ? ' toast-error' : '');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  },
 
  /* ---------- language (navbar + footer for now) ----------
     Page body text is still English. To translate more, add keys
     here and wrap the text with AGRI.t('Key'). Missing
     translations automatically fall back to English. */
  I18N: {
    en: {},
    mr: {
      'Home': 'मुख्यपृष्ठ', 'Features': 'वैशिष्ट्ये', 'Market Prices': 'बाजारभाव',
      'Weather': 'हवामान', 'Marketplace': 'बाजारपेठ', 'About': 'आमच्याबद्दल',
      'Login': 'लॉगिन', 'Logout': 'बाहेर पडा', 'Dashboard': 'डॅशबोर्ड',
      'My Crops': 'माझी पिके', 'Market': 'बाजार', 'Transport': 'वाहतूक',
      'Community': 'समुदाय', 'AI Assistant': 'एआय सहाय्यक', 'Profile': 'प्रोफाइल',
      'Services': 'सेवा', 'Support': 'मदत', 'Language': 'भाषा',
      'Help Centre': 'मदत केंद्र', 'Contact Us': 'संपर्क करा',
      'Footer tagline': 'विदर्भातील शेतकऱ्यांसाठी डिजिटल सेवा — हवामान, बाजारभाव, पीक सल्ला आणि बरेच काही, एकाच ठिकाणी.',
    },
    hi: {
      'Home': 'होम', 'Features': 'विशेषताएँ', 'Market Prices': 'बाज़ार भाव',
      'Weather': 'मौसम', 'Marketplace': 'बाज़ार', 'About': 'हमारे बारे में',
      'Login': 'लॉगिन', 'Logout': 'लॉगआउट', 'Dashboard': 'डैशबोर्ड',
      'My Crops': 'मेरी फसलें', 'Market': 'मंडी', 'Transport': 'परिवहन',
      'Community': 'समुदाय', 'AI Assistant': 'एआई सहायक', 'Profile': 'प्रोफ़ाइल',
      'Services': 'सेवाएँ', 'Support': 'सहायता', 'Language': 'भाषा',
      'Help Centre': 'सहायता केंद्र', 'Contact Us': 'संपर्क करें',
      'Footer tagline': 'किसानों के लिए डिजिटल सेवाएँ — मौसम, मंडी भाव, फसल सलाह और बहुत कुछ, एक ही जगह।',
    },
    gu: {
      'Home': 'હોમ', 'Features': 'સુવિધાઓ', 'Market Prices': 'બજાર ભાવ',
      'Weather': 'હવામાન', 'Marketplace': 'બજાર', 'About': 'અમારા વિશે',
      'Login': 'લૉગિન', 'Logout': 'લૉગઆઉટ', 'Dashboard': 'ડેશબોર્ડ',
      'My Crops': 'મારા પાક', 'Market': 'બજાર', 'Transport': 'પરિવહન',
      'Community': 'સમુદાય', 'AI Assistant': 'એઆઈ સહાયક', 'Profile': 'પ્રોફાઇલ',
    },
  },
  getLang() {
    return localStorage.getItem(this.KEYS.LANG) || 'en';
  },
  t(key) {
    const lang = this.getLang();
    return (this.I18N[lang] && this.I18N[lang][key]) || key;
  },
 
  /* ---------- mock data (demo only — replace with API data) ---------- */
  mock: {
    crops: [
      { id: 'c1', name: 'Orange', type: 'Fruit', stage: 'Fruit Development', sowDate: '2019-07-01', harvestDate: '2026-12-15', area: '4 acres', soil: 'Black Soil', irrigation: 'Drip', status: 'Healthy' },
      { id: 'c2', name: 'Cotton', type: 'Cash Crop', stage: 'Boll Formation', sowDate: '2026-06-12', harvestDate: '2026-12-01', area: '3 acres', soil: 'Black Soil', irrigation: 'Drip', status: 'Pest Alert' },
      { id: 'c3', name: 'Soybean', type: 'Oilseed', stage: 'Pod Filling', sowDate: '2026-06-20', harvestDate: '2026-10-15', area: '2 acres', soil: 'Black Soil', irrigation: 'Rainfed', status: 'Healthy' },
      { id: 'c4', name: 'Tur (Pigeon Pea)', type: 'Pulse', stage: 'Flowering', sowDate: '2026-06-25', harvestDate: '2026-12-20', area: '1.5 acres', soil: 'Red Soil', irrigation: 'Rainfed', status: 'Needs Water' },
    ],
    /* Sample prices, Rs per quintal. Not live data. */
    marketPrices: [
      { crop: 'Orange (Santra)', market: 'Nagpur APMC (Kalamna)', state: 'Maharashtra', district: 'Nagpur', min: 2800, max: 4600, avg: 3700 },
      { crop: 'Orange (Santra)', market: 'Katol Mandi', state: 'Maharashtra', district: 'Nagpur', min: 2600, max: 4300, avg: 3450 },
      { crop: 'Orange (Santra)', market: 'Morshi Mandi', state: 'Maharashtra', district: 'Amravati', min: 2700, max: 4400, avg: 3550 },
      { crop: 'Cotton', market: 'Hinganghat Mandi', state: 'Maharashtra', district: 'Wardha', min: 6800, max: 7700, avg: 7250 },
      { crop: 'Cotton', market: 'Akola Mandi', state: 'Maharashtra', district: 'Akola', min: 6700, max: 7600, avg: 7150 },
      { crop: 'Cotton', market: 'Yavatmal Mandi', state: 'Maharashtra', district: 'Yavatmal', min: 6600, max: 7500, avg: 7050 },
      { crop: 'Soybean', market: 'Amravati APMC', state: 'Maharashtra', district: 'Amravati', min: 4300, max: 4900, avg: 4600 },
      { crop: 'Soybean', market: 'Wardha Mandi', state: 'Maharashtra', district: 'Wardha', min: 4250, max: 4850, avg: 4550 },
      { crop: 'Tur (Pigeon Pea)', market: 'Amravati APMC', state: 'Maharashtra', district: 'Amravati', min: 6500, max: 7800, avg: 7150 },
      { crop: 'Tur (Pigeon Pea)', market: 'Akola Mandi', state: 'Maharashtra', district: 'Akola', min: 6400, max: 7700, avg: 7050 },
      { crop: 'Wheat', market: 'Nagpur APMC (Kalamna)', state: 'Maharashtra', district: 'Nagpur', min: 2300, max: 2650, avg: 2480 },
      { crop: 'Gram (Chana)', market: 'Akola Mandi', state: 'Maharashtra', district: 'Akola', min: 5300, max: 5900, avg: 5600 },
    ],
    /* Fallback only — weather.js uses live data when online. */
    forecast: [
      { day: 'Today', icon: '☀️', temp: 32, cond: 'Sunny' },
      { day: 'Tomorrow', icon: '⛅', temp: 31, cond: 'Partly Cloudy' },
      { day: 'Day 3', icon: '🌧️', temp: 28, cond: 'Rain' },
      { day: 'Day 4', icon: '☁️', temp: 29, cond: 'Cloudy' },
      { day: 'Day 5', icon: '🌤️', temp: 31, cond: 'Partly Sunny' },
    ],
    products: [
      { id: 'p1', name: 'Soybean Seeds JS-335 (30kg)', category: 'Seeds', price: 2400, qty: 40, seller: 'Vidarbha Agro Seeds', img: '🌱' },
      { id: 'p2', name: 'Organic Vermicompost (25kg)', category: 'Fertilizers', price: 450, qty: 60, seller: 'GreenEarth Organics', img: '🪴' },
      { id: 'p3', name: 'Neem Oil Pesticide (1L)', category: 'Pesticides', price: 320, qty: 100, seller: 'BioSafe Agri', img: '🧴' },
      { id: 'p4', name: 'Hand Sprayer 16L', category: 'Tools', price: 1200, qty: 25, seller: 'FarmTools India', img: '🧰' },
      { id: 'p5', name: 'Mini Power Tiller', category: 'Equipment', price: 45000, qty: 5, seller: 'AgriMech Ltd', img: '🚜' },
      { id: 'p6', name: 'Orange Orchard Micronutrient Mix (5kg)', category: 'Fertilizers', price: 780, qty: 45, seller: 'Nagpur Orchard Supplies', img: '🍊' },
      { id: 'p7', name: 'DAP Fertilizer (50kg)', category: 'Fertilizers', price: 1350, qty: 80, seller: 'Krishna Agro Store', img: '🌱' },
      { id: 'p8', name: 'Cotton Seed Pack (450g)', category: 'Seeds', price: 865, qty: 50, seller: 'CottonMax Seeds', img: '🌱' },
      { id: 'p9', name: 'Pink Bollworm Pheromone Trap Kit', category: 'Pesticides', price: 350, qty: 70, seller: 'BioSafe Agri', img: '🪤' },
      { id: 'p10', name: 'Drip Irrigation Kit (1 acre)', category: 'Equipment', price: 14500, qty: 12, seller: 'JalSeva Irrigation', img: '💧' },
    ],
    transport: [
      { id: 't1', type: 'Tractor Trolley', icon: '🚜', driver: 'Ramesh Patil', capacity: '2 Tons', location: 'Katol, Nagpur', price: 1500, available: true },
      { id: 't2', type: 'Mini Truck', icon: '🚚', driver: 'Suresh Yadav', capacity: '3.5 Tons', location: 'Amravati', price: 2200, available: true },
      { id: 't3', type: 'Pickup Van', icon: '🛻', driver: 'Anil Kumar', capacity: '1 Ton', location: 'Wardha', price: 900, available: false },
      { id: 't4', type: 'Large Truck', icon: '🚛', driver: 'Vijay Singh', capacity: '8 Tons', location: 'Akola', price: 4500, available: true },
      { id: 't5', type: 'Refrigerated Van (Orange)', icon: '🚚', driver: 'Prakash Deshmukh', capacity: '3 Tons', location: 'Nagpur', price: 3800, available: true },
    ],
    posts: [
      { id: 'po1', author: 'Suresh Patil', village: 'Wardha', text: 'We are seeing pink bollworm in our cotton this season. What is the best way to control it?', likes: 14, comments: [{ author: 'Meena Devi', text: 'Install pheromone traps to monitor moth catches and spray only once they cross the threshold your local KVK advises.' }] },
      { id: 'po2', author: 'Savita Deshmukh', village: 'Katol', text: 'Many young fruits are dropping in my orange orchard. Any suggestions?', likes: 9, comments: [{ author: 'Ramesh Patil', text: 'Check for water stress first and keep irrigation even. Your nearest KVK can advise on the right treatment.' }] },
    ],
  },
 
  /* ---------- navbar rendering ---------- */
  renderNav(activePage) {
    const mount = document.getElementById('agri-nav');
    if (!mount) return;
    const loggedIn = this.isLoggedIn();
 
    const loggedOutLinks = [
      ['index.html', 'Home'], ['index.html#features', 'Features'],
      ['market.html', 'Market Prices'], ['weather.html', 'Weather'],
      ['marketplace.html', 'Marketplace'], ['index.html#about', 'About'],
    ];
    const loggedInLinks = [
      ['dashboard.html', 'Dashboard'], ['crops.html', 'My Crops'],
      ['weather.html', 'Weather'], ['market.html', 'Market'],
      ['marketplace.html', 'Marketplace'], ['transport.html', 'Transport'],
      ['community.html', 'Community'], ['ai-assistant.html', 'AI Assistant'],
      ['profile.html', 'Profile'],
    ];
 
    const links = loggedIn ? loggedInLinks : loggedOutLinks;
    let linksHtml = links.map(([href, label]) => {
      const isActive = activePage === href.split('.html')[0].split('#')[0];
      return `<li><a href="${href}" class="${isActive ? 'active' : ''}">${this.t(label)}</a></li>`;
    }).join('');
 
    linksHtml += loggedIn
      ? `<li><a href="#" id="logoutLink">${this.t('Logout')}</a></li>`
      : `<li><a href="login.html" class="nav-cta">${this.t('Login')}</a></li>`;
 
    mount.innerHTML = `
      <div class="topnav-inner">
        <a href="${loggedIn ? 'dashboard.html' : 'index.html'}" class="brand">🌱 AgriConnect</a>
        <ul class="nav-links" id="navLinksList">${linksHtml}</ul>
        <button class="hamburger" id="hamburgerBtn" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </div>`;
 
    document.getElementById('hamburgerBtn').addEventListener('click', () => {
      document.getElementById('navLinksList').classList.toggle('open');
    });
 
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  },
 
  /* ---------- footer rendering ---------- */
  renderFooter() {
    const mount = document.getElementById('agri-footer');
    if (!mount) return;
    const lang = this.getLang();
    const tagline = this.I18N[lang] && this.I18N[lang]['Footer tagline']
      ? this.I18N[lang]['Footer tagline']
      : 'Digital solutions for farmers — weather, market prices, crop advice and more, all in one place.';
 
    mount.innerHTML = `
      <div class="container">
        <div class="footer-cols">
          <div>
            <div class="brand" style="color:#fff;margin-bottom:10px;">🌱 AgriConnect</div>
            <p>${tagline}</p>
          </div>
          <div>
            <h4 style="color:#fff;">${this.t('Services')}</h4>
            <p><a href="weather.html">${this.t('Weather')}</a></p>
            <p><a href="market.html">${this.t('Market Prices')}</a></p>
            <p><a href="marketplace.html">${this.t('Marketplace')}</a></p>
          </div>
          <div>
            <h4 style="color:#fff;">${this.t('Support')}</h4>
            <p><a href="ai-assistant.html">${this.t('AI Assistant')}</a></p>
            <p><a href="#">${this.t('Help Centre')}</a></p>
            <p><a href="#">${this.t('Contact Us')}</a></p>
          </div>
          <div>
            <h4 style="color:#fff;">${this.t('Language')}</h4>
            <select id="langSelect" aria-label="Select language" style="background:#fff;border-radius:10px;">
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
          </div>
        </div>
        <div class="footer-bottom">© 2026 Smart AgriConnect. Built for farmers of Vidarbha.</div>
      </div>`;
 
    const select = document.getElementById('langSelect');
    if (select) {
      select.value = lang;
      select.addEventListener('change', () => {
        localStorage.setItem(this.KEYS.LANG, select.value);
        document.documentElement.lang = select.value;
        // Re-render shared UI in the chosen language
        this.renderNav(document.body.dataset.page || '');
        this.renderFooter();
      });
    }
  },
 
  /* ---------- route guard for protected pages ---------- */
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
    }
  },
 
  /* ---------- ensure mock collections exist in localStorage once ---------- */
  seedIfEmpty(key, data) {
    if (this.get(key, null) === null) this.set(key, data);
  },
 
  /* ---------- clear stale seeded data when mock data changes ---------- */
  migrateData() {
    if (localStorage.getItem(this.KEYS.VERSION) === this.DATA_VERSION) return;
    [this.KEYS.CROPS, this.KEYS.PRODUCTS, this.KEYS.POSTS, this.KEYS.CART]
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem(this.KEYS.VERSION, this.DATA_VERSION);
  },
};
 
/* Runs immediately (before page scripts seed their data) */
AGRI.migrateData();
 
/* ---------- Logged-in users skip the landing, login and register pages ----------
   Once someone is logged in, "Get Started" and the login form make no sense,
   so send them straight to the dashboard. Logging out brings the landing page back. */
(function redirectIfLoggedIn() {
  const page = (document.body && document.body.dataset.page) || '';
  if (AGRI.isLoggedIn() && ['index', 'login', 'register'].includes(page)) {
    window.location.replace('dashboard.html');
  }
})();
 
/* ---------- Vidarbha-only district dropdown (Edit Profile form) ----------
   Replaces the free-text District box on profile.html with a dropdown of
   the 11 Vidarbha districts, and locks State to Maharashtra.
   Runs immediately (scripts sit at the end of <body>, so the form already
   exists) so profile.js always sees the final fields.
   To open the app to other regions later, delete this block. */
AGRI.VIDARBHA_DISTRICTS = [
  'Akola', 'Amravati', 'Bhandara', 'Buldhana', 'Chandrapur', 'Gadchiroli',
  'Gondia', 'Nagpur', 'Wardha', 'Washim', 'Yavatmal',
];
 
AGRI.useDistrictDropdown = function (inputId) {
  const el = document.getElementById(inputId);
  if (!el || el.tagName !== 'INPUT') return;
  const names = AGRI.VIDARBHA_DISTRICTS;
 
  const select = document.createElement('select');
  select.id = inputId;
  select.innerHTML = '<option value="">Select your district</option>' +
    names.map(d => `<option value="${d}">${d}</option>`).join('');
 
  // Setting .value with "nagpur " or "NAGPUR" still selects "Nagpur"
  const base = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  Object.defineProperty(select, 'value', {
    configurable: true,
    get() { return base.get.call(this); },
    set(v) {
      const match = names.find(n => n.toLowerCase() === String(v || '').trim().toLowerCase());
      base.set.call(this, match || '');
    },
  });
 
  el.replaceWith(select);
  select.insertAdjacentHTML('afterend',
    '<p class="field-hint">AgriConnect currently serves Vidarbha districts only.</p>');
};
 
AGRI.useDistrictDropdown('edit_district');   // Edit Profile form
AGRI.useDistrictDropdown('district');        // Registration form
const regStateEl = document.getElementById('state');
if (regStateEl) { regStateEl.value = 'Maharashtra'; regStateEl.readOnly = true; }
const editStateEl = document.getElementById('edit_state');
if (editStateEl) { editStateEl.value = 'Maharashtra'; editStateEl.readOnly = true; }
 
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page || '';
  document.documentElement.lang = AGRI.getLang();
  AGRI.renderNav(page);
  AGRI.renderFooter();
});