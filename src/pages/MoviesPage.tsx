import React, { useState, useEffect } from 'react';
import { Film, Flame, Star, Calendar } from 'lucide-react';
import { ImdbHeroCarousel } from '../components/ImdbHeroCarousel';
import { MediaCard } from '../components/MediaCard';
import { fetchTrendingMovies, fetchTopRatedMovies, fetchNowPlayingMovies, fetchUpcomingMovies } from '../services/tmdbApi';
import type { Movie } from '../types';

interface MoviesPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);

  useEffect(() => {
    async function loadData() {
      const [t, tr, np, up] = await Promise.all([
        fetchTrendingMovies(),
        fetchTopRatedMovies(),
        fetchNowPlayingMovies(),
        fetchUpcomingMovies()
      ]);
      setTrending(t);
      setTopRated(tr);
      setNowPlaying(np);
      setUpcoming(up);
    }
    loadData();
  }, []);

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: 'var(--brand-orange)', color: '#000', padding: '6px 12px', borderRadius: '6px', fontWeight: 900, fontSize: '1.2rem' }}>
          MOVIES
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
          IMDb Cinema Hub
        </h1>
      </div>

      {/* IMDb Hero Carousel for Movies */}
      <ImdbHeroCarousel
        featuredItems={trending.slice(0, 5)}
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
      />

      {/* Most Popular Movies */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <Flame color="var(--brand-orange)" size={24} />
            <span>Most Popular Movies</span>
          </div>
          <div className="section-subtitle">As determined by IMDb users</div>
        </div>
        <div className="media-scroll-row">
          {trending.map(m => (
            <MediaCard key={m.id} item={m} onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
          ))}
        </div>
      </section>

      {/* Top 250 Movies */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <Star color="var(--star-yellow)" fill="var(--star-yellow)" size={22} />
            <span>Top Rated 250 Movies</span>
          </div>
        </div>
        <div className="media-scroll-row">
          {topRated.map(m => (
            <MediaCard key={m.id} item={m} onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
          ))}
        </div>
      </section>

      {/* In Theaters Now */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <Film color="var(--brand-orange)" size={22} />
            <span>In Theaters Now</span>
          </div>
        </div>
        <div className="media-scroll-row">
          {nowPlaying.map(m => (
            <MediaCard key={m.id} item={m} onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
          ))}
        </div>
      </section>

      {/* Upcoming Releases */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <Calendar color="var(--brand-orange)" size={22} />
            <span>Upcoming Releases</span>
          </div>
          <button onClick={() => onNavigate('schedule')} style={{ color: 'var(--brand-orange)', fontWeight: 700, fontSize: '0.85rem' }}>
            Full 2026 Calendar →
          </button>
        </div>
        <div className="media-scroll-row">
          {upcoming.map(m => (
            <MediaCard key={m.id} item={m} onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
          ))}
        </div>
      </section>

    </div>
  );
};
