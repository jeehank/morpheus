import React, { useState } from 'react';
import { Play, Plus, Check, ChevronRight } from 'lucide-react';
import type { Movie, Game, UserAccount } from '../types';
import { getCurrentUser, updateUserWatchlist } from '../services/supabaseClient';

interface ImdbHeroCarouselProps {
  featuredItems: (Movie | Game)[];
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth?: () => void;
  onOpenTrailer: (title: string, videoKey?: string) => void;
}

export const ImdbHeroCarousel: React.FC<ImdbHeroCarouselProps> = ({
  featuredItems,
  onNavigate,
  onOpenAuth,
  onOpenTrailer
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser());

  if (!featuredItems || featuredItems.length === 0) return null;

  const activeItem = featuredItems[activeIndex] || featuredItems[0];
  const activeTitle = 'title' in activeItem ? activeItem.title : activeItem.name;
  const activeRating = activeItem.vote_average || activeItem.rating || 8.5;
  const activeBackdrop = activeItem.backdrop_path 
    ? (activeItem.backdrop_path.startsWith('http') ? activeItem.backdrop_path : `https://image.tmdb.org/t/p/original${activeItem.backdrop_path}`)
    : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';
  
  const activePoster = activeItem.poster_path 
    ? (activeItem.poster_path.startsWith('http') ? activeItem.poster_path : `https://image.tmdb.org/t/p/w500${activeItem.poster_path}`)
    : (activeItem as any).cover_url || activeBackdrop;

  const inWatchlist = currentUser?.watchlist.some(
    w => String(w.id) === String(activeItem.id) && w.mediaType === activeItem.media_type
  ) || false;

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const updated = updateUserWatchlist({
      id: activeItem.id,
      mediaType: activeItem.media_type,
      title: activeTitle,
      poster: activePoster
    });
    setCurrentUser(updated);
  };

  const upNextList = featuredItems.slice(0, 4).filter((_, idx) => idx !== activeIndex);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', margin: '20px 0 32px 0' }}>
      
      {/* Main Spotlight Banner */}
      <div 
        style={{
          position: 'relative',
          height: '460px',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
        }}
        onClick={() => onNavigate('detail', { id: activeItem.id, type: activeItem.media_type })}
      >
        {/* Backdrop Image */}
        <img 
          src={activeBackdrop} 
          alt={activeTitle}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
        />

        {/* Gradient overlays matching IMDb */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(18,18,18,1) 0%, rgba(18,18,18,0.4) 50%, transparent 100%)'
        }} />

        {/* Play Icon Center Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenTrailer(activeTitle);
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.65)',
            border: '2px solid #fff',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, background 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -60%) scale(1.1)';
            e.currentTarget.style.backgroundColor = 'var(--brand-orange)';
            e.currentTarget.style.borderColor = 'var(--brand-orange)';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -60%) scale(1)';
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.65)';
            e.currentTarget.style.borderColor = '#fff';
            e.currentTarget.style.color = '#fff';
          }}
        >
          <Play size={36} fill="currentColor" style={{ marginLeft: '4px' }} />
        </button>

        {/* Bottom Banner Content */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '20px'
        }}>
          {/* Poster inset */}
          <div style={{
            position: 'relative',
            width: '120px',
            height: '175px',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.8)',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <img src={activePoster} alt={activeTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            
            <button
              onClick={handleToggleWatchlist}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: inWatchlist ? 'var(--brand-orange)' : 'rgba(0,0,0,0.8)',
                color: inWatchlist ? '#000' : '#fff',
                padding: '6px 8px',
                borderBottomRightRadius: '6px'
              }}
            >
              {inWatchlist ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
            </button>
          </div>

          {/* Text Title & Trailer details */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                backgroundColor: activeItem.media_type === 'movie' ? '#ff6b00' : '#8b5cf6',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: '3px'
              }}>
                Featured {activeItem.media_type}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#ccc' }}>★ {activeRating.toFixed(1)}</span>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '8px' }}>
              {activeTitle}
            </h1>
            <p style={{
              fontSize: '0.9rem',
              color: '#bbb',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: '650px'
            }}>
              {activeItem.overview || (activeItem as any).summary || 'Watch official trailer & explore reviews.'}
            </p>
          </div>
        </div>
      </div>

      {/* Up Next Sidebar - IMDb style */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '460px'
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand-orange)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Up next</span>
          <ChevronRight size={20} color="#fff" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {upNextList.map((item, idx) => {
            const itemTitle = 'title' in item ? item.title : item.name;
            const itemPoster = item.poster_path 
              ? (item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w185${item.poster_path}`)
              : (item as any).cover_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=185';
            const realIdx = featuredItems.findIndex(fi => fi.id === item.id);

            return (
              <div
                key={item.id}
                onClick={() => setActiveIndex(realIdx >= 0 ? realIdx : idx)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: realIdx === activeIndex ? '#2c2c2c' : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = realIdx === activeIndex ? '#2c2c2c' : 'transparent'}
              >
                <div style={{ position: 'relative', width: '64px', height: '90px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={itemPoster} alt={itemTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={16} fill="#fff" color="#fff" />
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--brand-orange)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Trailer
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', lineHeight: 1.2, marginTop: '2px' }}>
                    {itemTitle}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px' }}>
                    Watch official preview
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onNavigate('schedule')}
          style={{
            width: '100%',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 0',
            borderTop: '1px solid #2e2e2e',
            marginTop: '8px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-orange)'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
        >
          <span>Browse 2026 Release Schedule</span>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};
