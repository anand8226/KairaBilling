import React, { useState, useEffect } from 'react';
import { ArrowLeft, Landmark, User, DollarSign, Calendar, Sparkles, TrendingUp, TrendingDown, Percent, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SellPropertyPage({ property, properties = [], leads = [], onCancel, onSubmit, userRole = 'Agent' }) {
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

  const isManager = userRole === 'Manager' || userRole === 'Super Admin';
  const availableProps = properties.filter(p => p.status === 'Available');

  // React synchronization on mount / select
  useEffect(() => {
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
    } else if (availableProps.length > 0) {
      setSelectedPropertyId('');
      setSoldPrice('');
    }
  }, [property]);

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

    if (fin < 0) {
      alert("Error: Token + Advance payment cannot exceed the total sold price.");
      return;
    }

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
  };

  const formatCurrency = (val) => {
    if (isNaN(val) || val === null || val === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Extract customer list from leads
  const customers = leads.map(l => l.name);

  // Find the currently active property record for details
  const matchedProperty = property || properties.find(p => p.id === selectedPropertyId);
  const acquisitionCost = matchedProperty ? parseFloat(matchedProperty.purchasePrice || matchedProperty.price * 0.8) : 0;
  
  // Real-time calculations
  const parsedSoldPrice = parseFloat(soldPrice || 0);
  const parsedToken = parseFloat(tokenAmount || 0);
  const parsedAdvance = parseFloat(advancePayment || 0);
  const remainderBalance = Math.max(parsedSoldPrice - parsedToken - parsedAdvance, 0);

  const profitMargin = parsedSoldPrice - acquisitionCost;
  const profitPercentage = acquisitionCost > 0 ? (profitMargin / acquisitionCost) * 100 : 0;
  
  const parsedCommPercent = parseFloat(commissionPercent || 0);
  const calculatedCommission = parsedSoldPrice * (parsedCommPercent / 100);

  // Payment splits percentages for simple bar visualization
  const tokenPercentage = parsedSoldPrice > 0 ? (parsedToken / parsedSoldPrice) * 100 : 0;
  const advancePercentage = parsedSoldPrice > 0 ? (parsedAdvance / parsedSoldPrice) * 100 : 0;
  const balancePercentage = parsedSoldPrice > 0 ? (remainderBalance / parsedSoldPrice) * 100 : 100;

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
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Billing Hub</span>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px', letterSpacing: '-0.5px' }}>Close Property Sale Deal</h2>
        </div>
      </div>

      {/* Property Overview Strip */}
      {matchedProperty && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '16px 24px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px'
        }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase' }}>Target Asset</span>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>{matchedProperty.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {matchedProperty.id} • {matchedProperty.type}</div>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase' }}>Original Listing Price</span>
            <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>{formatCurrency(matchedProperty.price)}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Baseline Market Val</div>
          </div>

          {isManager && (
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase' }}>ERP Acquisition Cost</span>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#7e22ce', marginTop: '2px' }}>{formatCurrency(acquisitionCost)}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bought from {matchedProperty.vendorName || 'Independent Owner'}</div>
            </div>
          )}

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase' }}>Listing Status</span>
            <div style={{ marginTop: '4px' }}>
              <span className="badge success" style={{ textTransform: 'uppercase', fontSize: '9px', fontWeight: '800' }}>Available for closure</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Form Details */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          padding: '32px'
        }}>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Asset Selection */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '14px', borderRadius: '2px', background: 'var(--primary)', display: 'inline-block' }}></span>
                <span>Select Listing to Settle</span>
              </h3>

              <div className="form-group">
                {property ? (
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-main)',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)'
                  }}>
                    {property.id} — {property.name} ({property.type})
                  </div>
                ) : (
                  <select
                    className="form-select"
                    style={{
                      height: '42px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '2px solid var(--primary)',
                      background: '#fff',
                      width: '100%',
                      fontWeight: '700'
                    }}
                    value={selectedPropertyId}
                    onChange={handlePropertyChange}
                    required
                  >
                    <option value="">-- Choose Available Property --</option>
                    {availableProps.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.name} ({p.type}) | Price: ₹{new Intl.NumberFormat('en-IN').format(p.price)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Buyer CRM details */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '14px', borderRadius: '2px', background: 'var(--primary)', display: 'inline-block' }}></span>
                <span>Buyer / CRM Customer Details</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="buyer-select-input" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Buyer Name *
                  </label>
                  <input 
                    type="text" 
                    id="buyer-select-input"
                    list="leads-list-page"
                    className="form-input"
                    style={{
                      height: '42px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      width: '100%'
                    }}
                    placeholder="Search or type buyer name (e.g. Rahul Sharma)" 
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                  />
                  <datalist id="leads-list-page">
                    {customers.map((c, i) => (
                      <option key={i} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label htmlFor="full-deal-price" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Final Closing Selling Price (₹) *
                  </label>
                  <input 
                    type="number" 
                    id="full-deal-price"
                    className="form-input"
                    style={{
                      height: '42px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      width: '100%'
                    }}
                    placeholder="e.g. 5200000" 
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="full-sale-date" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Deal Closing Date
                  </label>
                  <input 
                    type="date" 
                    id="full-sale-date"
                    className="form-input"
                    style={{
                      height: '42px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      width: '100%'
                    }}
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Financial splits details panel */}
            <div style={{
              background: 'rgba(217, 119, 6, 0.02)',
              border: '1px solid rgba(217, 119, 6, 0.12)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: '#d97706', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💰 Deal Ledger Payment Splits</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>Token Amount (₹) *</label>
                  <input 
                    type="number"
                    className="form-input"
                    style={{
                      height: '40px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      width: '100%',
                      fontSize: '13px'
                    }}
                    placeholder="e.g. 50000"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>Advance Paid (₹) *</label>
                  <input 
                    type="number"
                    className="form-input"
                    style={{
                      height: '40px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      width: '100%',
                      fontSize: '13px'
                    }}
                    placeholder="e.g. 150000"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>Commission % *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="number"
                      step="0.1"
                      className="form-input"
                      style={{
                        height: '40px',
                        padding: '8px 24px 8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        width: '100%',
                        fontSize: '13px'
                      }}
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(e.target.value)}
                      required
                    />
                    <div style={{ position: 'absolute', right: '10px', color: 'var(--text-light)', fontSize: '12px', fontWeight: '700' }}>%</div>
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>Agreement Filename / ID</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }}>
                      <FileText size={14} />
                    </div>
                    <input 
                      type="text"
                      className="form-input"
                      style={{
                        height: '40px',
                        padding: '8px 12px 8px 30px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        width: '100%',
                        fontSize: '13px'
                      }}
                      value={agreementFile}
                      onChange={(e) => setAgreementFile(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mode selection & dynamic input */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '14px', borderRadius: '2px', background: 'var(--primary)', display: 'inline-block' }}></span>
                <span>Payment Mode & Validation</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="full-payment-method" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Payment Mode *
                  </label>
                  <select 
                    id="full-payment-method"
                    className="form-select"
                    style={{
                      height: '42px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: '#fff',
                      width: '100%',
                      fontWeight: '600'
                    }}
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setPaymentDetails('');
                    }}
                    required
                  >
                    <option value="Cash">Cash Settlement</option>
                    <option value="UPI / NetBanking">UPI / NetBanking</option>
                    <option value="Bank Wire Transfer">Bank Wire Transfer (NEFT/RTGS)</option>
                    <option value="Cheque / DD">Cheque / Demand Draft</option>
                    <option value="Home Loan / Financing">Home Loan / Bank Financing</option>
                  </select>
                </div>

                <div className="form-group">
                  {paymentMethod === 'UPI / NetBanking' && (
                    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
                      <label htmlFor="full-pay-details" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--primary)' }}>
                        UPI Ref / UTR Transaction ID *
                      </label>
                      <input 
                        type="text" 
                        id="full-pay-details"
                        className="form-input"
                        style={{ height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--primary)', width: '100%', fontSize: '13px' }}
                        placeholder="e.g. UTR12873491823"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {paymentMethod === 'Bank Wire Transfer' && (
                    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
                      <label htmlFor="full-pay-details" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--primary)' }}>
                        Bank Reference / UTR Number *
                      </label>
                      <input 
                        type="text" 
                        id="full-pay-details"
                        className="form-input"
                        style={{ height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--primary)', width: '100%', fontSize: '13px' }}
                        placeholder="e.g. HDFCR520260531002"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {paymentMethod === 'Cheque / DD' && (
                    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
                      <label htmlFor="full-pay-details" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block', color: '#d97706' }}>
                        Cheque/DD Number & Date *
                      </label>
                      <input 
                        type="text" 
                        id="full-pay-details"
                        className="form-input"
                        style={{ height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d97706', width: '100%', fontSize: '13px' }}
                        placeholder="e.g. Chq: 002134, Date: 2026-06-05"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {paymentMethod === 'Home Loan / Financing' && (
                    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
                      <label htmlFor="full-pay-details" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--primary)' }}>
                        Financing Bank Name & Loan Acc *
                      </label>
                      <input 
                        type="text" 
                        id="full-pay-details"
                        className="form-input"
                        style={{ height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--primary)', width: '100%', fontSize: '13px' }}
                        placeholder="e.g. SBI Home Loans - LAcc 3827182"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {paymentMethod === 'Cash' && (
                    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
                      <label htmlFor="full-pay-details" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>
                        Cash Receipt Notes (Optional)
                      </label>
                      <input 
                        type="text" 
                        id="full-pay-details"
                        className="form-input"
                        style={{ height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', width: '100%', fontSize: '13px' }}
                        placeholder="e.g. Receipt No: R-9821, Handed to Manager"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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
                  background: 'linear-gradient(135deg, hsl(0, 93%, 45%) 0%, hsl(0, 93%, 38%) 100%)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)';
                }}
              >
                <Sparkles size={16} />
                <span>Confirm Property Sale & Bill</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Live Deal Financials & Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>
          
          {/* Main Financial Analytics Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--primary)' }}>📊</span>
              <span>Deal Profit & Financial Analytics</span>
            </h3>

            {/* Profit Margin Meter Section */}
            {isManager && matchedProperty && (
              <div style={{
                background: profitMargin > 0 ? 'rgba(22, 163, 74, 0.03)' : 'rgba(239, 68, 68, 0.03)',
                border: `1px solid ${profitMargin > 0 ? 'rgba(22, 163, 74, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: profitMargin > 0 ? '#16a34a' : '#ef4444' }}>
                    {profitMargin > 0 ? '🎉 PROFITABLE DEAL CLOSING' : '⚠️ NEGATIVE MARGIN ALERT'}
                  </span>
                  {profitMargin > 0 ? (
                    <TrendingUp size={20} style={{ color: '#16a34a' }} />
                  ) : (
                    <TrendingDown size={20} style={{ color: '#ef4444' }} />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '600' }}>ESTIMATED GROSS PROFIT</span>
                  <span style={{ fontSize: '28px', fontWeight: '900', color: profitMargin > 0 ? '#15803d' : '#b91c1c' }}>
                    {formatCurrency(profitMargin)}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: `1px dashed ${profitMargin > 0 ? 'rgba(22, 163, 74, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`, paddingTop: '8px' }}>
                  Return on Cost: <strong style={{ color: profitMargin > 0 ? '#16a34a' : '#ef4444' }}>{profitPercentage.toFixed(1)}%</strong> (Acq: {formatCurrency(acquisitionCost)})
                </div>
              </div>
            )}

            {/* Commission Earned Meter */}
            <div style={{
              background: 'rgba(37, 99, 235, 0.03)',
              border: '1px solid rgba(37, 99, 235, 0.15)',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--primary)', fontWeight: '800' }}>
                  <Percent size={10} />
                  <span>COMMISSION EARNED</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '850', color: 'var(--text-main)', marginTop: '4px' }}>
                  {formatCurrency(calculatedCommission)}
                </div>
              </div>
              <div style={{
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '850',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                {parsedCommPercent.toFixed(1)}% Yield
              </div>
            </div>

            {/* Payment splits graphics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)' }}>Payment Settlement Breakdown</span>
              
              {/* Splitted Stacked Bar */}
              <div style={{
                height: '14px',
                borderRadius: '7px',
                background: '#f1f5f9',
                display: 'flex',
                overflow: 'hidden',
                marginTop: '6px'
              }}>
                {parsedToken > 0 && (
                  <div style={{
                    width: `${tokenPercentage}%`,
                    background: '#d97706',
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }} title={`Token Amount: ${formatCurrency(parsedToken)}`} />
                )}
                {parsedAdvance > 0 && (
                  <div style={{
                    width: `${advancePercentage}%`,
                    background: '#2563eb',
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }} title={`Advance Payment: ${formatCurrency(parsedAdvance)}`} />
                )}
                {remainderBalance > 0 && (
                  <div style={{
                    width: `${balancePercentage}%`,
                    background: '#e2e8f0',
                    borderLeft: '1px solid #cbd5e1',
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }} title={`Remaining Balance: ${formatCurrency(remainderBalance)}`} />
                )}
              </div>

              {/* Legends list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }}></span>
                    <span style={{ color: 'var(--text-muted)' }}>Token / Booking Amount:</span>
                  </div>
                  <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(parsedToken)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }}></span>
                    <span style={{ color: 'var(--text-muted)' }}>Advance Payment Paid:</span>
                  </div>
                  <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(parsedAdvance)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e2e8f0', border: '1px solid #cbd5e1', display: 'inline-block' }}></span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Remaining Final Balance:</span>
                  </div>
                  <strong style={{ color: remainderBalance > 0 ? 'var(--primary)' : '#16a34a' }}>
                    {remainderBalance > 0 ? formatCurrency(remainderBalance) : 'Fully Settled ✓'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', paddingTop: '4px' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Total Deal Settlement:</strong>
                  <strong style={{ color: 'var(--text-main)', fontSize: '16px' }}>{formatCurrency(parsedSoldPrice)}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Secure ERP guidelines card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <ShieldAlert size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#64748b' }} />
            <div>
              <h4 style={{ fontWeight: '800', fontSize: '13.5px', color: 'var(--text-main)' }}>Escrow & Ledger Audits</h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                All transaction splits are live-audited for legal compliance. Generates an instant printable digital invoice receipt for buyer records.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
