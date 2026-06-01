import React, { useState } from 'react';
import { Eye, EyeOff, Home, ArrowLeft, X, KeyRound, Smartphone, CheckCircle2 } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess, onSwitchToSignup, onBackToWebsite }) {
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('Agent'); // Roles: 'Super Admin', 'Manager', 'Agent'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot password wizard states
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Phone input, 2 = OTP & Password reset
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotShowPass, setForgotShowPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Fetch: Login API, passing credentials AND the selected loginRole
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          countryCode, 
          phoneNumber: phone, 
          password,
          role: loginRole 
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        alert(`❌ Login Failed: ${data.error || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('API Fetch error:', error);
      alert(`❌ Connection Error: Backend server is unreachable on http://127.0.0.1:5000. \n\nPlease verify that the backend Node server is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* LEFT COLUMN: Login Form */}
      <div className="auth-left-col">
        <div className="auth-form-container">
          
          {onBackToWebsite && (
            <button 
              type="button" 
              className="auth-link" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px', fontSize: '13px', fontWeight: '600' }}
              onClick={onBackToWebsite}
            >
              <ArrowLeft size={14} /> Back to Website
            </button>
          )}

          {/* Logo Section */}
          <div className="auth-brand-row">
            <div className="auth-logo-box">
              <Home size={22} strokeWidth={2.5} />
            </div>
            <span className="auth-brand-name">PropDeal</span>
          </div>

          {/* Form Header */}
          <div className="auth-form-header">
            <h2>Login To Your Account</h2>
            <p>Welcome! Please enter your details.</p>
          </div>

          {/* Actual Form */}
          <form className="auth-form-element" onSubmit={handleSubmit}>
            
            {/* Login Role Selector */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="auth-label">Login As / Role *</label>
              <select
                className="auth-phone-select"
                style={{ width: '100%', padding: '10px' }}
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
                disabled={loading}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Manager">Manager</option>
                <option value="Agent">Agent</option>
              </select>
            </div>

            {/* Phone input row */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="auth-label">Phone Number *</label>
              <div className="auth-phone-input-row">
                <select
                  className="auth-phone-select"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={loading}
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+84">+84</option>
                  <option value="+971">+971</option>
                </select>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password input row */}
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="auth-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '40px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot row */}
            <div className="auth-remember-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              <a 
                href="#forgot" 
                className="auth-link"
                onClick={(e) => {
                  e.preventDefault();
                  setForgotPhone('');
                  setForgotOtp('');
                  setForgotNewPassword('');
                  setForgotStep(1);
                  setForgotSuccess(false);
                  setDemoOtp('');
                  setForgotModalOpen(true);
                }}
              >
                Forgot password
              </a>
            </div>

            {/* Main Submit Action */}
            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Log In'}
            </button>
          </form>

          {/* Swap modes switcher link */}
          <div className="auth-switcher-row">
            <span>Don't have an account? </span>
            <a href="#toggle" className="auth-link" onClick={onSwitchToSignup}>
              Register
            </a>
          </div>

          {/* Public customer inquiry switcher link */}
          {onBackToWebsite && (
            <div className="auth-switcher-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
              <span>Are you a Client / Buyer? </span>
              <a href="#inquiry" className="auth-link" style={{ fontWeight: '700', color: 'var(--success-icon)' }} onClick={(e) => { e.preventDefault(); onBackToWebsite(); }}>
                Browse Plots & Submit Inquiry
              </a>
            </div>
          )}

          {/* Footer copyright list */}
          <div className="auth-footer-row">
            <span>PropDeal 2026</span>
            <span className="dot">•</span>
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
            <span className="dot">•</span>
            <a href="#team" onClick={(e) => e.preventDefault()}>Team</a>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: Skyscraper panel */}
      <div className="auth-right-col">
        <div className="auth-image-gradient-overlay" />
        <div className="auth-branding-panel">
          <h2>Your Property, In Motion.</h2>
          <h2>Your Reach, Expanded.</h2>
          <p>The Complete Management Platform for Real Estate</p>
        </div>
      </div>
      {/* -------------------------------------------------------------
        * GLASSMORPHIC FORGOT PASSWORD OTP WIZARD MODAL
        * ------------------------------------------------------------- */}
      {forgotModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setForgotModalOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '420px', padding: '28px', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} className="text-primary" />
                Reset Account Password
              </h3>
              <button type="button" onClick={() => setForgotModalOpen(false)} style={{ color: 'var(--text-light)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {!forgotSuccess ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (forgotStep === 1) {
                  // Step 1: Send OTP
                  if (!forgotPhone) return;
                  setForgotLoading(true);
                  try {
                    const response = await fetch('http://127.0.0.1:5000/api/auth/forgot-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phoneNumber: forgotPhone })
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setDemoOtp(data.devOtp || '');
                      setForgotStep(2);
                    } else {
                      alert(`❌ Error: ${data.error || 'Request failed'}`);
                    }
                  } catch (err) {
                    alert("❌ Connection Error: Backend server is unreachable.");
                  } finally {
                    setForgotLoading(false);
                  }
                } else {
                  // Step 2: Reset Password
                  if (!forgotOtp || !forgotNewPassword) return;
                  setForgotLoading(true);
                  try {
                    const response = await fetch('http://127.0.0.1:5000/api/auth/reset-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        phoneNumber: forgotPhone,
                        otp: forgotOtp,
                        newPassword: forgotNewPassword
                      })
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setForgotSuccess(true);
                    } else {
                      alert(`❌ Reset Failed: ${data.error || 'Verification error'}`);
                    }
                  } catch (err) {
                    alert("❌ Connection Error: Backend server is unreachable.");
                  } finally {
                    setForgotLoading(false);
                  }
                }
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Step Indicators */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ flex: 1, height: '4px', background: 'var(--primary)', borderRadius: '2px' }} />
                    <div style={{ flex: 1, height: '4px', background: forgotStep === 2 ? 'var(--primary)' : 'var(--border-color)', borderRadius: '2px', transition: 'all 0.3s' }} />
                  </div>

                  {forgotStep === 1 ? (
                    /* Step 1: Phone submission */
                    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px' }}>
                        Enter your registered phone number. We will dispatch a 6-digit OTP code to verify your ownership.
                      </p>
                      <div className="form-group">
                        <label className="auth-label">Registered Phone Number *</label>
                        <div className="auth-phone-input-row">
                          <select className="auth-phone-select" disabled>
                            <option value="+91">+91</option>
                          </select>
                          <input 
                            type="tel"
                            className="form-input"
                            placeholder="e.g. 9999999999"
                            value={forgotPhone}
                            onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            required
                            disabled={forgotLoading}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Step 2: OTP and Password input */
                    <div style={{ animation: 'fade-in 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        An OTP code has been dispatched. Enter the code and set your new password.
                      </p>

                      {/* Demo Mode helper banner */}
                      {demoOtp && (
                        <div style={{ padding: '10px 12px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '8px', fontSize: '11.5px', color: 'var(--primary)', fontWeight: '600' }}>
                          💡 [Demo Mode]: The generated OTP is <strong>{demoOtp}</strong> (also logged in backend terminal).
                        </div>
                      )}

                      {/* OTP Code */}
                      <div className="form-group">
                        <label className="auth-label">Enter 6-Digit OTP *</label>
                        <input 
                          type="text"
                          className="form-input"
                          style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '16px', fontWeight: '700' }}
                          placeholder="000000"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          disabled={forgotLoading}
                        />
                      </div>

                      {/* New Password */}
                      <div className="form-group">
                        <label className="auth-label">New Secure Password *</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={forgotShowPass ? 'text' : 'password'}
                            className="form-input"
                            style={{ paddingRight: '40px' }}
                            placeholder="Min 6 characters"
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            required
                            disabled={forgotLoading}
                          />
                          <button
                            type="button"
                            className="auth-eye-btn"
                            onClick={() => setForgotShowPass(!forgotShowPass)}
                            disabled={forgotLoading}
                          >
                            {forgotShowPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: '600' }} 
                    onClick={() => {
                      if (forgotStep === 2) {
                        setForgotStep(1);
                      } else {
                        setForgotModalOpen(false);
                      }
                    }}
                    disabled={forgotLoading}
                  >
                    {forgotStep === 2 ? "Back" : "Cancel"}
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: '600', background: 'var(--primary)' }}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Processing..." : forgotStep === 1 ? "Send OTP Code" : "Reset Password"}
                  </button>
                </div>
              </form>
            ) : (
              /* Success View */
              <div style={{ textAlign: 'center', padding: '10px 0', animation: 'fade-in 0.4s ease-out' }}>
                <div style={{ color: 'var(--success-icon)', marginBottom: '16px' }}>
                  <CheckCircle2 size={56} style={{ margin: 'auto' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Password Updated!</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                  Your password has been successfully updated in MySQL database. You can now log in using your new credentials.
                </p>
                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{ width: '100%', margin: 0 }}
                  onClick={() => setForgotModalOpen(false)}
                >
                  Back to Login
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
