// File: /themes/todoalrojo.js
// Theme: Todo al Rojo — same UI as PIN‑UP; only colors + background + logo differ.
// Usage: add ?campaign=todoalrojo (or ?theme=todoalrojo) to the URL. No other edits needed.
(function () {
  const RADIUS = 20; // match PIN‑UP

  const TodoAlRojoTheme = {
    config: {
      name: 'todoalrojo',
      logo: '/assets/todoalrojo-logo.png',
      bgImage: '/assets/todoalrojo-bg.png',
      colors: {
        primary: '#ef4444', // brand red for input borders, accents
        darkGradientTop: '#2a303c',
        darkGradientBottom: '#0b0c10',
        inputBg: '#1F2937',
      },
      // Keep success color same as PIN‑UP
      green: '#01d0a6',
      greenDark: '#0e8477',
      // Button gradient (red brand)
      buttonTop: '#ef4444',
      buttonBottom: '#b91c1c',
    },

    apply() {
      const cfg = this.config;
      // Font
      if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Montserrat"]')) {
        const font = document.createElement('link');
        font.rel = 'stylesheet';
        font.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
        document.head.appendChild(font);
      }

      // Body background (no dark overlay)
      document.body.style.background = `url('${cfg.bgImage}') no-repeat center center fixed`;
      document.body.style.backgroundSize = 'cover';
      document.querySelectorAll('.bg-decoration').forEach((el) => (el.style.display = 'none'));

      // Logo (same placement as PIN‑UP)
      const logoContainer = document.querySelector('.logo');
      if (logoContainer) {
        logoContainer.style.display = 'block';
        logoContainer.className = 'logo w-36 h-12 mx-auto mb-6';
        logoContainer.innerHTML = `<img src="${cfg.logo}" alt="TODOALROJO" class="w-full h-full object-contain" />`;
      }

      // Header
      const header = document.querySelector('.header');
      if (header) header.className = 'header text-center mb-4';

      // Container → Card (fixed width 480px, same glass effect)
      const container = document.querySelector('.container');
      if (container && !container.dataset.todoalrojoApplied) {
        container.dataset.todoalrojoApplied = 'true';
        container.className = 'relative z-10 w-full mx-auto';
        container.style.maxWidth = '480px';
        container.style.width = '100%';

        const formCard = document.createElement('div');
        formCard.className = 'tar-skin';
        formCard.style.position = 'relative';
        formCard.style.overflow = 'hidden';
        // glass gradient (top lighter → bottom darker)
        formCard.style.background = 'linear-gradient(to bottom, rgba(42,48,60,0.65), rgba(11,12,16,0.65))';
        formCard.style.backdropFilter = 'blur(16px) saturate(140%)';
        formCard.style.webkitBackdropFilter = 'blur(16px) saturate(140%)';
        formCard.style.border = '1px solid rgba(255,255,255,0.08)';
        formCard.style.borderRadius = RADIUS + 'px';
        formCard.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';

        // top gloss
        const gloss = document.createElement('div');
        gloss.style.position = 'absolute';
        gloss.style.top = '0'; gloss.style.left = '0'; gloss.style.right = '0';
        gloss.style.height = '64px';
        gloss.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0))';
        gloss.style.pointerEvents = 'none';
        gloss.style.borderTopLeftRadius = gloss.style.borderTopRightRadius = (RADIUS - 1) + 'px';
        formCard.appendChild(gloss);

        // subtle inner edge ring
        const ring = document.createElement('div');
        ring.style.position = 'absolute'; ring.style.inset = '0';
        ring.style.borderRadius = (RADIUS - 1) + 'px';
        ring.style.pointerEvents = 'none';
        ring.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 8px rgba(255,255,255,0.08)';
        formCard.appendChild(ring);

        while (container.firstChild) formCard.appendChild(container.firstChild);
        container.appendChild(formCard);
      }

      // Inputs (2px brand red edges, same background)
      document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
        input.className = 'w-full px-4 py-3 text-white placeholder-gray-400 transition-all';
        input.style.backgroundColor = 'rgba(31,41,55,0.55)';
        input.style.backdropFilter = 'blur(6px)';
        input.style.border = `2px solid ${cfg.colors.primary}`;
        input.style.borderRadius = RADIUS + 'px';
      });

      // Selects (2px brand red edges). Keep default placeholder color.
      document.querySelectorAll('select').forEach((select) => {
        select.className = 'w-full px-4 py-3 text-white transition-all appearance-none cursor-pointer';
        select.style.backgroundColor = 'rgba(31,41,55,0.55)';
        select.style.backdropFilter = 'blur(6px)';
        select.style.border = `2px solid ${cfg.colors.primary}`;
        select.style.borderRadius = RADIUS + 'px';
        select.style.paddingRight = '2.25rem';
      });

      // Hide input icons & use standard left padding (like PIN‑UP)
      document.querySelectorAll('.input-icon').forEach((icon) => (icon.style.display = 'none'));
      document.querySelectorAll('input').forEach((input) => { if (input && input.style) input.style.paddingLeft = '1rem'; });

      // Phone layout
      const phoneContainer = document.querySelector('.phone-container');
      if (phoneContainer) {
        phoneContainer.className = 'phone-container flex gap-2';
        const phoneSelect = phoneContainer.querySelector('select');
        const phoneInputWrapper = phoneContainer.querySelector('.input-wrapper');
        if (phoneSelect) {
          phoneSelect.className = 'flex-shrink-0 w-36 px-3 py-3 text-white text-sm appearance-none cursor-pointer';
          phoneSelect.style.backgroundColor = 'rgba(31,41,55,0.55)';
          phoneSelect.style.backdropFilter = 'blur(6px)';
          phoneSelect.style.border = `2px solid ${cfg.colors.primary}`;
          phoneSelect.style.borderRadius = RADIUS + 'px';
        }
        if (phoneInputWrapper) phoneInputWrapper.className = 'flex-1';
      }

      // Default phone country: Chile +56
      const cc = document.getElementById('countryCode');
      if (cc && !cc.value) { cc.value = '+56'; cc.dispatchEvent(new Event('change', { bubbles: true })); }

      // Submit button (brand red gradient, 2px thickness)
      const submitBtn = document.querySelector('.submit-btn');
      if (submitBtn) {
        submitBtn.className = 'submit-btn w-full text-white font-semibold py-3 px-6 transition-all transform uppercase shadow-lg tracking-wide';
        submitBtn.style.background = `linear-gradient(to bottom, ${cfg.buttonTop}, ${cfg.buttonBottom})`;
        submitBtn.style.borderRadius = RADIUS + 'px';
        submitBtn.style.border = '2px solid transparent';
      }

      // Success section
      const successSection = document.querySelector('#successSection');
      if (successSection) {
        successSection.className = 'success-message text-center p-10';
        const successIcon = successSection.querySelector('.success-icon');
        if (successIcon) {
          successIcon.className = 'w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center';
          successIcon.style.background = cfg.green;
        }
        const h2 = successSection.querySelector('h2');
        if (h2) h2.className = 'text-2xl font-extrabold text-white mb-2';
        successSection.querySelectorAll('p').forEach((p) => (p.className = 'text-gray-400'));
      }

      // Loading overlay
      const loadingOverlay = document.querySelector('#loadingOverlay');
      if (loadingOverlay) {
        loadingOverlay.classList.add('loading-overlay', 'fixed', 'inset-0');
        loadingOverlay.style.background = 'rgba(0,0,0,0.75)';
        loadingOverlay.style.backdropFilter = 'blur(5px)';
      }

      // Dynamic CSS (success/error borders & header color)
      if (!document.getElementById('tar-dynamic')) {
        const style = document.createElement('style');
        style.id = 'tar-dynamic';
        style.textContent = `
          .form-group.success input, .form-group.success select { border-color: ${cfg.green} !important; }
          .form-group.error input, .form-group.error select { border-color: ${cfg.colors.primary} !important; }
          .header h1 { color: #fff !important; }
          .submit-btn { border-radius: ${RADIUS}px !important; border-width: 2px !important; }
        `;
        document.head.appendChild(style);
      }

      // Compact spacing
      if (!document.getElementById('tar-compact')) {
        const s = document.createElement('style');
        s.id = 'tar-compact';
        s.textContent = `
          .header{margin-bottom:12px!important}
          .form-group{margin-bottom:12px!important}
          .validation-message{margin-top:6px!important}
        `;
        document.head.appendChild(s);
      }
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoAlRojoTheme;
  } else {
    // Register with ThemeRegistry when available
    if (window.ThemeRegistry && typeof window.ThemeRegistry.register === 'function') {
      window.ThemeRegistry.register('todoalrojo', TodoAlRojoTheme);
    }
    window.TodoAlRojoTheme = TodoAlRojoTheme;
  }
})();
