'use strict';

// File: /js/giveaway.js
// Giveaway form with email verification and prize system

/***********************************
 *  Configuration
 ***********************************/
const CONFIG = {
  AIRTABLE_BASE_ID: 'appcH8x1W3uCmFJip',
  AIRTABLE_TABLE_NAME: 'Giveaways',
  AIRTABLE_API_KEY: 'patDS5YMB7hzvJTCS.7559c701e84181c5558a048c8ae8a611b1ba15284846cf66833866788dbc7d77',
  DEFAULT_REDIRECT_URL: 'https://mieladigital.com',
  DEBUG: true,
  EMAIL_VERIFICATION_API: 'https://email-verification-backend-psi.vercel.app/api/email-verify',
};

/***********************************
 *  Email Verification Configuration
 ***********************************/
const EMAIL_VERIFICATION = {
  enabled: true,
  requireVerificationForAll: true,
  apiTimeout: 3000,
  verificationCodeLength: 6,
  verificationExpiryMinutes: 10,
};

// Theme configuration - campaign first for priority
const THEME_CONFIG = {
  enabled: true,
  basePath: '/giveaway-themes',
  defaultKey: 'default',
  urlParams: ['campaign', 'theme', 'promo'],  // 'campaign' first for priority
};

/***********************************
 *  Prize Configuration
 ***********************************/
const PRIZES = [
  { id: 'bonus_5k', name: 'Bono $5,000', icon: '💰', description: 'Bono exclusivo de $5,000 para tu cuenta' },
  { id: 'merchandise', name: 'Mercancía Exclusiva', icon: '👕', description: 'Productos oficiales exclusivos' },
  { id: 'free_spins', name: '100 Giros Gratis', icon: '🎰', description: '100 giros gratis en juegos seleccionados' },
  { id: 'vip_access', name: 'Acceso VIP', icon: '👑', description: 'Acceso exclusivo a eventos VIP' },
];

/***********************************
 *  State Management
 ***********************************/
const state = {
  formData: {},
  geoData: {},
  trackingData: {},
  isSubmitting: false,
  campaignValid: false,
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
  },
  prize: {
    selected: null,
    claimed: false,
  }
};

/***********************************
 *  Theme Registry
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
 *  Utilities
 ***********************************/
function debugLog(...args) { if (CONFIG.DEBUG) console.log('[GIVEAWAY]', ...args); }
function qs(id) { return document.getElementById(id); }
function isValidEmail(email) { return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email); }

function toggleLoading(isLoading) {
  const btn = qs('submitBtn'); 
  const overlay = qs('loadingOverlay');
  if (!btn || !overlay) return;
  state.isSubmitting = !!isLoading;
  btn.classList.toggle('loading', !!isLoading);
  overlay.classList.toggle('show', !!isLoading);
}

/***********************************
 *  Campaign Validation & Form Control
 ***********************************/
function validateCampaign() {
  const p = new URLSearchParams(location.search);
  const campaign = (p.get('campaign') || '').trim().toLowerCase();
  
  debugLog('Validating campaign:', { campaign, url: location.search });
  
  // Only "pinup" is valid for now
  if (campaign !== 'pinup') {
    debugLog('Invalid campaign detected:', campaign, 'Only "pinup" is valid');
    state.campaignValid = false;
    return false;
  }
  
  // Valid campaign
  state.campaignValid = true;
  debugLog('Valid campaign found:', campaign);
  return true;
}

function showCampaignWarning() {
  // Hide the entire body content except the warning
  document.body.style.overflow = 'hidden';
  
  // Hide all children of body
  Array.from(document.body.children).forEach(child => {
    if (child.id !== 'campaignWarning') {
      child.style.display = 'none';
    }
  });
  
  // Create or show warning message
  let warningDiv = qs('campaignWarning');
  if (!warningDiv) {
    warningDiv = document.createElement('div');
    warningDiv.id = 'campaignWarning';
    warningDiv.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.95); z-index: 99999;
      display: flex; align-items: center; justify-content: center;
    `;
    
    const warningContent = document.createElement('div');
    warningContent.style.cssText = `
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border: 2px solid #f59e0b; border-radius: 16px; padding: 32px;
      text-align: center; color: #f1f5f9; font-family: system-ui, sans-serif;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3); backdrop-filter: blur(10px);
      max-width: 400px; width: 90%;
    `;
    warningContent.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #f59e0b;">
        Acceso de Campaña Inválido
      </div>
      <div style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
        Por favor contacta a tu administrador para obtener el enlace correcto de la campaña.
      </div>
    `;
    
    warningDiv.appendChild(warningContent);
    document.body.appendChild(warningDiv);
  } else {
    warningDiv.style.display = 'flex';
  }
  
  debugLog('Campaign warning displayed');
}

function hideCampaignWarning() {
  const warningDiv = qs('campaignWarning');
  if (warningDiv) {
    warningDiv.style.display = 'none';
  }
}

function showForm() {
  const formSection = qs('formSection');
  if (formSection) {
    formSection.style.display = 'block';
  }
  hideCampaignWarning();
  debugLog('Form displayed');
}

/***********************************
 *  Duplicate Submission Check
 ***********************************/
async function checkDuplicateSubmission(email, campaign) {
  if (!email || !campaign) {
    debugLog('Missing email or campaign for duplicate check');
    return { isDuplicate: false };
  }
  
  try {
    debugLog('Checking for duplicate submission:', { email, campaign });
    
    // Create filter formula for Airtable
    const filterFormula = `AND({Email} = "${email}", {Campaign} = "${campaign}")`;
    const endpoint = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${encodeURIComponent(CONFIG.AIRTABLE_TABLE_NAME)}?filterByFormula=${encodeURIComponent(filterFormula)}`;
    
    debugLog('Duplicate check endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      debugLog('Duplicate check failed:', response.status, response.statusText);
      return { isDuplicate: false, error: 'Unable to verify eligibility' };
    }
    
    const data = await response.json();
    const isDuplicate = data.records && data.records.length > 0;
    
    debugLog('Duplicate check result:', { isDuplicate, recordCount: data.records?.length || 0 });
    
    if (isDuplicate) {
      const existingRecord = data.records[0];
      return {
        isDuplicate: true,
        existingRecord: existingRecord,
        message: `Ya has participado en la campaña ${campaign.toUpperCase()}`
      };
    }
    
    return { isDuplicate: false };
    
  } catch (error) {
    debugLog('Duplicate check error:', error);
    return { isDuplicate: false, error: 'Unable to verify eligibility' };
  }
}

/***********************************
 *  Email Verification Functions
 ***********************************/
async function verifyEmail(email) {
  const result = {
    isValid: false,
    correctedEmail: email,
    reason: '',
    confidence: 0,
    suggestions: [],
    requiresVerification: true
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

  result.isValid = true;
  result.confidence = 80;
  result.reason = 'Email válido — requiere verificación';
  result.requiresVerification = true;
  return result;
}

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
    try { data = JSON.parse(raw); } catch {}
    
    if (!res.ok || data?.success === false) {
      return { success: false, error: data?.details || data?.error || `HTTP ${res.status}` };
    }
    
    return { success: true, verificationId: data.verificationId, expiresAt: data.expiresAt };
  } catch (error) {
    debugLog('Send verification code error:', error);
    return { success: false, error: 'No se pudo enviar el código de verificación' };
  }
}

async function verifyCode(verificationId, code) {
  try {
    const res = await fetch(CONFIG.EMAIL_VERIFICATION_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify-code', verificationId, code }),
    });

    const txt = await res.text();
    let data = {};
    try { data = JSON.parse(txt); } catch {}

    if (!res.ok) {
      return { success: false, error: data?.error || `HTTP ${res.status}` };
    }

    return {
      success: !!data.valid,
      error: data.valid ? null : (data?.error || 'Código incorrecto'),
    };
  } catch (error) {
    debugLog('Verify code error:', error);
    return { success: false, error: 'Error al verificar el código' };
  }
}

/***********************************
 *  OTP UI Functions
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

  if (!state.emailVerification.verificationId) {
    doSend();
  }
}

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
    state.emailVerification.isVerified = true;
    state.validationState.emailVerification = true;
    state.validationState.email = true;
    
    if (msg) {
      msg.className = 'otp-msg ok';
      msg.textContent = '¡Código verificado!';
    }
    
    updateFieldUI('email', true, '¡Email verificado!', 'success');
    
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
    
    const inputs = [...document.querySelectorAll('.otp-input')];
    const emptyInput = inputs.find(i => !i.value);
    (emptyInput || inputs[inputs.length - 1])?.focus();
  }
}

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
 *  Field Validation
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
          if (state.emailVerification.isRequired) {
            isValid = state.emailVerification.isVerified;
            message = isValid ? '¡Email verificado!' : 'Requiere verificación por código';
            messageType = isValid ? 'success' : 'error';
          } else {
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
  return isValid;
}

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
  
  group.classList.remove('success', 'error');
  messageEl.classList.remove('success', 'error', 'show');
  
  if (message) {
    group.classList.add(messageType);
    messageEl.classList.add(messageType, 'show');
    messageText.textContent = message;
    
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
 *  Prize System
 ***********************************/
function showRoulette() {
  const overlay = qs('rouletteOverlay');
  const resultPopup = qs('resultPopup');
  const claimButton = qs('claimButton');
  const prizeGrid = qs('prizeGrid');
  
  if (overlay) {
    overlay.style.display = 'flex';
    
    // Reset state
    if (resultPopup) resultPopup.style.display = 'none';
    if (claimButton) {
      claimButton.style.display = 'block';
      claimButton.disabled = false;
      claimButton.textContent = '🎲 ¡GIRA LA RULETA! 🎲';
    }
    if (prizeGrid) prizeGrid.style.display = 'grid';
    
    // Clear previous selections
    document.querySelectorAll('.prize-box').forEach(box => {
      box.classList.remove('highlighted', 'winning');
    });
  }
}

function hideRoulette() {
  const overlay = qs('rouletteOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

let isSelecting = false;
let selectionInterval = null;

function startPrizeSelection() {
  if (isSelecting || state.prize.claimed) return;
  
  isSelecting = true;
  const claimButton = qs('claimButton');
  const prizeBoxes = document.querySelectorAll('.prize-box');
  
  if (claimButton) {
    claimButton.disabled = true;
    claimButton.classList.add('selecting');
    claimButton.textContent = '🎰 SELECCIONANDO... 🎰';
  }
  
  // Clear previous highlights
  prizeBoxes.forEach(box => {
    box.classList.remove('highlighted', 'winning');
  });
  
  // Start random highlighting
  let currentHighlight = 0;
  const totalBoxes = prizeBoxes.length;
  
  selectionInterval = setInterval(() => {
    // Remove previous highlight
    prizeBoxes.forEach(box => box.classList.remove('highlighted'));
    
    // Add new highlight
    prizeBoxes[currentHighlight].classList.add('highlighted');
    
    // Play tick sound
    playTickSound();
    
    // Move to next box
    currentHighlight = (currentHighlight + 1) % totalBoxes;
  }, 150);
  
  // Stop after 5 seconds and select winner
  setTimeout(() => {
    stopPrizeSelection();
  }, 5000);
}

function stopPrizeSelection() {
  if (!isSelecting) return;
  
  clearInterval(selectionInterval);
  isSelecting = false;
  
  const prizeBoxes = document.querySelectorAll('.prize-box');
  
  // Select random winner
  const winningIndex = Math.floor(Math.random() * prizeBoxes.length);
  const winningBox = prizeBoxes[winningIndex];
  const winningPrizeId = winningBox.getAttribute('data-prize');
  
  // Find the prize object
  const winningPrize = PRIZES.find(p => p.id === winningPrizeId);
  
  if (winningPrize) {
    state.prize.selected = winningPrize;
    state.prize.claimed = true;
    
    // Clear all highlights and mark winner
    prizeBoxes.forEach(box => {
      box.classList.remove('highlighted');
    });
    
    winningBox.classList.add('winning');
    
    // Play win sound
    playWinSound();
    
    // Show result
    setTimeout(() => {
      showPrizeResult(winningPrize);
    }, 1000);
    
    debugLog('Prize selected:', winningPrize);
  }
}

function showPrizeResult(prize) {
  const resultPopup = qs('resultPopup');
  const resultIcon = qs('resultIcon');
  const resultTitle = qs('resultTitle');
  const resultDescription = qs('resultDescription');
  const claimButton = qs('claimButton');
  const prizeGrid = qs('prizeGrid');
  
  if (resultPopup && resultIcon && resultTitle && resultDescription) {
    resultIcon.textContent = prize.icon;
    resultTitle.textContent = '¡FELICITACIONES!';
    resultDescription.innerHTML = `
      <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 12px; color: #34c759;">
        ${prize.icon} ${prize.name}
      </div>
      <div style="color: rgba(255,255,255,0.8); margin-bottom: 16px;">
        ${prize.description}
      </div>
      <div style="background: rgba(52, 199, 89, 0.1); border: 1px solid rgba(52, 199, 89, 0.3); border-radius: 12px; padding: 16px; margin-top: 16px;">
        <strong>🎉 ¡Premio Ganado!</strong><br>
        Tu premio será procesado automáticamente.
      </div>
    `;
    
    if (claimButton) claimButton.style.display = 'none';
    if (prizeGrid) prizeGrid.style.display = 'none';
    
    resultPopup.style.display = 'block';
    
    // Auto-submit after showing prize
    setTimeout(() => {
      hideRoulette();
      submitForm();
    }, 3000);
  }
}

// Sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTickSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playWinSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
  oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.4);
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.4);
}

/***********************************
 *  Form Submission
 ***********************************/
async function handleSubmit(evt) {
  evt.preventDefault();
  if (state.isSubmitting) return;
  
  // Validate all fields
  const okName = await validateField('fullName');
  const okEmail = await validateField('email');
  const okPhone = await validateField('phone');
  const okAge = await validateField('ageVerification');
  
  // Check email verification
  if (state.emailVerification.isRequired && !state.emailVerification.isVerified) {
    showError('Por favor verifica tu email antes de continuar');
    const firstOtpInput = document.querySelector('.otp-input');
    if (firstOtpInput) firstOtpInput.focus();
    return;
  }
  
  if (!okName || !okEmail || !okPhone || !okAge) {
    if (!okName) qs('fullName').focus();
    else if (!okEmail) qs('email').focus();
    else if (!okPhone) qs('phone').focus();
    else if (!okAge) qs('ageVerification').focus();
    return;
  }
  
  // Check for duplicate submission before proceeding to roulette
  const email = qs('email').value.trim();
  const campaign = state.trackingData.campaign;
  
  if (!campaign) {
    showError('Error: No se pudo identificar la campaña');
    return;
  }
  
  debugLog('Checking duplicate submission before roulette...');
  toggleLoading(true);
  
  try {
    const duplicateCheck = await checkDuplicateSubmission(email, campaign);
    
    if (duplicateCheck.error) {
      showError(duplicateCheck.error);
      return;
    }
    
    if (duplicateCheck.isDuplicate) {
      showError(duplicateCheck.message);
      debugLog('Duplicate submission blocked:', duplicateCheck);
      return;
    }
    
    debugLog('No duplicate found, proceeding to roulette');
    
    // Show roulette for prize selection
    showRoulette();
    
  } catch (error) {
    console.error('Duplicate check error:', error);
    showError('Error al verificar elegibilidad. Intenta de nuevo.');
  } finally {
    toggleLoading(false);
  }
}

async function submitForm() {
  if (state.isSubmitting) return;
  
  // Collect form data
  state.formData = {
    fullName: qs('fullName').value.trim(),
    email: qs('email').value.trim(),
    phone: `${qs('countryCode').value} ${qs('phone').value.replace(/\D/g, '')}`,
    ageVerification: qs('ageVerification').checked,
    promoConsent: qs('promoConsent').checked,
    emailVerified: state.emailVerification.isVerified,
    prize: state.prize.selected,
  };
  
  debugLog('Form data:', state.formData);
  toggleLoading(true);
  
  try {
    await submitToAirtable();
    debugLog('Submission successful');
    showSuccessWithPrize();
  } catch (error) {
    console.error('Submission error:', error);
    showError('Algo salió mal. Por favor intenta de nuevo.');
  } finally {
    toggleLoading(false);
  }
}

async function submitToAirtable() {
  debugLog('=== AIRTABLE SUBMISSION DEBUG ===');
  debugLog('Base ID:', CONFIG.AIRTABLE_BASE_ID);
  debugLog('Table Name:', CONFIG.AIRTABLE_TABLE_NAME);
  debugLog('API Key (first 10 chars):', CONFIG.AIRTABLE_API_KEY.substring(0, 10) + '...');
  
  // Debug form data
  debugLog('Raw form data:', state.formData);
  debugLog('Raw geo data:', state.geoData);
  debugLog('Raw tracking data:', state.trackingData);
  debugLog('Prize data:', state.formData.prize);
  
  const record = {
    'Full Name': state.formData.fullName,
    'Email': state.formData.email,
    'Phone Number': state.formData.phone,
    'Age Verification': state.formData.ageVerification ? 'Yes' : 'No',
    'Promotional Consent': state.formData.promoConsent ? 'Yes' : 'No',
    'Email Verified': state.formData.emailVerified ? 'Yes' : 'No',
    'Prize Won': state.formData.prize ? state.formData.prize.name : '',
    'Prize ID': state.formData.prize ? state.formData.prize.id : '',
    'Prize Description': state.formData.prize ? state.formData.prize.description : '',
    'Click ID': state.trackingData.clickid || state.trackingData.payload || '',
    'Campaign': state.trackingData.campaign || state.trackingData.promo || '',
    'Source': state.trackingData.source || state.trackingData.influencer || '',
    'IP Address': state.geoData.ip || '',
    'Country': state.geoData.country || '',
    'City': state.geoData.city || '',
    'User Agent': state.geoData.userAgent || '',
    'Language': state.geoData.language || '',
    'Timestamp': new Date().toLocaleString('en-CA', { 
      timeZone: 'America/Santiago', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    }).replace(',', ''),
  };
  
  // Debug each field
  debugLog('=== RECORD FIELDS DEBUG ===');
  Object.entries(record).forEach(([key, value]) => {
    debugLog(`Field "${key}":`, typeof value, '|', value);
  });
  
  const payload = { records: [{ fields: record }], typecast: true };
  debugLog('=== FULL PAYLOAD ===');
  debugLog('Payload:', JSON.stringify(payload, null, 2));

  const endpoint = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${encodeURIComponent(CONFIG.AIRTABLE_TABLE_NAME)}`;
  debugLog('=== REQUEST DEBUG ===');
  debugLog('Endpoint URL:', endpoint);
  debugLog('Request method: POST');
  debugLog('Headers:', {
    'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY.substring(0, 10)}...`,
    'Content-Type': 'application/json'
  });
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    debugLog('=== RESPONSE DEBUG ===');
    debugLog('Response status:', response.status);
    debugLog('Response status text:', response.statusText);
    debugLog('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Get response text first
    const responseText = await response.text();
    debugLog('Raw response text:', responseText);
    
    let errorData = {};
    try {
      errorData = JSON.parse(responseText);
      debugLog('Parsed response data:', errorData);
    } catch (parseError) {
      debugLog('Failed to parse response as JSON:', parseError.message);
      errorData = { rawResponse: responseText };
    }
    
    if (!response.ok) {
      debugLog('=== ERROR DETAILS ===');
      debugLog('Status:', response.status);
      debugLog('Status Text:', response.statusText);
      debugLog('Error Data:', errorData);
      
      // Check for specific Airtable error patterns
      if (errorData.error) {
        debugLog('Airtable Error Object:', errorData.error);
        if (errorData.error.type) debugLog('Error Type:', errorData.error.type);
        if (errorData.error.message) debugLog('Error Message:', errorData.error.message);
      }
      
      throw new Error(`Airtable HTTP ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    debugLog('=== SUCCESS ===');
    debugLog('Airtable response:', errorData);
    return errorData;
    
  } catch (networkError) {
    debugLog('=== NETWORK ERROR ===');
    debugLog('Network error:', networkError);
    debugLog('Error name:', networkError.name);
    debugLog('Error message:', networkError.message);
    debugLog('Error stack:', networkError.stack);
    throw networkError;
  }
}

function showSuccessWithPrize() {
  // Hide all existing content
  Array.from(document.body.children).forEach(child => {
    if (child.id !== 'successOverlay') {
      child.style.display = 'none';
    }
  });
  
  // Create elegant success overlay
  let successOverlay = qs('successOverlay');
  if (!successOverlay) {
    successOverlay = document.createElement('div');
    successOverlay.id = 'successOverlay';
    successOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      display: flex; align-items: center; justify-content: center; z-index: 99999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    const successCard = document.createElement('div');
    successCard.style.cssText = `
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9));
      backdrop-filter: blur(20px); border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 24px; padding: 48px 32px; text-align: center; color: #f8fafc;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      max-width: 480px; width: 90%; position: relative; overflow: hidden;
    `;
    
    // Add subtle animated background pattern
    const pattern = document.createElement('div');
    pattern.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23334155" fill-opacity="0.03"><circle cx="30" cy="30" r="2"/></g></svg>');
      animation: subtle-float 20s infinite linear; pointer-events: none;
    `;
    
    const prize = state.formData.prize;
    successCard.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="font-size: 72px; margin-bottom: 16px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
          ${prize ? prize.icon : '🎉'}
        </div>
        <div style="height: 2px; width: 60px; background: linear-gradient(90deg, #fbbf24, #f59e0b); margin: 0 auto; border-radius: 1px;"></div>
      </div>
      
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 8px; background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        ¡Felicitaciones!
      </h1>
      
      <p style="font-size: 18px; font-weight: 600; margin-bottom: 24px; color: #e2e8f0;">
        Has ganado ${prize ? prize.name : 'un premio increíble'}
      </p>
      
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(71, 85, 105, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
          Detalles del Premio
        </p>
        <p style="font-size: 16px; color: #cbd5e1; line-height: 1.5; margin: 0;">
          ${prize ? prize.description : 'Tu premio será procesado automáticamente.'}
        </p>
      </div>
    `;
    
    successCard.insertBefore(pattern, successCard.firstChild);
    successOverlay.appendChild(successCard);
    document.body.appendChild(successOverlay);
    
    // Add floating animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes subtle-float {
        0% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(180deg); }
        100% { transform: translateY(0px) rotate(360deg); }
      }
      @keyframes prize-glow {
        0%, 100% { filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3)); }
        50% { filter: drop-shadow(0 6px 16px rgba(245, 158, 11, 0.6)); }
      }
    `;
    document.head.appendChild(style);
    
    // Animate the prize icon
    const prizeIcon = successCard.querySelector('div[style*="font-size: 72px"]');
    if (prizeIcon) {
      prizeIcon.style.animation = 'prize-glow 2s ease-in-out infinite';
    }
  } else {
    successOverlay.style.display = 'flex';
  }
  
  // Trigger confetti after a delay
  setTimeout(() => {
    triggerConfetti();
  }, 500);
  
  debugLog('Elegant success page displayed with prize:', state.formData.prize);
}

function triggerConfetti() {
  const confettiElements = document.querySelectorAll('.confetti');
  confettiElements.forEach((confetti, index) => {
    confetti.style.animationDelay = `${index * 0.3}s`;
    confetti.style.animationDuration = `${3 + Math.random() * 2}s`;
  });
}

// Social sharing functions
function shareToWhatsApp() {
  const prize = state.formData.prize ? state.formData.prize.name : 'un premio increíble';
  const text = `¡Acabo de ganar ${prize} en el Sorteo VIP Exclusivo! 🎉🎰`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function shareToTwitter() {
  const prize = state.formData.prize ? state.formData.prize.name : 'un premio increíble';
  const text = `¡Acabo de ganar ${prize} en el Sorteo VIP Exclusivo! 🎉🎰 #Ganador #SorteoVIP`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function showError(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; background: #e53e3e; color: #fff;
    padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.15);
    z-index: 10000; animation: slideInRight .3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

/***********************************
 *  Tracking & Geo - Source capture included
 ***********************************/
function initializeTracking() {
  const p = new URLSearchParams(location.search);
  const clickid = p.get('clickid') || p.get('payload') || '';
  const campaign = p.get('campaign') || '';
  const source = p.get('source') || p.get('influencer') || p.get('src') || '';
  const promo = p.get('promo') || '';

  state.trackingData = {
    clickid,
    campaign,
    source,
    promo,
    influencer: p.get('influencer') || '',
    payload: p.get('payload') || '',
    timestamp: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
  };

  debugLog('Tracking data captured:', state.trackingData);
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
      debugLog('Geo:', state.geoData); 
      return;
    }
  } catch (e) { 
    debugLog('Geo fetch failed:', e); 
  }
  
  state.geoData = { 
    userAgent: navigator.userAgent, 
    language: navigator.language || '', 
    platform: navigator.platform || '' 
  };
}

/***********************************
 *  Theme Loading - Campaign priority
 ***********************************/
function resolveThemeKeyFromUrl() {
  const p = new URLSearchParams(location.search);
  for (const k of THEME_CONFIG.urlParams) {
    const v = (p.get(k) || '').trim().toLowerCase();
    if (v) {
      debugLog(`Theme resolved from URL param '${k}':`, v);
      return v;
    }
  }
  debugLog('No theme found in URL, using default:', THEME_CONFIG.defaultKey);
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
  if (!THEME_CONFIG.enabled) {
    debugLog('Theme loading disabled');
    return;
  }
  
  const rawKey = resolveThemeKeyFromUrl();
  const themeKey = sanitizeThemeKey(rawKey);
  const trySrc = `${THEME_CONFIG.basePath}/${themeKey}.js`;

  debugLog('Loading theme:', { rawKey, themeKey, trySrc });
  
  const result = await loadScript(trySrc);
  if (!result.ok) { 
    debugLog('Theme file not found:', trySrc);
    // No fallback - show campaign warning if theme doesn't exist
    showCampaignWarning();
    return;
  }

  debugLog('Theme loaded successfully:', trySrc);

  let theme = (window.ThemeRegistry && window.ThemeRegistry.get && window.ThemeRegistry.get()) || null;
  if (!theme) {
    if (themeKey === 'pinup' && window.PinUpGiveawayTheme?.apply) {
      theme = window.PinUpGiveawayTheme;
      debugLog('Using PinUp theme fallback');
    } else {
      debugLog('No theme found after loading script');
      showCampaignWarning();
      return;
    }
  }

  try { 
    if (theme?.apply) {
      theme.apply();
      debugLog('Theme applied successfully:', themeKey);
    } else {
      debugLog('No theme apply function found');
      showCampaignWarning();
    }
  } catch (e) { 
    debugLog('Theme apply failed:', e);
    showCampaignWarning();
  }
}

/***********************************
 *  Initialization
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

  // Event listeners
  nameEl.addEventListener('blur', () => validateField('fullName'));
  nameEl.addEventListener('input', () => {
    if (state.validationState.fullName) validateField('fullName');
  });

  emailEl.addEventListener('blur', async () => await validateField('email'));
  emailEl.addEventListener('input', async () => {
    if (state.validationState.email) await validateField('email');
  });

  phoneEl.addEventListener('blur', () => validateField('phone'));
  phoneEl.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    if (state.validationState.phone) validateField('phone');
  });

  countryEl.addEventListener('change', () => {
    if (qs('phone').value) validateField('phone');
  });

  ageVerificationEl.addEventListener('change', () => {
    validateField('ageVerification');
  });

  debugLog('Validation initialized');
}

function initializeForm() {
  const form = qs('giveawayForm');
  if (!form) {
    debugLog('Giveaway form not found');
    return;
  }
  
  form.addEventListener('submit', handleSubmit);
  
  // Prize system event listeners
  const claimButton = qs('claimButton');
  const closeButton = qs('closeRoulette');
  
  if (claimButton) {
    claimButton.addEventListener('click', startPrizeSelection);
  }
  
  if (closeButton) {
    closeButton.addEventListener('click', hideRoulette);
  }
  
  debugLog('Form initialized');
}

// Inject styles for OTP and animations
(function injectStyles() {
  if (document.getElementById('giveaway-styles')) return;
  
  const css = `
    .otp-card {
      margin-top: 12px; background: rgba(255,255,255,.05); backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 14px;
      display: flex; flex-direction: column; gap: 8px;
    }
    
    .otp-head { display: flex; flex-direction: column; gap: 4px; align-items: center; text-align: center; }
    .otp-title { font-weight: 700; font-size: 14px; color: #e5e7eb; }
    .otp-to { font-size: 12px; color: #9ca3af; }
    
    .otp-inputs { display: flex; gap: 10px; justify-content: center; margin: 6px 0; }
    .otp-input {
      width: 44px; height: 44px; border-radius: 10px; background: rgba(0,0,0,.25) !important;
      border: 1px solid rgba(255,255,255,.08); outline: none; text-align: center;
      font-size: 18px; color: #e5e7eb; transition: transform .08s ease;
    }
    .otp-input:focus {
      transform: scale(1.03); border-color: #22d3ee;
      box-shadow: 0 0 0 2px rgba(34,211,238,.25);
    }
    
    .otp-actions { display: flex; gap: 10px; justify-content: center; }
    .otp-btn {
      appearance: none; border: none; border-radius: 8px; padding: 8px 12px;
      cursor: pointer; font-weight: 600;
    }
    .otp-btn-send { background: #f59e0b; color: #fff; }
    .otp-btn-resend { background: transparent; color: #f59e0b; border: 1px solid rgba(245,158,11,.6); }
    .otp-btn[disabled] { opacity: .6; cursor: not-allowed; }
    
    .otp-msg { display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 12px; margin-top: 4px; }
    .otp-msg.ok { color: #34d399; }
    .otp-msg.err { color: #f87171; }
    
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  `;
  
  const style = document.createElement('style');
  style.id = 'giveaway-styles';
  style.textContent = css;
  document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', async () => {
  debugLog('Initializing giveaway form...');
  
  // Initialize tracking first to get campaign data
  initializeTracking();
  
  // Validate campaign before proceeding
  if (!validateCampaign()) {
    debugLog('Invalid campaign detected, showing warning');
    showCampaignWarning();
    return; // Stop initialization
  }
  
  debugLog('Valid campaign detected, proceeding with form initialization');
  
  // Load theme only if campaign is valid
  await loadTheme();
  
  // Show the form
  showForm();
  
  setTimeout(() => {
    initializeValidation();
    initializeForm();
    fetchGeoData();
    debugLog('Giveaway form initialized successfully');
  }, 200);
});

// Debug helpers
window.debugGiveaway = function () {
  console.log('=== DEBUG GIVEAWAY ===');
  console.log('State:', state);
  console.log('Tracking Data:', state.trackingData);
  console.log('Geo Data:', state.geoData);
  console.log('Campaign Valid:', state.campaignValid);
  console.log('Prizes:', PRIZES);
};

console.log('=== GIVEAWAY FORM LOADED ===');
console.log('TIP: Use debugGiveaway() to view state');