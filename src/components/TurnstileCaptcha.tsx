import React, { useEffect, useRef, useCallback, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
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

// Localhost / dev bypass: Turnstile widgets require the domain to be whitelisted
// in the Cloudflare dashboard. On localhost it will show "Unable to connect".
// We auto-pass on localhost so development works. In production (with the real
// domain added to Cloudflare), the actual widget challenge is used.
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
  const [localBypass, setLocalBypass] = useState(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;

    if (widgetIdRef.current) {
      try { window.turnstile.remove(widgetIdRef.current); } catch { /* */ }
      widgetIdRef.current = null;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onVerify(token),
        'expired-callback': () => { if (onExpire) onExpire(); },
        'error-callback': () => {
          // If widget errors (e.g. domain not whitelisted), auto-pass on localhost
          if (isLocalhost()) {
            setLocalBypass(true);
            onVerify('localhost_bypass_token');
          } else if (onError) {
            onError();
          }
        },
        theme: 'dark',
        size: 'normal'
      });
    } catch {
      if (isLocalhost()) {
        setLocalBypass(true);
        onVerify('localhost_bypass_token');
      }
    }
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    // On localhost, auto-pass after a short delay if Turnstile can't load
    if (isLocalhost()) {
      const fallbackTimer = setTimeout(() => {
        if (!widgetIdRef.current) {
          setLocalBypass(true);
          onVerify('localhost_bypass_token');
        }
      }, 3000);

      // Still try to load the real widget
      if (window.turnstile) {
        renderWidget();
        return () => clearTimeout(fallbackTimer);
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
      script.async = true;
      script.defer = true;

      window.onTurnstileLoad = () => renderWidget();
      document.head.appendChild(script);

      return () => clearTimeout(fallbackTimer);
    }

    // Production: load widget normally
    if (window.turnstile) {
      renderWidget();
      return;
    }

    window.onTurnstileLoad = () => renderWidget();
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current) {
        try { window.turnstile?.remove(widgetIdRef.current); } catch { /* */ }
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget, onVerify]);

  if (localBypass) {
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
