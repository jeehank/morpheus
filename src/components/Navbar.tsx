import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bookmark, User, Globe, LogOut, Library } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../services/supabaseClient';
import { searchMovies, setTmdbLanguage } from '../services/tmdbApi';
import { searchGames } from '../services/thegamesdbApi';
import type { UserAccount, MediaItem } from '../types';

interface NavbarProps {
  onOpenMenu: () => void;
  onOpenAiChat: () => void;
  onOpenAuth: () => void;
  onNavigate: (page: string, params?: any) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMenu,
  onOpenAiChat,
  onOpenAuth,
  onNavigate
}) => {
  const [searchCategory, setSearchCategory] = useState<'All' | 'Movies' | 'Games'>('All');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('EN');

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const interval = setInterval(() => {
      setCurrentUser(getCurrentUser());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (query.trim().toLowerCase().includes('xclubskimkc.vercel.app')) {
      onNavigate('admin');
      setQuery('');
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSearch(true);
      try {
        let movieRes: MediaItem[] = [];
        let gameRes: MediaItem[] = [];

        if (searchCategory === 'All' || searchCategory === 'Movies') {
          movieRes = await searchMovies(query);
        }
        if (searchCategory === 'All' || searchCategory === 'Games') {
          gameRes = await searchGames(query);
        }

        setResults([...movieRes.slice(0, 5), ...gameRes.slice(0, 5)]);
        setShowDropdown(true);
      } catch (err) {
        setResults([]);
      } finally {
        setIsLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchCategory]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setTmdbLanguage(lang);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setShowProfileMenu(false);
    onNavigate('home');
  };

  return (
    <header style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '56px', gap: '12px' }}>
        
        {/* Brand Logo - IMDb style but Orange */}
        <div 
          onClick={() => onNavigate('home')}
          style={{ 
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #f57c00, #ff6b00)',
            color: '#000',
            fontWeight: 900,
            fontSize: '1.25rem',
            padding: '2px 10px',
            borderRadius: '4px',
            letterSpacing: '-0.5px',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          IGMDb
        </div>

        {/* Menu Button */}
        <button 
          onClick={onOpenMenu}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: '#fff', 
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '6px 12px',
            borderRadius: '4px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>

        {/* Library Top Button */}
        <button
          onClick={() => onNavigate('library')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '6px 12px',
            borderRadius: '4px',
            backgroundColor: '#262626',
            border: '1px solid #383838'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-orange)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#383838'}
        >
          <Library size={18} color="var(--brand-orange)" />
          <span>Library</span>
        </button>

        {/* Search Bar matching IMDb */}
        <div ref={searchRef} style={{ flex: 1, position: 'relative', maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden', height: '36px' }}>
            
            {/* Category Dropdown */}
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value as any)}
              style={{
                backgroundColor: '#f5f5f5',
                border: 'none',
                borderRight: '1px solid #ccc',
                padding: '0 8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#333',
                cursor: 'pointer',
                height: '100%',
                outline: 'none'
              }}
            >
              <option value="All">All</option>
              <option value="Movies">Movies</option>
              <option value="Games">Games</option>
            </select>

            {/* Input */}
            <input
              type="text"
              placeholder="Search IGMDB (Movies & Games)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setShowDropdown(true)}
              style={{
                flex: 1,
                border: 'none',
                padding: '0 12px',
                fontSize: '0.9rem',
                outline: 'none',
                color: '#000',
                height: '100%'
              }}
            />

            {/* Search Icon */}
            <button 
              style={{ padding: '0 12px', color: '#666', height: '100%', display: 'flex', alignItems: 'center' }}
            >
              <Search size={18} />
            </button>
          </div>

          {/* Autocomplete Search Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '42px',
              left: 0,
              right: 0,
              backgroundColor: '#1f1f1f',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              zIndex: 1100,
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {isLoadingSearch ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#aaa', fontSize: '0.85rem' }}>
                  Searching database...
                </div>
              ) : results.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#aaa', fontSize: '0.85rem' }}>
                  No titles found for "{query}"
                </div>
              ) : (
                results.map((item) => {
                  const title = 'title' in item ? item.title : item.name;
                  const poster = item.media_type === 'movie' 
                    ? (item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100')
                    : (item.cover_url || item.poster_path || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100');
                  const year = item.release_date ? item.release_date.split('-')[0] : '';
                  const rating = item.vote_average || item.rating || 0;

                  return (
                    <div
                      key={`${item.media_type}_${item.id}`}
                      onClick={() => {
                        onNavigate('detail', { id: item.id, type: item.media_type });
                        setShowDropdown(false);
                        setQuery('');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        borderBottom: '1px solid #2a2a2a',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c2c2c'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <img 
                        src={poster} 
                        alt={title} 
                        style={{ width: '36px', height: '52px', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa', display: 'flex', gap: '8px', marginTop: '2px' }}>
                          <span style={{ 
                            textTransform: 'uppercase', 
                            fontSize: '0.65rem', 
                            fontWeight: 700, 
                            backgroundColor: item.media_type === 'movie' ? '#ff6b00' : '#8b5cf6',
                            color: '#fff',
                            padding: '1px 5px',
                            borderRadius: '3px'
                          }}>
                            {item.media_type}
                          </span>
                          {year && <span>{year}</span>}
                          {rating > 0 && <span>Rating: {rating.toFixed(1)}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAiChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #f57c00, #ff6b00)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.85rem',
            padding: '6px 14px',
            borderRadius: '20px'
          }}
        >
          <span>AI Assistant</span>
        </button>

        {/* Watchlist Button */}
        <button
          onClick={() => onNavigate('account')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            padding: '6px 10px',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Bookmark size={18} fill={currentUser?.watchlist?.length ? '#f57c00' : 'none'} color="#fff" />
          <span>Watchlist</span>
          {currentUser?.watchlist?.length ? (
            <span style={{ backgroundColor: '#f57c00', color: '#000', fontSize: '0.75rem', fontWeight: 800, borderRadius: '10px', padding: '0 6px' }}>
              {currentUser.watchlist.length}
            </span>
          ) : null}
        </button>

        {/* Sign In / Account Avatar */}
        <div style={{ position: 'relative' }}>
          {currentUser ? (
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '4px 8px',
                borderRadius: '20px',
                backgroundColor: '#262626'
              }}
            >
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#f57c00', color: '#000', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '6px 12px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <User size={18} />
              <span>Sign In</span>
            </button>
          )}

          {/* Profile Dropdown Menu */}
          {showProfileMenu && currentUser && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '40px',
              backgroundColor: '#1f1f1f',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
              width: '220px',
              zIndex: 1200,
              padding: '8px'
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #2e2e2e', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', wordBreak: 'break-all' }}>{currentUser.email}</div>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('account');
                }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 12px', color: '#fff', fontSize: '0.85rem', borderRadius: '4px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c2c2c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Account Center & Playlists
              </button>

              {(currentUser.role === 'admin' || currentUser.role === 'moderator' || currentUser.email.toLowerCase() === 'morpheus@morpheus.com') && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('admin');
                  }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 12px', color: 'var(--brand-orange)', fontWeight: 800, fontSize: '0.85rem', borderRadius: '4px' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c2c2c'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Admin / Mod Portal
                </button>
              )}

              <button
                onClick={handleLogout}
                style={{ width: '100%', textAlign: 'left', padding: '8px 12px', color: '#ef4444', fontSize: '0.85rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c2c2c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Multi-Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '0.85rem', fontWeight: 600, padding: '4px 6px' }}>
          <Globe size={16} />
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="EN" style={{ backgroundColor: '#1f1f1f', color: '#fff' }}>EN</option>
            <option value="ES" style={{ backgroundColor: '#1f1f1f', color: '#fff' }}>ES</option>
            <option value="FR" style={{ backgroundColor: '#1f1f1f', color: '#fff' }}>FR</option>
            <option value="DE" style={{ backgroundColor: '#1f1f1f', color: '#fff' }}>DE</option>
            <option value="JA" style={{ backgroundColor: '#1f1f1f', color: '#fff' }}>JA</option>
            <option value="HI" style={{ backgroundColor: '#1f1f1f', color: '#fff' }}>HI</option>
          </select>
        </div>

      </div>
    </header>
  );
};
