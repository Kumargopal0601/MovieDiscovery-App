// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      setUsername('');
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
        className="animate-fade-in"
      />

      {/* Modal */}
      <div className="animate-scale-in" style={{
        position: 'relative', width: '100%', maxWidth: '440px',
        background: 'rgba(0, 0, 0, 0.85)', borderRadius: '12px',
        padding: '60px 48px 48px', border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', color: 'var(--netflix-text-muted)',
            cursor: 'pointer', padding: '4px', transition: 'color 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.color = 'white'}
          onMouseLeave={(e) => e.target.style.color = 'var(--netflix-text-muted)'}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '28px' }}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>

        {/* Error */}
        {error && (
          <div className="animate-fade-in-up" style={{
            padding: '12px 16px', borderRadius: '6px',
            background: 'rgba(229, 9, 20, 0.15)', border: '1px solid rgba(229, 9, 20, 0.3)',
            color: '#e87c03', fontSize: '0.9rem', marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required={!isLogin}
                minLength={3}
                style={{
                  width: '100%', padding: '16px', borderRadius: '6px',
                  background: '#333', border: 'none', color: 'white',
                  fontSize: '1rem', fontFamily: 'inherit', outline: 'none',
                  transition: 'background 0.3s'
                }}
                onFocus={(e) => e.target.style.background = '#454545'}
                onBlur={(e) => e.target.style.background = '#333'}
              />
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              style={{
                width: '100%', padding: '16px', borderRadius: '6px',
                background: '#333', border: 'none', color: 'white',
                fontSize: '1rem', fontFamily: 'inherit', outline: 'none',
                transition: 'background 0.3s'
              }}
              onFocus={(e) => e.target.style.background = '#454545'}
              onBlur={(e) => e.target.style.background = '#333'}
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              style={{
                width: '100%', padding: '16px', borderRadius: '6px',
                background: '#333', border: 'none', color: 'white',
                fontSize: '1rem', fontFamily: 'inherit', outline: 'none',
                transition: 'background 0.3s'
              }}
              onFocus={(e) => e.target.style.background = '#454545'}
              onBlur={(e) => e.target.style.background = '#333'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '6px',
              background: 'var(--netflix-red)', border: 'none', color: 'white',
              fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', marginTop: '8px',
              opacity: loading ? 0.6 : 1, transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = 'var(--netflix-red-hover)')}
            onMouseLeave={(e) => e.target.style.background = 'var(--netflix-red)'}
          >
            {loading && <div className="loading-spinner-small"></div>}
            {loading
              ? (isLogin ? 'Signing in...' : 'Creating account...')
              : (isLogin ? 'Sign In' : 'Sign Up')
            }
          </button>
        </form>

        {/* Switch mode */}
        <div style={{ marginTop: '24px' }}>
          <p style={{ color: 'var(--netflix-text-muted)', fontSize: '0.95rem' }}>
            {isLogin ? 'New to MovieDiscover? ' : 'Already have an account? '}
            <button
              onClick={switchMode}
              style={{
                background: 'none', border: 'none', color: 'white',
                cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
                fontFamily: 'inherit', textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--netflix-red)'}
              onMouseLeave={(e) => e.target.style.color = 'white'}
            >
              {isLogin ? 'Sign up now' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
