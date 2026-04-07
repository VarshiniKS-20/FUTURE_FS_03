import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">📊</div>
          <h2>Mini CRM</h2>
          <p>Lead Management System</p>
        </div>

        <nav>
          <NavLink to="/" end>
            <div className="nav-icon">🏠</div>
            Dashboard
          </NavLink>
          <NavLink to="/leads">
            <div className="nav-icon">👥</div>
            Leads
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div className="sidebar-user-info">
              <strong>{user?.name || 'Admin'}</strong>
              <p>{user?.email}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
