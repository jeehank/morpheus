import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { ImdbHeroCarousel } from '../components/ImdbHeroCarousel';
import { MediaCard } from '../components/MediaCard';
import { fetchTrendingMovies, fetchTopRatedMovies } from '../services/tmdbApi';
import { fetchGamesFromIGDB } from '../services/thegamesdbApi';
import type { Movie, Game } from '../types';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
  onOpenAiChat: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenAuth,
  onOpenAiChat
}) => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [moviesTrend, moviesTop, games] = await Promise.all([
          fetchTrendingMovies(),
          fetchTopRatedMovies(),
          fetchGamesFromIGDB()
        ]);

        setTrendingMovies(moviesTrend);
        setTopRatedMovies(moviesTop);
        setPopularGames(games.slice(0, 10));
        setTrendingGames(games.slice(10, 20));
      } catch (err) {
        console.error('Error loading homepage media:', err);
      }
    }

    loadAllData();
  }, []);

  const heroItems = [
    ...(trendingMovies.slice(0, 3)),
    ...(popularGames.slice(0, 3))
  ];

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      
      {/* IMDb Hero Carousel */}
      <ImdbHeroCarousel 
        featuredItems={heroItems}
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
      />

      {/* Daily AI Recommendation Prompt Banner */}
      <div 
        onClick={onOpenAiChat}
        style={{
          background: 'linear-gradient(135deg, #1f1f1f, #2a1b10)',
          border: '1px solid var(--border-orange)',
          borderRadius: '8px',
          padding: '16px 24px',
          margin: '24px 0 36px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(245, 124, 0, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-orange)',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
              Want a personalized movie or game recommendation?
            </div>
            <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '2px' }}>
              Chat with our dynamic AI Assistant to get tailored recommendations matching your exact taste!
            </div>
          </div>
        </div>

        <button style={{
          backgroundColor: 'var(--brand-orange)',
          color: '#000',
          fontWeight: 800,
          fontSize: '0.85rem',
          padding: '8px 16px',
          borderRadius: '20px',
          whiteSpace: 'nowrap'
        }}>
          Talk to AI
        </button>
      </div>

      {/* Trending Movies Section */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <span>Trending Movies & Shows</span>
            <ChevronRight size={22} color="var(--brand-orange)" />
          </div>
          <button 
            onClick={() => onNavigate('movies')}
            style={{ color: 'var(--brand-orange)', fontSize: '0.9rem', fontWeight: 700 }}
          >
            Explore Movies Page
          </button>
        </div>

        <div className="media-scroll-row">
          {trendingMovies.map((movie) => (
            <MediaCard
              key={`m_${movie.id}`}
              item={movie}
              onNavigate={onNavigate}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      </section>

      {/* Popular Video Games Section (IGDB Proxy) */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <span>Top Video Games (IGDB)</span>
            <ChevronRight size={22} color="var(--brand-orange)" />
          </div>
          <button 
            onClick={() => onNavigate('games')}
            style={{ color: 'var(--brand-orange)', fontSize: '0.9rem', fontWeight: 700 }}
          >
            Explore Games Page
          </button>
        </div>

        <div className="media-scroll-row">
          {popularGames.map((game) => (
            <MediaCard
              key={`g_${game.id}`}
              item={game}
              onNavigate={onNavigate}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      </section>

      {/* Mixed Top Rated Grid */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <span>Fan Favorites & Top Rated</span>
          </div>
        </div>

        <div className="media-scroll-row">
          {[...topRatedMovies.slice(0, 5), ...trendingGames.slice(0, 5)].map((item) => (
            <MediaCard
              key={`fav_${item.media_type}_${item.id}`}
              item={item}
              onNavigate={onNavigate}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      </section>

    </div>
  );
};
