import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MenuDrawer } from './components/MenuDrawer';
import { AiChatDrawer } from './components/AiChatDrawer';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { GamesPage } from './pages/GamesPage';
import { SchedulePage } from './pages/SchedulePage';
import { LibraryPage } from './pages/LibraryPage';
import { Top250Page } from './pages/Top250Page';
import { CelebsPage } from './pages/CelebsPage';
import { MediaDetailPage } from './pages/MediaDetailPage';
import { AccountCenter } from './pages/AccountCenter';
import { AdminPanelPage } from './pages/AdminPanelPage';

export function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>(null);

  // Modals & Drawers
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleNavigate = (page: string, params?: any) => {
    setActivePage(page);
    setPageParams(params);

    // Scroll to anchor if specified
    if (params?.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(`section-${params.scrollTo}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }, 200);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* Categorized Sub-Navbar */}
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
            Movies (IMDb)
          </button>

          <button
            onClick={() => handleNavigate('top250')}
            style={{
              color: activePage === 'top250' ? 'var(--brand-orange)' : '#ccc',
              borderBottom: activePage === 'top250' ? '2px solid var(--brand-orange)' : 'none',
              height: '100%',
              padding: '0 4px'
            }}
          >
            Top 250 Movies
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
            Games (IGDB)
          </button>

          <button
            onClick={() => handleNavigate('library')}
            style={{
              color: activePage === 'library' ? 'var(--brand-orange)' : '#ccc',
              borderBottom: activePage === 'library' ? '2px solid var(--brand-orange)' : 'none',
              height: '100%',
              padding: '0 4px'
            }}
          >
            Library (150+ Titles)
          </button>

          <button
            onClick={() => handleNavigate('celebs')}
            style={{
              color: activePage === 'celebs' ? 'var(--brand-orange)' : '#ccc',
              borderBottom: activePage === 'celebs' ? '2px solid var(--brand-orange)' : 'none',
              height: '100%',
              padding: '0 4px'
            }}
          >
            Celebs & Community
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
            2026 Schedule
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
            Account Center
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
          />
        )}

        {activePage === 'movies' && (
          <MoviesPage
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activePage === 'top250' && (
          <Top250Page
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activePage === 'games' && (
          <GamesPage
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activePage === 'library' && (
          <LibraryPage
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activePage === 'celebs' && (
          <CelebsPage
            onNavigate={handleNavigate}
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
          />
        )}

        {activePage === 'account' && (
          <AccountCenter
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activePage === 'admin' && (
          <AdminPanelPage
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f0f0f', borderTop: '1px solid #262626', padding: '40px 0', marginTop: '60px', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px', fontWeight: 600, color: '#ccc' }}>
            <span onClick={() => handleNavigate('home')} style={{ cursor: 'pointer' }}>Help</span>
            <span onClick={() => handleNavigate('top250')} style={{ cursor: 'pointer' }}>Top 250</span>
            <span onClick={() => handleNavigate('library')} style={{ cursor: 'pointer' }}>All Library</span>
            <span onClick={() => handleNavigate('celebs')} style={{ cursor: 'pointer' }}>Celebs</span>
            <span onClick={() => handleNavigate('schedule')} style={{ cursor: 'pointer' }}>2026 Schedule</span>
            <span onClick={() => handleNavigate('account')} style={{ cursor: 'pointer' }}>IGMDB Account</span>
            <span onClick={() => setIsAiChatOpen(true)} style={{ cursor: 'pointer', color: 'var(--brand-orange)' }}>AI Assistant</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '16px 0' }}>
            <div style={{ background: 'linear-gradient(135deg, #f57c00, #ff6b00)', color: '#000', fontWeight: 900, fontSize: '0.9rem', padding: '2px 6px', borderRadius: '4px' }}>
              IGMDb
            </div>
            <span>an IMDb & IGDB company</span>
          </div>

          <p>© 2026 IGMDb.com, Inc. All rights reserved.</p>
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

    </div>
  );
}
export default App;
