import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import LeadModal from '../components/LeadModal';
import './LeadDetail.css';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [fuDate, setFuDate] = useState('');
  const [fuNote, setFuNote] = useState('');
  const [addingFu, setAddingFu] = useState(false);
  const [tab, setTab] = useState('notes');

  const fetchLead = async () => {
    try {
      const { data } = await API.get(`/leads/${id}`);
      setLead(data);
    } catch { toast.error('Failed to load lead'); navigate('/leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      await API.post(`/leads/${id}/notes`, { text: note });
      setNote('');
      fetchLead();
      toast.success('Note added!');
    } catch { toast.error('Failed to add note'); }
    finally { setAddingNote(false); }
  };

  const handleAddFollowUp = async () => {
    if (!fuDate) return toast.error('Select a date');
    setAddingFu(true);
    try {
      await API.post(`/leads/${id}/followups`, { date: fuDate, note: fuNote });
      setFuDate(''); setFuNote('');
      fetchLead();
      toast.success('Follow-up scheduled!');
    } catch { toast.error('Failed to add follow-up'); }
    finally { setAddingFu(false); }
  };

  const handleToggleFu = async (fid) => {
    try {
      await API.patch(`/leads/${id}/followups/${fid}`);
      fetchLead();
    } catch { toast.error('Failed to update'); }
  };

  const handleStatusChange = async (status) => {
    try {
      await API.put(`/leads/${id}`, { ...lead, status });
      fetchLead();
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <div className="detail-loading"><div className="shimmer" style={{ height: 200, borderRadius: 16 }} /></div>;
  if (!lead) return null;

  const STATUSES = ['New','Contacted','Qualified','Proposal','Negotiation','Converted','Lost'];

  return (
    <div className="lead-detail page-enter">
      <div className="detail-breadcrumb">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>← Back to Leads</button>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card detail-hero">
            <div className="detail-hero-left">
              <div className="detail-avatar">{lead.name[0].toUpperCase()}</div>
              <div>
                <h2 className="detail-name">{lead.name}</h2>
                <div className="detail-email">{lead.email}</div>
                {lead.phone && <div className="detail-phone">📞 {lead.phone}</div>}
                {lead.company && <div className="detail-company">🏢 {lead.company}</div>}
              </div>
            </div>
            <div className="detail-hero-right">
              <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>✎ Edit Lead</button>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 className="section-title">Pipeline Status</h3>
            <div className="status-pipeline">
              {STATUSES.map((s, i) => (
                <button
                  key={s}
                  className={`pipeline-step ${lead.status === s ? 'active' : ''} ${STATUSES.indexOf(lead.status) > i ? 'done' : ''}`}
                  onClick={() => handleStatusChange(s)}
                >
                  <span className="step-dot" />
                  <span className="step-label">{s}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="tab-header">
              {['notes', 'followups'].map(t => (
                <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'notes' ? `📝 Notes (${lead.notes?.length || 0})` : `📅 Follow-ups (${lead.followUps?.length || 0})`}
                </button>
              ))}
            </div>

            {tab === 'notes' && (
              <div className="tab-content">
                <div className="add-note-box">
                  <textarea className="form-textarea" placeholder="Add a note about this lead..." value={note} onChange={e => setNote(e.target.value)} rows={3} />
                  <button className="btn btn-primary btn-sm" onClick={handleAddNote} disabled={addingNote || !note.trim()}>
                    {addingNote ? '...' : '+ Add Note'}
                  </button>
                </div>
                <div className="notes-list">
                  {lead.notes?.length === 0 && <div className="empty-tab">No notes yet. Add the first one!</div>}
                  {lead.notes?.map((n) => (
                    <div key={n._id} className="note-item">
                      <div className="note-author">{n.createdByName || 'You'}</div>
                      <div className="note-text">{n.text}</div>
                      <div className="note-time">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'followups' && (
              <div className="tab-content">
                <div className="add-fu-box">
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Follow-up Date</label>
                      <input type="datetime-local" className="form-input" value={fuDate} onChange={e => setFuDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Note (optional)</label>
                      <input type="text" className="form-input" placeholder="e.g. Call to discuss proposal" value={fuNote} onChange={e => setFuNote(e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={handleAddFollowUp} disabled={addingFu || !fuDate}>
                    {addingFu ? '...' : '+ Schedule'}
                  </button>
                </div>
                <div className="fu-list">
                  {lead.followUps?.length === 0 && <div className="empty-tab">No follow-ups scheduled.</div>}
                  {lead.followUps?.sort((a,b) => new Date(a.date) - new Date(b.date)).map((fu) => (
                    <div key={fu._id} className={`fu-item ${fu.completed ? 'completed' : ''}`}>
                      <input type="checkbox" checked={fu.completed} onChange={() => handleToggleFu(fu._id)} className="fu-check" />
                      <div className="fu-body">
                        <div className="fu-date">{new Date(fu.date).toLocaleString()}</div>
                        {fu.note && <div className="fu-note">{fu.note}</div>}
                      </div>
                      <span className={`badge ${fu.completed ? 'badge-converted' : new Date(fu.date) < new Date() ? 'badge-lost' : 'badge-new'}`}>
                        {fu.completed ? 'Done' : new Date(fu.date) < new Date() ? 'Overdue' : 'Upcoming'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="card">
            <h3 className="section-title">Lead Info</h3>
            <div className="info-grid">
              {[
                ['Status', <span className={`badge badge-${lead.status?.toLowerCase()}`}>{lead.status}</span>],
                ['Priority', <span className={`badge badge-${lead.priority?.toLowerCase()}`}>{lead.priority}</span>],
                ['Source', lead.source],
                ['Value', lead.value > 0 ? `$${lead.value.toLocaleString()}` : '—'],
                ['Tags', lead.tags?.length > 0 ? lead.tags.join(', ') : '—'],
                ['Created', new Date(lead.createdAt).toLocaleDateString()],
                ['Updated', new Date(lead.updatedAt).toLocaleDateString()],
              ].map(([label, val]) => (
                <div key={label} className="info-row">
                  <span className="info-label">{label}</span>
                  <span className="info-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <LeadModal lead={lead} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); fetchLead(); }} />
      )}
    </div>
  );
}
