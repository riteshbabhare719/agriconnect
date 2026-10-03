/* ============================================================
   AUTH.JS — login & registration (demo only, no real backend)
 
   DEMO BEHAVIOUR:
   - Registration saves the profile (name, village, district...)
     to localStorage and logs the user in.
   - Login does NOT verify a password. It restores the saved
     profile (or creates a demo farmer profile) and logs in.
 
   FUTURE (FastAPI) INTEGRATION:
   Replace the localStorage writes below with:
     fetch(`${AGRI.api.base}/auth/login`, { method: 'POST', body: ... })
   and store the returned auth token instead of a plain user object.
   ============================================================ */
 
/* Used when someone logs in without ever registering on this device */
const DEMO_PROFILE = {
  name: 'Ramesh Patil',
  mobile: '',
  email: '',
  state: 'Maharashtra',
  district: 'Nagpur',
  village: 'Katol',
  language: 'en',
  farmArea: '10 acres',
  mainCrops: 'Orange, Cotton, Soybean, Tur',
};
 
/* ---------------- helpers ---------------- */
 
function showFieldError(inputEl, message) {
  const group = inputEl.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  const errEl = group.querySelector('.field-error');
  if (errEl) errEl.textContent = message;
}
function clearFieldError(inputEl) {
  const group = inputEl.closest('.form-group');
  if (group) group.classList.remove('has-error');
}
 
// Accepts "98765 43210", "+91 9876543210", "09876543210" -> "9876543210"
function normalizeMobile(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}
const MOBILE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
// Clear a field's error as soon as the user starts fixing it
function clearErrorsOnInput(form) {
  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', () => clearFieldError(el));
  });
}
 
// Builds the lightweight session object. District/village are kept here
// too, because other pages (weather, dashboard) read them from the session.
function buildSession(profile, loginId) {
  return {
    name: profile.name,
    loginId,
    state: profile.state,
    district: profile.district,
    village: profile.village,
    loggedInAt: new Date().toISOString(),
  };
}
 
function applyLanguage(profile) {
  if (profile.language) localStorage.setItem(AGRI.KEYS.LANG, profile.language);
}
 
/* ---------------- LOGIN ---------------- */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  clearErrorsOnInput(form);
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const idInput = document.getElementById('loginId');
    const pwInput = document.getElementById('loginPassword');
    const rawId = idInput.value.trim();
 
    if (!rawId) {
      showFieldError(idInput, 'Please enter your mobile number or email.');
      valid = false;
    } else if (!EMAIL_RE.test(rawId) && !MOBILE_RE.test(normalizeMobile(rawId))) {
      showFieldError(idInput, 'Enter a valid 10-digit mobile number or email address.');
      valid = false;
    } else {
      clearFieldError(idInput);
    }
 
    if (!pwInput.value || pwInput.value.length < 4) {
      showFieldError(pwInput, 'Password must be at least 4 characters.');
      valid = false;
    } else {
      clearFieldError(pwInput);
    }
 
    if (!valid) return;
 
    // DEMO: no password check. Restore the saved profile, or create a demo one.
    let profile = AGRI.get(AGRI.KEYS.PROFILE, null);
    if (!profile) {
      profile = { ...DEMO_PROFILE };
      AGRI.set(AGRI.KEYS.PROFILE, profile);
    }
 
    AGRI.set(AGRI.KEYS.USER, buildSession(profile, rawId));
    applyLanguage(profile);
    AGRI.toast('Login successful! Redirecting to your dashboard…');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
  });
}
 
/* ---------------- REGISTRATION ---------------- */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  clearErrorsOnInput(form);
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
 
    const fields = {
      fullName: { min: 2, msg: 'Please enter your full name.' },
      mobile: { mobile: true, msg: 'Enter a valid 10-digit mobile number.' },
      email: { pattern: EMAIL_RE, msg: 'Enter a valid email address.', optional: true },
      password: { min: 6, msg: 'Password must be at least 6 characters.' },
      confirmPassword: { match: 'password', msg: 'Passwords do not match.' },
      state: { min: 2, msg: 'Please enter your state.' },
      district: { min: 2, msg: 'Please enter your district.' },
      village: { min: 2, msg: 'Please enter your village.' },
    };
 
    for (const [id, rule] of Object.entries(fields)) {
      const el = document.getElementById(id);
      if (!el) continue;
      // Passwords may contain meaningful spaces, so only trim the other fields
      const isPassword = (id === 'password' || id === 'confirmPassword');
      const val = isPassword ? el.value : el.value.trim();
 
      if (rule.optional && !val) { clearFieldError(el); continue; }
      if (rule.min && val.length < rule.min) { showFieldError(el, rule.msg); valid = false; continue; }
      if (rule.mobile && !MOBILE_RE.test(normalizeMobile(val))) { showFieldError(el, rule.msg); valid = false; continue; }
      if (rule.pattern && !rule.pattern.test(val)) { showFieldError(el, rule.msg); valid = false; continue; }
      if (rule.match) {
        const other = document.getElementById(rule.match).value;
        if (val !== other) { showFieldError(el, rule.msg); valid = false; continue; }
      }
      clearFieldError(el);
    }
 
    const terms = document.getElementById('agreeTerms');
    if (!terms.checked) {
      AGRI.toast('Please agree to the Terms & Privacy Policy.', 'error');
      valid = false;
    }
 
    if (!valid) return;
 
    // Note: the password is intentionally NOT stored (demo has no backend).
    const profile = {
      name: document.getElementById('fullName').value.trim(),
      mobile: normalizeMobile(document.getElementById('mobile').value),
      email: document.getElementById('email').value.trim(),
      state: document.getElementById('state').value.trim(),
      district: document.getElementById('district').value.trim(),
      village: document.getElementById('village').value.trim(),
      language: document.getElementById('language').value,
      // Placeholder values until a "farm details" step exists; they match the demo crops.
      farmArea: '10 acres',
      mainCrops: 'Orange, Cotton, Soybean, Tur',
    };
 
    AGRI.set(AGRI.KEYS.PROFILE, profile);
    AGRI.set(AGRI.KEYS.USER, buildSession(profile, profile.mobile));
    applyLanguage(profile);          // site now opens in the language they chose
    AGRI.toast('Account created! Redirecting to your dashboard…');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
  });
}
 
document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
});
 