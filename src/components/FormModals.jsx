import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

/* ============================================================================
   Add Property Modal Form
   ============================================================================ */
export function AddPropertyModal({ isOpen, onClose, onSubmit, userRole = 'Agent' }) {
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

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert("Please fill in all fields.");
      return;
    }
    
    const isManager = userRole === 'Manager' || userRole === 'Super Admin';
    const finalPurchasePrice = isManager && purchasePrice 
      ? parseFloat(purchasePrice) 
      : parseFloat(price) * 0.8; // default to 80% if empty/Agent

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
    // Reset form
    setName('');
    setType('House');
    setStatus('Available');
    setPrice('');
    setPurchasePrice('');
    setVendorName('');
    setAcquisitionDate(new Date().toISOString().split('T')[0]);
    setOwnerName('');
    setOwnerMobile('');
    setPropertyImage('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Buy / List New Property</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="prop-name">Property Name / Location Title *</label>
                <input 
                  type="text" 
                  id="prop-name"
                  className="form-input"
                  placeholder="e.g. Galaxy Circle Plot No 2" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prop-type">Property Type</label>
                <select 
                  id="prop-type"
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="House">House / Villa</option>
                  <option value="Flat">Flat / Apartment</option>
                  <option value="Plot">Plot / Land</option>
                  <option value="Shop">Commercial Shop</option>
                  <option value="Office">Office Space</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prop-status">Initial Status</label>
                <select 
                  id="prop-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Rented">Rented</option>
                </select>
              </div>

              <div className="form-group" style={{ padding: '10px', background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.1)', borderRadius: '8px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '10px', color: 'var(--primary-color)' }}>🏡 Property Owner Details Management</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Owner Name *</label>
                    <input 
                      type="text"
                      className="form-input"
                      style={{ height: '36px', fontSize: '12px' }}
                      placeholder="e.g. S. K. Malhotra"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Owner Contact *</label>
                    <input 
                      type="text"
                      className="form-input"
                      style={{ height: '36px', fontSize: '12px' }}
                      placeholder="e.g. 9812738491"
                      value={ownerMobile}
                      onChange={(e) => setOwnerMobile(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Property Display Photo *</label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', alignItems: 'center' }}>
                  {/* File Upload Trigger */}
                  <div 
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: '10px',
                      padding: '10px',
                      textAlign: 'center',
                      background: 'rgba(37,99,235,0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      height: '75px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'rgba(37,99,235,0.02)'; }}
                    onClick={() => document.getElementById('modal-prop-file-upload').click()}
                  >
                    <ImageIcon size={20} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Upload from Device</span>
                    <span style={{ fontSize: '8px', color: 'var(--text-light)' }}>PNG, JPG (Max 2MB)</span>
                  </div>
                  
                  {/* Image Preview Block */}
                  <div style={{
                    height: '75px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: '#f8fafc',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={propertyImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop'} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop';
                      }}
                    />
                    {propertyImage && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPropertyImage('');
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          fontSize: '9px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1,
                          fontWeight: '800'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <input 
                  type="file" 
                  id="modal-prop-file-upload" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-light)', fontWeight: '800' }}>OR LINK</span>
                  <input 
                    type="text" 
                    id="prop-image"
                    className="form-input"
                    style={{ height: '32px', fontSize: '11px', flex: 1, padding: '4px 8px' }}
                    placeholder="Paste image URL (e.g. https://...)" 
                    value={propertyImage.startsWith('data:image') ? '' : propertyImage}
                    onChange={(e) => setPropertyImage(e.target.value)}
                  />
                </div>
              </div>

              {/* Only show purchase cost field to Managers/Admins */}
              {(userRole === 'Manager' || userRole === 'Super Admin') && (
                <>
                  <div className="form-group" style={{ animation: 'fade-in 0.3s ease-out' }}>
                    <label htmlFor="prop-purchase-price" style={{ color: 'var(--primary-color)', fontWeight: '700' }}>
                      Purchase Cost (Acquisition Price in ₹) *
                    </label>
                    <input 
                      type="number" 
                      id="prop-purchase-price"
                      className="form-input"
                      style={{ borderColor: 'var(--primary-light)' }}
                      placeholder="e.g. 4000000" 
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Specify how much the company paid to acquire/buy this property.
                    </span>
                  </div>

                  <div className="form-group" style={{ animation: 'fade-in 0.3s ease-out' }}>
                    <label htmlFor="prop-vendor-name" style={{ color: 'var(--primary-color)', fontWeight: '700' }}>
                      Vendor / Seller Name *
                    </label>
                    <input 
                      type="text" 
                      id="prop-vendor-name"
                      className="form-input"
                      style={{ borderColor: 'var(--primary-light)' }}
                      placeholder="e.g. Horizon Builders / Rajesh Kumar" 
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Specify whom this property was bought/acquired from.
                    </span>
                  </div>

                  <div className="form-group" style={{ animation: 'fade-in 0.3s ease-out' }}>
                    <label htmlFor="prop-acquisition-date" style={{ color: 'var(--primary-color)', fontWeight: '700' }}>
                      Acquisition Date *
                    </label>
                    <input 
                      type="date" 
                      id="prop-acquisition-date"
                      className="form-input"
                      style={{ borderColor: 'var(--primary-light)' }}
                      value={acquisitionDate}
                      onChange={(e) => setAcquisitionDate(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Select the date of purchasing this property.
                    </span>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="prop-price" style={{ fontWeight: '700' }}>
                  Market Listing Price (Selling Price in ₹) *
                </label>
                <input 
                  type="number" 
                  id="prop-price"
                  className="form-input"
                  placeholder="e.g. 5000000" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Buy & List Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
   Add Customer / Lead Modal Form
   ============================================================================ */
export function AddCustomerModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [requirement, setRequirement] = useState('2BHK Flat');
  const [status, setStatus] = useState('New Lead');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert("Please fill in all fields.");
      return;
    }
    onSubmit({
      name,
      mobile,
      requirement,
      status
    });
    // Reset form
    setName('');
    setMobile('');
    setRequirement('2BHK Flat');
    setStatus('New Lead');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Customer / Lead</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="lead-name">Customer Name</label>
                <input 
                  type="text" 
                  id="lead-name"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lead-mobile">Mobile Number</label>
                <input 
                  type="text" 
                  id="lead-mobile"
                  className="form-input"
                  placeholder="e.g. 98xxxxxx12" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lead-req">Requirement Type</label>
                <select 
                  id="lead-req"
                  className="form-select"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                >
                  <option value="2BHK Flat">2BHK Flat</option>
                  <option value="3BHK Flat">3BHK Flat</option>
                  <option value="House">House</option>
                  <option value="Plot">Plot / Land</option>
                  <option value="Shop">Shop</option>
                  <option value="Office Space">Office Space</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lead-status">Lead Status</label>
                <select 
                  id="lead-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Interested">Interested</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
   Sell Property Modal Form (For Managers & Admins)
   ============================================================================ */
export function SellPropertyModal({ isOpen, onClose, property, properties = [], leads = [], onSubmit }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [soldPrice, setSoldPrice] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [agreementFile, setAgreementFile] = useState('Agreement_Final_Signed.pdf');
  const [commissionPercent, setCommissionPercent] = useState('2.0');

  const availableProps = properties.filter(p => p.status === 'Available');

  React.useEffect(() => {
    if (property) {
      setSelectedPropertyId(property.id);
      setSoldPrice(property.price || '');
      setBuyerName('');
      setPaymentMethod('Cash');
      setPaymentDetails('');
      setTokenAmount('');
      setAdvancePayment('');
      setAgreementFile('Agreement_Final_Signed.pdf');
      setCommissionPercent('2.0');
    } else {
      setSelectedPropertyId('');
      setSoldPrice('');
      setBuyerName('');
      setPaymentMethod('Cash');
      setPaymentDetails('');
      setTokenAmount('');
      setAdvancePayment('');
      setAgreementFile('Agreement_Final_Signed.pdf');
      setCommissionPercent('2.0');
    }
  }, [property, isOpen]);

  const handlePropertyChange = (e) => {
    const pId = e.target.value;
    setSelectedPropertyId(pId);
    const selected = properties.find(p => p.id === pId);
    if (selected) {
      setSoldPrice(selected.price || '');
    } else {
      setSoldPrice('');
    }
  };

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedPropertyId) {
      alert("Please select a property to sell.");
      return;
    }
    if (!buyerName || !soldPrice) {
      alert("Please enter both buyer name and sold price.");
      return;
    }
    
    const priceFloat = parseFloat(soldPrice);
    const tok = parseFloat(tokenAmount || 0);
    const adv = parseFloat(advancePayment || 0);
    const fin = priceFloat - tok - adv;
    const commPct = parseFloat(commissionPercent || 2.0);
    const commEarn = priceFloat * (commPct / 100);

    onSubmit({
      propertyId: selectedPropertyId,
      soldPrice: priceFloat,
      buyerName,
      saleDate,
      paymentMethod,
      paymentDetails,
      tokenAmount: tok,
      advancePayment: adv,
      finalPayment: fin,
      agreementFile,
      commissionPercent: commPct,
      commissionEarned: commEarn
    });
    onClose();
  };

  // Extract customer names
  const customers = leads.map(l => l.name);

  const matchedProperty = property || properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🤝 Close Property Sale Deal</span>
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="modal-form">
              
              <div className="form-group">
                <label style={{ fontWeight: '700' }}>Select Property to Sell *</label>
                {property ? (
                  <div style={{ padding: '10px', background: 'var(--bg-light)', borderRadius: '8px', fontWeight: '600', fontSize: '13px', border: '1px solid var(--border-color)' }}>
                    {property.id} — {property.name} ({property.type})
                  </div>
                ) : (
                  <select
                    className="form-select"
                    style={{ borderColor: 'var(--primary-color)', borderWidth: '2px' }}
                    value={selectedPropertyId}
                    onChange={handlePropertyChange}
                    required
                  >
                    <option value="">-- Choose Available Property --</option>
                    {availableProps.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.name} ({p.type}) | Listing Price: ₹{new Intl.NumberFormat('en-IN').format(p.price)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="buyer-select">Select or Type Buyer Name *</label>
                <input 
                  type="text" 
                  id="buyer-select"
                  list="leads-list"
                  className="form-input"
                  placeholder="e.g. Neha Gupta" 
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                />
                <datalist id="leads-list">
                  {customers.map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label htmlFor="deal-price">Final Deal Selling Price (₹) *</label>
                <input 
                  type="number" 
                  id="deal-price"
                  className="form-input"
                  placeholder="e.g. 5200000" 
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(e.target.value)}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Acquisition cost was: <strong>₹{new Intl.NumberFormat('en-IN').format(matchedProperty?.purchasePrice || 0)}</strong>
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="sale-date">Sale Closing Date</label>
                <input 
                  type="date" 
                  id="sale-date"
                  className="form-input"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ padding: '12px', background: 'rgba(217,119,6,0.04)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: '8px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '10px', color: '#d97706' }}>💰 Deal Payment splits & commissions</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Token Amount (₹) *</label>
                    <input 
                      type="number"
                      className="form-input"
                      style={{ height: '36px', fontSize: '12px' }}
                      placeholder="e.g. 50000"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Advance Paid (₹) *</label>
                    <input 
                      type="number"
                      className="form-input"
                      style={{ height: '36px', fontSize: '12px' }}
                      placeholder="e.g. 150000"
                      value={advancePayment}
                      onChange={(e) => setAdvancePayment(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Commission Split % *</label>
                    <input 
                      type="number"
                      step="0.1"
                      className="form-input"
                      style={{ height: '36px', fontSize: '12px' }}
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Agreement Filename</label>
                    <input 
                      type="text"
                      className="form-input"
                      style={{ height: '36px', fontSize: '12px' }}
                      value={agreementFile}
                      onChange={(e) => setAgreementFile(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ animation: 'fade-in 0.3s ease-out' }}>
                <label htmlFor="payment-method" style={{ fontWeight: '700' }}>Payment Mode *</label>
                <select 
                  id="payment-method"
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setPaymentDetails('');
                  }}
                  required
                >
                  <option value="Cash">Cash Payment</option>
                  <option value="UPI / NetBanking">UPI / NetBanking</option>
                  <option value="Bank Wire Transfer">Bank Wire Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="Cheque / DD">Cheque / Demand Draft</option>
                  <option value="Home Loan / Financing">Home Loan / Bank Financing</option>
                </select>
              </div>

              {paymentMethod === 'UPI / NetBanking' && (
                <div className="form-group" style={{ animation: 'fade-in 0.3s ease-out' }}>
                  <label htmlFor="pay-details" style={{ color: 'var(--primary-color)', fontWeight: '700' }}>UPI Ref / UTR Transaction ID *</label>
                  <input 
                    type="text" 
                    id="pay-details"
                    className="form-input"
                    placeholder="e.g. UTR12873491823"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    required
                  />
                </div>
              )}

              {paymentMethod === 'Bank Wire Transfer' && (
                <div className="form-group" style={{ animation: 'fade-in 0.3s ease-out' }}>
                  <label htmlFor="pay-details" style={{ color: 'var(--primary-color)', fontWeight: '700' }}>Bank Reference / UTR Number *</label>
                  <input 
                    type="text" 
                    id="pay-details"
                    className="form-input"
                    placeholder="e.g. HDFCR520260531002"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    required
                  />
                </div>
              )}

              {paymentMethod === 'Cheque / DD' && (
                <div className="form-group" style={{ animation: 'fade-in 0.3s ease-out' }}>
                  <label htmlFor="pay-details" style={{ color: 'var(--primary-color)', fontWeight: '700' }}>Cheque/DD Number & Date *</label>
                  <input 
                    type="text" 
                    id="pay-details"
                    className="form-input"
                    placeholder="e.g. Chq No: 002134, Date: 2026-06-05"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    required
                  />
                </div>
              )}

              {paymentMethod === 'Home Loan / Financing' && (
                <div className="form-group" style={{ animation: 'fade-in 0.3s ease-out' }}>
                  <label htmlFor="pay-details" style={{ color: 'var(--primary-color)', fontWeight: '700' }}>Financing Bank Name & Loan Acc Number *</label>
                  <input 
                    type="text" 
                    id="pay-details"
                    className="form-input"
                    placeholder="e.g. SBI Home Loans - LAcc 3827182"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    required
                  />
                </div>
              )}

              {paymentMethod === 'Cash' && (
                <div className="form-group" style={{ animation: 'fade-in 0.3s ease-out' }}>
                  <label htmlFor="pay-details" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Cash Receipt Details (Optional)</label>
                  <input 
                    type="text" 
                    id="pay-details"
                    className="form-input"
                    placeholder="e.g. Receipt No: R-9821, Handed over to Manager"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                  />
                </div>
              )}

            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ background: 'var(--danger-text)' }}>
              Confirm Property Sale & Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
   Invoice Modal (Bill UI - Printable Dynamic Invoice sheet)
   ============================================================================ */
export function InvoiceModal({ isOpen, onClose, invoiceData }) {
  if (!isOpen || !invoiceData) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice-area').innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>PropDeal Invoice - ${invoiceData.invoiceId}</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: 800; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; margin-bottom: 30px; }
            th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; }
            td { border-bottom: 1px solid #f1f5f9; padding: 14px 12px; font-size: 14px; }
            .profit-badge { color: #15803d; background: #dcfce7; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 13px; }
            .paid-stamp { border: 3px solid #16a34a; color: #16a34a; font-weight: 800; padding: 8px 16px; border-radius: 8px; text-transform: uppercase; font-size: 18px; display: inline-block; transform: rotate(-10deg); opacity: 0.8; }
            @media print {
              body { padding: 0; }
              .invoice-box { border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">${printContent}</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(10px)' }}>
        
        <div className="modal-header">
          <h3>🧾 Sales Invoice Generated</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div id="printable-invoice-area" style={{ padding: '10px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>PropDeal</h2>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Authorized Billing Console</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  border: '3px solid #16a34a',
                  color: '#16a34a',
                  fontWeight: '800',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  fontSize: '15px',
                  display: 'inline-block',
                  transform: 'rotate(-5deg)',
                  opacity: 0.85
                }}>
                  PAID & CLOSED
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Invoice details</div>
                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '4px', color: '#0f172a' }}>{invoiceData.invoiceId}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Date: {invoiceData.invoiceDate}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Billed To (Buyer)</div>
                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '4px', color: '#0f172a' }}>{invoiceData.buyerName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>PropDeal Registered Customer</div>
              </div>
            </div>

            {invoiceData.vendorName && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(126, 34, 206, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(126, 34, 206, 0.15)', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#7e22ce', textTransform: 'uppercase', fontWeight: '600' }}>Acquired From (Vendor)</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '4px', color: '#581c87' }}>{invoiceData.vendorName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#7e22ce', textTransform: 'uppercase', fontWeight: '600' }}>Acquisition Date</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '4px', color: '#581c87' }}>
                    {invoiceData.acquisitionDate ? new Date(invoiceData.acquisitionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {invoiceData.paymentMethod && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px', 
                background: invoiceData.paymentMethod === 'Cash' ? 'rgba(22, 163, 74, 0.05)' :
                            invoiceData.paymentMethod === 'UPI / NetBanking' ? 'rgba(13, 148, 136, 0.05)' :
                            invoiceData.paymentMethod === 'Bank Wire Transfer' ? 'rgba(37, 99, 235, 0.05)' :
                            invoiceData.paymentMethod === 'Cheque / DD' ? 'rgba(217, 119, 6, 0.05)' :
                            'rgba(79, 70, 229, 0.05)', 
                padding: '16px', 
                borderRadius: '12px', 
                border: `1px solid ${
                  invoiceData.paymentMethod === 'Cash' ? 'rgba(22, 163, 74, 0.15)' :
                  invoiceData.paymentMethod === 'UPI / NetBanking' ? 'rgba(13, 148, 136, 0.15)' :
                  invoiceData.paymentMethod === 'Bank Wire Transfer' ? 'rgba(37, 99, 235, 0.15)' :
                  invoiceData.paymentMethod === 'Cheque / DD' ? 'rgba(217, 119, 6, 0.15)' :
                  'rgba(79, 70, 229, 0.15)'
                }`, 
                marginBottom: '24px' 
              }}>
                <div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: invoiceData.paymentMethod === 'Cash' ? '#16a34a' :
                           invoiceData.paymentMethod === 'UPI / NetBanking' ? '#0d9488' :
                           invoiceData.paymentMethod === 'Bank Wire Transfer' ? '#2563eb' :
                           invoiceData.paymentMethod === 'Cheque / DD' ? '#d97706' :
                           '#4f46e5', 
                    textTransform: 'uppercase', 
                    fontWeight: '700' 
                  }}>
                    💳 Payment Mode
                  </div>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '14px', 
                    marginTop: '4px', 
                    color: invoiceData.paymentMethod === 'Cash' ? '#15803d' :
                           invoiceData.paymentMethod === 'UPI / NetBanking' ? '#0f766e' :
                           invoiceData.paymentMethod === 'Bank Wire Transfer' ? '#1d4ed8' :
                           invoiceData.paymentMethod === 'Cheque / DD' ? '#b45309' :
                           '#4338ca'
                  }}>
                    {invoiceData.paymentMethod}
                  </div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#64748b', 
                    textTransform: 'uppercase', 
                    fontWeight: '600' 
                  }}>
                    Transaction Reference
                  </div>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '13px', 
                    fontFamily: 'monospace', 
                    marginTop: '4px', 
                    color: '#1e293b' 
                  }}>
                    {invoiceData.paymentDetails || 'Settled Direct'}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Property Particulars</h4>
              <div style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{invoiceData.propertyName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>ID: {invoiceData.propertyId} | Type: {invoiceData.propertyType}</div>
                </div>
                <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px' }}>{invoiceData.propertyType}</span>
              </div>
            </div>

            <table style={{ width: '100%', marginTop: '24px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '10px 0', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Financial Ledger</th>
                  <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 0', fontSize: '13px', color: '#64748b' }}>Token Amount Paid</td>
                  <td style={{ padding: '12px 0', fontSize: '13px', textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>
                    {formatCurrency(invoiceData.tokenAmount || 0)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 0', fontSize: '13px', color: '#64748b' }}>Advance Payment Settled</td>
                  <td style={{ padding: '12px 0', fontSize: '13px', textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>
                    {formatCurrency(invoiceData.advancePayment || 0)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 0', fontSize: '13px', color: '#64748b' }}>Remaining Balance Paid</td>
                  <td style={{ padding: '12px 0', fontSize: '13px', textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>
                    {formatCurrency(invoiceData.finalPayment || (invoiceData.soldPrice - (invoiceData.tokenAmount || 0) - (invoiceData.advancePayment || 0)))}
                  </td>
                </tr>
                <tr style={{ borderBottom: '2px solid #e2e8f0', background: 'rgba(22, 163, 74, 0.03)' }}>
                  <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Total Final Closing Deal Price</td>
                  <td style={{ padding: '14px 10px', fontSize: '16px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                    {formatCurrency(invoiceData.soldPrice)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '24px', fontSize: '11px', color: '#64748b', textAlign: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
              Thank you for trusting <strong>PropDeal</strong>. This invoice is digitally generated and legally binding.
            </div>

          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            🖨️ Print Invoice / Bill
          </button>
        </div>

      </div>
    </div>
  );
}
