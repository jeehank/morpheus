import React from 'react';

interface PlatformLogosProps {
  platformName: string;
}

export const PlatformLogo: React.FC<PlatformLogosProps> = ({ platformName }) => {
  const nameLower = platformName.toLowerCase();

  if (nameLower.includes('netflix')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#E50914">
          <path d="M5.398 0v24h4.103l4.57-13.626L18.643 24H23V0h-4.103l-4.57 13.626L9.501 0H5.398z"/>
        </svg>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>Netflix</span>
      </div>
    );
  }

  if (nameLower.includes('prime') || nameLower.includes('amazon')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#00A8E1">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>Prime Video</span>
      </div>
    );
  }

  if (nameLower.includes('disney')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#113CCF">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>Disney+</span>
      </div>
    );
  }

  if (nameLower.includes('steam') || nameLower.includes('pc')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#171a21">
          <path fill="#66c0f4" d="M12 2a10 10 0 0 0-10 10c0 4.7 3.2 8.6 7.6 9.7l2-3a3.5 3.5 0 0 1 2.4.3l3-1.6A10 10 0 0 0 12 2z"/>
        </svg>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>Steam (PC)</span>
      </div>
    );
  }

  if (nameLower.includes('playstation') || nameLower.includes('ps5') || nameLower.includes('ps4')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#003791">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6z"/>
        </svg>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>PlayStation</span>
      </div>
    );
  }

  if (nameLower.includes('xbox')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#107C41">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-3.5 13.5L5 9.5a7.5 7.5 0 0 1 7-5.5 7.5 7.5 0 0 1 7 5.5l-3.5 6a5.5 5.5 0 0 1-7 0z"/>
        </svg>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>Xbox Series X/S</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'var(--brand-orange)', color: '#000', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {platformName.charAt(0)}
      </div>
      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{platformName}</span>
    </div>
  );
};
