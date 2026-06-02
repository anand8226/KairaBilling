import React, { useState } from 'react';
import { Eye, EyeOff, Home, ArrowLeft } from 'lucide-react';

export default function SignupScreen({ onSwitchToLogin, onBackToWebsite }) {
  // Base fields
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Expanded fields matching user's updated SQL schema
  const [role, setRole] = useState('Agent'); // Roles: 'Super Admin', 'Manager', 'Agent'
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password || !name || !email) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Fetch: Register API using explicit IPv4 loopback
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
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
          state
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`✅ Account Created Successfully in MySQL! \nWelcome, ${data.user.fullName}! \n\nPlease log in using your registered phone number and password.`);
        onSwitchToLogin(); // Route to Login view!
      } else {
        alert(`❌ Registration Failed: ${data.error || 'Server error'}`);
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
      {/* LEFT COLUMN: Signup Form */}
      <div className="auth-left-col">
        <div className="auth-form-container" style={{ maxWidth: '460px' }}>
          
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
            <img 
              src="/kaira_logo.svg" 
              alt="Kaira Deal Logo" 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                objectFit: 'cover',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }} 
            />
            <span className="auth-brand-name">Kaira Deal</span>
          </div>

          {/* Form Header */}
          <div className="auth-form-header">
            <h2>Create Your Account</h2>
            <p>Welcome! Please enter your details.</p>
          </div>

          {/* Actual Form */}
          <form className="auth-form-element" onSubmit={handleSubmit}>
            
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="auth-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Email Address */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="auth-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Company Name & Role Selector */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group" style={{ flex: 1.2 }}>
                <label className="auth-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group" style={{ flex: 0.8 }}>
                <label className="auth-label">Select Role *</label>
                <select
                  className="auth-phone-select"
                  style={{ width: '100%', padding: '10px' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>
            </div>

            {/* City & State inputs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="auth-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="auth-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={loading}
                />
              </div>
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

            {/* Main Submit Action */}
            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Sign Up'}
            </button>
          </form>

          {/* Swap modes switcher link */}
          <div className="auth-switcher-row">
            <span>Already have an account? </span>
            <a href="#toggle" className="auth-link" onClick={onSwitchToLogin}>
              Log In
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
            <span>Kaira Deal 2026</span>
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
