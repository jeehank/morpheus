import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Globe, AlertTriangle } from 'lucide-react';
import { getClientIp, registerUser, loginUser } from '../services/supabaseClient';
import type { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [clientIp, setClientIp] = useState<string>('Detecting IP...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getClientIp().then(ip => setClientIp(ip));
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await registerUser(emailOrUsername, password, name);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to register account.');
      return;
    }

    if (res.user) {
      onSuccess(res.user);
      onClose();
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password.trim()) {
      setErrorMsg('Please enter both email/username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await loginUser(emailOrUsername, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials or banned account.');
      return;
    }

    if (res.user) {
      onSuccess(res.user);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(4px)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#1f1f1f',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.9)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: '#141414',
          padding: '16px 20px',
          borderBottom: '1px solid #2e2e2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'linear-gradient(135deg, #f57c00, #ff6b00)', color: '#000', fontWeight: 900, fontSize: '1rem', padding: '2px 8px', borderRadius: '4px' }}>
              IGMDb
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
              {mode === 'signin' ? 'Sign In to IGMDb' : 'Create Account'}
            </span>
          </div>

          <button onClick={onClose} style={{ color: '#aaa' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}>
            <X size={20} />
          </button>
        </div>

        {/* IP Detector Banner */}
        <div style={{
          backgroundColor: '#181818',
          padding: '8px 20px',
          fontSize: '0.75rem',
          color: '#aaa',
          borderBottom: '1px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={13} color="var(--brand-orange)" />
            Your IP: <strong style={{ color: '#fff' }}>{clientIp}</strong>
          </span>
          <span style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>Max 1 Account / IP</span>
        </div>

        <div style={{ padding: '24px' }}>
          
          {/* Error Message banner */}
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ccc', display: 'block', marginBottom: '6px' }}>
                  Email or Username (e.g. morpheus for Admin)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="name@example.com or morpheus"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#121212',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      padding: '10px 12px 10px 36px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <Mail size={16} color="#777" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ccc', display: 'block', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#121212',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      padding: '10px 12px 10px 36px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <Lock size={16} color="#777" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--brand-orange)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  padding: '10px',
                  borderRadius: '6px',
                  marginTop: '4px'
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#aaa', marginTop: '12px' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{ color: 'var(--brand-orange)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ccc', display: 'block', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#121212',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      padding: '10px 12px 10px 36px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <User size={16} color="#777" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ccc', display: 'block', marginBottom: '6px' }}>
                  Valid Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#121212',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      padding: '10px 12px 10px 36px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <Mail size={16} color="#777" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ccc', display: 'block', marginBottom: '6px' }}>
                  Set Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    placeholder="Create password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#121212',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      padding: '10px 12px 10px 36px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <Lock size={16} color="#777" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--brand-orange)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  padding: '10px',
                  borderRadius: '6px',
                  marginTop: '6px'
                }}
              >
                {isLoading ? 'Registering Account...' : 'Register & Create Account'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#aaa', marginTop: '8px' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  style={{ color: 'var(--brand-orange)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
