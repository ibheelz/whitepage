// PIN-UP Theme Module
const PinUpTheme = {
    // Theme configuration
    config: {
        name: 'pinup',
        logo: '/assets/pinup-logo.svg', // Update path to your logo
        bgImage: '/assets/pinup-bg.jpg', // Update path to your background
        colors: {
            primary: '#EE5A52', // Red/coral
            secondary: '#26D0CE', // Teal
            dark: '#1A1D26', // Dark background
            darkGradientTop: '#2B3140',
            darkGradientBottom: '#1A1D26',
            inputBg: '#1F2937',
            borderColor: '#EE5A52'
        }
    },

    // Apply theme to the form
    apply() {
        // Add Tailwind CDN if not already present
        if (!document.querySelector('script[src*="tailwindcss"]')) {
            const tailwindScript = document.createElement('script');
            tailwindScript.src = 'https://cdn.tailwindcss.com';
            document.head.appendChild(tailwindScript);
        }

        // Add Montserrat font
        if (!document.querySelector('link[href*="Montserrat"]')) {
            const fontLink = document.createElement('link');
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
        }

        // Configure Tailwind with custom colors
        const tailwindConfig = document.createElement('script');
        tailwindConfig.textContent = `
            tailwind.config = {
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
                            'montserrat': ['Montserrat', 'sans-serif']
                        }
                    }
                }
            }
        `;
        document.head.appendChild(tailwindConfig);

        // Apply styles after Tailwind loads
        setTimeout(() => {
            this.applyStyles();
        }, 100);
    },

    applyStyles() {
        // Body background
        document.body.className = 'font-montserrat min-h-screen flex items-center justify-center p-5';
        document.body.style.background = `url('${this.config.bgImage}') no-repeat center center fixed`;
        document.body.style.backgroundSize = 'cover';

        // Container
        const container = document.querySelector('.container');
        if (container) {
            container.className = 'relative z-10 w-full max-w-md mx-auto';
            
            // Create gradient background with border
            const formCard = document.createElement('div');
            formCard.className = 'bg-gradient-to-b from-pinup-dark-top to-pinup-dark-bottom border-2 border-pinup-red rounded-2xl p-8 shadow-2xl backdrop-blur-sm bg-opacity-95';
            
            // Move all container children to the new card
            while (container.firstChild) {
                formCard.appendChild(container.firstChild);
            }
            container.appendChild(formCard);
        }

        // Hide original decorations and progress bar
        document.querySelectorAll('.bg-decoration').forEach(el => el.style.display = 'none');
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) progressBar.style.display = 'none';

        // Update logo
        const logoContainer = document.querySelector('.logo');
        if (logoContainer) {
            logoContainer.className = 'w-20 h-12 mx-auto mb-6';
            logoContainer.innerHTML = `<img src="${this.config.logo}" alt="PIN-UP" class="w-full h-full object-contain" />`;
        }

        // Header text
        const h1 = document.querySelector('.header h1');
        if (h1) {
            h1.className = 'text-white text-2xl font-bold mb-2 font-montserrat tracking-tight';
        }

        const headerP = document.querySelector('.header p');
        if (headerP) {
            headerP.className = 'text-gray-400 text-sm font-montserrat mb-6';
        }

        // Form labels
        document.querySelectorAll('label').forEach(label => {
            label.className = 'block text-white font-semibold mb-2 text-sm font-montserrat';
        });

        // Required asterisks
        document.querySelectorAll('.required').forEach(req => {
            req.className = 'text-pinup-red ml-1';
        });

        // Input fields
        document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
            input.className = 'w-full px-4 py-3 bg-pinup-input border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-pinup-red focus:ring-2 focus:ring-pinup-red focus:ring-opacity-50 transition-all font-montserrat';
        });

        // Select dropdown
        document.querySelectorAll('select').forEach(select => {
            select.className = 'w-full px-4 py-3 bg-pinup-input border border-gray-600 rounded-lg text-white focus:border-pinup-red focus:ring-2 focus:ring-pinup-red focus:ring-opacity-50 transition-all font-montserrat appearance-none cursor-pointer';
            // Add custom arrow
            select.style.backgroundImage = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;
            select.style.backgroundPosition = 'right 0.5rem center';
            select.style.backgroundRepeat = 'no-repeat';
            select.style.backgroundSize = '1.5em 1.5em';
            select.style.paddingRight = '2.5rem';
        });

        // Hide input icons
        document.querySelectorAll('.input-icon').forEach(icon => {
            icon.style.display = 'none';
        });

        // Adjust input wrapper padding
        document.querySelectorAll('input').forEach(input => {
            if (input.style.paddingLeft === '44px' || input.style.paddingLeft) {
                input.style.paddingLeft = '1rem';
            }
        });

        // Phone container
        const phoneContainer = document.querySelector('.phone-container');
        if (phoneContainer) {
            phoneContainer.className = 'flex gap-2';
            const phoneSelect = phoneContainer.querySelector('select');
            const phoneInputWrapper = phoneContainer.querySelector('.input-wrapper');
            if (phoneSelect) phoneSelect.className = 'flex-shrink-0 w-32 px-3 py-3 bg-pinup-input border border-gray-600 rounded-lg text-white text-sm focus:border-pinup-red focus:ring-2 focus:ring-pinup-red focus:ring-opacity-50 transition-all font-montserrat appearance-none cursor-pointer';
            if (phoneInputWrapper) phoneInputWrapper.className = 'flex-1';
        }

        // Submit button
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.className = 'w-full bg-pinup-teal hover:bg-teal-500 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 font-montserrat text-base tracking-wide uppercase shadow-lg';
        }

        // Hide validation messages initially
        document.querySelectorAll('.validation-message').forEach(msg => {
            msg.style.display = 'none';
        });

        // Footer text
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.className = 'mt-6 pt-6 border-t border-gray-700';
            const footerP = footer.querySelector('p');
            if (footerP) {
                footerP.className = 'text-gray-500 text-xs text-center font-montserrat';
                // Update link colors
                footer.querySelectorAll('a').forEach(link => {
                    link.className = 'text-pinup-red hover:text-pinup-red/80 font-semibold';
                });
            }
        }

        // Success section styling
        const successSection = document.querySelector('#successSection');
        if (successSection) {
            successSection.className = 'success-message text-center p-10';
            const successIcon = successSection.querySelector('.success-icon');
            if (successIcon) {
                successIcon.className = 'w-20 h-20 bg-pinup-teal rounded-full mx-auto mb-6 flex items-center justify-center';
            }
            const h2 = successSection.querySelector('h2');
            if (h2) h2.className = 'text-white text-2xl font-bold mb-3 font-montserrat';
            successSection.querySelectorAll('p').forEach(p => {
                p.className = 'text-gray-400 font-montserrat';
            });
        }

        // Loading overlay
        const loadingOverlay = document.querySelector('#loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.className = 'loading-overlay fixed inset-0 bg-black bg-opacity-75 hidden items-center justify-center z-50';
            const loadingContent = loadingOverlay.querySelector('div');
            if (loadingContent) {
                loadingContent.className = 'text-center';
                const loadingText = loadingContent.querySelector('p');
                if (loadingText) loadingText.className = 'text-white font-montserrat mt-4';
            }
        }
    }
};

// Export for use in main form
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PinUpTheme;
} else {
    window.PinUpTheme = PinUpTheme;
}
