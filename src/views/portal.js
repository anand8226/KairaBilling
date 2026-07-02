import { AppState, renderApp } from '../main.js';

// Predefined mock medicines for the directory showcase
const PREVIEW_MEDICINES = [
  { id: 1, name: 'ORASORE GEL', pack: '1*10GM' },
  { id: 2, name: 'PARACETAMOL 650', pack: '1*15 Tab' },
  { id: 3, name: 'AMOXICILLIN 500', pack: '1*10 Cap' }
];

let activeTab = 'home';
let activePreview = 'sales';
let pharmacySearch = '';
let searchQuery = '';
let filterType = 'All';

// State updater helpers
function setTab(tab) {
  activeTab = tab;
  window.location.hash = tab === 'home' ? '' : tab;
  renderApp();
}

function setPreview(preview) {
  activePreview = preview;
  renderApp();
}

export function renderPortal(state) {
  const filteredProperties = state.properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || p.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return `
    <div class="portal-root" style="min-height: 100vh; display: flex; flex-direction: column; background: var(--bg-main);">
      <!-- 1. NAVIGATION BAR -->
      <nav class="saas-navbar">
        <div id="nav-logo-click" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <img src="kaira_logo.svg" alt="Kaira Deal Logo" style="width: 36px; height: 36px; border-radius: 10px; object-fit: cover; box-shadow: 0 4px 12px rgba(30, 111, 253, 0.25); border: 1.5px solid var(--primary-light);" />
          <span style="font-size: 18px; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px;">Kaira Deal <span style="font-size: 9px; color: var(--primary); font-weight: 800; border: 1.5px solid var(--primary); padding: 1px 4px; border-radius: 4px; margin-left: 5px; letter-spacing: 0.5px;">ERP SUITE</span></span>
        </div>

        <div class="saas-nav-links">
          <button class="saas-nav-link ${activeTab === 'home' ? 'active' : ''}" data-tab="home">Home</button>
          <button class="saas-nav-link ${activeTab === 'features' ? 'active' : ''}" data-tab="features">Features</button>
          <button class="saas-nav-link ${activeTab === 'modules' ? 'active' : ''}" data-tab="modules">Modules</button>
          <button class="saas-nav-link ${activeTab === 'plots' ? 'active' : ''}" data-tab="plots">Plots Showcase</button>
          <button class="saas-nav-link ${activeTab === 'about' ? 'active' : ''}" data-tab="about">About Us</button>
          <button class="saas-nav-link ${activeTab === 'contact' ? 'active' : ''}" data-tab="contact">Contact</button>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <button type="button" class="btn-signin" id="header-signin-btn" style="font-size: 13.5px; font-weight: 600; color: var(--text-main); background: none; border: none; cursor: pointer;">
            Sign In
          </button>
          <button type="button" class="btn btn-primary" id="header-register-btn" style="padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, var(--primary) 0%, hsl(230, 90%, 60%) 100%); border: none; box-shadow: 0 4px 12px rgba(30,111,253,0.2); color: white; cursor: pointer;">
            Register
            <span style="font-size: 11px;">➔</span>
          </button>
        </div>
      </nav>

      <!-- 2. MAIN CONTAINER -->
      <main style="flex: 1; position: relative;" class="main-portal-content">
        
        <!-- HOME VIEW -->
        ${activeTab === 'home' ? `
          <div style="padding: 60px 40px;">
            <div class="saas-hero-glow-container">
              <div class="saas-glow-circle primary"></div>
              <div class="saas-glow-circle purple"></div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; align-items: center; max-width: 1200px; margin: auto;">
              <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 18px;">
                <div class="saas-badge-pill" style="color: var(--primary); font-size: 12px; font-weight: 700;">
                  ✨ Real Estate & Business ERP Ecosystem
                </div>
                <h1 class="saas-h1" style="font-size: 42px; font-weight: 900; line-height: 1.2; color: var(--text-main);">
                  One Software For Every <br/>
                  <span class="gradient" style="background: linear-gradient(90deg, var(--primary), #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Property & Business</span>
                </h1>
                <p class="saas-lead-text" style="font-size: 16px; color: var(--text-muted); line-height: 1.6;">
                  Manage listings, inventory, GST invoices, RFID tagging, real-time client leads, and direct WhatsApp integrations. An all-in-one suite custom built for property agents and modern retail distributors.
                </p>
                <div style="display: flex; gap: 12px;">
                  <button type="button" class="btn btn-primary" id="hero-trial-btn" style="padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; background: var(--primary); color: white; border: none;">
                    Start Free Trial ➔
                  </button>
                  <button type="button" class="btn btn-secondary" id="hero-tour-btn" style="padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; border: 1px solid var(--border-color); color: var(--text-main); background: none;">
                    Watch Product Tour
                  </button>
                </div>
              </div>

              <!-- Hero graphic mockup -->
              <div style="position: relative;">
                <div class="saas-card-window" style="background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-lg);">
                  <div style="display: flex; align-items: center; justify-content: space-between; background: #1e293b; padding: 10px 16px;">
                    <div style="display: flex; gap: 6px;">
                      <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
                      <span style="width: 10px; height: 10px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
                      <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                    </div>
                    <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">Kaira Deal Console Preview</span>
                    <div style="width: 30px;"></div>
                  </div>
                  <div style="padding: 24px; color: #94a3b8;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                      <div>
                        <div style="font-size: 11px; text-transform: uppercase;">Closed Deals Value</div>
                        <div style="font-size: 22px; color: white; font-weight: 800; margin-top: 4px;">₹3,06,00,000</div>
                      </div>
                      <div style="text-align: right;">
                        <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: bold;">Sync Active</span>
                      </div>
                    </div>
                    <div style="border-top: 1px solid #1e293b; padding-top: 14px;">
                      <div style="font-size: 12px; color: white; font-weight: bold; margin-bottom: 10px;">Real-time CRM Leads</div>
                      <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; background: #1e293b; padding: 6px 12px; border-radius: 6px;">
                          <span>Rahul Sharma (Flat)</span>
                          <span style="color: #10b981; font-weight: bold;">Interested</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; background: #1e293b; padding: 6px 12px; border-radius: 6px;">
                          <span>Amit Verma (Plot)</span>
                          <span style="color: #fbbf24; font-weight: bold;">New Lead</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- FEATURES VIEW -->
        ${activeTab === 'features' ? `
          <div style="padding: 40px; max-width: 1100px; margin: auto;">
            <h2 style="font-size: 28px; font-weight: 800; text-align: center; color: var(--text-main); margin-bottom: 40px;">Robust Features Tailored For Scale</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
              <div class="dashboard-card" style="padding: 24px; background: white; border: 1px solid var(--border-color); border-radius: 12px;">
                <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 10px;">🏠 Real Estate Plot Grids</h3>
                <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.5;">Visual grid systems indicating available, sold, booked, and blocked plots on interactive maps.</p>
              </div>
              <div class="dashboard-card" style="padding: 24px; background: white; border: 1px solid var(--border-color); border-radius: 12px;">
                <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 10px;">📦 Retail Inventory Stock</h3>
                <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.5;">Automated stock inward purchase logs, near-expiry drug alarms, and batch tracking.</p>
              </div>
              <div class="dashboard-card" style="padding: 24px; background: white; border: 1px solid var(--border-color); border-radius: 12px;">
                <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 10px;">🧾 GST Billing & Ledgers</h3>
                <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.5;">A4 and thermal recipe generator with automatic tax deductions, discount codes, and accounts ledger tracking.</p>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- MODULES VIEW -->
        ${activeTab === 'modules' ? `
          <div style="padding: 40px;">
            <div class="saas-modules-tabs-row" style="display: flex; justify-content: center; gap: 10px; margin-bottom: 30px;">
              <button class="saas-module-tab-btn ${activePreview === 'sales' ? 'active' : ''}" data-preview="sales">Sales Dashboard</button>
              <button class="saas-module-tab-btn ${activePreview === 'inventory' ? 'active' : ''}" data-preview="inventory">Inventory Showcase</button>
              <button class="saas-module-tab-btn ${activePreview === 'reports' ? 'active' : ''}" data-preview="reports">Lead Reports</button>
              <button class="saas-module-tab-btn ${activePreview === 'rfid' ? 'active' : ''}" data-preview="rfid">RFID Smart Scanner</button>
              <button class="saas-module-tab-btn ${activePreview === 'pharmacy' ? 'active' : ''}" data-preview="pharmacy">Pharmacy Billing</button>
            </div>

            <div class="saas-preview-window" style="max-width: 900px; margin: auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: var(--shadow-lg);">
              <div style="display: flex; align-items: center; justify-content: space-between; background: #1e293b; padding: 12px 20px;">
                <div style="display: flex; gap: 6px;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                </div>
                <span style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Kaira Deal ERP - Pharmacy Panel v1.4 (MySQL-Live)</span>
                <div style="width: 30px;"></div>
              </div>

              <div style="padding: 24px; min-height: 340px;">
                
                ${activePreview === 'sales' ? `
                  <div style="color: white;">
                    <h3 style="font-size: 16px; margin-bottom: 10px; font-weight: bold;">Real-time Revenue Analysis (Database-Driven)</h3>
                    <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">Database connected. Displaying dynamically calculated deals commission revenue logs.</p>
                    <div style="display: flex; gap: 20px; align-items: flex-end; height: 200px; padding: 10px; background: #1e293b; border-radius: 10px;">
                      <div style="flex: 1; height: 60%; background: var(--primary); border-radius: 4px; text-align: center; color: white; font-size: 10px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px;">P-001</div>
                      <div style="flex: 1; height: 95%; background: var(--primary); border-radius: 4px; text-align: center; color: white; font-size: 10px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px;">P-002</div>
                      <div style="flex: 1; height: 40%; background: var(--primary); border-radius: 4px; text-align: center; color: white; font-size: 10px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px;">P-003</div>
                    </div>
                  </div>
                ` : ''}

                ${activePreview === 'inventory' ? `
                  <div style="color: white;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; font-weight: bold;">Properties & Asset Registry Stock (Direct MySQL)</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                      <thead>
                        <tr style="border-bottom: 1px solid #334155; color: white;">
                          <th style="padding: 10px 4px;">Property Name</th>
                          <th style="padding: 10px 4px;">Type</th>
                          <th style="padding: 10px 4px;">Asking Price</th>
                          <th style="padding: 10px 4px;">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${state.properties.slice(0, 3).map(p => `
                          <tr style="border-bottom: 1px solid #1e293b; color: #94a3b8;">
                            <td style="padding: 10px 4px; color: white; font-weight: bold;">${p.name}</td>
                            <td style="padding: 10px 4px;">${p.type}</td>
                            <td style="padding: 10px 4px; color: #10b981; font-weight: bold;">₹${p.price.toLocaleString('en-IN')}</td>
                            <td style="padding: 10px 4px;"><span class="badge ${p.status === 'Available' ? 'success' : 'danger'}" style="font-size: 9px; padding: 2px 6px;">${p.status}</span></td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                ` : ''}

                ${activePreview === 'reports' ? `
                  <div style="color: white;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; font-weight: bold;">Realtime CRM Leads Pipeline (MySQL CRM Sync)</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                      <thead>
                        <tr style="border-bottom: 1px solid #334155; color: white;">
                          <th style="padding: 10px 4px;">Client Name</th>
                          <th style="padding: 10px 4px;">Requirement</th>
                          <th style="padding: 10px 4px;">Lead Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${state.leads.slice(0, 3).map(l => `
                          <tr style="border-bottom: 1px solid #1e293b; color: #94a3b8;">
                            <td style="padding: 10px 4px; color: white; font-weight: bold;">${l.name}</td>
                            <td style="padding: 10px 4px;">${l.requirement}</td>
                            <td style="padding: 10px 4px;"><span class="badge success" style="font-size: 9px; padding: 2px 6px; background: rgba(16, 185, 129, 0.15); color: #10b981;">${l.status}</span></td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                ` : ''}

                ${activePreview === 'rfid' ? `
                  <div style="color: white;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; font-weight: bold;">Realtime RFID Smart Gate Scanner</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                      ${state.properties.slice(0, 3).map((p, idx) => `
                        <div style="background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155; display: flex; flex-direction: column; gap: 6px;">
                          <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 10px; background: rgba(16,185,129,0.2); color: #10b981; padding: 2px 6px; border-radius: 4px; font-weight: bold;">RFID-P${p.id}</span>
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                          </div>
                          <span style="font-size: 13px; font-weight: bold; color: white;">${p.name}</span>
                          <span style="font-size: 10px; color: #64748b;">RSSI: -${42 + idx * 6}dBm</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                ${activePreview === 'pharmacy' ? `
                  <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 15px; font-weight: bold; color: white; display: flex; align-items: center; gap: 6px;">
                        💊 Pharmacy Medicines Directory Preview
                      </span>
                      <span class="badge success" style="background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.2); font-size: 9px; padding: 2px 6px;">
                        Active Directory
                      </span>
                    </div>

                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
                      <div style="position: relative;">
                        <input 
                          type="text"
                          id="pharmacy-directory-search"
                          placeholder="Search medicines by name..."
                          value="${pharmacySearch}"
                          style="width: 100%; padding: 10px 10px 10px 14px; font-size: 13px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: white; outline: none;"
                        />
                      </div>

                      <div style="display: flex; flex-direction: column; gap: 10px;" id="pharmacy-directory-list">
                        ${PREVIEW_MEDICINES.filter(m => m.name.toLowerCase().includes(pharmacySearch.toLowerCase())).map(med => `
                          <div style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 12px 18px; border-radius: 8px; border: 1px solid #1e293b;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                              <span style="color: #10b981; font-weight: bold;">✦</span>
                              <span style="font-size: 13px; font-weight: bold; color: white; letter-spacing: 0.5px;">${med.name}</span>
                            </div>
                            <span style="font-size: 11px; color: #94a3b8; background: #1e293b; padding: 4px 12px; border-radius: 12px; border: 1px solid #334155;">
                              Pack: ${med.pack}
                            </span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                ` : ''}

              </div>
            </div>
          </div>
        ` : ''}

        <!-- PLOTS VIEW -->
        ${activeTab === 'plots' ? `
          <div style="padding: 40px; max-width: 1200px; margin: auto;">
            <div style="background: linear-gradient(135deg, rgba(30,111,253,0.05) 0%, rgba(139,92,246,0.05) 100%); border: 1px solid var(--border-color); border-radius: 20px; padding: 40px; text-align: center; margin-bottom: 40px;">
              <span class="badge success" style="font-size: 10px; padding: 4px 12px; border-radius: 30px;">✨ PREMIUM VERIFIED LISTINGS</span>
              <h2 style="font-size: 32px; font-weight: 900; color: var(--text-main); margin-top: 15px;">Apna Dream Plot Aur Property Dhundhein</h2>
              <p style="font-size: 15px; color: var(--text-muted); margin-top: 8px; max-width: 600px; margin-left: auto; margin-right: auto;">Browse residential plots, highly lucrative shops, and dream homes in prime locations. Connect directly with the dealer on WhatsApp with 0% brokerage.</p>
            </div>

            <!-- Filter list and search -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px; background: white; border: 1px solid var(--border-color); padding: 16px 24px; border-radius: 16px; margin-bottom: 30px; flex-wrap: wrap;">
              <input type="text" id="plot-search-input" value="${searchQuery}" placeholder="Search location or type..." style="padding: 10px 16px; font-size: 13px; border: 1px solid var(--border-color); border-radius: 10px; width: 300px; outline: none;" />
              <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="plot-category-filters">
                ${['All', 'Plot', 'House', 'Flat', 'Shop'].map(cat => `
                  <button class="filter-pill-btn ${filterType === cat ? 'active' : ''}" data-cat="${cat}">${cat}</button>
                `).join('')}
              </div>
            </div>

            <!-- Showcase Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 28px;">
              ${filteredProperties.map(p => `
                <div class="public-property-card" style="background: white; border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column;">
                  <div style="height: 180px; overflow: hidden; position: relative;">
                    <img src="${p.propertyImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop'}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                    <span class="badge ${p.type === 'Plot' ? 'warning' : 'success'}" style="position: absolute; top: 12px; right: 12px;">${p.type}</span>
                    <span style="position: absolute; bottom: 12px; left: 12px; background: rgba(15,23,42,0.85); color: white; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 14.5px;">₹${p.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div style="padding: 20px; display: flex; flex-direction: column; gap: 10px; flex: 1;">
                    <h4 style="font-size: 17px; font-weight: bold; color: var(--text-main);">${p.name}</h4>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); border-bottom: 1px dashed var(--border-color); padding-bottom: 10px;">
                      <span>ID: ${p.id}</span>
                      <span style="color: var(--success-icon); font-weight: bold;">✓ Verified</span>
                    </div>
                    <button class="btn btn-primary enquire-whatsapp-btn" data-phone="${p.ownerMobile || '8226811810'}" data-name="${p.name}" style="width: 100%; padding: 10px; font-size: 12.5px; font-weight: bold; background: var(--primary); border: none; border-radius: 8px; color: white; cursor: pointer; margin-top: auto; display: flex; align-items: center; justify-content: center; gap: 6px;">
                      💬 Enquire / WhatsApp Detail
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- ABOUT VIEW -->
        ${activeTab === 'about' ? `
          <div style="padding: 60px 40px; max-width: 800px; margin: auto; text-align: center;">
            <span class="badge info" style="font-size: 11px; padding: 4px 12px; border-radius: 20px;">Who We Are</span>
            <h2 style="font-size: 32px; font-weight: 800; color: var(--text-main); margin-top: 15px; margin-bottom: 20px;">KairaBilling & Kaira Deal</h2>
            <p style="font-size: 15.5px; color: var(--text-muted); line-height: 1.7; margin-bottom: 30px;">Kaira Deal is a leading property advisory and asset management ecosystem trusted by thousands of builders and agents. Hum registry, map aur ownership fully verify karte hain, jo legal stress door karti hai.</p>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; border-top: 1px solid var(--border-color); padding-top: 30px;">
              <div>
                <h3 style="font-size: 26px; color: var(--primary); font-weight: 900;">500+</h3>
                <span style="font-size: 12px; color: var(--text-muted);">Happy Clients</span>
              </div>
              <div>
                <h3 style="font-size: 26px; color: var(--success-icon); font-weight: 900;">50+</h3>
                <span style="font-size: 12px; color: var(--text-muted);">Active Agents</span>
              </div>
              <div>
                <h3 style="font-size: 26px; color: var(--warning-icon); font-weight: 900;">15+</h3>
                <span style="font-size: 12px; color: var(--text-muted);">Years Exp</span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- CONTACT VIEW -->
        ${activeTab === 'contact' ? `
          <div style="padding: 60px 40px; max-width: 480px; margin: auto;">
            <div class="dashboard-card" style="padding: 30px; background: white; border: 1px solid var(--border-color); border-radius: 20px; box-shadow: var(--shadow-md);">
              <h3 style="font-size: 22px; font-weight: 800; text-align: center; margin-bottom: 10px;">Submit Direct Inquiry</h3>
              <p style="font-size: 13px; color: var(--text-muted); text-align: center; margin-bottom: 24px;">Fill details and our agent will connect via Call or WhatsApp.</p>
              
              <form id="public-inquiry-form" style="display: flex; flex-direction: column; gap: 16px;">
                <div class="form-group">
                  <label class="auth-label" style="font-weight: 700;">Your Name *</label>
                  <input type="text" id="inquiry-name" class="form-input" placeholder="e.g. Rahul Sharma" required />
                </div>
                <div class="form-group">
                  <label class="auth-label" style="font-weight: 700;">Mobile Number *</label>
                  <input type="tel" id="inquiry-mobile" class="form-input" placeholder="10-digit mobile" required />
                </div>
                <div class="form-group">
                  <label class="auth-label" style="font-weight: 700;">Your Requirement *</label>
                  <select id="inquiry-requirement" class="form-input" style="padding: 10px;">
                    <option value="Plot">Plot / Land</option>
                    <option value="House">Residential House</option>
                    <option value="Flat">2BHK/3BHK Flat</option>
                    <option value="Shop">Commercial Shop</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary" style="padding: 12px; font-weight: 800; font-size: 14px; background: var(--primary); border: none; border-radius: 8px; color: white; cursor: pointer; margin-top: 10px;">
                  Submit Inquiry
                </button>
              </form>
            </div>
          </div>
        ` : ''}

      </main>

      <!-- 3. FOOTER -->
      <footer style="padding: 20px 40px; background: white; border-top: 1px solid var(--border-color); text-align: center; font-size: 12.5px; color: var(--text-light);">
        © ${new Date().getFullYear()} Kaira Deal ERP Suite. All rights reserved.
      </footer>
    </div>
  `;
}

export function bindPortalEvents() {
  // Navigation tabs
  document.querySelectorAll('.saas-nav-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.getAttribute('data-tab');
      setTab(tab);
    });
  });

  // Logo click
  const logo = document.getElementById('nav-logo-click');
  if (logo) {
    logo.addEventListener('click', () => setTab('home'));
  }

  // Header login / register actions
  const signInBtn = document.getElementById('header-signin-btn');
  if (signInBtn) {
    signInBtn.addEventListener('click', () => {
      AppState.publicViewMode = 'login';
      window.location.hash = 'login';
      renderApp();
    });
  }

  const regBtn = document.getElementById('header-register-btn');
  if (regBtn) {
    regBtn.addEventListener('click', () => {
      AppState.publicViewMode = 'signup';
      window.location.hash = 'signup';
      renderApp();
    });
  }

  // Hero section buttons (only when tab is home)
  const heroTrialBtn = document.getElementById('hero-trial-btn');
  if (heroTrialBtn) {
    heroTrialBtn.addEventListener('click', () => setTab('contact'));
  }

  const heroTourBtn = document.getElementById('hero-tour-btn');
  if (heroTourBtn) {
    heroTourBtn.addEventListener('click', () => {
      // Toggle to modules and select pharmacy directory preview
      activeTab = 'modules';
      activePreview = 'pharmacy';
      renderApp();
    });
  }

  // Module preview buttons (only when tab is modules)
  document.querySelectorAll('.saas-module-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const preview = e.target.getAttribute('data-preview');
      setPreview(preview);
    });
  });

  // Pharmacy directory search filter
  const pharmSearchInput = document.getElementById('pharmacy-directory-search');
  if (pharmSearchInput) {
    pharmSearchInput.addEventListener('input', (e) => {
      pharmacySearch = e.target.value;
      
      // Update directory DOM directly for ultra-responsive feedback
      const list = document.getElementById('pharmacy-directory-list');
      if (list) {
        list.innerHTML = PREVIEW_MEDICINES.filter(m => m.name.toLowerCase().includes(pharmacySearch.toLowerCase())).map(med => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 12px 18px; border-radius: 8px; border: 1px solid #1e293b;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #10b981; font-weight: bold;">✦</span>
              <span style="font-size: 13px; font-weight: bold; color: white; letter-spacing: 0.5px;">${med.name}</span>
            </div>
            <span style="font-size: 11px; color: #94a3b8; background: #1e293b; padding: 4px 12px; border-radius: 12px; border: 1px solid #334155;">
              Pack: ${med.pack}
            </span>
          </div>
        `).join('');
      }
    });
  }

  // Plot search and filter type (only when tab is plots)
  const plotSearchInput = document.getElementById('plot-search-input');
  if (plotSearchInput) {
    plotSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      // Debounce slightly or render full app
      renderApp();
    });
  }

  document.querySelectorAll('.filter-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterType = e.target.getAttribute('data-cat');
      renderApp();
    });
  });

  // WhatsApp enquiry button
  document.querySelectorAll('.enquire-whatsapp-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const btnEl = e.currentTarget;
      const name = btnEl.getAttribute('data-name');
      const phone = btnEl.getAttribute('data-phone') || '8226811810';
      const cleanPhone = phone.replace(/\D/g, '');
      const formatted = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
      
      const message = `Hello Kaira Deal, I am interested in property: *${name}*. Please share layout plan, registry and deal pricing.`;
      const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    });
  });

  // Contact form submission (only when tab is contact)
  const inquiryForm = document.getElementById('public-inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('inquiry-name').value;
      const mobile = document.getElementById('inquiry-mobile').value;
      const requirement = document.getElementById('inquiry-requirement').value;

      if (AppState.isServerActive) {
        try {
          const res = await fetch('http://127.0.0.1:5000/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, mobile, requirement, status: 'New Lead' })
          });
          if (res.ok) {
            alert('✅ Inquiry Submitted Successfully! Our property agent will contact you shortly.');
            setTab('home');
          }
        } catch (err) {
          alert('❌ Database offline. Could not submit lead enquiry.');
        }
      } else {
        alert('✅ offline Simulator: Submitted lead Inquiry successfully!');
        setTab('home');
      }
    });
  }
}
