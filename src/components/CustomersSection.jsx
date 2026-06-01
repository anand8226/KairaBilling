import React, { useState } from 'react';
import { Users, User, Phone, Home, Sparkles, MessageSquare, ArrowUpRight } from 'lucide-react';

export default function CustomersSection({ properties = [], leads = [], searchQuery = '' }) {
  const [activeSubTab, setActiveSubTab] = useState('buyers'); // 'buyers' or 'sellers'

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Buyers (derived from leads)
  const buyersList = leads;

  // 2. Sellers (derived dynamically from properties that have owner details listed!)
  // In addition, standard mock sellers to ensure robust presentation
  const baseSellers = [
    { name: 'Rajesh Kumar', mobile: '9991238472', propertyName: 'Galaxy Plot', price: 600000 },
    { name: 'Karan Singh', mobile: '8881237492', propertyName: 'Sky Heights Flat', price: 7500000 }
  ];

  // Map properties that have custom owner details
  const activeSellers = properties
    .filter(p => p.ownerName)
    .map(p => ({
      name: p.ownerName,
      mobile: p.ownerMobile || '9876xxxxxx',
      propertyName: p.name,
      price: p.price
    }));

  const sellersList = [...activeSellers, ...baseSellers];

  const query = searchQuery.toLowerCase();
  const filteredBuyers = buyersList.filter(b => 
    b.name.toLowerCase().includes(query) || 
    b.requirement.toLowerCase().includes(query)
  );

  const filteredSellers = sellersList.filter(s => 
    s.name.toLowerCase().includes(query) ||
    s.propertyName.toLowerCase().includes(query)
  );

  return (
    <div style={{ animation: 'fade-in 0.4s ease-out' }}>
      
      {/* Header & Sub-Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>CRM Customer Directory</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Categorize buyers and sellers, track dynamic inquiries, and schedule calls.</p>
        </div>
        
        {/* Toggle Pill Buttons */}
        <div style={{ display: 'flex', background: 'var(--bg-light)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '12px',
              background: activeSubTab === 'buyers' ? '#fff' : 'transparent',
              color: activeSubTab === 'buyers' ? 'var(--primary-color)' : 'var(--text-muted)',
              boxShadow: activeSubTab === 'buyers' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveSubTab('buyers')}
          >
            👥 Buyers ({filteredBuyers.length})
          </button>
          <button
            type="button"
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '12px',
              background: activeSubTab === 'sellers' ? '#fff' : 'transparent',
              color: activeSubTab === 'sellers' ? 'var(--primary-color)' : 'var(--text-muted)',
              boxShadow: activeSubTab === 'sellers' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveSubTab('sellers')}
          >
            🏡 Sellers ({filteredSellers.length})
          </button>
        </div>
      </div>

      {/* Render Buyers list */}
      {activeSubTab === 'buyers' && (
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Buyer Particulars</th>
                  <th>Inquiry Requirement</th>
                  <th>Mobile Number</th>
                  <th>Assigned Agent</th>
                  <th>Status</th>
                  <th style={{ width: '120px' }}>Inquiry Tag</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuyers.length > 0 ? (
                  filteredBuyers.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img 
                            src={b.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=60"} 
                            alt={b.name} 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{b.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Buyer ID: {b.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        <span className="badge info">{b.requirement}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: '500' }}>{b.mobile}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{b.assignedTo || 'Unassigned'}</td>
                      <td>
                        <span className={`badge ${b.status === 'Interested' ? 'success' : b.status === 'New Lead' ? 'blue' : 'warning'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="badge info"
                          style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(37,99,235,0.06)', color: 'var(--primary-color)' }}
                          onClick={() => alert(`💬 Contacting Buyer ${b.name}: Opening WhatsApp/Inquiry chat.`)}
                        >
                          <MessageSquare size={10} /> Contact
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-empty-state">
                      No buyers match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Render Sellers list */}
      {activeSubTab === 'sellers' && (
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Seller Full Name</th>
                  <th>Listed Property Asset</th>
                  <th>Mobile Number</th>
                  <th>Price Value</th>
                  <th>Owner Tag</th>
                  <th style={{ width: '120px' }}>Inquiry Tag</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.length > 0 ? (
                  filteredSellers.map((s, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '14px'
                          }}>
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{s.name}</div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered Owner</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Home size={13} style={{ color: 'var(--primary-color)' }} />
                          <span>{s.propertyName}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: '500' }}>{s.mobile}</td>
                      <td style={{ fontWeight: '700', color: 'var(--success-text)' }}>{formatCurrency(s.price)}</td>
                      <td>
                        <span className="badge success">Direct Owner</span>
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="badge info"
                          style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(37,99,235,0.06)', color: 'var(--primary-color)' }}
                          onClick={() => alert(`💬 Contacting Owner ${s.name}: Opening WhatsApp/Inquiry chat.`)}
                        >
                          <MessageSquare size={10} /> Call Owner
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-empty-state">
                      No listed sellers registered inside the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
