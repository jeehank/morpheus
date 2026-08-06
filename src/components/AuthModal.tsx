import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Globe, AlertTriangle } from 'lucide-react';
import { getClientIp, registerUser, loginUser, loginWithGoogle } from '../services/supabaseClient';
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
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
              {mode === 'signin' ? 'Sign In to IGMDb (Supabase Auth)' : 'Create Account'}
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
          <span style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>Supabase Auth Verified</span>
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
                {isLoading ? 'Authenticating with Supabase...' : 'Sign In'}
              </button>

              <div style={{ textAlign: 'center', margin: '8px 0', position: 'relative' }}>
                <hr style={{ borderColor: '#2e2e2e' }} />
                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#1f1f1f', padding: '0 8px', fontSize: '0.75rem', color: '#888' }}>
                  OR
                </span>
              </div>

              {/* Google Login Trigger */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '10px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  border: '1px solid #ddd'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in with Google</span>
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
                  Email Address
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
                {isLoading ? 'Creating Account...' : 'Register & Create Account'}
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
