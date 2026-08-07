import React, { useState, useEffect } from 'react';
import { Film, Gamepad2, Search, Filter, ArrowDown } from 'lucide-react';
import { fetchTop250MoviesFull, movieMatchesGenre } from '../services/tmdbApi';
import { fetchGamesFromIGDB, gameMatchesGenre } from '../services/thegamesdbApi';
import { MediaCard } from '../components/MediaCard';
import { CapybaraLoader } from '../components/CapybaraLoader';
import type { Movie, Game } from '../types';

interface LibraryPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'movies' | 'games'>('movies');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination State: Continuous Load More
  const [visibleCount, setVisibleCount] = useState<number>(120);

  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFullLibrary() {
      setIsLoading(true);
      try {
        const [movies, games] = await Promise.all([
          fetchTop250MoviesFull(30),
          fetchGamesFromIGDB(undefined, true)
        ]);

        setAllMovies(movies);
        setAllGames(games);
      } catch (err) {
        console.error('Error loading library:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadFullLibrary();
  }, []);

  const genresList = [
    'All', 'Action', 'Adventure', 'Sci-Fi', 'RPG', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Fantasy', 'Animation'
  ];

  const currentItems = activeTab === 'movies' ? allMovies : allGames;

  const filteredItems = currentItems.filter((item) => {
    const title = 'title' in item ? item.title : item.name;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesGenre = true;
    if (selectedGenre !== 'All') {
      if (item.media_type === 'movie') {
        matchesGenre = movieMatchesGenre(item as Movie, selectedGenre);
      } else {
        matchesGenre = gameMatchesGenre(item as Game, selectedGenre);
      }
    }

    return matchesSearch && matchesGenre;
  });

  const displayedItems = filteredItems.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 120);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #2e2e2e', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
            <span style={{ backgroundColor: 'var(--brand-orange)', color: '#000', padding: '4px 12px', borderRadius: '6px' }}>LIBRARY</span>
            <span>All Movies & Games Collection</span>
          </div>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '6px' }}>
            Browse feature films and video games with real-time genre filtering and continuous Load More pagination.
          </p>
        </div>
      </div>

      {/* Main Tab Bar: Movies vs Games */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <button
          onClick={() => { setActiveTab('movies'); setSelectedGenre('All'); setVisibleCount(120); }}
          style={{
            flex: 1,
            backgroundColor: activeTab === 'movies' ? 'var(--brand-orange)' : '#1f1f1f',
            color: activeTab === 'movies' ? '#000' : '#fff',
            fontWeight: 900,
            fontSize: '1.05rem',
            padding: '14px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: activeTab === 'movies' ? '1px solid var(--brand-orange)' : '1px solid #333'
          }}
        >
          <Film size={22} />
          <span>All Movies Library ({allMovies.length} Titles)</span>
        </button>

        <button
          onClick={() => { setActiveTab('games'); setSelectedGenre('All'); setVisibleCount(120); }}
          style={{
            flex: 1,
            backgroundColor: activeTab === 'games' ? 'var(--brand-orange)' : '#1f1f1f',
            color: activeTab === 'games' ? '#000' : '#fff',
            fontWeight: 900,
            fontSize: '1.05rem',
            padding: '14px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: activeTab === 'games' ? '1px solid var(--brand-orange)' : '1px solid #333'
          }}
        >
          <Gamepad2 size={22} />
          <span>All Video Games Library ({allGames.length} Titles)</span>
        </button>
      </div>

      {/* Controls Bar: Search & Genre Pills */}
      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', padding: '16px', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder={`Search ${activeTab === 'movies' ? 'movies' : 'games'} in library...`}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(120); }}
            style={{
              width: '100%',
              backgroundColor: '#121212',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '12px 16px 12px 42px',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <Search size={20} color="#777" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Genre Pill Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <Filter size={18} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', color: '#aaa', fontWeight: 700, flexShrink: 0 }}>Filter by Genre:</span>
          {genresList.map((genre) => (
            <button
              key={genre}
              onClick={() => { setSelectedGenre(genre); setVisibleCount(120); }}
              style={{
                backgroundColor: selectedGenre === genre ? 'var(--brand-orange)' : '#262626',
                color: selectedGenre === genre ? '#000' : '#ccc',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: '20px',
                border: selectedGenre === genre ? '1px solid var(--brand-orange)' : '1px solid #383838',
                whiteSpace: 'nowrap'
              }}
            >
              {genre}
            </button>
          ))}
        </div>

      </div>

      {/* Library Grid View */}
      {isLoading ? (
        <CapybaraLoader caption={`Loading ${activeTab} library...`} />
      ) : displayedItems.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#aaa', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
          <h3>No titles found matching your search or genre filter</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try clearing your search query or selecting "All" genres.</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '20px'
          }}>
            {displayedItems.map((item) => (
              <MediaCard
                key={`lib_${item.media_type}_${item.id}`}
                item={item}
                onNavigate={onNavigate}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>

          {/* Continuous Load More Button */}
          {visibleCount < filteredItems.length && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                onClick={handleLoadMore}
                style={{
                  backgroundColor: 'var(--brand-orange)',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '1rem',
                  padding: '14px 36px',
                  borderRadius: '30px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <ArrowDown size={20} />
                <span>Load More</span>
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};
