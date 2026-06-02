import React, { useState } from 'react';
import { Landmark, TrendingUp, Layers, ShoppingBag, DollarSign, Calendar, Target, Award, ShieldAlert, Users, Compass, CheckSquare, Sparkles, Star } from 'lucide-react';

export default function ReportsSection({ properties = [], leads = [], requirements = [], deals = [], visits = [], agents = [], searchQuery = '' }) {
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
          { id: 'payments_report', label: '💵 Payment Ledger' },
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

      {/* 3.4.5 Detailed Payments Report */}
      {activeReportTab === 'payments_report' && (
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>💵 Detailed Payments & Installments Ledger</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Track which plot has received how much payment, how it came, and what balance remains.</p>
            </div>
            <span className="badge info" style={{ fontWeight: '800' }}>
              MySQL Live Feed
            </span>
          </div>

          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Plot / Asset</th>
                  <th>Buyer Name</th>
                  <th>Total Cost (₹)</th>
                  <th>Payment Mode & Ref</th>
                  <th>Paid So Far (Token + Adv)</th>
                  <th>Remaining Balance (₹)</th>
                  <th>Settlement Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length > 0 ? (
                  filteredDeals.map(d => {
                    const totalVal = parseFloat(d.tokenAmount || 0) + parseFloat(d.advancePayment || 0) + parseFloat(d.finalPayment || 0);
                    const totalPaidSoFar = parseFloat(d.tokenAmount || 0) + parseFloat(d.advancePayment || 0);
                    const remainingBalance = Math.max(totalVal - totalPaidSoFar, 0);
                    const isFullyPaid = remainingBalance <= 0;

                    return (
                      <tr key={d.id}>
                        {/* Plot info */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{d.propertyName}</strong>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>ID: {d.propertyId}</span>
                          </div>
                        </td>
                        
                        {/* Buyer */}
                        <td style={{ fontWeight: '600' }}>{d.buyerName}</td>
                        
                        {/* Total Cost */}
                        <td style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                          {formatCurrency(totalVal)}
                        </td>

                        {/* Payment mode & ref */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span className={`badge ${
                              d.paymentMethod === 'Cash' ? 'success' :
                              d.paymentMethod === 'UPI / NetBanking' ? 'info' :
                              d.paymentMethod === 'Bank Wire Transfer' ? 'info' :
                              d.paymentMethod === 'Cheque / DD' ? 'warning' : 'info'
                            }`} style={{ fontSize: '9px', padding: '2px 6px', fontWeight: '800', width: 'fit-content' }}>
                              {d.paymentMethod || 'Cash'}
                            </span>
                            {d.paymentDetails && (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                Ref: {d.paymentDetails}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Paid So Far */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: '#16a34a' }}>{formatCurrency(totalPaidSoFar)}</strong>
                            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                              Tok: {formatCurrency(d.tokenAmount)} • Adv: {formatCurrency(d.advancePayment)}
                            </span>
                          </div>
                        </td>

                        {/* Remaining Balance */}
                        <td style={{ fontWeight: '850', color: isFullyPaid ? '#16a34a' : 'var(--primary-color)' }}>
                          {formatCurrency(remainingBalance)}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`badge ${isFullyPaid ? 'success' : 'warning'}`} style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '10px' }}>
                            {isFullyPaid ? 'Fully Paid ✓' : `${formatCurrency(remainingBalance)} Pending`}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="table-empty-state">
                      No payments recorded yet. Close some sale deals first!
                    </td>
                  </tr>
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

      {/* 3.6 Dynamic Performance Analytics Report Dashboard */}
      {activeReportTab === 'performance' && (
        <div style={{ animation: 'fade-in 0.4s ease-out', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Performance Summary Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase' }}>CRM Conversion Ratio</span>
              <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--primary)', marginTop: '8px' }}>
                {leads.length > 0 ? Math.round((deals.length / leads.length) * 100) : 0}%
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Leads converted to closed sales</span>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase' }}>Internal Net Profit ROI</span>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#16a34a', marginTop: '8px' }}>
                {formatCurrency(properties.filter(p => p.status === 'Sold').reduce((sum, p) => sum + parseFloat(p.price - (p.purchasePrice || p.price * 0.8)), 0))}
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Sold Price - Acquisition Cost</span>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase' }}>Avg Deal Value</span>
              <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-main)', marginTop: '8px' }}>
                {deals.length > 0 ? formatCurrency(deals.reduce((sum, d) => sum + parseFloat(d.tokenAmount + d.advancePayment + d.finalPayment), 0) / deals.length) : '₹0'}
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Average contract sizing</span>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase' }}>Visits Conversion</span>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#7e22ce', marginTop: '8px' }}>
                {visits.length > 0 ? Math.round((deals.length / visits.length) * 100) : 0}%
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Sales deals closed vs visits</span>
            </div>
          </div>

          {/* CRM Conversion Funnel */}
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '850', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚀 Live CRM Sales Funnel Pipeline</span>
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              background: 'var(--bg-main)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)'
            }}>
              {[
                { label: 'Leads Registered', count: leads.length, color: 'var(--primary)', pct: 100 },
                { label: 'Requirements Submitted', count: requirements.length, color: '#0d9488', pct: leads.length > 0 ? Math.round((requirements.length / leads.length) * 100) : 0 },
                { label: 'Site Visits Scheduled', count: visits.length, color: '#7e22ce', pct: requirements.length > 0 ? Math.round((visits.length / requirements.length) * 100) : 0 },
                { label: 'Closed Sales', count: deals.length, color: '#16a34a', pct: visits.length > 0 ? Math.round((deals.length / visits.length) * 100) : 0 }
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div style={{
                    flex: 1,
                    minWidth: '130px',
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    padding: '16px',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'center' }}>{step.label}</span>
                    <strong style={{ fontSize: '20px', color: step.color, marginTop: '4px' }}>{step.count}</strong>
                    <span style={{
                      fontSize: '9.5px',
                      background: 'var(--bg-main)',
                      color: 'var(--text-muted)',
                      padding: '2px 8px',
                      borderRadius: '30px',
                      fontWeight: '700',
                      marginTop: '4px'
                    }}>
                      {step.pct}% Yield
                    </span>
                  </div>
                  {idx < 3 && (
                    <div style={{
                      fontSize: '20px',
                      color: 'var(--text-light)',
                      fontWeight: '800',
                      userSelect: 'none',
                      padding: '0 8px'
                    }}>
                      →
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Comparative Agent Leaderboard Scoreboard */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* Agent Scoreboard Card */}
            <div className="dashboard-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '850', color: 'var(--text-main)', marginBottom: '16px' }}>👥 Active Agents Conversion Scoreboard</h3>
              
              <div className="table-responsive">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Agent Name</th>
                      <th>Assigned Leads</th>
                      <th>Closed Sales</th>
                      <th>Brokerage Yield</th>
                      <th>Ranking Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.length > 0 ? (
                      agents.map(agent => {
                        // Dynamic matching calculation connecting MySQL schema sets together
                        const agentLeads = leads.filter(l => l.assignedTo === agent.fullName);
                        const agentLeadNames = agentLeads.map(l => l.name);
                        
                        // Count deals matching lead names assigned to this agent
                        const agentDeals = deals.filter(d => agentLeadNames.includes(d.buyerName));
                        const closedDeals = agentDeals.length;
                        const commissionEarned = agentDeals.reduce((sum, d) => sum + parseFloat(d.commissionEarned || 0), 0);

                        const stars = closedDeals === 0 ? 2 : closedDeals === 1 ? 3 : closedDeals === 2 ? 4 : 5;

                        return (
                          <tr key={agent.userId}>
                            {/* Profile details */}
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img 
                                  src={agent.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'} 
                                  alt={agent.fullName}
                                  style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <strong style={{ color: 'var(--text-main)', fontSize: '12.5px' }}>{agent.fullName}</strong>
                                  <span style={{ fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase' }}>{agent.city} • {agent.role}</span>
                                </div>
                              </div>
                            </td>

                            {/* Assigned leads */}
                            <td style={{ fontWeight: '700', textAlign: 'center' }}>{agentLeads.length}</td>

                            {/* Closed deals */}
                            <td style={{ fontWeight: '800', color: closedDeals > 0 ? '#16a34a' : 'var(--text-muted)', textAlign: 'center' }}>
                              {closedDeals} closed
                            </td>

                            {/* Yield */}
                            <td style={{ fontWeight: '800', color: 'var(--primary)' }}>
                              {formatCurrency(commissionEarned)}
                            </td>

                            {/* Rating Rank stars */}
                            <td>
                              <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star key={i} size={11} fill={i < stars ? '#fbbf24' : 'none'} stroke={i < stars ? '#fbbf24' : '#cbd5e1'} />
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan="5" className="table-empty-state">No agents registered. Set up roles in User settings first!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Comparative category inventory bar chart */}
            <div className="dashboard-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '850', color: 'var(--text-main)', marginBottom: '16px' }}>📊 Comparative Category Sales Spread</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'House / Villa', type: 'House', color: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)' },
                  { label: 'Flat / Apartment', type: 'Flat', color: 'linear-gradient(90deg, #0d9488 0%, #14b8a6 100%)' },
                  { label: 'Plot / Land', type: 'Plot', color: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)' },
                  { label: 'Commercial Shop', type: 'Shop', color: 'linear-gradient(90deg, #7e22ce 0%, #a855f7 100%)' },
                  { label: 'Office Space', type: 'Office', color: 'linear-gradient(90deg, #db2777 0%, #f472b6 100%)' }
                ].map((cat, idx) => {
                  const totalCount = properties.filter(p => p.type === cat.type).length;
                  const soldCount = properties.filter(p => p.type === cat.type && p.status === 'Sold').length;
                  
                  // Calculate percentage relative to maximum sold or count
                  const soldPct = totalCount > 0 ? (soldCount / totalCount) * 100 : 0;

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{cat.label}</span>
                        <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                          {soldCount} Sold / {totalCount} Listed
                        </span>
                      </div>
                      <div style={{
                        height: '8px',
                        background: 'var(--bg-main)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: `${soldPct > 0 ? soldPct : 5}%`, // Min visual sliver if 0
                          background: cat.color,
                          height: '100%',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease-out'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer matches standard */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--text-muted)',
            fontSize: '12.5px'
          }}>
            <Sparkles size={16} style={{ color: 'var(--primary-color)' }} />
            <span>Monthly performance index matches standard Kaira Deal Universal ERP metrics seamlessly.</span>
          </div>

        </div>
      )}

    </div>
  );
}
