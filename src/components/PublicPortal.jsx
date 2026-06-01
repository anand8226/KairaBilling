import React, { useState } from 'react';
import { Home, Phone, Info, LayoutDashboard, LogIn, Send, MessageSquare, CheckCircle2, Search, Filter } from 'lucide-react';

const DEALER_WHATSAPP = "918226811810"; 

export default function PublicPortal({ properties = [], onLoginTrigger, onSignupTrigger }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'about' | 'contact'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  // Inquiry form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [requirement, setRequirement] = useState('2BHK Flat');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState('');
  const [submitType, setSubmitType] = useState(''); // 'website' or 'whatsapp'

  // Extract only "Available" properties for the public client showcase
  const publicProperties = properties.filter(p => p.status === 'Available');

  // Filter properties based on search query and property type
  const filteredProperties = publicProperties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  // Handle clicking "Enquire Now" on a property card
  const handlePropertyEnquiry = (property) => {
    setRequirement(property.type === 'Plot' ? 'Plot' : `${property.type} - ${property.name}`);
    setCustomMessage(`Hi, I am interested in "${property.name}" listing priced at ₹${new Intl.NumberFormat('en-IN').format(property.price)}. Please share more details.`);
    setActiveTab('contact');
    
    // Smooth scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInquirySubmit = async (e, type) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert("Kripya apna naam aur mobile number fill karein.");
      return;
    }

    setLoading(true);
    setSubmitType(type);

    const leadData = {
      name,
      mobile,
      requirement: `${requirement} (${customMessage.slice(0, 50)})`,
      status: 'New Lead',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
    };

    try {
      // Post new lead directly to DB CRM
      const response = await fetch('http://127.0.0.1:5000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        const result = await response.json();
        setSubmittedLeadId(result.id || 'L00X');
        setSuccess(true);

        if (type === 'whatsapp') {
          const waMessage = `Hi PropDeal! My name is ${name}. I am looking for a ${requirement}. \n*Message*: ${customMessage || 'I want more details.'}\n*Contact*: ${mobile}.`;
          const encodedMessage = encodeURIComponent(waMessage);
          const waUrl = `https://wa.me/${DEALER_WHATSAPP}?text=${encodedMessage}`;
          window.open(waUrl, '_blank');
        }
      } else {
        throw new Error('Post lead failed');
      }
    } catch (error) {
      console.error('Lead sync failed:', error);
      alert("⚠️ Lead submit nahi ho paayi, par aap WhatsApp par direct message bhej kar contact kar sakte hain!");
      if (type === 'whatsapp') {
        const waMessage = `Hi PropDeal! My name is ${name}. I am looking for a ${requirement}. \n*Message*: ${customMessage || 'I want more details.'}\n*Contact*: ${mobile}.`;
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
    setCustomMessage('');
    setRequirement('2BHK Flat');
    setSuccess(false);
  };

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-family)' }}>
      
      {/* 1. STICKY GLASSMORPHIC NAVBAR */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '14px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div style={{
            background: 'var(--primary)',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(30,111,253,0.3)'
          }}>
            <Home size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>PropDeal</span>
        </div>

        {/* Middle Navigation Links */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <button 
            type="button" 
            style={{
              fontSize: '13.5px',
              fontWeight: activeTab === 'dashboard' ? '700' : '500',
              color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: activeTab === 'dashboard' ? '2px solid var(--primary)' : '2px solid transparent',
              paddingBottom: '4px'
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={15} />
            Plots Showcase
          </button>
          
          <button 
            type="button" 
            style={{
              fontSize: '13.5px',
              fontWeight: activeTab === 'about' ? '700' : '500',
              color: activeTab === 'about' ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: activeTab === 'about' ? '2px solid var(--primary)' : '2px solid transparent',
              paddingBottom: '4px'
            }}
            onClick={() => setActiveTab('about')}
          >
            <Info size={15} />
            About Company
          </button>

          <button 
            type="button" 
            style={{
              fontSize: '13.5px',
              fontWeight: activeTab === 'contact' ? '700' : '500',
              color: activeTab === 'contact' ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: activeTab === 'contact' ? '2px solid var(--primary)' : '2px solid transparent',
              paddingBottom: '4px'
            }}
            onClick={() => setActiveTab('contact')}
          >
            <Phone size={15} />
            Contact & Inquiry
          </button>
        </div>

        {/* Right Portal Redirect button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ 
              padding: '8px 16px', 
              fontSize: '12.5px', 
              fontWeight: '600', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={onLoginTrigger}
          >
            <LogIn size={14} />
            Agent Portal
          </button>
        </div>
      </nav>

      {/* 2. BODY CONTENT RENDERER */}
      <main style={{ flex: 1, padding: '40px' }} className="main-portal-content">
        
        {/* =========================================================================
            TAB: DASHBOARD - PROPERTIES/PLOTS SHOWCASE
            ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div style={{ animation: 'fade-in 0.4s ease-out' }}>
            
            {/* Showcase Hero Header */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-1px' }}>
                Premium Property & Plots Showcase
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '600px', margin: '6px auto 0 auto' }}>
                Browse verified premium residential plots, commercial spaces, and dream homes in hot locations. 
                Get direct dealer pricing without hidden charges.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="dashboard-card" style={{ 
              padding: '16px 24px', 
              marginBottom: '30px', 
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              background: '#fff'
            }}>
              
              {/* Left search */}
              <div className="header-search-bar" style={{ width: '320px', margin: 0 }}>
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search by title or type..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Right filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginRight: '6px' }}>
                  Filter Type:
                </span>
                {['All', 'Plot', 'House', 'Flat', 'Shop', 'Office'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      background: filterType === t ? 'var(--primary)' : 'var(--bg-main)',
                      color: filterType === t ? '#fff' : 'var(--text-muted)',
                      border: filterType === t ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setFilterType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Showcase Grid of Available Properties */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {filteredProperties.length > 0 ? (
                filteredProperties.map((p) => (
                  <div 
                    key={p.id} 
                    className="dashboard-card" 
                    style={{ 
                      padding: 0, 
                      overflow: 'hidden', 
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: 'var(--shadow-sm)',
                      background: '#fff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    {/* Image Header wrapper */}
                    <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                      <img 
                        src={p.propertyImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop'} 
                        alt={p.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Price Badge Overlay */}
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        background: 'rgba(15,23,42,0.85)',
                        backdropFilter: 'blur(4px)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: '800',
                        fontSize: '14px'
                      }}>
                        ₹{new Intl.NumberFormat('en-IN').format(p.price)}
                      </div>

                      {/* Type Badge Overlay */}
                      <span className={`badge ${
                        p.type === 'Plot' ? 'warning' : p.type === 'House' ? 'success' : 'info'
                      }`} style={{ position: 'absolute', top: '12px', right: '12px', boxShadow: 'var(--shadow-sm)' }}>
                        {p.type}
                      </span>
                    </div>

                    {/* Card Content details */}
                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', lineBreak: 'anywhere' }}>
                        {p.name}
                      </h4>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '10px' }}>
                        <span>Listing ID: {p.id}</span>
                        <span style={{ color: 'var(--success-text)', fontWeight: '700' }}>● Verified Asset</span>
                      </div>

                      {/* Client Call to Action */}
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ 
                          width: '100%', 
                          marginTop: '6px', 
                          background: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '12.5px',
                          fontWeight: '700'
                        }}
                        onClick={() => handlePropertyEnquiry(p)}
                      >
                        <MessageSquare size={14} />
                        Enquire / WhatsApp Detail
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }} className="dashboard-card">
                  <h3 style={{ color: 'var(--text-muted)' }}>Koi property available nahi mili.</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>Please try searching with other keywords or adjust your filter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: ABOUT COMPANY
            ========================================================================= */}
        {activeTab === 'about' && (
          <div style={{ animation: 'fade-in 0.4s ease-out', maxWidth: '900px', margin: 'auto' }}>
            
            {/* About Company Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>Who We Are</span>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', marginTop: '10px' }}>
                KairaBilling & PropDeal
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '8px' }}>
                PropDeal is a leading property advisory and asset management ecosystem trusted by thousands.
              </p>
            </div>

            {/* Grid of Company Strengths */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              
              <div className="dashboard-card" style={{ padding: '24px', background: '#fff' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '16px' }}>📍 Prime Locations</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Hum exclusive residential plots aur houses distribute karte hain jo best connected localities me hote hain.
                </p>
              </div>

              <div className="dashboard-card" style={{ padding: '24px', background: '#fff' }}>
                <h3 style={{ color: 'var(--success-icon)', marginBottom: '8px', fontSize: '16px' }}>⚖️ Legal Verification</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Saari properties registry, map aur ownership links fully verified hoti hain, jo legal stress door karti hain.
                </p>
              </div>

              <div className="dashboard-card" style={{ padding: '24px', background: '#fff' }}>
                <h3 style={{ color: 'var(--warning-icon)', marginBottom: '8px', fontSize: '16px' }}>🤝 0% Hidden Charges</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Jo dikhta hai wahi bikta hai. Token amounts aur billing commissions clear documentation me listed hote hain.
                </p>
              </div>
            </div>

            {/* Metrics Counters panel */}
            <div className="dashboard-card" style={{ 
              background: 'linear-gradient(135deg, var(--sidebar-bg-start) 0%, var(--sidebar-bg-end) 100%)',
              color: '#fff',
              padding: '30px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>500+</h2>
                  <p style={{ fontSize: '12px', color: 'var(--sidebar-text)', marginTop: '4px' }}>Happy Customers</p>
                </div>
                <div>
                  <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--success-icon)' }}>50+</h2>
                  <p style={{ fontSize: '12px', color: 'var(--sidebar-text)', marginTop: '4px' }}>Active Agents</p>
                </div>
                <div>
                  <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--warning-icon)' }}>15+</h2>
                  <p style={{ fontSize: '12px', color: 'var(--sidebar-text)', marginTop: '4px' }}>Years Experience</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB: CONTACT & LEAD INQUIRY FORM
            ========================================================================= */}
        {activeTab === 'contact' && (
          <div style={{ animation: 'fade-in 0.4s ease-out', maxWidth: '500px', margin: 'auto' }}>
            
            <div className="dashboard-card" style={{ padding: '30px', background: '#fff' }}>
              
              {!success ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto'
                    }}>
                      <Phone size={22} />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>Submit Direct Inquiry</h2>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Apni detail fill karein. Hum direct WhatsApp ya call se connect karenge.
                    </p>
                  </div>

                  <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Full Name */}
                    <div className="form-group">
                      <label className="auth-label" style={{ fontSize: '12px', fontWeight: '700' }}>Name *</label>
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

                    {/* Mobile Number */}
                    <div className="form-group">
                      <label className="auth-label" style={{ fontSize: '12px', fontWeight: '700' }}>Mobile Number *</label>
                      <div className="auth-phone-input-row">
                        <select className="auth-phone-select" disabled>
                          <option value="+91">+91</option>
                        </select>
                        <input 
                          type="tel" 
                          className="form-input" 
                          placeholder="10-digit mobile"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Requirement Menu */}
                    <div className="form-group">
                      <label className="auth-label" style={{ fontSize: '12px', fontWeight: '700' }}>Requirement Type *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Plot, 2BHK Flat, Office, etc."
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Custom messages */}
                    <div className="form-group">
                      <label className="auth-label" style={{ fontSize: '12px', fontWeight: '700' }}>Requirement / Message (Optional)</label>
                      <textarea 
                        className="form-input" 
                        style={{ height: '80px', padding: '10px', resize: 'none' }}
                        placeholder="Detail likhein (e.g. Location preffered, Area required, budget)..."
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                      <button
                        type="button"
                        className="auth-submit-btn"
                        style={{ 
                          background: 'var(--primary)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '8px',
                          margin: 0,
                          width: '100%'
                        }}
                        onClick={(e) => handleInquirySubmit(e, 'website')}
                        disabled={loading}
                      >
                        <Send size={16} />
                        {loading && submitType === 'website' ? 'Submitting...' : 'Website Par Submit Karein'}
                      </button>

                      <button
                        type="button"
                        className="auth-submit-btn"
                        style={{ 
                          background: 'var(--success-icon)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '8px',
                          margin: 0,
                          width: '100%'
                        }}
                        onClick={(e) => handleInquirySubmit(e, 'whatsapp')}
                        disabled={loading}
                      >
                        <MessageSquare size={16} />
                        {loading && submitType === 'whatsapp' ? 'Submitting...' : 'WhatsApp Par Chat Karein'}
                      </button>
                    </div>

                  </form>
                </>
              ) : (
                /* Confirmed leads display state */
                <div style={{ textAlign: 'center', animation: 'fade-in 0.4s ease-out' }}>
                  <div style={{ color: 'var(--success-icon)', marginBottom: '16px' }}>
                    <CheckCircle2 size={56} strokeWidth={1.5} style={{ margin: 'auto' }} />
                  </div>
                  
                  <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Inquiry Received!</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                    Dhanyawad, **{name}**! Aapki details successfully register kar li gayi hain. Hamara agent jald hi mobile number **+91 {mobile}** par details lekar connect karega.
                  </p>

                  <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase' }}>Inquiry ID</span>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>{submittedLeadId}</h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      className="auth-submit-btn"
                      style={{ background: 'var(--success-icon)', width: '100%', margin: 0, display: 'flex', alignItems: 'center', justify: 'center', gap: '8px' }}
                      onClick={() => {
                        const waMessage = `Hi PropDeal! My name is ${name}. I am looking for a ${requirement}. \n*Message*: ${customMessage || 'I want more details.'}\n*Contact*: ${mobile}.`;
                        const waUrl = `https://wa.me/${DEALER_WHATSAPP}?text=${encodeURIComponent(waMessage)}`;
                        window.open(waUrl, '_blank');
                      }}
                    >
                      <MessageSquare size={16} />
                      WhatsApp Client Chat
                    </button>

                    <button
                      type="button"
                      className="auth-submit-btn"
                      style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', width: '100%', margin: 0 }}
                      onClick={handleReset}
                    >
                      Add New Inquiry
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Footer copyright section */}
      <footer style={{
        background: '#fff',
        borderTop: '1px solid var(--border-color)',
        padding: '20px 40px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        © {new Date().getFullYear()} PropDeal. Verified Assets Dealer Consortium. All rights reserved.
      </footer>

    </div>
  );
}
