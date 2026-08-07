import React, { useState, useEffect } from 'react';
import { Film, Flame, Star, Calendar, ChevronRight } from 'lucide-react';
import { ImdbHeroCarousel } from '../components/ImdbHeroCarousel';
import { MediaCard } from '../components/MediaCard';
import { CapybaraLoader } from '../components/CapybaraLoader';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
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
      } finally {
        setIsLoading(false);
      }
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

      {isLoading ? (
        <CapybaraLoader caption="Connecting to TMDB & Loading Cinema Catalog..." />
      ) : (
        <>

      {/* IMDb Hero Carousel for Movies */}
      <div className="fade-in-section stagger-1">
      <ImdbHeroCarousel
        featuredItems={trending.slice(0, 5)}
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
      />
      </div>

      {/* Most Popular Movies */}
      <section className="fade-in-section stagger-2" style={{ marginBottom: '40px' }}>
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

      {/* Top 250 Movies with Arrow Button */}
      <section id="section-top250" className="fade-in-section stagger-3" style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <Star color="var(--star-yellow)" fill="var(--star-yellow)" size={22} />
            <span>Top Rated 250 Movies</span>
          </div>
          <button
            onClick={() => onNavigate('top250')}
            style={{
              color: '#000',
              fontWeight: 800,
              fontSize: '0.85rem',
              backgroundColor: 'var(--brand-orange)',
              padding: '6px 16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>See All 250 Movies</span>
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="media-scroll-row">
          {topRated.map(m => (
            <MediaCard key={m.id} item={m} onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
          ))}
        </div>
      </section>

      {/* In Theaters Now */}
      <section className="fade-in-section stagger-4" style={{ marginBottom: '40px' }}>
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
      <section className="fade-in-section stagger-5" style={{ marginBottom: '40px' }}>
        <div className="section-heading">
          <div className="section-title">
            <Calendar color="var(--brand-orange)" size={22} />
            <span>Upcoming Releases</span>
          </div>
          <button onClick={() => onNavigate('schedule')} style={{ color: 'var(--brand-orange)', fontWeight: 700, fontSize: '0.85rem' }}>
            Full 2026 Calendar
          </button>
        </div>
        <div className="media-scroll-row">
          {upcoming.map(m => (
            <MediaCard key={m.id} item={m} onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
          ))}
        </div>
      </section>
        </>
      )}

    </div>
  );
};
