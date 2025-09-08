// File: /themes/pinup.js
// PIN-UP Theme for Giveaway Form

(function () {
  const RADIUS = 20;

  const PinUpGiveawayTheme = {
    config: {
      name: 'pinup',
      logo: '/assets/pinup-logo.png',
      bgImage: '/assets/pinup-bg.png',
      colors: {
        primary: '#ff2400',
        darkGradientTop: '#2a303c',
        darkGradientBottom: '#0b0c10',
        inputBg: '#1F2937',
      },
      green: '#01d0a6',
      greenDark: '#0e8477',
    },

    apply() {
      // Font
      if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Montserrat"]')) {
        const font = document.createElement('link');
        font.rel = 'stylesheet';
        font.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
        document.head.appendChild(font);
      }

      // Tailwind config
      const cfgId = 'pinup-giveaway-tailwind-config';
      if (!document.getElementById(cfgId)) {
        const cfg = document.createElement('script');
        cfg.id = cfgId;
        cfg.textContent = `
          window.tailwind = window.tailwind || {};
          window.tailwind.config = {
            theme: { extend: { colors: {
              'pinup-red': '${this.config.colors.primary}',
              'pinup-green': '${this.config.green}',
              'pinup-green-dark': '${this.config.greenDark}',
              'pinup-dark-top': '${this.config.colors.darkGradientTop}',
              'pinup-dark-bottom': '${this.config.colors.darkGradientBottom}',
              'pinup-input': '${this.config.colors.inputBg}'
            }, fontFamily: { montserrat: ['Montserrat','sans-serif'] } } }
          };
        `;
        document.head.appendChild(cfg);
      }

      const hasTW = !!document.querySelector('script[src*="cdn.tailwindcss.com"]');
      const go = () => requestAnimationFrame(() => this.applyStyles());
      if (!hasTW) {
        const tw = document.createElement('script');
        tw.src = 'https://cdn.tailwindcss.com';
        tw.onload = go; tw.onerror = go; document.head.appendChild(tw);
      } else { 
        setTimeout(go, 60); 
      }
    },

    applyStyles() {
      // Body styling
      document.body.classList.add('font-montserrat','min-h-screen','flex','items-center','justify-center','p-5');
      document.body.style.background = `url('${this.config.bgImage}') no-repeat center center fixed`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.fontFamily = 'Montserrat, sans-serif';

      // Hide decorations
      document.querySelectorAll('.bg-decoration').forEach((el) => (el.style.display = 'none'));

      // Glass edge styles
      if (!document.getElementById('pinup-giveaway-glass-styles')) {
        const s = document.createElement('style');
        s.id = 'pinup-giveaway-glass-styles';
        s.textContent = `
          .glass-edge { position:absolute; inset:0; border-radius:${RADIUS}px; pointer-events:none; }
          .glass-edge::before { content:''; position:absolute; inset:0; padding:2px; border-radius:${RADIUS}px; 
            background: linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,.14), rgba(255,255,255,.08), rgba(255,255,255,.18));
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude; }
          .glass-edge::after { content:''; position:absolute; inset:1px; border-radius:${RADIUS-1}px; 
            box-shadow: inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1px 0 rgba(0,0,0,.25); }
          .pinup-giveaway-skin { padding: 24px; }
          @media (min-width: 640px) { .pinup-giveaway-skin { padding-left: 32px; padding-right: 32px; } }
          @media (min-width: 768px) { .pinup-giveaway-skin { padding-left: 40px; padding-right: 40px; } }
        `;
        document.head.appendChild(s);
      }

      // Container → Card (fixed width 480px)
      const container = document.querySelector('.container');
      if (container && !container.dataset.pinupGiveawayApplied) {
        container.dataset.pinupGiveawayApplied = 'true';
        container.className = 'relative z-10 w-full mx-auto';
        container.style.maxWidth = '480px';
        container.style.width = '100%';

        const formCard = document.createElement('div');
        formCard.className = 'pinup-giveaway-skin';
        formCard.style.position = 'relative';
        formCard.style.overflow = 'hidden';
        formCard.style.background = 'linear-gradient(to bottom, rgba(42,48,60,0.65), rgba(11,12,16,0.65))';
        formCard.style.backdropFilter = 'blur(16px) saturate(140%)';
        formCard.style.webkitBackdropFilter = 'blur(16px) saturate(140%)';
        formCard.style.border = '1px solid rgba(255,255,255,0.08)';
        formCard.style.borderRadius = RADIUS + 'px';
        formCard.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';

        // Top gloss highlight
        const gloss = document.createElement('div');
        gloss.style.position = 'absolute'; 
        gloss.style.top = '0'; 
        gloss.style.left = '0'; 
        gloss.style.right = '0'; 
        gloss.style.height = '64px';
        gloss.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0))';
        gloss.style.pointerEvents = 'none';
        gloss.style.borderTopLeftRadius = gloss.style.borderTopRightRadius = (RADIUS - 1) + 'px';
        formCard.appendChild(gloss);

        // Glass edge
        const edge = document.createElement('div');
        edge.className = 'glass-edge';
        formCard.appendChild(edge);

        while (container.firstChild) formCard.appendChild(container.firstChild);
        container.appendChild(formCard);
      }

      // Logo
      const logoContainer = document.querySelector('.logo');
      if (logoContainer) {
        logoContainer.className = 'w-36 h-12 mx-auto mb-6';
        logoContainer.innerHTML = `<img src="${this.config.logo}" alt="PIN-UP" class="w-full h-full object-contain" />`;
      }

      // Header
      const h1 = document.querySelector('.header h1');
      if (h1) { 
        h1.className = 'text-2xl font-bold mb-2 tracking-tight'; 
        h1.style.color = '#ffffff'; 
      }
      const headerP = document.querySelector('.header p');
      if (headerP) headerP.className = 'text-gray-400 text-sm mb-4';

      // Labels & asterisks
      document.querySelectorAll('label').forEach((label) => { 
        label.className = 'block text-white font-semibold mb-2 text-sm'; 
      });
      document.querySelectorAll('.required').forEach((req) => { 
        req.style.color = this.config.colors.primary; 
        req.classList.add('ml-1'); 
      });

      // Inputs (2px red borders)
      document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
        input.className = 'w-full px-4 py-3 text-white placeholder-gray-400 transition-all';
        input.style.backgroundColor = 'rgba(31,41,55,0.55)';
        input.style.backdropFilter = 'blur(6px)';
        input.style.border = `2px solid ${this.config.colors.primary}`;
        input.style.borderRadius = RADIUS + 'px';
      });

      // Selects (2px red borders)
      document.querySelectorAll('select').forEach((select) => {
        select.className = 'w-full px-4 py-3 text-white transition-all appearance-none cursor-pointer';
        select.style.backgroundColor = 'rgba(31,41,55,0.55)';
        select.style.backdropFilter = 'blur(6px)';
        select.style.border = `2px solid ${this.config.colors.primary}`;
        select.style.borderRadius = RADIUS + 'px';
        select.style.backgroundImage = "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")";
        select.style.backgroundPosition = 'right 0.75rem center';
        select.style.backgroundRepeat = 'no-repeat';
        select.style.backgroundSize = '1.25em 1.25em';
        select.style.paddingRight = '2.25rem';
      });

      // Hide input icons & adjust padding
      document.querySelectorAll('.input-icon').forEach((icon) => (icon.style.display = 'none'));
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
          phoneSelect.className = 'flex-shrink-0 w-36 px-3 py-3 text-white text-sm appearance-none cursor-pointer';
          phoneSelect.style.backgroundColor = 'rgba(31,41,55,0.55)';
          phoneSelect.style.backdropFilter = 'blur(6px)';
          phoneSelect.style.border = `2px solid ${this.config.colors.primary}`;
          phoneSelect.style.borderRadius = RADIUS + 'px';
        }
        if (phoneInputWrapper) phoneInputWrapper.className = 'flex-1';
      }

      // Default phone country: Chile +56
      const cc = document.getElementById('countryCode');
      if (cc && !cc.value) { 
        cc.value = '+56'; 
        cc.dispatchEvent(new Event('change', { bubbles: true })); 
      }

      // Submit button
      const submitBtn = document.querySelector('.submit-btn');
      if (submitBtn) {
        submitBtn.className = 'submit-btn w-full text-white font-bold py-4 px-6 transition-all transform uppercase shadow-lg tracking-wide';
        submitBtn.style.background = `linear-gradient(to bottom, ${this.config.green}, ${this.config.greenDark})`;
        submitBtn.style.borderRadius = RADIUS + 'px';
        submitBtn.style.border = '2px solid transparent';
      }

      // Compact spacing
      if (!document.getElementById('pinup-giveaway-compact')) {
        const style = document.createElement('style');
        style.id = 'pinup-giveaway-compact';
        style.textContent = `
          .header{margin-bottom:12px!important}
          .form-group{margin-bottom:12px!important}
          label{margin-bottom:6px!important}
          .footer{margin-top:12px!important;padding-top:12px!important}
          .submit-btn{margin-top:12px!important}
        `;
        document.head.appendChild(style);
      }

      // Footer
      const footer = document.querySelector('.footer');
      if (footer) {
        footer.className = 'mt-6 pt-4';
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
        const h2 = successSection.querySelector('h2');
        if (h2) { 
          h2.className = 'text-2xl font-bold mb-3'; 
          h2.style.color = '#ffffff'; 
        }
        successSection.querySelectorAll('p').forEach((p) => (p.className = 'text-gray-400'));
      }

      // Roulette overlay
      const rouletteOverlay = document.querySelector('.roulette-overlay');
      if (rouletteOverlay) {
        rouletteOverlay.style.background = 'rgba(42,48,60,0.95)';
        rouletteOverlay.style.backdropFilter = 'blur(20px)';
      }

      // Roulette container
      const rouletteContainer = document.querySelector('.roulette-container');
      if (rouletteContainer) {
        rouletteContainer.style.background = 'linear-gradient(to bottom, rgba(42,48,60,0.8), rgba(11,12,16,0.8))';
        rouletteContainer.style.backdropFilter = 'blur(20px) saturate(140%)';
        rouletteContainer.style.border = `2px solid ${this.config.colors.primary}`;
        rouletteContainer.style.borderRadius = '24px';
        rouletteContainer.style.boxShadow = '0 25px 50px rgba(0,0,0,0.6)';
      }

      // Prize boxes
      document.querySelectorAll('.prize-box').forEach((box) => {
        box.style.background = 'rgba(31,41,55,0.6)';
        box.style.border = `2px solid ${this.config.colors.primary}`;
        box.style.backdropFilter = 'blur(10px)';
      });

      // Prize box states
      const prizeBoxStyles = document.createElement('style');
      prizeBoxStyles.id = 'pinup-prize-box-styles';
      prizeBoxStyles.textContent = `
        .prize-box.highlighted {
          background: linear-gradient(45deg, ${this.config.colors.primary}, #ff4500) !important;
          border-color: rgba(255,255,255,0.8) !important;
          box-shadow: 0 0 25px ${this.config.colors.primary} !important;
        }
        .prize-box.winning {
          background: linear-gradient(45deg, ${this.config.green}, ${this.config.greenDark}) !important;
          border-color: rgba(255,255,255,1) !important;
          box-shadow: 0 0 35px ${this.config.green} !important;
        }
      `;
      document.head.appendChild(prizeBoxStyles);

      // Claim button in roulette
      const claimButton = document.querySelector('.claim-button');
      if (claimButton) {
        claimButton.style.background = `linear-gradient(to bottom, ${this.config.green}, ${this.config.greenDark})`;
        claimButton.style.border = '2px solid transparent';
        claimButton.style.borderRadius = RADIUS + 'px';
        claimButton.style.boxShadow = `0 8px 20px ${this.config.green}80`;
      }

      // Result popup
      const resultPopup = document.querySelector('.result-popup');
      if (resultPopup) {
        resultPopup.style.background = 'linear-gradient(to bottom, rgba(42,48,60,0.9), rgba(11,12,16,0.9))';
        resultPopup.style.backdropFilter = 'blur(25px) saturate(140%)';
        resultPopup.style.border = `2px solid ${this.config.colors.primary}`;
        resultPopup.style.boxShadow = `0 20px 40px ${this.config.colors.primary}40`;
      }

      // Loading overlay
      const loadingOverlay = document.querySelector('#loadingOverlay');
      if (loadingOverlay) {
        loadingOverlay.style.background = 'rgba(42,48,60,0.85)';
        loadingOverlay.style.backdropFilter = 'blur(10px)';
      }

      // Dynamic CSS for validation
      if (!document.getElementById('pinup-giveaway-dynamic-styles')) {
        const style = document.createElement('style');
        style.id = 'pinup-giveaway-dynamic-styles';
        style.textContent = `
          .pinup-giveaway-skin input, .pinup-giveaway-skin select { 
            border-width: 2px; border-radius: ${RADIUS}px; 
          }
          .form-group.success input, .form-group.success select { 
            border-color: ${this.config.green} !important; 
          }
          .form-group.error input, .form-group.error select { 
            border-color: ${this.config.colors.primary} !important; 
          }
          .header h1 { color: #fff !important; }
          .submit-btn { 
            border-radius: ${RADIUS}px !important; 
            border-width: 2px !important; 
          }
          .claim-button.selecting {
            background: linear-gradient(45deg, ${this.config.colors.primary}, #ff4500) !important;
            animation: pulse 0.5s infinite;
          }
        `;
        document.head.appendChild(style);
      }
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PinUpGiveawayTheme;
  } else {
    window.PinUpGiveawayTheme = PinUpGiveawayTheme;
  }
})();