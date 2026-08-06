import React from 'react';
import { Star, Plus, Check, Play } from 'lucide-react';
import type { MediaItem, UserAccount } from '../types';
import { updateUserWatchlist, getCurrentUser } from '../services/supabaseClient';

interface MediaCardProps {
  item: MediaItem;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth?: () => void;
  onOpenTrailer?: (title: string, videoKey?: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onNavigate,
  onOpenAuth,
  onOpenTrailer
}) => {
  const [currentUser, setCurrentUser] = React.useState<UserAccount | null>(getCurrentUser());

  const title = 'title' in item ? item.title : item.name;
  const rating = item.vote_average || item.rating || 0;
  const isMovie = item.media_type === 'movie';
  
  const posterUrl = isMovie 
    ? (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500')
    : (item.cover_url || item.poster_path || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500');

  const inWatchlist = currentUser?.watchlist.some(
    w => String(w.id) === String(item.id) && w.mediaType === item.media_type
  ) || false;

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const updated = updateUserWatchlist({
      id: item.id,
      mediaType: item.media_type,
      title,
      poster: posterUrl
    });
    setCurrentUser(updated);
  };

  return (
    <div 
      style={{
        width: '180px',
        minWidth: '180px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        position: 'relative'
      }}
      onClick={() => onNavigate('detail', { id: item.id, type: item.media_type })}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
      }}
    >
      {/* IMDb Signature Bookmark Ribbon on Top-Left */}
      <button
        onClick={handleToggleWatchlist}
        title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10,
          backgroundColor: inWatchlist ? 'var(--brand-orange)' : 'rgba(0,0,0,0.75)',
          color: inWatchlist ? '#000' : '#fff',
          padding: '6px 8px',
          borderBottomRightRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s'
        }}
      >
        {inWatchlist ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
      </button>

      {/* Poster Image */}
      <div style={{ position: 'relative', width: '100%', height: '260px', backgroundColor: '#0f0f0f', overflow: 'hidden' }}>
        <img 
          src={posterUrl} 
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(to top, rgba(31,31,31,1), transparent)'
        }} />
      </div>

      {/* Info Content */}
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
        
        {/* Rating Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Star size={16} fill="var(--star-yellow)" color="var(--star-yellow)" />
          <span style={{ fontWeight: 700, color: '#fff' }}>
            {rating > 0 ? rating.toFixed(1) : 'N/A'}
          </span>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginLeft: 'auto', backgroundColor: isMovie ? '#ff6b00' : '#8b5cf6', padding: '1px 4px', borderRadius: '3px', color: '#fff', fontWeight: 700 }}>
            {item.media_type}
          </span>
        </div>

        {/* Media Title */}
        <div style={{ 
          fontWeight: 600, 
          fontSize: '0.9rem', 
          color: '#fff', 
          lineHeight: '1.25', 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden',
          minHeight: '2.5rem'
        }}>
          {title}
        </div>

        {/* Watchlist Action Button */}
        <button
          onClick={handleToggleWatchlist}
          style={{
            width: '100%',
            backgroundColor: inWatchlist ? '#2a2a2a' : 'rgba(245, 124, 0, 0.15)',
            border: inWatchlist ? '1px solid #444' : '1px solid var(--border-orange)',
            color: inWatchlist ? '#aaa' : 'var(--brand-orange)',
            fontWeight: 700,
            fontSize: '0.8rem',
            padding: '6px 0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            marginTop: '4px',
            transition: 'all 0.2s'
          }}
        >
          {inWatchlist ? (
            <>
              <Check size={14} /> Added
            </>
          ) : (
            <>
              <Plus size={14} /> Watchlist
            </>
          )}
        </button>

        {/* Trailer / Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenTrailer) {
              onOpenTrailer(title);
            } else {
              onNavigate('detail', { id: item.id, type: item.media_type });
            }
          }}
          style={{
            width: '100%',
            color: '#aaa',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '2px 0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}
        >
          <Play size={12} fill="currentColor" /> Trailer
        </button>

      </div>
    </div>
  );
};
