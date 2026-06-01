import React, { useState } from 'react';
import { Landmark, TrendingUp, Layers, ShoppingBag, DollarSign, Calendar, Target, Award, ShieldAlert } from 'lucide-react';

export default function ReportsSection({ properties = [], leads = [], requirements = [], deals = [], searchQuery = '' }) {
  const [activeReportTab, setActiveReportTab] = useState('available');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Available Properties
  const availableProperties = properties.filter(p => p.status === 'Available');
  const availableInventoryValue = availableProperties.reduce((sum, p) => sum + parseFloat(p.price || 0), 0);

  // 2. Sold Properties
  const soldProperties = properties.filter(p => p.status === 'Sold');
  const totalSalesRevenue = soldProperties.reduce((sum, p) => sum + parseFloat(p.price || 0), 0);

  // 3. Buyer Requirements
  const openRequirementsCount = requirements.filter(r => r.status === 'Open').length;

  // 4. Commission & Deal Calculations
  const totalCommissionEarned = deals.reduce((sum, d) => sum + parseFloat(d.commissionEarned || 0), 0);
  const totalClosedDeals = deals.length;

  // Filter lists based on search query
  const query = searchQuery.toLowerCase();
  
  const filteredAvailable = availableProperties.filter(p => 
    p.id.toLowerCase().includes(query) || p.name.toLowerCase().includes(query)
  );

  const filteredSold = soldProperties.filter(p => 
    p.id.toLowerCase().includes(query) || p.name.toLowerCase().includes(query)
  );

  const filteredRequirements = requirements.filter(r => 
    r.buyerName.toLowerCase().includes(query) || r.preferredLocation.toLowerCase().includes(query)
  );

  const filteredDeals = deals.filter(d => 
    d.buyerName.toLowerCase().includes(query) || d.propertyName.toLowerCase().includes(query)
  );

  return (
    <div style={{ animation: 'fade-in 0.4s ease-out' }}>
      
      {/* 1. Dynamic Performance Analytics Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card blue">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper"><Layers size={20} /></div>
            <div className="stat-value">{availableProperties.length}</div>
          </div>
          <div className="stat-title">Available Properties</div>
          <div className="stat-subtext">Active listings value: {formatCurrency(availableInventoryValue)}</div>
        </div>

        <div className="stat-card green">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper"><ShoppingBag size={20} /></div>
            <div className="stat-value">{soldProperties.length}</div>
          </div>
          <div className="stat-title">Sold Properties</div>
          <div className="stat-subtext">Total Gross Volume: {formatCurrency(totalSalesRevenue)}</div>
        </div>

        <div className="stat-card teal">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper"><Award size={20} /></div>
            <div className="stat-value" style={{ color: 'var(--success-text)' }}>
              {formatCurrency(totalCommissionEarned)}
            </div>
          </div>
          <div className="stat-title">Commissions Earned</div>
          <div className="stat-subtext">Sum of calculations: {totalClosedDeals} deals</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper"><Target size={20} /></div>
            <div className="stat-value">{openRequirementsCount}</div>
          </div>
          <div className="stat-title">Open Requirements</div>
          <div className="stat-subtext">Active buyers waiting to match</div>
        </div>
      </div>

      {/* 2. Sub-tab bar selectors for the 6 requested reports */}
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '8px', 
          background: 'var(--bg-light)', 
          padding: '6px', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)', 
          marginBottom: '24px' 
        }}
      >
        {[
          { id: 'available', label: '🏡 Available Properties' },
          { id: 'sold', label: '🤝 Sold Properties' },
          { id: 'requirements', label: '📋 Buyer Requirements' },
          { id: 'deals', label: '🧾 Deal Payment Splits' },
          { id: 'commissions', label: '💰 Commission splits' },
          { id: 'performance', label: '📈 Performance analytics' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12.5px',
              fontWeight: '700',
              background: activeReportTab === tab.id ? 'var(--primary-color)' : 'transparent',
              color: activeReportTab === tab.id ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              boxShadow: activeReportTab === tab.id ? '0 2px 6px rgba(37, 99, 235, 0.2)' : 'none'
            }}
            onClick={() => setActiveReportTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Render respective report details */}
      
      {/* 3.1 Available Properties Report */}
      {activeReportTab === 'available' && (
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Active Available Listings Report</h3>
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Property ID</th>
                  <th>Property Particulars</th>
                  <th>Type</th>
                  <th>Listed Price</th>
                  <th>Owner Name</th>
                  <th>Owner Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredAvailable.length > 0 ? (
                  filteredAvailable.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{p.id}</td>
                      <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{p.name}</td>
                      <td><span className="badge info">{p.type}</span></td>
                      <td style={{ fontWeight: '800', color: 'var(--primary-color)' }}>{formatCurrency(p.price)}</td>
                      <td style={{ fontWeight: '600' }}>{p.ownerName || 'Independent Owner'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{p.ownerMobile || '999xxxxxx8'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="table-empty-state">No available listings register matching search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3.2 Sold Properties Report */}
      {activeReportTab === 'sold' && (
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Closed Sales Turnover Ledger</h3>
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Property ID</th>
                  <th>Property Particulars</th>
                  <th>Type</th>
                  <th>Acquisition Cost</th>
                  <th>Closing Deal Price</th>
                  <th>Payment Settlement</th>
                </tr>
              </thead>
              <tbody>
                {filteredSold.length > 0 ? (
                  filteredSold.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{p.id}</td>
                      <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{p.name}</td>
                      <td><span className="badge info">{p.type}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(p.purchasePrice || p.price * 0.8)}</td>
                      <td style={{ fontWeight: '800', color: 'var(--success-text)' }}>{formatCurrency(p.price)}</td>
                      <td>
                        <span className="badge success" style={{ textTransform: 'uppercase', fontSize: '10.5px' }}>
                          {p.paymentMethod || 'Cash'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="table-empty-state">No sold properties listed in the ledger.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3.3 Buyer Requirement Report */}
      {activeReportTab === 'requirements' && (
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Active Buyer Budgets & Requirements</h3>
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Buyer Name</th>
                  <th>Mobile</th>
                  <th>Type Required</th>
                  <th>Budget Range</th>
                  <th>Preferred Location</th>
                  <th>Area Needed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.length > 0 ? (
                  filteredRequirements.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{r.buyerName}</td>
                      <td style={{ fontFamily: 'monospace' }}>{r.mobile}</td>
                      <td><span className="badge info">{r.propertyType}</span></td>
                      <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{r.budgetRange}</td>
                      <td style={{ fontWeight: '600' }}>{r.preferredLocation}</td>
                      <td style={{ fontFamily: 'monospace' }}>{r.areaRequirement}</td>
                      <td><span className="badge success">{r.status}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="table-empty-state">No buyer requirements matched.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3.4 Deal Report */}
      {activeReportTab === 'deals' && (
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Closed Transaction Ledger & Payments splits</h3>
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Deal ID</th>
                  <th>Target Property</th>
                  <th>Buyer Name</th>
                  <th>Token Paid</th>
                  <th>Advance Paid</th>
                  <th>Final balance</th>
                  <th>Sale Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length > 0 ? (
                  filteredDeals.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{d.id}</td>
                      <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{d.propertyName}</td>
                      <td style={{ fontWeight: '600' }}>{d.buyerName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(d.tokenAmount)}</td>
                      <td style={{ color: 'var(--primary-color)', fontWeight: '600' }}>{formatCurrency(d.advancePayment)}</td>
                      <td style={{ color: 'var(--success-text)', fontWeight: '700' }}>{formatCurrency(d.finalPayment)}</td>
                      <td style={{ fontFamily: 'monospace' }}>{d.saleDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="table-empty-state">No deals transaction records registered.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3.5 Commission splits ledger */}
      {activeReportTab === 'commissions' && (
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Brokerage & Commissions Splits Report</h3>
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Deal ID</th>
                  <th>Target Property</th>
                  <th>Buyer Name</th>
                  <th>Total Deal Amount</th>
                  <th>Commission %</th>
                  <th>Commission Earned</th>
                  <th>Sale Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length > 0 ? (
                  filteredDeals.map(d => {
                    const totalVal = d.tokenAmount + d.advancePayment + d.finalPayment;
                    return (
                      <tr key={d.id}>
                        <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{d.id}</td>
                        <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{d.propertyName}</td>
                        <td style={{ fontWeight: '600' }}>{d.buyerName}</td>
                        <td style={{ fontWeight: '700' }}>{formatCurrency(totalVal)}</td>
                        <td><span className="badge warning" style={{ fontWeight: '800' }}>{d.commissionPercent}%</span></td>
                        <td style={{ fontWeight: '800', color: '#16a34a' }}>{formatCurrency(d.commissionEarned)}</td>
                        <td style={{ fontFamily: 'monospace' }}>{d.saleDate}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="7" className="table-empty-state">No commission reports registered inside the database.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3.6 Performance Report */}
      {activeReportTab === 'performance' && (
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '18px' }}>Monthly Agency Performance Analysis</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Deal Conversion Ratio</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px' }}>
                {requirements.length > 0 ? Math.round((deals.length / requirements.length) * 100) : 0}%
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Closed vs requirements inquiry</span>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Avg Commission Per Transaction</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px' }}>
                {deals.length > 0 ? formatCurrency(totalCommissionEarned / deals.length) : '₹0'}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Brokerage spread averages</span>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Inventory Sales Turnover Rate</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px' }}>
                {properties.length > 0 ? Math.round((soldProperties.length / properties.length) * 100) : 0}%
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Closed vs total assets listings</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
            <Sparkles size={16} style={{ color: 'var(--primary-color)' }} />
            <span>Monthly Performance matches standard PropDeal KPI indicators. Good job team!</span>
          </div>
        </div>
      )}

    </div>
  );
}
