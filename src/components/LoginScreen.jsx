import React, { useState } from 'react';
import { Eye, EyeOff, Home, ArrowLeft } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess, onSwitchToSignup, onBackToWebsite }) {
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('Agent'); // Roles: 'Super Admin', 'Manager', 'Agent'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

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
                  alert("A password reset verification code has been dispatched to your registered phone number.");
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
    </div>
  );
}
