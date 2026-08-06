import React, { useState, useEffect } from 'react';
import { Gamepad2, Flame, Star, Loader2 } from 'lucide-react';
import { ImdbHeroCarousel } from '../components/ImdbHeroCarousel';
import { MediaCard } from '../components/MediaCard';
import { fetchGamesFromIGDB } from '../services/thegamesdbApi';
import type { Game } from '../types';

interface GamesPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const GamesPage: React.FC<GamesPageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [activePlatform, setActivePlatform] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchGamesFromIGDB();
        setGames(data);
      } catch (err) {
        console.error('Error loading games page:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredGames = activePlatform === 'All'
    ? games
    : games.filter(g => g.platforms?.some((plat: any) => 
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
      </div>

      {isLoading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--brand-orange)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={40} className="animate-spin" />
          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700 }}>Connecting to IGDB Proxy...</h2>
        </div>
      ) : (
        <>
          {/* IGDB Hero Showcase */}
          <ImdbHeroCarousel
            featuredItems={games.slice(0, 5)}
            onNavigate={onNavigate}
            onOpenAuth={onOpenAuth}
          />

          {/* Popular Games Row */}
          <section style={{ marginBottom: '40px' }}>
            <div className="section-heading">
              <div className="section-title">
                <Flame color="var(--brand-orange)" size={24} />
                <span>Popular & Trending Games ({activePlatform})</span>
              </div>
              <div className="section-subtitle">Ranked by IGDB player votes & total rating count</div>
            </div>
            <div className="media-scroll-row">
              {filteredGames.slice(0, 15).map(g => (
                <MediaCard key={g.id} item={g} onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
              ))}
            </div>
          </section>

          {/* Top Rated Games */}
          <section style={{ marginBottom: '40px' }}>
            <div className="section-heading">
              <div className="section-title">
                <Star color="var(--star-yellow)" fill="var(--star-yellow)" size={22} />
                <span>Highest Rated PC & Console Titles</span>
              </div>
            </div>
            <div className="media-scroll-row">
              {games.slice(15, 30).map(g => (
                <MediaCard key={g.id} item={g} onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
              ))}
            </div>
          </section>

          {/* Upcoming Game Releases */}
          <section style={{ marginBottom: '40px' }}>
            <div className="section-heading">
              <div className="section-title">
                <Gamepad2 color="var(--brand-orange)" size={22} />
                <span>Most Anticipated Releases</span>
              </div>
              <button onClick={() => onNavigate('schedule')} style={{ color: 'var(--brand-orange)', fontWeight: 700, fontSize: '0.85rem' }}>
                Full 2026 Schedule →
              </button>
            </div>
            <div className="media-scroll-row">
              {games.slice(30, 45).map(g => (
                <MediaCard key={g.id} item={g} onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
              ))}
            </div>
          </section>
        </>
      )}

    </div>
  );
};
