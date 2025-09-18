// Rushbet Giveaway Form Handler
// Includes email/SMS verification, file upload, and Airtable integration

/***********************************
 *  Debug & Console Output
 ***********************************/
function debugLog(...args) {
    console.log('%c[RUSHBET-FORM]', 'color: #4A90C2; font-weight: bold;', ...args);
}

function debugTable(data, title = 'Debug Table') {
    console.group(`%c[RUSHBET-FORM] ${title}`, 'color: #4A90C2; font-weight: bold;');
    console.table(data);
    console.groupEnd();
}

function debugError(...args) {
    console.error('%c[RUSHBET-FORM ERROR]', 'color: #ef4444; font-weight: bold;', ...args);
}

class RushbetGiveawayForm {
    constructor() {
        debugLog('Initializing Rushbet Giveaway Form...');

        this.config = {
            DEBUG: true,
            // Email verification service (same as PIN-UP)
            emailVerificationUrl: 'https://email-verification-backend-psi.vercel.app/api/email-verify',

            // SMS verification via Real Laaffic (same as PIN-UP)
            smsVerificationUrl: 'https://verification-backend-gp9n5xldp-miela-digitals-projects.vercel.app/api/phone-verify',

            // Airtable configuration (same as PIN-UP leads table)
            airtableBaseId: 'app2I0jOClbHteBNP',
            airtableTableName: 'Leads',
            airtableToken: 'patCu0mKmtp2MPQIw.a90c3234fc52abb951cdacc3725d97442bc7f364ac822eee5960ce09ce2f86cd',
            airtableProxyUrl: 'https://verification-backend-isemtzpeo-miela-digitals-projects.vercel.app/api/airtable-proxy',

            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        };

        this.state = {
            currentStep: 'form',
            emailVerified: false,
            smsVerified: false,
            uploadedFile: null,
            formData: {},
            emailOtpCode: '',
            smsOtpCode: ''
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFileUpload();
        this.setupOtpInputs();
        this.setDefaultCountryCode();
    }

    bindEvents() {
        const form = document.getElementById('rushbetForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail());
            emailInput.addEventListener('input', () => this.clearValidation('email'));
        }

        // Phone validation
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => this.validatePhone());
            phoneInput.addEventListener('input', () => this.clearValidation('phone'));
        }

        // Full name validation
        const fullNameInput = document.getElementById('fullName');
        if (fullNameInput) {
            fullNameInput.addEventListener('blur', () => this.validateFullName());
            fullNameInput.addEventListener('input', () => this.clearValidation('fullName'));
        }

        // Age verification validation
        const ageVerificationInput = document.getElementById('ageVerification');
        if (ageVerificationInput) {
            ageVerificationInput.addEventListener('change', () => this.validateAgeVerification());
        }

        // Resend buttons
        const resendEmailBtn = document.getElementById('resendEmailBtn');
        if (resendEmailBtn) {
            resendEmailBtn.addEventListener('click', () => this.resendEmailVerification());
        }

        const resendSmsBtn = document.getElementById('resendSmsBtn');
        if (resendSmsBtn) {
            resendSmsBtn.addEventListener('click', () => this.resendSmsVerification());
        }
    }

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.querySelector('.upload-area');

        // Click to upload
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });
    }

    setupOtpInputs() {
        // Email OTP inputs
        const emailOtpInputs = document.querySelectorAll('#emailOtpCard .otp-input');
        this.setupOtpNavigation(emailOtpInputs, () => this.verifyEmailOtp());

        // SMS OTP inputs
        const smsOtpInputs = document.querySelectorAll('#smsOtpCard .otp-input');
        this.setupOtpNavigation(smsOtpInputs, () => this.verifySmsOtp());
    }

    setupOtpNavigation(inputs, onComplete) {
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = value;

                if (value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }

                // Check if all inputs are filled
                const allFilled = Array.from(inputs).every(inp => inp.value.length === 1);
                if (allFilled && onComplete) {
                    setTimeout(() => onComplete(), 100);
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const numbers = paste.replace(/[^0-9]/g, '').slice(0, 6);

                numbers.split('').forEach((num, i) => {
                    if (inputs[i]) inputs[i].value = num;
                });

                if (numbers.length === 6 && onComplete) {
                    setTimeout(() => onComplete(), 100);
                }
            });
        });
    }

    setDefaultCountryCode() {
        const countryCode = document.getElementById('countryCode');
        if (countryCode && !countryCode.value) {
            countryCode.value = '+56'; // Default to Chile
        }
    }

    validateFullName() {
        const input = document.getElementById('fullName');
        const value = input.value.trim();

        if (!value) {
            this.showValidation('fullName', 'error', 'El nombre completo es obligatorio');
            return false;
        }

        if (value.length < 3) {
            this.showValidation('fullName', 'error', 'El nombre debe tener al menos 3 caracteres');
            return false;
        }

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            this.showValidation('fullName', 'error', 'El nombre solo puede contener letras');
            return false;
        }

        this.showValidation('fullName', 'success', 'Nombre válido');
        return true;
    }

    validateEmail() {
        const input = document.getElementById('email');
        const value = input.value.trim().toLowerCase();

        if (!value) {
            this.showValidation('email', 'error', 'El email es obligatorio');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            this.showValidation('email', 'error', 'Formato de email inválido');
            return false;
        }

        input.value = value; // Normalize email
        this.showValidation('email', 'success', 'Email válido - Se enviará código de verificación');
        return true;
    }

    validatePhone() {
        const input = document.getElementById('phone');
        const value = input.value.replace(/\D/g, '');

        if (!value) {
            this.showValidation('phone', 'error', 'El teléfono es obligatorio');
            return false;
        }

        if (value.length < 8 || value.length > 12) {
            this.showValidation('phone', 'error', 'Número de teléfono inválido');
            return false;
        }

        input.value = value; // Clean phone number
        this.showValidation('phone', 'success', 'Teléfono válido - Se enviará código SMS');
        return true;
    }

    validateScreenshot() {
        if (!this.state.uploadedFile) {
            this.showValidation('screenshot', 'error', 'La captura de apuesta es obligatoria');
            return false;
        }

        this.showValidation('screenshot', 'success', 'Captura subida correctamente');
        return true;
    }

    validateAgeVerification() {
        const checkbox = document.getElementById('ageVerification');

        if (!checkbox.checked) {
            this.showValidation('ageVerification', 'error', 'Debes confirmar que eres mayor de 18 años');
            return false;
        }

        this.showValidation('ageVerification', 'success', 'Verificación de edad confirmada');
        return true;
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        if (!this.config.allowedFileTypes.includes(file.type)) {
            this.showValidation('screenshot', 'error', 'Solo se permiten archivos PNG, JPG y JPEG');
            return;
        }

        // Validate file size
        if (file.size > this.config.maxFileSize) {
            this.showValidation('screenshot', 'error', 'El archivo no puede exceder 5MB');
            return;
        }

        this.state.uploadedFile = file;
        this.showFilePreview(file);
        this.validateScreenshot();
    }

    showFilePreview(file) {
        const preview = document.getElementById('filePreview');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        preview.style.display = 'flex';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile() {
        this.state.uploadedFile = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('filePreview').style.display = 'none';
        this.clearValidation('screenshot');
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        const isValidName = this.validateFullName();
        const isValidEmail = this.validateEmail();
        const isValidPhone = this.validatePhone();
        const isValidScreenshot = this.validateScreenshot();

        if (!isValidName || !isValidEmail || !isValidPhone || !isValidScreenshot) {
            return;
        }

        // Store form data
        this.state.formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            phone: document.getElementById('phone').value.replace(/\D/g, ''),
            countryCode: document.getElementById('countryCode').value,
            screenshot: this.state.uploadedFile
        };

        // Start email verification
        await this.sendEmailVerification();
    }

    async sendEmailVerification() {
        this.showLoading(true);

        try {
            const response = await fetch(this.config.emailVerificationUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.state.formData.email,
                    name: this.state.formData.fullName,
                    source: 'rushbet-giveaway'
                })
            });

            const result = await response.json();

            if (result.success) {
                this.state.emailOtpCode = result.code;
                this.showEmailOtpCard();
                this.showValidation('email', 'success', 'Código enviado a tu email');
            } else {
                throw new Error(result.message || 'Error al enviar código de verificación');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            this.showValidation('email', 'error', 'Error al enviar código. Intenta nuevamente.');
        } finally {
            this.showLoading(false);
        }
    }

    async resendEmailVerification() {
        await this.sendEmailVerification();
    }

    async verifyEmailOtp() {
        const inputs = document.querySelectorAll('#emailOtpCard .otp-input');
        const enteredCode = Array.from(inputs).map(input => input.value).join('');

        if (enteredCode === this.state.emailOtpCode) {
            this.state.emailVerified = true;
            this.hideEmailOtpCard();
            this.showValidation('email', 'success', '✓ Email verificado correctamente');

            // Start SMS verification
            await this.sendSmsVerification();
        } else {
            this.showValidation('email', 'error', 'Código incorrecto. Intenta nuevamente.');
            // Clear OTP inputs
            inputs.forEach(input => input.value = '');
            inputs[0].focus();
        }
    }

    async sendSmsVerification() {
        this.showLoading(true);

        try {
            const fullPhone = this.state.formData.countryCode + this.state.formData.phone;

            const response = await fetch(this.config.smsVerificationUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: fullPhone,
                    name: this.state.formData.fullName,
                    source: 'rushbet-giveaway'
                })
            });

            const result = await response.json();

            if (result.success) {
                this.state.smsOtpCode = result.code;
                this.showSmsOtpCard();
                this.showValidation('phone', 'success', 'Código SMS enviado');
            } else {
                throw new Error(result.message || 'Error al enviar SMS');
            }
        } catch (error) {
            console.error('SMS verification error:', error);
            this.showValidation('phone', 'error', 'Error al enviar SMS. Intenta nuevamente.');
        } finally {
            this.showLoading(false);
        }
    }

    async resendSmsVerification() {
        await this.sendSmsVerification();
    }

    async verifySmsOtp() {
        const inputs = document.querySelectorAll('#smsOtpCard .otp-input');
        const enteredCode = Array.from(inputs).map(input => input.value).join('');

        if (enteredCode === this.state.smsOtpCode) {
            this.state.smsVerified = true;
            this.hideSmsOtpCard();
            this.showValidation('phone', 'success', '✓ Teléfono verificado correctamente');

            // Submit to Airtable
            await this.submitToAirtable();
        } else {
            this.showValidation('phone', 'error', 'Código incorrecto. Intenta nuevamente.');
            // Clear OTP inputs
            inputs.forEach(input => input.value = '');
            inputs[0].focus();
        }
    }

    async submitToAirtable() {
        this.showLoading(true);

        try {
            // Upload screenshot to a file hosting service or base64 encode for Airtable
            const screenshotBase64 = await this.fileToBase64(this.state.uploadedFile);

            const airtableData = {
                fields: {
                    'Nombre Completo': this.state.formData.fullName,
                    'Email': this.state.formData.email,
                    'Teléfono': this.state.formData.countryCode + this.state.formData.phone,
                    'País': this.getCountryFromCode(this.state.formData.countryCode),
                    'Captura de Apuesta': [{
                        filename: this.state.uploadedFile.name,
                        url: `data:${this.state.uploadedFile.type};base64,${screenshotBase64}`
                    }],
                    'Fecha de Participación': new Date().toISOString(),
                    'Estado': 'Verificado',
                    'IP': await this.getUserIP(),
                    'User Agent': navigator.userAgent,
                    'Timestamp': Date.now()
                }
            };

            const response = await fetch(this.config.airtableUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.airtableToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(airtableData)
            });

            if (response.ok) {
                this.showSuccess();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Error al guardar en Airtable');
            }
        } catch (error) {
            console.error('Airtable submission error:', error);
            alert('Hubo un error al procesar tu participación. Por favor, intenta nuevamente.');
        } finally {
            this.showLoading(false);
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error getting IP:', error);
            return 'Unknown';
        }
    }

    getCountryFromCode(code) {
        const countries = {
            '+56': 'Chile',
            '+54': 'Argentina',
            '+57': 'Colombia',
            '+51': 'Perú',
            '+58': 'Venezuela',
            '+593': 'Ecuador',
            '+591': 'Bolivia',
            '+595': 'Paraguay',
            '+598': 'Uruguay'
        };
        return countries[code] || 'Unknown';
    }

    showEmailOtpCard() {
        const card = document.getElementById('emailOtpCard');
        if (card) {
            card.style.display = 'block';
            // Focus first OTP input
            const firstInput = card.querySelector('.otp-input');
            if (firstInput) firstInput.focus();
        }
    }

    hideEmailOtpCard() {
        const card = document.getElementById('emailOtpCard');
        if (card) card.style.display = 'none';
    }

    showSmsOtpCard() {
        const card = document.getElementById('smsOtpCard');
        if (card) {
            card.style.display = 'block';
            // Focus first OTP input
            const firstInput = card.querySelector('.otp-input');
            if (firstInput) firstInput.focus();
        }
    }

    hideSmsOtpCard() {
        const card = document.getElementById('smsOtpCard');
        if (card) card.style.display = 'none';
    }

    showSuccess() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'flex';
            // Auto-close modal after 3 seconds
            setTimeout(() => {
                modal.style.display = 'none';
            }, 3000);
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showValidation(field, type, message) {
        const validationElement = document.getElementById(`${field}Validation`);
        if (validationElement) {
            validationElement.className = `validation-message ${type}`;

            const icon = type === 'error' ? '❌' : '✅';
            validationElement.innerHTML = `${icon} ${message}`;
        }
    }

    clearValidation(field) {
        const validationElement = document.getElementById(`${field}Validation`);
        if (validationElement) {
            validationElement.innerHTML = '';
            validationElement.className = 'validation-message';
        }
    }
}

// Global function for removing file (called from HTML)
function removeFile() {
    if (window.rushbetGiveawayForm) {
        window.rushbetGiveawayForm.removeFile();
    }
}

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.rushbetGiveawayForm = new RushbetGiveawayForm();
});

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RushbetGiveawayForm;
}