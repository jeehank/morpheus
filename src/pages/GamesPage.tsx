import React, { useState, useEffect } from 'react';
import { Gamepad2, Flame, Star } from 'lucide-react';
import { ImdbHeroCarousel } from '../components/ImdbHeroCarousel';
import { MediaCard } from '../components/MediaCard';
import { fetchPopularGames, fetchTrendingGames, fetchUpcomingGames } from '../services/thegamesdbApi';
import type { Game } from '../types';

interface GamesPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
  onOpenTrailer: (title: string, videoKey?: string) => void;
}

export const GamesPage: React.FC<GamesPageProps> = ({
  onNavigate,
  onOpenAuth,
  onOpenTrailer
}) => {
  const [popular, setPopular] = useState<Game[]>([]);
  const [trending, setTrending] = useState<Game[]>([]);
  const [upcoming, setUpcoming] = useState<Game[]>([]);
  const [activePlatform, setActivePlatform] = useState<string>('All');

  useEffect(() => {
    async function loadData() {
      const [p, t, u] = await Promise.all([
        fetchPopularGames(),
        fetchTrendingGames(),
        fetchUpcomingGames()
      ]);
      setPopular(p);
      setTrending(t);
      setUpcoming(u);
    }
    loadData();
  }, []);

  const filteredPopular = activePlatform === 'All'
    ? popular
    : popular.filter(g => g.platforms?.some((plat: any) => 
        (typeof plat === 'string' ? plat : plat.name).toLowerCase().includes(activePlatform.toLowerCase())
      ));

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      
      {/* IGDB Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#8b5cf6', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontWeight: 900, fontSize: '1.2rem' }}>
            IGDB
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            Video Game Hub
          </h1>
        </div>

        {/* Platform Pill Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'PC', 'PlayStation', 'Xbox', 'Switch'].map(plat => (
            <button
              key={plat}
              onClick={() => setActivePlatform(plat)}
              style={{
                backgroundColor: activePlatform === plat ? 'var(--brand-orange)' : '#1f1f1f',
                color: activePlatform === plat ? '#000' : '#ccc',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid #333',
                transition: 'all 0.2s'
              }}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* IGDB Hero Showcase */}
      <ImdbHeroCarousel
        featuredItems={popular.slice(0, 5)}
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
        onOpenTrailer={onOpenTrailer}
      />

      {/* Popular Games Row */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <Flame color="var(--brand-orange)" size={24} />
            <span>Popular & Trending Games ({activePlatform})</span>
          </div>
          <div className="section-subtitle">Ranked by IGDB player ratings</div>
        </div>
        <div className="media-scroll-row">
          {filteredPopular.map(g => (
            <MediaCard key={g.id} item={g} onNavigate={onNavigate} onOpenAuth={onOpenAuth} onOpenTrailer={onOpenTrailer} />
          ))}
        </div>
      </section>

      {/* Top Rated Games */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <Star color="var(--star-yellow)" fill="var(--star-yellow)" size={22} />
            <span>Highest Rated Games</span>
          </div>
        </div>
        <div className="media-scroll-row">
          {trending.map(g => (
            <MediaCard key={g.id} item={g} onNavigate={onNavigate} onOpenAuth={onOpenAuth} onOpenTrailer={onOpenTrailer} />
          ))}
        </div>
      </section>

      {/* Upcoming Game Releases */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <Gamepad2 color="var(--brand-orange)" size={22} />
            <span>Most Anticipated Upcoming Releases</span>
          </div>
          <button onClick={() => onNavigate('schedule')} style={{ color: 'var(--brand-orange)', fontWeight: 700, fontSize: '0.85rem' }}>
            Full Release Calendar →
          </button>
        </div>
        <div className="media-scroll-row">
          {upcoming.map(g => (
            <MediaCard key={g.id} item={g} onNavigate={onNavigate} onOpenAuth={onOpenAuth} onOpenTrailer={onOpenTrailer} />
          ))}
        </div>
      </section>

    </div>
  );
};
