import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import LeadModal from '../components/LeadModal';
import './Leads.css';

const STATUSES = ['All','New','Contacted','Qualified','Proposal','Negotiation','Converted','Lost'];
const SOURCES = ['All','Website','LinkedIn','Referral','Cold Call','Email Campaign','Social Media','Trade Show','Other'];
const PRIORITIES = ['All','Low','Medium','High','Urgent'];

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filters, setFilters] = useState({ status: 'All', source: 'All', priority: 'All', search: '', page: 1 });
  const [view, setView] = useState('table');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (params.status === 'All') delete params.status;
      if (params.source === 'All') delete params.source;
      if (params.priority === 'All') delete params.priority;
      const { data } = await API.get('/leads', { params: { ...params, limit: 15 } });
      setLeads(data.leads);
      setTotal(data.total);
    } catch (e) { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead permanently?')) return;
    setDeleting(id);
    try {
      await API.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      fetchLeads();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const handleSaved = () => { setShowModal(false); setEditLead(null); fetchLeads(); };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="leads-page page-enter">
      <div className="leads-header">
        <div>
          <h1 className="page-title">Lead Management</h1>
          <p className="page-sub">{total} total leads in your pipeline</p>
        </div>
        <div className="leads-header-actions">
          <div className="view-toggle">
            <button className={`view-btn ${view==='table'?'active':''}`} onClick={() => setView('table')}>≡ Table</button>
            <button className={`view-btn ${view==='grid'?'active':''}`} onClick={() => setView('grid')}>⊞ Grid</button>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditLead(null); setShowModal(true); }}>
            ＋ New Lead
          </button>
        </div>
      </div>

      <div className="filters-bar card">
        <input
          className="form-input search-input"
          placeholder="🔍  Search leads by name, email, company..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
        />
        <div className="filter-row">
          {[['Status', 'status', STATUSES], ['Source', 'source', SOURCES], ['Priority', 'priority', PRIORITIES]].map(([label, key, opts]) => (
            <div key={key} className="filter-group">
              <label className="form-label">{label}</label>
              <select className="form-select" value={filters[key]} onChange={e => setFilter(key, e.target.value)}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{alignSelf:'flex-end'}} onClick={() => setFilters({ status:'All', source:'All', priority:'All', search:'', page:1 })}>
            ✕ Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="leads-skeleton">
          {[...Array(5)].map((_, i) => <div key={i} className="shimmer" style={{ height: 60, borderRadius: 10 }} />)}
        </div>
      ) : leads.length === 0 ? (
        <div className="empty-leads card">
          <div className="empty-icon">◈</div>
          <h3>No leads found</h3>
          <p>Try adjusting your filters or add a new lead to get started.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Add First Lead</button>
        </div>
      ) : view === 'table' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Value</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead._id} className="lead-row" onClick={() => navigate(`/leads/${lead._id}`)}>
                    <td>
                      <div className="lead-name-cell">
                        <div className="lead-avatar">{lead.name[0].toUpperCase()}</div>
                        <div>
                          <div className="lead-name">{lead.name}</div>
                          <div className="lead-email">{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-secondary">{lead.company || '—'}</td>
                    <td><span className="source-tag">{lead.source}</span></td>
                    <td><span className={`badge badge-${lead.status?.toLowerCase()}`}>{lead.status}</span></td>
                    <td><span className={`badge badge-${lead.priority?.toLowerCase()}`}>{lead.priority}</span></td>
                    <td className="font-mono" style={{ color: 'var(--green)' }}>{lead.value > 0 ? `$${lead.value.toLocaleString()}` : '—'}</td>
                    <td className="text-secondary text-sm">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="action-btns">
                        <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => { setEditLead(lead); setShowModal(true); }}>✎</button>
                        <button className="btn btn-icon" title="Delete" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--red)' }} disabled={deleting === lead._id} onClick={() => handleDelete(lead._id)}>
                          {deleting === lead._id ? '...' : '✕'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="leads-grid">
          {leads.map(lead => (
            <div key={lead._id} className="lead-card card" onClick={() => navigate(`/leads/${lead._id}`)}>
              <div className="lead-card-header">
                <div className="lead-avatar-lg">{lead.name[0].toUpperCase()}</div>
                <div className="lead-card-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditLead(lead); setShowModal(true); }}>✎</button>
                  <button className="btn btn-icon btn-sm" style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--red)' }} onClick={() => handleDelete(lead._id)}>✕</button>
                </div>
              </div>
              <div className="lead-card-name">{lead.name}</div>
              <div className="lead-card-email">{lead.email}</div>
              {lead.company && <div className="lead-card-company">🏢 {lead.company}</div>}
              <div className="lead-card-badges">
                <span className={`badge badge-${lead.status?.toLowerCase()}`}>{lead.status}</span>
                <span className={`badge badge-${lead.priority?.toLowerCase()}`}>{lead.priority}</span>
              </div>
              {lead.value > 0 && <div className="lead-card-value">${lead.value.toLocaleString()}</div>}
            </div>
          ))}
        </div>
      )}

      {total > 15 && (
        <div className="pagination">
          <button className="btn btn-ghost btn-sm" disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
          <span className="page-info">Page {filters.page} of {Math.ceil(total / 15)}</span>
          <button className="btn btn-ghost btn-sm" disabled={filters.page >= Math.ceil(total / 15)} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
        </div>
      )}

      {showModal && (
        <LeadModal lead={editLead} onClose={() => { setShowModal(false); setEditLead(null); }} onSaved={handleSaved} />
      )}
    </div>
  );
}
