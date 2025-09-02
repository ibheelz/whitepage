// File: /themes/todoalrojo.js
// Theme: Todo al Rojo — mirrors PIN‑UP UI; only color, background, logo, and global font differ.
// Usage: add ?campaign=todoalrojo (or ?theme=todoalrojo). Assets:
//   /assets/todoalrojo-bg.png, /assets/todoalrojo-logo.png (1080x1080)
(function () {
  const RADIUS = 20;
  const CHEVRON_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M7 10l5 5 5-5'/%3E%3C/svg%3E\")";

  const TodoAlRojoTheme = {
    config: {
      name: 'todoalrojo',
      logo: '/assets/todoalrojo-logo.png',
      bgImage: '/assets/todoalrojo-bg.png',
      colors: { primary: '#ef4444', inputBgAlpha: 0.55 },
      green: '#01d0a6',
      greenDark: '#0e8477',
      buttonTop: '#ef4444',
      buttonBottom: '#b91c1c',
      logoHeightDesktop: 150, // large logo but same spacing as PIN‑UP
      logoHeightMobile: 110,
    },
    apply() {
      const cfg = this.config;
      ensureMontserratEverywhere();
      applyBackground(cfg.bgImage);
      ensureGlassStyles();
      normalizeContainer();
      injectLogo(cfg.logo, cfg); // spacing identical to PIN‑UP (mb-6)
      styleForm(cfg);
      injectDynamicCss(cfg);
      setDefaultPhoneCountry('+56');
    },
  };

  function ensureMontserratEverywhere() {
    if (!document.querySelector("link[data-tar='preconnect-gfonts']")) {
      const l1 = document.createElement('link'); l1.rel = 'preconnect'; l1.href = 'https://fonts.googleapis.com'; l1.setAttribute('data-tar','preconnect-gfonts'); document.head.appendChild(l1);
      const l2 = document.createElement('link'); l2.rel = 'preconnect'; l2.href = 'https://fonts.gstatic.com'; l2.crossOrigin = 'anonymous'; l2.setAttribute('data-tar','preconnect-gfonts'); document.head.appendChild(l2);
    }
    if (!document.querySelector("link[href*='fonts.googleapis.com'][href*='Montserrat']")) {
      const font = document.createElement('link');
      font.rel = 'stylesheet';
      font.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
      document.head.appendChild(font);
    }
    const FAMILY = "'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    document.body.style.fontFamily = FAMILY;
    if (!document.getElementById('tar-font-global')) {
      const s = document.createElement('style'); s.id = 'tar-font-global';
      s.textContent = `
        :root{ --tar-font:${FAMILY}; }
        .tar-skin, .tar-skin *:not(svg):not(path):not(i) { font-family: var(--tar-font) !important; }
        input::placeholder, textarea::placeholder { font-family: var(--tar-font) !important; }
      `; document.head.appendChild(s);
    }
  }

  function applyBackground(url) {
    document.body.style.background = `url('${url}') no-repeat center center fixed`;
    document.body.style.backgroundSize = 'cover';
    document.querySelectorAll('.bg-decoration').forEach((el) => (el.style.display = 'none'));
  }

  // === Glass styles & spacing cloned from PIN‑UP ===
  function ensureGlassStyles() {
    if (document.getElementById('tar-glass-styles')) return;
    const s = document.createElement('style'); s.id = 'tar-glass-styles';
    s.textContent = `
      .glass-edge { position:absolute; inset:0; border-radius:${RADIUS}px; pointer-events:none; }
      .glass-edge::before { content:''; position:absolute; inset:0; padding:2px; border-radius:${RADIUS}px;
        background: linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,.14), rgba(255,255,255,.08), rgba(255,255,255,.18));
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude; }
      .glass-edge::after { content:''; position:absolute; inset:1px; border-radius:${RADIUS-1}px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1px 0 rgba(0,0,0,.25); }
      .tar-skin { padding: 24px; }
      @media (min-width: 640px) { .tar-skin { padding-left: 32px; padding-right: 32px; } }
      @media (min-width: 768px) { .tar-skin { padding-left: 40px; padding-right: 40px; } }
      .header{margin-bottom:12px!important}
      .form-group{margin-bottom:12px!important}
      label{margin-bottom:6px!important}
      .footer{margin-top:12px!important;padding-top:12px!important}
      .submit-btn{margin-top:12px!important}
    `; document.head.appendChild(s);
  }

  function normalizeContainer() {
    const container = document.querySelector('.container'); if (!container) return;
    container.className = 'relative z-10 w-full mx-auto';
    container.style.maxWidth = '480px'; container.style.width = '100%';

    if (container.querySelector('.tar-skin')) return;
    const card = document.createElement('div'); card.className = 'tar-skin';
    card.style.position = 'relative'; card.style.overflow = 'hidden';
    card.style.background = 'linear-gradient(to bottom, rgba(42,48,60,0.65), rgba(11,12,16,0.65))';
    card.style.backdropFilter = 'blur(16px) saturate(140%)'; card.style.webkitBackdropFilter = 'blur(16px) saturate(140%)';
    card.style.border = '1px solid rgba(255,255,255,0.08)'; card.style.borderRadius = RADIUS + 'px';
    card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';

    const gloss = document.createElement('div');
    gloss.style.position = 'absolute'; gloss.style.top = '0'; gloss.style.left = '0'; gloss.style.right = '0'; gloss.style.height = '64px';
    gloss.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0))'; gloss.style.pointerEvents = 'none';
    gloss.style.borderTopLeftRadius = gloss.style.borderTopRightRadius = (RADIUS - 1) + 'px'; card.appendChild(gloss);

    const edge = document.createElement('div'); edge.className = 'glass-edge'; card.appendChild(edge);

    while (container.firstChild) card.appendChild(container.firstChild);
    container.appendChild(card);
  }

  function injectLogo(src, cfg) {
    const holder = document.querySelector('.logo'); if (!holder) return;
    holder.className = 'tar-logo';
    holder.style.display = 'flex'; holder.style.alignItems = 'center'; holder.style.justifyContent = 'center';
    holder.style.width = '100%'; holder.style.height = cfg.logoHeightDesktop + 'px';
    holder.style.margin = '0 auto 24px'; // == mb-6 (same as PIN‑UP)
    holder.innerHTML = `<img src="${src}" alt="TODOALROJO" class="tar-logo-img" loading="eager" />`;

    if (!document.getElementById('tar-logo-css')) {
      const s = document.createElement('style'); s.id = 'tar-logo-css';
      s.textContent = `
        .tar-logo-img { display:block; height:100%; width:auto; object-fit:contain; }
        @media (max-width: 480px){ .tar-logo{ height:${cfg.logoHeightMobile}px; margin:0 auto 24px; } }
      `; document.head.appendChild(s);
    }
  }

  function styleForm(cfg) {
    const h1 = document.querySelector('.header h1'); if (h1) { h1.className = 'text-2xl font-bold mb-2 tracking-tight'; h1.style.color = '#ffffff'; }
    const headerP = document.querySelector('.header p'); if (headerP) headerP.className = 'text-gray-400 text-sm mb-4';

    document.querySelectorAll('label').forEach((label) => { label.className = 'block text-white font-semibold mb-2 text-sm'; });
    document.querySelectorAll('.required').forEach((req) => { req.style.color = cfg.colors.primary; req.classList.add('ml-1'); });

    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
      input.className = 'w-full px-4 py-3 text-white placeholder-gray-400 transition-all';
      input.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
      input.style.backdropFilter = 'blur(6px)';
      input.style.border = `2px solid ${cfg.colors.primary}`;
      input.style.borderRadius = RADIUS + 'px';
    });

    document.querySelectorAll('select').forEach((select) => {
      select.className = 'w-full px-4 py-3 text-white transition-all appearance-none cursor-pointer';
      select.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
      select.style.backdropFilter = 'blur(6px)';
      select.style.border = `2px solid ${cfg.colors.primary}`;
      select.style.borderRadius = RADIUS + 'px';
      select.style.backgroundImage = CHEVRON_BG;
      select.style.backgroundPosition = 'right 0.75rem center';
      select.style.backgroundRepeat = 'no-repeat';
      select.style.backgroundSize = '1.25em 1.25em';
      select.style.paddingRight = '2.25rem';
    });

    document.querySelectorAll('.input-icon').forEach((icon) => (icon.style.display = 'none'));
    document.querySelectorAll('input').forEach((input) => { if (input.style.paddingLeft) input.style.paddingLeft = '1rem'; });

    const phoneContainer = document.querySelector('.phone-container');
    if (phoneContainer) {
      phoneContainer.className = 'flex gap-2';
      const phoneSelect = phoneContainer.querySelector('select');
      const phoneInputWrapper = phoneContainer.querySelector('.input-wrapper');
      if (phoneSelect) {
        phoneSelect.className = 'flex-shrink-0 w-36 px-3 py-3 text-white text-sm appearance-none cursor-pointer';
        phoneSelect.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
        phoneSelect.style.backdropFilter = 'blur(6px)';
        phoneSelect.style.border = `2px solid ${cfg.colors.primary}`;
        phoneSelect.style.borderRadius = RADIUS + 'px';
      }
      if (phoneInputWrapper) phoneInputWrapper.className = 'flex-1';
    }

    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.className = 'submit-btn w-full text-white font-bold py-4 px-6 transition-all transform uppercase shadow-lg tracking-wide';
      submitBtn.style.background = `linear-gradient(to bottom, ${cfg.buttonTop}, ${cfg.buttonBottom})`;
      submitBtn.style.borderRadius = RADIUS + 'px';
      submitBtn.style.border = '2px solid transparent';
    }

    // Footer text
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.className = 'mt-6 pt-4';
      const footerP = footer.querySelector('p');
      if (footerP) { footerP.className = 'text-gray-400 text-xs text-center'; }
    }
  }

  function injectDynamicCss(cfg) {
    if (document.getElementById('tar-dynamic-styles')) return;
    const style = document.createElement('style'); style.id = 'tar-dynamic-styles';
    style.textContent = `
      .tar-skin input, .tar-skin select { border-width: 2px; border-radius: ${RADIUS}px; }
      .form-group.success input, .form-group.success select { border-color: ${cfg.green} !important; }
      .form-group.error input, .form-group.error select { border-color: ${cfg.colors.primary} !important; }
      .header h1 { color: #fff !important; }
      .submit-btn { border-radius: ${RADIUS}px !important; border-width: 2px !important; }
    `; document.head.appendChild(style);
  }

  function setDefaultPhoneCountry(value) {
    const cc = document.getElementById('countryCode');
    if (cc && !cc.value) { cc.value = value; cc.dispatchEvent(new Event('change', { bubbles: true })); }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoAlRojoTheme;
  } else {
    if (window.ThemeRegistry && typeof window.ThemeRegistry.register === 'function') {
      window.ThemeRegistry.register('todoalrojo', TodoAlRojoTheme);
    }
    window.TodoAlRojoTheme = TodoAlRojoTheme;
  }
})();
