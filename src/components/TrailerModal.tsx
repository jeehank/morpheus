import React from 'react';
import { X, Play } from 'lucide-react';

interface TrailerModalProps {
  isOpen: boolean;
  title: string;
  videoKey?: string;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  title,
  videoKey,
  onClose
}) => {
  if (!isOpen) return null;

  // Fallback YouTube trailer search query embed URL if videoKey is not provided
  const embedUrl = videoKey
    ? `https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1`
    : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(title + ' official trailer')}&autoplay=1`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 4000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#1f1f1f',
        border: '1px solid var(--border-orange)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '900px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.95)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#141414',
          padding: '14px 20px',
          borderBottom: '1px solid #2e2e2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 800, fontSize: '1.05rem' }}>
            <Play size={18} fill="var(--brand-orange)" color="var(--brand-orange)" />
            <span>Official Trailer: {title}</span>
          </div>

          <button onClick={onClose} style={{ color: '#aaa', padding: '4px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}>
            <X size={22} />
          </button>
        </div>

        {/* Video Frame */}
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#000' }}>
          <iframe
            src={embedUrl}
            title={`${title} Official Trailer`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
