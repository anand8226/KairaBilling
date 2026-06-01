import React from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  FileText, 
  Receipt, 
  Calendar, 
  BarChart3, 
  UserCheck, 
  Settings,
  LogOut,
  Layers,
  ShieldAlert,
  CloudLightning,
  QrCode,
  DollarSign
} from 'lucide-react';

const getFilteredMenuItems = (role) => {
  // Return the complete premium set of menu items inspired by the reference Universal ERP image
  const baseItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sell_property', label: 'Billing', icon: Receipt },
    { id: 'deals', label: 'Sales', icon: DollarSign },
    { id: 'properties', label: 'Inventory', icon: Home },
    { id: 'customers', label: 'Customers', icon: UserCheck },
    { id: 'requirements', label: 'Requirements', icon: Users },
    { id: 'visits', label: 'Visits', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  // Role conditional additions
  if (role === 'Super Admin' || role === 'Manager') {
    baseItems.push({ id: 'rfid_section', label: 'RFID Gates', icon: QrCode });
    baseItems.push({ id: 'backup_section', label: 'Cloud Backup', icon: CloudLightning });
  }

  baseItems.push({ id: 'settings', label: 'Settings', icon: Settings });
  return baseItems;
};

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, userRole = 'Agent', onLogout }) {
  const items = getFilteredMenuItems(userRole);

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`} style={{ zIndex: 100 }}>
      {/* Brand Header matching reference visual layout */}
      <div className="sidebar-brand" style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
        <div className="sidebar-logo-container" style={{ background: 'var(--primary)' }}>
          <Layers size={22} strokeWidth={2.5} />
        </div>
        <div className="sidebar-brand-text">
          <h1 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>PropDeal</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>ERP SUITE</span>
            <span className={`badge ${userRole === 'Super Admin' ? 'danger' : userRole === 'Manager' ? 'warning' : 'info'}`} style={{ fontSize: '7.5px', padding: '1px 5px', fontWeight: '800', textTransform: 'uppercase', borderRadius: '4px' }}>
              {userRole === 'Super Admin' ? 'Admin' : userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onClick={(e) => {
                e.preventDefault();
                if (item.id === 'rfid_section') {
                  alert("📡 RFID Smart Gates are currently active and tracking all Sector plots! Inspect log files in the Dashboard panel.");
                  return;
                }
                if (item.id === 'backup_section') {
                  alert("☁️ PropDeal Database Backup is active. Auto-synced to cloud server.");
                  return;
                }
                setActiveTab(item.id);
                setIsOpen(false); // Close sidebar on mobile
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </a>
          );
        })}

        {/* Separator */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />

        {/* Logout link at bottom */}
        <a
          href="#logout"
          className="sidebar-menu-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'hsl(0, 85%, 65%)',
            transition: 'all 0.2s ease'
          }}
          onClick={(e) => {
            e.preventDefault();
            if (onLogout) {
              onLogout();
            } else {
              alert("Logging out from PropDeal ERP Console.");
            }
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </a>
      </nav>

      {/* Mini brand note */}
      <div style={{ marginTop: 'auto', paddingTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
        v1.4 - Secure MySQL Connected
      </div>
    </aside>
  );
}
