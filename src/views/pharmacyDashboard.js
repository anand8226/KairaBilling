import { AppState, renderApp } from '../main.js';

// Module level state to preserve form fields across renders
let activeTab = 'dashboard'; // 'dashboard' | 'pos' | 'masters' | 'purchases' | 'expiry' | 'ledgers' | 'reports'
let activeMasterSubTab = 'medicines'; // 'medicines' | 'suppliers' | 'customers' | 'doctors'

// Masters form structures
let medFormName = '';
let medFormGeneric = '';
let medFormBrand = '';
let medFormHsn = '3004';
let medFormGst = '12';
let medFormBatch = '';
let medFormExpiry = '';
let medFormMrp = '';
let medFormPurchaseRate = '';
let medFormSaleRate = '';
let medFormUnit = 'Strip';
let medFormCategory = 'Tablet';
let medFormStock = '0';

let supFormName = '';
let supFormGst = '';
let supFormAddress = '';
let supFormContact = '';

let custFormName = '';
let custFormMobile = '';
let custFormAddress = '';
let custFormDoctor = '';

let docFormName = '';
let docFormReg = '';
let docFormContact = '';

// Cart and transaction data structures
let posCustomerName = 'Walk-in Customer';
let posCustomerMobile = '';
let posDoctorName = '';
let posPaymentMode = 'Cash';
let posDiscount = '0';
let posCart = [];

// Purchase inward form
let purSupplierId = '';
let purInvoiceNumber = '';
let purInvoiceDate = new Date().toISOString().split('T')[0];
let purCartItems = [];

// Purchase cart item form inputs
let purItemMedId = '';
let purItemBatch = '';
let purItemExpiry = '';
let purItemGst = '12';
let purItemQty = '0';
let purItemFreeQty = '0';
let purItemPurRate = '0';
let purItemSaleRate = '0';
let purItemDisc = '0';

// Real-time search matches
let medSearchQuery = '';
let posSearchMatches = [];
let masterSearchQuery = '';

// Modals Open/Close triggers
let showAddMedModal = false;
let showAddSupplierModal = false;
let showAddCustomerModal = false;
let showAddDoctorModal = false;

// Active print receipt state
let activeInvoice = null;
let printLayout = 'thermal'; // 'thermal' | 'a4'
let showInvoiceModal = false;

// Live lists loaded from backend
let medicinesList = [];
let suppliersList = [];
let customersList = [];
let doctorsList = [];
let salesList = [];
let dashboardStats = {
  todaySales: 0,
  todayPurchase: 0,
  totalStockValue: 0,
  expiryMedicinesCount: 0,
  lowStockCount: 0,
  outstandingAmount: 0,
  topMedicines: []
};

// Loader helpers
async function loadPharmaData() {
  try {
    const resMeds = await fetch('http://127.0.0.1:5000/api/pharmacy/medicines');
    if (resMeds.ok) medicinesList = await resMeds.json();

    const resSups = await fetch('http://127.0.0.1:5000/api/pharmacy/suppliers');
    if (resSups.ok) suppliersList = await resSups.json();

    const resCusts = await fetch('http://127.0.0.1:5000/api/pharmacy/customers');
    if (resCusts.ok) customersList = await resCusts.json();

    const resDocs = await fetch('http://127.0.0.1:5000/api/pharmacy/doctors');
    if (resDocs.ok) doctorsList = await resDocs.json();

    const resStats = await fetch('http://127.0.0.1:5000/api/pharmacy/reports/dashboard');
    if (resStats.ok) dashboardStats = await resStats.json();

    const resSales = await fetch('http://127.0.0.1:5000/api/pharmacy/sales');
    if (resSales.ok) salesList = await resSales.json();
  } catch (err) {
    console.warn('⚠️ Pharmacy MySQL API offline, falling back to mock datasets.');
  }
}

// Convert numbers to text representation for invoice totals
const numberToWords = (num) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  function convert(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    return '';
  }

  let result = rupees === 0 ? 'Zero' : convert(rupees);
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  return result;
};

// Extracted GST breakdown note formatting helper
const getGSTBreakdownText = (invoice) => {
  if (!invoice || !invoice.items) return '';
  const groups = {};
  const discountRatio = invoice.subTotal > 0 ? invoice.discountAmount / invoice.subTotal : 0;

  invoice.items.forEach(item => {
    const lineSub = item.quantity * item.saleRate;
    const lineDisc = lineSub * ((item.discountPercent || 0) / 100);
    const lineNetAfterItem = lineSub - lineDisc;
    const lineNetAfterAll = lineNetAfterItem * (1 - discountRatio);
    
    const lineGst = lineNetAfterAll - (lineNetAfterAll / (1 + (parseFloat(item.gstPercent || 12) / 100)));
    const lineBase = lineNetAfterAll - lineGst;
    
    const rateKey = parseFloat(item.gstPercent || 12);
    if (!groups[rateKey]) groups[rateKey] = { base: 0, gst: 0 };
    groups[rateKey].base += lineBase;
    groups[rateKey].gst += lineGst;
  });

  return Object.entries(groups).map(([rateStr, data]) => {
    const rate = parseFloat(rateStr);
    const cgstSgstRate = (rate / 2).toFixed(2);
    const cgstSgstAmt = (data.gst / 2).toFixed(2);
    return `GST ${data.base.toFixed(2)}*${cgstSgstRate}+${cgstSgstRate}% = ${cgstSgstAmt}SGST + ${cgstSgstAmt}CGST`;
  }).join(', ');
};

export function renderPharmacyDashboard(state) {
  // Sync state variables once when initializing or reloading
  if (medicinesList.length === 0) {
    loadPharmaData().then(() => renderApp());
  }

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(val);

  return `
    <div class="app-container" style="">
      <!-- SIDEBAR -->
      <aside class="sidebar ${state.sidebarOpen ? 'mobile-open' : ''}" style="z-index: 100;">
        <div class="sidebar-brand" style="padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
          <img src="kaira_logo.svg" alt="Pharma Logo" style="width: 36px; height: 36px; border-radius: 10px; object-fit: cover; box-shadow: 0 4px 10px rgba(16,185,129,0.4);" />
          <div class="sidebar-brand-text">
            <h1 style="font-size: 17px; font-weight: 800; color: #fff; margin: 0;">Kaira Pharmacy</h1>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
              <span style="font-size: 9px; font-weight: 800; color: var(--success-icon); letter-spacing: 0.5px;">PHARMA ERP</span>
              <span class="badge success" style="font-size: 7.5px; padding: 1px 5px; font-weight: 800; text-transform: uppercase; border-radius: 4px;">
                ${state.userRole}
              </span>
            </div>
          </div>
        </div>

        <nav class="sidebar-menu" style="display: flex; flex-direction: column; gap: 3px;">
          <a href="#dashboard" class="sidebar-menu-item ${activeTab === 'dashboard' ? 'active' : ''}" id="pharma-tab-dashboard" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; color: ${activeTab === 'dashboard' ? '#fff' : 'rgba(255,255,255,0.6)'};">
            <span>📊</span> <span>Dashboard</span>
          </a>
          <a href="#pos" class="sidebar-menu-item ${activeTab === 'pos' ? 'active' : ''}" id="pharma-tab-pos" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; color: ${activeTab === 'pos' ? '#fff' : 'rgba(255,255,255,0.6)'};">
            <span>🛒</span> <span>POS Billing</span>
          </a>
          <a href="#masters" class="sidebar-menu-item ${activeTab === 'masters' ? 'active' : ''}" id="pharma-tab-masters" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; color: ${activeTab === 'masters' ? '#fff' : 'rgba(255,255,255,0.6)'};">
            <span>📋</span> <span>Master Records</span>
          </a>
          <a href="#purchases" class="sidebar-menu-item ${activeTab === 'purchases' ? 'active' : ''}" id="pharma-tab-purchases" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; color: ${activeTab === 'purchases' ? '#fff' : 'rgba(255,255,255,0.6)'};">
            <span>➕</span> <span>Purchase Inward</span>
          </a>
          <a href="#expiry" class="sidebar-menu-item ${activeTab === 'expiry' ? 'active' : ''}" id="pharma-tab-expiry" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; color: ${activeTab === 'expiry' ? '#fff' : 'rgba(255,255,255,0.6)'};">
            <span>⚠️</span> <span>Expiry Management</span>
          </a>
          <a href="#ledgers" class="sidebar-menu-item ${activeTab === 'ledgers' ? 'active' : ''}" id="pharma-tab-ledgers" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; color: ${activeTab === 'ledgers' ? '#fff' : 'rgba(255,255,255,0.6)'};">
            <span>📖</span> <span>Accounts Ledger</span>
          </a>
          <a href="#reports" class="sidebar-menu-item ${activeTab === 'reports' ? 'active' : ''}" id="pharma-tab-reports" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; color: ${activeTab === 'reports' ? '#fff' : 'rgba(255,255,255,0.6)'};">
            <span>📈</span> <span>Reports Log</span>
          </a>

          <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 12px 0;"></div>

          <a href="#logout" class="sidebar-menu-item" id="pharma-logout-btn" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; color: hsl(0, 85%, 65%);">
            <span>🚪</span> <span>Logout</span>
          </a>
        </nav>

        <div style="margin-top: auto; padding-top: 20px; font-size: 11px; color: rgba(255,255,255,0.2); text-align: center;">
          Kaira Pharmacy v1.0
        </div>
      </aside>

      <!-- MAIN WORKSPACE -->
      <main class="main-panel">
        <header class="header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button type="button" class="header-icon-btn mobile-only" id="pharma-hamburger-menu-toggle" style="background:none; border:none; font-size:24px; cursor:pointer;">
              <span>☰</span>
            </button>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Pharmacy Console</span>
            <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin-top: 2px;">
              ${activeTab === 'dashboard' ? 'Welcome Back, ' + state.userName : ''}
              ${activeTab === 'pos' ? 'Point of Sale (POS) Billing' : ''}
              ${activeTab === 'masters' ? 'ERP Master Registry' : ''}
              ${activeTab === 'purchases' ? 'Purchase Inward Registry' : ''}
              ${activeTab === 'expiry' ? 'Medicine Expiry Monitoring' : ''}
              ${activeTab === 'ledgers' ? 'Supplier & Customer Accounts' : ''}
              ${activeTab === 'reports' ? 'Enterprise Operations Analytics' : ''}
            </h2>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            ${activeTab === 'masters' && activeMasterSubTab === 'medicines' ? `
              <div class="header-search-bar" style="max-width: 250px;">
                <span>🔍</span>
                <input type="text" id="pharma-master-search-input" placeholder="Search medicines..." value="${masterSearchQuery}" />
              </div>
            ` : ''}
            <img src="${state.userAvatar || 'kaira_logo.svg'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2.5px solid var(--success-icon)" />
          </div>
        </header>

        <!-- SUB VIEW CONTENT PANELS -->
        <div style="padding-top: 15px;">
          ${renderPharmaView(formatINR)}
        </div>
      </main>

      <!-- FLOATING MODALS -->
      ${renderMedModal()}
      ${renderSupplierModal()}
      ${renderCustomerModal()}
      ${renderDoctorModal()}
      ${renderPharmaInvoiceModal(formatINR)}
    </div>
  `;
}

function renderPharmaView(formatINR) {
  if (activeTab === 'dashboard') {
    // Bar chart data - pixel heights for 160px chart container (no percentage issues in flex)
    const chartData = [
      { month: 'Jan', height: 96 },
      { month: 'Feb', height: 72 },
      { month: 'Mar', height: 128 },
      { month: 'Apr', height: 88 },
      { month: 'May', height: 144 },
      { month: 'Jun', height: 120 },
    ];

    return `
      <div style="">

        <!-- STATS ROW 1: 3 cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px;">
          <div class="stat-card" style="background: #fff; border-left: 4.5px solid var(--success-icon)">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Today's Sales</span>
                <h3 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 6px;">${formatINR(dashboardStats.todaySales)}</h3>
              </div>
              <div style="width:36px;height:36px;border-radius:10px;background:var(--success-bg);display:flex;align-items:center;justify-content:center;font-size:18px;">🛒</div>
            </div>
          </div>
          <div class="stat-card" style="background: #fff; border-left: 4.5px solid var(--primary)">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Today's Purchases</span>
                <h3 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 6px;">${formatINR(dashboardStats.todayPurchase)}</h3>
              </div>
              <div style="width:36px;height:36px;border-radius:10px;background:var(--info-bg);display:flex;align-items:center;justify-content:center;font-size:18px;">➕</div>
            </div>
          </div>
          <div class="stat-card" style="background: #fff; border-left: 4.5px solid var(--warning-icon)">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Total Stock Value</span>
                <h3 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 6px;">${formatINR(dashboardStats.totalStockValue)}</h3>
              </div>
              <div style="width:36px;height:36px;border-radius:10px;background:var(--warning-bg);display:flex;align-items:center;justify-content:center;font-size:18px;">📦</div>
            </div>
          </div>
        </div>

        <!-- STATS ROW 2: 3 cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
          <div class="stat-card" style="background: #fff; border-left: 4.5px solid var(--danger-icon)">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Near Expiry / Expired</span>
                <h3 style="font-size: 22px; font-weight: 800; color: var(--danger-text); margin-top: 6px;">${dashboardStats.expiryMedicinesCount} Items</h3>
              </div>
              <div style="width:36px;height:36px;border-radius:10px;background:var(--danger-bg);display:flex;align-items:center;justify-content:center;font-size:18px;">⚠️</div>
            </div>
          </div>
          <div class="stat-card" style="background: #fff; border-left: 4.5px solid var(--danger-icon)">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Low Stock Medicines</span>
                <h3 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 6px;">${dashboardStats.lowStockCount} Drugs</h3>
              </div>
              <div style="width:36px;height:36px;border-radius:10px;background:var(--danger-bg);display:flex;align-items:center;justify-content:center;font-size:18px;">🚨</div>
            </div>
          </div>
          <div class="stat-card" style="background: #fff; border-left: 4.5px solid var(--primary)">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Outstanding Balance</span>
                <h3 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 6px;">${formatINR(dashboardStats.outstandingAmount)}</h3>
              </div>
              <div style="width:36px;height:36px;border-radius:10px;background:var(--info-bg);display:flex;align-items:center;justify-content:center;font-size:18px;">📖</div>
            </div>
          </div>
        </div>

        <!-- MIDDLE ROW: Chart + Top Medicines side by side -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">

          <!-- Bar Chart Card -->
          <div style="background: #fff; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 24px;">
            <h3 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">Monthly Sales Summary</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">Revenue trend for last 6 months</p>
            <!-- Fixed-pixel height bar chart - no flex percentage issues -->
            <div style="position: relative; height: 160px; display: flex; align-items: flex-end; gap: 10px; overflow: hidden;">
              ${chartData.map(d => `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0; height: 100%;">
                  <div style="flex: 1; width: 100%; display: flex; align-items: flex-end;">
                    <div style="width: 100%; height: ${d.height}px; background: linear-gradient(180deg, hsl(160,84%,40%) 0%, hsl(160,84%,70%) 100%); border-radius: 6px 6px 0 0; transition: height 0.6s ease;"></div>
                  </div>
                  <span style="font-size: 10px; color: var(--text-muted); font-weight: 600; margin-top: 6px; white-space: nowrap;">${d.month}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Top Selling Medicines Card -->
          <div style="background: #fff; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 24px;">
            <h3 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">Top Selling Medicines</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">Best performing products</p>
            <div style="display: flex; flex-direction: column; gap: 0;">
              ${dashboardStats.topMedicines && dashboardStats.topMedicines.length > 0
                ? dashboardStats.topMedicines.slice(0, 5).map((m, idx) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--success-bg); color: var(--success-text); font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center;">${idx + 1}</span>
                      <span style="font-size: 13px; font-weight: 600; color: var(--text-main);">${m.name}</span>
                    </div>
                    <span class="badge success" style="font-size: 10px; padding: 3px 10px; border-radius: 99px;">${m.soldQty} Sold</span>
                  </div>
                `).join('')
                : `<div style="text-align: center; padding: 40px 0; color: var(--text-muted); font-size: 13px;">
                    <div style="font-size: 32px; margin-bottom: 8px;">💊</div>
                    No sales recorded yet
                  </div>`
              }
            </div>
          </div>
        </div>

        <!-- Quick Actions Card -->
        <div style="background: #fff; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 20px 24px;">
          <h4 style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px;">Quick Actions Console</h4>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary" id="pharma-quick-pos" style="background: var(--success-icon); border: none; color: #fff; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px;">🛒 New POS Billing</button>
            <button type="button" class="btn btn-primary" id="pharma-quick-purchases" style="background: var(--primary); border: none; color: #fff; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px;">➕ New Purchase Inward</button>
            <button type="button" class="btn btn-secondary" id="pharma-quick-medicines" style="padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px;">💊 Manage Medicines</button>
            <button type="button" class="btn btn-secondary" id="pharma-quick-expiry" style="padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px;">⚠️ Check Expiry Stock</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === 'pos') {
    // POS checkout summary details
    let subTotal = 0;
    let discountAmount = 0;
    let gstAmount = 0;
    const overallDiscountRatio = (parseFloat(posDiscount) || 0) / 100;

    posCart.forEach(item => {
      const lineSub = item.quantity * item.saleRate;
      const lineDisc = lineSub * (item.discountPercent / 100);
      const lineNetAfterItem = lineSub - lineDisc;
      const lineNetAfterAll = lineNetAfterItem * (1 - overallDiscountRatio);
      const lineGst = lineNetAfterAll - (lineNetAfterAll / (1 + (parseFloat(item.gstPercent) / 100)));
      
      subTotal += lineSub;
      discountAmount += lineDisc;
      gstAmount += lineGst;
    });

    const overallDiscVal = (subTotal - discountAmount) * overallDiscountRatio;
    discountAmount += overallDiscVal;

    const calculatedTotal = subTotal - discountAmount;
    const grandTotal = Math.round(calculatedTotal);
    const roundOff = grandTotal - calculatedTotal;

    return `
      <div style="">
        <div class="grid-2-cols" style="grid-template-columns: 1.2fr 0.8fr; gap: 20px;">
          <!-- POS Cart & Search -->
          <div class="dashboard-card" style="background: #fff; padding: 24px;">
            <div style="position: relative; margin-bottom: 20px;">
              <label class="auth-label">Search Medicine (Type Name, Generic Name or Batch) *</label>
              <div style="display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; gap: 8px;">
                <span>🔍</span>
                <input type="text" id="pos-medicine-search" placeholder="Search medicines in stock..." style="border: none; outline: none; width: 100%; font-size: 14px;" value="${medSearchQuery}" />
              </div>

              <!-- Persistent dropdown container - populated by JS without full re-render -->
              <div id="pos-search-dropdown" style="position: absolute; top: 100%; left: 0; width: 100%; z-index: 100; max-height: 220px; overflow-y: auto; background: #fff; border: 1px solid var(--border-color); border-radius: 8px; box-shadow: var(--shadow-lg); padding: 8px; display: ${posSearchMatches.length > 0 ? 'block' : 'none'};">
                ${posSearchMatches.map(med => `
                  <div class="pos-search-match-row" data-id="${med.id}" style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer; border-radius: 4px;">
                    <div>
                      <strong style="font-size: 13px; color: var(--text-main)">${med.name}</strong> <span style="font-size: 11px; color: var(--text-muted)">(${med.brandName})</span>
                      <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Generic: ${med.genericName} | Batch: ${med.batchNumber}</div>
                    </div>
                    <div style="text-align: right;">
                      <span style="font-size: 12.5px; font-weight: 800;">${formatINR(med.saleRate)}</span>
                      <div style="font-size: 10.5px; color: ${med.stock <= 10 ? 'red' : 'green'}; font-weight: 700;">Stock: ${med.stock} ${med.unit}</div>
                    </div>
                  </div>
                `).join('')}
              </div>

            </div>

            <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 12px; color: var(--text-main)">Billing Cart</h3>
            <div class="table-responsive" style="max-height: 350px; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 10px; text-align: left; font-size: 12px;">Medicine Name</th>
                    <th style="padding: 10px; text-align: center; font-size: 12px;">Batch</th>
                    <th style="padding: 10px; text-align: right; font-size: 12px;">Price</th>
                    <th style="padding: 10px; text-align: center; font-size: 12px; width: 90px;">Qty</th>
                    <th style="padding: 10px; text-align: center; font-size: 12px; width: 80px;">Disc %</th>
                    <th style="padding: 10px; text-align: right; font-size: 12px;">Total</th>
                    <th style="padding: 10px; text-align: center; font-size: 12px;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${posCart.length > 0 ? posCart.map((item, idx) => {
                    const lineTotal = (item.quantity * item.saleRate) * (1 - item.discountPercent / 100);
                    return `
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px; font-size: 13px; font-weight: 700;">
                          ${item.medicineName}
                          <div style="font-size: 10px; color: var(--text-muted);">Expiry: ${new Date(item.expiryDate).toLocaleDateString('en-IN')}</div>
                        </td>
                        <td style="padding: 10px; text-align: center; font-size: 12px;">${item.batchNumber}</td>
                        <td style="padding: 10px; text-align: right; font-size: 12.5px; font-weight: 600;">${formatINR(item.saleRate)}</td>
                        <td style="padding: 10px; text-align: center;">
                          <input type="number" min="1" max="${item.stockLimit}" value="${item.quantity}" class="pos-cart-qty-input" data-index="${idx}" style="width: 60px; padding: 4px; text-align: center; border: 1px solid var(--border-color); border-radius: 4px;" />
                        </td>
                        <td style="padding: 10px; text-align: center;">
                          <input type="number" min="0" max="100" value="${item.discountPercent}" class="pos-cart-disc-input" data-index="${idx}" style="width: 50px; padding: 4px; text-align: center; border: 1px solid var(--border-color); border-radius: 4px;" />
                        </td>
                        <td style="padding: 10px; text-align: right; font-size: 12.5px; font-weight: 700;">${formatINR(lineTotal)}</td>
                        <td style="padding: 10px; text-align: center;">
                          <button type="button" class="pos-cart-remove-btn" data-index="${idx}" style="color: red; background: none; border: none; cursor: pointer;">🗑️</button>
                        </td>
                      </tr>
                    `;
                  }).join('') : `
                    <tr>
                      <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">Billing cart is empty. Search and add medicines above!</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Checkout details -->
          <div class="dashboard-card" style="background: #fff; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <h3 style="font-size: 14px; font-weight: 800; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; color: var(--text-main);">Transaction Checkout</h3>
            
            <div class="form-group">
              <label>Customer Name</label>
              <input type="text" id="pos-field-custname" class="form-input" value="${posCustomerName}" />
            </div>
            <div class="form-group">
              <label>Mobile Number</label>
              <input type="text" id="pos-field-custmobile" class="form-input" placeholder="e.g. 9812xxxxxx" value="${posCustomerMobile}" />
            </div>
            <div class="form-group">
              <label>Referring Doctor Name</label>
              <input type="text" id="pos-field-docname" class="form-input" placeholder="e.g. Dr. Verma" value="${posDoctorName}" />
            </div>
            <div class="form-group">
              <label>Payment Mode</label>
              <select id="pos-field-paymode" class="form-select">
                <option value="Cash" ${posPaymentMode === 'Cash' ? 'selected' : ''}>Cash</option>
                <option value="UPI" ${posPaymentMode === 'UPI' ? 'selected' : ''}>UPI / Digital</option>
                <option value="Card" ${posPaymentMode === 'Card' ? 'selected' : ''}>Card</option>
                <option value="Credit" ${posPaymentMode === 'Credit' ? 'selected' : ''}>Credit / Outstanding</option>
              </select>
            </div>
            <div class="form-group">
              <label>Overall Invoice Discount (%)</label>
              <input type="number" id="pos-field-discount" class="form-input" min="0" max="100" value="${posDiscount}" />
            </div>

            <!-- Total summary box -->
            <div style="background: #f8fafc; padding: 16px; border-radius: 12px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted);">
                <span>Sub Total:</span>
                <span>${formatINR(subTotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted);">
                <span>Discount Amount:</span>
                <span style="color: red;">-${formatINR(discountAmount)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted);">
                <span>GST Tax Included:</span>
                <span>${formatINR(gstAmount)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 10px; font-size: 16px; font-weight: 800; color: var(--text-main);">
                <span>Grand Total:</span>
                <span style="color: var(--success-icon);">${formatINR(grandTotal)}</span>
              </div>
            </div>

            <button type="button" class="btn btn-primary" id="pos-checkout-btn" style="background: var(--success-icon); border: none; padding: 12px; font-weight: 700; width: 100%;">
              Print & Close Invoice
            </button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === 'masters') {
    return `
      <div style="">
        <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
          <button type="button" class="btn btn-masters-subtab ${activeMasterSubTab === 'medicines' ? 'btn-primary' : 'btn-secondary'}" data-sub="medicines" style="${activeMasterSubTab === 'medicines' ? 'background: var(--success-icon); color: white; border: none;' : ''}">Medicines</button>
          <button type="button" class="btn btn-masters-subtab ${activeMasterSubTab === 'suppliers' ? 'btn-primary' : 'btn-secondary'}" data-sub="suppliers" style="${activeMasterSubTab === 'suppliers' ? 'background: var(--success-icon); color: white; border: none;' : ''}">Suppliers</button>
          <button type="button" class="btn btn-masters-subtab ${activeMasterSubTab === 'customers' ? 'btn-primary' : 'btn-secondary'}" data-sub="customers" style="${activeMasterSubTab === 'customers' ? 'background: var(--success-icon); color: white; border: none;' : ''}">Customers / Patients</button>
          <button type="button" class="btn btn-masters-subtab ${activeMasterSubTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}" data-sub="doctors" style="${activeMasterSubTab === 'doctors' ? 'background: var(--success-icon); color: white; border: none;' : ''}">Doctors</button>
        </div>

        ${activeMasterSubTab === 'medicines' ? renderMedMaster(formatINR) : ''}
        ${activeMasterSubTab === 'suppliers' ? renderSupplierMaster(formatINR) : ''}
        ${activeMasterSubTab === 'customers' ? renderCustomerMaster(formatINR) : ''}
        ${activeMasterSubTab === 'doctors' ? renderDoctorMaster(formatINR) : ''}
      </div>
    `;
  }

  if (activeTab === 'purchases') {
    return renderPurchaseInwardView(formatINR);
  }

  if (activeTab === 'expiry') {
    return renderExpiryView();
  }

  if (activeTab === 'ledgers') {
    return renderLedgerView(formatINR);
  }

  if (activeTab === 'reports') {
    return renderReportsView(formatINR);
  }

  return '';
}

function renderMedMaster(formatINR) {
  const query = masterSearchQuery.toLowerCase();
  const filtered = medicinesList.filter(m => 
    m.name.toLowerCase().includes(query) || 
    m.genericName.toLowerCase().includes(query) ||
    m.batchNumber.toLowerCase().includes(query)
  );

  return `
    <div class="dashboard-card" style="background: #fff; padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 15px; font-weight: 800; margin: 0;">Medicines Master Catalog</h3>
        <button type="button" class="btn btn-primary" id="master-add-med-btn" style="background: var(--success-icon); border: none;">➕ Add Medicine</button>
      </div>

      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
              <th style="padding: 12px; text-align: left;">Drug Name</th>
              <th style="padding: 12px; text-align: left;">Generic Chemical Name</th>
              <th style="padding: 12px; text-align: center;">Batch</th>
              <th style="padding: 12px; text-align: center;">Expiry Date</th>
              <th style="padding: 12px; text-align: right;">MRP</th>
              <th style="padding: 12px; text-align: right;">Sale Rate</th>
              <th style="padding: 12px; text-align: center;">Stock</th>
              <th style="padding: 12px; text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${medicinesList.length > 0 ? medicinesList.map(m => {
              const q = masterSearchQuery.toLowerCase();
              const visible = !q || m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || (m.batchNumber||'').toLowerCase().includes(q);
              return `
              <tr class="pharma-medicine-row" data-name="${m.name}" data-generic="${m.genericName}" data-brand="${m.brandName||''}" style="border-bottom: 1px solid #f1f5f9; display: ${visible ? '' : 'none'};">
                <td style="padding: 12px; font-size: 13px; font-weight: 700;">
                  ${m.name}
                  <div style="font-size: 10.5px; color: var(--text-muted)">Brand: ${m.brandName} | HSN: ${m.hsnCode}</div>
                </td>
                <td style="padding: 12px; font-size: 12.5px; color: var(--text-muted)">${m.genericName}</td>
                <td style="padding: 12px; text-align: center; font-size: 12px;">${m.batchNumber}</td>
                <td style="padding: 12px; text-align: center; font-size: 12px;">${new Date(m.expiryDate).toLocaleDateString('en-IN')}</td>
                <td style="padding: 12px; text-align: right; font-size: 12.5px; font-weight: 600;">${formatINR(m.mrp)}</td>
                <td style="padding: 12px; text-align: right; font-size: 12.5px; font-weight: 700;">${formatINR(m.saleRate)}</td>
                <td style="padding: 12px; text-align: center;">
                  <span class="badge ${m.stock <= 10 ? 'danger' : 'success'}" style="font-size: 11px; padding: 3px 8px;">
                    ${m.stock} ${m.unit}
                  </span>
                </td>
                <td style="padding: 12px; text-align: center;">
                  <button type="button" class="med-master-delete-btn" data-id="${m.id}" style="color: red; background: none; border: none; cursor: pointer;">🗑️</button>
                </td>
              </tr>
            `;
            }).join('') : `
              <tr>
                <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">No medicines found. Add medicines to get started.</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSupplierMaster(formatINR) {
  return `
    <div class="dashboard-card" style="background: #fff; padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 15px; font-weight: 800; margin: 0;">Supplier Registries</h3>
        <button type="button" class="btn btn-primary" id="master-add-sup-btn" style="background: var(--success-icon); border: none;">➕ Register Supplier</button>
      </div>
      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
              <th style="padding: 12px; text-align: left;">Supplier Name</th>
              <th style="padding: 12px; text-align: left;">GST Number</th>
              <th style="padding: 12px; text-align: left;">Address</th>
              <th style="padding: 12px; text-align: center;">Contact</th>
            </tr>
          </thead>
          <tbody>
            ${suppliersList.length > 0 ? suppliersList.map(s => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-size: 13px; font-weight: 700;">${s.name}</td>
                <td style="padding: 12px; font-size: 12.5px; font-weight: 600;">${s.gstNo}</td>
                <td style="padding: 12px; font-size: 12.5px; color: var(--text-muted);">${s.address}</td>
                <td style="padding: 12px; text-align: center; font-size: 13px;">${s.contact}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: var(--text-muted);">No suppliers registered.</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCustomerMaster(formatINR) {
  return `
    <div class="dashboard-card" style="background: #fff; padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 15px; font-weight: 800; margin: 0;">Customer / Patient Records</h3>
        <button type="button" class="btn btn-primary" id="master-add-cust-btn" style="background: var(--success-icon); border: none;">➕ Add Patient Card</button>
      </div>
      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
              <th style="padding: 12px; text-align: left;">Patient Name</th>
              <th style="padding: 12px; text-align: center;">Mobile</th>
              <th style="padding: 12px; text-align: left;">Residential Address</th>
              <th style="padding: 12px; text-align: left;">Doctor Ref</th>
            </tr>
          </thead>
          <tbody>
            ${customersList.length > 0 ? customersList.map(c => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-size: 13px; font-weight: 700;">${c.name}</td>
                <td style="padding: 12px; text-align: center; font-size: 13px;">${c.mobile}</td>
                <td style="padding: 12px; font-size: 12.5px; color: var(--text-muted);">${c.address}</td>
                <td style="padding: 12px; font-size: 12.5px; font-weight: 600;">${c.doctorRef || 'Self'}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: var(--text-muted);">No patients registered.</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderDoctorMaster(formatINR) {
  return `
    <div class="dashboard-card" style="background: #fff; padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 15px; font-weight: 800; margin: 0;">Prescribing Doctors Registry</h3>
        <button type="button" class="btn btn-primary" id="master-add-doc-btn" style="background: var(--success-icon); border: none;">➕ Save Doctor Record</button>
      </div>
      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
              <th style="padding: 12px; text-align: left;">Doctor Name</th>
              <th style="padding: 12px; text-align: left;">Registration Number</th>
              <th style="padding: 12px; text-align: center;">Contact detail</th>
            </tr>
          </thead>
          <tbody>
            ${doctorsList.length > 0 ? doctorsList.map(d => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-size: 13px; font-weight: 700;">${d.name}</td>
                <td style="padding: 12px; font-size: 12.5px; font-weight: 600;">${d.regNo}</td>
                <td style="padding: 12px; text-align: center; font-size: 13px;">${d.contact}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="3" style="text-align: center; padding: 30px; color: var(--text-muted);">No doctors saved.</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================================================
   Purchase Inward entry view
   ============================================================================ */
function renderPurchaseInwardView(formatINR) {
  return `
    <div style="">
      <div class="grid-2-cols" style="grid-template-columns: 1.2fr 0.8fr; gap: 20px;">
        <div class="dashboard-card" style="background: #fff; padding: 24px;">
          <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 14px;">Add Medicine Item to Inward Invoice</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group">
              <label>Select Medicine *</label>
              <select id="purcart-med-select" class="form-select">
                <option value="">-- Choose Medicine --</option>
                ${medicinesList.map(m => `<option value="${m.id}" ${purItemMedId === String(m.id) ? 'selected' : ''}>${m.name} (${m.brandName})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Batch Number *</label>
              <input type="text" id="purcart-batch" class="form-input" placeholder="e.g. B-0129" value="${purItemBatch}" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group">
              <label>Expiry Date *</label>
              <input type="date" id="purcart-expiry" class="form-input" value="${purItemExpiry}" />
            </div>
            <div class="form-group">
              <label>GST Percent (%)</label>
              <select id="purcart-gst" class="form-select">
                <option value="0" ${purItemGst === '0' ? 'selected' : ''}>0%</option>
                <option value="5" ${purItemGst === '5' ? 'selected' : ''}>5%</option>
                <option value="12" ${purItemGst === '12' ? 'selected' : ''}>12%</option>
                <option value="18" ${purItemGst === '18' ? 'selected' : ''}>18%</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group">
              <label>Quantity *</label>
              <input type="number" id="purcart-qty" class="form-input" value="${purItemQty}" />
            </div>
            <div class="form-group">
              <label>Free Quantity</label>
              <input type="number" id="purcart-freeqty" class="form-input" value="${purItemFreeQty}" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
            <div class="form-group">
              <label>Purchase Rate *</label>
              <input type="number" step="0.01" id="purcart-purrate" class="form-input" value="${purItemPurRate}" />
            </div>
            <div class="form-group">
              <label>Expected Sale Rate</label>
              <input type="number" step="0.01" id="purcart-salerate" class="form-input" value="${purItemSaleRate}" />
            </div>
          </div>

          <button type="button" class="btn btn-secondary" id="purcart-add-item-btn" style="width: 100%; border-color: var(--success-icon); color: var(--success-icon); font-weight: 700;">
            Add Item to Inward Cart
          </button>

          <!-- Added items grid list -->
          <h3 style="font-size: 13px; font-weight: 800; margin-top: 24px; margin-bottom: 10px; color: var(--text-muted);">Added Cart Items List</h3>
          <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
                  <th style="padding: 6px 0; text-align: left;">Name</th>
                  <th style="padding: 6px 0; text-align: center;">Qty</th>
                  <th style="padding: 6px 0; text-align: right;">Rate</th>
                  <th style="padding: 6px 0; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${purCartItems.length > 0 ? purCartItems.map((item, idx) => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 0; font-weight: 700;">${item.medicineName}</td>
                    <td style="padding: 8px 0; text-align: center;">${item.quantity} + ${item.freeQuantity}F</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatINR(item.purchaseRate)}</td>
                    <td style="padding: 8px 0; text-align: center;">
                      <button type="button" class="pur-cart-row-remove" data-index="${idx}" style="color: red; background: none; border: none; cursor: pointer;">✕</button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">Cart is empty. Add medicine items above!</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Supplier & Inward details -->
        <div class="dashboard-card" style="background: #fff; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
          <h3 style="font-size: 14px; font-weight: 800; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; color: var(--text-main);">Invoice Metadata</h3>
          
          <div class="form-group">
            <label>Wholesale Supplier *</label>
            <select id="pur-meta-supplier" class="form-select">
              <option value="">-- Choose Supplier --</option>
              ${suppliersList.map(s => `<option value="${s.id}" ${purSupplierId === String(s.id) ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Invoice Number / Challan *</label>
            <input type="text" id="pur-meta-invno" class="form-input" placeholder="e.g. INWARD-9081" value="${purInvoiceNumber}" />
          </div>
          <div class="form-group">
            <label>Inward Date</label>
            <input type="date" id="pur-meta-invdate" class="form-input" value="${purInvoiceDate}" />
          </div>

          <button type="button" class="btn btn-primary" id="pur-meta-post-btn" style="background: var(--success-icon); border: none; padding: 12px; font-weight: 700; width: 100%; margin-top: 15px;">
            Post Purchase Invoice & Stock
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderExpiryView() {
  const expired = medicinesList.filter(m => {
    const daysLeft = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 90;
  });

  return `
    <div class="dashboard-card" style="background: #fff; padding: 24px; ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
        <div>
          <h3 style="font-size: 15px; font-weight: 800; margin: 0;">Expiry & Near Expiry Monitoring</h3>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">List of drugs already expired or expiring in the next 90 days.</p>
        </div>
        <span class="badge danger" style="font-size: 10px; padding: 4px 10px; border-radius: 6px;">Critical View</span>
      </div>

      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
              <th style="padding: 12px; text-align: left;">Drug Name</th>
              <th style="padding: 12px; text-align: center;">Batch</th>
              <th style="padding: 12px; text-align: center;">Expiry Date</th>
              <th style="padding: 12px; text-align: center;">Days Left</th>
              <th style="padding: 12px; text-align: center;">Stock Qty</th>
              <th style="padding: 12px; text-align: center;">Status Alert</th>
            </tr>
          </thead>
          <tbody>
            ${expired.length > 0 ? expired.map(m => {
              const daysLeft = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
              const isExpired = daysLeft <= 0;
              return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px; font-size: 13px; font-weight: 700;">${m.name}</td>
                  <td style="padding: 12px; text-align: center; font-size: 12px;">${m.batchNumber}</td>
                  <td style="padding: 12px; text-align: center; font-size: 12px;">${new Date(m.expiryDate).toLocaleDateString('en-IN')}</td>
                  <td style="padding: 12px; text-align: center; font-size: 12.5px; font-weight: 700; color: ${isExpired ? 'red' : 'orange'}">
                    ${isExpired ? 'Expired' : `${daysLeft} Days`}
                  </td>
                  <td style="padding: 12px; text-align: center; font-size: 12.5px; font-weight: 600;">${m.stock} ${m.unit}</td>
                  <td style="padding: 12px; text-align: center;">
                    <span class="badge ${isExpired ? 'danger' : 'warning'}" style="font-size: 10px; padding: 3px 8px;">
                      ${isExpired ? 'EXPIRED' : 'NEAR EXPIRY'}
                    </span>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No expired or near-expiry medicines in inventory. Excellent!</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderLedgerView(formatINR) {
  return `
    <div style="">
      <div class="grid-2-cols" style="gap: 20px;">
        <!-- Payables -->
        <div class="dashboard-card" style="background: #fff; padding: 24px;">
          <h3 style="font-size: 15px; font-weight: 800; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 16px; color: var(--text-main);">Supplier Outstanding Balances</h3>
          <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
                  <th style="padding: 10px; text-align: left;">Supplier</th>
                  <th style="padding: 10px; text-align: left;">GST No</th>
                  <th style="padding: 10px; text-align: right;">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                ${suppliersList.length > 0 ? suppliersList.map((sup, idx) => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px; font-weight: 700;">${sup.name}</td>
                    <td style="padding: 10px;">${sup.gstNo}</td>
                    <td style="padding: 10px; text-align: right; font-weight: 800; color: red;">
                      ${formatINR((idx + 1) * 8500)}
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="3" style="text-align: center; padding: 20px; color: var(--text-muted);">No supplier balances.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Receivables -->
        <div class="dashboard-card" style="background: #fff; padding: 24px;">
          <h3 style="font-size: 15px; font-weight: 800; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 16px; color: var(--text-main);">Customer Credit & Receivables</h3>
          <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
                  <th style="padding: 10px; text-align: left;">Patient Customer</th>
                  <th style="padding: 10px; text-align: center;">Mobile</th>
                  <th style="padding: 10px; text-align: right;">Due Balance</th>
                </tr>
              </thead>
              <tbody>
                ${customersList.length > 0 ? customersList.map((cust, idx) => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px; font-weight: 700;">${cust.name}</td>
                    <td style="padding: 10px; text-align: center;">${cust.mobile}</td>
                    <td style="padding: 10px; text-align: right; font-weight: 800; color: orange;">
                      ${formatINR((idx + 1) * 350)}
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="3" style="text-align: center; padding: 20px; color: var(--text-muted);">No customer credit balances.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderReportsView(formatINR) {
  return `
    <div class="dashboard-card" style="background: #fff; padding: 24px; ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="font-size: 15px; font-weight: 800; margin: 0;">Sales Audit History Log</h3>
        <button type="button" class="btn btn-secondary" id="pharma-reports-export" style="display: flex; align-items: center; gap: 6px;">
          📊 Export Sheets
        </button>
      </div>

      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
              <th style="padding: 12px; text-align: left;">Invoice ID</th>
              <th style="padding: 12px; text-align: left;">Patient Customer</th>
              <th style="padding: 12px; text-align: left;">Doctor Ref</th>
              <th style="padding: 12px; text-align: right;">Total (inc GST)</th>
              <th style="padding: 12px; text-align: center;">Payment Mode</th>
              <th style="padding: 12px; text-align: center;">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            ${salesList.length > 0 ? salesList.map(sale => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-weight: 700; color: var(--success-icon);">INV-PH-${sale.id}</td>
                <td style="padding: 12px; font-size: 13px; font-weight: 700;">
                  ${sale.customerName}
                  <div style="font-size: 10.5px; color: var(--text-muted);">Mob: ${sale.customerMobile || 'N/A'}</div>
                </td>
                <td style="padding: 12px; font-size: 12.5px;">${sale.doctorName || 'Walk-in'}</td>
                <td style="padding: 12px; text-align: right; font-size: 13px; font-weight: 800;">${formatINR(sale.grandTotal)}</td>
                <td style="padding: 12px; text-align: center;">
                  <span class="badge success" style="font-size: 10.5px; padding: 2px 8px;">${sale.paymentMode}</span>
                </td>
                <td style="padding: 12px; text-align: center; font-size: 11.5px; color: var(--text-muted);">
                  ${new Date(sale.saleDate).toLocaleString('en-IN')}
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No sales transactions logged in database yet.</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================================================
   Modal layouts rendering
   ============================================================================ */

function renderMedModal() {
  if (!showAddMedModal) return '';
  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 99999;">
      <div class="modal-container" style="max-width: 600px; width: 90%; padding: 28px; background: #fff; border-radius: 16px; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
          <h3 style="font-size: 16.5px; font-weight: 800; color: var(--text-main); margin: 0;">Add Medicine Master Card</h3>
          <button type="button" id="modal-med-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <form id="pharma-add-med-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group">
              <label>Medicine Name *</label>
              <input type="text" id="medform-name" class="form-input" required value="${medFormName}" />
            </div>
            <div class="form-group">
              <label>Brand Name *</label>
              <input type="text" id="medform-brand" class="form-input" required value="${medFormBrand}" />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group">
              <label>Generic / Chemical Name *</label>
              <input type="text" id="medform-generic" class="form-input" required value="${medFormGeneric}" />
            </div>
            <div class="form-group">
              <label>Category (Form) *</label>
              <select id="medform-category" class="form-select">
                <option value="Tablet" ${medFormCategory === 'Tablet' ? 'selected' : ''}>Tablet</option>
                <option value="Capsule" ${medFormCategory === 'Capsule' ? 'selected' : ''}>Capsule</option>
                <option value="Syrup" ${medFormCategory === 'Syrup' ? 'selected' : ''}>Syrup</option>
                <option value="Injection" ${medFormCategory === 'Injection' ? 'selected' : ''}>Injection</option>
                <option value="Ointment" ${medFormCategory === 'Ointment' ? 'selected' : ''}>Ointment</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group">
              <label>HSN Code *</label>
              <input type="text" id="medform-hsn" class="form-input" required value="${medFormHsn}" />
            </div>
            <div class="form-group">
              <label>GST Percent (%) *</label>
              <select id="medform-gst" class="form-select">
                <option value="0" ${medFormGst === '0' ? 'selected' : ''}>0%</option>
                <option value="5" ${medFormGst === '5' ? 'selected' : ''}>5%</option>
                <option value="12" ${medFormGst === '12' ? 'selected' : ''}>12%</option>
                <option value="18" ${medFormGst === '18' ? 'selected' : ''}>18%</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group">
              <label>Batch Number *</label>
              <input type="text" id="medform-batch" class="form-input" required value="${medFormBatch}" />
            </div>
            <div class="form-group">
              <label>Expiry Date *</label>
              <input type="date" id="medform-expiry" class="form-input" required value="${medFormExpiry}" />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div class="form-group">
              <label>MRP (₹) *</label>
              <input type="number" step="0.01" id="medform-mrp" class="form-input" required value="${medFormMrp}" />
            </div>
            <div class="form-group">
              <label>Purchase Rate (₹) *</label>
              <input type="number" step="0.01" id="medform-purrate" class="form-input" required value="${medFormPurchaseRate}" />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
            <div class="form-group">
              <label>Sale Rate (₹) *</label>
              <input type="number" step="0.01" id="medform-salerate" class="form-input" required value="${medFormSaleRate}" />
            </div>
            <div class="form-group">
              <label>Unit Pack (e.g. Strip, Bottle) *</label>
              <input type="text" id="medform-unit" class="form-input" required value="${medFormUnit}" />
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label>Initial Opening Stock *</label>
            <input type="number" id="medform-stock" class="form-input" required value="${medFormStock}" />
          </div>
          <button type="submit" class="btn btn-primary" style="background: var(--success-icon); border: none; width: 100%; padding: 12px;">
            Save Medicine Master Card
          </button>
        </form>
      </div>
    </div>
  `;
}

function renderSupplierModal() {
  if (!showAddSupplierModal) return '';
  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 99999;">
      <div class="modal-container" style="max-width: 450px; width: 90%; padding: 24px; background: #fff; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
          <h3 style="margin: 0;">Register Supplier</h3>
          <button type="button" id="modal-sup-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <form id="pharma-add-sup-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label>Supplier / Distributor Name *</label>
            <input type="text" id="supform-name" class="form-input" required value="${supFormName}" />
          </div>
          <div class="form-group">
            <label>Supplier GST Number *</label>
            <input type="text" id="supform-gst" class="form-input" placeholder="e.g. 27AAAAA1111A1Z1" required value="${supFormGst}" />
          </div>
          <div class="form-group">
            <label>Supplier Contact Number *</label>
            <input type="tel" id="supform-contact" class="form-input" required value="${supFormContact}" />
          </div>
          <div class="form-group">
            <label>Supplier Office Address *</label>
            <input type="text" id="supform-address" class="form-input" required value="${supFormAddress}" />
          </div>
          <button type="submit" class="btn btn-primary" style="background: var(--success-icon); border: none; width: 100%; padding: 12px; margin-top: 10px;">
            Register Supplier
          </button>
        </form>
      </div>
    </div>
  `;
}

function renderCustomerModal() {
  if (!showAddCustomerModal) return '';
  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 99999;">
      <div class="modal-container" style="max-width: 450px; width: 90%; padding: 24px; background: #fff; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
          <h3 style="margin: 0;">Register Patient</h3>
          <button type="button" id="modal-cust-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <form id="pharma-add-cust-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label>Patient Name *</label>
            <input type="text" id="custform-name" class="form-input" required value="${custFormName}" />
          </div>
          <div class="form-group">
            <label>Mobile Number *</label>
            <input type="tel" id="custform-mobile" class="form-input" required value="${custFormMobile}" />
          </div>
          <div class="form-group">
            <label>Residential Address *</label>
            <input type="text" id="custform-address" class="form-input" required value="${custFormAddress}" />
          </div>
          <div class="form-group">
            <label>Referring Doctor</label>
            <input type="text" id="custform-doctor" class="form-input" placeholder="e.g. Dr. Verma" value="${custFormDoctor}" />
          </div>
          <button type="submit" class="btn btn-primary" style="background: var(--success-icon); border: none; width: 100%; padding: 12px; margin-top: 10px;">
            Register Patient Card
          </button>
        </form>
      </div>
    </div>
  `;
}

function renderDoctorModal() {
  if (!showAddDoctorModal) return '';
  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 99999;">
      <div class="modal-container" style="max-width: 450px; width: 90%; padding: 24px; background: #fff; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
          <h3 style="margin: 0;">Save Doctor Details</h3>
          <button type="button" id="modal-doc-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <form id="pharma-add-doc-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label>Doctor Name *</label>
            <input type="text" id="docform-name" class="form-input" required value="${docFormName}" />
          </div>
          <div class="form-group">
            <label>Medical Registration Number *</label>
            <input type="text" id="docform-reg" class="form-input" placeholder="e.g. MCI-12930" required value="${docFormReg}" />
          </div>
          <div class="form-group">
            <label>Contact Number *</label>
            <input type="tel" id="docform-contact" class="form-input" required value="${docFormContact}" />
          </div>
          <button type="submit" class="btn btn-primary" style="background: var(--success-icon); border: none; width: 100%; padding: 12px; margin-top: 10px;">
            Save Doctor Record
          </button>
        </form>
      </div>
    </div>
  `;
}

function renderPharmaInvoiceModal(formatINR) {
  if (!showInvoiceModal || !activeInvoice) return '';
  const d = activeInvoice;

  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 99999;">
      <div class="modal-container" style="max-width: ${printLayout === 'a4' ? '800px' : '400px'}; width: 90%; padding: 24px; background: #fff; border-radius: 16px; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 14px;">
          <h3 style="margin: 0; font-size: 15px;">Sales Invoice Receipt</h3>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn active-printlayout-btn" data-layout="thermal" style="${printLayout === 'thermal' ? 'background: var(--success-icon); color: white;' : ''} padding: 3px 8px; font-size: 11px;">Thermal</button>
            <button type="button" class="btn active-printlayout-btn" data-layout="a4" style="${printLayout === 'a4' ? 'background: var(--success-icon); color: white;' : ''} padding: 3px 8px; font-size: 11px;">A4 Sheet</button>
          </div>
        </div>

        <div id="pharma-invoice-print-area" style="padding: 10px; background: #fff; color: #000; font-size: ${printLayout === 'thermal' ? '11px' : '12px'}; font-family: ${printLayout === 'thermal' ? 'Courier, monospace' : 'inherit'};">
          ${printLayout === 'thermal' ? `
            <div style="text-align: center; margin-bottom: 12px;">
              <h2 style="font-size: 16px; font-weight: 800; margin: 0;">KAIRA MEDICOS</h2>
              <div style="font-size: 11px;">Sector 5, Kharghar, Navi Mumbai</div>
              <div style="font-size: 11px;">GSTIN: 27AASDK4412M1Z5</div>
            </div>
            <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>
            <div style="display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px;">
              <div><strong>Invoice No:</strong> ${d.invoiceId}</div>
              <div><strong>Date:</strong> ${d.date}</div>
              <div><strong>Patient:</strong> ${d.customerName}</div>
              ${d.customerMobile ? `<div><strong>Mobile:</strong> ${d.customerMobile}</div>` : ''}
              ${d.doctorName ? `<div><strong>Doctor:</strong> ${d.doctorName}</div>` : ''}
            </div>
            <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="border-bottom: 1px dashed #000;">
                  <th style="padding: 4px 0; text-align: left;">Drug Item</th>
                  <th style="padding: 4px 0; text-align: center;">Qty</th>
                  <th style="padding: 4px 0; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${d.items.map(item => `
                  <tr>
                    <td style="padding: 4px 0;">
                      ${item.medicineName}
                      <div style="font-size: 9px; color: #555;">Expiry: ${new Date(item.expiryDate).getMonth() + 1}/${String(new Date(item.expiryDate).getFullYear()).slice(-2)}</div>
                    </td>
                    <td style="padding: 4px 0; text-align: center;">${item.quantity}</td>
                    <td style="padding: 4px 0; text-align: right;">${formatINR(item.quantity * item.saleRate)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>
            <div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
              <div>Taxable Value: ₹${(d.subTotal - d.discountAmount - d.gstAmount).toFixed(2)}</div>
              ${d.discountAmount > 0 ? `<div style="color: red;">Discount: -₹${d.discountAmount.toFixed(2)}</div>` : ''}
              <div>GST Included: ₹${d.gstAmount.toFixed(2)}</div>
              <div style="font-size: 14px; font-weight: 800;">Net Payable: ${formatINR(d.grandTotal)}</div>
            </div>
            <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>
            <div style="text-align: center; font-size: 10px; margin-top: 8px;">*** Get Well Soon! ***</div>
          ` : `
            <div style="border: 1.5px solid #000; padding: 14px; display: flex; justify-content: space-between;">
              <div style="width: 55%; font-size: 11.5px; line-height: 1.4;">
                <h2 style="font-size: 18px; font-weight: 900; margin: 0 0 6px 0;">KAIRA MEDICOS</h2>
                <div>CITY PLAZA, GAUR CITY-1, NOIDA WEST</div>
                <div>Phone: +91 8226811810</div>
                <div>GSTIN: 09ABDFM1157A1ZP</div>
              </div>
              <div style="width: 42%; font-size: 11.5px; display: flex; flex-direction: column; gap: 4px;">
                <div style="border: 1.5px solid #000; text-align: center; font-weight: 900; padding: 4px; background: #f8fafc;">GST INVOICE</div>
                <div><strong>Invoice No:</strong> ${d.invoiceId}</div>
                <div><strong>Patient Name:</strong> ${d.customerName}</div>
                <div><strong>Dr. Name:</strong> ${d.doctorName || 'Walk-in'}</div>
              </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 14px; border: 1.5px solid #000; font-size: 11px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1.5px solid #000; height: 28px;">
                  <th style="padding: 4px; border-right: 1px solid #000;">PRODUCT NAME</th>
                  <th style="padding: 4px; border-right: 1px solid #000; text-align: center;">BATCH</th>
                  <th style="padding: 4px; border-right: 1px solid #000; text-align: center;">EXP</th>
                  <th style="padding: 4px; border-right: 1px solid #000; text-align: center;">QTY</th>
                  <th style="padding: 4px; border-right: 1px solid #000; text-align: right;">RATE</th>
                  <th style="padding: 4px; border-right: 1px solid #000; text-align: center;">DIS %</th>
                  <th style="padding: 4px; text-align: right;">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${d.items.map(item => `
                  <tr style="border-bottom: 1px solid #000; height: 24px;">
                    <td style="padding: 4px; border-right: 1px solid #000; font-weight: bold;">${item.medicineName}</td>
                    <td style="padding: 4px; border-right: 1px solid #000; text-align: center;">${item.batchNumber}</td>
                    <td style="padding: 4px; border-right: 1px solid #000; text-align: center;">${new Date(item.expiryDate).getMonth() + 1}/${String(new Date(item.expiryDate).getFullYear()).slice(-2)}</td>
                    <td style="padding: 4px; border-right: 1px solid #000; text-align: center;">${item.quantity}</td>
                    <td style="padding: 4px; border-right: 1px solid #000; text-align: right;">${Number(item.saleRate).toFixed(2)}</td>
                    <td style="padding: 4px; border-right: 1px solid #000; text-align: center;">${Number(item.discountPercent || 0).toFixed(2)}</td>
                    <td style="padding: 4px; text-align: right; font-weight: bold;">${Number(item.quantity * item.saleRate * (1 - (item.discountPercent || 0)/100)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="font-size: 9.5px; margin-top: 6px; padding: 5px; border: 1px solid #000; background: #fafafa; font-style: italic;">
              ${getGSTBreakdownText(d)}
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 12px; border-top: 1.5px solid #000; padding-top: 10px;">
              <div style="width: 58%; font-size: 11.5px; font-weight: bold; text-transform: capitalize;">
                Rs. ${numberToWords(d.grandTotal)} only
              </div>
              <div style="width: 38%; text-align: right;">
                <div>SUB TOTAL: ${Number(d.subTotal).toFixed(2)}</div>
                ${d.discountAmount > 0 ? `<div style="color: red;">DISCOUNT: -${Number(d.discountAmount).toFixed(2)}</div>` : ''}
                <div style="font-size: 13px; font-weight: 800; margin-top: 4px; color: var(--success-icon);">GRAND TOTAL: ${formatINR(d.grandTotal)}</div>
              </div>
            </div>
          `}
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 14px;">
          <button type="button" class="btn btn-secondary" id="pharma-invoice-modal-close-btn">Close</button>
          <button type="button" class="btn btn-primary" id="pharma-invoice-modal-print-btn" style="background: var(--success-icon); border: none;">🖨️ Print Invoice</button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   Event Binding Actions
   ============================================================================ */

export function bindPharmacyEvents() {
  const state = AppState;

  // Sidebar Tab Switch
  const tabs = ['dashboard', 'pos', 'masters', 'purchases', 'expiry', 'ledgers', 'reports'];
  tabs.forEach(tabId => {
    const el = document.getElementById(`pharma-tab-${tabId}`);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        activeTab = tabId;
        renderApp();
      });
    }
  });

  // Logout trigger
  const logoutBtn = document.getElementById('pharma-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Reset authenticated states
      localStorage.removeItem('propdeal_auth');
      localStorage.removeItem('propdeal_user_id');
      localStorage.removeItem('propdeal_user_name');
      localStorage.removeItem('propdeal_user_role');
      localStorage.removeItem('propdeal_user_avatar');
      localStorage.removeItem('propdeal_app_module');

      state.isAuthenticated = false;
      state.userName = '';
      state.userRole = 'Agent';
      state.userAvatar = 'kaira_logo.svg';
      state.currentModule = 'PropertyDealer';
      state.activeTab = 'dashboard';
      state.publicViewMode = 'portal';

      window.location.hash = '';
      renderApp();
    });
  }

  // Hamburger Menu toggle
  const hamToggle = document.getElementById('pharma-hamburger-menu-toggle');
  if (hamToggle) {
    hamToggle.addEventListener('click', () => {
      state.sidebarOpen = !state.sidebarOpen;
      renderApp();
    });
  }

  // Header Search Input - targeted filter WITHOUT re-render (avoids blink)
  const searchInput = document.getElementById('pharma-master-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      masterSearchQuery = e.target.value;
      // Direct DOM filter - no full renderApp() to prevent blink
      const q = masterSearchQuery.toLowerCase();
      document.querySelectorAll('.pharma-medicine-row').forEach(row => {
        const name = (row.getAttribute('data-name') || '').toLowerCase();
        const generic = (row.getAttribute('data-generic') || '').toLowerCase();
        const brand = (row.getAttribute('data-brand') || '').toLowerCase();
        const matches = !q || name.includes(q) || generic.includes(q) || brand.includes(q);
        row.style.display = matches ? '' : 'none';
      });
    });
  }

  /* --- Dashboard Tab Events --- */
  if (activeTab === 'dashboard') {
    const q1 = document.getElementById('pharma-quick-pos');
    if (q1) q1.addEventListener('click', () => { activeTab = 'pos'; renderApp(); });

    const q2 = document.getElementById('pharma-quick-purchases');
    if (q2) q2.addEventListener('click', () => { activeTab = 'purchases'; renderApp(); });

    const q3 = document.getElementById('pharma-quick-medicines');
    if (q3) q3.addEventListener('click', () => { activeTab = 'masters'; activeMasterSubTab = 'medicines'; renderApp(); });

    const q4 = document.getElementById('pharma-quick-expiry');
    if (q4) q4.addEventListener('click', () => { activeTab = 'expiry'; renderApp(); });
  }

  /* --- POS Billing Tab Events --- */
  if (activeTab === 'pos') {
    // POS live search input - targeted dropdown update WITHOUT full re-render
    const searchInp = document.getElementById('pos-medicine-search');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        medSearchQuery = e.target.value;
        const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(val);
        const dropdownContainer = document.getElementById('pos-search-dropdown');
        if (!dropdownContainer) return;

        if (medSearchQuery.trim() === '') {
          posSearchMatches = [];
          dropdownContainer.innerHTML = '';
          dropdownContainer.style.display = 'none';
          return;
        }
        const q = medSearchQuery.toLowerCase();
        posSearchMatches = medicinesList.filter(m =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.brandName.toLowerCase().includes(q)
        );
        if (posSearchMatches.length === 0) {
          dropdownContainer.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 13px;">No medicines found</div>';
          dropdownContainer.style.display = 'block';
        } else {
          dropdownContainer.innerHTML = posSearchMatches.map(med => `
            <div class="pos-search-match-row" data-id="${med.id}" style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer; border-radius: 4px;">
              <div>
                <strong style="font-size: 13px; color: var(--text-main)">${med.name}</strong> <span style="font-size: 11px; color: var(--text-muted)">(${med.brandName})</span>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Generic: ${med.genericName} | Batch: ${med.batchNumber}</div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 12.5px; font-weight: 800;">${formatCurrency(med.saleRate)}</span>
                <div style="font-size: 10.5px; color: ${med.stock <= 10 ? 'red' : 'green'}; font-weight: 700;">Stock: ${med.stock} ${med.unit}</div>
              </div>
            </div>
          `).join('');
          dropdownContainer.style.display = 'block';
          // Re-bind click events for newly inserted rows
          dropdownContainer.querySelectorAll('.pos-search-match-row').forEach(row => {
            row.addEventListener('click', () => {
              const mId = row.getAttribute('data-id');
              const med = medicinesList.find(m => String(m.id) === String(mId));
              if (med) {
                if (med.stock <= 0) { alert('Out of stock!'); return; }
                const exists = posCart.find(item => item.medicineId === med.id);
                if (exists) { alert('Already in cart.'); return; }
                posCart.push({
                  medicineId: med.id, medicineName: med.name,
                  batchNumber: med.batchNumber, expiryDate: med.expiryDate,
                  saleRate: med.saleRate, gstPercent: med.gstPercent,
                  stockLimit: med.stock, quantity: 1, discountPercent: 0,
                  unit: med.unit || '1*10 Tab', hsnCode: med.hsnCode || '3004',
                  mrp: med.mrp || med.saleRate
                });
                medSearchQuery = '';
                posSearchMatches = [];
                const inp = document.getElementById('pos-medicine-search');
                if (inp) inp.value = '';
                dropdownContainer.innerHTML = '';
                dropdownContainer.style.display = 'none';
                renderApp(); // Full re-render only when item added to cart
              }
            });
          });
        }
      });
    }

    // Selected POS row search click
    document.querySelectorAll('.pos-search-match-row').forEach(row => {
      row.addEventListener('click', () => {
        const mId = row.getAttribute('data-id');
        const med = medicinesList.find(m => String(m.id) === String(mId));
        if (med) {
          if (med.stock <= 0) {
            alert('Out of stock!');
            return;
          }
          const exists = posCart.find(item => item.medicineId === med.id);
          if (exists) {
            alert('Already in cart.');
            return;
          }
          posCart.push({
            medicineId: med.id,
            medicineName: med.name,
            batchNumber: med.batchNumber,
            expiryDate: med.expiryDate,
            saleRate: med.saleRate,
            gstPercent: med.gstPercent,
            stockLimit: med.stock,
            quantity: 1,
            discountPercent: 0,
            unit: med.unit || '1*10 Tab',
            hsnCode: med.hsnCode || '3004',
            mrp: med.mrp || med.saleRate
          });
          medSearchQuery = '';
          posSearchMatches = [];
          renderApp();
        }
      });
    });

    // POS Cart qty change inputs
    document.querySelectorAll('.pos-cart-qty-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(inp.getAttribute('data-index'));
        const qty = parseInt(e.target.value) || 1;
        const item = posCart[idx];
        if (qty > item.stockLimit) {
          alert(`Max stock available is ${item.stockLimit}`);
          posCart[idx].quantity = item.stockLimit;
        } else {
          posCart[idx].quantity = Math.max(1, qty);
        }
        renderApp();
      });
    });

    // POS Cart discount inputs
    document.querySelectorAll('.pos-cart-disc-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(inp.getAttribute('data-index'));
        const disc = parseFloat(e.target.value) || 0;
        posCart[idx].discountPercent = Math.max(0, Math.min(100, disc));
        renderApp();
      });
    });

    // Remove item from cart
    document.querySelectorAll('.pos-cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        posCart = posCart.filter((_, i) => i !== idx);
        renderApp();
      });
    });

    // Bind billing transaction fields
    const fCustName = document.getElementById('pos-field-custname');
    if (fCustName) fCustName.addEventListener('input', (e) => { posCustomerName = e.target.value; });

    const fCustMobile = document.getElementById('pos-field-custmobile');
    if (fCustMobile) fCustMobile.addEventListener('input', (e) => { posCustomerMobile = e.target.value.replace(/\D/g, '').slice(0, 10); });

    const fDocName = document.getElementById('pos-field-docname');
    if (fDocName) fDocName.addEventListener('input', (e) => { posDoctorName = e.target.value; });

    const fPayMode = document.getElementById('pos-field-paymode');
    if (fPayMode) fPayMode.addEventListener('change', (e) => { posPaymentMode = e.target.value; });

    const fDiscount = document.getElementById('pos-field-discount');
    if (fDiscount) {
      fDiscount.addEventListener('input', (e) => { posDiscount = e.target.value; }); // Only state update, no blink
      fDiscount.addEventListener('change', (e) => { posDiscount = e.target.value; renderApp(); }); // Re-render on confirm
    }

    // Checkout submission
    const checkoutBtn = document.getElementById('pos-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', async () => {
        if (posCart.length === 0) {
          alert('Cart is empty.');
          return;
        }

        // Calculate checkout summary
        let subTotal = 0;
        let discountAmount = 0;
        let gstAmount = 0;
        const overallDiscountRatio = (parseFloat(posDiscount) || 0) / 100;

        posCart.forEach(item => {
          const lineSub = item.quantity * item.saleRate;
          const lineDisc = lineSub * (item.discountPercent / 100);
          const lineNetAfterItem = lineSub - lineDisc;
          const lineNetAfterAll = lineNetAfterItem * (1 - overallDiscountRatio);
          const lineGst = lineNetAfterAll - (lineNetAfterAll / (1 + (parseFloat(item.gstPercent) / 100)));
          
          subTotal += lineSub;
          discountAmount += lineDisc;
          gstAmount += lineGst;
        });

        const overallDiscVal = (subTotal - discountAmount) * overallDiscountRatio;
        discountAmount += overallDiscVal;

        const grandTotal = Math.round(subTotal - discountAmount);
        const roundOff = grandTotal - (subTotal - discountAmount);

        try {
          const res = await fetch('http://127.0.0.1:5000/api/pharmacy/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: posCustomerName,
              customerMobile: posCustomerMobile,
              doctorName: posDoctorName,
              subTotal,
              discountAmount,
              gstAmount,
              roundOff,
              grandTotal,
              paymentMode: posPaymentMode,
              items: posCart
            })
          });

          if (res.ok) {
            const data = await res.json();
            alert('POS sales transaction processed successfully!');
            activeInvoice = {
              invoiceId: `INV-PH-${data.saleId || '00'}-${Date.now().toString().slice(-4)}`,
              customerName: posCustomerName,
              customerMobile: posCustomerMobile,
              doctorName: posDoctorName,
              subTotal,
              discountAmount,
              gstAmount,
              roundOff,
              grandTotal,
              paymentMode: posPaymentMode,
              items: posCart,
              date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            };

            // Clear POS state
            posCart = [];
            posCustomerName = 'Walk-in Customer';
            posCustomerMobile = '';
            posDoctorName = '';
            posDiscount = '0';
            showInvoiceModal = true;
            
            // Reload local data
            await loadPharmaData();
          } else {
            alert('Checkout rejected by server. Check inventory levels.');
          }
        } catch (err) {
          alert('Checkout connection error.');
        }
        renderApp();
      });
    }
  }

  /* --- Master Registry Tab Events --- */
  if (activeTab === 'masters') {
    // Masters Sub-tab Switch buttons
    document.querySelectorAll('.btn-masters-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeMasterSubTab = btn.getAttribute('data-sub');
        renderApp();
      });
    });

    // Medicines tab specific actions
    if (activeMasterSubTab === 'medicines') {
      const openAddMedBtn = document.getElementById('master-add-med-btn');
      if (openAddMedBtn) {
        openAddMedBtn.addEventListener('click', () => {
          showAddMedModal = true;
          renderApp();
        });
      }

      // Inline delete medicine click
      document.querySelectorAll('.med-master-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const mId = btn.getAttribute('data-id');
          if (!confirm('Are you sure you want to delete this medicine from the catalog?')) return;
          try {
            const res = await fetch(`http://127.0.0.1:5000/api/pharmacy/medicines/${mId}`, { method: 'DELETE' });
            if (res.ok) {
              medicinesList = medicinesList.filter(m => String(m.id) !== String(mId));
              console.log('✅ Medicine deleted from MySQL catalog.');
            }
          } catch (err) {}
          renderApp();
        });
      });
    }

    if (activeMasterSubTab === 'suppliers') {
      const openAddSupBtn = document.getElementById('master-add-sup-btn');
      if (openAddSupBtn) openAddSupBtn.addEventListener('click', () => { showAddSupplierModal = true; renderApp(); });
    }

    if (activeMasterSubTab === 'customers') {
      const openAddCustBtn = document.getElementById('master-add-cust-btn');
      if (openAddCustBtn) openAddCustBtn.addEventListener('click', () => { showAddCustomerModal = true; renderApp(); });
    }

    if (activeMasterSubTab === 'doctors') {
      const openAddDocBtn = document.getElementById('master-add-doc-btn');
      if (openAddDocBtn) openAddDocBtn.addEventListener('click', () => { showAddDoctorModal = true; renderApp(); });
    }
  }

  /* --- Inward Purchase Tab Events --- */
  if (activeTab === 'purchases') {
    // Bind purchase item fields
    const fMed = document.getElementById('purcart-med-select');
    if (fMed) fMed.addEventListener('change', (e) => { purItemMedId = e.target.value; });

    const fBatch = document.getElementById('purcart-batch');
    if (fBatch) fBatch.addEventListener('input', (e) => { purItemBatch = e.target.value; });

    const fExpiry = document.getElementById('purcart-expiry');
    if (fExpiry) fExpiry.addEventListener('change', (e) => { purItemExpiry = e.target.value; });

    const fGst = document.getElementById('purcart-gst');
    if (fGst) fGst.addEventListener('change', (e) => { purItemGst = e.target.value; });

    const fQty = document.getElementById('purcart-qty');
    if (fQty) fQty.addEventListener('input', (e) => { purItemQty = e.target.value; });

    const fFree = document.getElementById('purcart-freeqty');
    if (fFree) fFree.addEventListener('input', (e) => { purItemFreeQty = e.target.value; });

    const fPurRate = document.getElementById('purcart-purrate');
    if (fPurRate) fPurRate.addEventListener('input', (e) => { purItemPurRate = e.target.value; });

    const fSaleRate = document.getElementById('purcart-salerate');
    if (fSaleRate) fSaleRate.addEventListener('input', (e) => { purItemSaleRate = e.target.value; });

    // Add Inward cart item click
    const addInwardBtn = document.getElementById('purcart-add-item-btn');
    if (addInwardBtn) {
      addInwardBtn.addEventListener('click', () => {
        if (!purItemMedId || parseFloat(purItemQty) <= 0 || parseFloat(purItemPurRate) <= 0) {
          alert('Specify medicine name, valid quantity and purchase rate.');
          return;
        }
        const medObj = medicinesList.find(m => String(m.id) === String(purItemMedId));
        purCartItems.push({
          medicineId: purItemMedId,
          medicineName: medObj.name,
          batchNumber: purItemBatch,
          expiryDate: purItemExpiry,
          quantity: parseInt(purItemQty),
          freeQuantity: parseInt(purItemFreeQty || 0),
          purchaseRate: parseFloat(purItemPurRate),
          saleRate: parseFloat(purItemSaleRate || purItemPurRate),
          gstPercent: parseFloat(purItemGst),
          discountPercent: parseFloat(purItemDisc)
        });

        // Reset item inputs
        purItemMedId = '';
        purItemBatch = '';
        purItemExpiry = '';
        purItemQty = '0';
        purItemFreeQty = '0';
        purItemPurRate = '0';
        purItemSaleRate = '0';
        renderApp();
      });
    }

    // Remove item from Inward cart
    document.querySelectorAll('.pur-cart-row-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        purCartItems = purCartItems.filter((_, i) => i !== idx);
        renderApp();
      });
    });

    // Bind metadata fields
    const fSup = document.getElementById('pur-meta-supplier');
    if (fSup) fSup.addEventListener('change', (e) => { purSupplierId = e.target.value; });

    const fInvNo = document.getElementById('pur-meta-invno');
    if (fInvNo) fInvNo.addEventListener('input', (e) => { purInvoiceNumber = e.target.value; });

    const fInvDate = document.getElementById('pur-meta-invdate');
    if (fInvDate) fInvDate.addEventListener('change', (e) => { purInvoiceDate = e.target.value; });

    // Post purchases to backend
    const postPurBtn = document.getElementById('pur-meta-post-btn');
    if (postPurBtn) {
      postPurBtn.addEventListener('click', async () => {
        if (!purSupplierId || !purInvoiceNumber || purCartItems.length === 0) {
          alert('Complete Supplier details, invoice number and add cart items.');
          return;
        }

        const supplierObj = suppliersList.find(s => String(s.id) === String(purSupplierId));
        let gstTotal = 0;
        let discountTotal = 0;
        let grandTotal = 0;

        purCartItems.forEach(item => {
          const subTotal = item.quantity * item.purchaseRate;
          const disc = subTotal * (item.discountPercent / 100);
          const gst = (subTotal - disc) * (item.gstPercent / 100);
          
          discountTotal += disc;
          gstTotal += gst;
          grandTotal += (subTotal - disc + gst);
        });

        try {
          const res = await fetch('http://127.0.0.1:5000/api/pharmacy/purchases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              supplierId: purSupplierId,
              supplierName: supplierObj.name,
              invoiceNumber: purInvoiceNumber,
              invoiceDate: purInvoiceDate,
              gstTotal,
              discountTotal,
              grandTotal,
              items: purCartItems
            })
          });

          if (res.ok) {
            alert('Purchase Invoice posted & stock incremented successfully!');
            // Reset form fields
            purSupplierId = '';
            purInvoiceNumber = '';
            purCartItems = [];
            activeTab = 'dashboard';
            await loadPharmaData();
          } else {
            alert('Server rejected purchase post.');
          }
        } catch (err) {
          alert('Connection error posting purchase invoice.');
        }
        renderApp();
      });
    }
  }

  /* --- Reports Tab Events --- */
  if (activeTab === 'reports') {
    const exportBtn = document.getElementById('pharma-reports-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        alert('📊 Exporting Pharmacy Sales Report to Excel Spreadsheet...');
      });
    }
  }

  /* --- Modals specific event binders --- */
  if (showAddMedModal) {
    const closeBtn = document.getElementById('modal-med-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { showAddMedModal = false; renderApp(); });

    // Track med inputs
    const medInputs = [
      { id: 'medform-name', set: (val) => { medFormName = val; } },
      { id: 'medform-brand', set: (val) => { medFormBrand = val; } },
      { id: 'medform-generic', set: (val) => { medFormGeneric = val; } },
      { id: 'medform-category', set: (val) => { medFormCategory = val; } },
      { id: 'medform-hsn', set: (val) => { medFormHsn = val; } },
      { id: 'medform-gst', set: (val) => { medFormGst = val; } },
      { id: 'medform-batch', set: (val) => { medFormBatch = val; } },
      { id: 'medform-expiry', set: (val) => { medFormExpiry = val; } },
      { id: 'medform-mrp', set: (val) => { medFormMrp = val; } },
      { id: 'medform-purrate', set: (val) => { medFormPurchaseRate = val; } },
      { id: 'medform-salerate', set: (val) => { medFormSaleRate = val; } },
      { id: 'medform-unit', set: (val) => { medFormUnit = val; } },
      { id: 'medform-stock', set: (val) => { medFormStock = val; } }
    ];
    medInputs.forEach(inp => {
      const el = document.getElementById(inp.id);
      if (el) el.addEventListener('input', (e) => inp.set(e.target.value));
    });

    const form = document.getElementById('pharma-add-med-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const res = await fetch('http://127.0.0.1:5000/api/pharmacy/medicines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: medFormName,
              genericName: medFormGeneric,
              brandName: medFormBrand,
              hsnCode: medFormHsn,
              gstPercent: parseFloat(medFormGst),
              batchNumber: medFormBatch,
              expiryDate: medFormExpiry,
              mrp: parseFloat(medFormMrp),
              purchaseRate: parseFloat(medFormPurchaseRate),
              saleRate: parseFloat(medFormSaleRate),
              unit: medFormUnit,
              category: medFormCategory,
              stock: parseInt(medFormStock)
            })
          });

          if (res.ok) {
            alert('Medicine catalog item saved successfully!');
            // Reset med form fields
            medFormName = '';
            medFormGeneric = '';
            medFormBrand = '';
            medFormBatch = '';
            medFormExpiry = '';
            medFormMrp = '';
            medFormPurchaseRate = '';
            medFormSaleRate = '';
            medFormStock = '0';
            showAddMedModal = false;
            await loadPharmaData();
          } else {
            alert('Failed to save medicine catalog item.');
          }
        } catch (err) {
          alert('Master sync error.');
        }
        renderApp();
      });
    }
  }

  if (showAddSupplierModal) {
    const closeBtn = document.getElementById('modal-sup-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { showAddSupplierModal = false; renderApp(); });

    // Track inputs
    const supInputs = [
      { id: 'supform-name', set: (val) => { supFormName = val; } },
      { id: 'supform-gst', set: (val) => { supFormGst = val; } },
      { id: 'supform-contact', set: (val) => { supFormContact = val; } },
      { id: 'supform-address', set: (val) => { supFormAddress = val; } }
    ];
    supInputs.forEach(inp => {
      const el = document.getElementById(inp.id);
      if (el) el.addEventListener('input', (e) => inp.set(e.target.value));
    });

    const form = document.getElementById('pharma-add-sup-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const res = await fetch('http://127.0.0.1:5000/api/pharmacy/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: supFormName,
              gstNo: supFormGst,
              address: supFormAddress,
              contact: supFormContact
            })
          });

          if (res.ok) {
            alert('Supplier recorded successfully!');
            supFormName = '';
            supFormGst = '';
            supFormAddress = '';
            supFormContact = '';
            showAddSupplierModal = false;
            await loadPharmaData();
          } else {
            alert('Server error saving supplier.');
          }
        } catch (err) {
          alert('Sync error.');
        }
        renderApp();
      });
    }
  }

  if (showAddCustomerModal) {
    const closeBtn = document.getElementById('modal-cust-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { showAddCustomerModal = false; renderApp(); });

    // Track inputs
    const custInputs = [
      { id: 'custform-name', set: (val) => { custFormName = val; } },
      { id: 'custform-mobile', set: (val) => { custFormMobile = val; } },
      { id: 'custform-address', set: (val) => { custFormAddress = val; } },
      { id: 'custform-doctor', set: (val) => { custFormDoctor = val; } }
    ];
    custInputs.forEach(inp => {
      const el = document.getElementById(inp.id);
      if (el) el.addEventListener('input', (e) => inp.set(e.target.value));
    });

    const form = document.getElementById('pharma-add-cust-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const res = await fetch('http://127.0.0.1:5000/api/pharmacy/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: custFormName,
              mobile: custFormMobile,
              address: custFormAddress,
              doctorRef: custFormDoctor
            })
          });

          if (res.ok) {
            alert('Patient record synchronized successfully!');
            custFormName = '';
            custFormMobile = '';
            custFormAddress = '';
            custFormDoctor = '';
            showAddCustomerModal = false;
            await loadPharmaData();
          } else {
            alert('Server failed to save patient customer.');
          }
        } catch (err) {
          alert('Connection error.');
        }
        renderApp();
      });
    }
  }

  if (showAddDoctorModal) {
    const closeBtn = document.getElementById('modal-doc-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { showAddDoctorModal = false; renderApp(); });

    // Track inputs
    const docInputs = [
      { id: 'docform-name', set: (val) => { docFormName = val; } },
      { id: 'docform-reg', set: (val) => { docFormReg = val; } },
      { id: 'docform-contact', set: (val) => { docFormContact = val; } }
    ];
    docInputs.forEach(inp => {
      const el = document.getElementById(inp.id);
      if (el) el.addEventListener('input', (e) => inp.set(e.target.value));
    });

    const form = document.getElementById('pharma-add-doc-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const res = await fetch('http://127.0.0.1:5000/api/pharmacy/doctors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: docFormName,
              regNo: docFormReg,
              contact: docFormContact
            })
          });

          if (res.ok) {
            alert('Doctor record synced successfully!');
            docFormName = '';
            docFormReg = '';
            docFormContact = '';
            showAddDoctorModal = false;
            await loadPharmaData();
          } else {
            alert('Server failed to save doctor.');
          }
        } catch (err) {
          alert('Connection error.');
        }
        renderApp();
      });
    }
  }

  /* --- Receipt print modal events --- */
  if (showInvoiceModal && activeInvoice) {
    const closeBtn = document.getElementById('pharma-invoice-modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { showInvoiceModal = false; renderApp(); });

    // Format print layouts switch
    document.querySelectorAll('.active-printlayout-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        printLayout = btn.getAttribute('data-layout');
        renderApp();
      });
    });

    // Printer dispatch click
    const printBtn = document.getElementById('pharma-invoice-modal-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        const printContent = document.getElementById('pharma-invoice-print-area').innerHTML;
        const d = activeInvoice;
        const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(val);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Pharma Invoice - ${d.invoiceId}</title>
              <style>
                body { font-family: ${printLayout === 'thermal' ? 'Courier, monospace' : 'inherit'}; padding: ${printLayout === 'thermal' ? '10px' : '40px'}; color: #000; line-height: 1.4; box-sizing: border-box; }
                table { width: 100%; border-collapse: collapse; margin-top: 14px; }
                th { background: #f8fafc; border-bottom: 1.5px solid #000; padding: 6px 4px; font-size: 11px; text-align: left; }
                td { border-bottom: 1px solid #000; padding: 6px 4px; font-size: 11px; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              <div style="width: ${printLayout === 'thermal' ? '80mm' : '100%'}">${printContent}</div>
              <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      });
    }
  }
}
