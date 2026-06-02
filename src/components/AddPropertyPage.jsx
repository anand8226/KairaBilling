import React, { useState } from 'react';
import { ArrowLeft, Building2, Landmark, User, Phone, DollarSign, Calendar, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AddPropertyPage({ onCancel, onSubmit, userRole = 'Agent' }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('House');
  const [status, setStatus] = useState('Available');
  const [price, setPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0]);
  const [ownerName, setOwnerName] = useState('');
  const [ownerMobile, setOwnerMobile] = useState('');
  const [propertyImage, setPropertyImage] = useState('');

  const isManager = userRole === 'Manager' || userRole === 'Super Admin';

  const propertyTypes = [
    { value: 'House', label: 'House / Villa', icon: Building2, desc: 'Independent homes & villas' },
    { value: 'Flat', label: 'Flat / Apartment', icon: Building2, desc: 'Multi-story residential apartments' },
    { value: 'Plot', label: 'Plot / Land', icon: Landmark, desc: 'Empty residential or commercial plots' },
    { value: 'Shop', label: 'Commercial Shop', icon: Building2, desc: 'Retail shops & showrooms' },
    { value: 'Office', label: 'Office Space', icon: Building2, desc: 'Corporate spaces & cabins' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert("Please fill in all required fields.");
      return;
    }

    const finalPurchasePrice = isManager && purchasePrice 
      ? parseFloat(purchasePrice) 
      : parseFloat(price) * 0.8;

    onSubmit({
      name,
      type,
      status,
      price: parseFloat(price),
      purchasePrice: finalPurchasePrice,
      vendorName: isManager && vendorName ? vendorName : 'Independent Owner',
      acquisitionDate: isManager && acquisitionDate ? acquisitionDate : new Date().toISOString().split('T')[0],
      ownerName: ownerName || 'Independent Owner',
      ownerMobile: ownerMobile || '999xxxxxx8',
      propertyImage: propertyImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop'
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ Photo size is too large! Please choose an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPropertyImage(reader.result); // Base64 data URL
    };
    reader.readAsDataURL(file);
  };

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const activeImage = propertyImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop';

  return (
    <div style={{ animation: 'fade-in 0.4s ease-out', paddingBottom: '40px' }}>
      {/* Sleek Top Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button 
          onClick={onCancel}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-3px)';
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Assets Engine</span>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px', letterSpacing: '-0.5px' }}>Acquire & List New Property</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Live Card Preview & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>
          
          {/* Visual Card Wrapper */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {/* Live Property Image */}
            <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden', background: '#f1f5f9' }}>
              <img 
                src={activeImage} 
                alt="Live Preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop';
                }}
              />
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '30px',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                <Sparkles size={12} style={{ color: '#fbbf24' }} />
                <span>REAL-TIME PREVIEW</span>
              </div>

              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
              }}>
                <span className={`badge ${status === 'Available' ? 'success' : status === 'Sold' ? 'danger' : 'warning'}`} style={{ fontWeight: '800', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                  {status}
                </span>
              </div>
            </div>

            {/* Card Info Content */}
            <div style={{ padding: '24px' }}>
              <span style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                🏠 {type} Listing
              </span>

              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginTop: '12px', lineBreak: 'anywhere' }}>
                {name || 'e.g. Dream Valley Villa Sector 12'}
              </h3>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Listing Price:</span>
                <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>
                  {formatCurrency(parseFloat(price))}
                </span>
              </div>

              {/* Owner Info visual block */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered Owner Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-main)', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <User size={14} style={{ color: 'var(--text-muted)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-light)', fontWeight: '600' }}>NAME</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ownerName || 'Independent Owner'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-main)', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-light)', fontWeight: '600' }}>CONTACT</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ownerMobile || '999xxxxxx8'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manager/Admin tracking calculations */}
              {isManager && (
                <div style={{
                  marginTop: '20px',
                  background: 'rgba(126, 34, 206, 0.04)',
                  border: '1px solid rgba(126, 34, 206, 0.15)',
                  borderRadius: '12px',
                  padding: '12px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#7e22ce' }}>💼 INTERNAL ERP META</span>
                    <span style={{ fontSize: '9px', background: 'rgba(126, 34, 206, 0.12)', color: '#7e22ce', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>ADMIN ONLY</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px dashed rgba(126, 34, 206, 0.15)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Acquisition Cost:</span>
                    <strong style={{ color: '#581c87' }}>{formatCurrency(parseFloat(purchasePrice || price * 0.8))}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Acquired From:</span>
                    <strong style={{ color: '#581c87', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>{vendorName || 'Independent Owner'}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prompt card */}
          <div style={{
            background: 'linear-gradient(135deg, hsl(220, 95%, 55%) 0%, hsl(220, 95%, 42%) 100%)',
            borderRadius: '20px',
            padding: '20px',
            color: '#ffffff',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <CheckCircle2 size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#38bdf8' }} />
            <div>
              <h4 style={{ fontWeight: '800', fontSize: '13.5px', color: '#fff' }}>Quick Listing Checklist</h4>
              <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.85)', marginTop: '4px', lineHeight: '1.4' }}>
                Listing properties with images and accurate market pricing boosts lead conversion by over 45%. Keep owner contacts private and secure.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Asset Registration Form */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          padding: '32px'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Section 1: Property Type Selector */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '14px', borderRadius: '2px', background: 'var(--primary)', display: 'inline-block' }}></span>
                <span>Select Property Asset Type</span>
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                {propertyTypes.map((item) => {
                  const Icon = item.icon;
                  const isSelected = type === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setType(item.value)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--primary-light)' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        textAlign: 'center',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'hsl(214, 20%, 75%)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.25s ease'
                      }}>
                        <Icon size={16} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>{item.label}</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-light)', lineHeight: '1.2' }}>{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Core Details */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '14px', borderRadius: '2px', background: 'var(--primary)', display: 'inline-block' }}></span>
                <span>Particulars & Listing Price</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }} className="form-group">
                  <label htmlFor="full-prop-name" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Property Name / Location Address Title *
                  </label>
                  <input 
                    type="text" 
                    id="full-prop-name"
                    className="form-input"
                    style={{
                      height: '42px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      width: '100%'
                    }}
                    placeholder="e.g. Galaxy Heights Circle Flat 302" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="full-prop-price" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Market Listing Price (Selling Price in ₹) *
                  </label>
                  <input 
                    type="number" 
                    id="full-prop-price"
                    className="form-input"
                    style={{
                      height: '42px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      width: '100%'
                    }}
                    placeholder="e.g. 5000000" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="full-prop-status" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Status Option
                  </label>
                  <select 
                    id="full-prop-status"
                    className="form-select"
                    style={{
                      height: '42px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: '#fff',
                      width: '100%'
                    }}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Available">Available Listing</option>
                    <option value="Sold">Sold / Off-market</option>
                    <option value="Rented">Rented Lease</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Owner Details */}
            <div style={{
              background: 'rgba(37,99,235,0.02)',
              border: '1px solid rgba(37,99,235,0.1)',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏡 Registered Property Owner Info</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>Owner Full Name *</label>
                  <input 
                    type="text"
                    className="form-input"
                    style={{
                      height: '40px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      width: '100%',
                      fontSize: '13px'
                    }}
                    placeholder="e.g. S. K. Malhotra"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>Owner Mobile / Contact *</label>
                  <input 
                    type="text"
                    className="form-input"
                    style={{
                      height: '40px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      width: '100%',
                      fontSize: '13px'
                    }}
                    placeholder="e.g. 9812738491"
                    value={ownerMobile}
                    onChange={(e) => setOwnerMobile(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Acquisition Details (Only for Super Admin/Manager) */}
            {isManager && (
              <div style={{
                background: 'rgba(126, 34, 206, 0.02)',
                border: '1px solid rgba(126, 34, 206, 0.1)',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: '#7e22ce', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💼 Purchase Cost & Vendor Tracking</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }} className="form-group">
                    <label htmlFor="full-prop-purchase-price" style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                      Purchase Cost (Acquisition Price in ₹) *
                    </label>
                    <input 
                      type="number" 
                      id="full-prop-purchase-price"
                      className="form-input"
                      style={{
                        height: '40px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        width: '100%',
                        fontSize: '13px'
                      }}
                      placeholder="e.g. 4000000" 
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Specify the internal amount paid to purchase/acquire this listing asset.
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="full-prop-vendor" style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                      Vendor / Seller Name *
                    </label>
                    <input 
                      type="text" 
                      id="full-prop-vendor"
                      className="form-input"
                      style={{
                        height: '40px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        width: '100%',
                        fontSize: '13px'
                      }}
                      placeholder="e.g. Horizon Builders" 
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="full-prop-acquisition-date" style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                      Acquisition Purchase Date *
                    </label>
                    <input 
                      type="date" 
                      id="full-prop-acquisition-date"
                      className="form-input"
                      style={{
                        height: '40px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        width: '100%',
                        fontSize: '13px'
                      }}
                      value={acquisitionDate}
                      onChange={(e) => setAcquisitionDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Image Visual Link */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '14px', borderRadius: '2px', background: 'var(--primary)', display: 'inline-block' }}></span>
                <span>Visuals & Media</span>
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Upload from Device *
                  </label>
                  <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    background: 'rgba(37,99,235,0.02)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '110px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'rgba(37,99,235,0.02)'; }}
                  onClick={() => document.getElementById('prop-file-upload').click()}
                  >
                    <ImageIcon size={28} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-main)' }}>Click to Select Photo</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-light)' }}>PNG, JPG (Max 2MB)</span>
                  </div>
                  <input 
                    type="file" 
                    id="prop-file-upload" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                  />
                </div>
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                  <label htmlFor="full-prop-image" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Or Paste Display Image URL
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                    <div style={{ position: 'absolute', left: '12px', color: 'var(--text-light)' }}>
                      <ImageIcon size={16} />
                    </div>
                    <input 
                      type="text" 
                      id="full-prop-image"
                      className="form-input"
                      style={{
                        height: '42px',
                        padding: '10px 14px 10px 38px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        width: '100%'
                      }}
                      placeholder="https://images.unsplash.com/photo-..." 
                      value={propertyImage.startsWith('data:image') ? '' : propertyImage}
                      onChange={(e) => setPropertyImage(e.target.value)}
                    />
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Provide Unsplash or static image URLs if not uploading.
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '14px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '20px',
              marginTop: '10px'
            }}>
              <button 
                type="button" 
                onClick={onCancel}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: 'var(--text-main)',
                  fontWeight: '700',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(30, 111, 253, 0.25)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(30, 111, 253, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 111, 253, 0.25)';
                }}
              >
                <Sparkles size={16} />
                <span>Buy & List Property</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
