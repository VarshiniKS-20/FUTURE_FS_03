import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@crm.com');
    setPassword('admin123');
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">

        {/* Left Panel */}
        <div className="login-left">
          <div className="login-brand">
            <div className="brand-icon">📊</div>
            <h1>Manage your leads. Grow your business.</h1>
            <p>A powerful Mini CRM to track clients, follow up on leads, and convert them into customers — all in one place.</p>
          </div>
          <div className="login-features">
            {[
              { icon: '👥', text: 'Track all incoming leads from one dashboard' },
              { icon: '🔄', text: 'Update status from New to Converted instantly' },
              { icon: '📝', text: 'Add follow-up notes for every lead' },
              { icon: '📈', text: 'Visualize your pipeline with live charts' },
            ].map((f, i) => (
              <div className="login-feature" key={i}>
                <div className="login-feature-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="login-right">
          <div className="logo">
            <h2>Welcome back 👋</h2>
            <p>Sign in to your Mini CRM dashboard</p>
          </div>

          {/* Credentials Hint Box */}
          <div className="credentials-hint">
            <span className="hint-icon">💡</span>
            <div>
              <p>
                <strong>Default login credentials</strong><br />
                Email: <strong>admin@crm.com</strong><br />
                Password: <strong>admin123</strong><br />
                <span style={{ marginTop: 6, display: 'inline-block' }}>
                  You can change these anytime after logging in, or{' '}
                  <span
                    onClick={fillDemo}
                    style={{ color: 'var(--blue2)', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    click here to auto-fill
                  </span>
                </span>
              </p>
            </div>
          </div>

          {error && (
            <div className="error-msg">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="admin@crm.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 46 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text2)'
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 14 }}
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</>
              ) : (
                <>🚀 Sign In to Dashboard</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text2)' }}>
            Mini CRM — Future Interns Task 2 (2026)
          </p>
        </div>
      </div>
    </div>
  );
}
