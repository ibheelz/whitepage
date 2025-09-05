'use strict';

/***********************************
 * Config
 ***********************************/
const CONFIG = {
  AIRTABLE_BASE_ID: 'app2I0jOClbHteBNP',
  AIRTABLE_TABLE_NAME: 'Leads',
  AIRTABLE_API_KEY:
    'patCu0mKmtp2MPQIw.a90c3234fc52abb951cdacc3725d97442bc7f364ac822eee5960ce09ce2f86cd', // dev only
  PROXY_URL: '', // prefer a server proxy in production
  DEFAULT_REDIRECT_URL: 'https://mieladigital.com',
  REDIRECT_DELAY: 0,
  DEBUG: true,
};

const THEME_CONFIG = { enabled: true, basePath: '/themes', defaultKey: 'default', urlParams: ['campaign','promo','theme'] };

/***********************************
 * State & utils
 ***********************************/
const state = {
  formData: {},
  geoData: {},
  trackingData: {},
  isSubmitting: false,
  validationState: { fullName:false, email:false, phone:false, age:false }
};

const qs = (id)=>document.getElementById(id);
const debugLog=(...a)=>{ if (CONFIG.DEBUG) console.log('[FORM]',...a); };
const isValidEmail=(e)=>/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e);

/***********************************
 * Base64URL helpers
 ***********************************/
function b64urlEncode(str){
  try { return btoa(encodeURIComponent(str)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,''); }
  catch (e) { return ''; }
}
function b64urlDecode(str){
  try {
    const b64=(str||'').replace(/-/g,'+').replace(/_/g,'/');
    const pad=b64.length%4===0?'':'='.repeat(4-(b64.length%4));
    return decodeURIComponent(atob(b64+pad));
  } catch (e) { return ''; }
}

/***********************************
 * Redirect preservation
 ***********************************/
function encodeRedirectParamInLocation(){
  // Read raw "redirect=" from the full href so inner & aren't lost
  function rawRedirectFromHref(href){
    try {
      const q = (String(href||'').split('?')[1]||'');
      const key = 'redirect=';
      const pos = q.toLowerCase().indexOf(key);
      if (pos === -1) return '';
      let raw = q.slice(pos + key.length);
      const hashIndex = raw.indexOf('#');
      if (hashIndex !== -1) raw = raw.slice(0, hashIndex);
      try { return decodeURIComponent(raw); } catch (e) { return raw; }
    } catch (e) { return ''; }
  }

  try {
    const current = new URL(location.href);
    if (current.searchParams.has('redir_enc')) return;

    const fromHref = rawRedirectFromHref(location.href);
    const fromQs = current.searchParams.get('redirect') || '';
    const fullValue = (fromHref && fromHref.length >= fromQs.length) ? fromHref : fromQs;
    if (!fullValue) return;

    const enc = b64urlEncode(fullValue);
    if (!enc) return;
    current.searchParams.set('redir_enc', enc);
    history.replaceState(null,'',current.toString());
    debugLog('🔐 redirect preserved -> redir_enc');
  } catch (e) { debugLog('encodeRedirectParamInLocation failed', e); }
}

/***********************************
 * Build final redirect
 ***********************************/
function buildSafeRedirectUrl(rawUrl, clickid){
  try {
    let candidate = String(rawUrl||'').trim();
    if (!candidate) return CONFIG.DEFAULT_REDIRECT_URL;
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) candidate = 'https://' + candidate;
    const url = new URL(candidate);
    if (!/^https?:$/.test(url.protocol)) throw new Error('bad protocol');

    if (clickid) {
      const existingValues = url.searchParams.getAll('clickid');
      const existing = existingValues.find(v=>v && String(v).trim().length>0);
      if (existingValues.length > 0) url.searchParams.delete('clickid');
      url.searchParams.append('clickid', existing || String(clickid)); // ensure single, at end
    }
    return url.toString();
  } catch (e) { debugLog('buildSafeRedirectUrl failed', e); return CONFIG.DEFAULT_REDIRECT_URL; }
}

/***********************************
 * Theme loader (minimal)
 ***********************************/
window.ThemeRegistry = window.ThemeRegistry || (function(){ let theme=null, key=null; return { register(k, t){ key=String(k||'').toLowerCase(); theme=t||null; }, get(){ return theme; }, key(){ return key; } };})();
function resolveThemeKeyFromUrl(){ const p=new URLSearchParams(location.search); for(const k of THEME_CONFIG.urlParams){ const v=(p.get(k)||'').trim().toLowerCase(); if(v) return v; } return THEME_CONFIG.defaultKey; }
function sanitizeThemeKey(key){ const slug=String(key||'').toLowerCase(); return /^[a-z0-9._-]+$/.test(slug)? slug : THEME_CONFIG.defaultKey; }
function loadScript(src){ return new Promise(r=>{ const s=document.createElement('script'); s.src=src; s.async=true; s.onload=()=>r({ok:true,src}); s.onerror=()=>r({ok:false,src}); document.head.appendChild(s); }); }
async function loadTheme(){ if(!THEME_CONFIG.enabled) return; const raw=resolveThemeKeyFromUrl(); const key=sanitizeThemeKey(raw); const first=await loadScript(`${THEME_CONFIG.basePath}/${key}.js`); if(!first.ok) await loadScript(`${THEME_CONFIG.basePath}/${THEME_CONFIG.defaultKey}.js`); try{ window.ThemeRegistry?.get?.()?.apply?.(); } catch(e){ debugLog('theme apply failed', e); } }

/***********************************
 * Tracking & geo
 ***********************************/
function initializeTracking(){
  const p=new URLSearchParams(location.search);
  const payload=p.get('payload')||'';
  const campaign=p.get('campaign')||'';
  const redirEnc=p.get('redir_enc')||'';
  const redirectRaw=p.get('redirect')||'';
  const decodedRedirect = redirEnc ? b64urlDecode(redirEnc) : redirectRaw;

  if (payload) { localStorage.setItem('clickid', payload); localStorage.setItem('payload', payload); }
  const clickid = payload || localStorage.getItem('clickid') || localStorage.getItem('payload') || '';

  state.trackingData = {
    clickid,
    payload: clickid,
    promo: campaign,
    redirectUrl: decodedRedirect || CONFIG.DEFAULT_REDIRECT_URL,
    timestamp: new Date().toISOString(),
    referrer: document.referrer || 'direct',
    landingPage: location.href,
  };

  if (!state.trackingData.redirectUrl || state.trackingData.redirectUrl==='null') {
    state.trackingData.redirectUrl = CONFIG.DEFAULT_REDIRECT_URL;
  }
  debugLog('📊 Tracking', state.trackingData);
}

async function fetchGeoData(){
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const d = await res.json();
      state.geoData = { ip: d.ip||'', country: d.country_name||'', city: d.city||'', userAgent: navigator.userAgent, language: navigator.language||'', platform: navigator.platform||'' };
      debugLog('🌍 Geo', state.geoData);
      return;
    }
  } catch (e) { debugLog('❌ Geo fetch failed', e); }
  state.geoData = { userAgent: navigator.userAgent, language: navigator.language||'', platform: navigator.platform||'' };
}

/***********************************
 * Validation & progress
 ***********************************/
function toggleLoading(isLoading){ const btn=qs('submitBtn'); const overlay=qs('loadingOverlay'); if(!btn||!overlay) return; state.isSubmitting=!!isLoading; btn.classList.toggle('loading', !!isLoading); overlay.classList.toggle('show', !!isLoading); }

function updateProgress(){ const total=5; let done=0; if(qs('fullName').value.trim().length>=2) done++; const emailVal=qs('email').value.trim(); if(emailVal && isValidEmail(emailVal)) done++; if(qs('countryCode').value) done++; if(qs('phone').value.replace(/\D/g,'').length>=6) done++; if(qs('ageConfirm')?.checked) done++; const bar=qs('progressFill'); if(bar) bar.style.width=Math.round((done/total)*100)+'%'; }

function initializeValidation(){
  const nameEl=qs('fullName'); const emailEl=qs('email'); const phoneEl=qs('phone'); const countryEl=qs('countryCode'); const ageEl=qs('ageConfirm');
  if(phoneEl){ phoneEl.setAttribute('inputmode','numeric'); phoneEl.setAttribute('pattern','[0-9]*'); phoneEl.placeholder='1234567890'; }
  nameEl.addEventListener('blur',()=>validateField('fullName'));
  nameEl.addEventListener('input',()=>{ if(state.validationState.fullName) validateField('fullName'); updateProgress(); });
  emailEl.addEventListener('blur',()=>validateField('email'));
  emailEl.addEventListener('input',()=>{ if(state.validationState.email) validateField('email'); updateProgress(); });
  phoneEl.addEventListener('blur',()=>validateField('phone'));
  phoneEl.addEventListener('input', function(){ this.value=this.value.replace(/\D/g,''); if(state.validationState.phone) validateField('phone'); updateProgress(); });
  countryEl.addEventListener('change',()=>{ if(qs('phone').value) validateField('phone'); updateProgress(); });
  ageEl.addEventListener('change',()=>{ validateField('age'); updateProgress(); });
  updateProgress();
}

function validateField(fieldName){
  let ok=false, msg='', type='error';
  if(fieldName==='fullName'){
    const name=qs('fullName').value.trim();
    if(!name) msg='El nombre completo es obligatorio';
    else if(name.length<2) msg='El nombre debe tener al menos 2 caracteres';
    else if(!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(name)) msg='Por favor ingresa un nombre válido';
    else { ok=true; msg='¡Perfecto!'; type='success'; }
  }
  if(fieldName==='email'){
    const email=qs('email').value.trim();
    if(!email) msg='El correo electrónico es obligatorio';
    else if(!isValidEmail(email)) msg='Por favor ingresa un correo válido';
    else { ok=true; msg='¡Correo válido!'; type='success'; }
  }
  if(fieldName==='phone'){
    const phone=qs('phone').value.replace(/\D/g,'');
    const countryCode=qs('countryCode').value;
    if(!countryCode) msg='Por favor selecciona un país primero';
    else if(!phone) msg='El número de teléfono es obligatorio';
    else if(phone.length<6) msg='Número de teléfono muy corto';
    else if(phone.length>15) msg='Número de teléfono muy largo';
    else { ok=true; msg='¡Número válido!'; type='success'; }
  }
  if(fieldName==='age'){
    const checked = !!qs('ageConfirm').checked;
    if(!checked) msg='Debes confirmar que eres mayor de 18 años';
    else { ok=true; msg='✔'; type='success'; }
  }
  state.validationState[fieldName]=ok;
  updateFieldUI(fieldName, ok, msg, type);
  return ok;
}

function updateFieldUI(fieldName, isValid, message, messageType){
  const map={ fullName:{group:'nameGroup',message:'nameMessage',text:'nameMessageText'}, email:{group:'emailGroup',message:'emailMessage',text:'emailMessageText'}, phone:{group:'phoneGroup',message:'phoneMessage',text:'phoneMessageText'}, age:{group:'ageGroup',message:'ageMessage',text:'ageMessageText'} };
  const ids = map[fieldName]; if(!ids) return;
  const group=qs(ids.group), messageEl=qs(ids.message), messageText=qs(ids.text);
  if(!group||!messageEl||!messageText) return;
  group.classList.remove('success','error');
  messageEl.classList.remove('success','error','show');
  if(message){
    group.classList.add(messageType);
    messageEl.classList.add(messageType,'show');
    messageText.textContent = message;
  }
}

/***********************************
 * Submit → Airtable → Redirect
 ***********************************/
async function handleSubmit(evt){
  evt.preventDefault(); if(state.isSubmitting) return;
  const okName=validateField('fullName');
  const okEmail=validateField('email');
  const okPhone=validateField('phone');
  const okAge=validateField('age');
  if(!okName||!okEmail||!okPhone||!okAge){
    if(!okName) qs('fullName').focus();
    else if(!okEmail) qs('email').focus();
    else if(!okPhone) qs('phone').focus();
    else qs('ageConfirm').focus();
    return;
  }

  state.formData={
    fullName: qs('fullName').value.trim(),
    email: qs('email').value.trim(),
    phone: `${qs('countryCode').value} ${qs('phone').value.replace(/\D/g,'')}`,
    ageConfirmed: !!qs('ageConfirm').checked,
    promoConsent: !!qs('promoConsent').checked,
  };
  debugLog('📦 Form data', state.formData);

  toggleLoading(true);
  try { await submitToAirtable(); debugLog('✅ Submission ok'); performRedirect(); }
  catch (e) { console.error('❌ Submission error:', e); showError('Algo salió mal. Por favor intenta de nuevo.'); }
  finally { toggleLoading(false); }
}

async function submitToAirtable(){
  const record = {
    'Full Name': state.formData.fullName,
    'Email': state.formData.email,
    'Phone Number': state.formData.phone,
    '18+ Confirmed': state.formData.ageConfirmed ? 'Yes' : 'No',
    'Marketing Consent': state.formData.promoConsent ? 'Yes' : 'No',
    'Click ID': state.trackingData.clickid || state.trackingData.payload || '',
    'Promo/Influencer': state.trackingData.promo || state.trackingData.campaign || '',
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
    const r = await fetch(CONFIG.PROXY_URL, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ action:'create', payload }) });
    if (!r.ok) { let e={}; try{ e=await r.json(); }catch(e2){} throw new Error(`Proxy HTTP ${r.status}: ${JSON.stringify(e)}`); }
    return r.json();
  }

  const endpoint = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${encodeURIComponent(CONFIG.AIRTABLE_TABLE_NAME)}`;
  const res = await fetch(endpoint, { method:'POST', headers:{ 'Authorization':`Bearer ${CONFIG.AIRTABLE_API_KEY}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) { let err={}; try{ err=await res.json(); }catch(e3){} debugLog('❌ Airtable error', { status: res.status, err }); throw new Error(`HTTP ${res.status}`); }
  const json = await res.json(); debugLog('✅ Airtable response', json); return json;
}

function performRedirect(){
  const clickid = state.trackingData.clickid || state.trackingData.payload || '';
  const safe = buildSafeRedirectUrl(state.trackingData.redirectUrl, clickid);
  debugLog('🔄 Redirecting to', safe);
  if (CONFIG.REDIRECT_DELAY>0) setTimeout(()=>location.href=safe, CONFIG.REDIRECT_DELAY); else location.href = safe;
}

function showError(message){
  const toast=document.createElement('div');
  toast.style.cssText='position:fixed;bottom:20px;right:20px;background:#e53e3e;color:#fff;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.15);z-index:10000;animation:slideInRight .3s ease;';
  toast.textContent=message; document.body.appendChild(toast);
  setTimeout(()=>{ toast.style.animation='slideOutRight .3s ease'; setTimeout(()=>toast.remove(),300); },5000);
}

/***********************************
 * Boot
 ***********************************/
document.addEventListener('DOMContentLoaded', async ()=>{
  debugLog('🚀 Init');
  const style=document.createElement('style');
  style.textContent='@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}';
  document.head.appendChild(style);
  encodeRedirectParamInLocation();
  await loadTheme();
  setTimeout(()=>{ initializeTracking(); initializeValidation(); initializeForm(); fetchGeoData(); }, 200);
});

function initializeForm(){
  const form = qs('leadForm'); if(!form) return;
  form.addEventListener('submit', handleSubmit);
  form.querySelectorAll('input, select').forEach((el)=>{
    el.addEventListener('change', updateProgress);
    el.addEventListener('input', updateProgress);
  });
  updateProgress();
}

/***********************************
 * Debug helpers (optional)
 ***********************************/
window.debugSubmit = function(){
  console.log('🔧 DEBUG SUBMIT');
  qs('fullName').value='Test User';
  qs('email').value='test@example.com';
  qs('countryCode').value='+56';
  qs('phone').value='5551234567';
  qs('ageConfirm').checked=true;
  qs('promoConsent').checked=true;
  qs('leadForm').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
};

window.debugState = function(){ console.log('📊 State', state); console.log('🔗 Tracking', state.trackingData); console.log('🌍 Geo', state.geoData); };
