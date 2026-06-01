import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

export default function PropertiesTable({ 
  properties, 
  searchQuery, 
  onUpdateStatus, 
  onDeleteProperty,
  userRole = 'Agent',
  onSellProperty
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const isManager = userRole === 'Manager' || userRole === 'Super Admin';

  // Format currency for Indian Rupees
  const formatCurrency = (price, status) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);

    return status === 'Rented' ? `${formatted} / mo` : formatted;
  };

  // Filter properties based on search query
  const filteredProperties = properties.filter((prop) => {
    const query = searchQuery.toLowerCase();
    return (
      prop.id.toLowerCase().includes(query) ||
      prop.name.toLowerCase().includes(query) ||
      prop.type.toLowerCase().includes(query) ||
      prop.status.toLowerCase().includes(query)
    );
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Available': return 'badge success';
      case 'Sold': return 'badge danger';
      case 'Rented': return 'badge info';
      default: return 'badge success';
    }
  };

  const handleMenuToggle = (e, id) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  // Close actions menu when clicking outside
  React.useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  return (
    <div className="dashboard-card" style={{ flex: 1 }}>
      <div className="card-header">
        <h3>Recent Properties</h3>
        <button 
          type="button" 
          className="card-view-all" 
          onClick={() => alert("🔍 View All Properties: Redirecting to complete Properties Ledger registry.")}
        >
          View All
        </button>
      </div>

      <div className="table-responsive">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Property ID</th>
              <th>Property Name</th>
              <th>Type</th>
              <th>Status</th>
              {isManager && <th>Purchase Cost</th>}
              <th>Listing Price</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.length > 0 ? (
              filteredProperties.map((prop) => (
                <tr key={prop.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{prop.id}</td>
                  <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{prop.name}</td>
                  <td>{prop.type}</td>
                  <td>
                    <span className={getStatusBadgeClass(prop.status)}>
                      {prop.status}
                    </span>
                  </td>
                  {isManager && (
                    <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>
                      {formatCurrency(prop.purchasePrice || 0, 'Available')}
                    </td>
                  )}
                  <td style={{ fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', minWidth: '140px' }}>
                      <span>{formatCurrency(prop.price, prop.status)}</span>
                      {isManager && prop.status === 'Available' && (
                        <button
                          type="button"
                          className="badge success"
                          style={{
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontWeight: '800',
                            fontSize: '11px',
                            background: '#16a34a',
                            color: '#fff',
                            boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSellProperty && onSellProperty(prop);
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#15803d'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#16a34a'}
                        >
                          🤝 Sell
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      className="action-dot-btn"
                      onClick={(e) => handleMenuToggle(e, prop.id)}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Interactive context menu for each property row */}
                    {activeMenuId === prop.id && (
                      <div 
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '36px',
                          background: '#fff',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          boxShadow: 'var(--shadow-lg)',
                          zIndex: 10,
                          width: '140px',
                          overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isManager && prop.status !== 'Sold' && (
                          <button
                            type="button"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '10px 12px',
                              fontSize: '12px',
                              textAlign: 'left',
                              borderBottom: '1px solid var(--border-color)',
                              color: 'var(--success-text)',
                              fontWeight: '600'
                            }}
                            onClick={() => {
                              onSellProperty && onSellProperty(prop);
                              setActiveMenuId(null);
                            }}
                          >
                            🤝 Sell Property
                          </button>
                        )}
                        <button
                          type="button"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '12px',
                            textAlign: 'left',
                            borderBottom: '1px solid var(--border-color)'
                          }}
                          onClick={() => {
                            const newStatus = prop.status === 'Available' ? 'Sold' : prop.status === 'Sold' ? 'Rented' : 'Available';
                            onUpdateStatus(prop.id, newStatus);
                            setActiveMenuId(null);
                          }}
                        >
                          <Edit2 size={12} />
                          Toggle Status
                        </button>
                        <button
                          type="button"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '12px',
                            textAlign: 'left',
                            color: 'var(--danger-text)'
                          }}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${prop.name}?`)) {
                              onDeleteProperty(prop.id);
                            }
                            setActiveMenuId(null);
                          }}
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isManager ? "7" : "6"} className="table-empty-state">
                  No properties match your search term.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
