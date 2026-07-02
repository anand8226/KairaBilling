import { AppState, renderApp } from '../main.js';

// Local variables to preserve form values when switching view modules
let selectedModule = 'PropertyDealer';
let countryCode = '+91';
let phone = '';
let name = '';
let email = '';
let password = '';
let role = 'Agent'; // Default adaptive role for PropertyDealer
let companyName = '';
let city = '';
let stateName = '';
let showPassword = false;
let rememberMe = false;
let loading = false;

// Forgot password modal state
let forgotModalOpen = false;
let forgotStep = 1;
let forgotPhone = '';
let forgotOtp = '';
let forgotNewPassword = '';
let forgotShowPass = false;
let forgotLoading = false;
let forgotSuccess = false;
let demoOtp = '';

export function renderAuth(state) {
  const isPharmacy = selectedModule === 'Pharmacy';

  // Return the main login or registration template
  if (state.publicViewMode === 'login') {
    return renderLoginView(isPharmacy);
  } else {
    return renderSignupView(isPharmacy);
  }
}

function renderLoginView(isPharmacy) {
  return `
    <div class="auth-wrapper ${isPharmacy ? 'pharmacy-theme' : ''}" style="${isPharmacy ? '--primary: hsl(160, 84%, 39%); --primary-hover: hsl(160, 84%, 33%); --primary-glow: rgba(16, 185, 129, 0.25);' : ''}">
      <!-- LEFT COLUMN: Login Form -->
      <div class="auth-left-col">
        <div class="auth-form-container">
          
          <button type="button" class="auth-link" id="auth-back-btn" style="display: flex; align-items: center; gap: 6px; mb: 18px; font-size: 13px; font-weight: 600; background: none; border: none; cursor: pointer;">
            ➔ Back to Website
          </button>

          <!-- Logo Section -->
          <div class="auth-brand-row">
            <img src="kaira_logo.svg" alt="Logo" style="width: 36px; height: 36px; border-radius: 10px; object-fit: cover;" />
            <span class="auth-brand-name">${isPharmacy ? "Kaira Pharmacy" : "Kaira Deal"}</span>
          </div>

          <!-- Form Header -->
          <div class="auth-form-header">
            <h2>${isPharmacy ? "Login To Pharmacy Console" : "Login To Your Account"}</h2>
            <p>Welcome! Please enter your details.</p>
          </div>

          <!-- Actual Form -->
          <form class="auth-form-element" id="login-form-submit">
            
            <!-- Select App Module -->
            <div class="form-group" style="margin-bottom: 16px;">
              <label class="auth-label">Select Module / System *</label>
              <select class="auth-phone-select" id="login-module-select" style="width: 100%; padding: 10px;" ${loading ? 'disabled' : ''}>
                <option value="PropertyDealer" ${selectedModule === 'PropertyDealer' ? 'selected' : ''}>Real Estate & Property Dealer</option>
                <option value="Pharmacy" ${selectedModule === 'Pharmacy' ? 'selected' : ''}>Pharmacy Management System</option>
              </select>
            </div>

            <!-- Login Role Selector -->
            <div class="form-group" style="margin-bottom: 16px;">
              <label class="auth-label">Login As / Role *</label>
              <select class="auth-phone-select" id="login-role-select" style="width: 100%; padding: 10px;" ${loading ? 'disabled' : ''}>
                ${isPharmacy ? `
                  <option value="Super Admin" ${role === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
                  <option value="Admin" ${role === 'Admin' ? 'selected' : ''}>Admin</option>
                  <option value="Pharmacist" ${role === 'Pharmacist' ? 'selected' : ''}>Pharmacist</option>
                  <option value="Cashier" ${role === 'Cashier' ? 'selected' : ''}>Cashier</option>
                ` : `
                  <option value="Super Admin" ${role === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
                  <option value="Manager" ${role === 'Manager' ? 'selected' : ''}>Manager</option>
                  <option value="Agent" ${role === 'Agent' ? 'selected' : ''}>Agent</option>
                `}
              </select>
            </div>

            <!-- Phone input row -->
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="auth-label">Phone Number *</label>
              <div class="auth-phone-input-row">
                <select class="auth-phone-select" id="login-country-code" ${loading ? 'disabled' : ''}>
                  <option value="+91" ${countryCode === '+91' ? 'selected' : ''}>+91</option>
                  <option value="+1" ${countryCode === '+1' ? 'selected' : ''}>+1</option>
                  <option value="+44" ${countryCode === '+44' ? 'selected' : ''}>+44</option>
                </select>
                <input type="tel" class="form-input" id="login-phone" placeholder="Enter phone number" value="${phone}" required ${loading ? 'disabled' : ''} />
              </div>
            </div>

            <!-- Password input row -->
            <div class="form-group" style="margin-bottom: 18px;">
              <label class="auth-label">Password *</label>
              <div style="position: relative;">
                <input type="${showPassword ? 'text' : 'password'}" class="form-input" id="login-password" placeholder="Enter password" value="${password}" required style="padding-right: 40px;" ${loading ? 'disabled' : ''} />
                <button type="button" class="auth-eye-btn" id="login-toggle-password" style="position: absolute; right: 10px; top: 10px; background: none; border: none; cursor: pointer;">
                  ${showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <!-- Remember me & Forgot row -->
            <div class="auth-remember-row">
              <label class="auth-checkbox-label">
                <input type="checkbox" id="login-remember" ${rememberMe ? 'checked' : ''} ${loading ? 'disabled' : ''} />
                <span>Remember me</span>
              </label>
              <a href="#forgot" class="auth-link" id="login-forgot-trigger">Forgot password</a>
            </div>

            <!-- Main Submit Action -->
            <button type="submit" class="auth-submit-btn" ${loading ? 'disabled' : ''}>
              ${loading ? 'Please wait...' : 'Log In'}
            </button>
          </form>

          <!-- Switch to register -->
          <div class="auth-switcher-row">
            <span>Don't have an account? </span>
            <a href="#signup" class="auth-link" id="switch-to-signup">Register</a>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Branding skyscraper -->
      <div class="auth-right-col">
        <div class="auth-image-gradient-overlay"></div>
        <div class="auth-branding-panel">
          ${isPharmacy ? `
            <h2>Your Pharmacy, In Control.</h2>
            <h2>Your Stock, Optimized.</h2>
            <p>The Complete Management Platform for Medicines & Billing</p>
          ` : `
            <h2>Your Property, In Motion.</h2>
            <h2>Your Reach, Expanded.</h2>
            <p>The Complete Management Platform for Real Estate</p>
          `}
        </div>
      </div>

      <!-- OTP RESET MODAL -->
      ${renderForgotModal()}
    </div>
  `;
}

function renderSignupView(isPharmacy) {
  return `
    <div class="auth-wrapper ${isPharmacy ? 'pharmacy-theme' : ''}" style="${isPharmacy ? '--primary: hsl(160, 84%, 39%); --primary-hover: hsl(160, 84%, 33%); --primary-glow: rgba(16, 185, 129, 0.25);' : ''}">
      <!-- LEFT COLUMN: Signup Form -->
      <div class="auth-left-col">
        <div class="auth-form-container" style="max-width: 460px;">
          
          <button type="button" class="auth-link" id="auth-back-btn" style="display: flex; align-items: center; gap: 6px; mb: 18px; font-size: 13px; font-weight: 600; background: none; border: none; cursor: pointer;">
            ➔ Back to Website
          </button>

          <!-- Logo Section -->
          <div class="auth-brand-row">
            <img src="kaira_logo.svg" alt="Logo" style="width: 36px; height: 36px; border-radius: 10px; object-fit: cover;" />
            <span class="auth-brand-name">${isPharmacy ? "Kaira Pharmacy" : "Kaira Deal"}</span>
          </div>

          <!-- Form Header -->
          <div class="auth-form-header">
            <h2>${isPharmacy ? "Register Pharmacy Account" : "Create Your Account"}</h2>
            <p>Welcome! Please enter your details.</p>
          </div>

          <!-- Actual Form -->
          <form class="auth-form-element" id="signup-form-submit">
            
            <!-- Select App Module -->
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="auth-label">Select Module / System *</label>
              <select class="auth-phone-select" id="signup-module-select" style="width: 100%; padding: 10px;" ${loading ? 'disabled' : ''}>
                <option value="PropertyDealer" ${selectedModule === 'PropertyDealer' ? 'selected' : ''}>Real Estate & Property Dealer</option>
                <option value="Pharmacy" ${selectedModule === 'Pharmacy' ? 'selected' : ''}>Pharmacy Management System</option>
              </select>
            </div>

            <!-- Full Name -->
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="auth-label">Full Name *</label>
              <input type="text" class="form-input" id="signup-name" placeholder="Enter your name" value="${name}" required ${loading ? 'disabled' : ''} />
            </div>

            <!-- Email Address -->
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="auth-label">Email Address *</label>
              <input type="email" class="form-input" id="signup-email" placeholder="Enter your email" value="${email}" required ${loading ? 'disabled' : ''} />
            </div>

            <!-- Company Name & Role Selector -->
            <div style="display: flex; gap: 12px; margin-bottom: 14px;">
              <div class="form-group" style="flex: 1.2;">
                <label class="auth-label">${isPharmacy ? "Medical Store Name" : "Company Name"}</label>
                <input type="text" class="form-input" id="signup-company" placeholder="${isPharmacy ? "e.g. Kaira Medicos" : "Enter company name"}" value="${companyName}" ${loading ? 'disabled' : ''} />
              </div>
              <div class="form-group" style="flex: 0.8;">
                <label class="auth-label">Select Role *</label>
                <select class="auth-phone-select" id="signup-role" style="width: 100%; padding: 10px;" ${loading ? 'disabled' : ''}>
                  ${isPharmacy ? `
                    <option value="Super Admin" ${role === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
                    <option value="Admin" ${role === 'Admin' ? 'selected' : ''}>Admin</option>
                    <option value="Pharmacist" ${role === 'Pharmacist' ? 'selected' : ''}>Pharmacist</option>
                    <option value="Cashier" ${role === 'Cashier' ? 'selected' : ''}>Cashier</option>
                  ` : `
                    <option value="Super Admin" ${role === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
                    <option value="Manager" ${role === 'Manager' ? 'selected' : ''}>Manager</option>
                    <option value="Agent" ${role === 'Agent' ? 'selected' : ''}>Agent</option>
                  `}
                </select>
              </div>
            </div>

            <!-- City & State inputs -->
            <div style="display: flex; gap: 12px; margin-bottom: 14px;">
              <div class="form-group" style="flex: 1;">
                <label class="auth-label">City</label>
                <input type="text" class="form-input" id="signup-city" placeholder="e.g. Mumbai" value="${city}" ${loading ? 'disabled' : ''} />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="auth-label">State</label>
                <input type="text" class="form-input" id="signup-state" placeholder="e.g. Maharashtra" value="${stateName}" ${loading ? 'disabled' : ''} />
              </div>
            </div>

            <!-- Phone input row -->
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="auth-label">Phone Number *</label>
              <div class="auth-phone-input-row">
                <select class="auth-phone-select" id="signup-country-code" ${loading ? 'disabled' : ''}>
                  <option value="+91" ${countryCode === '+91' ? 'selected' : ''}>+91</option>
                  <option value="+1" ${countryCode === '+1' ? 'selected' : ''}>+1</option>
                  <option value="+44" ${countryCode === '+44' ? 'selected' : ''}>+44</option>
                </select>
                <input type="tel" class="form-input" id="signup-phone" placeholder="Enter phone number" value="${phone}" required ${loading ? 'disabled' : ''} />
              </div>
            </div>

            <!-- Password input row -->
            <div class="form-group" style="margin-bottom: 18px;">
              <label class="auth-label">Password *</label>
              <div style="position: relative;">
                <input type="${showPassword ? 'text' : 'password'}" class="form-input" id="signup-password" placeholder="Enter password" value="${password}" required style="padding-right: 40px;" ${loading ? 'disabled' : ''} />
                <button type="button" class="auth-eye-btn" id="signup-toggle-password" style="position: absolute; right: 10px; top: 10px; background: none; border: none; cursor: pointer;">
                  ${showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <!-- Main Submit Action -->
            <button type="submit" class="auth-submit-btn" ${loading ? 'disabled' : ''}>
              ${loading ? 'Please wait...' : 'Sign Up'}
            </button>
          </form>

          <!-- Switch to login -->
          <div class="auth-switcher-row">
            <span>Already have an account? </span>
            <a href="#login" class="auth-link" id="switch-to-login">Log In</a>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Branding skyscraper -->
      <div class="auth-right-col">
        <div class="auth-image-gradient-overlay"></div>
        <div class="auth-branding-panel">
          ${isPharmacy ? `
            <h2>Your Pharmacy, In Control.</h2>
            <h2>Your Stock, Optimized.</h2>
            <p>The Complete Management Platform for Medicines & Billing</p>
          ` : `
            <h2>Your Property, In Motion.</h2>
            <h2>Your Reach, Expanded.</h2>
            <p>The Complete Management Platform for Real Estate</p>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderForgotModal() {
  if (!forgotModalOpen) return '';

  return `
    <div class="modal-overlay" style="z-index: 99999; display: flex; align-items: center; justify-content: center;">
      <div class="modal-container" style="max-width: 420px; padding: 28px; background: #fff; border-radius: 16px; box-shadow: var(--shadow-lg);" onclick="event.stopPropagation()">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 16.5px; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            🔑 Reset Account Password
          </h3>
          <button type="button" id="forgot-modal-close" style="background:none; border:none; color: var(--text-light); cursor: pointer; font-size: 16px;">✕</button>
        </div>

        ${!forgotSuccess ? `
          <form id="forgot-password-form">
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <div style="flex: 1; height: 4px; background: var(--primary); border-radius: 2px;"></div>
                <div style="flex: 1; height: 4px; background: ${forgotStep === 2 ? 'var(--primary)' : 'var(--border-color)'}; border-radius: 2px; transition: all 0.3s;"></div>
              </div>

              ${forgotStep === 1 ? `
                <div>
                  <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px;">
                    Enter your registered phone number. We will dispatch a 6-digit OTP code to verify your ownership.
                  </p>
                  <div class="form-group">
                    <label class="auth-label">Registered Phone Number *</label>
                    <div class="auth-phone-input-row">
                      <select class="auth-phone-select" disabled><option>+91</option></select>
                      <input type="tel" class="form-input" id="forgot-phone-input" placeholder="e.g. 9999999999" value="${forgotPhone}" required ${forgotLoading ? 'disabled' : ''} />
                    </div>
                  </div>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 14px;">
                  <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">
                    An OTP code has been dispatched. Enter the code and set your new password.
                  </p>
                  ${demoOtp ? `
                    <div style="padding: 10px 12px; background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.15); border-radius: 8px; font-size: 11.5px; color: var(--primary); font-weight: 600;">
                      💡 [Demo Mode]: The generated OTP is <strong>${demoOtp}</strong>.
                    </div>
                  ` : ''}
                  <div class="form-group">
                    <label class="auth-label">Enter 6-Digit OTP *</label>
                    <input type="text" class="form-input" id="forgot-otp-input" placeholder="000000" value="${forgotOtp}" required style="letter-spacing: 4px; text-align: center; font-size: 16px; font-weight: 700;" ${forgotLoading ? 'disabled' : ''} />
                  </div>
                  <div class="form-group">
                    <label class="auth-label">New Secure Password *</label>
                    <input type="${forgotShowPass ? 'text' : 'password'}" class="form-input" id="forgot-newpass-input" placeholder="Min 6 characters" value="${forgotNewPassword}" required ${forgotLoading ? 'disabled' : ''} />
                  </div>
                </div>
              `}
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 14px;">
              <button type="button" class="btn btn-secondary" id="forgot-back-btn" ${forgotLoading ? 'disabled' : ''}>
                ${forgotStep === 2 ? 'Back' : 'Cancel'}
              </button>
              <button type="submit" class="btn btn-primary" style="background: var(--primary); color: white; border: none; padding: 8px 16px; cursor: pointer;" ${forgotLoading ? 'disabled' : ''}>
                ${forgotLoading ? 'Processing...' : forgotStep === 1 ? 'Send OTP Code' : 'Reset Password'}
              </button>
            </div>
          </form>
        ` : `
          <div style="text-align: center; padding: 10px 0;">
            <div style="color: var(--success-icon); margin-bottom: 16px; font-size: 32px;">✓</div>
            <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">Password Updated!</h3>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">
              Your password has been successfully updated in MySQL database.
            </p>
            <button type="button" class="auth-submit-btn" id="forgot-success-close">Back to Login</button>
          </div>
        `}
      </div>
    </div>
  `;
}

export function bindAuthEvents() {
  // Back to website link
  const backBtn = document.getElementById('auth-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      AppState.publicViewMode = 'portal';
      window.location.hash = '';
      renderApp();
    });
  }

  // Switch between Login and Signup modes
  const toSignup = document.getElementById('switch-to-signup');
  if (toSignup) {
    toSignup.addEventListener('click', (e) => {
      e.preventDefault();
      AppState.publicViewMode = 'signup';
      window.location.hash = 'signup';
      renderApp();
    });
  }

  const toLogin = document.getElementById('switch-to-login');
  if (toLogin) {
    toLogin.addEventListener('click', (e) => {
      e.preventDefault();
      AppState.publicViewMode = 'login';
      window.location.hash = 'login';
      renderApp();
    });
  }

  // Handle module selection changes dynamically
  const loginModuleSelect = document.getElementById('login-module-select');
  if (loginModuleSelect) {
    loginModuleSelect.addEventListener('change', (e) => {
      selectedModule = e.target.value;
      role = selectedModule === 'Pharmacy' ? 'Admin' : 'Agent';
      renderApp();
    });
  }

  const signupModuleSelect = document.getElementById('signup-module-select');
  if (signupModuleSelect) {
    signupModuleSelect.addEventListener('change', (e) => {
      selectedModule = e.target.value;
      role = selectedModule === 'Pharmacy' ? 'Admin' : 'Agent';
      renderApp();
    });
  }

  // Track inputs on the fly to prevent losing inputs on re-render
  const inputsMapping = [
    { id: 'login-phone', set: (val) => { phone = val; } },
    { id: 'login-password', set: (val) => { password = val; } },
    { id: 'login-role-select', set: (val) => { role = val; } },
    { id: 'login-country-code', set: (val) => { countryCode = val; } },
    
    { id: 'signup-name', set: (val) => { name = val; } },
    { id: 'signup-email', set: (val) => { email = val; } },
    { id: 'signup-phone', set: (val) => { phone = val; } },
    { id: 'signup-password', set: (val) => { password = val; } },
    { id: 'signup-company', set: (val) => { companyName = val; } },
    { id: 'signup-city', set: (val) => { city = val; } },
    { id: 'signup-state', set: (val) => { stateName = val; } },
    { id: 'signup-role', set: (val) => { role = val; } },
    { id: 'signup-country-code', set: (val) => { countryCode = val; } },
  ];

  inputsMapping.forEach(mapping => {
    const el = document.getElementById(mapping.id);
    if (el) {
      el.addEventListener('input', (e) => mapping.set(e.target.value));
      el.addEventListener('change', (e) => mapping.set(e.target.value));
    }
  });

  // Toggle password visibility
  const loginTogglePass = document.getElementById('login-toggle-password');
  if (loginTogglePass) {
    loginTogglePass.addEventListener('click', () => {
      showPassword = !showPassword;
      renderApp();
    });
  }

  const signupTogglePass = document.getElementById('signup-toggle-password');
  if (signupTogglePass) {
    signupTogglePass.addEventListener('click', () => {
      showPassword = !showPassword;
      renderApp();
    });
  }

  // Handle Login submission
  const loginForm = document.getElementById('login-form-submit');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!phone || !password) return;
      loading = true;
      renderApp();

      try {
        const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ countryCode, phoneNumber: phone, password, role, appModule: selectedModule })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          // Success: Save details to AppState and localStorage
          AppState.isAuthenticated = true;
          AppState.userName = data.user.fullName;
          AppState.userRole = data.user.role;
          AppState.userId = data.user.id;
          AppState.userAvatar = data.user.profileImage || 'kaira_logo.svg';
          AppState.currentModule = data.user.appModule;
          AppState.activeTab = 'dashboard';

          localStorage.setItem('propdeal_auth', 'true');
          localStorage.setItem('propdeal_user_name', data.user.fullName);
          localStorage.setItem('propdeal_user_role', data.user.role);
          localStorage.setItem('propdeal_user_id', data.user.id);
          localStorage.setItem('propdeal_user_avatar', data.user.profileImage || 'kaira_logo.svg');
          localStorage.setItem('propdeal_app_module', data.user.appModule);

          window.location.hash = '';
          
          // Clear inputs
          phone = '';
          password = '';
          
          // Trigger data reload
          await import('../main.js').then(m => m.syncAppData());
        } else {
          alert(`❌ Login Failed: ${data.error || 'Invalid credentials'}`);
        }
      } catch (err) {
        alert('❌ Connection Error: Backend server is offline.');
      } finally {
        loading = false;
        renderApp();
      }
    });
  }

  // Handle Signup submission
  const signupForm = document.getElementById('signup-form-submit');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!phone || !password || !name || !email) return;
      loading = true;
      renderApp();

      try {
        const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: name,
            emailAddress: email,
            countryCode,
            phoneNumber: phone,
            password,
            role,
            companyName,
            city,
            state: stateName,
            appModule: selectedModule
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          alert(`✅ Account Created Successfully in MySQL! \nWelcome, ${data.user.fullName}! \n\nPlease log in using your registered credentials.`);
          
          // Reset form fields
          name = '';
          email = '';
          phone = '';
          password = '';
          companyName = '';
          city = '';
          stateName = '';

          AppState.publicViewMode = 'login';
          window.location.hash = 'login';
        } else {
          alert(`❌ Registration Failed: ${data.error || 'Server error'}`);
        }
      } catch (err) {
        alert('❌ Connection Error: Backend server is offline.');
      } finally {
        loading = false;
        renderApp();
      }
    });
  }

  // Forgot password triggers
  const forgotTrigger = document.getElementById('login-forgot-trigger');
  if (forgotTrigger) {
    forgotTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      forgotPhone = '';
      forgotOtp = '';
      forgotNewPassword = '';
      forgotStep = 1;
      forgotSuccess = false;
      demoOtp = '';
      forgotModalOpen = true;
      renderApp();
    });
  }

  const forgotClose = document.getElementById('forgot-modal-close');
  if (forgotClose) {
    forgotClose.addEventListener('click', () => {
      forgotModalOpen = false;
      renderApp();
    });
  }

  const forgotSuccessClose = document.getElementById('forgot-success-close');
  if (forgotSuccessClose) {
    forgotSuccessClose.addEventListener('click', () => {
      forgotModalOpen = false;
      renderApp();
    });
  }

  const forgotBackBtn = document.getElementById('forgot-back-btn');
  if (forgotBackBtn) {
    forgotBackBtn.addEventListener('click', () => {
      if (forgotStep === 2) {
        forgotStep = 1;
      } else {
        forgotModalOpen = false;
      }
      renderApp();
    });
  }

  // Track forgot password form inputs
  const forgotPhoneInput = document.getElementById('forgot-phone-input');
  if (forgotPhoneInput) {
    forgotPhoneInput.addEventListener('input', (e) => {
      forgotPhone = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  const forgotOtpInput = document.getElementById('forgot-otp-input');
  if (forgotOtpInput) {
    forgotOtpInput.addEventListener('input', (e) => {
      forgotOtp = e.target.value.replace(/\D/g, '').slice(0, 6);
    });
  }

  const forgotNewpassInput = document.getElementById('forgot-newpass-input');
  if (forgotNewpassInput) {
    forgotNewpassInput.addEventListener('input', (e) => {
      forgotNewPassword = e.target.value;
    });
  }

  // Handle forgot password form submit
  const forgotForm = document.getElementById('forgot-password-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (forgotStep === 1) {
        if (!forgotPhone) return;
        forgotLoading = true;
        renderApp();
        try {
          const res = await fetch('http://127.0.0.1:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: forgotPhone })
          });
          const data = await res.json();
          if (res.ok) {
            demoOtp = data.devOtp || '';
            forgotStep = 2;
            
            // Dispatch message via WhatsApp simulation
            if (data.devOtp) {
              const otpMessage = `*Kaira Deal Security Center*\n\nYour 6-digit OTP verification code to reset your account password is: *${data.devOtp}*`;
              const waUrl = `https://wa.me/91${forgotPhone}?text=${encodeURIComponent(otpMessage)}`;
              window.open(waUrl, '_blank');
            }
          } else {
            alert(`❌ Error: ${data.error || 'Request failed'}`);
          }
        } catch (err) {
          alert('❌ Connection Error: Backend server is offline.');
        } finally {
          forgotLoading = false;
          renderApp();
        }
      } else {
        if (!forgotOtp || !forgotNewPassword) return;
        forgotLoading = true;
        renderApp();
        try {
          const res = await fetch('http://127.0.0.1:5000/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: forgotPhone, otp: forgotOtp, newPassword: forgotNewPassword })
          });
          if (res.ok) {
            forgotSuccess = true;
          } else {
            const data = await res.json();
            alert(`❌ Reset Failed: ${data.error || 'Verification error'}`);
          }
        } catch (err) {
          alert('❌ Connection Error: Backend server is offline.');
        } finally {
          forgotLoading = false;
          renderApp();
        }
      }
    });
  }
}
