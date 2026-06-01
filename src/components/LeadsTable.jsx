import React from 'react';

export default function LeadsTable({ 
  leads, 
  searchQuery, 
  userRole = 'Agent', 
  agents = [], 
  onAssignLead 
}) {
  // Filter leads based on search query
  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.mobile.toLowerCase().includes(query) ||
      lead.requirement.toLowerCase().includes(query) ||
      lead.status.toLowerCase().includes(query) ||
      (lead.assignedTo && lead.assignedTo.toLowerCase().includes(query))
    );
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Follow-up': return 'badge warning';
      case 'New Lead': return 'badge info';
      case 'Interested': return 'badge success';
      default: return 'badge info';
    }
  };

  return (
    <div className="dashboard-card" style={{ flex: 1 }}>
      <div className="card-header">
        <h3>Recent Leads</h3>
        <button 
          type="button" 
          className="card-view-all" 
          onClick={() => alert("🔍 View All Leads: Redirecting to complete Customer Relationship Management (CRM) leads boards.")}
        >
          View All
        </button>
      </div>

      <div className="table-responsive">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Requirement</th>
              <th>Assigned Agent</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="customer-profile-td">
                    <img 
                      src={lead.avatar} 
                      alt={lead.name} 
                      className="customer-avatar"
                    />
                    <span style={{ fontWeight: '600' }}>{lead.name}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    {lead.mobile}
                  </td>
                  <td style={{ fontWeight: '500' }}>{lead.requirement}</td>
                  <td>
                    {userRole === 'Manager' || userRole === 'Super Admin' ? (
                      <select
                        className="auth-phone-select"
                        style={{ 
                          padding: '6px 10px', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          border: '1px solid var(--border-color)',
                          background: 'linear-gradient(to bottom, #fff, #f9fafb)',
                          cursor: 'pointer',
                          color: 'var(--text-main)',
                          width: '100%',
                          minWidth: '130px'
                        }}
                        value={lead.assignedTo || 'Unassigned'}
                        onChange={(e) => onAssignLead && onAssignLead(lead.id, e.target.value)}
                      >
                        <option value="Unassigned">Unassigned</option>
                        {agents.map((agent) => (
                          <option key={agent.userId || agent.fullName} value={agent.fullName}>
                            {agent.fullName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span 
                        className={`badge ${lead.assignedTo && lead.assignedTo !== 'Unassigned' ? 'info' : 'secondary'}`}
                        style={{ fontSize: '11px', fontWeight: '600' }}
                      >
                        {lead.assignedTo || 'Unassigned'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(lead.status)}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="table-empty-state">
                  No leads match your search term.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
