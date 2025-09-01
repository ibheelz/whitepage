// File: /themes/todoalrojo.js
// Campaign theme: "todoalrojo"
// Luxe dark base, soft white labels, Oxford blue depth, red CTA, glass inputs.
// ▶️ Put your PNG background URL in config.bgImage (or pass ?bg=/path/img.png)

(function () {
  const todoalrojoTheme = {
    config: {
      name: 'todoalrojo',
      // ⬇️ REPLACE THIS with your PNG path, e.g. '/assets/todoalrojo-bg.png'
      bgImage: '/assets/todoalrojo.png',
      colors: {
        black: '#121212',
        white: '#F5F5F5',
        blue:  '#0B3C5D',
        red:   '#B71C1C',
        redHover: '#8E1212',
        inputBg: 'rgba(255,255,255,0.06)',
        border: 'rgba(255,255,255,0.22)'
      },
      font: 'Montserrat'
    },

    apply() {
      // Tailwind (safe if already present)
      if (!document.querySelector('script[src*="tailwindcss"]')) {
        const s = document.createElement('script');
        s.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(s);
      }
      // Font
      if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
        const font = document.createElement('link');
        font.rel = 'stylesheet';
        font.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(this.config.font)}:wght@400;600;700;800&display=swap`;
        document.head.appendChild(font);
      }
      // Tailwind extend (optional)
      const tw = document.createElement('script');
      tw.textContent = `tailwind.config={theme:{extend:{colors:{'todo-black':'${this.config.colors.black}','todo-white':'${this.config.colors.white}','todo-blue':'${this.config.colors.blue}','todo-red':'${this.config.colors.red}'},fontFamily:{montserrat:['${this.config.font}','sans-serif']}}}}`;
      document.head.appendChild(tw);

      setTimeout(() => this.applyStyles(), 60);
    },

    applyStyles() {
      const p = new URLSearchParams(location.search);
      const bgOverride = p.get('bg');
      const bgUrl = bgOverride || this.config.bgImage || '';

      document.body.className = 'font-montserrat min-h-screen flex items-center justify-center p-5';
      if (bgUrl) {
        // Image + dark overlay for contrast
        document.body.style.backgroundImage = `linear-gradient(180deg, rgba(18,18,18,.82), rgba(11,60,93,.82)), url('${bgUrl}')`;
        document.body.style.backgroundSize = 'cover, cover';
        document.body.style.backgroundPosition = 'center, center';
        document.body.style.backgroundAttachment = 'fixed, fixed';
      } else {
        // Fallback gradient
        document.body.style.background = `linear-gradient(180deg, ${this.config.colors.black} 0%, ${this.config.colors.blue} 100%)`;
      }
      document.body.style.color = this.config.colors.white;

      // Subtle decorations
      document.querySelectorAll('.bg-decoration').forEach((el) => {
        el.style.background = 'rgba(255,255,255,0.04)';
        el.style.filter = 'blur(3px)';
      });

      // Card container (glass)
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

      const logo = document.querySelector('.logo');
      if (logo) logo.style.display = 'none';

      const h1 = document.querySelector('.header h1');
      if (h1) h1.className = 'text-todo-white text-2xl font-extrabold tracking-tight mb-2 text-center';
      const headerP = document.querySelector('.header p');
      if (headerP) headerP.className = 'text-todo-white/70 text-sm text-center mb-4';

      // Labels
      document.querySelectorAll('label').forEach((label) => {
        label.className = 'block text-todo-white font-semibold mb-2 text-sm';
      });
      document.querySelectorAll('.required').forEach((r) => (r.style.color = this.config.colors.red));

      // Inputs (glass)
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

      // Country select
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
        select.style.backgroundImage = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23cbd5e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;
        select.style.backgroundRepeat = 'no-repeat';
        select.style.backgroundPosition = 'right 0.6rem center';
        select.style.paddingRight = '2.2rem';
      });
      const phoneContainer = document.querySelector('.phone-container');
      if (phoneContainer) phoneContainer.className = 'flex gap-2';

      // Submit button → red
      const btn = document.querySelector('.submit-btn');
      if (btn) {
        btn.className = 'w-full font-bold py-4 px-6 rounded-xl uppercase tracking-wide shadow-lg transition-all';
        btn.style.background = this.config.colors.red;
        btn.style.color = this.config.colors.white;
        btn.addEventListener('mouseenter', () => (btn.style.background = this.config.colors.redHover));
        btn.addEventListener('mouseleave', () => (btn.style.background = this.config.colors.red));
        const spinner = btn.querySelector('.spinner');
        if (spinner) { spinner.style.borderColor = 'rgba(255,255,255,0.35)'; spinner.style.borderTopColor = '#fff'; }
      }

      // Footer
      const footer = document.querySelector('.footer');
      if (footer) {
        footer.className = 'mt-5 pt-5';
        const p = footer.querySelector('p');
        if (p) p.className = 'text-todo-white/70 text-xs text-center';
        footer.querySelectorAll('a').forEach((a) => { a.style.color = this.config.colors.white; a.style.textDecoration = 'underline'; });
      }

      // Success section
      const success = document.getElementById('successSection');
      if (success) {
        success.className = 'success-message text-center p-10';
        const icon = success.querySelector('.success-icon');
        if (icon) { icon.className = 'w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center'; icon.style.background = this.config.colors.red; }
        const h2 = success.querySelector('h2'); if (h2) h2.className = 'text-todo-white text-2xl font-bold mb-3';
        success.querySelectorAll('p').forEach((p) => (p.className = 'text-todo-white/70'));
      }

      // Loading overlay
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) overlay.className = 'loading-overlay fixed inset-0 bg-black/70 hidden items-center justify-center z-50 backdrop-blur-sm';
    }
  };

  // Expose both names (robust against loader expectations)
  if (typeof module !== 'undefined' && module.exports) module.exports = todoalrojoTheme;
  else {
    window.todoalrojoTheme = todoalrojoTheme;
    window.TodoAlRojoTheme = todoalrojoTheme;
  }
})();
