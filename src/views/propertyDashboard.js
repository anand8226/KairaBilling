import { AppState, renderApp, syncAppData } from '../main.js';

// Local variables to preserve form values when rendering or toggling tabs
let addPropName = '';
let addPropType = 'House';
let addPropStatus = 'Available';
let addPropPrice = '';
let addPropPurchasePrice = '';
let addPropVendorName = '';
let addPropAcquisitionDate = new Date().toISOString().split('T')[0];
let addPropOwnerName = '';
let addPropOwnerMobile = '';
let addPropImage = '';

let addCustName = '';
let addCustMobile = '';
let addCustRequirement = '2BHK Flat';
let addCustStatus = 'New Lead';

let addReqBuyerName = '';
let addReqMobile = '';
let addReqBudgetRange = '₹20L - ₹40L';
let addReqPreferredLocation = '';
let addReqPropertyType = 'Flat';
let addReqArea = '';

let addVisitCustomerName = '';
let addVisitPropertyName = '';
let addVisitDate = '';
let addVisitAgentName = '';
let addVisitNotes = '';

let sellBuyerName = '';
let sellSoldPrice = '';
let sellSaleDate = new Date().toISOString().split('T')[0];
let sellPaymentMethod = 'Cash';
let sellPaymentDetails = '';
let sellTokenAmount = '';
let sellAdvancePayment = '';
let sellAgreementFile = 'Agreement_Final_Signed.pdf';
let sellCommissionPercent = '2.0';

// Modal Open/Close variables (since we want simple UI control)
let propertyModalOpen = false;
let customerModalOpen = false;
let visitModalOpen = false;
let reqModalOpen = false;
let invoiceModalOpen = false;

// Filter and state variables for inventory
let propertyTypeFilter = 'All';
let propertyStatusFilter = 'All';
let propertyPriceFilter = 'All';

// Matching Engine details state
let matchingDrawerOpen = false;
let selectedReq = null;

// Header notifications dropdown state
let notificationsOpen = false;
let profileMenuOpen = false;
let avatarModalOpen = false;
let selectedAvatar = '';
let customAvatarUrl = '';
let savingAvatar = false;

// Dynamic calculations driven by MySQL data
function getStats(state) {
  const soldProps = state.properties.filter(p => p.status === 'Sold');
  const soldSum = soldProps.reduce((sum, p) => sum + parseFloat(p.price || 0), 0);
  const purchasedSum = state.properties.reduce((sum, p) => sum + parseFloat(p.purchasePrice || 0), 0);
  const profitSum = soldProps.reduce((sum, p) => {
    const cost = parseFloat(p.purchasePrice || 0);
    const sale = parseFloat(p.price || 0);
    return sum + (sale - cost);
  }, 0);

  const availableCount = state.properties.filter(p => p.status === 'Available').length;
  const plotCount = state.properties.filter(p => p.status === 'Available' && p.type === 'Plot').length;
  const leadsCount = state.leads.length;
  const visitsCount = state.visits.length;
  const openReqsCount = state.requirements.filter(r => r.status === 'Open').length;
  const commissionSum = state.deals.reduce((sum, d) => sum + parseFloat(d.commissionEarned || 0), 0);

  return {
    soldSum,
    purchasedSum,
    profitSum,
    availableCount,
    plotCount,
    leadsCount,
    visitsCount,
    openReqsCount,
    commissionSum
  };
}

export function renderPropertyDashboard(state) {
  selectedAvatar = state.userAvatar; // keep in sync
  const stats = getStats(state);
  
  return `
    <div class="app-container" style="">
      <!-- SIDEBAR -->
      ${renderSidebar(state)}

      <!-- MAIN PANEL -->
      <main class="main-panel">
        <!-- HEADER -->
        ${renderHeader(state)}

        <!-- TABS CONTENT -->
        <div class="tab-content-area" style="padding-top: 10px;">
          ${renderActiveTab(state, stats)}
        </div>

        <!-- FOOTER -->
        <footer class="footer-credits" style="margin-top: 40px; padding: 20px 0; border-top: 1px solid var(--border-color); text-align: center; font-size: 12px; color: var(--text-muted);">
          © ${new Date().getFullYear()} Kaira Deal. All rights reserved. • Live MySQL Database Connected
        </footer>
      </main>

      <!-- FLOATING MODALS -->
      ${renderAddPropertyModal(state)}
      ${renderAddCustomerModal(state)}
      ${renderAddVisitModal(state)}
      ${renderAddReqModal(state)}
      ${renderInvoiceModal(state)}
      ${renderAvatarModal(state)}
      ${renderMatchingDrawer(state)}
    </div>
  `;
}

/* ============================================================================
   Component Render Functions
   ============================================================================ */

function renderSidebar(state) {
  const role = state.userRole;
  const active = state.activeTab;

  const baseItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'sell_property_deal', label: 'Billing', icon: '🧾' },
    { id: 'deals', label: 'Sales Ledger', icon: '💰' },
    { id: 'properties', label: 'Inventory', icon: '🏠' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'requirements', label: 'Requirements', icon: '📋' },
    { id: 'visits', label: 'Site Visits', icon: '📅' },
    { id: 'reports', label: 'Reports', icon: '📈' }
  ];

  if (role === 'Super Admin' || role === 'Manager') {
    baseItems.push({ id: 'rfid_section', label: 'RFID Gates', icon: '📡' });
    baseItems.push({ id: 'backup_section', label: 'Cloud Backup', icon: '☁️' });
  }
  baseItems.push({ id: 'settings', label: 'Settings', icon: '⚙️' });

  return `
    <aside class="sidebar ${state.sidebarOpen ? 'mobile-open' : ''}" style="z-index: 100;">
      <div class="sidebar-brand" style="padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
        <img src="kaira_logo.svg" alt="Logo" style="width: 36px; height: 36px; border-radius: 10px; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.3);" />
        <div class="sidebar-brand-text">
          <h1 style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px; margin: 0; color: #fff;">Kaira Deal</h1>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
            <span style="font-size: 9px; font-weight: 800; color: var(--primary); letter-spacing: 0.5px;">ERP SUITE</span>
            <span class="badge ${role === 'Super Admin' ? 'danger' : role === 'Manager' ? 'warning' : 'info'}" style="font-size: 7.5px; padding: 1px 5px; font-weight: 800; text-transform: uppercase; border-radius: 4px;">
              ${role === 'Super Admin' ? 'Admin' : role}
            </span>
          </div>
        </div>
      </div>

      <nav class="sidebar-menu" style="display: flex; flex-direction: column; gap: 3px;">
        ${baseItems.map(item => {
          const isActive = active === item.id;
          return `
            <a href="#${item.id}" class="sidebar-menu-item ${isActive ? 'active' : ''}" id="sidebar-tab-${item.id}" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; color: ${isActive ? '#fff' : 'rgba(255,255,255,0.6)'}; transition: all 0.2s ease;">
              <span>${item.icon}</span>
              <span>${item.label}</span>
            </a>
          `;
        }).join('')}

        <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 12px 0;"></div>

        <a href="#logout" class="sidebar-menu-item" id="sidebar-logout-btn" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; color: hsl(0, 85%, 65%); transition: all 0.2s ease;">
          <span>🚪</span>
          <span>Logout</span>
        </a>
      </nav>

      <div style="margin-top: auto; padding-top: 20px; font-size: 11px; color: rgba(255,255,255,0.2); text-align: center;">
        v1.4 - Secure MySQL Connected
      </div>
    </aside>
  `;
}

function renderHeader(state) {
  const newLeads = Array.isArray(state.leads) ? state.leads.filter(l => l.status === 'New Lead') : [];
  const notifCount = newLeads.length;

  let title = 'Dashboard';
  if (state.activeTab === 'properties') title = 'Properties';
  if (state.activeTab === 'requirements') title = 'Buyer Requirements';
  if (state.activeTab === 'sell_property_deal') title = 'Close Sale Agreement';
  if (state.activeTab === 'customers') title = 'CRM Customers / Leads';
  if (state.activeTab === 'visits') title = 'Scheduled Visits';
  if (state.activeTab === 'deals') title = 'Sales Deals Ledger';
  if (state.activeTab === 'reports') title = 'Financial Reports & Analytics';
  if (state.activeTab === 'settings') title = 'System Settings';
  if (state.activeTab === 'add_property') title = 'Buy & List Property';

  return `
    <header class="header" style="position: relative;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button type="button" class="header-icon-btn mobile-only" id="hamburger-menu-toggle">
          <span>☰</span>
        </button>
        <div class="header-title-section">
          <h2>${title}</h2>
          <p>Welcome back, ${state.userName} 👋</p>
        </div>
      </div>

      <div class="header-actions-section">
        <!-- Search bar -->
        <div class="header-search-bar">
          <span>🔍</span>
          <input type="text" id="header-global-search" placeholder="Search here..." value="${state.searchQuery || ''}" />
        </div>

        <!-- Notification Bell -->
        <div style="position: relative;">
          <button type="button" class="header-icon-btn" id="notif-bell-btn">
            <span>🔔</span>
            ${notifCount > 0 ? `<span class="header-notification-badge">${notifCount}</span>` : ''}
          </button>

          <!-- Notifications Dropdown -->
          ${notificationsOpen ? `
            <div class="auth-profile-dropdown" style="position: absolute; top: 52px; right: 0; background: #ffffff; border: 1px solid var(--border-color); border-radius: 16px; box-shadow: var(--shadow-lg); z-index: 9999; width: 320px; overflow: hidden; animation: slide-up 0.2s ease-out;">
              <div style="padding: 16px; font-size: 13px; border-bottom: 1px solid var(--border-color); color: var(--text-main); display: flex; align-items: center; justify-content: space-between; font-weight: 800;">
                <span>Dynamic CRM Feeds</span>
                <span class="badge info" style="font-size: 9.5px; padding: 2px 8px; font-weight: 800;">${notifCount} New Leads</span>
              </div>
              <div style="max-height: 280px; overflow-y: auto;">
                ${newLeads.length > 0 ? newLeads.map(l => `
                  <div class="notif-item-feed" style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); display: flex; gap: 12px; align-items: flex-start; cursor: pointer;">
                    <img src="${l.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);" />
                    <div style="display: flex; flex-direction: column; gap: 2px; flex: 1; overflow: hidden;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12.5px; font-weight: 750; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${l.name}</span>
                        <span style="font-size: 8px; color: var(--text-light); font-weight: 600;">ID: ${l.id}</span>
                      </div>
                      <span style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">Req: <strong>${l.requirement}</strong></span>
                      <span style="font-size: 9px; color: var(--primary); font-weight: 700; margin-top: 2px;">📞 ${l.mobile}</span>
                    </div>
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 6px var(--primary); flex-shrink: 0; margin-top: 14px;"></span>
                  </div>
                `).join('') : `
                  <div style="padding: 30px 20px; text-align: center; color: var(--text-light); display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <span style="font-size: 24px;">🎉</span>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                      <span style="font-size: 12.5px; font-weight: 750; color: var(--text-main);">Pipeline is active!</span>
                      <span style="font-size: 10.5px; color: var(--text-muted);">No pending new leads.</span>
                    </div>
                  </div>
                `}
              </div>
              <div style="padding: 10px; background: var(--bg-main); text-align: center; border-top: 1px solid var(--border-color); font-size: 10px; font-weight: 700; color: var(--text-muted);">
                Kaira Deal ERP Live CRM Feed
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Profile Settings Dropdown -->
        <div class="header-profile" id="header-profile-dropdown-trigger" style="position: relative; cursor: pointer;">
          <img src="${state.userAvatar || 'kaira_logo.svg'}" alt="Avatar" />
          <div class="header-profile-info">
            <h4>${state.userName}</h4>
            <span>${state.userRole}</span>
          </div>

          ${profileMenuOpen ? `
            <div class="auth-profile-dropdown" style="position: absolute; top: 52px; right: 0; background: #ffffff; border: 1px solid var(--border-color); border-radius: 12px; box-shadow: var(--shadow-lg); z-index: 9999; width: 160px; overflow: hidden; animation: slide-up 0.2s ease-out;">
              <div style="padding: 12px; font-size: 11.5px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                <span>🛡️</span> Access Control
              </div>
              <button type="button" id="header-edit-profile-btn" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px; font-size: 13px; text-align: left; color: var(--primary); font-weight: 600; background: transparent; border: none; border-bottom: 1px solid var(--border-color); cursor: pointer;">
                📷 Edit Profile Pic
              </button>
              <button type="button" id="header-signout-btn" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px; font-size: 13px; text-align: left; color: var(--danger-text); font-weight: 600; background: transparent; border: none; cursor: pointer;">
                🚪 Sign Out
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    </header>
  `;
}

function renderActiveTab(state, stats) {
  const tab = state.activeTab;

  if (tab === 'dashboard') {
    return renderDashboardView(state, stats);
  } else if (tab === 'properties') {
    return renderPropertiesView(state);
  } else if (tab === 'requirements') {
    return renderRequirementsView(state);
  } else if (tab === 'sell_property_deal') {
    return renderSellPropertyView(state);
  } else if (tab === 'customers') {
    return renderCustomersView(state);
  } else if (tab === 'visits') {
    return renderVisitsView(state);
  } else if (tab === 'deals') {
    return renderDealsLedgerView(state);
  } else if (tab === 'reports') {
    return renderReportsView(state, stats);
  } else if (tab === 'add_property') {
    return renderAddPropertyView(state);
  } else if (tab === 'settings') {
    return renderSettingsView(state);
  }

  return `
    <div class="dashboard-card" style="align-items: center; justify-content: center; padding: 60px 20px; text-align: center; color: var(--text-muted)">
      <h3 style="margin-bottom: 10px; font-size: 18px;">Section: ${tab.toUpperCase()}</h3>
      <p>This layout is mock-integrated. Implement routing in main menu.</p>
    </div>
  `;
}

/* ============================================================================
   1. Dashboard View
   ============================================================================ */
function renderDashboardView(state, stats) {
  // SVG points calculator
  const getDynamicChartPoints = () => {
    const baseHeight = 160;
    if (!state.deals || state.deals.length === 0) {
      return {
        path: "M 0,160 Q 80,40 160,110 T 320,60 T 480,120 T 600,80",
        areaPath: "M 0,160 Q 80,40 160,110 T 320,60 T 480,120 T 600,80 L 600,200 L 0,200 Z",
        points: []
      };
    }
    const maxVal = Math.max(...state.deals.map(d => parseFloat(d.tokenAmount || 0) + parseFloat(d.advancePayment || 0) + parseFloat(d.finalPayment || 0)), 100000);
    const sortedDeals = [...state.deals].sort((a, b) => new Date(a.saleDate) - new Date(b.saleDate));
    const pointsCount = 7;
    const stepX = 600 / (pointsCount - 1);

    const dataPoints = Array.from({ length: pointsCount }, (_, i) => {
      const x = i * stepX;
      const deal = sortedDeals[i % sortedDeals.length];
      const val = deal ? (parseFloat(deal.tokenAmount || 0) + parseFloat(deal.advancePayment || 0) + parseFloat(deal.finalPayment || 0)) : 0;
      const y = baseHeight - (val / maxVal) * 120;
      return { x, y, val };
    });

    let path = `M 0,${dataPoints[0].y}`;
    for (let i = 1; i < dataPoints.length; i++) {
      const prev = dataPoints[i - 1];
      const curr = dataPoints[i];
      const cpX1 = prev.x + stepX / 2;
      const cpY1 = prev.y;
      const cpX2 = curr.x - stepX / 2;
      const cpY2 = curr.y;
      path += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${curr.x},${curr.y}`;
    }

    const areaPath = `${path} L 600,200 L 0,200 Z`;
    return { path, areaPath, points: dataPoints.map(p => ({ cx: p.x, cy: p.y, val: p.val })) };
  };

  const chartData = getDynamicChartPoints();

  // Category counts computed from DB
  const availableProps = state.properties.filter(p => p.status === 'Available');
  const lowStockAlerts = ['Plot', 'Flat', 'House', 'Shop'].map((type, idx) => {
    const count = availableProps.filter(p => p.type === type).length;
    return { id: idx + 1, title: `${type} Inventory Buffer`, count, type };
  }).sort((a, b) => a.count - b.count);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Cards layout logic based on role
  let cards = [];
  if (state.userRole === 'Super Admin') {
    cards = [
      { id: 'admin-sales', title: "Today's Sales", val: formatCurrency(stats.soldSum), sub: "Total closed deals value", color: 'var(--primary)' },
      { id: 'admin-purchases', title: "Today's Purchase", val: formatCurrency(stats.purchasedSum), sub: "Total acquisition costs", color: '#d97706' },
      { id: 'admin-customers', title: "Total Customers", val: `${stats.leadsCount} Leads`, sub: "Registered CRM Leads", color: '#16a34a' },
      { id: 'admin-profit', title: "Total Net Profit", val: formatCurrency(stats.profitSum), sub: "Gross deal margin profit", color: '#7e22ce' }
    ];
  } else if (state.userRole === 'Manager') {
    cards = [
      { id: 'mgr-active-assets', title: "Active Listed Assets", val: `${stats.availableCount} Listings`, sub: "Properties on market", color: 'var(--primary)' },
      { id: 'mgr-visits', title: "Client Visits", val: `${stats.visitsCount} Scheduled`, sub: "Visits recorded", color: '#7e22ce' },
      { id: 'mgr-reqs', title: "Open Requirements", val: `${stats.openReqsCount} Active`, sub: "Buyers search requirements", color: '#d97706' },
      { id: 'mgr-commission', title: "ERP Brokerage Earned", val: formatCurrency(stats.commissionSum), sub: "Total transaction splits", color: '#16a34a' }
    ];
  } else {
    // Agent
    cards = [
      { id: 'agent-deals', title: "My Closed Deals", val: `${state.deals.length} Closed`, sub: "Completed transactions", color: '#16a34a' },
      { id: 'agent-commission', title: "My Brokerage Earned", val: formatCurrency(stats.commissionSum), sub: "Commissions summary", color: 'var(--primary)' },
      { id: 'agent-leads', title: "My Assigned Leads", val: `${state.leads.filter(l => l.assignedTo === state.userName).length} Leads`, sub: "CRM Pipeline assignments", color: '#7e22ce' },
      { id: 'agent-plots', title: "Available Sector Plots", val: `${stats.plotCount} Plots`, sub: "Target plots for sale", color: '#d97706' }
    ];
  }

  return `
    <div style="">
      <!-- STATS GRID -->
      <div class="stats-grid" style="margin-bottom: 24px;">
        ${cards.map(c => `
          <div class="stat-card" id="dashboard-card-btn-${c.id}" style="background: #fff; border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; gap: 12px; position: relative; overflow: hidden; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <span style="font-size: 12.5px; font-weight: 600; color: var(--text-muted);">${c.title}</span>
                <span style="font-size: 24px; font-weight: 800; color: var(--text-main); letter-spacing: -1px;">${c.val}</span>
              </div>
              <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(30,111,253,0.06); color: ${c.color}; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                ${c.title.includes('Sales') || c.title.includes('Commission') || c.title.includes('Brokerage') ? '💰' : c.title.includes('Purchase') ? '💼' : c.title.includes('Customer') || c.title.includes('Leads') ? '👥' : c.title.includes('Assets') ? '🏠' : c.title.includes('Visits') ? '📅' : '📋'}
              </div>
            </div>
            <div style="font-size: 11.5px; color: var(--text-light); font-weight: 600;">
              📈 ${c.sub}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- MIDDLE GRAPH ROW -->
      <div class="grid-2-cols" style="margin-bottom: 24px;">
        <!-- Line Chart Card -->
        <div class="dashboard-card" style="background: #fff; padding: 24px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 15px; font-weight: 800; color: var(--text-main);">Sales Revenue Overview</h3>
            <select class="card-filter-select" style="font-size: 11px; padding: 4px 8px; border-radius: 6px;">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div style="position: relative; height: 220px; width: 100%;">
            <svg viewBox="0 0 600 200" style="width: 100%; height: 100%;">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.2"/>
                  <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3" />
              <line x1="0" y1="110" x2="600" y2="110" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3" />
              <path d="${chartData.path}" fill="none" stroke="var(--primary)" stroke-width="3" />
              <path d="${chartData.areaPath}" fill="url(#chartGrad)" />
              ${chartData.points.map(pt => `
                <circle cx="${pt.cx}" cy="${pt.cy}" r="5" fill="var(--primary)" stroke="#fff" stroke-width="2.5" />
              `).join('')}
            </svg>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0 8px; font-size: 11px; color: var(--text-muted); font-weight: 600; margin-top: 8px;">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <!-- Top Performing Listings -->
        <div class="dashboard-card" style="background: #fff; padding: 24px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 15px; font-weight: 800; color: var(--text-main);">Top Performing Listings</h3>
            <button type="button" id="dash-view-all-props" style="font-size: 11.5px; font-weight: 700; color: var(--primary); background: none; border: none; cursor: pointer;">View All</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${state.properties.slice(0, 5).map((p, idx) => `
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: ${idx < 4 ? '1px solid var(--border-color)' : 'none'}; padding-bottom: ${idx < 4 ? '10px' : '0'}">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 13px; font-weight: 800; color: var(--text-muted); width: 16px;">${idx + 1}</span>
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 13px; font-weight: 700; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 140px;">${p.name}</span>
                    <span style="font-size: 10.5px; color: var(--text-light); font-weight: 500;">${p.type} • ${p.status}</span>
                  </div>
                </div>
                <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">${formatCurrency(p.price)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- LOW STOCK & RECENT INVOICES & PAYMENTS ROW -->
      <div class="grid-3-cols" style="margin-bottom: 24px;">
        
        <!-- Low Inventory alerts -->
        <div class="dashboard-card" style="background: #fff; padding: 20px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 14px; font-weight: 800; color: var(--text-main);">Inventory Buffer Alerts</h3>
            <span class="badge danger" style="font-size: 9px; padding: 2px 6px; border-radius: 4px;">Critical</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${lowStockAlerts.map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border-color);">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <span style="font-size: 12px; font-weight: 700; color: var(--text-main);">${item.title}</span>
                  <span style="font-size: 10px; color: var(--text-light);">Category: ${item.type}</span>
                </div>
                <span class="badge ${item.count === 0 ? 'danger' : 'warning'}" style="font-size: 9px; padding: 2px 8px; border-radius: 6px; font-weight: 700;">
                  ${item.count === 0 ? 'Out of Stock' : `${item.count} Available`}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Invoices -->
        <div class="dashboard-card" style="background: #fff; padding: 20px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 14px; font-weight: 800; color: var(--text-main);">Recent Invoices</h3>
            <button type="button" id="dash-view-all-deals" style="font-size: 11.5px; font-weight: 700; color: var(--primary); background: none; border: none; cursor: pointer;">View All</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${state.deals && state.deals.length > 0 ? [...state.deals].reverse().slice(0, 4).map(d => {
              const totalAmount = parseFloat(d.tokenAmount || 0) + parseFloat(d.advancePayment || 0) + parseFloat(d.finalPayment || 0);
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" class="invoice-item-click-preview" data-id="${d.id}">
                  <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span style="font-size: 12.5px; font-weight: 700; color: var(--primary);">INV-${d.id.slice(-5)}</span>
                    <span style="font-size: 11px; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 110px;">${d.buyerName}</span>
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                    <span style="font-size: 12px; font-weight: 800; color: var(--text-main);">${formatCurrency(totalAmount)}</span>
                    <span style="font-size: 9px; color: var(--success-icon); font-weight: 700;">Paid</span>
                  </div>
                </div>
              `;
            }).join('') : `
              <div style="font-size: 12.5px; color: var(--text-muted); text-align: center; padding: 20px;">No deals recorded yet.</div>
            `}
          </div>
        </div>

        <!-- Recent Payments / Customers -->
        <div class="dashboard-card" style="background: #fff; padding: 20px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 14px; font-weight: 800; color: var(--text-main);">Recent CRM Customers</h3>
            <button type="button" id="dash-view-all-custs" style="font-size: 11.5px; font-weight: 700; color: var(--primary); background: none; border: none; cursor: pointer;">View All</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${state.leads.slice(0, 4).map(l => `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="${l.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);" />
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 12.5px; font-weight: 700; color: var(--text-main);">${l.name}</span>
                    <span style="font-size: 10.5px; color: var(--text-muted);">${l.requirement}</span>
                  </div>
                </div>
                <span class="badge ${l.status === 'New Lead' ? 'info' : l.status === 'Follow-up' ? 'warning' : 'success'}" style="font-size: 8.5px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
                  ${l.status}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- BOTTOM ERP BAR -->
      <div class="grid-4-cols" style="background: #fff; padding: 16px 24px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; border-right: 1px solid var(--border-color)">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--info-bg); color: var(--info-icon); display: flex; align-items: center; justify-content: center; font-size: 16px;">🏠</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 10.5px; color: var(--text-light); text-transform: uppercase; font-weight: 700;">Total Properties</span>
            <span style="font-size: 16px; font-weight: 800; color: var(--text-main);">${state.properties.length} Listings</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; border-right: 1px solid var(--border-color)">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--warning-bg); color: var(--warning-icon); display: flex; align-items: center; justify-content: center; font-size: 16px;">🔑</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 10.5px; color: var(--text-light); text-transform: uppercase; font-weight: 700;">Rented / Booked</span>
            <span style="font-size: 16px; font-weight: 800; color: var(--text-main);">${state.properties.filter(p => p.status === 'Rented').length} Assets</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; border-right: 1px solid var(--border-color)">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--danger-bg); color: var(--danger-icon); display: flex; align-items: center; justify-content: center; font-size: 16px;">💼</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 10.5px; color: var(--text-light); text-transform: uppercase; font-weight: 700;">Sold Off-Market</span>
            <span style="font-size: 16px; font-weight: 800; color: var(--text-main);">${state.properties.filter(p => p.status === 'Sold').length} Closed</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--success-bg); color: var(--success-icon); display: flex; align-items: center; justify-content: center; font-size: 16px;">👥</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 10.5px; color: var(--text-light); text-transform: uppercase; font-weight: 700;">Today's Orders</span>
            <span style="font-size: 16px; font-weight: 800; color: var(--text-main);">${state.leads.length} New CRM</span>
          </div>
        </div>
      </div>

      <!-- QUICK ACTIONS BAR -->
      <div class="dashboard-card" style="padding: 20px; background: #fff; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 800; color: var(--text-main); margin-bottom: 14px;">Quick Actions Billing Console</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
          <button type="button" class="btn btn-primary" id="qa-add-property" style="background: var(--primary); color: white;">🛒 Buy & List Property</button>
          <button type="button" class="btn btn-secondary" id="qa-add-customer" style="background: #f1f5f9; color: var(--text-main);">➕ Record CRM Lead</button>
          <button type="button" class="btn btn-primary" id="qa-sell-property" style="background: var(--danger-text); color: white; border: none;">🤝 Settle Sale Agreement</button>
          <button type="button" class="btn btn-secondary" id="qa-schedule-visit" style="background: #f1f5f9; color: var(--text-main);">📅 Schedule Site Visit</button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   2. Inventory View (Listed Properties Table)
   ============================================================================ */
function renderPropertiesView(state) {
  const query = state.searchQuery.toLowerCase();
  
  // Filter inventory
  const filtered = state.properties.filter(p => {
    // Search query matches
    const matchesQuery = p.id.toLowerCase().includes(query) ||
                         p.name.toLowerCase().includes(query) ||
                         p.type.toLowerCase().includes(query) ||
                         (p.ownerName && p.ownerName.toLowerCase().includes(query));

    // Type filter matches
    const matchesType = propertyTypeFilter === 'All' || p.type === propertyTypeFilter;

    // Status filter matches
    const matchesStatus = propertyStatusFilter === 'All' || p.status === propertyStatusFilter;

    // Price range filter
    let matchesPrice = true;
    if (propertyPriceFilter !== 'All') {
      const pr = parseFloat(p.price);
      if (propertyPriceFilter === 'low') matchesPrice = pr < 5000000;
      else if (propertyPriceFilter === 'mid') matchesPrice = pr >= 5000000 && pr <= 10000000;
      else if (propertyPriceFilter === 'high') matchesPrice = pr > 10000000;
    }

    return matchesQuery && matchesType && matchesStatus && matchesPrice;
  });

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return `
    <div style="">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main);">Listed Property Assets</h2>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Browse, filter, edit, list new properties and close sales agreements.</p>
        </div>
        <button type="button" class="btn btn-primary" id="inventory-add-list-btn">Buy & List Property</button>
      </div>

      <!-- Filters Strip -->
      <div class="dashboard-card" style="padding: 16px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 14px; align-items: center; background: #fff;">
        <div style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--text-muted)">
          <span>⚙️</span> Filters:
        </div>
        <div>
          <select id="prop-filter-type" class="card-filter-select" style="padding: 6px 12px; border-radius: 8px;">
            <option value="All" ${propertyTypeFilter === 'All' ? 'selected' : ''}>All Categories</option>
            <option value="House" ${propertyTypeFilter === 'House' ? 'selected' : ''}>House / Villa</option>
            <option value="Flat" ${propertyTypeFilter === 'Flat' ? 'selected' : ''}>Flat / Apartment</option>
            <option value="Plot" ${propertyTypeFilter === 'Plot' ? 'selected' : ''}>Plot / Land</option>
            <option value="Shop" ${propertyTypeFilter === 'Shop' ? 'selected' : ''}>Commercial Shop</option>
            <option value="Office" ${propertyTypeFilter === 'Office' ? 'selected' : ''}>Office Space</option>
          </select>
        </div>
        <div>
          <select id="prop-filter-status" class="card-filter-status" style="padding: 6px 12px; border-radius: 8px;">
            <option value="All" ${propertyStatusFilter === 'All' ? 'selected' : ''}>All Status</option>
            <option value="Available" ${propertyStatusFilter === 'Available' ? 'selected' : ''}>Available</option>
            <option value="Rented" ${propertyStatusFilter === 'Rented' ? 'selected' : ''}>Rented</option>
            <option value="Sold" ${propertyStatusFilter === 'Sold' ? 'selected' : ''}>Sold</option>
          </select>
        </div>
        <div>
          <select id="prop-filter-price" class="card-filter-select" style="padding: 6px 12px; border-radius: 8px;">
            <option value="All" ${propertyPriceFilter === 'All' ? 'selected' : ''}>All Budget Ranges</option>
            <option value="low" ${propertyPriceFilter === 'low' ? 'selected' : ''}>Below ₹50 Lakhs</option>
            <option value="mid" ${propertyPriceFilter === 'mid' ? 'selected' : ''}>₹50 Lakhs - ₹1 Crore</option>
            <option value="high" ${propertyPriceFilter === 'high' ? 'selected' : ''}>Above ₹1 Crore</option>
          </select>
        </div>
        <div style="margin-left: auto; font-size: 12px; font-weight: 700; color: var(--text-light)">
          Found ${filtered.length} property records
        </div>
      </div>

      <!-- Properties Table -->
      <div class="dashboard-card" style="padding: 24px; background: #fff;">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th style="width: 80px;">Prop ID</th>
                <th>Image</th>
                <th>Asset Details</th>
                <th>Type</th>
                <th>Listing Price</th>
                ${state.userRole !== 'Agent' ? '<th>Acq Cost</th>' : ''}
                <th>Status</th>
                <th>Owner Particulars</th>
                <th style="width: 140px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? filtered.map(p => `
                <tr id="prop-row-${p.id}">
                  <td style="font-weight: 700; color: var(--text-muted)">${p.id}</td>
                  <td>
                    <img src="${p.propertyImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop'}" style="width: 48px; height: 36px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-color)" />
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main)">${p.name}</div>
                    <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">Acq: ${p.acquisitionDate ? new Date(p.acquisitionDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                  </td>
                  <td><span class="badge info">${p.type}</span></td>
                  <td style="font-weight: 800; color: var(--primary)">${formatCurrency(p.price)}</td>
                  ${state.userRole !== 'Agent' ? `<td style="font-weight: 700; color: #7e22ce">${formatCurrency(p.purchasePrice || p.price * 0.8)}</td>` : ''}
                  <td>
                    <select class="prop-row-status-select card-filter-select" data-id="${p.id}" style="font-size: 11px; padding: 4px 6px; border-radius: 6px; border: 1px solid var(--border-color); font-weight: 700;">
                      <option value="Available" ${p.status === 'Available' ? 'selected' : ''}>Available</option>
                      <option value="Rented" ${p.status === 'Rented' ? 'selected' : ''}>Rented</option>
                      <option value="Sold" ${p.status === 'Sold' ? 'selected' : ''}>Sold</option>
                    </select>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 12.5px;">${p.ownerName || 'Independent'}</div>
                    <div style="font-size: 11px; color: var(--text-muted)">📞 ${p.ownerMobile || '999xxxxxx8'}</div>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                      ${p.status === 'Available' ? `
                        <button type="button" class="badge success prop-row-sell-trigger-btn" data-id="${p.id}" style="border: none; cursor: pointer; padding: 6px 10px; font-weight: 800;">
                          🤝 Sell
                        </button>
                      ` : ''}
                      <button type="button" class="badge danger prop-row-delete-btn" data-id="${p.id}" style="border: none; cursor: pointer; padding: 6px 10px; font-weight: 800;">
                        ✕ Remove
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="${state.userRole !== 'Agent' ? '9' : '8'}" class="table-empty-state">No matching properties found in system.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   3. Buyer Requirements View
   ============================================================================ */
function renderRequirementsView(state) {
  const query = state.searchQuery.toLowerCase();
  const filtered = state.requirements.filter(r => 
    r.buyerName.toLowerCase().includes(query) ||
    r.preferredLocation.toLowerCase().includes(query) ||
    r.propertyType.toLowerCase().includes(query)
  );

  return `
    <div style="">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main);">Buyer Requirements Registry</h2>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Track prospective buyer budgets, locations, and match available properties.</p>
        </div>
        <button type="button" class="btn btn-primary" id="req-add-new-btn">Add Buy Requirement</button>
      </div>

      <div class="dashboard-card" style="padding: 24px; background: #fff;">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Buyer Particulars</th>
                <th>Type Required</th>
                <th>Budget Range</th>
                <th>Preferred Location</th>
                <th>Area Req</th>
                <th>Status</th>
                <th style="width: 160px; text-align: center;">Matching Engine</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? filtered.map(req => `
                <tr>
                  <td style="font-weight: 700; color: var(--text-muted);">${req.id}</td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main);">${req.buyerName}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">📞 ${req.mobile}</div>
                  </td>
                  <td><span class="badge info">${req.propertyType}</span></td>
                  <td style="font-weight: 700; color: var(--primary-color);">${req.budgetRange}</td>
                  <td style="font-weight: 600;">${req.preferredLocation}</td>
                  <td style="font-family: monospace;">${req.areaRequirement}</td>
                  <td><span class="badge ${req.status === 'Open' ? 'success' : 'warning'}">${req.status}</span></td>
                  <td style="text-align: center;">
                    <button type="button" class="badge success req-row-match-trigger-btn" data-id="${req.id}" style="border: none; cursor: pointer; padding: 6px 12px; font-weight: 800; background: linear-gradient(135deg, var(--primary-color), var(--primary-light)); color: #fff;">
                      ✨ Match Deal
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="8" class="table-empty-state">No buyer requirements listed in database.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   5. Customers / Leads View
   ============================================================================ */
function renderCustomersView(state) {
  const query = state.searchQuery.toLowerCase();
  const filtered = state.leads.filter(l => 
    l.name.toLowerCase().includes(query) ||
    l.mobile.includes(query) ||
    l.requirement.toLowerCase().includes(query) ||
    l.status.toLowerCase().includes(query)
  );

  return `
    <div style="">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main);">CRM Customer Pipeline</h2>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Track new buyer leads, follow-ups, and assign relationships to agents.</p>
        </div>
        <button type="button" class="btn btn-primary" id="cust-add-new-btn">Record CRM Lead</button>
      </div>

      <div class="dashboard-card" style="padding: 24px; background: #fff;">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Customer Particulars</th>
                <th>Requirement</th>
                <th>Assigned Agent</th>
                <th>Status</th>
                <th style="width: 180px; text-align: center;">Change Agent</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? filtered.map(l => `
                <tr>
                  <td style="font-weight: 700; color: var(--text-muted);">${l.id}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${l.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
                      <div>
                        <div style="font-weight: 700; color: var(--text-main);">${l.name}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">📞 ${l.mobile}</div>
                      </div>
                    </div>
                  </td>
                  <td style="font-weight: 600;">${l.requirement}</td>
                  <td style="font-weight: 700; color: var(--primary);">${l.assignedTo || 'Unassigned'}</td>
                  <td>
                    <span class="badge ${l.status === 'New Lead' ? 'info' : l.status === 'Follow-up' ? 'warning' : 'success'}">
                      ${l.status}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; justify-content: center;">
                      <select class="crm-lead-assignee-select card-filter-select" data-id="${l.id}" style="font-size: 11.5px; padding: 4px 8px;">
                        <option value="Unassigned">Unassigned</option>
                        ${state.agents.map(a => `<option value="${a.fullName}" ${l.assignedTo === a.fullName ? 'selected' : ''}>${a.fullName}</option>`).join('')}
                      </select>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" class="table-empty-state">No CRM leads recorded in database.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   6. Site Visits View
   ============================================================================ */
function renderVisitsView(state) {
  const query = state.searchQuery.toLowerCase();
  const filtered = state.visits.filter(v => 
    v.customerName.toLowerCase().includes(query) ||
    v.propertyName.toLowerCase().includes(query) ||
    v.agentName.toLowerCase().includes(query)
  );

  return `
    <div style="">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main);">Site Visits Scheduler</h2>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Plan and audit physical site visits scheduled by customers with field agents.</p>
        </div>
        <button type="button" class="btn btn-primary" id="visit-add-new-btn">Schedule Site Visit</button>
      </div>

      <div class="dashboard-card" style="padding: 24px; background: #fff;">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Visit ID</th>
                <th>Customer Name</th>
                <th>Target Property Location</th>
                <th>Scheduled Date / Time</th>
                <th>Assigned Agent</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? filtered.map(v => `
                <tr>
                  <td style="font-weight: 700; color: var(--text-muted);">${v.id}</td>
                  <td style="font-weight: 700; color: var(--text-main);">${v.customerName}</td>
                  <td style="font-weight: 600;">${v.propertyName}</td>
                  <td style="font-weight: 700; color: var(--primary);">${new Date(v.visitDate).toLocaleString('en-IN')}</td>
                  <td style="font-weight: 700;">${v.agentName}</td>
                  <td style="font-size: 12px; color: var(--text-muted); max-width: 200px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${v.notes || 'N/A'}</td>
                  <td><span class="badge success">${v.status || 'Scheduled'}</span></td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="7" class="table-empty-state">No scheduled site visits in registry.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   7. Deals Ledger View
   ============================================================================ */
function renderDealsLedgerView(state) {
  const query = state.searchQuery.toLowerCase();
  const filtered = state.deals.filter(d => 
    d.propertyName.toLowerCase().includes(query) ||
    d.buyerName.toLowerCase().includes(query)
  );

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return `
    <div style="">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main);">Sales Deals Ledger</h2>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Review verified closed agreements, token payments and invoices.</p>
        </div>
        <button type="button" class="btn btn-primary" id="deals-console-sell-trigger-btn">Settle Sale Agreement</button>
      </div>

      <div class="dashboard-card" style="padding: 24px; background: #fff;">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Deal ID</th>
                <th>Target Asset Name</th>
                <th>Buyer Customer</th>
                <th>Booking Token</th>
                <th>Advance Paid</th>
                <th>Remaining Due</th>
                <th>Agreement Filename</th>
                <th>Comm. Earned</th>
                <th>Date Closed</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? filtered.map(d => {
                const token = parseFloat(d.tokenAmount || 0);
                const advance = parseFloat(d.advancePayment || 0);
                const remaining = parseFloat(d.finalPayment || 0);
                return `
                  <tr>
                    <td style="font-weight: 700; color: var(--text-muted);">${d.id}</td>
                    <td style="font-weight: 700; color: var(--text-main);">${d.propertyName}</td>
                    <td style="font-weight: 600;">${d.buyerName}</td>
                    <td style="font-weight: 700; color: #d97706;">${formatCurrency(token)}</td>
                    <td style="font-weight: 700; color: var(--primary);">${formatCurrency(advance)}</td>
                    <td style="font-weight: 700; color: ${remaining > 0 ? 'var(--text-muted)' : '#16a34a'};">${remaining > 0 ? formatCurrency(remaining) : 'Settled ✓'}</td>
                    <td style="font-size: 11.5px; font-family: monospace; color: var(--text-muted);">${d.agreementFile || 'Agreement_Signed.pdf'}</td>
                    <td style="font-weight: 700; color: #16a34a;">${formatCurrency(d.commissionEarned || 0)}</td>
                    <td>${d.saleDate ? new Date(d.saleDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td>
                      <button type="button" class="badge info deals-row-invoice-view-btn" data-id="${d.id}" style="border: none; cursor: pointer; padding: 6px 10px; font-weight: 800;">
                        🧾 View Bill
                      </button>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="10" class="table-empty-state">No closed sales deals in history ledger.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   8. Financial Reports View
   ============================================================================ */
function renderReportsView(state, stats) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return `
    <div style="">
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main);">Financial Reports & Audit Analytics</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Inspect corporate sales volumes, brokerage percentages and database margins.</p>
      </div>

      <div class="grid-3-cols" style="margin-bottom: 24px;">
        <!-- Card 1 -->
        <div class="dashboard-card" style="padding: 24px; background: #fff;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Total Closed Value</span>
          <h3 style="font-size: 26px; font-weight: 800; color: var(--primary); margin: 8px 0 0 0;">${formatCurrency(stats.soldSum)}</h3>
          <p style="font-size: 11.5px; color: var(--text-light); margin-top: 6px;">Total value of sold properties inside MySQL database.</p>
        </div>
        <!-- Card 2 -->
        <div class="dashboard-card" style="padding: 24px; background: #fff;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Brokerage commissions</span>
          <h3 style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 8px 0 0 0;">${formatCurrency(stats.commissionSum)}</h3>
          <p style="font-size: 11.5px; color: var(--text-light); margin-top: 6px;">Accumulated brokerage commissions splits.</p>
        </div>
        <!-- Card 3 -->
        <div class="dashboard-card" style="padding: 24px; background: #fff;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Net Acquisition Profit</span>
          <h3 style="font-size: 26px; font-weight: 800; color: #7e22ce; margin: 8px 0 0 0;">${formatCurrency(stats.profitSum)}</h3>
          <p style="font-size: 11.5px; color: var(--text-light); margin-top: 6px;">Closed deal margin (Sold Price - Acquisition Cost).</p>
        </div>
      </div>

      <!-- Detail Breakup -->
      <div class="dashboard-card" style="padding: 24px; background: #fff; margin-bottom: 24px;">
        <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 14px;">Revenue Split Audit Report</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">Corporate sales split summaries for the active season.</p>
        
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Metric Category</th>
                <th>Active Volume</th>
                <th>Monetary Value</th>
                <th>Margin Yield</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 700;">Listed Properties Inventory</td>
                <td>${state.properties.length} Listings</td>
                <td style="font-weight: 700;">${formatCurrency(state.properties.reduce((sum, p) => sum + parseFloat(p.price || 0), 0))}</td>
                <td>Asset Base</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Closed Sales Transactions</td>
                <td>${state.deals.length} Closed</td>
                <td style="font-weight: 700; color: var(--primary);">${formatCurrency(stats.soldSum)}</td>
                <td style="color: #16a34a; font-weight: 700;">+${stats.profitSum > 0 && stats.purchasedSum > 0 ? ((stats.profitSum / stats.purchasedSum) * 100).toFixed(1) : 0}% Yield</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">CRM Inquiries Pool</td>
                <td>${state.leads.length} Customer Inquiries</td>
                <td style="font-weight: 700;">N/A</td>
                <td>Pipeline Velocity</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   9. Add Property Listing Page View
   ============================================================================ */
function renderAddPropertyView(state) {
  const isManager = state.userRole === 'Manager' || state.userRole === 'Super Admin';
  const formatCurrency = (val) => val ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val) : '₹0';

  const types = [
    { val: 'House', label: 'House / Villa', icon: '🏠' },
    { val: 'Flat', label: 'Flat / Apartment', icon: '🏢' },
    { val: 'Plot', label: 'Plot / Land', icon: '⛰️' },
    { val: 'Shop', label: 'Commercial Shop', icon: '🏬' },
    { val: 'Office', label: 'Office Space', icon: '💼' }
  ];

  return `
    <div style="padding-bottom: 40px;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 28px;">
        <button type="button" id="addprop-back-btn" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #ffffff; border: 1px solid var(--border-color); color: var(--text-main); cursor: pointer; font-size: 18px;">
          ➔
        </button>
        <div>
          <span style="font-size: 11px; font-weight: 800; color: var(--primary); letter-spacing: 1px; text-transform: uppercase;">Assets Engine</span>
          <h2 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 2px;">Acquire & List New Property</h2>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1.1fr 1.6fr; gap: 32px; align-items: start;">
        <!-- Left Visual Preview -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div style="background: #ffffff; border-radius: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); overflow: hidden;">
            <div style="position: relative; height: 220px; width: 100%; background: #f1f5f9;">
              <img src="${addPropImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop'}" style="width: 100%; height: 100%; object-fit: cover;" />
              <div style="position: absolute; top: 16px; left: 16px; background: rgba(15,23,42,0.65); backdrop-filter: blur(8px); color: #fff; padding: 6px 12px; border-radius: 30px; font-size: 11px; font-weight: 700;">
                ✨ REAL-TIME PREVIEW
              </div>
              <div style="position: absolute; top: 16px; right: 16px;">
                <span class="badge success" style="padding: 6px 12px; border-radius: 8px;">${addPropStatus}</span>
              </div>
            </div>
            <div style="padding: 24px;">
              <span class="badge info">${addPropType} Listing</span>
              <h3 style="font-size: 18px; font-weight: 800; color: var(--text-main); margin-top: 12px;">${addPropName || 'e.g. Galaxy Plot No 12'}</h3>
              <div style="display: flex; align-items: baseline; gap: 4px; margin-top: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                <span style="font-size: 12px; color: var(--text-muted);">Listing Price:</span>
                <span style="font-size: 24px; font-weight: 900; color: var(--primary);">${formatCurrency(parseFloat(addPropPrice))}</span>
              </div>
              <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 10px;">
                <h4 style="font-size: 11px; font-weight: 800; color: var(--text-light); text-transform: uppercase;">Owner Details</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div style="background: var(--bg-main); padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border-color); font-size: 12px;">
                    <div style="font-size: 9px; color: var(--text-light);">NAME</div>
                    <strong>${addPropOwnerName || 'Independent Owner'}</strong>
                  </div>
                  <div style="background: var(--bg-main); padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border-color); font-size: 12px;">
                    <div style="font-size: 9px; color: var(--text-light);">CONTACT</div>
                    <strong>${addPropOwnerMobile || '999xxxxxx8'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Input Form -->
        <div style="background: #ffffff; border-radius: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-md); padding: 32px;">
          <form id="add-property-full-form" style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Type Selector -->
            <div>
              <label style="font-weight: 800; font-size: 13.5px; display: block; margin-bottom: 12px;">Select Property Category</label>
              <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
                ${types.map(t => `
                  <button type="button" class="addprop-form-type-btn" data-type="${t.val}" style="padding: 12px 6px; border-radius: 12px; border: ${addPropType === t.val ? '2px solid var(--primary)' : '1px solid var(--border-color)'}; background: ${addPropType === t.val ? 'var(--primary-light)' : '#ffffff'}; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <span style="font-size: 18px;">${t.icon}</span>
                    <span>${t.label.split(' ')[0]}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Inputs -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group" style="grid-column: 1/-1;">
                <label>Property Name / Location Address Title *</label>
                <input type="text" id="addprop-form-name" class="form-input" placeholder="e.g. Galaxy Heights Apartment Flat 301" value="${addPropName}" required />
              </div>
              <div class="form-group">
                <label>Listing Price (Market Selling Cost in ₹) *</label>
                <input type="number" id="addprop-form-price" class="form-input" placeholder="e.g. 5500000" value="${addPropPrice}" required />
              </div>
              <div class="form-group">
                <label>Initial Status Option</label>
                <select id="addprop-form-status" class="form-select">
                  <option value="Available" ${addPropStatus === 'Available' ? 'selected' : ''}>Available Listing</option>
                  <option value="Sold" ${addPropStatus === 'Sold' ? 'selected' : ''}>Sold Off-Market</option>
                  <option value="Rented" ${addPropStatus === 'Rented' ? 'selected' : ''}>Rented Lease</option>
                </select>
              </div>
            </div>

            <!-- Owner details -->
            <div style="background: rgba(37,99,235,0.02); border: 1px solid rgba(37,99,235,0.1); border-radius: 16px; padding: 20px;">
              <h4 style="color: var(--primary); font-weight: 800; margin: 0 0 14px 0; font-size: 13.5px;">🏡 Property Owner Information</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                  <label>Owner Full Name *</label>
                  <input type="text" id="addprop-form-ownername" class="form-input" placeholder="e.g. S. K. Malhotra" value="${addPropOwnerName}" required />
                </div>
                <div class="form-group">
                  <label>Owner Mobile Contact *</label>
                  <input type="text" id="addprop-form-ownermobile" class="form-input" placeholder="e.g. 9812738491" value="${addPropOwnerMobile}" required />
                </div>
              </div>
            </div>

            <!-- Manager only details -->
            ${isManager ? `
              <div style="background: rgba(126,34,206,0.02); border: 1px solid rgba(126,34,206,0.1); border-radius: 16px; padding: 20px;">
                <h4 style="color: #7e22ce; font-weight: 800; margin: 0 0 14px 0; font-size: 13.5px;">💼 Purchase Cost & Vendor Audit Details</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div class="form-group" style="grid-column: 1/-1;">
                    <label>Purchase Cost (Acquisition Price in ₹) *</label>
                    <input type="number" id="addprop-form-purchaseprice" class="form-input" placeholder="e.g. 4500000" value="${addPropPurchasePrice}" required />
                  </div>
                  <div class="form-group">
                    <label>Vendor / Seller Name *</label>
                    <input type="text" id="addprop-form-vendor" class="form-input" placeholder="e.g. Horizon Builders" value="${addPropVendorName}" required />
                  </div>
                  <div class="form-group">
                    <label>Acquisition Purchase Date *</label>
                    <input type="date" id="addprop-form-acquisitiondate" class="form-input" value="${addPropAcquisitionDate}" required />
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Visual Link and upload -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Display Photo Upload</label>
                <div id="addprop-form-upload-trigger" style="border: 2px dashed var(--border-color); border-radius: 12px; padding: 16px; text-align: center; background: rgba(37,99,235,0.02); cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 100px;">
                  <span>📷</span>
                  <span style="font-size: 11.5px; font-weight: 700; color: var(--text-main);">Click to upload image</span>
                  <span style="font-size: 9px; color: var(--text-light);">Max limit 2MB</span>
                </div>
                <input type="file" id="addprop-form-file-input" accept="image/*" style="display: none;" />
              </div>
              <div class="form-group">
                <label>Or Paste Image Web URL</label>
                <input type="text" id="addprop-form-imageurl" class="form-input" placeholder="https://images.unsplash.com/..." value="${addPropImage.startsWith('data:image') ? '' : addPropImage}" style="margin-top: 14px;" />
              </div>
            </div>

            <!-- Form Actions -->
            <div style="display: flex; justify-content: flex-end; gap: 14px; border-top: 1px solid var(--border-color); padding-top: 20px;">
              <button type="button" class="btn btn-secondary" id="addprop-cancel-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">✨ Buy & List Property</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   10. System Settings View
   ============================================================================ */
function renderSettingsView(state) {
  return `
    <div style="padding-bottom: 40px;">
      <div style="background: #ffffff; border-radius: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 32px;">
        <h3 style="font-size: 16.5px; font-weight: 800; color: var(--text-main); margin-bottom: 18px;">🛠️ Kaira Deal ERP System Configuration</h3>
        
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Setting 1 -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
            <div>
              <strong style="font-size: 13.5px; color: var(--text-main); display: block;">Real-Time MySQL Synchronizer</strong>
              <span style="font-size: 11.5px; color: var(--text-muted);">Sync inventory data dynamically across terminal portals.</span>
            </div>
            <div>
              <span class="badge ${state.isServerActive ? 'success' : 'danger'}" style="padding: 6px 12px; font-size: 11px; font-weight: 800;">
                ${state.isServerActive ? 'ONLINE & ACTIVE' : 'OFFLINE / BACKUP MODE'}
              </span>
            </div>
          </div>

          <!-- Setting 2 -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
            <div>
              <strong style="font-size: 13.5px; color: var(--text-main); display: block;">WhatsApp Security dispatch Dispatcher</strong>
              <span style="font-size: 11.5px; color: var(--text-muted);">Simulate WhatsApp dispatching codes for security OTP resets.</span>
            </div>
            <div>
              <span class="badge success" style="padding: 6px 12px; font-size: 11px; font-weight: 800;">ACTIVE</span>
            </div>
          </div>

          <!-- Setting 3 -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 13.5px; color: var(--text-main); display: block;">Authorized Administrator Role Controls</strong>
              <span style="font-size: 11.5px; color: var(--text-muted);">Enforce separate dashboard metrics for Super Admins, Managers and Agents.</span>
            </div>
            <div>
              <span class="badge info" style="padding: 6px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase;">${state.userRole} ENABLED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   11. Settle Sale Agreement / Settle Deal Form Page
   ============================================================================ */
function renderSellPropertyViewForm(state) {
  const property = state.selectedPropertyToSell;
  const isManager = state.userRole === 'Manager' || state.userRole === 'Super Admin';
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  
  const matchedProperty = property || state.properties.find(p => p.id === sellPropId);
  const acquisitionCost = matchedProperty ? parseFloat(matchedProperty.purchasePrice || matchedProperty.price * 0.8) : 0;
  
  // Real-time calculations
  const parsedSoldPrice = parseFloat(sellSoldPrice || 0);
  const parsedToken = parseFloat(sellTokenAmount || 0);
  const parsedAdvance = parseFloat(sellAdvancePayment || 0);
  const remainderBalance = Math.max(parsedSoldPrice - parsedToken - parsedAdvance, 0);

  const profitMargin = parsedSoldPrice - acquisitionCost;
  const profitPercentage = acquisitionCost > 0 ? (profitMargin / acquisitionCost) * 100 : 0;
  
  const parsedCommPercent = parseFloat(sellCommissionPercent || 0);
  const calculatedCommission = parsedSoldPrice * (parsedCommPercent / 100);

  // Splits percentages for bar visualization
  const tokenPercentage = parsedSoldPrice > 0 ? (parsedToken / parsedSoldPrice) * 100 : 0;
  const advancePercentage = parsedSoldPrice > 0 ? (parsedAdvance / parsedSoldPrice) * 100 : 0;
  const balancePercentage = parsedSoldPrice > 0 ? (remainderBalance / parsedSoldPrice) * 100 : 100;

  const availableProps = state.properties.filter(p => p.status === 'Available');

  return `
    <div style="padding-bottom: 40px;">
      
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 28px;">
        <button type="button" id="sellprop-back-btn" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #ffffff; border: 1px solid var(--border-color); color: var(--text-main); cursor: pointer; font-size: 18px;">
          ➔
        </button>
        <div>
          <span style="font-size: 11px; font-weight: 800; color: var(--primary); letter-spacing: 1px; text-transform: uppercase;">Billing Hub</span>
          <h2 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 2px;">Close Property Sale Deal</h2>
        </div>
      </div>

      ${matchedProperty ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; background: #ffffff; border: 1px solid var(--border-color); border-radius: 16px; padding: 16px 24px; box-shadow: var(--shadow-sm); margin-bottom: 24px;">
          <div>
            <span style="font-size: 10px; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Target Asset</span>
            <div style="font-size: 14px; font-weight: 800; color: var(--text-main); margin-top: 2px;">${matchedProperty.name}</div>
            <div style="font-size: 11px; color: var(--text-muted);">ID: ${matchedProperty.id} • ${matchedProperty.type}</div>
          </div>
          <div>
            <span style="font-size: 10px; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Original Listing Price</span>
            <div style="font-size: 15px; font-weight: 800; color: var(--primary); margin-top: 2px;">${formatCurrency(matchedProperty.price)}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Baseline Market Val</div>
          </div>
          ${isManager ? `
            <div>
              <span style="font-size: 10px; color: var(--text-light); font-weight: 700; text-transform: uppercase;">ERP Acquisition Cost</span>
              <div style="font-size: 15px; font-weight: 800; color: #7e22ce; margin-top: 2px;">${formatCurrency(acquisitionCost)}</div>
              <div style="font-size: 11px; color: var(--text-muted);">Bought from ${matchedProperty.vendorName || 'Independent Owner'}</div>
            </div>
          ` : ''}
          <div>
            <span style="font-size: 10px; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Listing Status</span>
            <div style="margin-top: 4px;">
              <span class="badge success" style="text-transform: uppercase; font-size: 9px; font-weight: 800;">Available for closure</span>
            </div>
          </div>
        </div>
      ` : ''}

      <div style="display: grid; grid-template-columns: 1.5fr 1.1fr; gap: 32px; align-items: start;">
        <!-- Left Input Form -->
        <div style="background: #ffffff; border-radius: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-md); padding: 32px;">
          <form id="sell-property-full-form" style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Asset Selection -->
            <div>
              <label style="font-weight: 800; font-size: 13.5px; display: block; margin-bottom: 12px;">Select Property Listing</label>
              ${property ? `
                <div style="padding: 12px 16px; background: var(--bg-main); border-radius: 12px; font-weight: 700; font-size: 13.5px; border: 1px solid var(--border-color); color: var(--text-main);">
                  ${property.id} — ${property.name} (${property.type})
                </div>
              ` : `
                <select id="sellform-property-select" class="form-select" style="height: 42px; padding: 10px 14px; border-radius: 10px; border: 2px solid var(--primary); background: #fff; width: 100%; font-weight: 700;">
                  <option value="">-- Choose Available Property --</option>
                  ${availableProps.map(p => `
                    <option value="${p.id}" ${sellPropId === p.id ? 'selected' : ''}>${p.id} — ${p.name} (${p.type}) | Price: ₹${new Intl.NumberFormat('en-IN').format(p.price)}</option>
                  `).join('')}
                </select>
              `}
            </div>

            <!-- Buyer Details -->
            <div>
              <label style="font-weight: 800; font-size: 13.5px; display: block; margin-bottom: 12px;">Buyer & Sale Details</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group" style="grid-column: 1/-1;">
                  <label>Buyer Name *</label>
                  <input type="text" id="sellform-buyer-name" list="leads-list-sellform" class="form-input" placeholder="e.g. Rahul Sharma" value="${sellBuyerName}" required />
                  <datalist id="leads-list-sellform">
                    ${state.leads.map(l => `<option value="${l.name}" />`).join('')}
                  </datalist>
                </div>
                <div class="form-group">
                  <label>Final Closing Sold Price (₹) *</label>
                  <input type="number" id="sellform-sold-price" class="form-input" placeholder="e.g. 5200000" value="${sellSoldPrice}" required />
                </div>
                <div class="form-group">
                  <label>Deal Closing Date</label>
                  <input type="date" id="sellform-sale-date" class="form-input" value="${sellSaleDate}" required />
                </div>
              </div>
            </div>

            <!-- Payment splits -->
            <div style="background: rgba(217, 119, 6, 0.02); border: 1px solid rgba(217, 119, 6, 0.12); border-radius: 16px; padding: 24px;">
              <h4 style="color: #d97706; font-weight: 800; margin: 0 0 16px 0; font-size: 13.5px;">💰 Deal Ledger Payment Splits</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div class="form-group">
                  <label>Token Amount (₹) *</label>
                  <input type="number" id="sellform-token" class="form-input" placeholder="e.g. 50000" value="${sellTokenAmount}" required />
                </div>
                <div class="form-group">
                  <label>Advance Payment Paid (₹) *</label>
                  <input type="number" id="sellform-advance" class="form-input" placeholder="e.g. 150000" value="${sellAdvancePayment}" required />
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 16px;">
                <div class="form-group">
                  <label>Commission Split % *</label>
                  <input type="number" step="0.1" id="sellform-comm-pct" class="form-input" value="${sellCommissionPercent}" required />
                </div>
                <div class="form-group">
                  <label>Agreement Filename</label>
                  <input type="text" id="sellform-agreement-file" class="form-input" value="${sellAgreementFile}" required />
                </div>
              </div>
            </div>

            <!-- Mode Selection -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Payment Mode *</label>
                <select id="sellform-payment-method" class="form-select">
                  <option value="Cash" ${sellPaymentMethod === 'Cash' ? 'selected' : ''}>Cash Settlement</option>
                  <option value="UPI / NetBanking" ${sellPaymentMethod === 'UPI / NetBanking' ? 'selected' : ''}>UPI / NetBanking</option>
                  <option value="Bank Wire Transfer" ${sellPaymentMethod === 'Bank Wire Transfer' ? 'selected' : ''}>Bank Wire (NEFT/RTGS)</option>
                  <option value="Cheque / DD" ${sellPaymentMethod === 'Cheque / DD' ? 'selected' : ''}>Cheque / Demand Draft</option>
                  <option value="Home Loan / Financing" ${sellPaymentMethod === 'Home Loan / Financing' ? 'selected' : ''}>Home Loan / Bank Financing</option>
                </select>
              </div>
              <div class="form-group">
                <label>Payment Ref / Receipt Details</label>
                <input type="text" id="sellform-payment-details" class="form-input" placeholder="e.g. UPI ID or Chq No" value="${sellPaymentDetails}" />
              </div>
            </div>

            <!-- Submit -->
            <div style="display: flex; justify-content: flex-end; gap: 14px; border-top: 1px solid var(--border-color); padding-top: 20px;">
              <button type="button" class="btn btn-secondary" id="sellform-cancel-btn">Cancel</button>
              <button type="submit" class="btn btn-primary" style="background: var(--danger-text);">Confirm Property Sale & Bill</button>
            </div>
          </form>
        </div>

        <!-- Right Column Financial details -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div style="background: #ffffff; border-radius: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); padding: 28px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin: 0;">📊 Deal Profit & Financial Analytics</h3>

            ${isManager && matchedProperty ? `
              <div style="background: ${profitMargin > 0 ? 'rgba(22, 163, 74, 0.03)' : 'rgba(239, 68, 68, 0.03)'}; border: 1px solid ${profitMargin > 0 ? 'rgba(22, 163, 74, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; font-weight: 800; color: ${profitMargin > 0 ? '#16a34a' : '#ef4444'}">
                    ${profitMargin > 0 ? '🎉 PROFITABLE DEAL CLOSING' : '⚠️ NEGATIVE MARGIN ALERT'}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <span style="font-size: 10px; color: var(--text-light);">ESTIMATED GROSS PROFIT</span>
                  <span style="font-size: 28px; font-weight: 900; color: ${profitMargin > 0 ? '#15803d' : '#b91c1c'}">${formatCurrency(profitMargin)}</span>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); border-top: 1px dashed rgba(0,0,0,0.05); padding-top: 8px;">
                  Return on Cost: <strong style="color: ${profitMargin > 0 ? '#16a34a' : '#ef4444'}">${profitPercentage.toFixed(1)}%</strong>
                </div>
              </div>
            ` : ''}

            <!-- Commission Yield -->
            <div style="background: rgba(37, 99, 235, 0.03); border: 1px solid rgba(37, 99, 235, 0.15); border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 10px; color: var(--primary); font-weight: 800;">COMMISSION EARNED</div>
                <div style="font-size: 20px; font-weight: 850; color: var(--text-main); margin-top: 4px;">${formatCurrency(calculatedCommission)}</div>
              </div>
              <div style="background: var(--primary); color: #fff; font-size: 11px; font-weight: 850; padding: 4px 10px; border-radius: 6px;">
                ${parsedCommPercent.toFixed(1)}% Yield
              </div>
            </div>

            <!-- Stacked bar breakdowns -->
            <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 20px;">
              <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted);">Payment Settlement Breakdown</span>
              <div style="height: 14px; border-radius: 7px; background: #f1f5f9; display: flex; overflow: hidden; margin-top: 6px;">
                ${parsedToken > 0 ? `<div style="width: ${tokenPercentage}%; background: #d97706; height: 100%;"></div>` : ''}
                ${parsedAdvance > 0 ? `<div style="width: ${advancePercentage}%; background: #2563eb; height: 100%;"></div>` : ''}
                ${remainderBalance > 0 ? `<div style="width: ${balancePercentage}%; background: #e2e8f0; height: 100%;"></div>` : ''}
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span>Token Amount:</span>
                  <strong>${formatCurrency(parsedToken)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span>Advance Payment:</span>
                  <strong>${formatCurrency(parsedAdvance)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                  <span>Remaining Balance:</span>
                  <strong style="color: ${remainderBalance > 0 ? 'var(--primary)' : '#16a34a'}">${remainderBalance > 0 ? formatCurrency(remainderBalance) : 'Fully Settled ✓'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px;">
                  <strong>Total Settlement:</strong>
                  <strong>${formatCurrency(parsedSoldPrice)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSellPropertyView(state) {
  // Toggle between Available listings screen and closure details screen
  if (state.selectedPropertyToSell) {
    return renderSellPropertyViewForm(state);
  } else {
    // Default list of listings
    return renderSellPropertyViewList(state);
  }
}

function renderSellPropertyViewList(state) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const availableProps = state.properties.filter(p => p.status === 'Available');

  return `
    <div style="">
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main);">Sell Property Module</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Close deals on available property listings, upload agreement contracts and manage token splits.</p>
      </div>

      <div class="dashboard-grid" style="grid-template-columns: 1fr;">
        <div class="dashboard-card" style="padding: 24px; background: #fff;">
          <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 14px;">Available Listings For Sale</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">Select any available asset listed below to close a deal and generate a paid customer invoice.</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            ${availableProps.length > 0 ? availableProps.map(p => `
              <div style="padding: 16px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-light); display: flex; flex-direction: column; gap: 10px; box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h4 style="font-weight: 800; color: var(--text-main); margin: 0;">${p.name}</h4>
                    <span style="font-size: 11px; color: var(--text-muted);">ID: ${p.id} | Type: ${p.type}</span>
                  </div>
                  <span class="badge success">Available</span>
                </div>
                <div style="font-size: 12.5px; color: var(--text-muted);">
                  Listing Price: <strong style="color: var(--primary-color); font-size: 14px;">${formatCurrency(p.price)}</strong>
                </div>
                ${p.ownerName ? `
                  <div style="font-size: 11px; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    Owner: <strong>${p.ownerName}</strong> (${p.ownerMobile})
                  </div>
                ` : ''}
                <button type="button" class="btn btn-primary qa-sell-btn-selector" data-id="${p.id}" style="width: 100%; margin-top: 10px;">
                  Close Sale Deal
                </button>
              </div>
            `).join('') : `
              <div style="grid-column: 1 / -1; text-align: center; padding: 40px;" class="table-empty-state">
                No properties currently available for sale. List some properties first!
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   Floating Modals Code (Add Property, Add Customer, Schedule Visit, etc.)
   ============================================================================ */

function renderAddPropertyModal(state) {
  if (!propertyModalOpen) return '';
  const isManager = state.userRole === 'Manager' || state.userRole === 'Super Admin';

  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div class="modal-container" style="max-width: 480px; width: 90%; background: #fff; padding: 24px; border-radius: 16px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <h3 style="margin: 0;">Buy & List Property</h3>
          <button type="button" id="modal-addprop-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <form id="modal-addprop-form">
          <div class="modal-body" style="padding: 16px 0; display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label>Property Name / Address Title *</label>
              <input type="text" id="modalprop-name" class="form-input" placeholder="e.g. Sunset Heights Sec 14" value="${addPropName}" required />
            </div>

            <div class="form-group">
              <label>Property Type</label>
              <select id="modalprop-type" class="form-select">
                <option value="House" ${addPropType === 'House' ? 'selected' : ''}>House / Villa</option>
                <option value="Flat" ${addPropType === 'Flat' ? 'selected' : ''}>Flat / Apartment</option>
                <option value="Plot" ${addPropType === 'Plot' ? 'selected' : ''}>Plot / Land</option>
                <option value="Shop" ${addPropType === 'Shop' ? 'selected' : ''}>Commercial Shop</option>
                <option value="Office" ${addPropType === 'Office' ? 'selected' : ''}>Office Space</option>
              </select>
            </div>

            <div class="form-group" style="padding: 10px; background: rgba(37,99,235,0.04); border: 1px solid rgba(37,99,235,0.1); border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; font-size: 12.5px; color: var(--primary);">🏡 Property Owner details</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>
                  <label style="font-size: 11px;">Owner Name</label>
                  <input type="text" id="modalprop-ownername" class="form-input" value="${addPropOwnerName}" required />
                </div>
                <div>
                  <label style="font-size: 11px;">Owner Mobile</label>
                  <input type="text" id="modalprop-ownermobile" class="form-input" value="${addPropOwnerMobile}" required />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Listing Price (Selling price in ₹) *</label>
              <input type="number" id="modalprop-price" class="form-input" value="${addPropPrice}" required />
            </div>

            ${isManager ? `
              <div class="form-group">
                <label>Acquisition purchase price (₹) *</label>
                <input type="number" id="modalprop-purchaseprice" class="form-input" value="${addPropPurchasePrice}" required />
              </div>
              <div class="form-group">
                <label>Vendor / Seller Name *</label>
                <input type="text" id="modalprop-vendor" class="form-input" value="${addPropVendorName}" required />
              </div>
              <div class="form-group">
                <label>Acquisition Date *</label>
                <input type="date" id="modalprop-acqdate" class="form-input" value="${addPropAcquisitionDate}" required />
              </div>
            ` : ''}
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 14px;">
            <button type="button" class="btn btn-secondary" id="modal-addprop-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Save & List</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAddCustomerModal(state) {
  if (!customerModalOpen) return '';

  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div class="modal-container" style="max-width: 420px; width: 90%; background: #fff; padding: 24px; border-radius: 16px;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <h3 style="margin: 0;">Add Customer / Lead</h3>
          <button type="button" id="modal-addcust-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <form id="modal-addcust-form">
          <div class="modal-body" style="padding: 16px 0; display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label>Customer Name *</label>
              <input type="text" id="modalcust-name" class="form-input" placeholder="e.g. Rahul Sharma" value="${addCustName}" required />
            </div>
            <div class="form-group">
              <label>Mobile Number *</label>
              <input type="text" id="modalcust-mobile" class="form-input" placeholder="e.g. 9812345678" value="${addCustMobile}" required />
            </div>
            <div class="form-group">
              <label>Requirement Type</label>
              <select id="modalcust-req" class="form-select">
                <option value="2BHK Flat" ${addCustRequirement === '2BHK Flat' ? 'selected' : ''}>2BHK Flat</option>
                <option value="3BHK Flat" ${addCustRequirement === '3BHK Flat' ? 'selected' : ''}>3BHK Flat</option>
                <option value="House" ${addCustRequirement === 'House' ? 'selected' : ''}>House</option>
                <option value="Plot" ${addCustRequirement === 'Plot' ? 'selected' : ''}>Plot / Land</option>
                <option value="Shop" ${addCustRequirement === 'Shop' ? 'selected' : ''}>Shop</option>
                <option value="Office Space" ${addCustRequirement === 'Office Space' ? 'selected' : ''}>Office Space</option>
              </select>
            </div>
            <div class="form-group">
              <label>Lead Status</label>
              <select id="modalcust-status" class="form-select">
                <option value="New Lead" ${addCustStatus === 'New Lead' ? 'selected' : ''}>New Lead</option>
                <option value="Follow-up" ${addCustStatus === 'Follow-up' ? 'selected' : ''}>Follow-up</option>
                <option value="Interested" ${addCustStatus === 'Interested' ? 'selected' : ''}>Interested</option>
              </select>
            </div>
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 14px;">
            <button type="button" class="btn btn-secondary" id="modal-addcust-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Customer</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAddVisitModal(state) {
  if (!visitModalOpen) return '';

  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div class="modal-container" style="max-width: 440px; width: 90%; background: #fff; padding: 24px; border-radius: 16px;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <h3 style="margin: 0;">Schedule Site Visit</h3>
          <button type="button" id="modal-addvisit-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <form id="modal-addvisit-form">
          <div class="modal-body" style="padding: 16px 0; display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label>Customer Name *</label>
              <input type="text" id="modalvisit-cust" class="form-input" placeholder="e.g. Rahul Sharma" value="${addVisitCustomerName}" required />
            </div>
            <div class="form-group">
              <label>Target Property Name *</label>
              <input type="text" id="modalvisit-prop" class="form-input" placeholder="e.g. Galaxy Villa" value="${addVisitPropertyName}" required />
            </div>
            <div class="form-group">
              <label>Scheduled Date & Time *</label>
              <input type="datetime-local" id="modalvisit-date" class="form-input" value="${addVisitDate}" required />
            </div>
            <div class="form-group">
              <label>Assigned Agent *</label>
              <select id="modalvisit-agent" class="form-select">
                <option value="">-- Choose Agent --</option>
                ${state.agents.map(a => `<option value="${a.fullName}" ${addVisitAgentName === a.fullName ? 'selected' : ''}>${a.fullName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Inquiry/Meeting Notes</label>
              <textarea id="modalvisit-notes" class="form-input" style="height: 60px;" placeholder="Details about specific requirements...">${addVisitNotes}</textarea>
            </div>
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 14px;">
            <button type="button" class="btn btn-secondary" id="modal-addvisit-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Schedule Visit</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAddReqModal(state) {
  if (!reqModalOpen) return '';

  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div class="modal-container" style="max-width: 440px; width: 90%; background: #fff; padding: 24px; border-radius: 16px;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <h3 style="margin: 0;">Add Buyer Requirement</h3>
          <button type="button" id="modal-addreq-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <form id="modal-addreq-form">
          <div class="modal-body" style="padding: 16px 0; display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label>Buyer Name *</label>
              <input type="text" id="modalreq-buyer" class="form-input" placeholder="e.g. Neha Gupta" value="${addReqBuyerName}" required />
            </div>
            <div class="form-group">
              <label>Mobile Number *</label>
              <input type="text" id="modalreq-mobile" class="form-input" placeholder="e.g. 9777777777" value="${addReqMobile}" required />
            </div>
            <div class="form-group">
              <label>Budget Range *</label>
              <select id="modalreq-budget" class="form-select">
                <option value="₹20L - ₹40L" ${addReqBudgetRange === '₹20L - ₹40L' ? 'selected' : ''}>₹20L - ₹40L</option>
                <option value="₹40L - ₹75L" ${addReqBudgetRange === '₹40L - ₹75L' ? 'selected' : ''}>₹40L - ₹75L</option>
                <option value="₹75L - ₹1.5Cr" ${addReqBudgetRange === '₹75L - ₹1.5Cr' ? 'selected' : ''}>₹75L - ₹1.5Cr</option>
                <option value="₹1.5Cr - ₹3Cr" ${addReqBudgetRange === '₹1.5Cr - ₹3Cr' ? 'selected' : ''}>₹1.5Cr - ₹3Cr</option>
              </select>
            </div>
            <div class="form-group">
              <label>Property Type Required *</label>
              <select id="modalreq-type" class="form-select">
                <option value="House" ${addReqPropertyType === 'House' ? 'selected' : ''}>House / Villa</option>
                <option value="Flat" ${addReqPropertyType === 'Flat' ? 'selected' : ''}>Flat / Apartment</option>
                <option value="Plot" ${addReqPropertyType === 'Plot' ? 'selected' : ''}>Plot / Land</option>
                <option value="Shop" ${addReqPropertyType === 'Shop' ? 'selected' : ''}>Commercial Shop</option>
              </select>
            </div>
            <div class="form-group">
              <label>Preferred Location *</label>
              <input type="text" id="modalreq-loc" class="form-input" placeholder="e.g. Galaxy Heights" value="${addReqPreferredLocation}" required />
            </div>
            <div class="form-group">
              <label>Area Requirement *</label>
              <input type="text" id="modalreq-area" class="form-input" placeholder="e.g. 1500 sqft" value="${addReqArea}" required />
            </div>
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 14px;">
            <button type="button" class="btn btn-secondary" id="modal-addreq-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Requirement</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderInvoiceModal(state) {
  if (!invoiceModalOpen || !state.generatedInvoiceData) return '';
  const d = state.generatedInvoiceData;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 99999;">
      <div class="modal-container" style="max-width: 600px; width: 90%; background: rgba(255,255,255,0.98); padding: 24px; border-radius: 16px; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <h3 style="margin: 0;">🧾 Closed Sales Invoice</h3>
          <button type="button" id="modal-invoice-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>

        <div class="modal-body" style="padding: 16px 0;">
          <div id="printable-invoice-sheet" style="font-family: sans-serif; padding: 10px; color: #1e293b;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
              <div>
                <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0;">Kaira Deal</h2>
                <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">Authorized Billing Console</p>
              </div>
              <div style="border: 3px solid #16a34a; color: #16a34a; font-weight: 800; padding: 6px 14px; border-radius: 6px; text-transform: uppercase; font-size: 14px; transform: rotate(-5deg); opacity: 0.85;">
                PAID & CLOSED
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <div>
                <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Invoice Details</div>
                <div style="font-weight: 700; font-size: 13px; margin-top: 4px;">${d.invoiceId}</div>
                <div style="font-size: 11px; color: #64748b;">Date: ${d.invoiceDate}</div>
              </div>
              <div>
                <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Buyer Particulars</div>
                <div style="font-weight: 700; font-size: 13px; margin-top: 4px;">${d.buyerName}</div>
                <div style="font-size: 11px; color: #64748b;">Kaira Deal Customer</div>
              </div>
            </div>

            ${d.vendorName ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: rgba(126, 34, 206, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(126, 34, 206, 0.15); margin-bottom: 20px;">
                <div>
                  <div style="font-size: 10px; color: #7e22ce; text-transform: uppercase; font-weight: 600;">Vendor / Seller Name</div>
                  <div style="font-weight: 700; font-size: 13px; margin-top: 4px; color: #581c87;">${d.vendorName}</div>
                </div>
                <div>
                  <div style="font-size: 10px; color: #7e22ce; text-transform: uppercase; font-weight: 600;">Acquisition Date</div>
                  <div style="font-weight: 700; font-size: 13px; margin-top: 4px; color: #581c87;">${d.acquisitionDate ? new Date(d.acquisitionDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                </div>
              </div>
            ` : ''}

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: rgba(22, 163, 74, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(22,163,74,0.15); margin-bottom: 20px;">
              <div>
                <div style="font-size: 10px; color: #16a34a; text-transform: uppercase; font-weight: 700;">💳 Payment Mode</div>
                <div style="font-weight: 700; font-size: 13px; margin-top: 4px; color: #15803d;">${d.paymentMethod}</div>
              </div>
              <div>
                <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Transaction Reference</div>
                <div style="font-weight: 700; font-size: 12px; font-family: monospace; margin-top: 4px;">${d.paymentDetails || 'Settled Direct'}</div>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Property Particulars</h4>
              <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 700; color: #0f172a; font-size: 13.5px;">${d.propertyName}</div>
                  <div style="font-size: 11px; color: #64748b;">ID: ${d.propertyId} | Type: ${d.propertyType}</div>
                </div>
                <span class="badge info">${d.propertyType}</span>
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #e2e8f0;">
                  <th style="text-align: left; padding: 8px 0; font-size: 11px; color: #64748b; text-transform: uppercase;">Financial Ledger</th>
                  <th style="text-align: right; padding: 8px 0; font-size: 11px; color: #64748b; text-transform: uppercase;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-size: 13px; color: #475569;">Token Amount Paid</td>
                  <td style="padding: 10px 0; font-size: 13px; text-align: right; font-weight: 600;">${formatCurrency(d.tokenAmount)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-size: 13px; color: #475569;">Advance Payment Settled</td>
                  <td style="padding: 10px 0; font-size: 13px; text-align: right; font-weight: 600;">${formatCurrency(d.advancePayment)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-size: 13px; color: #475569;">Remaining Balance Paid</td>
                  <td style="padding: 10px 0; font-size: 13px; text-align: right; font-weight: 600;">${formatCurrency(d.finalPayment)}</td>
                </tr>
                <tr style="border-bottom: 2px solid #e2e8f0; background: rgba(22, 163, 74, 0.03);">
                  <td style="padding: 12px 10px; font-size: 13.5px; font-weight: 700;">Total Final Closing price</td>
                  <td style="padding: 12px 10px; font-size: 15px; text-align: right; font-weight: 800;">${formatCurrency(d.soldPrice)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 14px;">
          <button type="button" class="btn btn-secondary" id="modal-invoice-cancel-btn">Close</button>
          <button type="button" class="btn btn-primary" id="modal-invoice-print-btn">🖨️ Print Invoice</button>
        </div>
      </div>
    </div>
  `;
}

function renderAvatarModal(state) {
  if (!avatarModalOpen) return '';

  const PRESET_AVATARS = [
    "kaira_logo.svg",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
  ];

  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 99999;">
      <div class="modal-container" style="max-width: 400px; width: 90%; background: #fff; padding: 24px; border-radius: 16px;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <h3 style="margin: 0;">📷 Update Profile Picture</h3>
          <button type="button" id="modal-avatar-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>

        <div class="modal-body" style="padding: 16px 0; display: flex; flex-direction: column; gap: 14px;">
          <label style="font-size: 12px; font-weight: 800; color: var(--text-muted);">Choose Preset Avatar</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
            ${PRESET_AVATARS.map((preset, index) => `
              <div class="avatar-preset-select-btn" data-url="${preset}" style="position: relative; height: 80px; border-radius: 12px; overflow: hidden; cursor: pointer; border: ${selectedAvatar === preset ? '3px solid var(--primary)' : '2px solid transparent'};">
                <img src="${preset}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            `).join('')}
          </div>

          <div style="border-top: 1px dashed var(--border-color); padding-top: 14px;">
            <label style="font-size: 11px; display: block; margin-bottom: 6px;">Or Paste Image URL</label>
            <input type="text" id="avatar-custom-url-input" class="form-input" placeholder="https://..." value="${customAvatarUrl}" />
          </div>

          <div style="border-top: 1px dashed var(--border-color); padding-top: 14px;">
            <label style="font-size: 11px; display: block; margin-bottom: 6px;">Or Upload local photo</label>
            <input type="file" id="avatar-local-file-input" accept="image/*" />
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 14px;">
          <button type="button" class="btn btn-secondary" id="modal-avatar-cancel-btn">Cancel</button>
          <button type="button" class="btn btn-primary" id="modal-avatar-save-btn">${savingAvatar ? 'Saving...' : 'Save Picture'}</button>
        </div>
      </div>
    </div>
  `;
}

function renderMatchingDrawer(state) {
  if (!matchingDrawerOpen || !selectedReq) return '';

  const getMatchingProperties = (req) => {
    if (!req) return [];
    return state.properties.filter(p => 
      p.status === 'Available' &&
      p.type.toLowerCase() === req.propertyType.toLowerCase() &&
      (p.name.toLowerCase().includes(req.preferredLocation.toLowerCase()) || 
       req.preferredLocation.toLowerCase().includes(p.name.toLowerCase()) ||
       p.type.toLowerCase().includes(req.preferredLocation.toLowerCase()))
    );
  };

  const matches = getMatchingProperties(selectedReq);
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return `
    <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 99999;">
      <div class="modal-container" style="max-width: 500px; width: 90%; background: #fff; padding: 24px; border-radius: 16px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>🎯</span> Recommended Matches
          </h3>
          <button type="button" id="modal-matching-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
        </div>

        <div class="modal-body" style="padding: 16px 0;">
          <div style="background: var(--bg-light); padding: 14px; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0;">Buyer: ${selectedReq.buyerName}</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: var(--text-muted);">
              <div>Category: <strong>${selectedReq.propertyType}</strong></div>
              <div>Budget: <strong>${selectedReq.budgetRange}</strong></div>
              <div>Location: <strong>${selectedReq.preferredLocation}</strong></div>
              <div>Area: <strong>${selectedReq.areaRequirement}</strong></div>
            </div>
          </div>

          <h4 style="font-size: 13px; text-transform: uppercase; margin-bottom: 12px;">Matched Listings (${matches.length})</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${matches.length > 0 ? matches.map(prop => `
              <div style="padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${prop.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">ID: ${prop.id} | Listing Val: ${formatCurrency(prop.price)}</div>
                </div>
                <button type="button" class="btn btn-primary matching-row-send-rec-btn" data-buyer="${selectedReq.buyerName}" data-prop="${prop.name}" style="padding: 6px 12px; font-size: 11px;">
                  Recommend
                </button>
              </div>
            `).join('') : `
              <div style="text-align: center; padding: 30px; background: var(--bg-light); border-radius: 12px; border: 1px dashed var(--border-color); font-size: 12.5px; color: var(--text-muted);">
                No matching properties found.
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   Event Binding Actions
   ============================================================================ */

export function bindPropertyEvents() {
  const state = AppState;

  // Sidebar Tab Switch
  const tabs = ['dashboard', 'sell_property_deal', 'deals', 'properties', 'customers', 'requirements', 'visits', 'reports', 'settings'];
  tabs.forEach(tabId => {
    const el = document.getElementById(`sidebar-tab-${tabId}`);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        state.activeTab = tabId;
        state.sidebarOpen = false;
        renderApp();
      });
    }
  });

  // Logout trigger
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Reset authenticated states
      localStorage.removeItem('propdeal_auth');
      localStorage.removeItem('propdeal_user_id');
      localStorage.removeItem('propdeal_user_name');
      localStorage.removeItem('propdeal_user_role');
      localStorage.removeItem('propdeal_user_avatar');

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
  const hamToggle = document.getElementById('hamburger-menu-toggle');
  if (hamToggle) {
    hamToggle.addEventListener('click', () => {
      state.sidebarOpen = !state.sidebarOpen;
      renderApp();
    });
  }

  // Global search typing listener
  const searchInput = document.getElementById('header-global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
    });
  }

  // Header Bell Dropdown toggler
  const bellBtn = document.getElementById('notif-bell-btn');
  if (bellBtn) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationsOpen = !notificationsOpen;
      profileMenuOpen = false;
      renderApp();
    });
  }

  // Header Profile Dropdown toggler
  const profileTrigger = document.getElementById('header-profile-dropdown-trigger');
  if (profileTrigger) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenuOpen = !profileMenuOpen;
      notificationsOpen = false;
      renderApp();
    });
  }

  // Sign out from header
  const signOutBtn = document.getElementById('header-signout-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      logoutBtn.click();
    });
  }

  // Open profile edit pic modal
  const editProfileBtn = document.getElementById('header-edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedAvatar = state.userAvatar;
      customAvatarUrl = '';
      avatarModalOpen = true;
      profileMenuOpen = false;
      renderApp();
    });
  }

  // Close dropdowns on body click
  document.addEventListener('click', () => {
    if (notificationsOpen || profileMenuOpen) {
      notificationsOpen = false;
      profileMenuOpen = false;
      renderApp();
    }
  });

  /* --- Dashboard Tab Events --- */
  if (state.activeTab === 'dashboard') {
    // Quick Actions
    const qaAddProp = document.getElementById('qa-add-property');
    if (qaAddProp) qaAddProp.addEventListener('click', () => { state.activeTab = 'add_property'; renderApp(); });

    const qaAddCust = document.getElementById('qa-add-customer');
    if (qaAddCust) qaAddCust.addEventListener('click', () => { customerModalOpen = true; renderApp(); });

    const qaSchedule = document.getElementById('qa-schedule-visit');
    if (qaSchedule) qaSchedule.addEventListener('click', () => { visitModalOpen = true; renderApp(); });

    const qaSell = document.getElementById('qa-sell-property');
    if (qaSell) qaSell.addEventListener('click', () => { state.activeTab = 'sell_property_deal'; state.selectedPropertyToSell = null; renderApp(); });

    const viewAllProps = document.getElementById('dash-view-all-props');
    if (viewAllProps) viewAllProps.addEventListener('click', () => { state.activeTab = 'properties'; renderApp(); });

    const viewAllDeals = document.getElementById('dash-view-all-deals');
    if (viewAllDeals) viewAllDeals.addEventListener('click', () => { state.activeTab = 'deals'; renderApp(); });

    const viewAllCusts = document.getElementById('dash-view-all-custs');
    if (viewAllCusts) viewAllCusts.addEventListener('click', () => { state.activeTab = 'customers'; renderApp(); });

    // Recent Invoice Row click triggers modal bill
    document.querySelectorAll('.invoice-item-click-preview').forEach(el => {
      el.addEventListener('click', () => {
        const dId = el.getAttribute('data-id');
        const dealObj = state.deals.find(d => d.id === dId);
        if (dealObj) {
          const total = parseFloat(dealObj.tokenAmount || 0) + parseFloat(dealObj.advancePayment || 0) + parseFloat(dealObj.finalPayment || 0);
          state.generatedInvoiceData = {
            invoiceId: `INV-${dealObj.id.slice(-5)}-${Date.now().toString().slice(-4)}`,
            propertyId: dealObj.propertyId,
            propertyName: dealObj.propertyName,
            propertyType: 'Flat',
            soldPrice: total,
            buyerName: dealObj.buyerName,
            saleDate: dealObj.saleDate,
            paymentMethod: 'UPI / NetBanking',
            paymentDetails: dealObj.agreementFile,
            tokenAmount: parseFloat(dealObj.tokenAmount || 0),
            advancePayment: parseFloat(dealObj.advancePayment || 0),
            finalPayment: parseFloat(dealObj.finalPayment || 0),
            invoiceDate: new Date(dealObj.saleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
          };
          invoiceModalOpen = true;
          renderApp();
        }
      });
    });

    // KPI Cards clicks route to relevant tabs
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.id.replace('dashboard-card-btn-', '');
        if (id === 'admin-sales' || id === 'agent-deals') { state.activeTab = 'deals'; }
        else if (id === 'admin-customers' || id === 'agent-leads') { state.activeTab = 'customers'; }
        else if (id === 'admin-profit') { state.activeTab = 'reports'; }
        else if (id === 'mgr-active-assets' || id === 'agent-plots') { state.activeTab = 'properties'; }
        else if (id === 'mgr-visits') { state.activeTab = 'visits'; }
        else if (id === 'mgr-reqs') { state.activeTab = 'requirements'; }
        else if (id === 'admin-purchases') { alert("Today's purchases are logged in inventory master."); }
        else if (id === 'mgr-commission' || id === 'agent-commission') { alert("All commissions details are summarized in reports."); }
        renderApp();
      });
    });
  }

  /* --- Inventory Tab Events --- */
  if (state.activeTab === 'properties') {
    // Top listing button
    const listBtn = document.getElementById('inventory-add-list-btn');
    if (listBtn) listBtn.addEventListener('click', () => { state.activeTab = 'add_property'; renderApp(); });

    // Inventory Type filter change
    const fType = document.getElementById('prop-filter-type');
    if (fType) fType.addEventListener('change', (e) => { propertyTypeFilter = e.target.value; renderApp(); });

    const fStatus = document.getElementById('prop-filter-status');
    if (fStatus) fStatus.addEventListener('change', (e) => { propertyStatusFilter = e.target.value; renderApp(); });

    const fPrice = document.getElementById('prop-filter-price');
    if (fPrice) fPrice.addEventListener('change', (e) => { propertyPriceFilter = e.target.value; renderApp(); });

    // Inline status change dropdown listener
    document.querySelectorAll('.prop-row-status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const pId = sel.getAttribute('data-id');
        const newStatus = e.target.value;
        try {
          const res = await fetch(`http://127.0.0.1:5000/api/properties/${pId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
            state.properties = state.properties.map(p => p.id === pId ? { ...p, status: newStatus } : p);
            console.log(`✅ MySQL status sync success for: ${pId}`);
          }
        } catch (err) {
          state.properties = state.properties.map(p => p.id === pId ? { ...p, status: newStatus } : p);
        }
        renderApp();
      });
    });

    // Remove property button
    document.querySelectorAll('.prop-row-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pId = btn.getAttribute('data-id');
        if (!confirm(`Are you sure you want to delete listing ${pId}?`)) return;
        try {
          const res = await fetch(`http://127.0.0.1:5000/api/properties/${pId}`, { method: 'DELETE' });
          if (res.ok) {
            state.properties = state.properties.filter(p => p.id !== pId);
            console.log(`✅ MySQL remove success for property: ${pId}`);
          }
        } catch (err) {
          state.properties = state.properties.filter(p => p.id !== pId);
        }
        renderApp();
      });
    });

    // Inline Sell trigger button
    document.querySelectorAll('.prop-row-sell-trigger-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        const matched = state.properties.find(p => p.id === pId);
        if (matched) {
          state.selectedPropertyToSell = matched;
          state.activeTab = 'sell_property_deal';
          sellBuyerName = '';
          sellSoldPrice = matched.price;
          sellTokenAmount = '';
          sellAdvancePayment = '';
          renderApp();
        }
      });
    });
  }

  /* --- Requirements Tab Events --- */
  if (state.activeTab === 'requirements') {
    const addBtn = document.getElementById('req-add-new-btn');
    if (addBtn) addBtn.addEventListener('click', () => {
      addReqBuyerName = '';
      addReqMobile = '';
      addReqPreferredLocation = '';
      addReqArea = '';
      reqModalOpen = true;
      renderApp();
    });

    // Match Engine drawer trigger
    document.querySelectorAll('.req-row-match-trigger-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-id');
        const reqObj = state.requirements.find(r => r.id === rId);
        if (reqObj) {
          selectedReq = reqObj;
          matchingDrawerOpen = true;
          renderApp();
        }
      });
    });
  }

  /* --- Sell Property Listings view --- */
  if (state.activeTab === 'sell_property_deal') {
    // Available card button trigger
    document.querySelectorAll('.qa-sell-btn-selector').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        const matched = state.properties.find(p => p.id === pId);
        if (matched) {
          state.selectedPropertyToSell = matched;
          sellBuyerName = '';
          sellSoldPrice = matched.price;
          sellTokenAmount = '';
          sellAdvancePayment = '';
          renderApp();
        }
      });
    });

    // Back triggers
    const sellBackBtn = document.getElementById('sellprop-back-btn');
    if (sellBackBtn) {
      sellBackBtn.addEventListener('click', () => {
        state.selectedPropertyToSell = null;
        renderApp();
      });
    }

    const cancelFormBtn = document.getElementById('sellform-cancel-btn');
    if (cancelFormBtn) {
      cancelFormBtn.addEventListener('click', () => {
        state.selectedPropertyToSell = null;
        renderApp();
      });
    }

    // Capture input text states dynamically in the sell deal page form
    const sellInputs = [
      { id: 'sellform-buyer-name', set: (val) => { sellBuyerName = val; } },
      { id: 'sellform-sold-price', set: (val) => { sellSoldPrice = val; } },
      { id: 'sellform-sale-date', set: (val) => { sellSaleDate = val; } },
      { id: 'sellform-token', set: (val) => { sellTokenAmount = val; } },
      { id: 'sellform-advance', set: (val) => { sellAdvancePayment = val; } },
      { id: 'sellform-comm-pct', set: (val) => { sellCommissionPercent = val; } },
      { id: 'sellform-agreement-file', set: (val) => { sellAgreementFile = val; } },
      { id: 'sellform-payment-method', set: (val) => { sellPaymentMethod = val; } },
      { id: 'sellform-payment-details', set: (val) => { sellPaymentDetails = val; } }
    ];

    sellInputs.forEach(inp => {
      const el = document.getElementById(inp.id);
      if (el) {
        // Redraw on sold price, token or advance updates to recalculate ledger
        const isTrigger = inp.id === 'sellform-sold-price' || inp.id === 'sellform-token' || inp.id === 'sellform-advance' || inp.id === 'sellform-comm-pct' || inp.id === 'sellform-payment-method';
        el.addEventListener('input', (e) => {
          inp.set(e.target.value);
          if (isTrigger) renderApp();
        });
        el.addEventListener('change', (e) => {
          inp.set(e.target.value);
          if (isTrigger) renderApp();
        });
      }
    });

    // Form submission
    const sellFormSubmit = document.getElementById('sell-property-full-form');
    if (sellFormSubmit) {
      sellFormSubmit.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pId = state.selectedPropertyToSell ? state.selectedPropertyToSell.id : document.getElementById('sellform-property-select')?.value;
        if (!pId) {
          alert('Please select property.');
          return;
        }
        if (!sellBuyerName || !sellSoldPrice) {
          alert('Please enter Buyer particulars.');
          return;
        }

        const propObj = state.properties.find(p => p.id === pId);
        const finalPrice = parseFloat(sellSoldPrice);
        const token = parseFloat(sellTokenAmount || 0);
        const advance = parseFloat(sellAdvancePayment || 0);
        const finalSplit = finalPrice - token - advance;

        if (finalSplit < 0) {
          alert('Ledger Error: Splits cannot exceed final selling price.');
          return;
        }

        const commPct = parseFloat(sellCommissionPercent || 2.0);
        const commEarned = finalPrice * (commPct / 100);

        try {
          const res = await fetch('http://127.0.0.1:5000/api/deals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              propertyId: pId,
              propertyName: propObj.name,
              buyerName: sellBuyerName,
              tokenAmount: token,
              advancePayment: advance,
              finalPayment: finalSplit,
              agreementFile: sellAgreementFile,
              commissionPercent: commPct,
              commissionEarned: commEarned,
              saleDate: sellSaleDate,
              paymentMethod: sellPaymentMethod,
              paymentDetails: sellPaymentDetails
            })
          });

          if (res.ok) {
            const added = await res.json();
            state.deals.push(added);
            // update property local status
            state.properties = state.properties.map(p => p.id === pId ? { ...p, status: 'Sold' } : p);

            // Generate invoice details
            state.generatedInvoiceData = {
              invoiceId: `INV-${added.id.slice(-5)}-${Date.now().toString().slice(-4)}`,
              propertyId: pId,
              propertyName: propObj.name,
              propertyType: propObj.type,
              purchasePrice: propObj.purchasePrice,
              soldPrice: finalPrice,
              buyerName: sellBuyerName,
              vendorName: propObj.vendorName,
              acquisitionDate: propObj.acquisitionDate,
              saleDate: sellSaleDate,
              paymentMethod: sellPaymentMethod,
              paymentDetails: sellPaymentDetails,
              tokenAmount: token,
              advancePayment: advance,
              finalPayment: finalSplit,
              invoiceDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            };

            invoiceModalOpen = true;
            state.selectedPropertyToSell = null;
            state.activeTab = 'deals';
          }
        } catch (err) {
          alert('Could not submit sales deal to MySQL.');
        }
        renderApp();
      });
    }
  }

  /* --- Deals Ledger Events --- */
  if (state.activeTab === 'deals') {
    const sellBtn = document.getElementById('deals-console-sell-trigger-btn');
    if (sellBtn) {
      sellBtn.addEventListener('click', () => {
        state.activeTab = 'sell_property_deal';
        state.selectedPropertyToSell = null;
        renderApp();
      });
    }

    // View Bill button click
    document.querySelectorAll('.deals-row-invoice-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dId = btn.getAttribute('data-id');
        const deal = state.deals.find(x => x.id === dId);
        if (deal) {
          const total = parseFloat(deal.tokenAmount || 0) + parseFloat(deal.advancePayment || 0) + parseFloat(deal.finalPayment || 0);
          state.generatedInvoiceData = {
            invoiceId: `INV-${deal.id.slice(-5)}-${Date.now().toString().slice(-4)}`,
            propertyId: deal.propertyId,
            propertyName: deal.propertyName,
            propertyType: 'Flat',
            soldPrice: total,
            buyerName: deal.buyerName,
            saleDate: deal.saleDate,
            paymentMethod: 'UPI / NetBanking',
            paymentDetails: deal.agreementFile,
            tokenAmount: parseFloat(deal.tokenAmount || 0),
            advancePayment: parseFloat(deal.advancePayment || 0),
            finalPayment: parseFloat(deal.finalPayment || 0),
            invoiceDate: new Date(deal.saleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
          };
          invoiceModalOpen = true;
          renderApp();
        }
      });
    });
  }

  /* --- Customers Section Events --- */
  if (state.activeTab === 'customers') {
    const addBtn = document.getElementById('cust-add-new-btn');
    if (addBtn) addBtn.addEventListener('click', () => {
      addCustName = '';
      addCustMobile = '';
      customerModalOpen = true;
      renderApp();
    });

    // Assign select listener
    document.querySelectorAll('.crm-lead-assignee-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const lId = sel.getAttribute('data-id');
        const agentName = e.target.value;
        try {
          const res = await fetch(`http://127.0.0.1:5000/api/leads/${lId}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignedTo: agentName })
          });
          if (res.ok) {
            state.leads = state.leads.map(l => l.id === lId ? { ...l, assignedTo: agentName } : l);
            console.log(`✅ MySQL CRM assignment synced: ${lId} ➔ ${agentName}`);
          }
        } catch (err) {
          state.leads = state.leads.map(l => l.id === lId ? { ...l, assignedTo: agentName } : l);
        }
        renderApp();
      });
    });
  }

  /* --- Site Visits Section Events --- */
  if (state.activeTab === 'visits') {
    const addBtn = document.getElementById('visit-add-new-btn');
    if (addBtn) addBtn.addEventListener('click', () => {
      addVisitCustomerName = '';
      addVisitPropertyName = '';
      addVisitDate = '';
      addVisitNotes = '';
      visitModalOpen = true;
      renderApp();
    });
  }

  /* --- Add Property Page Events --- */
  if (state.activeTab === 'add_property') {
    // Back & Cancel triggers
    const backBtn = document.getElementById('addprop-back-btn');
    if (backBtn) backBtn.addEventListener('click', () => { state.activeTab = 'properties'; renderApp(); });

    const cancelBtn = document.getElementById('addprop-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => { state.activeTab = 'properties'; renderApp(); });

    // Category button selection
    document.querySelectorAll('.addprop-form-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addPropType = btn.getAttribute('data-type');
        renderApp();
      });
    });

    // File upload triggers
    const uploadTrigger = document.getElementById('addprop-form-upload-trigger');
    const fileInput = document.getElementById('addprop-form-file-input');
    if (uploadTrigger && fileInput) {
      uploadTrigger.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
          alert('Photo size exceeds 2MB limit.');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          addPropImage = reader.result;
          renderApp();
        };
        reader.readAsDataURL(file);
      });
    }

    // Capture inputs
    const addInputs = [
      { id: 'addprop-form-name', set: (val) => { addPropName = val; } },
      { id: 'addprop-form-price', set: (val) => { addPropPrice = val; } },
      { id: 'addprop-form-status', set: (val) => { addPropStatus = val; } },
      { id: 'addprop-form-ownername', set: (val) => { addPropOwnerName = val; } },
      { id: 'addprop-form-ownermobile', set: (val) => { addPropOwnerMobile = val; } },
      { id: 'addprop-form-purchaseprice', set: (val) => { addPropPurchasePrice = val; } },
      { id: 'addprop-form-vendor', set: (val) => { addPropVendorName = val; } },
      { id: 'addprop-form-acquisitiondate', set: (val) => { addPropAcquisitionDate = val; } },
      { id: 'addprop-form-imageurl', set: (val) => { addPropImage = val; } }
    ];

    addInputs.forEach(inp => {
      const el = document.getElementById(inp.id);
      if (el) {
        // We trigger re-render on typing to show live card preview
        const isTrigger = inp.id === 'addprop-form-name' || inp.id === 'addprop-form-price' || inp.id === 'addprop-form-ownername' || inp.id === 'addprop-form-ownermobile' || inp.id === 'addprop-form-imageurl';
        el.addEventListener('input', (e) => {
          inp.set(e.target.value);
          if (isTrigger) renderApp();
        });
      }
    });

    // Form submission
    const formSubmit = document.getElementById('add-property-full-form');
    if (formSubmit) {
      formSubmit.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!addPropName || !addPropPrice) return;
        const isManager = state.userRole === 'Manager' || state.userRole === 'Super Admin';
        const costVal = isManager && addPropPurchasePrice ? parseFloat(addPropPurchasePrice) : parseFloat(addPropPrice) * 0.8;

        try {
          const res = await fetch('http://127.0.0.1:5000/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: addPropName,
              type: addPropType,
              status: addPropStatus,
              price: parseFloat(addPropPrice),
              purchasePrice: costVal,
              vendorName: isManager && addPropVendorName ? addPropVendorName : 'Independent Owner',
              acquisitionDate: isManager && addPropAcquisitionDate ? addPropAcquisitionDate : new Date().toISOString().split('T')[0],
              ownerName: addPropOwnerName || 'Independent Owner',
              ownerMobile: addPropOwnerMobile || '999xxxxxx8',
              propertyImage: addPropImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop'
            })
          });

          if (res.ok) {
            const added = await res.json();
            state.properties.push(added);
            // Clear input variables
            addPropName = '';
            addPropPrice = '';
            addPropOwnerName = '';
            addPropOwnerMobile = '';
            addPropImage = '';
            state.activeTab = 'properties';
          }
        } catch (err) {
          alert('Could not submit property listing details to MySQL.');
        }
        renderApp();
      });
    }
  }

  /* --- Add Property Modal Events --- */
  if (propertyModalOpen) {
    const closeBtn = document.getElementById('modal-addprop-close');
    const cancelBtn = document.getElementById('modal-addprop-cancel-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { propertyModalOpen = false; renderApp(); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { propertyModalOpen = false; renderApp(); });

    // Track inputs
    const inputs = [
      { id: 'modalprop-name', set: (val) => { addPropName = val; } },
      { id: 'modalprop-type', set: (val) => { addPropType = val; } },
      { id: 'modalprop-price', set: (val) => { addPropPrice = val; } },
      { id: 'modalprop-ownername', set: (val) => { addPropOwnerName = val; } },
      { id: 'modalprop-ownermobile', set: (val) => { addPropOwnerMobile = val; } },
      { id: 'modalprop-purchaseprice', set: (val) => { addPropPurchasePrice = val; } },
      { id: 'modalprop-vendor', set: (val) => { addPropVendorName = val; } },
      { id: 'modalprop-acqdate', set: (val) => { addPropAcquisitionDate = val; } }
    ];
    inputs.forEach(inp => {
      const el = document.getElementById(inp.id);
      if (el) el.addEventListener('input', (e) => inp.set(e.target.value));
    });

    const form = document.getElementById('modal-addprop-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const isManager = state.userRole === 'Manager' || state.userRole === 'Super Admin';
        const costVal = isManager && addPropPurchasePrice ? parseFloat(addPropPurchasePrice) : parseFloat(addPropPrice) * 0.8;
        try {
          const res = await fetch('http://127.0.0.1:5000/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: addPropName,
              type: addPropType,
              status: addPropStatus,
              price: parseFloat(addPropPrice),
              purchasePrice: costVal,
              vendorName: isManager && addPropVendorName ? addPropVendorName : 'Independent Owner',
              acquisitionDate: isManager && addPropAcquisitionDate ? addPropAcquisitionDate : new Date().toISOString().split('T')[0],
              ownerName: addPropOwnerName || 'Independent Owner',
              ownerMobile: addPropOwnerMobile || '999xxxxxx8',
              propertyImage: addPropImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop'
            })
          });
          if (res.ok) {
            const added = await res.json();
            state.properties.push(added);
            propertyModalOpen = false;
            // Clear inputs
            addPropName = '';
            addPropPrice = '';
            addPropOwnerName = '';
            addPropOwnerMobile = '';
          }
        } catch (err) {
          alert('Could not submit details to MySQL.');
        }
        renderApp();
      });
    }
  }

  /* --- Add Customer Modal Events --- */
  if (customerModalOpen) {
    const closeBtn = document.getElementById('modal-addcust-close');
    const cancelBtn = document.getElementById('modal-addcust-cancel-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { customerModalOpen = false; renderApp(); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { customerModalOpen = false; renderApp(); });

    // Track inputs
    const inputs = [
      { id: 'modalcust-name', set: (val) => { addCustName = val; } },
      { id: 'modalcust-mobile', set: (val) => { addCustMobile = val; } },
      { id: 'modalcust-req', set: (val) => { addCustRequirement = val; } },
      { id: 'modalcust-status', set: (val) => { addCustStatus = val; } }
    ];
    inputs.forEach(inp => {
      const el = document.getElementById(inp.id);
      if (el) el.addEventListener('input', (e) => inp.set(e.target.value));
    });

    const form = document.getElementById('modal-addcust-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const res = await fetch('http://127.0.0.1:5000/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: addCustName,
              mobile: addCustMobile,
              requirement: addCustRequirement,
              status: addCustStatus
            })
          });
          if (res.ok) {
            const added = await res.json();
            state.leads.push(added);
            customerModalOpen = false;
            addCustName = '';
            addCustMobile = '';
          }
        } catch (err) {
          alert('Failed to sync CRM lead details with MySQL.');
        }
        renderApp();
      });
    }
  }

  /* --- Schedule Visit Modal Events --- */
  if (visitModalOpen) {
    const closeBtn = document.getElementById('modal-addvisit-close');
    const cancelBtn = document.getElementById('modal-addvisit-cancel-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { visitModalOpen = false; renderApp(); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { visitModalOpen = false; renderApp(); });

    // Track inputs
    const inputs = [
      { id: 'modalvisit-cust', set: (val) => { addVisitCustomerName = val; } },
      { id: 'modalvisit-prop', set: (val) => { addVisitPropertyName = val; } },
      { id: 'modalvisit-date', set: (val) => { addVisitDate = val; } },
      { id: 'modalvisit-agent', set: (val) => { addVisitAgentName = val; } },
      { id: 'modalvisit-notes', set: (val) => { addVisitNotes = val; } }
    ];
    inputs.forEach(inp => {
      const el = document.getElementById(inp.id);
      if (el) el.addEventListener('input', (e) => inp.set(e.target.value));
    });

    const form = document.getElementById('modal-addvisit-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const res = await fetch('http://127.0.0.1:5000/api/visits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: addVisitCustomerName,
              propertyName: addVisitPropertyName,
              visitDate: addVisitDate,
              agentName: addVisitAgentName,
              notes: addVisitNotes,
              status: 'Scheduled'
            })
          });
          if (res.ok) {
            const added = await res.json();
            state.visits.push(added);
            visitModalOpen = false;
            addVisitCustomerName = '';
            addVisitPropertyName = '';
            addVisitDate = '';
            addVisitNotes = '';
          }
        } catch (err) {
          alert('Could not schedule site visit.');
        }
        renderApp();
      });
    }
  }

  /* --- Add Requirement Modal Events --- */
  if (reqModalOpen) {
    const closeBtn = document.getElementById('modal-addreq-close');
    const cancelBtn = document.getElementById('modal-addreq-cancel-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { reqModalOpen = false; renderApp(); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { reqModalOpen = false; renderApp(); });

    // Track inputs
    const inputs = [
      { id: 'modalreq-buyer', set: (val) => { addReqBuyerName = val; } },
      { id: 'modalreq-mobile', set: (val) => { addReqMobile = val; } },
      { id: 'modalreq-budget', set: (val) => { addReqBudgetRange = val; } },
      { id: 'modalreq-type', set: (val) => { addReqPropertyType = val; } },
      { id: 'modalreq-loc', set: (val) => { addReqPreferredLocation = val; } },
      { id: 'modalreq-area', set: (val) => { addReqArea = val; } }
    ];
    inputs.forEach(inp => {
      const el = document.getElementById(inp.id);
      if (el) el.addEventListener('input', (e) => inp.set(e.target.value));
    });

    const form = document.getElementById('modal-addreq-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const res = await fetch('http://127.0.0.1:5000/api/requirements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              buyerName: addReqBuyerName,
              mobile: addReqMobile,
              budgetRange: addReqBudgetRange,
              preferredLocation: addReqPreferredLocation,
              propertyType: addReqPropertyType,
              areaRequirement: addReqArea,
              status: 'Open'
            })
          });
          if (res.ok) {
            const added = await res.json();
            state.requirements.push(added);
            reqModalOpen = false;
            addReqBuyerName = '';
            addReqMobile = '';
            addReqPreferredLocation = '';
            addReqArea = '';
          }
        } catch (err) {
          alert('Could not save requirement.');
        }
        renderApp();
      });
    }
  }

  /* --- Invoice Modal Events --- */
  if (invoiceModalOpen) {
    const closeBtn = document.getElementById('modal-invoice-close');
    const cancelBtn = document.getElementById('modal-invoice-cancel-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { invoiceModalOpen = false; renderApp(); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { invoiceModalOpen = false; renderApp(); });

    // Print button dispatch
    const printBtn = document.getElementById('modal-invoice-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        const printContent = document.getElementById('printable-invoice-sheet').innerHTML;
        const d = state.generatedInvoiceData;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Kaira Deal Invoice - ${d.invoiceId}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; }
                table { width: 100%; border-collapse: collapse; margin-top: 30px; margin-bottom: 30px; }
                th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; }
                td { border-bottom: 1px solid #f1f5f9; padding: 14px 12px; font-size: 13.5px; }
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
      });
    }
  }

  /* --- Avatar Modal Events --- */
  if (avatarModalOpen) {
    const closeBtn = document.getElementById('modal-avatar-close');
    const cancelBtn = document.getElementById('modal-avatar-cancel-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { avatarModalOpen = false; renderApp(); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { avatarModalOpen = false; renderApp(); });

    // Preset buttons selection
    document.querySelectorAll('.avatar-preset-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedAvatar = btn.getAttribute('data-url');
        customAvatarUrl = '';
        renderApp();
      });
    });

    // Custom URL typing input
    const urlInput = document.getElementById('avatar-custom-url-input');
    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        customAvatarUrl = e.target.value;
        selectedAvatar = '';
      });
    }

    // Local file input helper
    const fileInput = document.getElementById('avatar-local-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
          alert('Photo exceeds 2MB limit.');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          selectedAvatar = reader.result;
          customAvatarUrl = '';
          renderApp();
        };
        reader.readAsDataURL(file);
      });
    }

    // Save avatar button click triggers update API
    const saveBtn = document.getElementById('modal-avatar-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const finalUrl = customAvatarUrl.trim() !== '' ? customAvatarUrl.trim() : selectedAvatar;
        savingAvatar = true;
        renderApp();

        try {
          if (state.userId) {
            const res = await fetch(`http://127.0.0.1:5000/api/users/${state.userId}/profile-image`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ profileImage: finalUrl })
            });
            if (res.ok) {
              state.userAvatar = finalUrl;
              localStorage.setItem('propdeal_user_avatar', finalUrl);
              console.log('✅ User profile photo updated in MySQL.');
            }
          } else {
            state.userAvatar = finalUrl;
            localStorage.setItem('propdeal_user_avatar', finalUrl);
          }
        } catch (err) {
          state.userAvatar = finalUrl;
          localStorage.setItem('propdeal_user_avatar', finalUrl);
        } finally {
          savingAvatar = false;
          avatarModalOpen = false;
          renderApp();
        }
      });
    }
  }

  /* --- Matching Drawer Events --- */
  if (matchingDrawerOpen && selectedReq) {
    const closeBtn = document.getElementById('modal-matching-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { matchingDrawerOpen = false; renderApp(); });

    // Send Recommendation button triggers mock
    document.querySelectorAll('.matching-row-send-rec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const buyer = btn.getAttribute('data-buyer');
        const prop = btn.getAttribute('data-prop');
        alert(`🤝 AI Engine recommendation dispatched! Match recommendation of "${prop}" sent to "${buyer}" successfully.`);
        matchingDrawerOpen = false;
        renderApp();
      });
    });
  }
}
