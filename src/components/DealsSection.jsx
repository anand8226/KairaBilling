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

  const handleDownloadPDF = (deal) => {
    const filename = deal.agreementFile || `Agreement_${deal.id}.pdf`;
    
    // Generate a breathtaking, premium legal deed agreement certificate
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kaira Deal Agreement Certificate - ${deal.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
    
    body {
      font-family: 'Outfit', sans-serif;
      background-color: #f1f5f9;
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
      color: #1e293b;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .deed-container {
      background: #ffffff;
      width: 820px;
      border-radius: 20px;
      box-shadow: 0 15px 30px rgba(15, 23, 42, 0.06);
      border: 1px solid #e2e8f0;
      padding: 30px 40px;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    }
    
    /* Double gold/navy border with tighter margin offsets */
    .deed-container::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 1.5px solid #2563eb;
      border-radius: 14px;
      pointer-events: none;
    }
    
    .deed-container::after {
      content: '';
      position: absolute;
      top: 13px;
      left: 13px;
      right: 13px;
      bottom: 13px;
      border: 1px solid #f59e0b;
      border-radius: 11px;
      pointer-events: none;
    }
    
    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 55px;
      font-weight: 800;
      color: rgba(37, 99, 235, 0.025);
      letter-spacing: 6px;
      pointer-events: none;
      white-space: nowrap;
      text-transform: uppercase;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 15px;
      margin-bottom: 18px;
    }
    
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .brand-logo .logo-box {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 18px;
      box-shadow: 0 3px 8px rgba(37, 99, 235, 0.2);
    }
    
    .brand-logo h1 {
      font-size: 19px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.5px;
      color: #1e3a8a;
    }
    
    .brand-logo span {
      font-size: 9px;
      font-weight: 800;
      color: #2563eb;
      display: block;
      letter-spacing: 0.8px;
      margin-top: 1px;
    }
    
    .deed-meta {
      text-align: right;
    }
    
    .deed-meta h2 {
      font-size: 10px;
      color: #d97706;
      margin: 0;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    
    .deed-meta .deal-id {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
      letter-spacing: -0.3px;
    }
    
    .deed-meta .deal-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 1px;
      font-weight: 600;
    }
    
    .title-block {
      text-align: center;
      margin-bottom: 18px;
    }
    
    .title-block h3 {
      font-size: 18px;
      font-weight: 800;
      color: #1e3a8a;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .title-block p {
      font-size: 11.5px;
      color: #64748b;
      margin: 4px 0 0 0;
      font-weight: 500;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 18px;
    }
    
    .details-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
    }
    
    .details-card h4 {
      font-size: 11px;
      font-weight: 800;
      color: #2563eb;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    
    .details-card table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .details-card td {
      padding: 4px 0;
      font-size: 12px;
    }
    
    .details-card td.label {
      color: #64748b;
      font-weight: 600;
      width: 45%;
    }
    
    .details-card td.value {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    
    .financials-section {
      background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
      border-radius: 14px;
      padding: 16px 20px;
      color: #ffffff;
      margin-bottom: 18px;
      box-shadow: 0 8px 16px rgba(30, 58, 138, 0.1);
    }
    
    .financials-section h4 {
      font-size: 11px;
      font-weight: 800;
      color: #93c5fd;
      margin: 0 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px dashed rgba(255,255,255,0.15);
      padding-bottom: 6px;
    }
    
    .fin-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 12.5px;
      border-bottom: 1px dashed rgba(255,255,255,0.08);
    }
    
    .fin-row.total {
      border-bottom: none;
      border-top: 1.5px solid rgba(255,255,255,0.2);
      padding-top: 10px;
      margin-top: 5px;
      font-size: 15px;
      font-weight: 800;
    }
    
    .fin-row.total .value {
      color: #fbbf24;
    }
    
    .clauses-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    
    .clauses-box h4 {
      font-size: 11px;
      font-weight: 800;
      color: #1e3a8a;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .clauses-box ol {
      margin: 0;
      padding-left: 18px;
    }
    
    .clauses-box li {
      font-size: 11px;
      color: #475569;
      line-height: 1.4;
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    .signatures-block {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-top: 15px;
      text-align: center;
    }
    
    .sig-col {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .sig-line {
      width: 140px;
      border-top: 1px solid #94a3b8;
      margin-top: 30px;
      margin-bottom: 4px;
    }
    
    .sig-title {
      font-size: 10px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .seal-box {
      width: 55px;
      height: 55px;
      border: 1.5px dashed #d97706;
      color: #d97706;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 7.5px;
      font-weight: 800;
      text-transform: uppercase;
      transform: rotate(-15deg);
      margin-top: 2px;
      line-height: 1.2;
    }
    
    .action-bar {
      margin-top: 15px;
      display: flex;
      justify-content: center;
    }
    
    .btn {
      padding: 10px 24px;
      font-size: 13px;
      font-weight: 800;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: none;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15);
      background: #2563eb;
      color: white;
    }
    
    .btn:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.2);
    }
    
    /* Strict layout control to force fit exactly on 1 page when printing */
    @media print {
      @page {
        size: A4 portrait;
        margin: 10mm 15mm;
      }
      body {
        background-color: white;
        padding: 0;
        margin: 0;
        height: 99%;
        overflow: hidden;
      }
      .deed-container {
        box-shadow: none;
        border: none;
        width: 100%;
        padding: 10px 15px;
        border-radius: 0;
        height: 100%;
        page-break-inside: avoid;
      }
      .deed-container::before, .deed-container::after {
        display: none; /* Hide margins inside print to save area */
      }
      .action-bar {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="deed-container">
    <div class="watermark">Kaira Deal Certified</div>
    
    <div class="header">
      <div class="brand-logo">
        <div class="logo-box">K</div>
        <div>
          <h1>Kaira Deal</h1>
          <span>ERP SUITE CONSOLE</span>
        </div>
      </div>
      <div class="deed-meta">
        <h2>DEED AGREEMENT</h2>
        <div class="deal-id">${deal.id}</div>
        <div class="deal-date">Date: ${deal.saleDate}</div>
      </div>
    </div>
    
    <div class="title-block">
      <h3>OFFICIAL PROPERTY SALE AGREEMENT</h3>
      <p>This document constitutes an officially registered digital intent of sale and booking ledger.</p>
    </div>
    
    <div class="details-grid">
      <div class="details-card">
        <h4>Asset Particulars</h4>
        <table>
          <tr>
            <td class="label">Property ID</td>
            <td class="value">${deal.propertyId || 'N/A'}</td>
          </tr>
          <tr>
            <td class="label">Asset Name</td>
            <td class="value">${deal.propertyName}</td>
          </tr>
          <tr>
            <td class="label">Asset Type</td>
            <td class="value">Premium Estate Registry</td>
          </tr>
        </table>
      </div>
      
      <div class="details-card">
        <h4>Buyer Particulars</h4>
        <table>
          <tr>
            <td class="label">Buyer Name</td>
            <td class="value">${deal.buyerName}</td>
          </tr>
          <tr>
            <td class="label">Contact Detail</td>
            <td class="value">+91 999xxxxxx8</td>
          </tr>
          <tr>
            <td class="label">Verification Hash</td>
            <td class="value" style="font-family: monospace; font-size: 11px;">SEC-${Math.random().toString(36).substring(7).toUpperCase()}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div class="financials-section">
      <h4>Settlement Financial Balance Ledger</h4>
      <div class="fin-row">
        <span>Booking Token Amount (Paid)</span>
        <strong class="value">${formatCurrency(deal.tokenAmount || 0)}</strong>
      </div>
      <div class="fin-row">
        <span>Advance Payment Received (Paid)</span>
        <strong class="value">${formatCurrency(deal.advancePayment || 0)}</strong>
      </div>
      <div class="fin-row">
        <span>Remaining Settlement Balance (To be Paid)</span>
        <strong class="value">${formatCurrency(deal.finalPayment || 0)}</strong>
      </div>
      <div class="fin-row total">
        <span>Total Mutual Agreement Value</span>
        <strong class="value">${formatCurrency(parseFloat(deal.tokenAmount || 0) + parseFloat(deal.advancePayment || 0) + parseFloat(deal.finalPayment || 0))}</strong>
      </div>
    </div>
    
    <div class="clauses-box">
      <h4>Legalese & Mutual Terms</h4>
      <ol>
        <li><strong>Booking Commitment:</strong> The buyer has successfully paid a total deposit of token and advance amounts. The listing status is locked as "Sold" from the public marketplace registry.</li>
        <li><strong>Remaining Balance:</strong> The remaining final balance of ${formatCurrency(deal.finalPayment || 0)} must be cleared in full prior to the physical signing of the Registry Deed and key transfer.</li>
        <li><strong>Brokerage Agency Fee:</strong> A mutual agency brokerage fee of ${formatCurrency(deal.commissionEarned || 0)} (calculated at ${deal.commissionPercent || 2.0}%) is verified and payable in full to Kaira Deal.</li>
      </ol>
    </div>
    
    <div class="signatures-block">
      <div class="sig-col">
        <div class="sig-line"></div>
        <div class="sig-title">Buyer Signature</div>
      </div>
      <div class="sig-col">
        <div class="seal-box">Kaira Deal<br>Verified<br>Secure</div>
      </div>
      <div class="sig-col">
        <div class="sig-line"></div>
        <div class="sig-title">Witness/Agent Signature</div>
      </div>
    </div>
    
    <div class="action-bar">
      <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    // Download as a styled HTML printable page
    link.download = filename.replace('.pdf', '_Agreement_Deed.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(deal)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            color: 'var(--primary)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '700',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary-light)';
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.textDecoration = 'none';
                          }}
                          title="Click to Download Official Agreement Draft"
                        >
                          <FileText size={13} style={{ color: 'var(--primary)' }} />
                          <span>{deal.agreementFile || 'Agreement.pdf'}</span>
                        </button>
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
