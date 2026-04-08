import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';

const STATUSES = ['New','Contacted','Qualified','Proposal','Negotiation','Converted','Lost'];
const SOURCES = ['Website','LinkedIn','Referral','Cold Call','Email Campaign','Social Media','Trade Show','Other'];
const PRIORITIES = ['Low','Medium','High','Urgent'];

export default function LeadModal({ lead, onClose, onSaved }) {
  const isEdit = !!lead;
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    source: 'Website', status: 'New', priority: 'Medium',
    value: '', tags: '',
    ...(lead || {})
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) setForm({ ...lead, tags: lead.tags?.join(', ') || '', value: lead.value || '' });
  }, [lead]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast.error('Name and email are required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value) || 0,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      if (isEdit) await API.put(`/leads/${lead._id}`, payload);
      else await API.post('/leads', payload);
      toast.success(isEdit ? 'Lead updated!' : 'Lead created!');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lead');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
            {isEdit ? '✎ Edit Lead' : '＋ New Lead'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" className="form-input" placeholder="john@company.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input name="phone" className="form-input" placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input name="company" className="form-input" placeholder="Acme Corp" value={form.company} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Source</label>
              <select name="source" className="form-select" value={form.source} onChange={handleChange}>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select name="priority" className="form-select" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deal Value ($)</label>
              <input name="value" type="number" className="form-input" placeholder="0" value={form.value} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input name="tags" className="form-input" placeholder="enterprise, hot-lead, q4" value={form.tags} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '...' : isEdit ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
