import React from 'react';
import { X, Film, Gamepad2, Tv, Award, Users, Calendar, Sparkles } from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, params?: any) => void;
  onOpenAiChat: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAiChat
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#1f1f1f',
      zIndex: 2000,
      overflowY: 'auto',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div 
            onClick={() => { onNavigate('home'); onClose(); }}
            style={{ 
              background: 'linear-gradient(135deg, #f57c00, #ff6b00)',
              color: '#000',
              fontWeight: 900,
              fontSize: '1.8rem',
              padding: '4px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            IGMDb
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f57c00',
              color: '#000',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Grid - Identical to User Screenshot layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '40px 32px'
        }}>

          {/* Movies Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              <Film size={22} color="#f57c00" />
              <span>Movies</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#e5e5e5' }}>
              <li>
                <span 
                  onClick={() => { onNavigate('schedule'); onClose(); }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  <Calendar size={16} color="#f57c00" /> Release calendar
                </span>
              </li>
              <li>
                <span 
                  onClick={() => { onNavigate('movies'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  Top 250 movies
                </span>
              </li>
              <li>
                <span 
                  onClick={() => { onNavigate('movies'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  Most popular movies
                </span>
              </li>
              <li>
                <span 
                  onClick={() => { onNavigate('movies'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  Browse movies by genre
                </span>
              </li>
              <li>
                <span 
                  onClick={() => { onNavigate('movies'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  Top box office
                </span>
              </li>
            </ul>
          </div>

          {/* Games Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              <Gamepad2 size={22} color="#f57c00" />
              <span>Video Games</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#e5e5e5' }}>
              <li>
                <span 
                  onClick={() => { onNavigate('games'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  Popular video games
                </span>
              </li>
              <li>
                <span 
                  onClick={() => { onNavigate('games'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  Trending game releases
                </span>
              </li>
              <li>
                <span 
                  onClick={() => { onNavigate('schedule'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  Game Release calendar
                </span>
              </li>
              <li>
                <span 
                  onClick={() => { onNavigate('games'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  Top Rated PC & Console titles
                </span>
              </li>
            </ul>
          </div>

          {/* Watch Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              <Tv size={22} color="#f57c00" />
              <span>Watch</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#e5e5e5' }}>
              <li>
                <span 
                  onClick={() => { onNavigate('home'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  What to watch
                </span>
              </li>
              <li>
                <span 
                  onClick={() => { onNavigate('home'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  Latest trailers
                </span>
              </li>
              <li>
                <span 
                  onClick={() => { onNavigate('account'); onClose(); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#e5e5e5'}
                >
                  Your Watchlist & Playlists
                </span>
              </li>
              <li>
                <span 
                  onClick={() => { onOpenAiChat(); onClose(); }}
                  style={{ cursor: 'pointer', color: '#f57c00', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sparkles size={16} /> Daily AI Recommendations
                </span>
              </li>
            </ul>
          </div>

          {/* Awards & Events Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              <Award size={22} color="#f57c00" />
              <span>Awards & Events</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#e5e5e5' }}>
              <li>Oscars</li>
              <li>Game Awards</li>
              <li>San Diego Comic-Con</li>
              <li>STARmeter Awards</li>
              <li>Festival Central</li>
            </ul>
          </div>

          {/* Celebs & Community Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              <Users size={22} color="#f57c00" />
              <span>Celebs & Community</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#e5e5e5' }}>
              <li>Born today</li>
              <li>Trending actors & developers</li>
              <li>Community Reviews & Polls</li>
              <li>Help Center</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
