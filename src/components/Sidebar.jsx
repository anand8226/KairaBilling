import React from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  FileText, 
  CreditCard, 
  Receipt, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  UserCheck, 
  Settings 
} from 'lucide-react';

const getFilteredMenuItems = (role) => {
  return [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'requirements', label: 'Buy Requirement', icon: Users },
    { id: 'sell_property', label: 'Sell Property', icon: UserCheck },
    { id: 'customers', label: 'Customers', icon: UserCheck },
    { id: 'visits', label: 'Visits', icon: Calendar },
    { id: 'deals', label: 'Deals', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];
};

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, userRole = 'Agent' }) {
  const items = getFilteredMenuItems(userRole);

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-container">
          <Home size={22} strokeWidth={2.5} />
        </div>
        <div className="sidebar-brand-text">
          <h1>PropDeal</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Console</span>
            <span className={`badge ${userRole === 'Super Admin' ? 'danger' : userRole === 'Manager' ? 'warning' : 'info'}`} style={{ fontSize: '9px', padding: '2px 6px', fontWeight: '800', textTransform: 'uppercase' }}>
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-menu">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
                setIsOpen(false); // Close sidebar on mobile
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Architectural Promo Footer Card */}
      <div className="sidebar-footer-card">
        <img 
          src="/sidebar_house.png" 
          alt="Modern Architecture" 
          className="sidebar-card-image"
        />
        <div className="sidebar-footer-card-content">
          <p>Manage Properties, Leads, Customers & Payments in One Place</p>
          <button 
            type="button" 
            className="sidebar-btn-getstarted"
            onClick={() => alert(`Welcome to PropDeal! You are currently operating as a "${userRole}".`)}
          >
            Get Started
          </button>
        </div>
      </div>
    </aside>
  );
}
