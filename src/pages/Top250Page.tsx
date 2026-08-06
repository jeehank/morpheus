import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchTop250MoviesFull } from '../services/tmdbApi';
import { MediaCard } from '../components/MediaCard';
import type { Movie } from '../types';

interface Top250PageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const Top250Page: React.FC<Top250PageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const [top250Movies, setTop250Movies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTop250() {
      setIsLoading(true);
      try {
        const data = await fetchTop250MoviesFull();
        setTop250Movies(data);
      } catch (err) {
        console.error('Error loading top 250 movies:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTop250();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #2e2e2e', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--brand-orange)', color: '#000', padding: '4px 12px', borderRadius: '6px', fontWeight: 900, fontSize: '1.25rem' }}>
              IMDb Top 250
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
              Top Rated 250 Movies of All Time
            </h1>
          </div>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '6px' }}>
            The definitive list of top 250 rated feature films as voted by millions of IMDb users worldwide.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--brand-orange)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={40} className="animate-spin" />
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>Fetching All Top 250 Movies...</h3>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          {top250Movies.map((movie, index) => (
            <div key={`top_${movie.id}`} style={{ position: 'relative' }}>
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
                zIndex: 20,
                boxShadow: '0 4px 10px rgba(0,0,0,0.8)'
              }}>
                #{index + 1}
              </div>

              <MediaCard
                item={movie}
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
