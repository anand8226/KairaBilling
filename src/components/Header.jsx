import React, { useState } from 'react';
import { Search, Bell, Calendar, Menu, LogOut, Shield, Camera, X, Check } from 'lucide-react';

export default function Header({ 
  activeTab, 
  searchQuery, 
  setSearchQuery, 
  sidebarOpen, 
  setSidebarOpen,
  leads = [],
  userName = 'Admin',
  userRole = 'Agent',
  userId = '',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
  onUpdateAvatar,
  onLogout 
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(userAvatar);
  const [customUrl, setCustomUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ Photo size is too large! Please choose an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result); // Base64 data URL
      setCustomUrl('');
    };
    reader.readAsDataURL(file);
  };

  const PRESET_AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
  ];

  const handleSaveAvatar = async () => {
    let finalAvatar = selectedAvatar;
    if (customUrl.trim() !== '') {
      finalAvatar = customUrl.trim();
    }

    setSaving(true);
    try {
      if (userId) {
        const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}/profile-image`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileImage: finalAvatar })
        });
        
        if (response.ok) {
          onUpdateAvatar(finalAvatar);
          alert("✅ Profile picture has been successfully updated in MySQL database!");
        } else {
          throw new Error("Failed to save on server");
        }
      } else {
        onUpdateAvatar(finalAvatar);
      }
    } catch (e) {
      console.warn("⚠️ API offline or error. Updating locally inside local storage fallback.");
      onUpdateAvatar(finalAvatar);
    } finally {
      setSaving(false);
      setAvatarModalOpen(false);
      setCustomUrl('');
    }
  };

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

  const newLeads = Array.isArray(leads) ? leads.filter(l => l.status === 'New Lead') : [];
  const notificationCount = newLeads.length;

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setProfileMenuOpen(!profileMenuOpen);
    setNotificationsOpen(false);
  };

  const handleBellClick = (e) => {
    e.stopPropagation();
    setNotificationsOpen(!notificationsOpen);
    setProfileMenuOpen(false);
  };

  // Close dropdowns when clicking anywhere else
  React.useEffect(() => {
    const closeDropdowns = () => {
      setProfileMenuOpen(false);
      setNotificationsOpen(false);
    };
    window.addEventListener('click', closeDropdowns);
    return () => window.removeEventListener('click', closeDropdowns);
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
        <div style={{ position: 'relative' }}>
          <button 
            type="button" 
            className="header-icon-btn"
            onClick={handleBellClick}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="header-notification-badge">{notificationCount}</span>
            )}
          </button>

          {/* Floating Dropdown Context Menu for Dynamic CRM Notifications */}
          {notificationsOpen && (
            <div 
              className="auth-profile-dropdown"
              style={{
                position: 'absolute',
                top: '52px',
                right: '0',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 9999,
                width: '320px',
                overflow: 'hidden',
                animation: 'slide-up 0.2s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dropdown Header */}
              <div 
                style={{ 
                  padding: '16px', 
                  fontSize: '13px', 
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: '800'
                }}
              >
                <span>Dynamic CRM Feeds</span>
                <span className="badge info" style={{ fontSize: '9.5px', padding: '2px 8px', fontWeight: '800' }}>
                  {notificationCount} New Leads
                </span>
              </div>

              {/* Dropdown Body */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {newLeads.length > 0 ? (
                  newLeads.map((l) => (
                    <div 
                      key={l.id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Lead Avatar */}
                      <img 
                        src={l.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'} 
                        alt={l.name} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)', marginTop: '2px' }}
                      />
                      {/* Lead details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: '750', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {l.name}
                          </span>
                          <span style={{ fontSize: '8px', color: 'var(--text-light)', fontWeight: '600' }}>ID: {l.id}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                          Requirement: <strong>{l.requirement}</strong>
                        </span>
                        <span style={{ fontSize: '9px', color: 'var(--primary)', fontWeight: '700', marginTop: '2px' }}>
                          📞 {l.mobile}
                        </span>
                      </div>
                      {/* Glowing blue dot */}
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        boxShadow: '0 0 6px var(--primary)',
                        flexShrink: 0,
                        marginTop: '14px'
                      }}></span>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '30px 20px',
                    textAlign: 'center',
                    color: 'var(--text-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '24px' }}>🎉</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '750', color: 'var(--text-main)' }}>Pipeline is fully active!</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>No pending new leads in MySQL.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown Footer */}
              <div 
                style={{ 
                  padding: '10px', 
                  background: 'var(--bg-main)', 
                  textAlign: 'center', 
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: 'var(--text-muted)'
                }}
              >
                PropDeal ERP Live CRM Feed
              </div>
            </div>
          )}
        </div>

        {/* User profile picture & status block */}
        <div 
          className="header-profile" 
          onClick={handleProfileClick}
          style={{ position: 'relative' }}
        >
          <img 
            src={userAvatar} 
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

              {/* Edit Profile Pic Trigger button */}
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
                  color: 'var(--primary)',
                  fontWeight: '600',
                  background: 'transparent',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAvatar(userAvatar);
                  setAvatarModalOpen(true);
                  setProfileMenuOpen(false);
                }}
              >
                <Camera size={14} />
                Edit Profile Pic
              </button>

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
                  background: 'transparent',
                  cursor: 'pointer'
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

      {/* -------------------------------------------------------------
        * PROFILE PIC UPDATE GLASSMORPHIC MODAL
        * ------------------------------------------------------------- */}
      {avatarModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setAvatarModalOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '400px', padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={18} />
                Update Profile Picture
              </h3>
              <button type="button" onClick={() => setAvatarModalOpen(false)} style={{ color: 'var(--text-light)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Presets Title */}
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>Choose Preset Avatar</label>
              
              {/* Grid presets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {PRESET_AVATARS.map((preset, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      position: 'relative', 
                      height: '80px', 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      cursor: 'pointer',
                      border: selectedAvatar === preset ? '3px solid var(--primary)' : '2px solid transparent',
                      boxShadow: selectedAvatar === preset ? '0 4px 10px rgba(30,111,253,0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => {
                      setSelectedAvatar(preset);
                      setCustomUrl('');
                    }}
                  >
                    <img src={preset} alt={`Preset ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {selectedAvatar === preset && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'var(--primary)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom URL Input */}
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                <label htmlFor="custom-avatar-input" style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Or Paste Custom Image URL
                </label>
                <input 
                  type="text" 
                  id="custom-avatar-input"
                  className="form-input" 
                  style={{ fontSize: '12px', height: '36px' }}
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setSelectedAvatar('');
                  }}
                />
              </div>

              {/* Local File / Gallery Upload Input */}
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
                <label htmlFor="gallery-avatar-input" style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Or Upload from Gallery / Laptop
                </label>
                <input 
                  type="file" 
                  id="gallery-avatar-input"
                  accept="image/*"
                  style={{ fontSize: '12.5px', color: 'var(--text-main)', width: '100%' }}
                  onChange={handleFileChange}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
                  Supports JPG, PNG (Max size: 2MB)
                </span>
              </div>

              {/* Dynamic Selection Preview */}
              {selectedAvatar && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', borderTop: '1px dashed var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Selected Photo Preview</span>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '3px solid var(--primary)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <img src={selectedAvatar} alt="Live Selected Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '600' }} onClick={() => setAvatarModalOpen(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '600', background: 'var(--primary)' }}
                onClick={handleSaveAvatar}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
