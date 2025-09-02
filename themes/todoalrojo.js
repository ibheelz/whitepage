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
      buttonTop: '#ef4444',
      buttonBottom: '#b91c1c',
      logoHeightDesktop: 170,
      logoHeightMobile: 120,
    },
    apply() {
      const cfg = this.config;
      ensureMontserratEverywhere();
      applyBackground(cfg.bgImage);
      normalizeContainer();
      injectLogo(cfg.logo, cfg);
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
      font.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(font);
    }
    const FAMILY = "'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    document.body.style.fontFamily = FAMILY;
    if (!document.getElementById('tar-font-global')) {
      const s = document.createElement('style');
      s.id = 'tar-font-global';
      s.textContent = `
        :root{ --tar-font:${FAMILY}; }
        .tar-card, .tar-card *:not(svg):not(path):not(i) { font-family: var(--tar-font) !important; }
        input::placeholder, textarea::placeholder { font-family: var(--tar-font) !important; }
      `;
      document.head.appendChild(s);
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
    card.style.padding = '8px 24px 14px'; // tighter top/bottom
    card.style.borderRadius = RADIUS + 'px';
    card.style.background = 'linear-gradient(to bottom, rgba(42,48,60,0.58), rgba(11,12,16,0.58))';
    card.style.backdropFilter = 'blur(16px) saturate(140%)';
    card.style.webkitBackdropFilter = 'blur(16px) saturate(140%)';
    card.style.border = '1px solid rgba(255,255,255,0.10)';
    card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';

    const gloss = document.createElement('div');
    gloss.style.position = 'absolute'; gloss.style.left = '0'; gloss.style.right = '0'; gloss.style.top = '0';
    gloss.style.height = '28px'; // smaller gloss area to reduce perceived spacing
    gloss.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0))';
    gloss.style.pointerEvents = 'none';
    card.appendChild(gloss);

    while (container.firstChild) card.appendChild(container.firstChild);
    container.appendChild(card);
  }

  function injectLogo(src, cfg) {
    const holder = document.querySelector('.logo');
    if (!holder) return;
    holder.className = 'tar-logo';
    holder.style.display = 'flex';
    holder.style.alignItems = 'center';
    holder.style.justifyContent = 'center';
    holder.style.width = '100%';
    holder.style.height = cfg.logoHeightDesktop + 'px';
    holder.style.margin = '0 auto 4px'; // minimal space below
    holder.innerHTML = `<img src="${src}" alt="TODOALROJO" class="tar-logo-img" loading="eager" />`;

    if (!document.getElementById('tar-logo-css')) {
      const s = document.createElement('style');
      s.id = 'tar-logo-css';
      s.textContent = `
        .tar-logo-img { display:block; height:100%; width:auto; object-fit:contain; }
        @media (max-width: 480px){ .tar-logo{ height:${cfg.logoHeightMobile}px; margin:0 auto 4px; } }
      `;
      document.head.appendChild(s);
    }
  }

  function styleForm(cfg) {
    const header = document.querySelector('.header');
    if (header) {
      header.className = 'header text-center';
      header.style.margin = '2px 0 6px'; // very tight under logo
      const h1 = header.querySelector('h1'); if (h1) { h1.style.color = '#ffffff'; h1.style.fontWeight = '800'; h1.style.margin = '6px 0 8px'; }
      const p = header.querySelector('p'); if (p) { p.style.fontWeight = '500'; p.style.margin = '0 0 4px'; }
    }

    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
      input.className = 'w-full px-4 py-3 text-white placeholder-gray-400 transition-all';
      input.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
      input.style.backdropFilter = 'blur(6px)';
      input.style.border = `2px solid ${cfg.colors.primary}`;
      input.style.borderRadius = RADIUS + 'px';
      input.style.paddingLeft = '1rem';
      input.style.fontWeight = '500';
    });

    document.querySelectorAll('select').forEach((select) => {
      select.className = 'w-full px-4 py-3 text-white transition-all cursor-pointer';
      select.style.appearance = 'none';
      select.style.webkitAppearance = 'none';
      select.style.MozAppearance = 'none';
      select.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
      select.style.backdropFilter = 'blur(6px)';
      select.style.border = `2px solid ${cfg.colors.primary}`;
      select.style.borderRadius = RADIUS + 'px';
      select.style.paddingRight = '3rem';
      select.style.backgroundImage = CHEVRON_BG;
      select.style.backgroundRepeat = 'no-repeat';
      select.style.backgroundPosition = 'right 14px center';
      select.style.backgroundSize = '14px 14px';
      select.style.fontWeight = '500';
    });

    document.querySelectorAll('.input-icon').forEach((icon) => (icon.style.display = 'none'));

    const phoneContainer = document.querySelector('.phone-container');
    if (phoneContainer) {
      phoneContainer.className = 'phone-container flex gap-2';
      const phoneSelect = phoneContainer.querySelector('select');
      if (phoneSelect) {
        phoneSelect.className = 'flex-shrink-0 w-36 px-3 py-3 text-white text-sm cursor-pointer';
        phoneSelect.style.appearance = 'none';
        phoneSelect.style.webkitAppearance = 'none';
        phoneSelect.style.MozAppearance = 'none';
        phoneSelect.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
        phoneSelect.style.border = `2px solid ${cfg.colors.primary}`;
        phoneSelect.style.borderRadius = RADIUS + 'px';
        phoneSelect.style.paddingRight = '2.5rem';
        phoneSelect.style.backgroundImage = CHEVRON_BG;
        phoneSelect.style.backgroundRepeat = 'no-repeat';
        phoneSelect.style.backgroundPosition = 'right 12px center';
        phoneSelect.style.backgroundSize = '12px 12px';
        phoneSelect.style.fontWeight = '500';
      }
    }

    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.className = 'submit-btn w-full font-semibold py-3 px-6 transition-all transform uppercase shadow-lg tracking-wide';
      submitBtn.style.background = `linear-gradient(to bottom, ${cfg.buttonTop}, ${cfg.buttonBottom})`;
      submitBtn.style.borderRadius = RADIUS + 'px';
      submitBtn.style.border = '2px solid transparent';
      submitBtn.style.color = '#ffffff';
      submitBtn.style.fontWeight = '700';
    }
  }

  function injectDynamicCss(cfg) {
    let style = document.getElementById('tar-dynamic');
    if (!style) { style = document.createElement('style'); style.id = 'tar-dynamic'; document.head.appendChild(style); }
    style.textContent = `
      .form-group.success input, .form-group.success select { border-color: ${cfg.green} !important; }
      .form-group.error input, .form-group.error select { border-color: ${cfg.colors.primary} !important; }
      .submit-btn, .submit-btn * { color: #ffffff !important; }
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
