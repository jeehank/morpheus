import React, { useState, useEffect } from 'react';
import { Film, Gamepad2 } from 'lucide-react';
import { fetchTop250MoviesFull } from '../services/tmdbApi';
import { fetchGamesFromIGDB } from '../services/thegamesdbApi';
import { MediaCard } from '../components/MediaCard';
import { CapybaraLoader } from '../components/CapybaraLoader';
import type { Movie, Game } from '../types';

interface Top250PageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const Top250Page: React.FC<Top250PageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'movies' | 'games'>('movies');
  const [top250Movies, setTop250Movies] = useState<Movie[]>([]);
  const [top250Games, setTop250Games] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTop250Data() {
      setIsLoading(true);
      try {
        const [movies, games] = await Promise.all([
          fetchTop250MoviesFull(),
          fetchGamesFromIGDB()
        ]);
        
        // Sort games by rating desc for Top 250 Games
        const sortedGames = [...games].sort((a, b) => (b.rating || 0) - (a.rating || 0));

        setTop250Movies(movies);
        setTop250Games(sortedGames);
      } catch (err) {
        console.error('Error loading top 250:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTop250Data();
  }, []);

  const currentList = activeTab === 'movies' ? top250Movies : top250Games;

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #2e2e2e', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--brand-orange)', color: '#000', padding: '4px 12px', borderRadius: '6px', fontWeight: 900, fontSize: '1.25rem' }}>
              IGMDb Top 250
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
              {activeTab === 'movies' ? 'Top Rated 250 Feature Films' : 'Top Rated 250 Video Games'}
            </h1>
          </div>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '6px' }}>
            The definitive list of top 250 rated {activeTab === 'movies' ? 'movies' : 'video games'} as voted by millions of users worldwide.
          </p>
        </div>
      </div>

      {/* Tabs for Top 250 Movies vs Top 250 Games */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('movies')}
          style={{
            flex: 1,
            backgroundColor: activeTab === 'movies' ? 'var(--brand-orange)' : '#1f1f1f',
            color: activeTab === 'movies' ? '#000' : '#fff',
            fontWeight: 900,
            fontSize: '1rem',
            padding: '12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: activeTab === 'movies' ? '1px solid var(--brand-orange)' : '1px solid #333'
          }}
        >
          <Film size={20} />
          <span>IMDb Top 250 Movies ({top250Movies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('games')}
          style={{
            flex: 1,
            backgroundColor: activeTab === 'games' ? 'var(--brand-orange)' : '#1f1f1f',
            color: activeTab === 'games' ? '#000' : '#fff',
            fontWeight: 900,
            fontSize: '1rem',
            padding: '12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: activeTab === 'games' ? '1px solid var(--brand-orange)' : '1px solid #333'
          }}
        >
          <Gamepad2 size={20} />
          <span>IGDB Top 250 Games ({top250Games.length})</span>
        </button>
      </div>

      {isLoading ? (
        <CapybaraLoader caption={`Fetching Top 250 ${activeTab}...`} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          {currentList.map((item, index) => (
            <div key={`top_${item.media_type}_${item.id}`} style={{ position: 'relative' }}>
              {/* Rank Number Badge */}
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '-8px',
                backgroundColor: 'var(--brand-orange)',
                color: '#000',
                fontWeight: 900,
                fontSize: '0.85rem',
                padding: '4px 8px',
                borderRadius: '6px',
                zIndex: 20
              }}>
                #{index + 1}
              </div>

              <MediaCard
                item={item}
                onNavigate={onNavigate}
                onOpenAuth={onOpenAuth}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
