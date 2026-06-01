import React, { useState, useEffect } from 'react';
import { 
  Home, Phone, Info, LayoutDashboard, LogIn, Send, MessageSquare, CheckCircle2, Search, Filter, 
  Layers, ShoppingBag, Activity, Utensils, Warehouse, Truck, Receipt, ClipboardList, QrCode, 
  BarChart3, Users, CloudLightning, Contact2, GitBranch, Play, Check, X, ChevronRight, Monitor, Smartphone
} from 'lucide-react';

const DEALER_WHATSAPP = "918226811810"; 

export default function PublicPortal({ properties = [], onLoginTrigger, onSignupTrigger }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'plots' | 'about' | 'contact'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  // Interactive Dashboard Preview tab state
  const [activePreview, setActivePreview] = useState('sales'); // 'sales' | 'inventory' | 'reports' | 'rfid'

  // Video Demo modal trigger
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Inquiry form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [requirement, setRequirement] = useState('2BHK Flat');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState('');
  const [submitType, setSubmitType] = useState(''); // 'website' or 'whatsapp'

  // Database-fetched leads for dynamic previewing
  const [dbLeads, setDbLeads] = useState([]);

  // Fetch leads on mount to populate CRM & Pipeline previews dynamically from MySQL DB
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/leads');
        if (response.ok) {
          const data = await response.json();
          setDbLeads(data);
        }
      } catch (error) {
        console.error("Failed to fetch database leads for landing page previews:", error);
      }
    };
    fetchLeads();
  }, [success]); // Re-fetch when a new inquiry succeeds!

  // Dynamic Statistics Calculations based on real database records
  const soldProperties = properties.filter(p => p.status === 'Sold');
  const totalSalesVal = soldProperties.reduce((sum, p) => sum + parseFloat(p.price || 0), 0);
  const totalTaxCollectedVal = totalSalesVal * 0.18; // 18% GST standard

  const availablePropertiesCount = properties.filter(p => p.status === 'Available').length;
  const availablePlotsCount = properties.filter(p => p.status === 'Available' && p.type === 'Plot').length;
  const activeLeadsCount = dbLeads.length;

  // Formatting helpers for Indian currency representation
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

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

  const handleNavClick = (tab, sectionId = null) => {
    setActiveTab(tab);
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-family)', position: 'relative' }}>
      
      {/* 1. STICKY GLASSMORPHIC SAAS NAVBAR */}
      <nav className="saas-navbar">
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handleNavClick('home')}>
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
            <Layers size={18} strokeWidth={2.5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>PropDeal</span>
            <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.5px' }}>ERP SUITE</span>
          </div>
        </div>

        {/* Middle Navigation Links */}
        <div className="saas-nav-links">
          <button 
            type="button" 
            className={`saas-nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            Home
          </button>
          <button 
            type="button" 
            className="saas-nav-link"
            onClick={() => handleNavClick('home', 'features')}
          >
            Features
          </button>
          <button 
            type="button" 
            className="saas-nav-link"
            onClick={() => handleNavClick('home', 'modules')}
          >
            Modules
          </button>
          <button 
            type="button" 
            className="saas-nav-link"
            onClick={() => handleNavClick('home', 'previews')}
          >
            Dashboard Demo
          </button>
          <button 
            type="button" 
            className={`saas-nav-link ${activeTab === 'plots' ? 'active' : ''}`}
            onClick={() => handleNavClick('plots')}
          >
            Plots Showcase
          </button>
          <button 
            type="button" 
            className={`saas-nav-link ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => handleNavClick('about')}
          >
            About Us
          </button>
          <button 
            type="button" 
            className={`saas-nav-link ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => handleNavClick('contact')}
          >
            Contact
          </button>
        </div>

        {/* Right Portal Redirect button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            style={{ 
              fontSize: '13.5px', 
              fontWeight: '600', 
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            onClick={onLoginTrigger}
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ 
              padding: '10px 20px', 
              fontSize: '13px', 
              fontWeight: '700', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, var(--primary) 0%, hsl(230, 90%, 60%) 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(30,111,253,0.2)'
            }}
            onClick={onLoginTrigger}
          >
            Get Started
            <ChevronRight size={14} />
          </button>
        </div>
      </nav>

      {/* 2. BODY CONTENT RENDERER */}
      <main style={{ flex: 1, position: 'relative' }} className="main-portal-content">
        
        {/* =========================================================================
            TAB: HOME - HIGH-END ENTERPRISE SAAS HOMEPAGE
            ========================================================================= */}
        {activeTab === 'home' && (
          <div style={{ animation: 'fade-in 0.5s ease-out' }}>
            
            {/* Mesh Background Accent Glows */}
            <div className="saas-hero-glow-container">
              <div className="saas-glow-circle primary" />
              <div className="saas-glow-circle purple" />
              <div className="saas-glow-circle emerald" />
            </div>

            {/* A. HERO PANEL SECTION */}
            <section className="saas-hero-container">
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div className="saas-badge-pill">
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-ring 2s infinite' }} />
                  ✨ Real Estate & Business ERP Ecosystem
                </div>

                <h1 className="saas-h1">
                  One Software For Every <br />
                  <span className="gradient">Property & Business</span>
                </h1>

                <p className="saas-lead-text">
                  Manage listings, inventory, GST invoices, RFID tagging, real-time client leads, and direct WhatsApp integrations. An all-in-one suite custom built for property agents and modern retail distributors.
                </p>

                <div className="saas-hero-actions">
                  <button 
                    type="button" 
                    className="btn-saas-primary"
                    onClick={onLoginTrigger}
                  >
                    Start Free Trial
                    <ChevronRight size={16} />
                  </button>
                  <button 
                    type="button" 
                    className="btn-saas-secondary"
                    onClick={() => setShowDemoModal(true)}
                  >
                    <Play size={16} fill="var(--text-main)" />
                    Watch Product Tour
                  </button>
                </div>

                <div className="saas-tagline-badges">
                  <div className="saas-tagline-badge">
                    <Check size={12} strokeWidth={3} style={{ color: 'var(--success-icon)' }} />
                    GST Ready Billing
                  </div>
                  <div className="saas-tagline-badge">
                    <Check size={12} strokeWidth={3} style={{ color: 'var(--success-icon)' }} />
                    RFID Smart Tracker
                  </div>
                  <div className="saas-tagline-badge">
                    <Check size={12} strokeWidth={3} style={{ color: 'var(--success-icon)' }} />
                    Secure Cloud Sync
                  </div>
                  <div className="saas-tagline-badge">
                    <Check size={12} strokeWidth={3} style={{ color: 'var(--success-icon)' }} />
                    WhatsApp Leads
                  </div>
                </div>
              </div>

              {/* Right Column - Premium Laptop & Phone CSS Mockups loaded with database stats! */}
              <div className="saas-device-mockups">
                {/* Simulated Laptop Frame */}
                <div className="laptop-mockup">
                  <div className="laptop-screen">
                    <div className="laptop-camera" />
                    {/* Simulated miniature dashboard inside screen */}
                    <div className="mini-dash-layout">
                      <div className="mini-dash-header">
                        <div className="mini-dash-brand">
                          <div className="mini-dash-dot" />
                          PropDeal Suite
                        </div>
                        <div className="mini-dash-profile" />
                      </div>
                      
                      <div className="mini-dash-grid">
                        <div className="mini-dash-card">
                          <span className="mini-dash-card-title">Database Sales</span>
                          <span className="mini-dash-card-value">{totalSalesVal > 0 ? formatCurrency(totalSalesVal) : "₹84.5 Lakh"}</span>
                        </div>
                        <div className="mini-dash-card">
                          <span className="mini-dash-card-title">Available Assets</span>
                          <span className="mini-dash-card-value">{availablePropertiesCount > 0 ? `${availablePropertiesCount} Units` : "28 Units"}</span>
                        </div>
                        <div className="mini-dash-card">
                          <span className="mini-dash-card-title">Active Leads</span>
                          <span className="mini-dash-card-value">{activeLeadsCount > 0 ? `${activeLeadsCount} Leads` : "5 CRM"}</span>
                        </div>
                      </div>

                      <div className="mini-dash-chart-section">
                        <div className="mini-dash-chart-header">
                          <span style={{ fontWeight: '700', fontSize: '7px', color: 'white' }}>Live DB Listing Status</span>
                          <span style={{ fontSize: '6px', color: 'var(--primary)' }}>Sync Active</span>
                        </div>
                        <div className="mini-dash-chart-bars">
                          {/* Display heights based on actual counts of property types or standard weights if database is small */}
                          <div className="mini-dash-chart-bar" style={{ height: `${Math.max(10, Math.min(95, (properties.filter(p => p.type === 'Plot').length || 3) * 15))}%`, width: '8px' }} />
                          <div className="mini-dash-chart-bar purple" style={{ height: `${Math.max(10, Math.min(95, (properties.filter(p => p.type === 'House').length || 2) * 15))}%`, width: '8px' }} />
                          <div className="mini-dash-chart-bar emerald" style={{ height: `${Math.max(10, Math.min(95, (properties.filter(p => p.type === 'Flat').length || 2) * 15))}%`, width: '8px' }} />
                          <div className="mini-dash-chart-bar" style={{ height: `${Math.max(10, Math.min(95, (properties.filter(p => p.type === 'Shop').length || 1) * 20))}%`, width: '8px' }} />
                          <div className="mini-dash-chart-bar purple" style={{ height: '90%', width: '8px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="laptop-base" />
                </div>

                {/* Simulated Smartphone Frame overlapping */}
                <div className="phone-mockup">
                  <div className="phone-speaker" />
                  <div className="phone-screen">
                    <div className="mini-mobile-layout">
                      <div className="mini-mob-header">
                        <span className="mini-mob-logo">PropDeal</span>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }} />
                      </div>

                      <div className="mini-mob-stats-row">
                        <div className="mini-mob-card">
                          <div style={{ fontSize: '5px', color: '#64748b' }}>LEADS</div>
                          <span className="mini-mob-card-val">+{activeLeadsCount} Sync</span>
                        </div>
                        <div className="mini-mob-card">
                          <div style={{ fontSize: '5px', color: '#64748b' }}>BILLING</div>
                          <span className="mini-mob-card-val">GST Ready</span>
                        </div>
                      </div>

                      <div className="mini-mob-list">
                        <div style={{ fontSize: '6px', fontWeight: '700', color: 'white', marginBottom: '2px' }}>Real Database Leads</div>
                        
                        {/* Map actual database leads to the phone list dynamically! */}
                        {dbLeads.length > 0 ? (
                          dbLeads.slice(0, 3).map((l, index) => (
                            <div key={l.id || index} className="mini-mob-list-item">
                              <div className="mini-mob-list-left">
                                <div className={`mini-mob-indicator ${index === 1 ? 'emerald' : index === 2 ? 'orange' : ''}`} />
                                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '55px' }}>{l.name}</span>
                              </div>
                              <span style={{ fontSize: '6px', color: '#10b981', fontWeight: '700' }}>{l.status}</span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="mini-mob-list-item">
                              <div className="mini-mob-list-left">
                                <div className="mini-mob-indicator" />
                                <span>No Leads</span>
                              </div>
                              <span style={{ fontSize: '7px', color: 'white', fontWeight: '700' }}>0</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="phone-home-indicator" />
                  </div>
                </div>
              </div>
            </section>

            {/* B. "DESIGNED FOR EVERY TYPE OF BUSINESS" MODULES GRID */}
            <section id="modules" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div className="saas-section-header">
                <span className="saas-section-badge">Enterprise Versatility</span>
                <h2 className="saas-section-title">Designed For Every Type of Business</h2>
                <p className="saas-section-subtitle">
                  Our comprehensive ERP modules are custom tailored to match the unique workflows of diverse commercial sectors.
                </p>
              </div>

              <div className="saas-modules-grid">
                
                {/* 1. Retail Shop */}
                <div className="saas-module-card accent-blue">
                  <div className="saas-module-icon-wrap">
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className="saas-module-title">Retail Shop</h3>
                  <p className="saas-module-desc">
                    Superfast POS billing, item barcodes, automated profit margin trackers, and simple customer accounts.
                  </p>
                  <div className="saas-module-features-list">
                    <div className="saas-module-feature-item">
                      <CheckCircle2 size={13} /> Multi-Payment POS
                    </div>
                    <div className="saas-module-feature-item">
                      <CheckCircle2 size={13} /> Daily Profit Reports
                    </div>
                  </div>
                </div>

                {/* 2. Pharmacy */}
                <div className="saas-module-card accent-emerald">
                  <div className="saas-module-icon-wrap">
                    <Activity size={24} />
                  </div>
                  <h3 className="saas-module-title">Pharmacy</h3>
                  <p className="saas-module-desc">
                    Expiry date tracking alerts, generic name search mapping, drug schedule logs, and batch-wise inventory.
                  </p>
                  <div className="saas-module-features-list">
                    <div className="saas-module-feature-item">
                      <CheckCircle2 size={13} /> Expiry Notification
                    </div>
                    <div className="saas-module-feature-item">
                      <CheckCircle2 size={13} /> Batch Stock Logs
                    </div>
                  </div>
                </div>

                {/* 3. Restaurant */}
                <div className="saas-module-card accent-violet">
                  <div className="saas-module-icon-wrap">
                    <Utensils size={24} />
                  </div>
                  <h3 className="saas-module-title">Restaurant</h3>
                  <p className="saas-module-desc">
                    Table-wise order mapping, KOT printer dispatching, digital menu pricing, and ingredient wastage trackers.
                  </p>
                  <div className="saas-module-features-list">
                    <div className="saas-module-feature-item">
                      <CheckCircle2 size={13} /> Kitchen Order Ticket (KOT)
                    </div>
                    <div className="saas-module-feature-item">
                      <CheckCircle2 size={13} /> Table QR Code Ordering
                    </div>
                  </div>
                </div>

                {/* 4. Property Dealer (SPECIALTY HIGHLIGHT) */}
                <div className="saas-module-card accent-blue specialty-highlight">
                  <div className="saas-module-icon-wrap">
                    <Home size={24} />
                  </div>
                  <h3 className="saas-module-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Property Dealer
                  </h3>
                  <p className="saas-module-desc">
                    Our award winning specialty. Interactive plot status grids, registry tracker, secure builder commission ledger, and direct WhatsApp lead generator.
                  </p>
                  <div className="saas-module-features-list">
                    <div className="saas-module-feature-item" style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                      <CheckCircle2 size={13} /> Interactive Plot Grids
                    </div>
                    <div className="saas-module-feature-item" style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                      <CheckCircle2 size={13} /> WhatsApp Client Dispatch
                    </div>
                  </div>
                </div>

                {/* 5. Warehouse */}
                <div className="saas-module-card accent-orange">
                  <div className="saas-module-icon-wrap">
                    <Warehouse size={24} />
                  </div>
                  <h3 className="saas-module-title">Warehouse</h3>
                  <p className="saas-module-desc">
                    Rack management grids, stock adjustment logs, automated inventory auditing, and internal stock transfer tracking.
                  </p>
                  <div className="saas-module-features-list">
                    <div className="saas-module-feature-item">
                      <CheckCircle2 size={13} /> Rack & Bin Allocation
                    </div>
                    <div className="saas-module-feature-item">
                      <CheckCircle2 size={13} /> Bulk Upload CSV
                    </div>
                  </div>
                </div>

                {/* 6. Distributor */}
                <div className="saas-module-card accent-pink">
                  <div className="saas-module-icon-wrap">
                    <Truck size={24} />
                  </div>
                  <h3 className="saas-module-title">Distributor</h3>
                  <p className="saas-module-desc">
                    Party-wise outstanding credit trackers, sales agent routing, auto-purchase orders, and dynamic discount structures.
                  </p>
                  <div className="saas-module-features-list">
                    <div className="saas-module-feature-item">
                      <CheckCircle2 size={13} /> Outstanding Ledgers
                    </div>
                    <div className="saas-module-feature-item">
                      <CheckCircle2 size={13} /> Field Agent CRM App
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* C. "POWERFUL FEATURES" GRID SECTION */}
            <section id="features" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
              <div className="saas-section-header">
                <span className="saas-section-badge">Core Capability</span>
                <h2 className="saas-section-title">Powerful Core Features</h2>
                <p className="saas-section-subtitle">
                  Built on enterprise-grade architecture, designed to simplify complicated business operations.
                </p>
              </div>

              <div className="saas-features-grid">
                
                {/* 1. GST Ready Billing */}
                <div className="saas-feature-card">
                  <div className="saas-feature-icon-wrap" style={{ background: 'var(--info-bg)', color: 'var(--info-icon)' }}>
                    <Receipt size={18} />
                  </div>
                  <h4 className="saas-feature-title">GST Ready Billing</h4>
                  <p className="saas-feature-desc">Generate SGST, CGST, and IGST invoices on the fly with customizable invoice design print templates.</p>
                </div>

                {/* 2. Inventory Management */}
                <div className="saas-feature-card">
                  <div className="saas-feature-icon-wrap" style={{ background: 'var(--success-bg)', color: 'var(--success-icon)' }}>
                    <ClipboardList size={18} />
                  </div>
                  <h4 className="saas-feature-title">Smart Inventory</h4>
                  <p className="saas-feature-desc">Live stock counting alerts when items drop below threshold buffer limits, minimizing stockouts.</p>
                </div>

                {/* 3. Barcode & RFID */}
                <div className="saas-feature-card">
                  <div className="saas-feature-icon-wrap" style={{ background: 'var(--purple-bg)', color: 'var(--purple-icon)' }}>
                    <QrCode size={18} />
                  </div>
                  <h4 className="saas-feature-title">Barcode & RFID Ready</h4>
                  <p className="saas-feature-desc">Fully supports physical RFID integration and custom barcode printing to automate checkout scanning speed.</p>
                </div>

                {/* 4. Detailed Reports */}
                <div className="saas-feature-card">
                  <div className="saas-feature-icon-wrap" style={{ background: 'var(--warning-bg)', color: 'var(--warning-icon)' }}>
                    <BarChart3 size={18} />
                  </div>
                  <h4 className="saas-feature-title">Detailed Reports</h4>
                  <p className="saas-feature-desc">Export high-fidelity PDF/Excel reports covering taxes, customer outstanding collections, and asset status.</p>
                </div>

                {/* 5. Multi User */}
                <div className="saas-feature-card">
                  <div className="saas-feature-icon-wrap" style={{ background: 'var(--pink-bg)', color: 'var(--pink-icon)' }}>
                    <Users size={18} />
                  </div>
                  <h4 className="saas-feature-title">Multi-User Roles</h4>
                  <p className="saas-feature-desc">Granular authorization settings to define access permissions for Managers, Cashiers, and Agents separately.</p>
                </div>

                {/* 6. Cloud Backup */}
                <div className="saas-feature-card">
                  <div className="saas-feature-icon-wrap" style={{ background: 'var(--teal-bg)', color: 'var(--teal-icon)' }}>
                    <CloudLightning size={18} />
                  </div>
                  <h4 className="saas-feature-title">Realtime Cloud Sync</h4>
                  <p className="saas-feature-desc">Automatic transaction backing securely hosted on enterprise-grade MySQL database instances.</p>
                </div>

                {/* 7. Customer & Supplier */}
                <div className="saas-feature-card">
                  <div className="saas-feature-icon-wrap" style={{ background: 'var(--danger-bg)', color: 'var(--danger-icon)' }}>
                    <Contact2 size={18} />
                  </div>
                  <h4 className="saas-feature-title">Party Ledger</h4>
                  <p className="saas-feature-desc">Track vendor and client debit balances, complete with chronological billing history and logs.</p>
                </div>

                {/* 8. Multi Branch */}
                <div className="saas-feature-card">
                  <div className="saas-feature-icon-wrap" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <GitBranch size={18} />
                  </div>
                  <h4 className="saas-feature-title">Multi-Branch Sync</h4>
                  <p className="saas-feature-desc">Manage multiple stores or agent offices under a single master administrator command console.</p>
                </div>

              </div>
            </section>

            {/* D. INTERACTIVE PREVIEWS SECTION (FULLY DATABASE SYNCHRONIZED!) */}
            <section id="previews" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
              <div className="saas-section-header">
                <span className="saas-section-badge">Live DB Connection</span>
                <h2 className="saas-section-title">Explore Live Previews</h2>
                <p className="saas-section-subtitle">
                  These panels are connected directly to our MySQL database. Add properties or submit inquiries to watch this update in real time.
                </p>
              </div>

              <div className="saas-previews-container">
                {/* Selector Tabs */}
                <div className="saas-previews-tabs">
                  <button 
                    type="button" 
                    className={`saas-preview-tab-btn ${activePreview === 'sales' ? 'active' : ''}`}
                    onClick={() => setActivePreview('sales')}
                  >
                    <BarChart3 size={15} />
                    Sales Dashboard
                  </button>
                  <button 
                    type="button" 
                    className={`saas-preview-tab-btn ${activePreview === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActivePreview('inventory')}
                  >
                    <ClipboardList size={15} />
                    Inventory Showcase
                  </button>
                  <button 
                    type="button" 
                    className={`saas-preview-tab-btn ${activePreview === 'reports' ? 'active' : ''}`}
                    onClick={() => setActivePreview('reports')}
                  >
                    <Receipt size={15} />
                    Lead Reports
                  </button>
                  <button 
                    type="button" 
                    className={`saas-preview-tab-btn ${activePreview === 'rfid' ? 'active' : ''}`}
                    onClick={() => setActivePreview('rfid')}
                  >
                    <QrCode size={15} />
                    RFID Smart Scanner
                  </button>
                </div>

                {/* Dashboard Frame Window */}
                <div className="saas-preview-window">
                  <div className="saas-preview-win-header">
                    <div className="saas-preview-win-dots">
                      <div className="saas-preview-win-dot" />
                      <div className="saas-preview-win-dot yellow" />
                      <div className="saas-preview-win-dot green" />
                    </div>
                    <div className="saas-preview-win-title">
                      PropDeal ERP Enterprise - {activePreview.toUpperCase()} PANEL v1.4 (MySQL-Live)
                    </div>
                    <div style={{ width: '32px' }} />
                  </div>

                  <div className="saas-preview-win-body">
                    {/* Render active visualization */}
                    
                    {/* 1. SALES DASHBOARD: DRIVEN BY DATABASE SOLD TRANSACTIONS! */}
                    {activePreview === 'sales' && (
                      <div className="chart-vis-container">
                        <div className="chart-vis-header-row">
                          <span className="chart-vis-title">Real-time Revenue Analysis (Database-Driven)</span>
                          <div className="chart-vis-metrics">
                            <div className="chart-vis-metric">
                              <span className="chart-vis-metric-lbl">DB Closed Deals</span>
                              <span className="chart-vis-metric-val">{formatCurrency(totalSalesVal || 8450000)}</span>
                            </div>
                            <div className="chart-vis-metric">
                              <span className="chart-vis-metric-lbl">GST Tax Collected</span>
                              <span className="chart-vis-metric-val">{formatCurrency(totalTaxCollectedVal || 1521000)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="chart-vis-graphic">
                          <div className="chart-vis-bars">
                            {/* Map up to 6 actual sold properties to monthly visual bar heights, or fallbacks if none sold yet */}
                            {(soldProperties.length > 0 ? soldProperties.slice(0, 6) : properties.slice(0, 6)).map((p, idx) => {
                              const barHeight = Math.max(15, Math.min(95, ((p.price || 0) / 12000000) * 100));
                              const label = p.name.split(' ')[0] || `P-${p.id}`;
                              return (
                                <div key={p.id || idx} className="chart-vis-bar-column">
                                  <div 
                                    className={`chart-vis-bar ${idx === 2 ? 'violet' : idx === 4 ? 'emerald' : ''}`} 
                                    style={{ height: `${barHeight}%` }}
                                  >
                                    <span className="chart-vis-bar-tooltip">{formatCurrency(p.price)}</span>
                                  </div>
                                  <span className="chart-vis-bar-lbl" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '38px' }}>{label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. INVENTORY SHOWCASE: DRIVEN DIRECTLY BY DATABASE PROPERTIES! */}
                    {activePreview === 'inventory' && (
                      <div className="chart-vis-container" style={{ gap: '15px' }}>
                        <div className="chart-vis-header-row">
                          <span className="chart-vis-title">Properties & Asset Registry Stock (Direct MySQL)</span>
                          <span className="badge success">MySQL Connected</span>
                        </div>

                        <div className="table-responsive" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '10px' }}>
                          <table className="premium-table" style={{ color: '#94a3b8' }}>
                            <thead>
                              <tr>
                                <th style={{ color: 'white', fontSize: '9px' }}>Property Name</th>
                                <th style={{ color: 'white', fontSize: '9px' }}>Type</th>
                                <th style={{ color: 'white', fontSize: '9px' }}>Asking Price</th>
                                <th style={{ color: 'white', fontSize: '9px' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {properties.length > 0 ? (
                                properties.slice(0, 4).map((p) => (
                                  <tr key={p.id}>
                                    <td style={{ color: 'white', fontSize: '11.5px', borderBottomColor: '#334155' }}>{p.name}</td>
                                    <td style={{ fontSize: '11px', borderBottomColor: '#334155' }}>{p.type}</td>
                                    <td style={{ color: '#10b981', fontWeight: '700', fontSize: '11.5px', borderBottomColor: '#334155' }}>{formatCurrency(p.price)}</td>
                                    <td style={{ borderBottomColor: '#334155' }}>
                                      <span className={`badge ${
                                        p.status === 'Available' ? 'success' : p.status === 'Sold' ? 'danger' : 'warning'
                                      }`} style={{ fontSize: '8px', padding: '2px 6px' }}>
                                        {p.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" style={{ textAlign: 'center', fontSize: '11px' }}>No properties in database.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 3. LEAD REPORTS: DRIVEN DIRECTLY BY DATABASE LEADS! */}
                    {activePreview === 'reports' && (
                      <div className="chart-vis-container" style={{ gap: '15px' }}>
                        <div className="chart-vis-header-row">
                          <span className="chart-vis-title">Realtime CRM Leads Pipeline (MySQL CRM Sync)</span>
                          <span className="badge info" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>Active CRM Integration</span>
                        </div>

                        <div className="table-responsive" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '10px' }}>
                          <table className="premium-table" style={{ color: '#94a3b8' }}>
                            <thead>
                              <tr>
                                <th style={{ color: 'white', fontSize: '9px' }}>Client</th>
                                <th style={{ color: 'white', fontSize: '9px' }}>Requirement</th>
                                <th style={{ color: 'white', fontSize: '9px' }}>Phone Number</th>
                                <th style={{ color: 'white', fontSize: '9px' }}>Lead Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dbLeads.length > 0 ? (
                                dbLeads.slice(0, 4).map((l) => (
                                  <tr key={l.id}>
                                    <td style={{ color: 'white', fontSize: '11.5px', borderBottomColor: '#334155' }}>{l.name}</td>
                                    <td style={{ fontSize: '11px', borderBottomColor: '#334155' }}>{l.requirement}</td>
                                    <td style={{ fontSize: '11px', borderBottomColor: '#334155' }}>
                                      {l.mobile.length >= 10 ? `+91 ${l.mobile.slice(0, 2)}******${l.mobile.slice(-2)}` : l.mobile}
                                    </td>
                                    <td style={{ borderBottomColor: '#334155' }}>
                                      <span className="badge success" style={{ fontSize: '8px', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                        {l.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" style={{ textAlign: 'center', fontSize: '11px' }}>No lead submissions in database. Submit an inquiry to see it here!</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 4. RFID SMART SCANNER: DRIVEN DIRECTLY BY DATABASE PLOTS / ASSETS! */}
                    {activePreview === 'rfid' && (
                      <div className="chart-vis-container">
                        <div className="chart-vis-header-row">
                          <span className="chart-vis-title">Realtime RFID Smart Gate Scanner</span>
                          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>📡 Scanner Active</span>
                        </div>

                        <div className="rfid-grid-graphic">
                          {properties.length > 0 ? (
                            properties.slice(0, 4).map((p, idx) => (
                              <div key={p.id} className="rfid-scanner-card">
                                <div className="rfid-pulse" style={{ background: p.status === 'Available' ? '#10b981' : p.status === 'Sold' ? '#ef4444' : '#fbbf24' }} />
                                <span className="rfid-scanner-badge" style={{ 
                                  background: p.status === 'Available' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                                  color: p.status === 'Available' ? '#10b981' : '#f87171' 
                                }}>
                                  RFID-{p.id}
                                </span>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.name}</span>
                                <span style={{ fontSize: '9px', color: '#64748b' }}>RSSI: -{42 + idx * 4}dBm</span>
                              </div>
                            ))
                          ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>
                              No assets inside database to scan.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* =========================================================================
            TAB: PLOTS - PREMIUM LIVE LISTINGS SHOWCASE CATALOG
            ========================================================================= */}
        {activeTab === 'plots' && (
          <div style={{ animation: 'fade-in 0.4s ease-out', padding: '40px' }}>
            
            {/* Majestic Mesh Gradient Hero Section */}
            <div style={{
              background: 'linear-gradient(135deg, hsla(220, 95%, 60%, 0.03) 0%, hsla(271, 81%, 95%, 0.06) 100%)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '24px',
              padding: '60px 40px',
              textAlign: 'center',
              marginBottom: '40px',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Blur accent glow */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                left: '-50px',
                width: '200px',
                height: '200px',
                background: 'var(--primary-light)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                opacity: 0.6,
                pointerEvents: 'none'
              }} />
              
              <span style={{
                background: 'linear-gradient(90deg, var(--primary) 0%, hsl(271, 81%, 50%) 100%)',
                color: '#fff',
                padding: '6px 18px',
                borderRadius: '30px',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(30, 111, 253, 0.2)',
                display: 'inline-block'
              }}>
                ✨ PREMIUM VERIFIED LISTINGS
              </span>
              
              <h1 style={{ 
                fontSize: '38px', 
                fontWeight: '900', 
                color: 'var(--text-main)', 
                letterSpacing: '-1.5px', 
                marginTop: '18px', 
                lineHeight: '1.25' 
              }}>
                Apna Dream Plot Aur Property Dhundhein
              </h1>
              
              <p style={{ 
                fontSize: '15.5px', 
                color: 'var(--text-muted)', 
                marginTop: '10px', 
                maxWidth: '650px', 
                margin: '12px auto 0 auto', 
                lineHeight: '1.6' 
              }}>
                Browse verified premium residential plots, highly lucrative commercial shops, and dream homes in hot locations. Connect directly with the dealer on WhatsApp with 0% brokerage.
              </p>
            </div>

            {/* Filter & Search Bar with Glassmorphic backdrop */}
            <div className="dashboard-card" style={{ 
              padding: '18px 24px', 
              marginBottom: '32px', 
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              background: '#fff',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              
              {/* Left search */}
              <div className="header-search-bar" style={{ width: '330px', margin: 0, borderRadius: '12px', background: 'var(--bg-main)' }}>
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search location or type..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
              </div>

              {/* Right filters with Pill Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginRight: '8px' }}>
                  Category:
                </span>
                {['All', 'Plot', 'House', 'Flat', 'Shop', 'Office'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    style={{
                      padding: '8px 18px',
                      borderRadius: '30px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      background: filterType === t ? 'linear-gradient(135deg, var(--primary) 0%, hsl(230, 90%, 60%) 100%)' : 'var(--bg-main)',
                      color: filterType === t ? '#fff' : 'var(--text-muted)',
                      border: filterType === t ? 'none' : '1px solid var(--border-color)',
                      boxShadow: filterType === t ? '0 4px 12px rgba(30, 111, 253, 0.2)' : 'none',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => setFilterType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Showcase Grid of Available Properties */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '28px' }}>
              {filteredProperties.length > 0 ? (
                filteredProperties.map((p) => (
                  <div key={p.id} className="public-property-card">
                    {/* Image Header wrapper with Zoom Effect */}
                    <div className="public-card-image-container">
                      <img 
                        src={p.propertyImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop'} 
                        alt={p.name} 
                        className="public-card-image"
                      />
                      
                      {/* Price Badge Overlay with blur effect */}
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '15px',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        ₹{new Intl.NumberFormat('en-IN').format(p.price)}
                      </div>

                      {/* Type Badge Overlay */}
                      <span className={`badge ${
                        p.type === 'Plot' ? 'warning' : p.type === 'House' ? 'success' : 'info'
                      }`} style={{ position: 'absolute', top: '12px', right: '12px', boxShadow: 'var(--shadow-sm)', fontWeight: '700', borderRadius: '6px' }}>
                        {p.type}
                      </span>
                    </div>

                    {/* Card Content details */}
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', lineBreak: 'anywhere' }}>
                        {p.name}
                      </h4>
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        fontSize: '12px', 
                        color: 'var(--text-muted)', 
                        borderBottom: '1px dashed var(--border-color)', 
                        paddingBottom: '12px' 
                      }}>
                        <span>ID: {p.id}</span>
                        <span style={{ color: 'var(--success-text)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success-icon)', display: 'inline-block' }} />
                          Verified Asset
                        </span>
                      </div>

                      {/* Premium Call to Action button */}
                      <button
                        type="button"
                        className="btn btn-primary public-enquire-btn"
                        style={{ 
                          width: '100%', 
                          marginTop: '4px', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: '800',
                          padding: '10px 16px',
                          borderRadius: '10px'
                        }}
                        onClick={() => handlePropertyEnquiry(p)}
                      >
                        <MessageSquare size={15} />
                        Enquire / WhatsApp Detail
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', borderRadius: '20px' }} className="dashboard-card">
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '700' }}>Koi property available nahi mili.</h3>
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
          <div style={{ animation: 'fade-in 0.4s ease-out', maxWidth: '900px', margin: 'auto', padding: '60px 40px' }}>
            
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
                PropDeal is a leading property advisory and asset management ecosystem trusted by thousands of builders and agents.
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
          <div style={{ animation: 'fade-in 0.4s ease-out', maxWidth: '500px', margin: 'auto', padding: '60px 20px' }}>
            
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

      {/* 3. FOOTER SECTION */}
      <footer style={{
        background: '#fff',
        borderTop: '1px solid var(--border-color)',
        padding: '30px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '12.5px',
        color: 'var(--text-muted)',
        zIndex: 10
      }}>
        <div>
          © {new Date().getFullYear()} <strong>PropDeal ERP Suite</strong>. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => handleNavClick('home')}>Home</span>
          <span style={{ cursor: 'pointer' }} onClick={() => handleNavClick('plots')}>Plots Showcase</span>
          <span style={{ cursor: 'pointer' }} onClick={() => handleNavClick('about')}>About Us</span>
          <span style={{ cursor: 'pointer' }} onClick={() => handleNavClick('contact')}>Contact & Inquiry</span>
        </div>
      </footer>

      {/* =========================================================================
          PRODUCT TOUR MODAL OVERLAY
          ========================================================================= */}
      {showDemoModal && (
        <div className="play-modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="play-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="play-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '15px' }}>PropDeal ERP Product Tour</span>
              </div>
              <button 
                type="button" 
                className="play-modal-close"
                onClick={() => setShowDemoModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="play-modal-video-placeholder">
              {/* Premium Simulated Guided Tour Graphic */}
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  boxShadow: '0 8px 24px rgba(30, 111, 253, 0.2)'
                }}>
                  <Play size={28} fill="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>Guided Video Tour Sandbox</h3>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', maxWidth: '380px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
                  Explore how PropDeal manages plots, billing invoicing, agent commissions, and instant client lead collection.
                </p>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '12.5px', fontWeight: '700', borderRadius: '8px' }}
                  onClick={() => handleNavClick('plots')}
                >
                  Browse Plots Showcase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
