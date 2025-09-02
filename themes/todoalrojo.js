// File: /themes/todoalrojo.js
// Theme: Todo al Rojo — bold red accents, photographic bg
// Usage: add ?campaign=todoalrojo (or ?theme=todoalrojo) to the URL. No other edits needed.
(function(){
  const RADIUS = 16;
  const ACCENT = '#ef4444'; // red-500
  const ACCENT_DARK = '#b91c1c'; // red-700
  const TEXT_LIGHT = '#ffffff';
  const PLACEHOLDER = '#fca5a5'; // light red as placeholder
  const BG_URL = '/assets/todoalrojo-bg.png'; // ensure file exists at this path

  const TodoAlRojoTheme = {
    apply(){ ensureFont(); setBackground(); styleUI(); }
  };

  function ensureFont(){
    if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Montserrat"]')) {
      const font = document.createElement('link');
      font.rel = 'stylesheet';
      font.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
      document.head.appendChild(font);
    }
  }

  function setBackground(){
    // Preload to avoid flash
    const img = new Image(); img.src = BG_URL; img.onload = () => { document.documentElement.style.setProperty('--todoalrojo-bg-loaded', '1'); };

    document.body.style.fontFamily = 'Montserrat, sans-serif';
    document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url('${BG_URL}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.color = TEXT_LIGHT;

    // Remove subtle base decorations for a clean photo bg
    document.querySelectorAll('.bg-decoration').forEach(el => el.style.display = 'none');
  }

  function styleUI(){
    const container = document.querySelector('.container');
    if (container && !container.dataset.todoalrojoApplied) {
      container.dataset.todoalrojoApplied = 'true';
      container.className = 'relative z-10 w-full mx-auto';
      container.style.maxWidth = '520px';

      // Card: glassy dark with red border glow
      const card = document.createElement('div');
      card.style.position = 'relative';
      card.style.padding = '22px';
      card.style.borderRadius = RADIUS + 'px';
      card.style.background = 'linear-gradient(to bottom, rgba(17,17,17,0.70), rgba(17,17,17,0.55))';
      card.style.backdropFilter = 'blur(10px) saturate(130%)';
      card.style.border = '1.5px solid rgba(239,68,68,0.35)';
      card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.45), 0 0 0 2px rgba(239,68,68,0.15) inset';

      while (container.firstChild) card.appendChild(container.firstChild);
      container.appendChild(card);
    }

    // Header styling
    const h1 = document.querySelector('.header h1');
    if (h1) { h1.style.color = TEXT_LIGHT; h1.style.letterSpacing = '-.5px'; }
    const headerP = document.querySelector('.header p');
    if (headerP) { headerP.style.color = '#f3f4f6'; }

    // Labels
    document.querySelectorAll('label').forEach((label) => {
      label.style.color = TEXT_LIGHT;
    });

    // Inputs & selects
    const neutral = 'rgba(255,255,255,0.25)';
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
      input.style.backgroundColor = 'rgba(0,0,0,0.35)';
      input.style.border = `2px solid ${neutral}`;
      input.style.borderRadius = RADIUS + 'px';
      input.style.color = TEXT_LIGHT;
      input.style.paddingLeft = '44px';
    });
    const styleEl = document.createElement('style');
    styleEl.textContent = `input::placeholder{color:${PLACEHOLDER};}`;
    document.head.appendChild(styleEl);

    document.querySelectorAll('select').forEach((select) => {
      const def = select.value;
      select.style.backgroundColor = 'rgba(0,0,0,0.35)';
      select.style.border = `2px solid ${neutral}`;
      select.style.borderRadius = RADIUS + 'px';
      select.style.color = PLACEHOLDER; // like placeholder until changed
      select.addEventListener('change', () => {
        select.style.color = (select.value === def) ? PLACEHOLDER : TEXT_LIGHT;
      });
      select.style.color = (select.value === def) ? PLACEHOLDER : TEXT_LIGHT;
    });

    // Icons
    document.querySelectorAll('.input-icon').forEach((icon) => {
      icon.style.display = 'block';
      icon.style.fill = TEXT_LIGHT;
      icon.style.opacity = '0.95';
      icon.style.zIndex = '1';
    });

    // Button
    const btn = document.querySelector('.submit-btn');
    if (btn) {
      btn.style.borderRadius = RADIUS + 'px';
      btn.style.background = `linear-gradient(to bottom, ${ACCENT}, ${ACCENT_DARK})`;
      btn.style.color = '#fff';
      btn.style.border = '1.5px solid rgba(255,255,255,0.18)';
      btn.style.boxShadow = '0 10px 20px rgba(239,68,68,0.35)';
      btn.addEventListener('mouseenter', () => (btn.style.filter = 'brightness(1.05)'));
      btn.addEventListener('mouseleave', () => (btn.style.filter = ''));
    }

    // Footer
    const footer = document.querySelector('.footer p');
    if (footer) footer.style.color = '#f3f4f6';

    // Validation text tinting to red/green without changing borders
    const dynId = 'todoalrojo-dynamic';
    let st = document.getElementById(dynId);
    if (!st) { st = document.createElement('style'); st.id = dynId; document.head.appendChild(st); }
    st.textContent = `
      .validation-message.error { color: ${ACCENT} !important; }
      .validation-message.success { color: #22c55e !important; }
    `;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoAlRojoTheme;
  } else {
    // Prefer registry; fallback to global for legacy loaders
    if (window.ThemeRegistry && typeof window.ThemeRegistry.register === 'function') {
      window.ThemeRegistry.register('todoalrojo', TodoAlRojoTheme);
    }
    window.TodoAlRojoTheme = TodoAlRojoTheme;
  }
})();
