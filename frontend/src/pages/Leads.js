import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const STATUS_OPTIONS = ['new', 'contacted', 'converted', 'lost'];
const SOURCE_OPTIONS = ['Website', 'Referral', 'Social Media', 'Email', 'Cold Call', 'Other'];
const EMPTY_FORM = { name: '', email: '', phone: '', company: '', source: 'Website', status: 'new', message: '' };

function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{status}</span>;
}

function LeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead ? { ...lead } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (lead?._id) {
        const res = await axios.put(`/api/leads/${lead._id}`, form);
        onSave(res.data, 'update');
      } else {
        const res = await axios.post('/api/leads', form);
        onSave(res.data, 'create');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{lead?._id ? '✏️ Edit Lead' : '➕ Add New Lead'}</h2>
            <p>{lead?._id ? 'Update lead information' : 'Fill in the details to create a new lead'}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Corp" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Lead Source</label>
              <select name="source" value={form.source} onChange={handleChange}>
                {SOURCE_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Initial Message / Notes</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="What did this lead say or ask about?" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : lead?._id ? '✅ Update Lead' : '✅ Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LeadDetailModal({ lead: initialLead, onClose, onUpdate }) {
  const [lead, setLead] = useState(initialLead);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const addNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await axios.post(`/api/leads/${lead._id}/notes`, { text: noteText });
      setLead(res.data);
      onUpdate(res.data);
      setNoteText('');
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (lead.status === newStatus) return;
    setChangingStatus(true);
    try {
      const res = await axios.put(`/api/leads/${lead._id}`, { status: newStatus });
      setLead(res.data);
      onUpdate(res.data);
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setChangingStatus(false);
    }
  };

  const formatDate = d => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <div>
            <h2>👤 {lead.name}</h2>
            <p>{lead.email}{lead.company ? ` · ${lead.company}` : ''}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Status Selector */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-label">Update Status</div>
          <div className="status-btn-group">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                className={`status-btn ${s}${lead.status === s ? ' active' : ''}`}
                onClick={() => updateStatus(s)}
                disabled={changingStatus}
              >
                {lead.status === s ? '✓ ' : ''}{s}
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Info Grid */}
        <div className="section-label">Lead Details</div>
        <div className="info-grid" style={{ marginBottom: 20 }}>
          {lead.phone && (
            <div className="info-item">
              <div className="key">📞 Phone</div>
              <div className="val">{lead.phone}</div>
            </div>
          )}
          {lead.company && (
            <div className="info-item">
              <div className="key">🏢 Company</div>
              <div className="val">{lead.company}</div>
            </div>
          )}
          <div className="info-item">
            <div className="key">🌐 Source</div>
            <div className="val">{lead.source}</div>
          </div>
          <div className="info-item">
            <div className="key">📅 Created</div>
            <div className="val" style={{ fontSize: 12 }}>{formatDate(lead.createdAt)}</div>
          </div>
        </div>

        {lead.message && (
          <div style={{ marginBottom: 20 }}>
            <div className="section-label">Initial Message</div>
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid var(--glass-border)',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 13,
              color: 'var(--text3)',
              lineHeight: 1.7
            }}>
              {lead.message}
            </div>
          </div>
        )}

        <div className="divider" />

        {/* Follow-up Notes */}
        <div>
          <div className="section-label">
            Follow-up Notes
            {lead.notes?.length > 0 && (
              <span style={{
                background: 'rgba(79,142,247,0.15)',
                color: 'var(--blue2)',
                borderRadius: 20,
                padding: '1px 8px',
                fontSize: 10,
                fontFamily: 'var(--mono)'
              }}>
                {lead.notes.length}
              </span>
            )}
          </div>

          {lead.notes?.length > 0 ? (
            <div className="notes-list">
              {[...lead.notes].reverse().map((note, i) => (
                <div className="note-item" key={i}>
                  <div>{note.text}</div>
                  <div className="note-meta">{formatDate(note.createdAt)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text2)', fontSize: 13, margin: '10px 0' }}>No notes yet. Add your first follow-up below.</p>
          )}

          <div className="note-add">
            <input
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Write a follow-up note..."
              onKeyDown={e => e.key === 'Enter' && addNote()}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={addNote}
              disabled={addingNote || !noteText.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              {addingNote ? '...' : '+ Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);

  const fetchLeads = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      const res = await axios.get('/api/leads', { params });
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchLeads, 300);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const handleSave = (saved, type) => {
    if (type === 'create') setLeads(prev => [saved, ...prev]);
    else setLeads(prev => prev.map(l => l._id === saved._id ? saved : l));
  };

  const handleUpdate = (updated) => {
    setLeads(prev => prev.map(l => l._id === updated._id ? updated : l));
    if (viewLead?._id === updated._id) setViewLead(updated);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this lead permanently?')) return;
    try {
      await axios.delete(`/api/leads/${id}`);
      setLeads(prev => prev.filter(l => l._id !== id));
    } catch { alert('Failed to delete lead'); }
  };

  const formatDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Leads</h1>
          <p>{leads.length} lead{leads.length !== 1 ? 's' : ''} in your pipeline</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Add Lead
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="table-title">All Leads</span>
            <span className="table-count">({leads.length})</span>
          </div>
          <div className="filters">
            <input
              placeholder="🔍 Search name, email, company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 230 }}
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
              <option value="">All Sources</option>
              {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {(search || statusFilter || sourceFilter) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); setSourceFilter(''); }}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="empty">
            <span className="icon">📭</span>
            <h3>No leads found</h3>
            <p>{search || statusFilter || sourceFilter ? 'Try adjusting your filters' : 'Add your first lead to get started'}</p>
            {!search && !statusFilter && !sourceFilter && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddModal(true)}>
                ➕ Add First Lead
              </button>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name & Contact</th>
                <th>Company</th>
                <th>Source</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id} onClick={() => setViewLead(lead)}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--blue2)', marginBottom: 2 }}>
                      {lead.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{lead.email}</div>
                    {lead.phone && <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>{lead.phone}</div>}
                  </td>
                  <td style={{ color: 'var(--text3)' }}>{lead.company || '—'}</td>
                  <td>
                    <span style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 6,
                      padding: '3px 9px',
                      fontSize: 12,
                      color: 'var(--text3)'
                    }}>
                      {lead.source}
                    </span>
                  </td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td>
                    {lead.notes?.length > 0 ? (
                      <span style={{
                        background: 'rgba(79,142,247,0.12)',
                        color: 'var(--blue2)',
                        borderRadius: 20,
                        padding: '2px 10px',
                        fontSize: 12,
                        fontFamily: 'var(--mono)'
                      }}>
                        {lead.notes.length}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text2)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{formatDate(lead.createdAt)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewLead(lead)} title="View">👁</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditLead(lead)} title="Edit">✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(lead._id, e)} title="Delete">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && <LeadModal onClose={() => setShowAddModal(false)} onSave={handleSave} />}
      {editLead && <LeadModal lead={editLead} onClose={() => setEditLead(null)} onSave={handleSave} />}
      {viewLead && <LeadDetailModal lead={viewLead} onClose={() => setViewLead(null)} onUpdate={handleUpdate} />}
    </div>
  );
}
