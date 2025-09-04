// File: /themes/todoalrojo.js
// Theme: Todo al Rojo — mirrors PIN‑UP UI; only color, background, and logo differ.
// Usage: add ?campaign=todoalrojo (or ?theme=todoalrojo). Assets required:
//   /assets/todoalrojo-bg.png, /assets/todoalrojo-logo.png (1080x1080)

// Wrap everything in an IIFE (Immediately Invoked Function Expression) to avoid global scope pollution
(function () {
  // Global constant for consistent border radius throughout the theme
  const RADIUS = 20; // match PIN‑UP roundness

  // Main theme object containing all configuration and methods
  const TodoAlRojoTheme = {
    // Theme configuration object with all visual settings
    config: {
      name: 'todoalrojo',                    // Theme identifier
      logo: '/assets/todoalrojo-logo.png',   // Path to logo image (1080x1080)
      bgImage: '/assets/todoalrojo-bg.png',  // Path to background image
      colors: { 
        primary: '#ef4444',        // Main red color for borders and accents
        inputBgAlpha: 0.55        // Transparency level for input backgrounds
      },
      green: '#01d0a6',           // Success/validation color (teal-green)
      buttonTop: '#ef4444',       // Top color for button gradient (red)
      buttonBottom: '#b91c1c',    // Bottom color for button gradient (darker red)
    },
    
    // Main method that applies all theme modifications
    apply() {
      const cfg = this.config;
      ensureFont();               // Load Google Font (Montserrat)
      applyBackground(cfg.bgImage); // Set background image
      normalizeContainer();       // Create glassmorphism card container
      injectLogo(cfg.logo);      // Add and style the logo
      styleForm(cfg);            // Style all form elements
      injectDynamicCss(cfg);     // Add validation styles
      setDefaultPhoneCountry('+56'); // Set default phone country to Chile
    },
  };

  // ===== FONT LOADING =====
  // Ensures Montserrat font is loaded from Google Fonts if not already present
  function ensureFont() {
    // Check if Montserrat font link already exists to avoid duplicates
    if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Montserrat"]')) {
      const font = document.createElement('link');
      font.rel = 'stylesheet';
      // Load multiple font weights: 400 (regular), 600 (semi-bold), 700 (bold), 800 (extra-bold)
      font.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
      document.head.appendChild(font);
    }
  }

  // ===== BACKGROUND STYLING =====
  // Applies the theme background image to the body element
  function applyBackground(url) {
    document.body.style.backgroundImage = `url('${url}')`;    // Set background image
    document.body.style.backgroundRepeat = 'no-repeat';       // Don't repeat the image
    document.body.style.backgroundAttachment = 'fixed';       // Keep background fixed on scroll
    document.body.style.backgroundPosition = 'center';        // Center the background
    document.body.style.backgroundSize = 'cover';             // Scale to cover entire viewport
    
    // Hide any existing background decorations from the original theme
    document.querySelectorAll('.bg-decoration').forEach((el) => (el.style.display = 'none'));
  }

  // ===== CONTAINER & CARD CREATION =====
  // Creates a glassmorphism card container to hold all form content
  function normalizeContainer() {
    const container = document.querySelector('.container');
    if (!container) return; // Exit if no container found
    
    // Reset container classes and set responsive width
    container.className = 'container relative z-10 w-full mx-auto';
    container.style.maxWidth = '480px';  // Maximum width for larger screens
    container.style.width = '100%';      // Full width on smaller screens

    // Check if card already exists to avoid duplicates
    if (container.querySelector('.tar-card')) return;
    
    // Create the glassmorphism card element
    const card = document.createElement('div');
    card.className = 'tar-card';
    card.style.position = 'relative';
    card.style.overflow = 'hidden';                    // Prevent content overflow
    card.style.padding = '24px 24px 18px';           // Padding: 24px sides, 24px top, 18px bottom
    card.style.borderRadius = RADIUS + 'px';          // Rounded corners (20px)
    
    // Glassmorphism background: semi-transparent gradient with blur
    card.style.background = 'linear-gradient(to bottom, rgba(42,48,60,0.58), rgba(11,12,16,0.58))';
    card.style.backdropFilter = 'blur(16px) saturate(140%)';       // Blur and saturate background
    card.style.webkitBackdropFilter = 'blur(16px) saturate(140%)'; // Safari compatibility
    card.style.border = '1px solid rgba(255,255,255,0.10)';        // Subtle white border
    card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';         // Drop shadow for depth

    // Create glossy highlight effect at the top of the card
    const gloss = document.createElement('div');
    gloss.style.position = 'absolute';
    gloss.style.left = '0';
    gloss.style.right = '0';  
    gloss.style.top = '0';
    gloss.style.height = '64px';  // 64px tall highlight strip
    // White-to-transparent gradient for gloss effect
    gloss.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0))';
    gloss.style.pointerEvents = 'none';  // Don't interfere with clicks
    card.appendChild(gloss);

    // Move all existing container content into the new card
    while (container.firstChild) card.appendChild(container.firstChild);
    container.appendChild(card);
  }

  // ===== LOGO INJECTION AND SIZING =====
  // Handles logo display with responsive sizing and proper centering
  function injectLogo(src) {
    const holder = document.querySelector('.logo');
    if (!holder) return; // Exit if no logo container found
    
    // IMPORTANT: Override default '.logo { display:none }' by replacing className
    holder.className = 'tar-logo';             // Remove any existing classes
    holder.style.display = 'block';            // Force display (overrides any display:none)
    holder.style.width = '100%';               // Full width container
    holder.style.textAlign = 'center';         // Center content horizontally
    holder.style.marginBottom = '24px';        // Add space below logo (increased from 16px)
    
    // Inject logo image with alt text
    holder.innerHTML = `<img src="${src}" alt="TODOALROJO" class="tar-logo-img" />`;

    // Inject CSS for logo sizing if not already present
    if (!document.getElementById('tar-logo-css')) {
      const s = document.createElement('style');
      s.id = 'tar-logo-css';
      s.textContent = `
        /* LOGO CONTAINER - Full width with center alignment */
        .tar-logo { 
          display: block !important;      /* Override any display:none */
          width: 100% !important;         /* Full container width */
          text-align: center !important;  /* Center the image */
          margin: 0 auto 24px auto !important; /* Center container and add bottom margin */
        }
        
        /* LOGO IMAGE STYLING - 3X Larger sizing */
        .tar-logo-img { 
          display: inline-block !important; /* Inline-block for centering */
          width: 540px !important;          /* 3X larger: 180px × 3 = 540px */
          height: 192px !important;         /* 3X larger: 64px × 3 = 192px */
          object-fit: contain !important;   /* Scale image to fit without distortion */
          max-width: 90% !important;        /* Responsive constraint - reduced to 90% to fit better */
        }
        
        /* RESPONSIVE LOGO SIZING - Mobile devices */
        @media (max-width: 480px) { 
          .tar-logo-img { 
            width: 450px !important;   /* 3X larger: 150px × 3 = 450px */
            height: 159px !important;  /* 3X larger: 53px × 3 = 159px */
            max-width: 85% !important; /* Tighter constraint for mobile */
          } 
        }
        
        /* VERY SMALL SCREENS - Extra responsive breakpoint */
        @media (max-width: 360px) { 
          .tar-logo-img { 
            width: 390px !important;   /* 3X larger: 130px × 3 = 390px */
            height: 138px !important;  /* 3X larger: 46px × 3 = 138px */
            max-width: 80% !important; /* Even tighter constraint for very small screens */
          } 
        }
      `;
      document.head.appendChild(s);
    }
  }

  // ===== FORM STYLING =====
  // Styles all form elements including inputs, selects, and buttons
  function styleForm(cfg) {
    // Style the header section (typically contains h1 title)
    const header = document.querySelector('.header');
    if (header) {
      header.className = 'header text-center mb-4';  // Center text with bottom margin
      const h1 = header.querySelector('h1'); 
      if (h1) h1.style.color = '#ffffff';           // Make title white
    }

    // ===== TEXT INPUT STYLING =====
    // Style all text, email, and telephone input fields
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
      input.className = 'w-full px-4 py-3 text-white placeholder-gray-400 transition-all';
      
      // Semi-transparent dark background with blur effect
      input.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`; // Dark gray with alpha
      input.style.backdropFilter = 'blur(6px)';      // Subtle background blur
      input.style.border = `2px solid ${cfg.colors.primary}`;  // Red border (2px)
      input.style.borderRadius = RADIUS + 'px';      // Rounded corners (20px)
      input.style.paddingLeft = '1rem';              // Left padding for text
    });

    // ===== DROPDOWN/SELECT STYLING =====
    // Style all select dropdown elements  
    document.querySelectorAll('select').forEach((select) => {
      select.className = 'w-full px-4 py-3 text-white transition-all appearance-none cursor-pointer';
      
      // Same background treatment as inputs for consistency
      select.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`; // Semi-transparent dark
      select.style.backdropFilter = 'blur(6px)';          // Background blur effect
      select.style.border = `2px solid ${cfg.colors.primary}`;    // Red border matching inputs
      select.style.borderRadius = RADIUS + 'px';          // Rounded corners (20px)
      select.style.paddingRight = '2.25rem';             // Extra right padding for dropdown arrow
      // Note: appearance-none removes default dropdown arrow for custom styling
    });

    // Hide any existing input icons (replaced by custom styling)
    document.querySelectorAll('.input-icon').forEach((icon) => (icon.style.display = 'none'));

    // ===== PHONE NUMBER CONTAINER SPECIAL HANDLING =====
    // Style the phone number input container (country code + phone number)
    const phoneContainer = document.querySelector('.phone-container');
    if (phoneContainer) {
      phoneContainer.className = 'phone-container flex gap-2';  // Flexbox with 2-unit gap
      
      // Style the country code dropdown specifically
      const phoneSelect = phoneContainer.querySelector('select');
      if (phoneSelect) {
        phoneSelect.className = 'flex-shrink-0 w-36 px-3 py-3 text-white text-sm appearance-none cursor-pointer';
        
        // Consistent styling with other form elements
        phoneSelect.style.backgroundColor = `rgba(31,41,55,${cfg.colors.inputBgAlpha})`;
        phoneSelect.style.border = `2px solid ${cfg.colors.primary}`;    // Red border
        phoneSelect.style.borderRadius = RADIUS + 'px';                  // Rounded corners
        
        // Note: flex-shrink-0 prevents the dropdown from shrinking
        // w-36 sets fixed width for country code dropdown
      }
    }

    // ===== SUBMIT BUTTON STYLING =====
    // Style the main submit/CTA button
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.className = 'submit-btn w-full font-semibold py-3 px-6 transition-all transform uppercase shadow-lg tracking-wide';
      
      // Red gradient background (light to dark red)
      submitBtn.style.background = `linear-gradient(to bottom, ${cfg.buttonTop}, ${cfg.buttonBottom})`;
      submitBtn.style.borderRadius = RADIUS + 'px';      // Rounded corners (20px)
      submitBtn.style.border = '2px solid transparent';   // Transparent border for consistent sizing
      submitBtn.style.color = '#ffffff';                 // Ensure white text color
    }
  }

  // ===== DYNAMIC CSS INJECTION =====
  // Injects CSS for form validation states (success/error)
  function injectDynamicCss(cfg) {
    let style = document.getElementById('tar-dynamic');
    if (!style) { 
      style = document.createElement('style'); 
      style.id = 'tar-dynamic'; 
      document.head.appendChild(style); 
    }
    
    // CSS for form validation states
    style.textContent = `
      /* SUCCESS STATE - Green border for valid inputs */
      .form-group.success input, 
      .form-group.success select { 
        border-color: ${cfg.green} !important;    /* Teal-green border */
      }
      
      /* ERROR STATE - Red border for invalid inputs */
      .form-group.error input, 
      .form-group.error select { 
        border-color: ${cfg.colors.primary} !important;  /* Red border */
      }
      
      /* BUTTON TEXT - Ensure submit button text is always white */
      .submit-btn, 
      .submit-btn * { 
        color: #ffffff !important; 
      }
    `;
  }

  // ===== DEFAULT PHONE COUNTRY SETTING =====
  // Sets the default country code for phone number input
  function setDefaultPhoneCountry(value) {
    const cc = document.getElementById('countryCode');
    if (cc && !cc.value) { 
      cc.value = value;  // Set to Chile (+56)
      // Trigger change event to notify any listeners
      cc.dispatchEvent(new Event('change', { bubbles: true })); 
    }
  }

  // ===== MODULE EXPORT HANDLING =====
  // Handle both CommonJS (Node.js) and browser environments
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js/CommonJS export
    module.exports = TodoAlRojoTheme;
  } else {
    // Browser environment
    // Register with theme registry if available
    if (window.ThemeRegistry && typeof window.ThemeRegistry.register === 'function') {
      window.ThemeRegistry.register('todoalrojo', TodoAlRojoTheme);
    }
    // Also make available globally
    window.TodoAlRojoTheme = TodoAlRojoTheme;
  }
})(); // End of IIFE
