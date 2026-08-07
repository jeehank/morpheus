import React, { useState, useEffect, useRef } from 'react';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

/**
 * Fake Turnstile CAPTCHA widget that mimics the exact Cloudflare Turnstile look & feel.
 * Generates a fake token after a brief delay to simulate verification.
 */
export const TurnstileCaptcha: React.FC<TurnstileCaptchaProps> = ({
  onVerify,
  onExpire
}) => {
  const [phase, setPhase] = useState<'idle' | 'verifying' | 'verified'>('idle');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (phase !== 'idle') return;
    setPhase('verifying');

    // Simulate verification delay (1.2 – 2.0s for realism)
    const delay = 1200 + Math.random() * 800;
    timerRef.current = window.setTimeout(() => {
      setPhase('verified');
      const fakeToken = 'cf_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
      onVerify(fakeToken);
    }, delay);
  };

  return (
    <div style={{
      width: '300px',
      height: '65px',
      backgroundColor: '#fafafa',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      cursor: phase === 'idle' ? 'pointer' : 'default',
      userSelect: 'none',
      transition: 'border-color 0.2s'
    }}
      onClick={handleClick}
    >
      {/* Left side: checkbox area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Checkbox / Spinner / Checkmark */}
        <div style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {phase === 'idle' && (
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #c4c4c4',
              borderRadius: '3px',
              backgroundColor: '#fff',
              transition: 'border-color 0.15s'
            }} />
          )}

          {phase === 'verifying' && (
            <div style={{
              width: '20px',
              height: '20px',
              border: '3px solid #e0e0e0',
              borderTopColor: '#f5801f',
              borderRadius: '50%',
              animation: 'turnstile-spin 0.7s linear infinite'
            }} />
          )}

          {phase === 'verified' && (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="1" y="1" width="20" height="20" rx="3" fill="#f5801f" />
              <path d="M6 11.5L9.5 15L16 7.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Label text */}
        <span style={{
          fontSize: '13.5px',
          color: '#555',
          fontWeight: 400,
          letterSpacing: '0.01em'
        }}>
          {phase === 'idle' && 'Verify you are human'}
          {phase === 'verifying' && 'Verifying...'}
          {phase === 'verified' && 'Verification complete'}
        </span>
      </div>

      {/* Right side: Cloudflare branding */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '1px'
      }}>
        {/* Cloudflare logo mock */}
        <svg width="32" height="14" viewBox="0 0 63 27" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M47.6 20.5c.5-1.5.3-2.9-.4-3.9-.7-.9-1.8-1.4-3.1-1.5L21.4 14.9c-.2 0-.3-.1-.4-.2-.1-.2 0-.3.1-.4.1-.2.3-.3.5-.3l23-0.2c3-.1 6.2-2.5 7.3-5.4l1.4-3.7c.1-.2.1-.4 0-.5C51.7 1.7 49 0 45.8 0 39.8 0 34.6 4.6 33.2 10.5l-2.5-.1c-3.4-.1-6.5 2.5-7 5.9l-.1.4c0 .2.1.4.3.4h22.5c.2 0 .4-.1.5-.3l.7-2.3z" fill="#F4811F"/>
          <path d="M52.6 8.6c-.2 0-.5 0-.7.1-.1 0-.3.1-.3.3l-.5 1.8c-.5 1.5-.3 2.9.4 3.9.7.9 1.8 1.4 3.1 1.5l2.6.2c.2 0 .3.1.4.2.1.2 0 .3-.1.4-.1.2-.3.3-.5.3l-2.8.2c-3 .1-6.2 2.5-7.3 5.4l-.4 1.1c-.1.2.1.4.3.4h16.4c.2 0 .4-.1.5-.3.4-1.2.7-2.5.7-3.9 0-5.5-4.5-10-10.3-10.5h-1.5z" fill="#FAAD3F"/>
        </svg>
        <span style={{
          fontSize: '9px',
          color: '#aaa',
          fontWeight: 400,
          letterSpacing: '0.3px'
        }}>
          Cloudflare Turnstile
        </span>
      </div>

      {/* Spinner keyframe animation */}
      <style>{`
        @keyframes turnstile-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
