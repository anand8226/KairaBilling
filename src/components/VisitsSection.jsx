import React, { useState } from 'react';
import { Plus, Search, Calendar, User, FileText, CheckCircle2, Clock, X } from 'lucide-react';

export default function VisitsSection({ visits = [], properties = [], agents = [], onScheduleVisit, searchQuery = '' }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [agentName, setAgentName] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !propertyName || !visitDate || !agentName) {
      alert("Please fill in all fields.");
      return;
    }
    onScheduleVisit({
      customerName,
      propertyName,
      visitDate,
      agentName,
      notes
    });
    // Reset
    setCustomerName('');
    setPropertyName('');
    setVisitDate('');
    setAgentName('');
    setNotes('');
    setModalOpen(false);
  };

  const query = searchQuery.toLowerCase();
  const filteredVisits = visits.filter(v => 
    v.customerName.toLowerCase().includes(query) ||
    v.propertyName.toLowerCase().includes(query) ||
    v.agentName.toLowerCase().includes(query)
  );

  return (
    <div style={{ animation: 'fade-in 0.4s ease-out' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Scheduled Site Visits CRM</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Schedule visits, allocate relationship agents, and log follow-up feedback.</p>
        </div>
        <button 
          type="button" 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          Schedule Site Visit
        </button>
      </div>

      {/* Visits Ledger Table */}
      <div className="dashboard-card" style={{ padding: '24px' }}>
        <div className="table-responsive">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Visit ID</th>
                <th>Customer Name</th>
                <th>Target Property</th>
                <th>Scheduled Date & Time</th>
                <th>Assigned Agent</th>
                <th>Follow-up Logs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.length > 0 ? (
                filteredVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{visit.id}</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{visit.customerName}</td>
                    <td style={{ fontWeight: '600' }}>{visit.propertyName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-main)' }}>
                        <Calendar size={13} style={{ color: 'var(--primary-color)' }} />
                        <span>{visit.visitDate}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
                        <User size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{visit.agentName}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {visit.notes || <span style={{ fontStyle: 'italic' }}>No site notes logged.</span>}
                    </td>
                    <td>
                      <span className={`badge ${visit.status === 'Scheduled' ? 'info' : 'success'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {visit.status === 'Scheduled' ? <Clock size={11} /> : <CheckCircle2 size={11} />}
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="table-empty-state">
                    No site visits scheduled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Visit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3>🗓️ Schedule Site Visit</h3>
              <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-form">
                  <div className="form-group">
                    <label htmlFor="visit-cust">Customer Name *</label>
                    <input 
                      type="text" 
                      id="visit-cust"
                      className="form-input"
                      placeholder="e.g. Vineet Kumar" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="visit-prop">Select Target Property *</label>
                    <select
                      id="visit-prop"
                      className="form-select"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      required
                    >
                      <option value="">-- Select Property --</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.name}>{p.id} — {p.name} ({p.type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="visit-date">Scheduled Date & Time *</label>
                    <input 
                      type="datetime-local" 
                      id="visit-date"
                      className="form-input"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="visit-agent">Assign Relationship Agent *</label>
                    <select
                      id="visit-agent"
                      className="form-select"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Agent --</option>
                      {agents.map(a => (
                        <option key={a.userId} value={a.fullName}>{a.fullName} ({a.city})</option>
                      ))}
                      {agents.length === 0 && (
                        <option value="Rajesh Kumar">Rajesh Kumar (Default)</option>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="visit-notes">Feedback / Follow-up Notes</label>
                    <textarea 
                      id="visit-notes"
                      className="form-input"
                      style={{ height: '80px', resize: 'none', padding: '8px' }}
                      placeholder="e.g. Prefers morning visit. Likes plot facing main road." 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
