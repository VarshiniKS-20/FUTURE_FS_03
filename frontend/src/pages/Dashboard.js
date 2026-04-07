import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = {
  new: '#6ea8ff',
  contacted: '#ffd166',
  converted: '#10e8a0',
  lost: '#ff6b6b'
};

const SOURCE_COLORS = ['#4f8ef7', '#8b5cf6', '#10e8a0', '#ffd166', '#ff9f43', '#ff6b6b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'rgba(11,17,38,0.98)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
      }}>
        <p style={{ color: '#9aaace', marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#f0f4ff', fontWeight: 600 }}>{payload[0].value} leads</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/leads/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      Loading dashboard...
    </div>
  );

  const statusMap = {};
  stats?.byStatus?.forEach(s => { statusMap[s._id] = s.count; });

  const statusChartData = ['new', 'contacted', 'converted', 'lost'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: statusMap[s] || 0,
    fill: STATUS_COLORS[s]
  })).filter(d => d.value > 0);

  const sourceChartData = (stats?.bySource || []).map(s => ({
    name: s._id,
    value: s.count
  }));

  const conversionRate = stats?.total > 0
    ? Math.round(((statusMap['converted'] || 0) / stats.total) * 100)
    : 0;

  const statCards = [
    {
      label: 'Total Leads',
      value: stats?.total || 0,
      sub: 'All time',
      icon: '👥',
      color: '#4f8ef7',
      glow: '#4f8ef7',
      bg: 'rgba(79,142,247,0.1)'
    },
    {
      label: 'New',
      value: statusMap['new'] || 0,
      sub: 'Awaiting contact',
      icon: '🆕',
      color: '#6ea8ff',
      glow: '#6ea8ff',
      bg: 'rgba(110,168,255,0.1)'
    },
    {
      label: 'Converted',
      value: statusMap['converted'] || 0,
      sub: 'Clients won',
      icon: '✅',
      color: '#10e8a0',
      glow: '#10e8a0',
      bg: 'rgba(16,232,160,0.1)'
    },
    {
      label: 'Conv. Rate',
      value: `${conversionRate}%`,
      sub: 'Leads to clients',
      icon: '📈',
      color: '#ffd166',
      glow: '#ffd166',
      bg: 'rgba(255,209,102,0.1)'
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your lead pipeline overview.</p>
        </div>
        <a href="/leads" className="btn btn-primary">
          + Add Lead
        </a>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map((card, i) => (
          <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div
              className="stat-card-glow"
              style={{ background: card.glow }}
            />
            <div className="stat-icon" style={{ background: card.bg }}>
              {card.icon}
            </div>
            <div className="label">{card.label}</div>
            <div className="value" style={{ color: card.color }}>{card.value}</div>
            <div className="sub">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Status Summary */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', animation: 'fadeUp 0.4s ease 0.25s both' }}>
        {['new', 'contacted', 'converted', 'lost'].map(s => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--glass)', border: '1px solid var(--glass-border)',
            borderRadius: 10, padding: '8px 14px', fontSize: 13
          }}>
            <span className={`badge ${s}`}>{s}</span>
            <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
              {statusMap[s] || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {statusChartData.length > 0 && (
          <div className="chart-card">
            <div className="chart-title">Leads by Status</div>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {statusChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(11,17,38,0.98)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, fontSize: 12
                  }}
                />
                <Legend
                  iconType="circle" iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: 'var(--text2)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {sourceChartData.length > 0 && (
          <div className="chart-card">
            <div className="chart-title">Leads by Source</div>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={sourceChartData} barSize={24}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text2)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text2)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {sourceChartData.map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats?.recentLeads?.length > 0 && (
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <div className="chart-title">New Leads — Last 7 Days</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.recentLeads} barSize={32}>
                <XAxis
                  dataKey="_id"
                  tick={{ fill: 'var(--text2)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text2)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f8ef7" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats?.total === 0 && (
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <div className="empty">
              <span className="icon">📊</span>
              <h3>No data yet</h3>
              <p>Add some leads to see your charts here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
