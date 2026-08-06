import React, { useState, useEffect } from 'react';
import { Star, Plus, Check, Tv, User, Play, Eye, EyeOff, MoreVertical, Flag, Trash2, AlertTriangle } from 'lucide-react';
import { fetchMovieDetails, fetchMovieWatchProviders, fetchMovieCredits, fetchMovieTrailerKey, getTmdbImageUrl } from '../services/tmdbApi';
import { fetchGameDetails } from '../services/thegamesdbApi';
import {
  fetchReviews,
  addReview,
  getCurrentUser,
  updateUserWatchlist,
  updateContinueWatching,
  toggleReviewSpoiler,
  deleteReview,
  reportReview
} from '../services/supabaseClient';
import { TrailerModal } from '../components/TrailerModal';
import { PlatformLogo } from '../components/PlatformLogos';
import type { Movie, Game, Review, UserAccount, WatchProvidersResult, CastMember } from '../types';

interface MediaDetailPageProps {
  id: number | string;
  type: 'movie' | 'game';
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const MediaDetailPage: React.FC<MediaDetailPageProps> = ({
  id,
  type,
  onNavigate,
  onOpenAuth
}) => {
  const [mediaItem, setMediaItem] = useState<Movie | Game | null>(null);
  const [providers, setProviders] = useState<WatchProvidersResult | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  // Trailer state
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  // Review Form State
  const [userRating, setUserRating] = useState(9);
  const [reviewHeadline, setReviewHeadline] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [isSpoilerInput, setIsSpoilerInput] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Revealed Spoilers Set
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  // Active Menu Review ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (type === 'movie') {
        const item = await fetchMovieDetails(id);
        const provs = await fetchMovieWatchProviders(id);
        const creditsData = await fetchMovieCredits(id);
        const tKey = await fetchMovieTrailerKey(id);

        setMediaItem(item);
        setProviders(provs);
        setCast(creditsData);
        setTrailerKey(tKey);
      } else {
        const item = await fetchGameDetails(id);
        setMediaItem(item);
      }

      // Fetch reviews from Supabase DB
      const dbRevs = await fetchReviews(id, type);
      setReviews(dbRevs);
      setIsLoading(false);

      if (mediaItem) {
        const titleStr = 'title' in mediaItem ? mediaItem.title : mediaItem.name;
        const posterStr = type === 'movie'
          ? (mediaItem.poster_path ? `https://image.tmdb.org/t/p/w500${mediaItem.poster_path}` : '')
          : ((mediaItem as Game).cover_url || '');
        updateContinueWatching({ id, mediaType: type, title: titleStr, poster: posterStr });
      }
    }

    loadData();
  }, [id, type]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center', color: '#aaa' }}>
        <h2>Loading title details & reviews...</h2>
      </div>
    );
  }

  if (!mediaItem) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center', color: '#aaa' }}>
        <h2>Media title not found.</h2>
        <button onClick={() => onNavigate('home')} style={{ color: 'var(--brand-orange)', marginTop: '16px', fontWeight: 700 }}>
          Back to Home
        </button>
      </div>
    );
  }

  const title = 'title' in mediaItem ? mediaItem.title : mediaItem.name;
  const overview = mediaItem.overview || (mediaItem as Game).summary || 'No description available.';
  const rating = mediaItem.vote_average || (mediaItem as Game).rating || 8.5;
  const releaseDate = mediaItem.release_date || (mediaItem as Game).released || 'N/A';
  
  const posterUrl = type === 'movie'
    ? getTmdbImageUrl(mediaItem.poster_path ?? null, 'w500')
    : ((mediaItem as Game).cover_url || (mediaItem as Game).poster_path || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500');

  const inWatchlist = currentUser?.watchlist.some(
    w => String(w.id) === String(id) && w.mediaType === type
  ) || false;

  const isAdminOrMod = currentUser?.role === 'admin' || currentUser?.role === 'moderator' || currentUser?.email.toLowerCase() === 'morpheus@morpheus.com';

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
    const res = await addReview(id, type, title, userRating, reviewHeadline, reviewContent, isSpoilerInput);
    setIsSubmittingReview(false);

    if (!res.success) {
      setReviewError(res.error || 'Failed to submit review.');
      return;
    }

    if (res.review) {
      setReviews([res.review, ...reviews]);
      setReviewHeadline('');
      setReviewContent('');
      setIsSpoilerInput(false);
      setReviewSuccess(true);
    }
  };

  const toggleRevealSpoiler = (reviewId: string) => {
    setRevealedSpoilers(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const handleToggleSpoilerTag = async (reviewId: string, currentSpoilerState: boolean) => {
    await toggleReviewSpoiler(reviewId, !currentSpoilerState);
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isSpoiler: !currentSpoilerState } : r));
    setActiveMenuId(null);
  };

  const handleDeleteReviewCard = async (reviewId: string) => {
    await deleteReview(reviewId);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    setActiveMenuId(null);
  };

  const handleReportReviewCard = async (reviewId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setReportStatus(null);
    const res = await reportReview(reviewId, 'spoiler');
    if (res.success) {
      setReportStatus('Review reported to moderators.');
      setTimeout(() => setReportStatus(null), 3000);
    }
    setActiveMenuId(null);
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

      {/* Main Visual Banner & Inline Official Trailer */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', height: '420px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1a1a1a', margin: '12px 0 32px 0' }}>
        
        {/* Poster */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img src={posterUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Embedded YouTube Official Trailer Player directly on page */}
        <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
          <iframe
            src={trailerKey
              ? `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=0&rel=0`
              : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(title + ' official trailer')}&autoplay=0`
            }
            title={`${title} Official Trailer`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          <button
            onClick={handleToggleWatchlist}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: inWatchlist ? '#333' : 'rgba(0,0,0,0.85)',
              color: inWatchlist ? '#fff' : 'var(--brand-orange)',
              border: '1px solid var(--brand-orange)',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '8px 16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 10
            }}
          >
            {inWatchlist ? <Check size={16} /> : <Plus size={16} />}
            <span>{inWatchlist ? 'In Watchlist' : 'Add Watchlist'}</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Details Left, Streaming Availability Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        
        <div>
          {/* Storyline */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', borderLeft: '4px solid var(--brand-orange)', paddingLeft: '10px', marginBottom: '12px' }}>
              Storyline & Overview
            </h2>
            <p style={{ fontSize: '1rem', color: '#ddd', lineHeight: 1.6, backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '8px', border: '1px solid #2e2e2e' }}>
              {overview}
            </p>
          </section>

          {/* Official Embedded Video Trailer Section */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', borderLeft: '4px solid var(--brand-orange)', paddingLeft: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={20} fill="var(--brand-orange)" color="var(--brand-orange)" />
              <span>Official Video Trailer</span>
            </h2>
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2e2e2e' }}>
              <iframe
                src={trailerKey
                  ? `https://www.youtube-nocookie.com/embed/${trailerKey}`
                  : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(title + ' official trailer')}`
                }
                title={`Official Trailer: ${title}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>

          {/* Cast & Crew Section */}
          {type === 'movie' && cast.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', borderLeft: '4px solid var(--brand-orange)', paddingLeft: '10px', marginBottom: '16px' }}>
                Top Cast (TMDB Database)
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
                {cast.map((actor) => (
                  <div key={actor.id} style={{ backgroundColor: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: '6px', overflow: 'hidden', textAlign: 'center', paddingBottom: '8px' }}>
                    <div style={{ width: '100%', height: '140px', backgroundColor: '#141414', overflow: 'hidden' }}>
                      {actor.profile_path ? (
                        <img src={actor.profile_path} alt={actor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                          <User size={36} />
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff', marginTop: '6px', padding: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {actor.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#aaa', padding: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {actor.character}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Community Reviews Section */}
          <section id="review-section" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', borderLeft: '4px solid var(--brand-orange)', paddingLeft: '10px' }}>
                User Reviews ({reviews.length})
              </h2>

              {reportStatus && (
                <div style={{ color: '#4ade80', fontSize: '0.85rem', backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: '4px 10px', borderRadius: '4px' }}>
                  {reportStatus}
                </div>
              )}
            </div>

            {/* Review Submission Form with Profanity Filter & Spoiler Checkbox */}
            <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                Write a Review for {title}
              </h3>

              {!currentUser ? (
                <div style={{ backgroundColor: '#242424', padding: '16px', borderRadius: '6px', textAlign: 'center', color: '#aaa' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                    You must be signed in to post reviews.
                  </p>
                  <button onClick={onOpenAuth} style={{ backgroundColor: 'var(--brand-orange)', color: '#000', fontWeight: 800, padding: '8px 20px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    Sign In / Register
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePostReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {reviewError && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', padding: '10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} />
                      <div>{reviewError}</div>
                    </div>
                  )}
                  {reviewSuccess && (
                    <div style={{ color: '#22c55e', fontSize: '0.85rem', backgroundColor: 'rgba(34,197,94,0.1)', padding: '8px', borderRadius: '4px' }}>
                      Review submitted successfully to Supabase!
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
                      placeholder="Write your detailed review here (Profanity filter active)..."
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #333', borderRadius: '6px', padding: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  {/* Spoiler Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="spoilerCheck"
                      checked={isSpoilerInput}
                      onChange={(e) => setIsSpoilerInput(e.target.checked)}
                      style={{ accentColor: 'var(--brand-orange)', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="spoilerCheck" style={{ fontSize: '0.85rem', color: '#ccc', cursor: 'pointer' }}>
                      Mark this review as containing spoilers
                    </label>
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
                reviews.map((rev) => {
                  const isAuthor = currentUser?.id === rev.userId;
                  const isRevealed = revealedSpoilers.has(rev.id);

                  return (
                    <div key={rev.id} style={{ backgroundColor: '#1a1a1a', border: rev.isSpoiler ? '1px solid #d97706' : '1px solid #2e2e2e', borderRadius: '8px', padding: '16px', position: 'relative' }}>
                      
                      {/* Top Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{rev.userName}</span>
                          {rev.isSpoiler && (
                            <span style={{ backgroundColor: '#d97706', color: '#000', fontSize: '0.7rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              SPOILER
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                            <Star size={16} fill="var(--star-yellow)" color="var(--star-yellow)" />
                            <span>{rev.rating}/10</span>
                          </div>

                          {/* 3-Dots Menu */}
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === rev.id ? null : rev.id)}
                              style={{ color: '#aaa', padding: '4px' }}
                            >
                              <MoreVertical size={18} />
                            </button>

                            {activeMenuId === rev.id && (
                              <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '26px',
                                backgroundColor: '#242424',
                                border: '1px solid #383838',
                                borderRadius: '6px',
                                width: '180px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                                zIndex: 100,
                                overflow: 'hidden'
                              }}>
                                {(isAuthor || isAdminOrMod) && (
                                  <button
                                    onClick={() => handleToggleSpoilerTag(rev.id, !!rev.isSpoiler)}
                                    style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '0.82rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <EyeOff size={14} color="var(--brand-orange)" />
                                    <span>{rev.isSpoiler ? 'Remove Spoiler Tag' : 'Mark as Spoiler'}</span>
                                  </button>
                                )}

                                {(isAuthor || isAdminOrMod) && (
                                  <button
                                    onClick={() => handleDeleteReviewCard(rev.id)}
                                    style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '0.82rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <Trash2 size={14} />
                                    <span>Delete Review</span>
                                  </button>
                                )}

                                {!isAuthor && (
                                  <button
                                    onClick={() => handleReportReviewCard(rev.id)}
                                    style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '0.82rem', color: '#ff9800', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <Flag size={14} />
                                    <span>Report as Spoiler</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Headline */}
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand-orange)', marginBottom: '6px' }}>
                        {rev.headline}
                      </div>

                      {/* Review Content with Spoiler Blur */}
                      {rev.isSpoiler && !isRevealed ? (
                        <div style={{ backgroundColor: '#121212', border: '1px border #2a2a2a', padding: '16px', borderRadius: '6px', textAlign: 'center', margin: '8px 0' }}>
                          <p style={{ color: '#aaa', fontSize: '0.85rem', filter: 'blur(5px)', userSelect: 'none', marginBottom: '10px' }}>
                            {rev.content}
                          </p>
                          <button
                            onClick={() => toggleRevealSpoiler(rev.id)}
                            style={{
                              backgroundColor: '#d97706',
                              color: '#000',
                              fontWeight: 900,
                              fontSize: '0.82rem',
                              padding: '6px 14px',
                              borderRadius: '20px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Eye size={14} />
                            <span>Show Spoiler</span>
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {rev.content}
                          </p>
                          {rev.isSpoiler && isRevealed && (
                            <button
                              onClick={() => toggleRevealSpoiler(rev.id)}
                              style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px', textDecoration: 'underline' }}
                            >
                              Hide Spoiler
                            </button>
                          )}
                        </div>
                      )}

                      <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '10px' }}>
                        Posted on {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>

        {/* Right Sidebar: Streaming & Platform Logos */}
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
                    { provider_name: 'Netflix' },
                    { provider_name: 'Prime Video' },
                    { provider_name: 'Disney+' }
                  ]).slice(0, 4).map((p: any, idx) => (
                    <div key={idx} style={{ backgroundColor: '#141414', padding: '10px 14px', borderRadius: '6px', border: '1px solid #2e2e2e' }}>
                      <PlatformLogo platformName={p.provider_name || 'Netflix'} />
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
                  {['Steam', 'PlayStation', 'Xbox'].map((store) => (
                    <div key={store} style={{ backgroundColor: '#141414', padding: '10px 14px', borderRadius: '6px', border: '1px solid #2e2e2e' }}>
                      <PlatformLogo platformName={store} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        title={title}
        videoKey={trailerKey || undefined}
        onClose={() => setIsTrailerModalOpen(false)}
      />

    </div>
  );
};
