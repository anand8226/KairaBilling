import React from 'react';
import { DollarSign, Landmark, CheckCircle, Percent, FileText } from 'lucide-react';

export default function DealsSection({ deals = [], searchQuery = '' }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const query = searchQuery.toLowerCase();
  const filteredDeals = deals.filter(d => 
    d.buyerName.toLowerCase().includes(query) ||
    d.propertyName.toLowerCase().includes(query) ||
    d.id.toLowerCase().includes(query)
  );

  return (
    <div style={{ animation: 'fade-in 0.4s ease-out' }}>
      
      {/* Header Bar */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Token, Advance & Deals Ledger</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Track closed transactions, advance token splits, agreement files, and agency commissions.</p>
      </div>

      {/* Deals Grid */}
      <div className="dashboard-card" style={{ padding: '24px' }}>
        <div className="table-responsive">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Deal ID</th>
                <th>Property Name</th>
                <th>Buyer Name</th>
                <th>Token Payment</th>
                <th>Advance Payment</th>
                <th>Final Balance</th>
                <th>Agreement File</th>
                <th>Comm %</th>
                <th>Commission Earned</th>
                <th>Sale Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal) => {
                  const finalBalance = parseFloat(deal.finalPayment || 0);
                  const totalDealValue = parseFloat(deal.tokenAmount || 0) + parseFloat(deal.advancePayment || 0) + finalBalance;
                  return (
                    <tr key={deal.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{deal.id}</td>
                      <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{deal.propertyName}</td>
                      <td style={{ fontWeight: '600' }}>{deal.buyerName}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                        {formatCurrency(deal.tokenAmount || 0)}
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                        {formatCurrency(deal.advancePayment || 0)}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                        {formatCurrency(finalBalance)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--primary-color)', fontWeight: '700' }}>
                          <FileText size={12} />
                          <span>{deal.agreementFile || 'Agreement.pdf'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge warning" style={{ fontWeight: '800' }}>
                          {deal.commissionPercent || 2.0}%
                        </span>
                      </td>
                      <td style={{ fontWeight: '800', color: '#16a34a' }}>
                        {formatCurrency(deal.commissionEarned || 0)}
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{deal.saleDate}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="table-empty-state">
                    No closed deal transaction registry found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
