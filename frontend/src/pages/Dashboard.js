import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SOURCE_COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#a855f7','#ec4899','#64748b'];
const STATUS_COLORS = { New:'#06b6d4', Contacted:'#6366f1', Qualified:'#10b981', Proposal:'#a855f7', Negotiation:'#f59e0b', Converted:'#34d399', Lost:'#ef4444' };

function StatCard({ icon, label, value, sub, color, trend }) {
  return (
    <div className="stat-card card">
      <div className="stat-card-top">
        <div className="stat-ring" style={{ background: `${color}20`, color }}>{icon}</div>
        {trend !== undefined && (
          <span className={`trend-badge ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, a] = await Promise.all([
          API.get('/dashboard/stats'),
          API.get('/dashboard/trends'),
          API.get('/activities?limit=8')
        ]);
        setStats(s.data);
        setTrends(t.data.map(d => ({
          month: MONTHS[d._id.month - 1],
          leads: d.count,
          converted: d.converted,
          value: d.value
        })));
        setActivities(a.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="dashboard-loading">
      {[...Array(4)].map((_, i) => <div key={i} className="shimmer" style={{ height: 120, borderRadius: 16 }} />)}
    </div>
  );

  const sourceData = stats?.bySource?.map(s => ({ name: s._id, value: s.count })) || [];
  const statusData = stats?.byStatus?.map(s => ({ name: s._id, value: s.count })) || [];

  return (
    <div className="dashboard page-enter">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">{greet()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here's what's happening with your leads today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/leads')}>
          ＋ Add New Lead
        </button>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon="◈" label="Total Leads" value={stats?.totalLeads ?? 0} color="var(--accent)" />
        <StatCard icon="✦" label="New Leads" value={stats?.newLeads ?? 0} color="var(--cyan)" />
        <StatCard icon="✓" label="Converted" value={stats?.convertedLeads ?? 0} sub={`${stats?.conversionRate}% rate`} color="var(--green)" />
        <StatCard icon="$" label="Pipeline Value" value={`$${(stats?.totalValue ?? 0).toLocaleString()}`} color="var(--amber)" />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Lead Growth</h3>
            <span className="card-badge">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" name="Leads" stroke="#6366f1" fill="url(#gLeads)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="converted" name="Converted" stroke="#10b981" fill="url(#gConv)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Leads by Source</h3>
            <span className="card-badge">{sourceData.length} sources</span>
          </div>
          <div className="pie-wrap">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {sourceData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {sourceData.map((s, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-dot" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                  <span className="legend-label">{s.name}</span>
                  <span className="legend-val">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Pipeline by Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Leads" radius={[4, 4, 0, 0]}>
                {statusData.map((s, i) => <Cell key={i} fill={STATUS_COLORS[s.name] || '#6366f1'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Recent Activity</h3>
            <span className="card-badge">Live</span>
          </div>
          <div className="activity-list">
            {activities.length === 0 ? (
              <div className="empty-state-sm">No activity yet</div>
            ) : activities.map((a) => (
              <div key={a._id} className="activity-item">
                <div className={`activity-dot dot-${a.type}`} />
                <div className="activity-body">
                  <div className="activity-msg">{a.message}</div>
                  <div className="activity-time">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {stats?.recentLeads?.length > 0 && (
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Recent Leads</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View All →</button>
          </div>
          <div className="recent-leads-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLeads.map(l => (
                  <tr key={l._id} onClick={() => navigate(`/leads/${l._id}`)} className="clickable-row">
                    <td><strong>{l.name}</strong></td>
                    <td className="text-secondary">{l.email}</td>
                    <td><span className={`badge badge-${l.status?.toLowerCase()}`}>{l.status}</span></td>
                    <td><span className={`badge badge-${l.priority?.toLowerCase()}`}>{l.priority}</span></td>
                    <td className="text-secondary text-sm">{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
