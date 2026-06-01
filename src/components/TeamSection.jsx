import React from 'react';
import { Mail, Phone, MapPin, Award, UserCheck, Users, ShieldAlert, Award as Trophy } from 'lucide-react';

export default function TeamSection({ agents = [], leads = [], searchQuery = '' }) {
  // Compute Manager Stats
  const activeAgentsCount = agents.length;
  const unassignedLeads = leads.filter(l => !l.assignedTo || l.assignedTo === 'Unassigned').length;
  const assignedLeads = leads.length - unassignedLeads;
  
  // Calculate a mockConversionRate
  const conversionRate = leads.length > 0 
    ? Math.round((leads.filter(l => l.status === 'Interested').length / leads.length) * 100) 
    : 72;

  // Filter agents by search query
  const filteredAgents = agents.filter(agent => {
    const query = searchQuery.toLowerCase();
    return (
      agent.fullName.toLowerCase().includes(query) ||
      (agent.city && agent.city.toLowerCase().includes(query)) ||
      agent.emailAddress.toLowerCase().includes(query) ||
      agent.phoneNumber.includes(query)
    );
  });

  // Calculate dynamic properties count and conversion count per agent
  const getAgentStats = (agentName) => {
    const assigned = leads.filter(l => l.assignedTo === agentName).length;
    const closed = leads.filter(l => l.assignedTo === agentName && l.status === 'Interested').length;
    return { assigned, closed };
  };

  return (
    <div className="team-section-container" style={{ animation: 'fade-in 0.4s ease-out' }}>
      
      {/* Dynamic Team Performance Overview Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card blue">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper">
              <Users size={20} />
            </div>
            <div className="stat-value">{activeAgentsCount}</div>
          </div>
          <div className="stat-title">Active Agents</div>
          <div className="stat-subtext">On-Field Support</div>
        </div>

        <div className="stat-card green">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper">
              <Trophy size={20} />
            </div>
            <div className="stat-value">Rajesh Kumar</div>
          </div>
          <div className="stat-title">Top Performing Agent</div>
          <div className="stat-subtext">3 Leads Closed</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper">
              <ShieldAlert size={20} />
            </div>
            <div className="stat-value">{unassignedLeads}</div>
          </div>
          <div className="stat-title">Unassigned Leads</div>
          <div className="stat-subtext">Needs Immediate Action</div>
        </div>

        <div className="stat-card teal">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper">
              <UserCheck size={20} />
            </div>
            <div className="stat-value">{conversionRate}%</div>
          </div>
          <div className="stat-title">Team Conversion Rate</div>
          <div className="stat-subtext">Average Conversion</div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="dashboard-card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Your Active Team Members</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Track performance, locations, contact info, and lead assignments.
            </p>
          </div>
          <span className="badge info" style={{ padding: '6px 12px', borderRadius: '20px', fontWeight: '600' }}>
            {filteredAgents.length} Agents Registered
          </span>
        </div>

        {filteredAgents.length > 0 ? (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '20px',
              marginTop: '10px'
            }}
          >
            {filteredAgents.map((agent, index) => {
              const { assigned, closed } = getAgentStats(agent.fullName);
              return (
                <div 
                  key={agent.userId || index} 
                  className="agent-card"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  {/* Performance Ribbon Badge for top performer */}
                  {agent.fullName === 'Rajesh Kumar' && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Award size={12} />
                      Top Star
                    </div>
                  )}

                  {/* Header: Photo and Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <img 
                      src={agent.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"} 
                      alt={agent.fullName} 
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--primary-light)'
                      }}
                    />
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>{agent.fullName}</h4>
                      <span className="badge success" style={{ fontSize: '10.5px', marginTop: '4px', display: 'inline-block' }}>
                        Agent
                      </span>
                    </div>
                  </div>

                  {/* Body: Contact details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} style={{ color: 'var(--primary-color)' }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{agent.emailAddress}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} style={{ color: 'var(--primary-color)' }} />
                      <span>{agent.phoneNumber}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} style={{ color: 'var(--primary-color)' }} />
                      <span>{agent.city || 'Mumbai'}, {agent.state || 'Maharashtra'}</span>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '14px' }} />

                  {/* Footer: KPIs/Metrics */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{assigned}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Leads Assigned</div>
                    </div>
                    <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--success-text)' }}>{closed}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Leads Closed</div>
                    </div>
                    <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary-color)' }}>Active</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Status</div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No agents match your search filter.</p>
          </div>
        )}

      </div>
    </div>
  );
}
