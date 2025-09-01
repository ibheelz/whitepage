// File: /themes/tojoalrojo.js
// Campaign theme: "tojoalrojo"
// Style goals: Luxe dark base, soft white text, Oxford blue depth, red primary CTA.
// Notes:
// 1) Add this theme to your loader map and THEME_CONFIG in /public/js/lead-form.js:
//    THEME_CONFIG.themes.tojoalrojo = '/themes/tojoalrojo.js';
//    In loadTheme(), resolve constructor by key: { pinup:'PinUpTheme', tojoalrojo:'TojoAlRojoTheme', default:'GlassDefaultTheme' }
// 2) This uses Tailwind-on-the-fly (same approach as pinup). Safe to no-op if already present.

(function () {
  const TojoAlRojoTheme = {
    config: {
      name: 'tojoalrojo',
      colors: {
        black: '#121212',      // Primary Black (luxury base)
        white: '#F5F5F5',      // Soft White (text/dividers)
        blue: '#0B3C5D',       // Oxford Blue (depth/accent)
        red: '#B71C1C',        // Crimson Glow (primary CTA)
        redHover: '#8E1212',   // Darker red for hover
        inputBg: 'rgba(255,255,255,0.06)', // glassy dark
        border: 'rgba(255,255,255,0.22)',
        borderFocus: 'rgba(183,28,28,0.9)'
      },
      font: 'Montserrat'
    },

    apply() {
      // Inject Tailwind once
      if (!document.querySelector('script[src*="tailwindcss"]')) {
        const s = document.createElement('script');
        s.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(s);
      }

      // Load Montserrat
      if (!document.querySelector('link[href*="Montserrat"]')) {
        const font = document.createElement('link');
        font.rel = 'stylesheet';
        font.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
        document.head.appendChild(font);
      }

      // Tailwind config extend
      const tw = document.createElement('script');
      tw.textContent = `
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                'tojo-black': '${this.config.colors.black}',
                'tojo-white': '${this.config.colors.white}',
                'tojo-blue': '${this.config.colors.blue}',
                'tojo-red': '${this.config.colors.red}',
              },
              fontFamily: { montserrat: ['${this.config.font}', 'sans-serif'] }
            }
          }
        }
      `;
      document.head.appendChild(tw);

      // Let Tailwind init then style
      setTimeout(() => this.applyStyles(), 100);
    },

    applyStyles() {
      // Body background: luxe dark -> blue depth
      document.body.className = 'font-montserrat min-h-screen flex items-center justify-center p-5';
      document.body.style.background = `linear-gradient(180deg, ${this.config.colors.black} 0%, ${this.config.colors.blue} 100%)`;
      document.body.style.color = this.config.colors.white;

      // Subtle background decorations (tone down)
      document.querySelectorAll('.bg-decoration').forEach((el) => {
        el.style.background = 'rgba(255,255,255,0.04)';
        el.style.filter = 'blur(3px)';
      });

      // Container → glass card
      const container = document.querySelector('.container');
      if (container) {
        container.className = 'relative z-10 w-full max-w-md mx-auto';
        const card = document.createElement('div');
        card.className = 'rounded-2xl p-7 shadow-2xl backdrop-blur-xl';
        card.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))';
        card.style.border = `2px solid ${this.config.colors.border}`;
        card.style.boxShadow = '0 20px 50px rgba(0,0,0,0.45)';
        
        while (container.firstChild) card.appendChild(container.firstChild);
        container.appendChild(card);
      }

      // Hide any base logo tile, we keep simple top spacing
      const logo = document.querySelector('.logo');
      if (logo) logo.style.display = 'none';

      // Header
      const h1 = document.querySelector('.header h1');
      if (h1) {
        h1.className = 'text-tojo-white text-2xl font-extrabold tracking-tight mb-2 text-center';
      }
      const headerP = document.querySelector('.header p');
      if (headerP) {
        headerP.className = 'text-tojo-white/70 text-sm text-center mb-4';
      }

      // Labels
      document.querySelectorAll('label').forEach((label) => {
        label.className = 'block text-tojo-white font-semibold mb-2 text-sm';
      });
      document.querySelectorAll('.required').forEach((r) => (r.style.color = this.config.colors.red));

      // Inputs (glass, white text, red focus)
      const setInputStyle = (el) => {
        el.className = 'w-full rounded-xl text-[16px] transition-all outline-none';
        el.style.padding = '12px 14px 12px 44px';
        el.style.background = this.config.colors.inputBg;
        el.style.border = `2px solid ${this.config.colors.border}`;
        el.style.color = this.config.colors.white;
      };

      document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
        setInputStyle(input);
        input.addEventListener('focus', () => {
          input.style.borderColor = this.config.colors.red;
          input.style.boxShadow = '0 0 0 3px rgba(183,28,28,0.25)';
        });
        input.addEventListener('blur', () => {
          input.style.border = `2px solid ${this.config.colors.border}`;
          input.style.boxShadow = 'none';
        });
      });

      // Icons → white
      document.querySelectorAll('.input-icon').forEach((icon) => {
        icon.style.display = 'block';
        icon.style.fill = this.config.colors.white;
      });

      // Select (country)
      document.querySelectorAll('select').forEach((select) => {
        select.className = 'w-full rounded-xl transition-all outline-none cursor-pointer';
        select.style.padding = '12px 14px';
        select.style.background = this.config.colors.inputBg;
        select.style.border = `2px solid ${this.config.colors.border}`;
        select.style.color = 'rgba(255,255,255,0.7)';
        select.addEventListener('focus', () => {
          select.style.borderColor = this.config.colors.red;
          select.style.boxShadow = '0 0 0 3px rgba(183,28,28,0.25)';
        });
        select.addEventListener('blur', () => {
          select.style.border = `2px solid ${this.config.colors.border}`;
          select.style.boxShadow = 'none';
        });
        // Custom arrow
        select.style.backgroundImage = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23cbd5e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;
        select.style.backgroundRepeat = 'no-repeat';
        select.style.backgroundPosition = 'right 0.6rem center';
        select.style.paddingRight = '2.2rem';
      });

      // Phone layout spacing
      const phoneContainer = document.querySelector('.phone-container');
      if (phoneContainer) phoneContainer.className = 'flex gap-2';

      // Validation text colors keep CSS defaults; nothing to change here

      // Submit button → solid red
      const btn = document.querySelector('.submit-btn');
      if (btn) {
        btn.className = 'w-full font-bold py-4 px-6 rounded-xl uppercase tracking-wide shadow-lg transition-all';
        btn.style.background = this.config.colors.red;
        btn.style.color = this.config.colors.white;
        btn.addEventListener('mouseenter', () => (btn.style.background = this.config.colors.redHover));
        btn.addEventListener('mouseleave', () => (btn.style.background = this.config.colors.red));
        // Spinner contrast tweak
        const spinner = btn.querySelector('.spinner');
        if (spinner) {
          spinner.style.borderColor = 'rgba(255,255,255,0.35)';
          spinner.style.borderTopColor = '#fff';
        }
      }

      // Footer
      const footer = document.querySelector('.footer');
      if (footer) {
        footer.className = 'mt-5 pt-5';
        const p = footer.querySelector('p');
        if (p) p.className = 'text-tojo-white/70 text-xs text-center';
        footer.querySelectorAll('a').forEach((a) => {
          a.style.color = this.config.colors.white;
          a.style.textDecoration = 'underline';
        });
      }

      // Success section
      const success = document.getElementById('successSection');
      if (success) {
        success.className = 'success-message text-center p-10';
        const icon = success.querySelector('.success-icon');
        if (icon) {
          icon.className = 'w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center';
          icon.style.background = this.config.colors.red;
        }
        const h2 = success.querySelector('h2');
        if (h2) h2.className = 'text-tojo-white text-2xl font-bold mb-3';
        success.querySelectorAll('p').forEach((p) => (p.className = 'text-tojo-white/70'));
      }

      // Loading overlay darker
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.className = 'loading-overlay fixed inset-0 bg-black/70 hidden items-center justify-center z-50 backdrop-blur-sm';
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = TojoAlRojoTheme;
  else window.TojoAlRojoTheme = TojoAlRojoTheme;
})();
