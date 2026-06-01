import React, { useState } from 'react';
import { Plus, Search, CheckCircle, Target, Sparkles, X, Phone } from 'lucide-react';

export default function BuyRequirementsSection({ requirements = [], properties = [], onAddRequirement, searchQuery = '' }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [budgetRange, setBudgetRange] = useState('₹20L - ₹40L');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [propertyType, setPropertyType] = useState('Flat');
  const [areaRequirement, setAreaRequirement] = useState('');

  // Matching Drawer State
  const [matchingDrawerOpen, setMatchingDrawerOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!buyerName || !mobile || !preferredLocation || !areaRequirement) {
      alert("Please fill in all fields.");
      return;
    }
    onAddRequirement({
      buyerName,
      mobile,
      budgetRange,
      preferredLocation,
      propertyType,
      areaRequirement
    });
    // Reset
    setBuyerName('');
    setMobile('');
    setBudgetRange('₹20L - ₹40L');
    setPreferredLocation('');
    setPropertyType('Flat');
    setAreaRequirement('');
    setModalOpen(false);
  };

  // Filter based on search query
  const query = searchQuery.toLowerCase();
  const filteredRequirements = requirements.filter(r => 
    r.buyerName.toLowerCase().includes(query) ||
    r.preferredLocation.toLowerCase().includes(query) ||
    r.propertyType.toLowerCase().includes(query)
  );

  // Property Matching Algorithm (Matches Location AND Type)
  const getMatchingProperties = (req) => {
    if (!req) return [];
    return properties.filter(p => 
      p.status === 'Available' &&
      p.type.toLowerCase() === req.propertyType.toLowerCase() &&
      (p.name.toLowerCase().includes(req.preferredLocation.toLowerCase()) || 
       req.preferredLocation.toLowerCase().includes(p.name.toLowerCase()) ||
       p.type.toLowerCase().includes(req.preferredLocation.toLowerCase()))
    );
  };

  const handleOpenMatching = (req) => {
    setSelectedReq(req);
    setMatchingDrawerOpen(true);
  };

  return (
    <div style={{ animation: 'fade-in 0.4s ease-out' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Buyer Requirements Registry</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Track prospective buyer budgets, locations, and match available properties.</p>
        </div>
        <button 
          type="button" 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          Add Buy Requirement
        </button>
      </div>

      {/* Grid Requirements Table */}
      <div className="dashboard-card" style={{ padding: '24px' }}>
        <div className="table-responsive">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Buyer Particulars</th>
                <th>Type Required</th>
                <th>Budget Range</th>
                <th>Preferred Location</th>
                <th>Area Req</th>
                <th>Status</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Matching Engine</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.length > 0 ? (
                filteredRequirements.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{req.id}</td>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{req.buyerName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={10} /> {req.mobile}
                      </div>
                    </td>
                    <td>
                      <span className="badge info">{req.propertyType}</span>
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{req.budgetRange}</td>
                    <td style={{ fontWeight: '600' }}>{req.preferredLocation}</td>
                    <td style={{ fontFamily: 'monospace' }}>{req.areaRequirement}</td>
                    <td>
                      <span className={`badge ${req.status === 'Open' ? 'success' : 'warning'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="badge success"
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: '800',
                          background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
                          color: '#fff',
                          boxShadow: 'var(--shadow-md)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleOpenMatching(req)}
                      >
                        <Sparkles size={11} />
                        Match Deal
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="table-empty-state">
                    No active buy requirements found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Add Buy Requirement Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>📋 Record Buyer Requirement</h3>
              <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-form">
                  <div className="form-group">
                    <label htmlFor="req-buyer">Buyer Full Name *</label>
                    <input 
                      type="text" 
                      id="req-buyer"
                      className="form-input"
                      placeholder="e.g. Sumeet Malhotra" 
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="req-mobile">Mobile Number *</label>
                    <input 
                      type="text" 
                      id="req-mobile"
                      className="form-input"
                      placeholder="e.g. 9876543210" 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="req-budget">Budget Range *</label>
                    <select
                      id="req-budget"
                      className="form-select"
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                    >
                      <option value="₹20L - ₹40L">₹20L - ₹40L</option>
                      <option value="₹40L - ₹75L">₹40L - ₹75L</option>
                      <option value="₹75L - ₹1.5Cr">₹75L - ₹1.5Cr</option>
                      <option value="₹1.5Cr - ₹3Cr">₹1.5Cr - ₹3Cr</option>
                      <option value="₹3Cr+">₹3Cr+</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="req-type">Property Type Requirement *</label>
                    <select 
                      id="req-type"
                      className="form-select"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    >
                      <option value="House">House / Villa</option>
                      <option value="Flat">Flat / Apartment</option>
                      <option value="Plot">Plot / Land</option>
                      <option value="Shop">Commercial Shop</option>
                      <option value="Office">Office Space</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="req-loc">Preferred Location / Area *</label>
                    <input 
                      type="text" 
                      id="req-loc"
                      className="form-input"
                      placeholder="e.g. Mumbai West, Galaxy Circle" 
                      value={preferredLocation}
                      onChange={(e) => setPreferredLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="req-area">Area Requirement *</label>
                    <input 
                      type="text" 
                      id="req-area"
                      className="form-input"
                      placeholder="e.g. 1500 sqft, 2 Bigha" 
                      value={areaRequirement}
                      onChange={(e) => setAreaRequirement(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Property Matching Drawer Panel */}
      {matchingDrawerOpen && selectedReq && (
        <div className="modal-overlay" style={{ zIndex: 99999 }} onClick={() => setMatchingDrawerOpen(false)}>
          <div 
            className="modal-container" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '520px', 
              position: 'fixed', 
              right: 0, 
              top: 0, 
              bottom: 0, 
              borderRadius: 0, 
              height: '100vh',
              animation: 'slide-in 0.3s ease-out'
            }}
          >
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} style={{ color: 'var(--primary-color)' }} />
                <span>AI Recommendation matching</span>
              </h3>
              <button type="button" className="modal-close-btn" onClick={() => setMatchingDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ background: 'var(--bg-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Buyer Profile: {selectedReq.buyerName}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div>Type: <strong>{selectedReq.propertyType}</strong></div>
                  <div>Budget: <strong>{selectedReq.budgetRange}</strong></div>
                  <div>Location: <strong>{selectedReq.preferredLocation}</strong></div>
                  <div>Area: <strong>{selectedReq.areaRequirement}</strong></div>
                </div>
              </div>

              <h4 style={{ fontSize: '13px', color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '800' }}>
                Matching Properties Found ({getMatchingProperties(selectedReq).length})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {getMatchingProperties(selectedReq).length > 0 ? (
                  getMatchingProperties(selectedReq).map((prop) => (
                    <div 
                      key={prop.id}
                      style={{
                        padding: '16px',
                        background: '#fff',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{prop.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {prop.id} | Type: {prop.type}</div>
                        </div>
                        <span className="badge success" style={{ background: '#dcfce7', color: '#16a34a' }}>
                          ₹{new Intl.NumberFormat('en-IN').format(prop.price)}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Owner: <strong>{prop.ownerName || 'Independent'}</strong></span>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            borderRadius: '6px'
                          }}
                          onClick={() => {
                            alert(`🤝 Matching Recommended! Scheduling inquiry for buyer "${selectedReq.buyerName}" to acquire Property "${prop.name}".`);
                            setMatchingDrawerOpen(false);
                          }}
                        >
                          Send Recommendation
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 10px', background: 'var(--bg-light)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                    <Sparkles size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No direct Available matching property found.</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Try adding properties in **{selectedReq.preferredLocation}** of type **{selectedReq.propertyType}**.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
