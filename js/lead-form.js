'use strict';

// File: /public/js/lead-form.js
// Enhanced with Hybrid Email Verification System - FIXED VERSION

/***********************************
 *  Configuration (client-side)
 ***********************************/
const CONFIG = {
  AIRTABLE_BASE_ID: 'app2I0jOClbHteBNP',
  AIRTABLE_TABLE_NAME: 'Leads',
  AIRTABLE_API_KEY:
    'patCu0mKmtp2MPQIw.a90c3234fc52abb951cdacc3725d97442bc7f364ac822eee5960ce09ce2f86cd', // local testing only
  PROXY_URL: '',
  DEFAULT_REDIRECT_URL: 'https://mieladigital.com',
  REDIRECT_DELAY: 0,
  DEBUG: true,
  // Email verification service endpoint
  EMAIL_VERIFICATION_API: 'https://email-verification-backend-psi.vercel.app/api/email-verify',
};

/***********************************
 *  Email Verification Configuration
 ***********************************/
const EMAIL_VERIFICATION = {
  enabled: true,
  checkDomainExists: true,
  blockDisposable: true,
  autoCorrectTypos: true,
  requireVerificationForSuspicious: true,
  requireVerificationForAll: true, // Force verification for all emails
  apiTimeout: 3000,
  verificationCodeLength: 6,
  verificationExpiryMinutes: 10,
};

// Common email typos and corrections
const EMAIL_TYPOS = {
  'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmai.com': 'gmail.com', 'gmial.com': 'gmail.com',
  'yahoo.co': 'yahoo.com', 'yahoo.cm': 'yahoo.com', 'hotmail.co': 'hotmail.com', 'hotmail.cm': 'hotmail.com',
  'outlook.co': 'outlook.com', 'outlook.cm': 'outlook.com', 'icloud.co': 'icloud.com', 'live.co': 'live.com',
};

// Known disposable/temporary email domains to block
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
  'temp-mail.org', 'throwaway.email', 'mohmal.com', 'sharklasers.com',
  'yopmail.com', 'maildrop.cc', 'temp-mail.ru', 'dispostable.com',
  'fakeinbox.com', 'spamgourmet.com', 'trashmail.com', 'tempail.com',
  'mintemail.com', 'emailondeck.com', 'getnada.com', 'tempinbox.com'
];

// Trusted email domains (major providers)
const TRUSTED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'live.com', 'msn.com', 'aol.com', 'protonmail.com', 'mail.com'
];

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
  submittedClickIds: new Set(), // ← ADD THIS LINE
  validationState: { 
    fullName: false, 
    email: false, 
    phone: false, 
    ageVerification: false,
    emailVerification: false
  },
  emailVerification: {
    isRequired: false,
    isVerified: false,
    verificationId: null,
    attempts: 0,
    maxAttempts: 3,
  }
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

// Replace the injectFixedStyles function in lead-form.js with this simplified version:

(function injectFixedStyles() {
  if (document.getElementById('form-fixes-v2')) return;
  
  const css = `
    /* ===== Remove gray outline around inputs ===== */
    .form-group, .form-group:focus-within { 
      outline: none !important; 
      box-shadow: none !important; 
      border: none !important; 
    }

    .form-group .input-wrapper, 
    .form-group .input-wrapper:focus, 
    .form-group .input-wrapper:focus-within { 
      outline: none !important; 
      box-shadow: none !important; 
    }

    /* NO BORDER STYLING - let themes handle all borders */

    /* Inputs */
    .form-group .input-wrapper input,
    .form-group .input-wrapper select {
      background: transparent !important;
      background-color: transparent !important;
      outline: none !important;
      box-shadow: none !important;
    }

    /* Neutralize WebKit autofill inner shadow */
    input:-webkit-autofill, input:-webkit-autofill:focus, select:-webkit-autofill, textarea:-webkit-autofill {
      -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
      box-shadow: inset 0 0 0px 1000px transparent !important;
      -webkit-text-fill-color: inherit !important;
      transition: background-color 5000s ease-in-out 0s;
    }
    
    /* NO SUCCESS/ERROR BORDER STATES - themes handle validation styling */
    
    /* OTP card styling */
    .otp-card {
      margin-top: 12px;
      background: rgba(255,255,255,.05);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .otp-head {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      text-align: center;
    }
    
    .otp-title {
      font-weight: 700;
      font-size: 14px;
      color: #e5e7eb;
    }
    
    .otp-to {
      font-size: 12px;
      color: #9ca3af;
    }
    
    .otp-inputs {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin: 6px 0;
    }
    
    .otp-input {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(0,0,0,.25) !important;
      border: 1px solid rgba(255,255,255,.08);
      outline: none;
      text-align: center;
      font-size: 18px;
      color: #e5e7eb;
      transition: transform .08s ease;
    }
    
    .otp-input:focus {
      transform: scale(1.03);
      border-color: #22d3ee;
      box-shadow: 0 0 0 2px rgba(34,211,238,.25);
    }
    
    .otp-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    
    .otp-btn {
      appearance: none;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .otp-btn-send {
      background: #f59e0b;
      color: #fff;
    }
    
    .otp-btn-resend {
      background: transparent;
      color: #f59e0b;
      border: 1px solid rgba(245,158,11,.6);
    }
    
    .otp-btn[disabled] {
      opacity: .6;
      cursor: not-allowed;
    }
    
    .otp-msg {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      margin-top: 4px;
    }
    
    .otp-msg.ok {
      color: #34d399;
    }
    
    .otp-msg.err {
      color: #f87171;
    }
    
    .otp-card.fade-out {
      opacity: .25;
      pointer-events: none;
      transition: opacity .25s ease;
    }
  `;
  
  const style = document.createElement('style');
  style.id = 'form-fixes-v2';
  style.textContent = css;
  document.head.appendChild(style);
})();

/***********************************
 *  Email Verification Functions
 ***********************************/

/**
 * Enhanced email format validation
 */
function isValidEmailFormat(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) return false;
  
  const [localPart, domain] = email.split('@');
  
  if (localPart.length > 64) return false;
  if (domain.length > 253) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false;
  
  return true;
}

/**
 * Always-on email validation: require verification for ALL valid emails
 */
async function verifyEmail(email) {
  const result = {
    isValid: false,
    correctedEmail: email,
    reason: '',
    confidence: 0,
    suggestions: [],
    requiresVerification: true // force verification for any valid email
  };

  if (!email || !email.trim()) {
    result.reason = 'Email es obligatorio';
    return result;
  }
  
  email = email.trim().toLowerCase();

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) {
    result.reason = 'Formato de email inválido';
    return result;
  }

  const [localPart, domain] = email.split('@');

  // simple typo autocorrect
  if (EMAIL_VERIFICATION.autoCorrectTypos && EMAIL_TYPOS[domain]) {
    result.correctedEmail = `${localPart}@${EMAIL_TYPOS[domain]}`;
    result.suggestions.push(`¿Quisiste decir ${result.correctedEmail}?`);
    email = result.correctedEmail;
  }

  // disposable block
  if (EMAIL_VERIFICATION.blockDisposable && DISPOSABLE_DOMAINS.includes(domain)) {
    result.reason = 'Emails temporales no permitidos';
    return result;
  }

  result.isValid = true;
  result.confidence = 80;
  result.reason = 'Email válido – requiere verificación';
  result.requiresVerification = true;
  return result;
}

/***********************************
 *  API Functions - SINGLE DEFINITIONS
 ***********************************/
async function sendVerificationCode(email) {
  try {
    const res = await fetch(CONFIG.EMAIL_VERIFICATION_API, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'send-code', 
        email, 
        language: 'es', 
        expiryMinutes: EMAIL_VERIFICATION.verificationExpiryMinutes 
      })
    });
    
    const raw = await res.text(); 
    let data = {}; 
    try { 
      data = JSON.parse(raw); 
    } catch {}
    
    if (!res.ok || data?.success === false) {
      return { 
        success: false, 
        error: data?.details || data?.error || `HTTP ${res.status}` 
      };
    }
    
    return { 
      success: true, 
      verificationId: data.verificationId, 
      expiresAt: data.expiresAt 
    };
  } catch (error) {
    debugLog('Send verification code error:', error);
    return { 
      success: false, 
      error: 'No se pudo enviar el código de verificación' 
    };
  }
}

async function verifyCode(verificationId, code) {
  try {
    const res = await fetch(CONFIG.EMAIL_VERIFICATION_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'verify-code', 
        verificationId, 
        code 
      }),
    });

    const txt = await res.text();
    let data = {};
    try {
      data = JSON.parse(txt);
    } catch {}

    if (!res.ok) {
      return { 
        success: false, 
        error: data?.error || `HTTP ${res.status}` 
      };
    }

    return {
      success: !!data.valid,
      error: data.valid ? null : (data?.error || 'Código incorrecto'),
    };
  } catch (error) {
    debugLog('Verify code error:', error);
    return { 
      success: false, 
      error: 'Error al verificar el código' 
    };
  }
}

async function checkDuplicateEmailAndSource(email, source) {
  try {
    const endpoint = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${encodeURIComponent(CONFIG.AIRTABLE_TABLE_NAME)}`;
    const formula = `AND({Email}="${email}", {Traffic Source}="${source}")`;
    const url = `${endpoint}?filterByFormula=${encodeURIComponent(formula)}`;
    
    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      debugLog('Duplicate check failed:', response.status);
      return false; // Allow if check fails
    }
    
    const data = await response.json();
    const isDuplicate = data.records && data.records.length > 0;
    debugLog('Duplicate check result:', { email, source, isDuplicate, count: data.records?.length || 0 });
    return isDuplicate;
  } catch (error) {
    debugLog('Duplicate check error:', error);
    return false; // Allow if check fails
  }
}

/***********************************
 *  OTP UI Functions - FIXED
 ***********************************/
function renderOtpBlock(email) {
  const card = document.createElement('div'); 
  card.className = 'otp-card';
  card.innerHTML = `
    <div class="otp-head">
      <div class="otp-title">Código de Verificación</div>
      <div class="otp-to">Se envió a <strong>${email}</strong></div>
    </div>
    <div class="otp-inputs" role="group" aria-label="Código de verificación de 6 dígitos">
      ${Array.from({length: 6}).map(() => 
        `<input inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-input"/>
      `).join('')}
    </div>
    <div class="otp-actions">
      <button type="button" class="otp-btn otp-btn-send" id="btnSendCode">Enviar código</button>
      <button type="button" class="otp-btn otp-btn-resend" id="btnResend" disabled>Reenviar (30s)</button>
    </div>
    <div class="otp-msg" id="otpMsg" style="color:#9ca3af">Ingresa el código de 6 dígitos</div>
  `;
  return card;
}

function mountOtpUI(container, email) {
  // Clear any existing OTP card
  const old = container.querySelector('.otp-card');
  if (old) old.remove();

  const card = renderOtpBlock(email);
  container.appendChild(card);

  const inputs = [...card.querySelectorAll('.otp-input')];
  const sendBtn = card.querySelector('#btnSendCode');
  const resendBtn = card.querySelector('#btnResend');
  const msg = card.querySelector('#otpMsg');

  const getCode = () => inputs.map(i => i.value).join('');
  const clearCode = () => {
    inputs.forEach(i => (i.value = ''));
    inputs[0]?.focus();
  };

  // Input handling
  inputs.forEach((el, idx) => {
    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '');
      if (el.value && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
      
      const code = getCode();
      if (code.length === 6) {
        handleCodeVerification(code);
      }
    });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !el.value && idx > 0) {
        inputs[idx - 1].focus();
        inputs[idx - 1].value = '';
      }
      if (e.key === 'Enter') {
        const code = getCode();
        if (code.length === 6) {
          handleCodeVerification(code);
        }
      }
    });

    el.addEventListener('paste', (e) => {
      const text = (e.clipboardData || window.clipboardData).getData('text');
      if (/^\d{6}$/.test(text)) {
        e.preventDefault();
        text.split('').forEach((ch, i) => {
          if (inputs[i]) inputs[i].value = ch;
        });
        handleCodeVerification(text);
      }
    });
  });

  // Countdown timer
  let countdown = 30;
  let timer = null;

  const tick = () => {
    countdown--;
    resendBtn.textContent = countdown > 0 ? `Reenviar (${countdown}s)` : 'Reenviar';
    resendBtn.disabled = countdown > 0;
    if (countdown <= 0) clearInterval(timer);
  };

  const startCountdown = () => {
    clearInterval(timer);
    countdown = 30;
    resendBtn.disabled = true;
    resendBtn.textContent = 'Reenviar (30s)';
    timer = setInterval(tick, 1000);
  };

  // Send code function
  async function doSend() {
    sendBtn.disabled = true;
    resendBtn.disabled = true;
    msg.className = 'otp-msg';
    msg.textContent = 'Enviando código...';

    const result = await sendVerificationCode(qs('email').value.trim());
    
    if (result.success) {
      msg.className = 'otp-msg ok';
      msg.textContent = 'Código enviado. Revisa tu bandeja.';
      state.emailVerification.verificationId = result.verificationId;
      state.emailVerification.isRequired = true;
      clearCode();
      startCountdown();
    } else {
      msg.className = 'otp-msg err';
      msg.textContent = result.error || 'No se pudo enviar el código';
    }
    
    sendBtn.disabled = false;
  }

  sendBtn.addEventListener('click', doSend);
  resendBtn.addEventListener('click', doSend);

  // Auto-send code if not already sent
  if (!state.emailVerification.verificationId) {
    doSend();
  }
}

/***********************************
 *  Code Verification Handler - FIXED
 ***********************************/
async function handleCodeVerification(code) {
  const host = document.querySelector('.email-verification-host');
  const msg = host ? host.querySelector('#otpMsg') : null;
  
  if (!state.emailVerification.verificationId) {
    if (msg) {
      msg.className = 'otp-msg err';
      msg.textContent = 'Primero envía el código';
    }
    return;
  }

  if (msg) {
    msg.className = 'otp-msg';
    msg.textContent = 'Verificando código...';
  }

  const result = await verifyCode(state.emailVerification.verificationId, code);

  if (result.success) {
    // Mark email as verified
    state.emailVerification.isVerified = true;
    state.validationState.emailVerification = true;
    state.validationState.email = true;
    
    // Update UI to show success
    if (msg) {
      msg.className = 'otp-msg ok';
      msg.textContent = '¡Código verificado!';
    }
    
    // Update field UI with green border
    updateFieldUI('email', true, '¡Email verificado!', 'success');
    updateProgress();
    
    // Hide the OTP card completely after a delay
    setTimeout(() => {
      const host = document.querySelector('.email-verification-host');
      if (host) {
        host.innerHTML = '';
        host.style.display = 'none';
      }
    }, 1500);
    
    debugLog('Email verification completed successfully');
  } else {
    if (msg) {
      msg.className = 'otp-msg err';
      msg.textContent = result.error || 'Código incorrecto';
    }
    
    // Focus on the first empty input or last input
    const inputs = [...document.querySelectorAll('.otp-input')];
    const emptyInput = inputs.find(i => !i.value);
    (emptyInput || inputs[inputs.length - 1])?.focus();
  }
}

/***********************************
 *  Email Verification UI Hook - FIXED
 ***********************************/
function showEmailVerificationUI(result, inputElement) {
  const group = inputElement.closest('.form-group');
  if (!group) return;
  
  const inputWrapper = group.querySelector('.input-wrapper') || group;
  let host = group.querySelector('.email-verification-host');
  
  if (!host) {
    host = document.createElement('div');
    host.className = 'email-verification-host';
    inputWrapper.parentNode.insertBefore(host, inputWrapper.nextSibling);
  }
  
  if (result && result.isValid) {
    state.emailVerification.isRequired = true;
    mountOtpUI(host, inputElement.value.trim());
  } else {
    host.innerHTML = '';
  }
}

/***********************************
 *  Field Validation - FIXED
 ***********************************/
async function validateField(fieldName) {
  let isValid = false;
  let message = '';
  let messageType = 'error';

  switch (fieldName) {
    case 'fullName': {
      const name = qs('fullName').value.trim();
      if (!name) {
        message = 'El nombre completo es obligatorio';
      } else if (name.length < 2) {
        message = 'El nombre debe tener al menos 2 caracteres';
      } else if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(name)) {
        message = 'El nombre solo puede contener letras y espacios';
      } else {
        isValid = true;
        message = '¡Nombre válido!';
        messageType = 'success';
      }
      state.validationState.fullName = isValid;
      break;
    }

    case 'email': {
      const email = qs('email').value.trim();

      if (!email) {
        message = 'El correo electrónico es obligatorio';
      } else {
        const verificationResult = await verifyEmail(email);
        showEmailVerificationUI(verificationResult, qs('email'));

        if (verificationResult.isValid) {
          // Email format is valid, but check if verification is required and completed
          if (state.emailVerification.isRequired) {
            isValid = state.emailVerification.isVerified;
            message = isValid ? '¡Email verificado!' : 'Requiere verificación por código';
            messageType = isValid ? 'success' : 'error';
          } else {
            // Email is valid and doesn't require verification (shouldn't happen with current config)
            isValid = true;
            message = '¡Email válido!';
            messageType = 'success';
          }

          if (verificationResult.correctedEmail !== email) {
            qs('email').value = verificationResult.correctedEmail;
          }
        } else {
          message = verificationResult.reason || 'Email inválido';
        }
      }

      state.validationState.email = isValid;
      break;
    }

    case 'phone': {
      const phone = qs('phone').value.replace(/\D/g, '');
      const countryCode = qs('countryCode').value;
      
      if (!phone) {
        message = 'El número de teléfono es obligatorio';
      } else if (!countryCode) {
        message = 'Selecciona un código de país';
      } else if (phone.length < 6) {
        message = 'El número debe tener al menos 6 dígitos';
      } else if (phone.length > 15) {
        message = 'El número no puede tener más de 15 dígitos';
      } else {
        isValid = true;
        message = '¡Teléfono válido!';
        messageType = 'success';
      }
      
      state.validationState.phone = isValid;
      break;
    }

    case 'ageVerification': {
      const checked = qs('ageVerification').checked;
      
      if (!checked) {
        message = 'Debes confirmar que eres mayor de 18 años';
      } else {
        isValid = true;
        message = '¡Verificación de edad confirmada!';
        messageType = 'success';
      }
      
      state.validationState.ageVerification = isValid;
      break;
    }
  }

  updateFieldUI(fieldName, isValid, message, messageType);
  updateProgress();
  return isValid;
}

/***********************************
 *  Field UI Update - FIXED
 ***********************************/
function updateFieldUI(fieldName, isValid, message, messageType) {
  const fieldMap = {
    fullName: { group: 'nameGroup', message: 'nameMessage', text: 'nameMessageText' },
    email: { group: 'emailGroup', message: 'emailMessage', text: 'emailMessageText' },
    phone: { group: 'phoneGroup', message: 'phoneMessage', text: 'phoneMessageText' },
    ageVerification: { group: 'ageVerificationGroup', message: 'ageVerificationMessage', text: 'ageVerificationMessageText' },
  };
  
  const ids = fieldMap[fieldName];
  if (!ids) return;
  
  const group = qs(ids.group);
  const messageEl = qs(ids.message);
  const messageText = qs(ids.text);
  
  if (!group || !messageEl || !messageText) return;
  
  // Clear existing classes
  group.classList.remove('success', 'error');
  messageEl.classList.remove('success', 'error', 'show');
  
  if (message) {
    // Add appropriate classes
    group.classList.add(messageType);
    messageEl.classList.add(messageType, 'show');
    messageText.textContent = message;
    
    // Update SVG icon
    const path = messageEl.querySelector('svg path');
    if (path) {
      const successD = 'M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z';
      const errorD = 'M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M13 17H11V15H13V17M13 13H11V7H13V13Z';
      path.setAttribute('d', messageType === 'success' ? successD : errorD);
    }
  }
  
  debugLog(`Field ${fieldName} updated:`, { isValid, message, messageType });
}

/***********************************
 *  Progress Update - FIXED
 ***********************************/
function updateProgress() {
  const totalFields = 5; // fullName, email, country, phone, ageVerification
  let completedFields = 0;
  
  // Check full name
  if (qs('fullName').value.trim().length >= 2) {
    completedFields++;
  }
  
  // Check email (must be valid AND verified if verification is required)
  const emailValue = qs('email').value.trim();
  if (emailValue && state.validationState.email) {
    if (state.emailVerification.isRequired) {
      if (state.emailVerification.isVerified) {
        completedFields++;
      }
    } else {
      completedFields++;
    }
  }
  
  // Check country code
  if (qs('countryCode').value) {
    completedFields++;
  }
  
  // Check phone
  if (qs('phone').value.replace(/\D/g, '').length >= 6) {
    completedFields++;
  }
  
  // Check age verification
  if (qs('ageVerification').checked) {
    completedFields++;
  }
  
  const percentage = Math.round((completedFields / totalFields) * 100);
  const progressBar = qs('progressFill');
  if (progressBar) {
    progressBar.style.width = percentage + '%';
  }
  
  debugLog('Progress updated:', { completedFields, totalFields, percentage });
}

/***********************************
 *  Validation Initialization - FIXED
 ***********************************/
function initializeValidation() {
  const nameEl = qs('fullName');
  const emailEl = qs('email');
  const phoneEl = qs('phone');
  const countryEl = qs('countryCode');
  const ageVerificationEl = qs('ageVerification');

  if (!nameEl || !emailEl || !phoneEl || !countryEl || !ageVerificationEl) {
    debugLog('Some form elements not found');
    return;
  }

  // Phone input formatting
  if (phoneEl) {
    phoneEl.setAttribute('inputmode', 'numeric');
    phoneEl.setAttribute('pattern', '[0-9]*');
    phoneEl.placeholder = '1234567890';
  }

  // Name field events
  nameEl.addEventListener('blur', () => validateField('fullName'));
  nameEl.addEventListener('input', () => {
    if (state.validationState.fullName) validateField('fullName');
    updateProgress();
  });

  // Email field events
  emailEl.addEventListener('blur', async () => await validateField('email'));
  emailEl.addEventListener('input', async () => {
    if (state.validationState.email) await validateField('email');
    updateProgress();
  });

  // Phone field events
  phoneEl.addEventListener('blur', () => validateField('phone'));
  phoneEl.addEventListener('input', function () {
    // Only allow numbers
    this.value = this.value.replace(/\D/g, '');
    if (state.validationState.phone) validateField('phone');
    updateProgress();
  });

  // Country change event
  countryEl.addEventListener('change', () => {
    if (qs('phone').value) validateField('phone');
    updateProgress();
  });

  // Age verification events
  ageVerificationEl.addEventListener('change', () => {
    validateField('ageVerification');
    updateProgress();
  });

  // Initial progress update
  updateProgress();
  
  debugLog('Validation initialized');
}

/***********************************
 *  URL and tracking functions (unchanged)
 ***********************************/
function buildSafeRedirectUrl(rawUrl, clickid) {
  try {
    let candidate = String(rawUrl || '').trim();
    if (!candidate) return CONFIG.DEFAULT_REDIRECT_URL;

    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) {
      candidate = 'https://' + candidate;
    }

    const url = new URL(candidate);

    if (!/^https?:$/.test(url.protocol)) throw new Error('protocol');

    if (clickid) {
      const existingValues = url.searchParams.getAll('clickid');
      const existing = existingValues.find((v) => v && String(v).trim().length > 0);

      if (existingValues.length > 0) {
        url.searchParams.delete('clickid');
        url.searchParams.append('clickid', existing || String(clickid));
      } else {
        url.searchParams.append('clickid', String(clickid));
      }
    }

    return url.toString();
  } catch {
    return CONFIG.DEFAULT_REDIRECT_URL;
  }
}

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

function encodeRedirectParamInLocation() {
  try {
    const url = new URL(location.href);
    if (!url.searchParams.has('redir_enc')) {
      const raw = url.searchParams.get('redirect');
      if (raw) {
        const enc = b64urlEncode(raw);
        if (enc) {
          url.searchParams.delete('redirect');
          url.searchParams.set('redir_enc', enc);
          history.replaceState(null, '', url.toString());
          debugLog('redirect encoded -> redir_enc');
        }
      }
    }
  } catch (e) { debugLog('encodeRedirectParamInLocation failed', e); }
}

/***********************************
 *  Theme loader (unchanged)
 ***********************************/
function resolveThemeKeyFromUrl() {
  const p = new URLSearchParams(location.search);
  for (const k of THEME_CONFIG.urlParams) {
    const v = (p.get(k) || '').trim().toLowerCase();
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

  debugLog('Loading theme', { themeKey, trySrc });
  const first = await loadScript(trySrc);
  if (!first.ok) { debugLog('Theme not found, loading default'); await loadScript(fallbackSrc); }

  let theme = (window.ThemeRegistry && window.ThemeRegistry.get && window.ThemeRegistry.get()) || null;
  if (!theme) {
    if (themeKey === 'pinup' && window.PinUpTheme?.apply) theme = window.PinUpTheme;
    else if (window.GlassDefaultTheme?.apply) theme = window.GlassDefaultTheme;
  }

  try { theme?.apply?.(); }
  catch (e) { debugLog('Theme apply failed', e); }
}

/***********************************
 *  Tracking & geo (unchanged)
 ***********************************/
function initializeTracking() {
  const p = new URLSearchParams(location.search);
  const payload = p.get('payload') || '';
  const campaign = p.get('campaign') || '';
  const source = p.get('source') || '';
  const redirEnc = p.get('redir_enc') || '';
  const redirectRaw = p.get('redirect') || '';
  const decodedRedirect = redirEnc ? b64urlDecode(redirEnc) : redirectRaw;

  if (payload) { localStorage.setItem('clickid', payload); localStorage.setItem('payload', payload); }
  const clickid = payload || localStorage.getItem('clickid') || localStorage.getItem('payload') || '';

  state.trackingData = {
    clickid,
    payload: clickid,
    promo: campaign,
    source: source,
    landingPage: location.href,
    redirectUrl: decodedRedirect || CONFIG.DEFAULT_REDIRECT_URL,
    timestamp: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
    referrer: 'direct', // ← Always set to 'direct' instead of document.referrer
    landingPage: location.href,
  };

  if (!state.trackingData.redirectUrl || state.trackingData.redirectUrl === 'null') {
    state.trackingData.redirectUrl = CONFIG.DEFAULT_REDIRECT_URL;
  }
  debugLog('Tracking', state.trackingData);
}

async function fetchGeoData() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const d = await res.json();
      state.geoData = {
        ip: d.ip || '', 
        country: d.country_name || '', 
        city: d.city || '',
        userAgent: navigator.userAgent, 
        language: navigator.language || '', 
        platform: navigator.platform || '',
      };
      debugLog('Geo', state.geoData); 
      return;
    }
  } catch (e) { 
    debugLog('Geo fetch failed', e); 
  }
  
  state.geoData = { 
    userAgent: navigator.userAgent, 
    language: navigator.language || '', 
    platform: navigator.platform || '' 
  };
}

/***********************************
 *  Submit → Airtable → Redirect - FIXED
 ***********************************/
async function handleSubmit(evt) {
  evt.preventDefault();
  if (state.isSubmitting) return;

  // Disable button immediately to prevent multiple clicks
  const submitBtn = qs('submitBtn');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const clickid = state.trackingData.clickid || state.trackingData.payload || '';
    
    // Prevent duplicate submissions of same clickid
    if (clickid && state.submittedClickIds.has(clickid)) {
      showError('Esta solicitud ya fue enviada');
      return;
    }

    // Validate all fields
    const okName = await validateField('fullName');
    const okEmail = await validateField('email');
    const okPhone = await validateField('phone');
    const okAge = await validateField('ageVerification');
    
    // Additional check for email verification if required
    if (state.emailVerification.isRequired && !state.emailVerification.isVerified) {
      showError('Por favor verifica tu email antes de continuar');
      const firstOtpInput = document.querySelector('.otp-input');
      if (firstOtpInput) firstOtpInput.focus();
      return;
    }
    
    if (!okName || !okEmail || !okPhone || !okAge) {
      // Focus on first invalid field
      if (!okName) qs('fullName').focus();
      else if (!okEmail) qs('email').focus();
      else if (!okPhone) qs('phone').focus();
      else if (!okAge) qs('ageVerification').focus();
      return;
    }
    
    // Collect form data
    state.formData = {
      fullName: qs('fullName').value.trim(),
      email: qs('email').value.trim(),
      phone: `${qs('countryCode').value} ${qs('phone').value.replace(/\D/g, '')}`,
      ageVerification: qs('ageVerification').checked,
      promoConsent: qs('promoConsent').checked,
      emailVerified: state.emailVerification.isVerified,
    };

    // Check for email + source duplicate
    const email = state.formData.email;
    const source = state.trackingData.source || 'Direct';
    
    debugLog('Checking for duplicates:', { email, source });
    const isDuplicate = await checkDuplicateEmailAndSource(email, source);
    
    if (isDuplicate) {
      showError(`Este email ya fue registrado desde la fuente: ${source}`);
      return;
    }
    
    debugLog('Form data', state.formData);
    toggleLoading(true);
    
    await submitToAirtable();
    
    // Mark this clickid as submitted
    if (clickid) {
      state.submittedClickIds.add(clickid);
    }
    
    debugLog('Submission successful');
    performRedirect();
    
  } catch (error) {
    console.error('Submission error:', error);
    showError('Algo salió mal. Por favor intenta de nuevo.');
  } finally {
    toggleLoading(false);
    // Re-enable button in case of error
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function submitToAirtable() {
  const record = {
    'Full Name': state.formData.fullName,
    'Email': state.formData.email,
    'Phone Number': state.formData.phone,
    'Age Verification': state.formData.ageVerification ? 'Yes' : 'No',
    'Promotional Consent': state.formData.promoConsent ? 'Yes' : 'No',
    'Email Verified': state.formData.emailVerified ? 'Yes' : 'No',
    'Click ID': state.trackingData.clickid || state.trackingData.payload || '',
    'Promo/Influencer': state.trackingData.promo || state.trackingData.campaign || '',
    'IP Address': state.geoData.ip || '',
    'Country': state.geoData.country || '',
    'City': state.geoData.city || '',
    'Landing Page': state.trackingData.redirectUrl || '',
    'Traffic Source': state.trackingData.source || 'Direct',
    'User Agent': state.geoData.userAgent || '',
    'Language': state.geoData.language || '',
    'Timestamp': state.trackingData.timestamp || '',
  };
  
  const payload = { records: [{ fields: record }], typecast: true };
  debugLog('Airtable payload', payload);

  if (CONFIG.PROXY_URL) {
    const response = await fetch(CONFIG.PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', payload })
    });
    
    if (!response.ok) {
      let errorData = {};
      try { errorData = await response.json(); } catch {}
      throw new Error(`Proxy HTTP ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    return response.json();
  }

  const endpoint = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${encodeURIComponent(CONFIG.AIRTABLE_TABLE_NAME)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    let errorData = {};
    try { errorData = await response.json(); } catch {}
    debugLog('Airtable error', { status: response.status, errorData });
    throw new Error(`HTTP ${response.status}`);
  }
  
  const jsonResponse = await response.json();
  debugLog('Airtable response', jsonResponse);
  return jsonResponse;
}

function performRedirect() {
  // Clear form to prevent resubmission
  const form = qs('leadForm');
  if (form) form.reset();
  
  const clickid = state.trackingData.clickid || state.trackingData.payload || '';
  const safeUrl = buildSafeRedirectUrl(state.trackingData.redirectUrl, clickid);
  debugLog('Redirecting to', safeUrl);
  
  if (CONFIG.REDIRECT_DELAY > 0) {
    setTimeout(() => (location.href = safeUrl), CONFIG.REDIRECT_DELAY);
  } else {
    location.href = safeUrl;
  }
}



function showError(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #e53e3e;
    color: #fff;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,.15);
    z-index: 10000;
    animation: slideInRight .3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

/***********************************
 *  Initialization - FIXED
 ***********************************/
document.addEventListener('DOMContentLoaded', async () => {
  debugLog('Initializing lead form...');
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Encode redirect parameter
  encodeRedirectParamInLocation();
  
  // Load theme
  await loadTheme();
  
  // Initialize everything with a small delay to ensure DOM is ready
  setTimeout(() => {
    initializeTracking();
    initializeValidation();
    initializeForm();
    fetchGeoData();
    debugLog('Lead form initialized successfully');
  }, 200);
});

/***********************************
 *  FIXED CSS INJECTION - ALL TEXTBOX STYLING REMOVED
 ***********************************/
(function injectFixedStyles() {
  if (document.getElementById('form-fixes-v2')) return;
  
  const css = `
    /* OTP card styling only */
    .otp-card {
      margin-top: 12px;
      background: rgba(255,255,255,.05);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .otp-head {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      text-align: center;
    }
    
    .otp-title {
      font-weight: 700;
      font-size: 14px;
      color: #e5e7eb;
    }
    
    .otp-to {
      font-size: 12px;
      color: #9ca3af;
    }
    
    .otp-inputs {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin: 6px 0;
    }
    
    .otp-input {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(0,0,0,.25) !important;
      border: 1px solid rgba(255,255,255,.08);
      outline: none;
      text-align: center;
      font-size: 18px;
      color: #e5e7eb;
      transition: transform .08s ease;
    }
    
    .otp-input:focus {
      transform: scale(1.03);
      border-color: #22d3ee;
      box-shadow: 0 0 0 2px rgba(34,211,238,.25);
    }
    
    .otp-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    
    .otp-btn {
      appearance: none;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .otp-btn-send {
      background: #f59e0b;
      color: #fff;
    }
    
    .otp-btn-resend {
      background: transparent;
      color: #f59e0b;
      border: 1px solid rgba(245,158,11,.6);
    }
    
    .otp-btn[disabled] {
      opacity: .6;
      cursor: not-allowed;
    }
    
    .otp-msg {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      margin-top: 4px;
    }
    
    .otp-msg.ok {
      color: #34d399;
    }
    
    .otp-msg.err {
      color: #f87171;
    }
    
    .otp-card.fade-out {
      opacity: .25;
      pointer-events: none;
      transition: opacity .25s ease;
    }
  `;
  
  const style = document.createElement('style');
  style.id = 'form-fixes-v2';
  style.textContent = css;
  document.head.appendChild(style);
})();

/* === COMPLETELY REMOVED - NO TEXTBOX STYLING === */
(function injectFixedStylesNoBlue(){
  const id = 'form-fixes-no-blue';
  if (document.getElementById(id)) return;

  const css = `
    /* Only essential resets - no textbox styling */
    input:-webkit-autofill, input:-webkit-autofill:focus,
    select:-webkit-autofill, textarea:-webkit-autofill{
      -webkit-text-fill-color: inherit!important;
      transition: background-color 5000s ease-in-out 0s;
    }
  `;

  const s = document.createElement('style');
  s.id = id;
  s.textContent = css;
  document.head.appendChild(s);
})();


function initializeForm() {
  const form = qs('leadForm');
  if (!form) {
    debugLog('Lead form not found');
    return;
  }
  
  // Add submit event listener
  form.addEventListener('submit', handleSubmit);
  
  // Add change/input listeners for progress updates
  form.querySelectorAll('input, select').forEach((element) => {
    element.addEventListener('change', updateProgress);
    element.addEventListener('input', updateProgress);
  });
  
  // Initial progress update
  updateProgress();
  
  debugLog('Form initialized');
}

/***********************************
 *  Debug helpers (dev only)
 ***********************************/
window.debugSubmit = function () {
  console.log('DEBUG SUBMIT');
  qs('fullName').value = 'Test User';
  qs('email').value = 'test@example.com';
  qs('countryCode').value = '+56';
  qs('phone').value = '5551234567';
  qs('ageVerification').checked = true;
  qs('promoConsent').checked = true;
  
  // Manually trigger validation
  validateField('fullName');
  validateField('email');
  validateField('phone');
  validateField('ageVerification');
  
  qs('leadForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
};

window.debugState = function () {
  console.log('=== DEBUG STATE ===');
  console.log('State:', state);
  console.log('Tracking:', state.trackingData);
  console.log('Geo:', state.geoData);
  console.log('Email Verification:', state.emailVerification);
  console.log('Validation State:', state.validationState);
};

window.debugEmailVerification = function (email = 'test@gmail.com') {
  console.log('=== DEBUG EMAIL VERIFICATION ===');
  const emailInput = qs('email');
  if (emailInput) {
    emailInput.value = email;
    validateField('email');
  }
};

console.log('=== LEAD FORM LOADED ===');
console.log('TIP: Use debugSubmit() to test form submission');
console.log('TIP: Use debugState() to view current state');
console.log('TIP: Use debugEmailVerification() to test email verification');
