import React, { useState, useEffect } from 'react';
import { Star, Play, Plus, Check, Tv, Users, MessageSquare, ShieldAlert, CheckCircle2, Award, Calendar, Share2, Globe } from 'lucide-react';
import { fetchMovieDetails, fetchMovieWatchProviders, getTmdbImageUrl } from '../services/tmdbApi';
import { fetchGameDetails } from '../services/thegamesdbApi';
import { getStoredReviews, addReview, getCurrentUser, updateUserWatchlist, updateContinueWatching } from '../services/supabaseClient';
import { Movie, Game, Review, UserAccount, WatchProvidersResult } from '../types';

interface MediaDetailPageProps {
  id: number | string;
  type: 'movie' | 'game';
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
  onOpenTrailer: (title: string, videoKey?: string) => void;
}

export const MediaDetailPage: React.FC<MediaDetailPageProps> = ({
  id,
  type,
  onNavigate,
  onOpenAuth,
  onOpenTrailer
}) => {
  const [mediaItem, setMediaItem] = useState<Movie | Game | null>(null);
  const [providers, setProviders] = useState<WatchProvidersResult | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  // Review Form State
  const [userRating, setUserRating] = useState(9);
  const [reviewHeadline, setReviewHeadline] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (type === 'movie') {
        const item = await fetchMovieDetails(id);
        const provs = await fetchMovieWatchProviders(id);
        setMediaItem(item);
        setProviders(provs);
      } else {
        const item = await fetchGameDetails(id);
        setMediaItem(item);
      }

      const allRevs = getStoredReviews();
      const filtered = allRevs.filter(r => String(r.mediaId) === String(id) && r.mediaType === type);
      setReviews(filtered);
      setIsLoading(false);

      // Track Continue Watching
      if (mediaItem) {
        const title = 'title' in mediaItem ? mediaItem.title : mediaItem.name;
        const poster = type === 'movie'
          ? (mediaItem.poster_path ? `https://image.tmdb.org/t/p/w500${mediaItem.poster_path}` : '')
          : ((mediaItem as Game).cover_url || '');
        updateContinueWatching({ id, mediaType: type, title, poster });
      }
    }

    loadData();
  }, [id, type]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center', color: '#aaa' }}>
        <h2>Loading title details...</h2>
      </div>
    );
  }

  if (!mediaItem) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center', color: '#aaa' }}>
        <h2>Media title not found.</h2>
        <button onClick={() => onNavigate('home')} style={{ color: 'var(--brand-orange)', marginTop: '16px', fontWeight: 700 }}>
          ← Back to Home
        </button>
      </div>
    );
  }

  const title = 'title' in mediaItem ? mediaItem.title : mediaItem.name;
  const overview = mediaItem.overview || (mediaItem as Game).summary || 'No description available.';
  const rating = mediaItem.vote_average || (mediaItem as Game).rating || 8.5;
  const voteCount = mediaItem.vote_count || (mediaItem as Game).rating_count || 1200;
  const releaseDate = mediaItem.release_date || (mediaItem as Game).released || 'N/A';
  
  const backdropUrl = type === 'movie'
    ? getTmdbImageUrl(mediaItem.backdrop_path, 'original')
    : ((mediaItem as Game).backdrop_path || (mediaItem as Game).cover_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200');

  const posterUrl = type === 'movie'
    ? getTmdbImageUrl(mediaItem.poster_path, 'w500')
    : ((mediaItem as Game).cover_url || (mediaItem as Game).poster_path || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500');

  const inWatchlist = currentUser?.watchlist.some(
    w => String(w.id) === String(id) && w.mediaType === type
  ) || false;

  const handleToggleWatchlist = () => {
    const user = getCurrentUser();
    if (!user) {
      onOpenAuth();
      return;
    }
    const updated = updateUserWatchlist({ id, mediaType: type, title, poster: posterUrl });
    setCurrentUser(updated);
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(false);

    if (!reviewHeadline.trim() || !reviewContent.trim()) {
      setReviewError('Please fill out both headline and review content.');
      return;
    }

    setIsSubmittingReview(true);
    const res = await addReview(id, type, title, userRating, reviewHeadline, reviewContent);
    setIsSubmittingReview(false);

    if (!res.success) {
      setReviewError(res.error || 'Failed to submit review.');
      return;
    }

    if (res.review) {
      setReviews([res.review, ...reviews]);
      setReviewHeadline('');
      setReviewContent('');
      setReviewSuccess(true);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      
      {/* Title Header Bar */}
      <div style={{ padding: '20px 0 12px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#aaa', fontSize: '0.88rem', marginTop: '6px' }}>
            <span style={{ textTransform: 'uppercase', fontWeight: 800, backgroundColor: type === 'movie' ? '#ff6b00' : '#8b5cf6', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
              {type}
            </span>
            <span>Released {releaseDate}</span>
            {type === 'movie' && (mediaItem as Movie).runtime ? (
              <span>{(mediaItem as Movie).runtime} min</span>
            ) : null}
          </div>
        </div>

        {/* Rating Block */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>IMDb RATING</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <Star size={24} fill="var(--star-yellow)" color="var(--star-yellow)" />
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{rating.toFixed(1)}</span>
                <span style={{ fontSize: '0.8rem', color: '#aaa' }}>/10</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>YOUR RATING</div>
            <button
              onClick={() => {
                const el = document.getElementById('review-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5799ef', fontWeight: 700, marginTop: '2px', fontSize: '0.9rem' }}
            >
              <Star size={20} color="#5799ef" />
              <span>Rate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Banner (Backdrop + Poster + Trailer button) */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', height: '420px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1a1a1a', margin: '12px 0 32px 0' }}>
        
        {/* Poster */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img src={posterUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Backdrop Video Hero */}
        <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
          <img src={backdropUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }} />
          
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(18,18,18,0.9), transparent 60%)'
          }} />

          {/* Play Trailer Overlay Button */}
          <button
            onClick={() => onOpenTrailer(title)}
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              backgroundColor: 'var(--brand-orange)',
              color: '#000',
              fontWeight: 800,
              fontSize: '1rem',
              padding: '12px 24px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 20px rgba(245, 124, 0, 0.5)'
            }}
          >
            <Play size={20} fill="#000" />
            <span>Watch Official Trailer</span>
          </button>

          <button
            onClick={handleToggleWatchlist}
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              backgroundColor: inWatchlist ? '#333' : 'rgba(0,0,0,0.7)',
              color: inWatchlist ? '#fff' : 'var(--brand-orange)',
              border: '1px solid var(--brand-orange)',
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '12px 20px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {inWatchlist ? <Check size={18} /> : <Plus size={18} />}
            <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Details Left, Streaming Availability Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        
        <div>
          {/* Synopsis / Storyline */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', borderLeft: '4px solid var(--brand-orange)', paddingLeft: '10px', marginBottom: '12px' }}>
              Storyline & Overview
            </h2>
            <p style={{ fontSize: '1rem', color: '#ddd', lineHeight: 1.6, backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '8px', border: '1px solid #2e2e2e' }}>
              {overview}
            </p>
          </section>

          {/* Cast & Crew / Developers */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', borderLeft: '4px solid var(--brand-orange)', paddingLeft: '10px', marginBottom: '12px' }}>
              {type === 'movie' ? 'Top Cast & Crew' : 'Platforms & Developers'}
            </h2>
            
            {type === 'movie' && (mediaItem as Movie).genres ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(mediaItem as Movie).genres?.map(g => (
                  <span key={g.id} style={{ backgroundColor: '#2a2a2a', color: '#fff', fontSize: '0.85rem', padding: '6px 14px', borderRadius: '20px', border: '1px solid #3a3a3a' }}>
                    {g.name}
                  </span>
                ))}
              </div>
            ) : type === 'game' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(mediaItem as Game).platforms?.map((p: any, idx) => (
                  <span key={idx} style={{ backgroundColor: '#2a2a2a', color: '#fff', fontSize: '0.85rem', padding: '6px 14px', borderRadius: '20px', border: '1px solid #3a3a3a' }}>
                    {typeof p === 'string' ? p : p.name}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          {/* Community Reviews Section */}
          <section id="review-section" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', borderLeft: '4px solid var(--brand-orange)', paddingLeft: '10px' }}>
                User Reviews & Ratings ({reviews.length})
              </h2>
            </div>

            {/* Review Submission Form */}
            <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                Write a Review for {title}
              </h3>

              {!currentUser ? (
                <div style={{ backgroundColor: '#242424', padding: '16px', borderRadius: '6px', textAlign: 'center', color: '#aaa' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                    🔒 You must be signed in with a verified email or Google account to post reviews.
                  </p>
                  <button onClick={onOpenAuth} style={{ backgroundColor: 'var(--brand-orange)', color: '#000', fontWeight: 800, padding: '8px 20px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    Sign In / Register
                  </button>
                </div>
              ) : (!currentUser.isEmailVerified && !currentUser.isGoogleAuth) ? (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '14px', borderRadius: '6px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <ShieldAlert size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Email Verification Required</strong>
                    <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                      Reviews are restricted to accounts with verified email addresses or Google SSO to prevent spam. Please enter your 6-digit verification code.
                    </span>
                    <button onClick={onOpenAuth} style={{ backgroundColor: '#ef4444', color: '#fff', fontWeight: 700, padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', marginTop: '10px', display: 'block' }}>
                      Verify Email Code Now
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePostReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {reviewError && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', backgroundColor: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: '4px' }}>
                      ⚠️ {reviewError}
                    </div>
                  )}
                  {reviewSuccess && (
                    <div style={{ color: '#22c55e', fontSize: '0.85rem', backgroundColor: 'rgba(34,197,94,0.1)', padding: '8px', borderRadius: '4px' }}>
                      ✅ Review submitted successfully!
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 600 }}>Your Rating:</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => setUserRating(val)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '4px',
                            backgroundColor: userRating >= val ? 'var(--brand-orange)' : '#2e2e2e',
                            color: userRating >= val ? '#000' : '#888',
                            fontWeight: 800,
                            fontSize: '0.8rem'
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Headline or summary of your review..."
                      value={reviewHeadline}
                      onChange={(e) => setReviewHeadline(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #333', borderRadius: '6px', padding: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <textarea
                      rows={4}
                      placeholder="Write your detailed review here..."
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #333', borderRadius: '6px', padding: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    style={{ backgroundColor: 'var(--brand-orange)', color: '#000', fontWeight: 800, padding: '10px 20px', borderRadius: '6px', alignSelf: 'flex-start' }}
                  >
                    {isSubmittingReview ? 'Posting Review...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>

            {/* Existing Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  No reviews posted yet for this title. Be the first to review!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{rev.userName}</span>
                        <span style={{ fontSize: '0.7rem', color: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={12} /> Verified Reviewer
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                        <Star size={16} fill="var(--star-yellow)" color="var(--star-yellow)" />
                        <span>{rev.rating}/10</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand-orange)', marginBottom: '6px' }}>
                      {rev.headline}
                    </div>
                    <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {rev.content}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '10px' }}>
                      Posted on {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Right Sidebar: Streaming & Platform Availability */}
        <div>
          <div style={{ backgroundColor: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: '8px', padding: '20px', position: 'sticky', top: '76px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              <Tv size={20} color="var(--brand-orange)" />
              <span>Where to Watch & Play</span>
            </div>

            {type === 'movie' ? (
              <div>
                <p style={{ fontSize: '0.82rem', color: '#aaa', marginBottom: '14px' }}>
                  Available streaming & rental providers:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(providers?.flatrate || providers?.rent || [
                    { provider_id: 1, provider_name: 'Netflix', logo_path: '/pbpST2wM2vKbxy18mYj8jC3w2Lw.jpg' },
                    { provider_id: 2, provider_name: 'Amazon Prime Video', logo_path: '/dQeA35BByeaBBRwhfY2yudtz3ne.jpg' },
                    { provider_id: 3, provider_name: 'Disney+', logo_path: '/7rwE2KG48GWB2X4zD38d2G6h7Xl.jpg' }
                  ]).slice(0, 4).map((p: any) => (
                    <div key={p.provider_id || p.provider_name} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#141414', padding: '8px 12px', borderRadius: '6px', border: '1px solid #2e2e2e' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#ff6b00', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                        {p.provider_name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{p.provider_name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#22c55e', fontWeight: 700, backgroundColor: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        Stream HD
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.82rem', color: '#aaa', marginBottom: '14px' }}>
                  Available gaming platforms & digital stores:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Steam (PC)', 'PlayStation Store (PS5)', 'Xbox Games Store', 'Nintendo eShop'].map((store) => (
                    <div key={store} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#141414', padding: '8px 12px', borderRadius: '6px', border: '1px solid #2e2e2e' }}>
                      <Globe size={18} color="var(--brand-orange)" />
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{store}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
