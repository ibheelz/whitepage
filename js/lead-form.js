'use strict';

// File: /public/js/lead-form.js
// Why: Make themes pluggable and make ALL inbound URL params encodable into a single
//      base64url param (?enc=...), then decoded transparently at runtime.
//      This hides raw params like payload/campaign/source/redirect while keeping
//      existing code paths working.

/***********************************
 *  Configuration (client-side)
 ***********************************/
const CONFIG = {
  AIRTABLE_BASE_ID: 'app2I0jOClbHteBNP',
  AIRTABLE_TABLE_NAME: 'Leads',
  // NOTE: local testing only. Do not ship secrets to prod; use a proxy instead.
  AIRTABLE_API_KEY:
    'patCu0mKmtp2MPQIw.a90c3234fc52abb951cdacc3725d97442bc7f364ac822eee5960ce09ce2f86cd',
  PROXY_URL: '',
  DEFAULT_REDIRECT_URL: 'https://mieladigital.com',
  REDIRECT_DELAY: 0,
  DEBUG: true,
};

// Theme loader config: convention over configuration
const THEME_CONFIG = {
  enabled: true,
  basePath: '/themes',
  defaultKey: 'default',
  urlParams: ['campaign', 'promo', 'theme'],
};

/***********************************
 *  Theme Registry (global)
 ***********************************/
// Why: Decouple themes from this file—each theme registers itself here.
window.ThemeRegistry = window.ThemeRegistry || (function () {
  let themeObj = null; let themeKey = null;
  return {
    register(key, theme) { themeKey = String(key || '').toLowerCase(); themeObj = theme || null; },
    get() { return themeObj; },
    key() { return themeKey; }
  };
})();

/***********************************
 *  State
 ***********************************/
const state = {
  formData: {},
  geoData: {},
  trackingData: {},
  isSubmitting: false,
  validationState: { fullName: false, email: false, phone: false },
};

// Decoded URL params live here when ?enc= is present
const URL_STATE = {
  decoded: /** @type {Record<string,string>} */ (null),
};

/***********************************
 *  Utilities
 ***********************************/
function debugLog(...args) { if (CONFIG.DEBUG) console.log('[FORM]', ...args); }
function qs(id) { return document.getElementById(id); }
function isValidEmail(email) { return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email); }
function toggleLoading(isLoading) {
  const btn = qs('submitBtn'); const overlay = qs('loadingOverlay');
  if (!btn || !overlay) return;
  state.isSubmitting = !!isLoading;
  btn.classList.toggle('loading', !!isLoading);
  overlay.classList.toggle('show', !!isLoading);
}
function buildSafeRedirectUrl(rawUrl, clickid) {
  try {
    const url = new URL(rawUrl || CONFIG.DEFAULT_REDIRECT_URL);
    if (!/^https?:$/.test(url.protocol)) throw new Error('protocol');
    if (clickid) {
      if (!url.searchParams.has('payload')) url.searchParams.set('payload', clickid);
      if (!url.searchParams.has('clickid')) url.searchParams.set('clickid', clickid);
      if (!url.searchParams.has('external_id')) url.searchParams.set('external_id', clickid);
    }
    return url.toString();
  } catch { return CONFIG.DEFAULT_REDIRECT_URL; }
}

// --- URL encoding helpers (base64url) ---
function b64urlEncode(str) {
  try { return btoa(encodeURIComponent(str)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); } catch { return ''; }
}
function b64urlDecode(str) {
  try {
    const b64 = (str || '').replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    return decodeURIComponent(atob(b64 + pad));
  } catch { return ''; }
}

function collectParamsFromUrl() {
  const p = new URLSearchParams(location.search);
  const obj = {};
  p.forEach((v, k) => { if (k !== 'enc' && v != null && v !== '') obj[k] = v; });
  return obj;
}

function getParam(name) {
  if (URL_STATE.decoded && Object.prototype.hasOwnProperty.call(URL_STATE.decoded, name)) {
    return String(URL_STATE.decoded[name] ?? '');
  }
  return new URLSearchParams(location.search).get(name) || '';
}

function getAllParams() {
  const base = collectParamsFromUrl();
  return URL_STATE.decoded ? { ...base, ...URL_STATE.decoded } : base;
}

// Encode *all* current URL params into a single ?enc=<b64url(JSON)>
function encodeAllParamsInLocation() {
  try {
    const hasEnc = new URLSearchParams(location.search).has('enc');
    if (hasEnc) return; // already encoded

    const raw = collectParamsFromUrl();
    // If "redirect" present and no redir_enc, encode it too.
    if (raw.redirect && !raw.redir_enc) {
      raw.redir_enc = b64urlEncode(raw.redirect);
      delete raw.redirect;
    }
    const enc = b64urlEncode(JSON.stringify(raw));
    if (!enc) return;

    const url = new URL(location.href);
    url.search = '';
    url.searchParams.set('enc', enc);
    history.replaceState(null, '', url.toString());
    debugLog('🔐 All params encoded → ?enc');
  } catch (e) { debugLog('encodeAllParamsInLocation failed', e); }
}

// If ?enc present, decode it into URL_STATE.decoded and optionally clean visible params
function decodeEncParamFromLocation() {
  try {
    const p = new URLSearchParams(location.search);
    const enc = p.get('enc');
    if (!enc) return;
    const raw = b64urlDecode(enc);
    if (!raw) return;
    let obj = null;
    try { obj = JSON.parse(raw); }
    catch { // fallback: try querystring format inside the payload
      const test = new URLSearchParams(raw); const tmp = {}; let has = false;
      test.forEach((v, k) => { tmp[k] = v; has = true; });
      if (has) obj = tmp;
    }
    if (obj && typeof obj === 'object') {
      // Sanitize to strings only
      const clean = {}; Object.keys(obj).forEach((k) => { const v = obj[k]; if (v != null) clean[k] = String(v); });
      URL_STATE.decoded = clean;
      // Keep URL minimal: ensure only ?enc is visible
      const url = new URL(location.href); url.search = ''; url.searchParams.set('enc', enc);
      history.replaceState(null, '', url.toString());
      debugLog('🗝️ Decoded enc payload', clean);
    }
  } catch (e) { debugLog('decodeEncParamFromLocation failed', e); }
}

/***********************************
 *  Dynamic Theme Loader (convention-based)
 ***********************************/
function resolveThemeKeyFromUrl() {
  for (const k of THEME_CONFIG.urlParams) {
    const v = (getParam(k) || '').trim().toLowerCase();
    if (v) return v;
  }
  return THEME_CONFIG.defaultKey;
}

function sanitizeThemeKey(key) {
  const slug = String(key || '').toLowerCase();
  return /^[a-z0-9._-]+$/.test(slug) ? slug : THEME_CONFIG.defaultKey;
}

function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = () => resolve({ ok: true, src });
    s.onerror = () => resolve({ ok: false, src });
    document.head.appendChild(s);
  });
}

async function loadTheme() {
  if (!THEME_CONFIG.enabled) return;
  const rawKey = resolveThemeKeyFromUrl();
  const themeKey = sanitizeThemeKey(rawKey);
  const trySrc = `${THEME_CONFIG.basePath}/${themeKey}.js`;
  const fallbackSrc = `${THEME_CONFIG.basePath}/${THEME_CONFIG.defaultKey}.js`;

  debugLog('🎨 Loading theme', { themeKey, trySrc });
  const first = await loadScript(trySrc);
  if (!first.ok) { debugLog('⚠️ Theme not found, loading default'); await loadScript(fallbackSrc); }

  let theme = (window.ThemeRegistry && window.ThemeRegistry.get && window.ThemeRegistry.get()) || null;
  if (!theme) {
    if (themeKey === 'pinup' && window.PinUpTheme?.apply) theme = window.PinUpTheme;
    else if (window.GlassDefaultTheme?.apply) theme = window.GlassDefaultTheme;
  }

  try { theme?.apply?.(); }
  catch (e) { debugLog('⚠️ Theme apply failed', e); }
}

/***********************************
 *  Tracking & geo
 ***********************************/
function initializeTracking() {
  const payload = getParam('payload');
  const campaign = getParam('campaign');
  const source = getParam('source');
  const redirEnc = getParam('redir_enc');
  const redirectRaw = getParam('redirect');
  const decodedRedirect = redirEnc ? b64urlDecode(redirEnc) : redirectRaw;

  if (payload) { localStorage.setItem('clickid', payload); localStorage.setItem('payload', payload); }
  const clickid = payload || localStorage.getItem('clickid') || localStorage.getItem('payload') || '';

  state.trackingData = {
    clickid,
    payload: clickid,
    promo: campaign,
    campaign,
    source,
    redirectUrl: decodedRedirect || CONFIG.DEFAULT_REDIRECT_URL,
    timestamp: new Date().toISOString(),
    referrer: document.referrer || 'direct',
    landingPage: location.href,
  };

  if (!state.trackingData.redirectUrl || state.trackingData.redirectUrl === 'null') {
    state.trackingData.redirectUrl = CONFIG.DEFAULT_REDIRECT_URL;
  }
  debugLog('📊 Tracking', state.trackingData);
}

async function fetchGeoData() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const d = await res.json();
      state.geoData = {
        ip: d.ip || '', country: d.country_name || '', city: d.city || '',
        userAgent: navigator.userAgent, language: navigator.language || '', platform: navigator.platform || '',
      };
      debugLog('🌍 Geo', state.geoData); return;
    }
  } catch (e) { debugLog('❌ Geo fetch failed', e); }
  state.geoData = { userAgent: navigator.userAgent, language: navigator.language || '', platform: navigator.platform || '' };
}

/***********************************
 *  Validation & progress
 ***********************************/
function updateProgress() {
  const total = 4; let done = 0;
  if (qs('fullName').value.trim().length >= 2) done++;
  const emailVal = qs('email').value.trim(); if (emailVal && isValidEmail(emailVal)) done++;
  if (qs('countryCode').value) done++;
  if (qs('phone').value.replace(/\D/g, '').length >= 6) done++;
  const bar = qs('progressFill'); if (bar) bar.style.width = Math.round((done / total) * 100) + '%';
}

function initializeValidation() {
  const nameEl = qs('fullName');
  const emailEl = qs('email');
  const phoneEl = qs('phone');
  const countryEl = qs('countryCode');

  if (phoneEl) {
    phoneEl.setAttribute('inputmode', 'numeric');
    phoneEl.setAttribute('pattern', '[0-9]*');
    phoneEl.placeholder = '1234567890';
  }

  nameEl.addEventListener('blur', () => validateField('fullName'));
  nameEl.addEventListener('input', () => { if (state.validationState.fullName) validateField('fullName'); updateProgress(); });

  emailEl.addEventListener('blur', () => validateField('email'));
  emailEl.addEventListener('input', () => { if (state.validationState.email) validateField('email'); updateProgress(); });

  phoneEl.addEventListener('blur', () => validateField('phone'));
  phoneEl.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    if (state.validationState.phone) validateField('phone');
    updateProgress();
  });

  countryEl.addEventListener('change', () => { if (qs('phone').value) validateField('phone'); updateProgress(); });
  updateProgress();
}

function validateField(fieldName) {
  let ok = false; let msg = ''; let type = 'error';
  if (fieldName === 'fullName') {
    const name = qs('fullName').value.trim();
    if (!name) msg = 'El nombre completo es obligatorio';
    else if (name.length < 2) msg = 'El nombre debe tener al menos 2 caracteres';
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(name)) msg = 'Por favor ingresa un nombre válido';
    else { ok = true; msg = '¡Perfecto!'; type = 'success'; }
  }
  if (fieldName === 'email') {
    const email = qs('email').value.trim();
    if (!email) msg = 'El correo electrónico es obligatorio';
    else if (!isValidEmail(email)) msg = 'Por favor ingresa un correo válido';
    else { ok = true; msg = '¡Correo válido!'; type = 'success'; }
  }
  if (fieldName === 'phone') {
    const phone = qs('phone').value.replace(/\D/g, '');
    const countryCode = qs('countryCode').value;
    if (!countryCode) msg = 'Por favor selecciona un país primero';
    else if (!phone) msg = 'El número de teléfono es obligatorio';
    else if (phone.length < 6) msg = 'Número de teléfono muy corto';
    else if (phone.length > 15) msg = 'Número de teléfono muy largo';
    else { ok = true; msg = '¡Número válido!'; type = 'success'; }
  }
  state.validationState[fieldName] = ok; updateFieldUI(fieldName, ok, msg, type); return ok;
}

function updateFieldUI(fieldName, isValid, message, messageType) {
  const map = {
    fullName: { group: 'nameGroup', message: 'nameMessage', text: 'nameMessageText' },
    email: { group: 'emailGroup', message: 'emailMessage', text: 'emailMessageText' },
    phone: { group: 'phoneGroup', message: 'phoneMessage', text: 'phoneMessageText' },
  };
  const ids = map[fieldName]; if (!ids) return;
  const group = qs(ids.group); const messageEl = qs(ids.message); const messageText = qs(ids.text);
  if (!group || !messageEl || !messageText) return;
  group.classList.remove('success', 'error');
  messageEl.classList.remove('success', 'error', 'show');
  if (message) {
    group.classList.add(messageType); messageEl.classList.add(messageType, 'show'); messageText.textContent = message;
    const path = messageEl.querySelector('svg path'); if (path) {
      const successD = 'M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z';
      const infoD = 'M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M13 17H11V15H13V17M13 13H11V7H13V13Z';
      path.setAttribute('d', messageType === 'success' ? successD : infoD);
    }
  }
}

/***********************************
 *  Submit → Airtable → Redirect
 ***********************************/
async function handleSubmit(evt) {
  evt.preventDefault(); if (state.isSubmitting) return;
  const okName = validateField('fullName');
  const okEmail = validateField('email');
  const okPhone = validateField('phone');
  if (!okName || !okEmail || !okPhone) { if (!okName) qs('fullName').focus(); else if (!okEmail) qs('email').focus(); else qs('phone').focus(); return; }
  state.formData = {
    fullName: qs('fullName').value.trim(),
    email: qs('email').value.trim(),
    phone: `${qs('countryCode').value} ${qs('phone').value.replace(/\D/g, '')}`,
  };
  debugLog('📦 Form data', state.formData);
  toggleLoading(true);
  try { await submitToAirtable(); debugLog('✅ Submission ok'); performRedirect(); }
  catch (e) { console.error('❌ Submission error:', e); showError('Algo salió mal. Por favor intenta de nuevo.'); }
  finally { toggleLoading(false); }
}

async function submitToAirtable() {
  const record = {
    'Full Name': state.formData.fullName,
    'Email': state.formData.email,
    'Phone Number': state.formData.phone,
    'Click ID': state.trackingData.clickid || state.trackingData.payload || '',
    'Promo/Influencer': state.trackingData.promo || state.trackingData.campaign || '',
    'Source': state.trackingData.source || '',
    'IP Address': state.geoData.ip || '',
    'Country': state.geoData.country || '',
    'City': state.geoData.city || '',
    'User Agent': state.geoData.userAgent || '',
    'Language': state.geoData.language || '',
    'Referrer': state.trackingData.referrer || '',
    'Landing Page': state.trackingData.landingPage || '',
    'Timestamp': state.trackingData.timestamp || '',
  };
  const payload = { records: [{ fields: record }], typecast: true };
  debugLog('📊 Airtable payload', payload);

  if (CONFIG.PROXY_URL) {
    const r = await fetch(CONFIG.PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', payload }) });
    if (!r.ok) { let e = {}; try { e = await r.json(); } catch {} throw new Error(`Proxy HTTP ${r.status}: ${JSON.stringify(e)}`); }
    return r.json();
  }

  const endpoint = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${encodeURIComponent(CONFIG.AIRTABLE_TABLE_NAME)}`;
  const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) { let err = {}; try { err = await res.json(); } catch {} debugLog('❌ Airtable error', { status: res.status, err }); throw new Error(`HTTP ${res.status}`); }
  const json = await res.json(); debugLog('✅ Airtable response', json); return json;
}

function performRedirect() {
  const clickid = state.trackingData.clickid || state.trackingData.payload || '';
  const safe = buildSafeRedirectUrl(state.trackingData.redirectUrl, clickid);
  debugLog('🔄 Redirecting to', safe);
  if (CONFIG.REDIRECT_DELAY > 0) setTimeout(() => (location.href = safe), CONFIG.REDIRECT_DELAY); else location.href = safe;
}

function showError(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:20px;right:20px;background:#e53e3e;color:#fff;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.15);z-index:10000;animation:slideInRight .3s ease;`;
  toast.textContent = message; document.body.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'slideOutRight .3s ease'; setTimeout(() => toast.remove(), 300); }, 5000);
}

/***********************************
 *  Boot
 ***********************************/

// Animate helper keyframes (toast)
(function injectKeyframes(){
  const style = document.createElement('style');
  style.textContent = `@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}`;
  document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', async () => {
  debugLog('🚀 Init');

  // 1) If ?enc present → decode to hidden map and keep URL minimal (?enc only)
  decodeEncParamFromLocation();
  // 2) If NO ?enc present → encode all current params into ?enc and update URL
  encodeAllParamsInLocation();
  // 3) Re-decode after encoding so getters read from hidden map
  decodeEncParamFromLocation();

  await loadTheme();

  setTimeout(() => {
    initializeTracking();
    initializeValidation();
    initializeForm();
    fetchGeoData();
  }, 200);
});

function initializeForm() {
  const form = qs('leadForm'); if (!form) return;
  form.addEventListener('submit', handleSubmit);
  form.querySelectorAll('input, select').forEach((el) => { el.addEventListener('change', updateProgress); el.addEventListener('input', updateProgress); });
  updateProgress();
}

/***********************************
 *  Debug helpers (dev only)
 ***********************************/
window.debugSubmit = function () {
  console.log('🔧 DEBUG SUBMIT');
  qs('fullName').value = 'Test User';
  qs('email').value = 'test@example.com';
  qs('countryCode').value = '+56'; // Chile
  qs('phone').value = '5551234567'; // no dashes
  qs('leadForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
};

window.debugState = function () {
  console.log('📊 State', state);
  console.log('🔗 Tracking', state.trackingData);
  console.log('🌍 Geo', state.geoData);
  console.log('🧭 Params', getAllParams());
};

console.log('💡 TIP: Use debugSubmit() to test form submission');
console.log('💡 TIP: Use debugState() to view current state');
