import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [showPass, setShowPass] = useState(false);
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (mode === 'login') {
      result = await login(form.email, form.password);
    } else {
      if (!form.name.trim()) return toast.error('Name is required');
      result = await register(form.name, form.email, form.password, form.role);
    }
    if (result.success) {
      toast.success(mode === 'login' ? 'Welcome back! 👋' : 'Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-orb orb-3" />
        <div className="bg-grid" />
      </div>

      <div className="login-container">
        <div className="login-left hide-mobile">
          <div className="login-brand">
            <div className="brand-icon">⬡</div>
            <div>
              <div className="brand-name">NexusCRM</div>
              <div className="brand-tagline">Lead Intelligence Platform</div>
            </div>
          </div>
          <div className="login-hero-text">
            <h1>Turn leads into<br /><span className="gradient-text">revenue</span></h1>
            <p>Manage your client pipeline with precision. Track every lead, close every deal.</p>
          </div>
          <div className="login-stats">
            {[['∞', 'Leads Tracked'], ['↗', 'Conversion Rate'], ['⚡', 'Real-time Updates']].map(([icon, label]) => (
              <div className="login-stat" key={label}>
                <span className="stat-icon">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <div className="mobile-logo">
                <div className="brand-icon-sm">⬡</div>
                <span className="brand-name-sm">NexusCRM</span>
              </div>
              <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
              <p>{mode === 'login' ? 'Welcome back to your CRM' : 'Start managing leads today'}</p>
            </div>

            <div className="mode-tabs">
              <button className={`mode-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
              <button className={`mode-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="name" type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input name="email" type="email" className="form-input" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <input name="password" type={showPass ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁'}</button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="agent">Sales Agent</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
                {loading ? <span className="spin-loader" /> : null}
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>

            <div className="login-demo">
              <p className="text-muted text-sm">Demo credentials:</p>
              <div className="demo-creds">
                <code>admin@demo.com</code> / <code>demo123456</code>
              </div>
              <button className="btn btn-ghost btn-sm" style={{marginTop:'8px', width:'100%'}} onClick={() => { setForm({ ...form, email: 'admin@demo.com', password: 'demo123456' }); setMode('login'); }}>
                Use Demo Credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
