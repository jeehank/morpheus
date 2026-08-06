import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Star, Plus, Check, Loader2 } from 'lucide-react';
import { fetchUpcomingMovies, fetchNowPlayingMovies } from '../services/tmdbApi';
import { fetchUpcomingGames, fetchPopularGames } from '../services/thegamesdbApi';
import type { Movie, Game, UserAccount } from '../types';
import { getCurrentUser, updateUserWatchlist } from '../services/supabaseClient';

interface SchedulePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent'>('upcoming');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movies' | 'games'>('all');

  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSchedule() {
      setIsLoading(true);
      try {
        const [upM, recM, upG, recG] = await Promise.all([
          fetchUpcomingMovies(),
          fetchNowPlayingMovies(),
          fetchUpcomingGames(),
          fetchPopularGames()
        ]);
        
        const todayStr = new Date().toISOString().split('T')[0];

        // Strict future release filter for Upcoming (release_date > today)
        const futureMovies = upM.filter(m => m.release_date && m.release_date > todayStr);
        setUpcomingMovies(futureMovies.length > 0 ? futureMovies : upM);
        
        // Filter recently released strictly to 2026 releases
        const filteredRecentMovies = recM.filter(m => m.release_date && m.release_date.startsWith('2026'));
        setRecentMovies(filteredRecentMovies.length > 0 ? filteredRecentMovies : recM.slice(0, 10));

        const futureGames = upG.filter(g => (g.release_date && g.release_date > todayStr) || (g.released && g.released > todayStr));
        setUpcomingGames(futureGames.length > 0 ? futureGames : upG);
        
        const filteredRecentGames = recG.filter(g => (g.release_date && g.release_date.startsWith('2026')) || (g.released && g.released.startsWith('2026')));
        setRecentGames(filteredRecentGames.length > 0 ? filteredRecentGames : recG.slice(0, 10));
      } catch (err) {
        console.error('Error loading schedule:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSchedule();
  }, []);

  const activeItems = activeTab === 'upcoming'
    ? (mediaFilter === 'movies' ? upcomingMovies : mediaFilter === 'games' ? upcomingGames : [...upcomingMovies, ...upcomingGames])
    : (mediaFilter === 'movies' ? recentMovies : mediaFilter === 'games' ? recentGames : [...recentMovies, ...recentGames]);

  const handleToggleWatchlist = (e: React.MouseEvent, item: Movie | Game) => {
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
      onOpenAuth();
      return;
    }
    const title = 'title' in item ? item.title : item.name;
    const poster = item.media_type === 'movie' 
      ? (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500')
      : (item.cover_url || item.poster_path || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500');

    const updated = updateUserWatchlist({ id: item.id, mediaType: item.media_type, title, poster });
    setCurrentUser(updated);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #2e2e2e', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            <Calendar size={28} color="var(--brand-orange)" />
            <span>2026 Release Calendar & Schedule</span>
          </div>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '4px' }}>
            Track unreleased upcoming theatrical premieres and recently released titles.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--brand-orange)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={44} className="animate-spin" />
          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700 }}>Loading 2026 Release Schedule...</h2>
        </div>
      ) : (
        <>
          {/* Main Tab Switches: Upcoming vs Recently Released */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('upcoming')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'upcoming' ? 'var(--brand-orange)' : '#1f1f1f',
                color: activeTab === 'upcoming' ? '#000' : '#fff',
                fontWeight: 800,
                fontSize: '1rem',
                padding: '14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                border: activeTab === 'upcoming' ? '1px solid var(--brand-orange)' : '1px solid #333'
              }}
            >
              <Calendar size={20} />
              <span>Upcoming Unreleased Titles</span>
              <span style={{ fontSize: '0.75rem', backgroundColor: activeTab === 'upcoming' ? '#000' : '#333', color: activeTab === 'upcoming' ? '#fff' : '#aaa', padding: '2px 8px', borderRadius: '10px' }}>
                {upcomingMovies.length + upcomingGames.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('recent')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'recent' ? 'var(--brand-orange)' : '#1f1f1f',
                color: activeTab === 'recent' ? '#000' : '#fff',
                fontWeight: 800,
                fontSize: '1rem',
                padding: '14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                border: activeTab === 'recent' ? '1px solid var(--brand-orange)' : '1px solid #333'
              }}
            >
              <Clock size={20} />
              <span>Recently Released (2026 Only)</span>
              <span style={{ fontSize: '0.75rem', backgroundColor: activeTab === 'recent' ? '#000' : '#333', color: activeTab === 'recent' ? '#fff' : '#aaa', padding: '2px 8px', borderRadius: '10px' }}>
                {recentMovies.length + recentGames.length}
              </span>
            </button>
          </div>

          {/* Media Type Sub-Filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {(['all', 'movies', 'games'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setMediaFilter(filter)}
                style={{
                  backgroundColor: mediaFilter === filter ? '#333' : '#1a1a1a',
                  color: mediaFilter === filter ? 'var(--brand-orange)' : '#aaa',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: mediaFilter === filter ? '1px solid var(--brand-orange)' : '1px solid #2e2e2e',
                  textTransform: 'capitalize'
                }}
              >
                {filter === 'all' ? 'All Media' : filter}
              </button>
            ))}
          </div>

          {/* Grid of Schedule Items */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {activeItems.map((item) => {
              const title = 'title' in item ? item.title : item.name;
              const rating = item.vote_average || item.rating || 0;
              const date = item.release_date || (item as any).released || '2026';
              const poster = item.media_type === 'movie' 
                ? (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500')
                : (item.cover_url || item.poster_path || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500');

              const inWatchlist = currentUser?.watchlist.some(
                w => String(w.id) === String(item.id) && w.mediaType === item.media_type
              );

              return (
                <div
                  key={`${activeTab}_${item.media_type}_${item.id}`}
                  onClick={() => onNavigate('detail', { id: item.id, type: item.media_type })}
                  style={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid #2e2e2e',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    gap: '14px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, border-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--brand-orange)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#2e2e2e';
                  }}
                >
                  <img src={poster} alt={title} style={{ width: '80px', height: '115px', objectFit: 'cover', borderRadius: '6px' }} />

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{
                          backgroundColor: item.media_type === 'movie' ? '#ff6b00' : '#8b5cf6',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '1px 5px',
                          borderRadius: '3px'
                        }}>
                          {item.media_type}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600 }}>
                          Release: {date}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {title}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
                        <Star size={14} fill="var(--star-yellow)" color="var(--star-yellow)" />
                        <span>{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
                      </div>

                      <button
                        onClick={(e) => handleToggleWatchlist(e, item)}
                        style={{
                          backgroundColor: inWatchlist ? '#333' : 'rgba(245, 124, 0, 0.2)',
                          color: inWatchlist ? '#aaa' : 'var(--brand-orange)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {inWatchlist ? <Check size={13} /> : <Plus size={13} />}
                        <span>{inWatchlist ? 'Added' : 'Watchlist'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
};
