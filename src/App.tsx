import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MenuDrawer } from './components/MenuDrawer';
import { AiChatDrawer } from './components/AiChatDrawer';
import { AuthModal } from './components/AuthModal';
import { TrailerModal } from './components/TrailerModal';

import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { GamesPage } from './pages/GamesPage';
import { SchedulePage } from './pages/SchedulePage';
import { MediaDetailPage } from './pages/MediaDetailPage';
import { AccountCenter } from './pages/AccountCenter';

import { fetchMovieVideos } from './services/tmdbApi';

export function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>(null);

  // Modals & Drawers
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Trailer Modal State
  const [trailerState, setTrailerState] = useState<{ isOpen: boolean; title: string; videoKey?: string }>({
    isOpen: false,
    title: ''
  });

  const handleNavigate = (page: string, params?: any) => {
    setActivePage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTrailer = async (title: string, videoKey?: string) => {
    if (videoKey) {
      setTrailerState({ isOpen: true, title, videoKey });
      return;
    }

    if (pageParams?.id && pageParams?.type === 'movie') {
      const key = await fetchMovieVideos(pageParams.id);
      setTrailerState({ isOpen: true, title, videoKey: key || undefined });
    } else {
      setTrailerState({ isOpen: true, title });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: '#fff' }}>
      
      {/* Top Header Navbar */}
      <Navbar
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onNavigate={handleNavigate}
        activePage={activePage}
      />

      {/* Categorized Sub-Navbar matching IMDb */}
      <nav style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #292929' }}>
        <div className="container" style={{ display: 'flex', gap: '24px', height: '42px', alignItems: 'center', fontSize: '0.88rem', fontWeight: 700 }}>
          <button
            onClick={() => handleNavigate('home')}
            style={{
              color: activePage === 'home' ? 'var(--brand-orange)' : '#ccc',
              borderBottom: activePage === 'home' ? '2px solid var(--brand-orange)' : 'none',
              height: '100%',
              padding: '0 4px'
            }}
          >
            Home Fusion
          </button>

          <button
            onClick={() => handleNavigate('movies')}
            style={{
              color: activePage === 'movies' ? 'var(--brand-orange)' : '#ccc',
              borderBottom: activePage === 'movies' ? '2px solid var(--brand-orange)' : 'none',
              height: '100%',
              padding: '0 4px'
            }}
          >
            🎬 Movies Tab (IMDb)
          </button>

          <button
            onClick={() => handleNavigate('games')}
            style={{
              color: activePage === 'games' ? 'var(--brand-orange)' : '#ccc',
              borderBottom: activePage === 'games' ? '2px solid var(--brand-orange)' : 'none',
              height: '100%',
              padding: '0 4px'
            }}
          >
            🎮 Games Tab (IGDB)
          </button>

          <button
            onClick={() => handleNavigate('schedule')}
            style={{
              color: activePage === 'schedule' ? 'var(--brand-orange)' : '#ccc',
              borderBottom: activePage === 'schedule' ? '2px solid var(--brand-orange)' : 'none',
              height: '100%',
              padding: '0 4px'
            }}
          >
            📅 Release Schedule
          </button>

          <button
            onClick={() => handleNavigate('account')}
            style={{
              color: activePage === 'account' ? 'var(--brand-orange)' : '#ccc',
              borderBottom: activePage === 'account' ? '2px solid var(--brand-orange)' : 'none',
              height: '100%',
              padding: '0 4px',
              marginLeft: 'auto'
            }}
          >
            👤 Account Center & Playlists
          </button>
        </div>
      </nav>

      {/* Main Page Routing View */}
      <main>
        {activePage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenAiChat={() => setIsAiChatOpen(true)}
            onOpenTrailer={handleOpenTrailer}
          />
        )}

        {activePage === 'movies' && (
          <MoviesPage
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenTrailer={handleOpenTrailer}
          />
        )}

        {activePage === 'games' && (
          <GamesPage
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenTrailer={handleOpenTrailer}
          />
        )}

        {activePage === 'schedule' && (
          <SchedulePage
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activePage === 'detail' && pageParams && (
          <MediaDetailPage
            id={pageParams.id}
            type={pageParams.type}
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenTrailer={handleOpenTrailer}
          />
        )}

        {activePage === 'account' && (
          <AccountCenter
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Footer matching IMDb style */}
      <footer style={{ backgroundColor: '#0f0f0f', borderTop: '1px solid #262626', padding: '40px 0', marginTop: '60px', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px', fontWeight: 600, color: '#ccc' }}>
            <span onClick={() => handleNavigate('home')} style={{ cursor: 'pointer' }}>Help</span>
            <span onClick={() => handleNavigate('schedule')} style={{ cursor: 'pointer' }}>Release Schedule</span>
            <span onClick={() => handleNavigate('account')} style={{ cursor: 'pointer' }}>IGMDB Account</span>
            <span onClick={() => setIsAiChatOpen(true)} style={{ cursor: 'pointer', color: 'var(--brand-orange)' }}>AI Concierge</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '16px 0' }}>
            <div style={{ background: 'linear-gradient(135deg, #f57c00, #ff6b00)', color: '#000', fontWeight: 900, fontSize: '0.9rem', padding: '2px 6px', borderRadius: '4px' }}>
              IGMDb
            </div>
            <span>an IMDb & IGDB company</span>
          </div>

          <p>© 2026 IGMDb.com, Inc. or its affiliates. Dynamic TMDB & TheGamesDB Live Data Integration.</p>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
        onOpenAiChat={() => setIsAiChatOpen(true)}
      />

      <AiChatDrawer
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
        }}
      />

      <TrailerModal
        isOpen={trailerState.isOpen}
        title={trailerState.title}
        videoKey={trailerState.videoKey}
        onClose={() => setTrailerState({ isOpen: false, title: '' })}
      />

    </div>
  );
}
export default App;
