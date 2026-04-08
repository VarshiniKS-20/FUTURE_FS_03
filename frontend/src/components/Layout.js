import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NavItem = ({ to, icon, label, collapsed }) => (
  <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    <span className="nav-icon">{icon}</span>
    {!collapsed && <span className="nav-label">{label}</span>}
  </NavLink>
);

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">⬡</div>
            {!collapsed && <div className="logo-text"><span className="logo-main">Nexus</span><span className="logo-sub">CRM</span></div>}
          </div>
          <button className="collapse-btn hide-mobile" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">{!collapsed && 'MAIN'}</div>
          <NavItem to="/dashboard" icon="⬡" label="Dashboard" collapsed={collapsed} />
          <NavItem to="/leads" icon="◈" label="Leads" collapsed={collapsed} />
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button className="logout-btn" onClick={handleLogout}>
              <span>⎋</span> Logout
            </button>
          )}
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="user-avatar-sm">{user?.name?.[0]?.toUpperCase()}</div>
              <span className="hide-mobile">{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
