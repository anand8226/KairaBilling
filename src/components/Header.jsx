import React, { useState } from 'react';
import { Search, Bell, Calendar, Menu, LogOut, Shield } from 'lucide-react';

export default function Header({ 
  activeTab, 
  searchQuery, 
  setSearchQuery, 
  sidebarOpen, 
  setSidebarOpen,
  notificationCount = 3,
  userName = 'Admin',
  userRole = 'Agent',
  onLogout 
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Format current date like "21 May 2024, Tuesday"
  const getFormattedDate = () => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const weekdayOptions = { weekday: 'long' };
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', options);
    const dayStr = today.toLocaleDateString('en-GB', weekdayOptions);
    return `${dateStr}, ${dayStr}`;
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'properties': return 'Properties';
      case 'leads': return 'Customers / Leads';
      case 'agreements': return 'Agreements';
      case 'payments': return 'Payments Overview';
      case 'expenses': return 'Expenses';
      case 'tasks': return 'Tasks';
      case 'calendar': return 'Calendar';
      case 'reports': return 'Reports & Analytics';
      case 'users': return 'User Management';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setProfileMenuOpen(!profileMenuOpen);
  };

  // Close profile dropdown when clicking anywhere else
  React.useEffect(() => {
    const closeDropdown = () => setProfileMenuOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  return (
    <header className="header" style={{ position: 'relative' }}>
      {/* Title block with hamburger for mobile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          className="header-icon-btn mobile-only"
          style={{ display: 'none' }} /* Handled in responsive css queries */
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} />
        </button>
        <div className="header-title-section">
          <h2>{getHeaderTitle()}</h2>
          <p>Welcome back, {userName} 👋</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="header-actions-section">
        {/* Real-time search bar */}
        <div className="header-search-bar">
          <Search />
          <input 
            type="text" 
            placeholder="Search here..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Notifications Icon Button */}
        <button 
          type="button" 
          className="header-icon-btn"
          onClick={() => alert(`You have ${notificationCount} new alerts: \n- P002 (Sky Heights) Sold! \n- New Lead Amit Verma registered \n- Agreement generated for P001.`)}
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="header-notification-badge">{notificationCount}</span>
          )}
        </button>

        {/* User profile picture & status block */}
        <div 
          className="header-profile" 
          onClick={handleProfileClick}
          style={{ position: 'relative' }}
        >
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" 
            alt="Profile Avatar" 
          />
          <div className="header-profile-info">
            <h4>{userName}</h4>
            <span>{userRole}</span>
          </div>

          {/* Floating Dropdown Context Menu for User Profile */}
          {profileMenuOpen && (
            <div 
              className="auth-profile-dropdown"
              style={{
                position: 'absolute',
                top: '52px',
                right: '0',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 9999,
                width: '160px',
                overflow: 'hidden',
                animation: 'slide-up 0.2s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                style={{ 
                  padding: '12px', 
                  fontSize: '11.5px', 
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Shield size={12} />
                Access Control
              </div>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  textAlign: 'left',
                  color: 'var(--danger-text)',
                  fontWeight: '600',
                  background: 'transparent'
                }}
                onClick={onLogout}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date row in header bottom */}
      <div className="header-date-row">
        <div className="header-date-badge">
          <Calendar />
          <span>{getFormattedDate()}</span>
        </div>
      </div>
    </header>
  );
}
