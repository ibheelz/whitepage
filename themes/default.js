// File: /themes/default.js
// Default Glass Theme (no brand colors, no logo). Neutral, glass-only UI.

(function () {
  const RADIUS = 20;

  const GlassDefaultTheme = {
    apply() {
      ensureFont();
      applyStyles();
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

  function applyStyles() {
    // Plain, neutral background
    document.body.style.background = 'linear-gradient(180deg, #0d0f13, #0a0b0f)';
    document.body.style.fontFamily = 'Montserrat, sans-serif';

    // Hide decorations & progress bar
    document.querySelectorAll('.bg-decoration').forEach((el) => (el.style.display = 'none'));
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) progressBar.style.display = 'none';

    // Container (fixed 480px) with glassmorphism card
    const container = document.querySelector('.container');
    if (container && !container.dataset.defaultGlassApplied) {
      container.dataset.defaultGlassApplied = 'true';
      container.className = 'relative z-10 w-full mx-auto';
      container.style.maxWidth = '480px';
      container.style.width = '100%';

      const card = document.createElement('div');
      card.className = 'glass-card';
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.style.padding = '24px';
      card.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.03))';
      card.style.backdropFilter = 'blur(16px) saturate(140%)';
      card.style.webkitBackdropFilter = 'blur(16px) saturate(140%)';
      card.style.border = '1px solid rgba(255,255,255,0.08)';
      card.style.borderRadius = RADIUS + 'px';
      card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';

      // Top gloss
      const gloss = document.createElement('div');
      gloss.style.position = 'absolute'; gloss.style.left = '0'; gloss.style.right = '0'; gloss.style.top = '0'; gloss.style.height = '64px';
      gloss.style.borderTopLeftRadius = gloss.style.borderTopRightRadius = (RADIUS - 1) + 'px';
      gloss.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.16), rgba(255,255,255,0))';
      gloss.style.pointerEvents = 'none';
      card.appendChild(gloss);

      // Glass edge ring (neutral)
      const edge = document.createElement('div');
      edge.style.position = 'absolute'; edge.style.inset = '0'; edge.style.borderRadius = RADIUS + 'px'; edge.style.pointerEvents = 'none';
      edge.style.setProperty('padding', '2px');
      edge.style.setProperty('background', 'linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,.14), rgba(255,255,255,.08), rgba(255,255,255,.18))');
      edge.style.setProperty('-webkit-mask', 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)');
      edge.style.setProperty('-webkit-mask-composite', 'xor');
      edge.style.setProperty('mask-composite', 'exclude');
      card.appendChild(edge);

      while (container.firstChild) card.appendChild(container.firstChild);
      container.appendChild(card);
    }

    // Remove logo entirely
    const logo = document.querySelector('.logo');
    if (logo) logo.style.display = 'none';

    // Header
    const h1 = document.querySelector('.header h1');
    if (h1) { h1.className = 'text-2xl font-bold mb-2 tracking-tight'; h1.style.color = '#ffffff'; }
    const headerP = document.querySelector('.header p');
    if (headerP) headerP.className = 'text-gray-300 text-sm mb-4';

    // Labels
    document.querySelectorAll('label').forEach((label) => {
      label.className = 'block text-white font-semibold mb-2 text-sm';
    });

    // Inputs
    const neutralBorder = 'rgba(255,255,255,0.28)';
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
      input.className = 'w-full px-4 py-3 text-white placeholder-gray-400 transition-all';
      input.style.backgroundColor = 'rgba(255,255,255,0.06)';
      input.style.backdropFilter = 'blur(6px)';
      input.style.border = `2px solid ${neutralBorder}`;
      input.style.borderRadius = RADIUS + 'px';
    });

    // Selects
    document.querySelectorAll('select').forEach((select) => {
      select.className = 'w-full px-4 py-3 text-white transition-all appearance-none cursor-pointer';
      select.style.backgroundColor = 'rgba(255,255,255,0.06)';
      select.style.backdropFilter = 'blur(6px)';
      select.style.border = `2px solid ${neutralBorder}`;
      select.style.borderRadius = RADIUS + 'px';
      select.style.backgroundImage = "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239aa0a6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")";
      select.style.backgroundPosition = 'right 0.75rem center';
      select.style.backgroundRepeat = 'no-repeat';
      select.style.backgroundSize = '1.25em 1.25em';
      select.style.paddingRight = '2.25rem';
    });

    // Input icons hidden + padding fix
    document.querySelectorAll('.input-icon').forEach((icon) => (icon.style.display = 'none'));
    document.querySelectorAll('input').forEach((input) => { if (input.style.paddingLeft) input.style.paddingLeft = '1rem'; });

    // Button: neutral glass
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.className = 'submit-btn w-full text-white font-bold py-4 px-6 transition-all transform uppercase shadow-lg tracking-wide';
      submitBtn.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.22), rgba(255,255,255,0.10))';
      submitBtn.style.borderRadius = RADIUS + 'px';
      submitBtn.style.border = '2px solid rgba(255,255,255,0.18)';
      submitBtn.addEventListener('mouseenter', () => (submitBtn.style.filter = 'brightness(1.06)'));
      submitBtn.addEventListener('mouseleave', () => (submitBtn.style.filter = ''));
    }

    // Footer links: neutral
    const footer = document.querySelector('.footer');
    if (footer) {
      const p = footer.querySelector('p');
      if (p) p.className = 'text-gray-300 text-xs text-center';
      footer.querySelectorAll('a').forEach((a) => { a.style.color = '#e5e7eb'; a.style.textDecorationColor = 'rgba(229,231,235,0.45)'; });
    }

    // Validation: keep borders/messages neutral (no green/red)
    if (!document.getElementById('glass-default-dynamic')) {
      const st = document.createElement('style');
      st.id = 'glass-default-dynamic';
      st.textContent = `
        .form-group.success input, .form-group.success select,
        .form-group.error input, .form-group.error select { border-color: ${neutralBorder} !important; }
        .validation-message { color: #cbd5e0 !important; }
        .validation-message svg path { fill: #cbd5e0 !important; }
      `;
      document.head.appendChild(st);
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlassDefaultTheme;
  } else {
    window.GlassDefaultTheme = GlassDefaultTheme;
  }
})();
