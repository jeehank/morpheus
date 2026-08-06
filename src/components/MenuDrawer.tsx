import React from 'react';
import { X, Film, Gamepad2, Users, Calendar, Sparkles } from 'lucide-react';

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

  const handleLinkClick = (page: string, params?: any) => {
    onNavigate(page, params);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      
      {/* Header Bar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', borderBottom: '1px solid #2e2e2e' }}>
        <div style={{ background: 'linear-gradient(135deg, #f57c00, #ff6b00)', color: '#000', fontWeight: 900, fontSize: '1.4rem', padding: '2px 12px', borderRadius: '4px' }}>
          IGMDb Menu Navigation
        </div>

        <button 
          onClick={onClose}
          style={{ color: '#aaa', padding: '6px' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}
        >
          <X size={28} />
        </button>
      </div>

      {/* Menu Categories Grid */}
      <div className="container" style={{ flex: 1, overflowY: 'auto', padding: '40px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px' }}>
        
        {/* Category 1: Movies */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-orange)', marginBottom: '16px', borderBottom: '2px solid var(--brand-orange)', paddingBottom: '8px' }}>
            <Film size={22} />
            <span>Movies Hub</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <button onClick={() => handleLinkClick('top250')} style={{ textAlign: 'left', color: '#fff', fontWeight: 700 }}>
              Top Rated 250 Movies
            </button>
            <button onClick={() => handleLinkClick('movies')} style={{ textAlign: 'left', color: '#ccc' }}>
              Most Popular Movies
            </button>
            <button onClick={() => handleLinkClick('movies')} style={{ textAlign: 'left', color: '#ccc' }}>
              In Theaters Now
            </button>
            <button onClick={() => handleLinkClick('schedule')} style={{ textAlign: 'left', color: '#ccc' }}>
              Upcoming Release Schedule
            </button>
            <button onClick={() => handleLinkClick('library')} style={{ textAlign: 'left', color: '#ccc' }}>
              All Movies Library (150+ Titles)
            </button>
          </div>
        </div>

        {/* Category 2: Video Games */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 800, color: '#8b5cf6', marginBottom: '16px', borderBottom: '2px solid #8b5cf6', paddingBottom: '8px' }}>
            <Gamepad2 size={22} />
            <span>Gaming Hub (IGDB)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <button onClick={() => handleLinkClick('games')} style={{ textAlign: 'left', color: '#fff', fontWeight: 700 }}>
              Popular & Trending Games
            </button>
            <button onClick={() => handleLinkClick('games')} style={{ textAlign: 'left', color: '#ccc' }}>
              Highest Rated PC & Console Titles
            </button>
            <button onClick={() => handleLinkClick('library')} style={{ textAlign: 'left', color: '#ccc' }}>
              All Video Games Library (150+ Titles)
            </button>
          </div>
        </div>

        {/* Category 3: Celebs & Community */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginBottom: '16px', borderBottom: '2px solid #38bdf8', paddingBottom: '8px' }}>
            <Users size={22} />
            <span>Celebs & Community</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <button onClick={() => handleLinkClick('celebs')} style={{ textAlign: 'left', color: '#fff', fontWeight: 700 }}>
              Trending Actors
            </button>
            <button onClick={() => handleLinkClick('celebs')} style={{ textAlign: 'left', color: '#ccc' }}>
              Born Today
            </button>
            <button onClick={() => handleLinkClick('account')} style={{ textAlign: 'left', color: '#ccc' }}>
              My Playlists & Watchlist
            </button>
          </div>
        </div>

        {/* Category 4: AI & Calendar */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 800, color: '#f43f5e', marginBottom: '16px', borderBottom: '2px solid #f43f5e', paddingBottom: '8px' }}>
            <Calendar size={22} />
            <span>Schedule & AI</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <button onClick={() => handleLinkClick('schedule')} style={{ textAlign: 'left', color: '#fff', fontWeight: 700 }}>
              Release Calendar (2026)
            </button>
            <button 
              onClick={() => {
                onClose();
                onOpenAiChat();
              }}
              style={{ textAlign: 'left', color: 'var(--brand-orange)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={16} />
              <span>Launch Gemini AI Assistant</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
