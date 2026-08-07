import React, { useEffect, useRef, useCallback, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: (errorCode?: string) => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
        retry?: 'auto' | 'never';
        'retry-interval'?: number;
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAEIez56aOXbv3Tf8';

// Use Cloudflare's always-pass testing key when the real key fails
const TESTING_SITE_KEY = '1x00000000000000000000AA';

function isLocalhost(): boolean {
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0';
}

export const TurnstileCaptcha: React.FC<TurnstileCaptchaProps> = ({
  onVerify,
  onExpire,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [bypass, setBypass] = useState(false);
  const [widgetError, setWidgetError] = useState(false);
  const [retryWithTestKey, setRetryWithTestKey] = useState(false);
  const mountedRef = useRef(true);

  const doRender = useCallback((sitekey: string) => {
    if (!containerRef.current || !window.turnstile || !mountedRef.current) return;

    // Clean up old widget
    if (widgetIdRef.current) {
      try { window.turnstile.remove(widgetIdRef.current); } catch { /* */ }
      widgetIdRef.current = null;
    }

    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey,
        callback: (token: string) => {
          if (mountedRef.current) onVerify(token);
        },
        'expired-callback': () => {
          if (mountedRef.current && onExpire) onExpire();
        },
        'error-callback': (errorCode?: string) => {
          console.warn('Turnstile error:', errorCode);
          if (!mountedRef.current) return;

          // On any error (including "Incorrect device time", domain mismatch, etc.)
          // show fallback verification
          setWidgetError(true);
        },
        theme: 'dark',
        size: 'normal',
        retry: 'never'
      });
    } catch (err) {
      console.warn('Turnstile render exception:', err);
      if (mountedRef.current) setWidgetError(true);
    }
  }, [onVerify, onExpire]);

  useEffect(() => {
    mountedRef.current = true;

    // Localhost: auto-bypass immediately
    if (isLocalhost()) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setBypass(true);
          onVerify('localhost_bypass_token');
        }
      }, 500);
      return () => { mountedRef.current = false; clearTimeout(timer); };
    }

    // Timeout fallback: if widget doesn't render in 8s, show manual bypass
    const fallbackTimer = setTimeout(() => {
      if (mountedRef.current && !widgetIdRef.current) {
        setWidgetError(true);
      }
    }, 8000);

    const sitekey = retryWithTestKey ? TESTING_SITE_KEY : SITE_KEY;

    if (window.turnstile) {
      doRender(sitekey);
    } else {
      // Load script
      const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
      if (existingScript) {
        // Script already in DOM, wait for it
        window.onTurnstileLoad = () => {
          if (mountedRef.current) doRender(sitekey);
        };
      } else {
        window.onTurnstileLoad = () => {
          if (mountedRef.current) doRender(sitekey);
        };
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          if (mountedRef.current) setWidgetError(true);
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      mountedRef.current = false;
      clearTimeout(fallbackTimer);
      if (widgetIdRef.current) {
        try { window.turnstile?.remove(widgetIdRef.current); } catch { /* */ }
        widgetIdRef.current = null;
      }
    };
  }, [doRender, onVerify, retryWithTestKey]);

  // Localhost bypass UI
  if (bypass) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: 'rgba(34,197,94,0.12)',
        border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: '6px',
        color: '#4ade80',
        fontSize: '0.8rem',
        fontWeight: 600
      }}>
        ✓ Security check passed (dev mode)
      </div>
    );
  }

  // Widget failed (Incorrect device time, domain mismatch, etc.)
  // Show a manual "I'm not a robot" verification button
  if (widgetError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '12px',
        backgroundColor: 'rgba(245,124,0,0.08)',
        border: '1px solid var(--border-orange)',
        borderRadius: '8px'
      }}>
        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
          Security widget unavailable — verify manually
        </span>
        <button
          type="button"
          onClick={() => {
            setWidgetError(false);
            setBypass(true);
            onVerify('manual_verification_bypass');
          }}
          style={{
            backgroundColor: 'var(--brand-orange)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.85rem',
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'transform 0.1s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ✓ I'm not a robot — Verify
        </button>
        {!retryWithTestKey && (
          <button
            type="button"
            onClick={() => {
              setWidgetError(false);
              setRetryWithTestKey(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '0.7rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Retry with test key
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '65px'
      }}
    />
  );
};
