// File: /themes/todoalrojo.js
// Theme: Todo al Rojo — mirrors PIN‑UP UI; only color, background, and logo differ.
// Usage: add ?campaign=todoalrojo (or ?theme=todoalrojo). Assets required:
//   /assets/todoalrojo-bg.png, /assets/todoalrojo-logo.png (1080x1080)
(function () {
  const RADIUS = 20; // match PIN‑UP roundness

  const TodoAlRojoTheme = {
    config: {
      name: 'todoalrojo',
      logo: '/assets/todoalrojo-logo.png',
      bgImage: '/assets/todoalrojo-bg.png',
      colors: { primary: '#ef4444', inputBgAlpha: 0.55 },
      green: '#01d0a6',
      buttonTop: '#ef4444',
      buttonBottom: '#b91c1c',
    },
    apply() {
      const cfg = this.config;
      ensureFont();
      applyBackground(cfg.bgImage);
      normalizeContainer();
      injectLogo(cfg.logo); // center & larger
      styleForm(cfg);
      injectDynamicCss(cfg);
      setDefaultPhoneCountry('+56');
    },
  };

  function ensureFont() {
    if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Montserrat"]')) {
      const font = document.createElement('link');
      font.rel = 'stylesheet';
      font.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
      document.head.appendChild(font);
    }
  }

  function applyBackground(url) {
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundSize = 'cover';
    document.querySelectorAll('.bg-decoration').forEach((el) => (el.style.display = 'none'));
  }

  function normalizeContainer() {
    const container = document.querySelector('.container');
    if (!container) return;
    container.className = 'container relative z-10 w-full mx-auto';
    container.style.maxWidth = '480px';
    container.style.width = '100%';

    if (container.querySelector('.tar-card')) return;
    const card = document.createElement('div');
    card.className = 'tar-card';
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.style.padding = '24px 24px 18px';
    card.style.borderRadius = RADIUS + 'px';
    card.style.background = 'linear-gradient(to bottom, rgba(42,48,60,0.58), rgba(11,12,16,0.58))';
    card.style.backdropFilter = 'blur(16px) saturate(140%)';
    card.style.webkitBackdropFilter = 'blur(16px) saturate(140%)';
    card.style.border = '1px solid rgba(255,255,255,0.10)';
    card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';

    const gloss = document.createElement('div');
    gloss.style.position = 'absolute'; gloss.style.left = '0'; gloss.style.right = '0'; gloss.style.top = '0';
    gloss.style.height = '64px';
    gloss.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0))';
    gloss.style.pointerEvents = 'none';
    card.appendChild(gloss);

    while (container.firstChild) card.appendChild(container.firstChild);
    container.appendChild(card);
  }

  function injectLogo(src) {
    const holder = document.querySelector('.logo');
    if (!holder) return;
    // Ensure visibility and center alignment
    holder.className = 'tar-logo';
    holder.style.display = 'flex';
    holder.style.alignItems = 'center';
    holder.style.justifyContent = 'center';
    holder.style.width = '100%';
    // Double the logo size from 72px to 144px
    holder.style.height = '144px';
    holder.style.margin = '8px auto 12px';
    holder.innerHTML = `<img src="${src}" alt="TODOALROJO" class="tar-logo-img" />`;

    if (!document.getElementById('tar-logo-css')) {
      const s = document.createElement('style');
      s.id = 'tar-logo-css';
      s.textContent = `
        .tar-logo-img { display:block; height:100%; width:auto; object-fit:contain; }
        @media (max-width: 480px){ .tar-logo{ height:120px; margin:6px auto 10px; } }
      `;
      document.head.appendChild(s);
    }
  }

  function styleForm(cfg) {
    const header = document.querySelector('.header');
    if (header) {
      header.className = 'header text-center mb-4';
      const h1 = header.querySelector('h1'); if (h1) h1.style.color = '#ffffff';
    }

    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
      input.className = 'w-full px-4 py-3 text-white placeholder-gray-400 transition-all';
      input.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
      input.style.backdropFilter = 'blur(6px)';
      input.style.border = `2px solid ${cfg.colors.primary}`;
      input.style.borderRadius = RADIUS + 'px';
      input.style.paddingLeft = '1rem';
    });

    document.querySelectorAll('select').forEach((select) => {
      select.className = 'w-full px-4 py-3 text-white transition-all appearance-none cursor-pointer';
      select.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
      select.style.backdropFilter = 'blur(6px)';
      select.style.border = `2px solid ${cfg.colors.primary}`;
      select.style.borderRadius = RADIUS + 'px';
      select.style.paddingRight = '2.25rem';
    });

    document.querySelectorAll('.input-icon').forEach((icon) => (icon.style.display = 'none'));

    const phoneContainer = document.querySelector('.phone-container');
    if (phoneContainer) {
      phoneContainer.className = 'phone-container flex gap-2';
      const phoneSelect = phoneContainer.querySelector('select');
      const phoneInput = phoneContainer.querySelector('input[type="tel"]');
      
      if (phoneSelect) {
        phoneSelect.className = 'flex-shrink-0 w-36 px-3 py-3 text-white text-sm appearance-none cursor-pointer';
        phoneSelect.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
        phoneSelect.style.border = `2px solid ${cfg.colors.primary}`;
        phoneSelect.style.borderRadius = RADIUS + 'px';
        phoneSelect.style.height = '48px'; // Match input height
      }
      
      if (phoneInput) {
        phoneInput.style.height = '48px'; // Ensure equal height
        phoneInput.style.flex = '1'; // Take remaining space
      }
    }

    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.className = 'submit-btn w-full font-semibold py-3 px-6 transition-all transform uppercase shadow-lg tracking-wide';
      submitBtn.style.background = `linear-gradient(to bottom, ${cfg.buttonTop}, ${cfg.buttonBottom})`;
      submitBtn.style.borderRadius = RADIUS + 'px';
      submitBtn.style.border = '2px solid transparent';
      submitBtn.style.color = '#ffffff';
    }
  }

  function injectDynamicCss(cfg) {
    let style = document.getElementById('tar-dynamic');
    if (!style) { style = document.createElement('style'); style.id = 'tar-dynamic'; document.head.appendChild(style); }
    style.textContent = `
      .form-group.success input, .form-group.success select { border-color: ${cfg.green} !important; }
      .form-group.error input, .form-group.error select { border-color: ${cfg.colors.primary} !important; }
      .submit-btn, .submit-btn * { color: #ffffff !important; }
      
      /* Phone dropdown styling to match PIN-UP */
      .phone-container select {
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
      }
    `;
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
