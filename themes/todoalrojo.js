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
      injectLogo(cfg.logo); // center + tight spacing, highest priority
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
    // Reduce visible gap above/below logo while keeping glass aesthetic
    card.style.padding = '16px 24px 14px';
    card.style.borderRadius = RADIUS + 'px';
    card.style.background = 'linear-gradient(to bottom, rgba(42,48,60,0.58), rgba(11,12,16,0.58))';
    card.style.backdropFilter = 'blur(16px) saturate(140%)';
    card.style.webkitBackdropFilter = 'blur(16px) saturate(140%)';
    card.style.border = '1px solid rgba(255,255,255,0.10)';
    card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';

    const gloss = document.createElement('div');
    gloss.style.position = 'absolute'; gloss.style.left = '0'; gloss.style.right = '0'; gloss.style.top = '0';
    gloss.style.height = '48px';
    gloss.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0))';
    gloss.style.pointerEvents = 'none';
    card.appendChild(gloss);

    while (container.firstChild) card.appendChild(container.firstChild);
    container.appendChild(card);
  }

  // Strong helper to set inline styles with !important
  function setImportant(el, map) {
    if (!el) return;
    Object.entries(map).forEach(([k, v]) => el.style.setProperty(k, v, 'important'));
  }

  function injectLogo(src) {
    const holder = document.querySelector('.logo');
    if (!holder) return;

    // Ensure it isn't hidden by base CSS and is perfectly centered
    holder.className = 'tar-logo';
    setImportant(holder, {
      display: 'flex',
      'justify-content': 'center',
      'align-items': 'center',
      width: '100%',
      margin: '0 auto 8px', // Reduced logo margin
      padding: '0',
      'text-align': 'center',
    });

    holder.innerHTML = `<img src="${src}" alt="TODOALROJO" class="tar-logo-img" />`;

    const img = holder.querySelector('img');
    setImportant(img, {
      display: 'block',
      margin: '0 auto', // true center
      'object-fit': 'contain',
      'max-width': '180px', // Standardized maximum width
      'width': '100%', // Responsive within max-width
      'height': 'auto',
      // Responsive sizing for different screens
      '@media (max-width: 480px)': {
        'max-width': '140px'
      },
      '@media (max-width: 360px)': {
        'max-width': '120px'
      }
    });

    // Highest-priority safety net with responsive logo sizes
    let s = document.getElementById('tar-logo-css');
    if (!s) { s = document.createElement('style'); s.id = 'tar-logo-css'; document.head.appendChild(s); }
    s.textContent = `
      .tar-logo, .logo { display:flex !important; justify-content:center !important; align-items:center !important; width:100% !important; margin:0 auto 12px !important; padding:0 !important; text-align:center !important; }
      .tar-logo-img { 
        display:block !important; 
        margin:0 auto !important; 
        object-fit:contain !important; 
        height:auto !important; 
        max-width:180px !important; 
        width:100% !important;
      }
      
      /* Responsive logo sizing */
      @media (max-width: 480px) {
        .tar-logo-img { max-width:140px !important; }
      }
      @media (max-width: 360px) {
        .tar-logo-img { max-width:120px !important; }
      }
    `;
  }

  function styleForm(cfg) {
    const header = document.querySelector('.header');
    if (header) {
      header.className = 'header text-center';
      header.style.margin = '4px 0 8px';
      const h1 = header.querySelector('h1'); 
      if (h1) h1.style.color = '#ffffff';
      
      // Style subtitle/description text with additional spacing
      const subtitle = header.querySelector('p, .subtitle, [class*="subtitle"], [class*="description"]') || 
                      document.querySelector('p, .subtitle, [class*="subtitle"], [class*="description"]');
      if (subtitle) {
        subtitle.style.marginBottom = '20px';
        subtitle.style.paddingBottom = '8px';
        subtitle.style.color = '#e5e7eb';
        subtitle.style.fontSize = '14px';
        subtitle.style.lineHeight = '1.4';
      }
    }

    // Additional check for subtitle text by content matching
    document.querySelectorAll('p, div, span').forEach(el => {
      if (el.textContent && el.textContent.includes('Únete a más de') && el.textContent.includes('clientes satisfechos')) {
        el.style.marginBottom = '20px';
        el.style.paddingBottom = '8px';
        el.style.color = '#e5e7eb';
        el.style.fontSize = '14px';
        el.style.lineHeight = '1.4';
      }
    });

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
      if (phoneSelect) {
        phoneSelect.className = 'flex-shrink-0 w-36 px-3 py-3 text-white text-sm appearance-none cursor-pointer';
        phoneSelect.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
        phoneSelect.style.border = `2px solid ${cfg.colors.primary}`;
        phoneSelect.style.borderRadius = RADIUS + 'px';
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
      
      /* Additional subtitle spacing styles */
      .header p, .subtitle, [class*="subtitle"], [class*="description"] {
        margin-bottom: 10px !important; /* Reduced spacing by half */
        padding-bottom: 4px !important;
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
