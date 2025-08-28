// File: /themes/pinup.js
// PIN-UP Theme Module (idempotent, Tailwind Play CDN compatible)

(function () {
  const PinUpTheme = {
    config: {
      name: 'pinup',
      logo: '/assets/pinup-logo.png',
      bgImage: '/assets/pinup-bg.png',
      colors: {
        primary: '#EE5A52',
        secondary: '#26D0CE',
        dark: '#1A1D26',
        darkGradientTop: '#2B3140',
        darkGradientBottom: '#1A1D26',
        inputBg: '#1F2937',
        borderColor: '#EE5A52',
      },
    },

    apply() {
      // Font
      if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Montserrat"]')) {
        const font = document.createElement('link');
        font.rel = 'stylesheet';
        font.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
        document.head.appendChild(font);
      }

      // Tailwind config BEFORE CDN script
      const cfgId = 'pinup-tailwind-config';
      if (!document.getElementById(cfgId)) {
        const cfg = document.createElement('script');
        cfg.id = cfgId;
        cfg.textContent = `
          window.tailwind = window.tailwind || {};
          window.tailwind.config = {
            theme: {
              extend: {
                colors: {
                  'pinup-red': '${this.config.colors.primary}',
                  'pinup-teal': '${this.config.colors.secondary}',
                  'pinup-dark': '${this.config.colors.dark}',
                  'pinup-dark-top': '${this.config.colors.darkGradientTop}',
                  'pinup-dark-bottom': '${this.config.colors.darkGradientBottom}',
                  'pinup-input': '${this.config.colors.inputBg}'
                },
                fontFamily: {
                  montserrat: ['Montserrat', 'sans-serif']
                }
              }
            }
          };
        `;
        document.head.appendChild(cfg);
      }

      const hasTWScript = !!document.querySelector('script[src*="cdn.tailwindcss.com"]');
      const TW_READY = () => typeof window.tailwind !== 'undefined';

      const go = () => {
        // Defer one frame to let Tailwind apply classes
        requestAnimationFrame(() => this.applyStyles());
      };

      if (!hasTWScript) {
        const tw = document.createElement('script');
        tw.src = 'https://cdn.tailwindcss.com';
        tw.onload = go;
        tw.onerror = go; // fail-soft
        document.head.appendChild(tw);
      } else {
        // If already present (or loaded earlier), continue
        if (TW_READY()) go();
        else setTimeout(go, 100);
      }
    },

    applyStyles() {
      // Body background
      document.body.classList.add('font-montserrat', 'min-h-screen', 'flex', 'items-center', 'justify-center', 'p-5');
      document.body.style.background = `url('${this.config.bgImage}') no-repeat center center fixed`;
      document.body.style.backgroundSize = 'cover';

      // Hide original decorations and progress bar
      document.querySelectorAll('.bg-decoration').forEach((el) => (el.style.display = 'none'));
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) progressBar.style.display = 'none';

      // Container → card wrap (idempotent)
      const container = document.querySelector('.container');
      if (container && !container.dataset.pinupApplied) {
        container.dataset.pinupApplied = 'true';
        container.className = 'relative z-10 w-full max-w-md mx-auto';

        const formCard = document.createElement('div');
        formCard.className = 'bg-gradient-to-b from-pinup-dark-top to-pinup-dark-bottom border-[3px] rounded-[28px] p-8 shadow-2xl backdrop-blur-sm bg-opacity-95';
        formCard.style.borderColor = this.config.colors.borderColor; // ensure color even if TW missing

        while (container.firstChild) formCard.appendChild(container.firstChild);
        container.appendChild(formCard);
      }

      // Logo
      const logoContainer = document.querySelector('.logo');
      if (logoContainer) {
        logoContainer.className = 'w-32 h-12 mx-auto mb-6';
        logoContainer.innerHTML = `<img src="${this.config.logo}" alt="PIN-UP" class="w-full h-full object-contain" />`;
      }

      // Header
      const h1 = document.querySelector('.header h1');
      if (h1) h1.className = 'text-white text-2xl font-bold mb-2 tracking-tight';
      const headerP = document.querySelector('.header p');
      if (headerP) headerP.className = 'text-gray-400 text-sm mb-6';

      // Labels & required markers
      document.querySelectorAll('label').forEach((label) => {
        label.className = 'block text-white font-semibold mb-2 text-sm';
      });
      document.querySelectorAll('.required').forEach((req) => {
        req.style.color = this.config.colors.primary;
        req.classList.add('ml-1');
      });

      // Inputs
      document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
        input.className = 'w-full px-4 py-3 border rounded-lg text-white placeholder-gray-500 transition-all';
        input.style.backgroundColor = this.config.colors.inputBg;
        input.style.borderColor = '#4B5563';
      });

      // Selects
      document.querySelectorAll('select').forEach((select) => {
        select.className = 'w-full px-4 py-3 border rounded-lg text-white transition-all appearance-none cursor-pointer';
        select.style.backgroundColor = this.config.colors.inputBg;
        select.style.borderColor = '#4B5563';
        select.style.backgroundImage = "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")";
        select.style.backgroundPosition = 'right 0.5rem center';
        select.style.backgroundRepeat = 'no-repeat';
        select.style.backgroundSize = '1.5em 1.5em';
        select.style.paddingRight = '2.5rem';
      });

      // Hide input icons
      document.querySelectorAll('.input-icon').forEach((icon) => (icon.style.display = 'none'));

      // Remove left padding from inputs originally offset by icons
      document.querySelectorAll('input').forEach((input) => {
        if (input.style.paddingLeft) input.style.paddingLeft = '1rem';
      });

      // Phone layout
      const phoneContainer = document.querySelector('.phone-container');
      if (phoneContainer) {
        phoneContainer.className = 'flex gap-2';
        const phoneSelect = phoneContainer.querySelector('select');
        const phoneInputWrapper = phoneContainer.querySelector('.input-wrapper');
        if (phoneSelect) {
          phoneSelect.className = 'flex-shrink-0 w-32 px-3 py-3 border rounded-lg text-white text-sm appearance-none cursor-pointer';
          phoneSelect.style.backgroundColor = this.config.colors.inputBg;
          phoneSelect.style.borderColor = '#4B5563';
        }
        if (phoneInputWrapper) phoneInputWrapper.className = 'flex-1';
      }

      // Submit button
      const submitBtn = document.querySelector('.submit-btn');
      if (submitBtn) {
        submitBtn.className = 'submit-btn w-full text-white font-bold py-4 px-6 rounded-full transition-all transform uppercase shadow-lg';
        // override gradient from base CSS
        submitBtn.style.background = this.config.colors.secondary; // base
        submitBtn.addEventListener('mouseenter', () => (submitBtn.style.filter = 'brightness(1.05)'));
        submitBtn.addEventListener('mouseleave', () => (submitBtn.style.filter = ''));
      }

      // Validation messages: keep managed by app; ensure visible via .show class
      document.querySelectorAll('.validation-message').forEach((msg) => {
        msg.style.display = '';
      });

      // Footer
      const footer = document.querySelector('.footer');
      if (footer) {
        footer.className = 'mt-6 pt-6';
        const footerP = footer.querySelector('p');
        if (footerP) {
          footerP.className = 'text-gray-400 text-xs text-center';
          footer.querySelectorAll('a').forEach((a) => {
            a.style.color = this.config.colors.primary;
            a.classList.add('font-semibold');
          });
        }
      }

      // Success section
      const successSection = document.querySelector('#successSection');
      if (successSection) {
        successSection.className = 'success-message text-center p-10';
        const successIcon = successSection.querySelector('.success-icon');
        if (successIcon) {
          successIcon.className = 'w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center';
          successIcon.style.background = this.config.colors.secondary;
        }
        const h2 = successSection.querySelector('h2');
        if (h2) h2.className = 'text-white text-2xl font-bold mb-3';
        successSection.querySelectorAll('p').forEach((p) => (p.className = 'text-gray-400'));
      }

      // Loading overlay: keep base class, do not force hidden
      const loadingOverlay = document.querySelector('#loadingOverlay');
      if (loadingOverlay) {
        loadingOverlay.classList.add('loading-overlay', 'fixed', 'inset-0');
        loadingOverlay.style.background = 'rgba(0,0,0,0.75)';
        loadingOverlay.style.backdropFilter = 'blur(5px)';
        const loadingContent = loadingOverlay.querySelector('div');
        if (loadingContent) {
          loadingContent.className = 'text-center';
          const loadingText = loadingContent.querySelector('p');
          if (loadingText) loadingText.className = 'text-white mt-4';
        }
      }
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PinUpTheme;
  } else {
    window.PinUpTheme = PinUpTheme;
  }
})();
