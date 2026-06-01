import React, { useState } from 'react';
import { Home, ArrowLeft, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

// You can configure your business WhatsApp number here (include country code, no "+" or spaces)
export default function PublicInquiryScreen({ onSwitchToLogin }) {
  const [defaultDealerPhone, setDefaultDealerPhone] = React.useState("918226811810");

  React.useEffect(() => {
    const fetchContactSetting = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/settings/contact');
        if (response.ok) {
          const data = await response.json();
          if (data.whatsappNumber) {
            setDefaultDealerPhone(data.whatsappNumber);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dynamic settings contact phone:", error);
      }
    };
    fetchContactSetting();
  }, []);

  const DEALER_WHATSAPP = localStorage.getItem('propdeal_user_phone') || defaultDealerPhone;
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [requirement, setRequirement] = useState('2BHK Flat');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState('');
  const [submitType, setSubmitType] = useState(''); // 'website' or 'whatsapp'

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert("Bhai, kripya apna naam aur mobile number fill karein.");
      return;
    }

    setLoading(true);
    setSubmitType(type);

    const leadData = {
      name,
      mobile,
      requirement,
      status: 'New Lead',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
    };

    try {
      // First, save the lead in the MySQL CRM Database
      const response = await fetch('http://127.0.0.1:5000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        const result = await response.json();
        setSubmittedLeadId(result.id || 'L00X');
        setSuccess(true);

        // If the user selected WhatsApp, redirect them to WhatsApp Web/App
        if (type === 'whatsapp') {
          const waMessage = `Hi PropDeal! My name is ${name}. I am looking for a ${requirement}. My contact number is ${mobile}. Let's connect!`;
          const encodedMessage = encodeURIComponent(waMessage);
          const waUrl = `https://wa.me/${DEALER_WHATSAPP}?text=${encodedMessage}`;
          
          // Open WhatsApp in a new tab
          window.open(waUrl, '_blank');
        }
      } else {
        throw new Error('Could not submit inquiry');
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      alert("❌ Submission Error: Server se connect nahi ho paya. Lekin aap WhatsApp par direct message bhej sakte hain!");
      
      // Fallback: If DB is offline, we can still redirect them to WhatsApp so the lead is not lost
      if (type === 'whatsapp') {
        const waMessage = `Hi PropDeal! My name is ${name}. I am looking for a ${requirement}. My contact number is ${mobile}. Let's connect!`;
        const encodedMessage = encodeURIComponent(waMessage);
        const waUrl = `https://wa.me/${DEALER_WHATSAPP}?text=${encodedMessage}`;
        window.open(waUrl, '_blank');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setMobile('');
    setRequirement('2BHK Flat');
    setSuccess(false);
  };

  return (
    <div className="auth-wrapper" style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* LEFT COLUMN: Public Inquiry Form or Success State */}
      <div className="auth-left-col">
        <div className="auth-form-container" style={{ maxWidth: '460px' }}>
          
          {/* Header Branding */}
          <div className="auth-brand-row">
            <div className="auth-logo-box">
              <Home size={22} strokeWidth={2.5} />
            </div>
            <span className="auth-brand-name">PropDeal Portal</span>
          </div>

          {!success ? (
            <>
              {/* Form Welcome Header */}
              <div className="auth-form-header">
                <h2>Direct Property Inquiry</h2>
                <p>Apni requirement fill karein aur hamare agent aapse turant sampark karenge.</p>
              </div>

              {/* Form Elements */}
              <form className="auth-form-element" onSubmit={(e) => e.preventDefault()}>
                
                {/* Client Name */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="auth-label">Aapka Naam / Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Client Mobile */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="auth-label">Mobile Number *</label>
                  <div className="auth-phone-input-row">
                    <select className="auth-phone-select" disabled>
                      <option value="+91">+91</option>
                    </select>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="10-digit phone number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Requirement Type */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="auth-label">Property Requirement *</label>
                  <select
                    className="auth-phone-select"
                    style={{ width: '100%', padding: '10px' }}
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    disabled={loading}
                  >
                    <option value="2BHK Flat">2BHK Flat / Apartment</option>
                    <option value="3BHK Flat">3BHK Flat / Apartment</option>
                    <option value="House">House / Villa</option>
                    <option value="Plot">Plot / Land</option>
                    <option value="Shop">Commercial Shop</option>
                    <option value="Office Space">Office Space</option>
                  </select>
                </div>

                {/* Submit Options Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  
                  {/* Website Database Submit */}
                  <button
                    type="button"
                    className="auth-submit-btn"
                    style={{ 
                      background: 'var(--primary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px' 
                    }}
                    onClick={(e) => handleSubmit(e, 'website')}
                    disabled={loading}
                  >
                    <Send size={16} />
                    {loading && submitType === 'website' ? 'Submitting...' : 'Website Par Submit Karein'}
                  </button>

                  {/* WhatsApp Direct Submit */}
                  <button
                    type="button"
                    className="auth-submit-btn"
                    style={{ 
                      background: 'var(--success-icon)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px' 
                    }}
                    onClick={(e) => handleSubmit(e, 'whatsapp')}
                    disabled={loading}
                  >
                    <MessageSquare size={16} />
                    {loading && submitType === 'whatsapp' ? 'Submitting...' : 'WhatsApp Par Chat Karein'}
                  </button>

                </div>

              </form>

              {/* Navigation Back */}
              <div className="auth-switcher-row" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="auth-link" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 'auto' }}
                  onClick={onSwitchToLogin}
                >
                  <ArrowLeft size={14} />
                  Back to Agent Login
                </button>
              </div>
            </>
          ) : (
            /* Success View */
            <div style={{ textAlign: 'center', padding: '20px 10px', animation: 'fade-in 0.4s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--success-icon)' }}>
                <CheckCircle2 size={64} strokeWidth={1.5} />
              </div>
              
              <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' }}>
                Dhanyawad, {name}!
              </h2>
              
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                Aapki inquiry **{requirement}** ke liye successfully registered ho gayi hai. Hamari team jald hi mobile number **+91 {mobile}** par aapse contact karegi.
              </p>

              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Inquiry Lead ID</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>{submittedLeadId}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{ background: 'var(--success-icon)', display: 'flex', alignItems: 'center', justify: 'center', gap: '8px' }}
                  onClick={() => {
                    const waMessage = `Hi PropDeal! My name is ${name}. I am looking for a ${requirement}. My contact number is ${mobile}. Let's connect!`;
                    const waUrl = `https://wa.me/${DEALER_WHATSAPP}?text=${encodeURIComponent(waMessage)}`;
                    window.open(waUrl, '_blank');
                  }}
                >
                  <MessageSquare size={16} />
                  Chat on WhatsApp Again
                </button>

                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
                  onClick={handleReset}
                >
                  Add Another Inquiry
                </button>
              </div>

              <button 
                type="button" 
                className="auth-link" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 'auto', marginTop: '24px' }}
                onClick={onSwitchToLogin}
              >
                <ArrowLeft size={14} />
                Go to Agent Login
              </button>
            </div>
          )}

          {/* Footer branding */}
          <div className="auth-footer-row" style={{ marginTop: '30px' }}>
            <span>PropDeal CRM 2026</span>
            <span className="dot">•</span>
            <span>Fast Lead Engine</span>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: Skyscraper panel matching auth pages */}
      <div className="auth-right-col">
        <div className="auth-image-gradient-overlay" />
        <div className="auth-branding-panel">
          <h2>Ghar Dhoondhna Hua Aasan.</h2>
          <h2>Submit on Web, Chat on WhatsApp.</h2>
          <p>The Complete Management Platform for Real Estate</p>
        </div>
      </div>
    </div>
  );
}
