import React, { useState, useEffect } from 'react';
import { User, Flame } from 'lucide-react';
import { fetchPopularCelebs } from '../services/tmdbApi';
import { CapybaraLoader } from '../components/CapybaraLoader';

interface CelebsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CelebsPage: React.FC<CelebsPageProps> = () => {
  const [celebs, setCelebs] = useState<Array<{ id: number; name: string; profile_path: string | null; known_for_department: string; popularity: number; known_for: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCelebs() {
      setIsLoading(true);
      try {
        const data = await fetchPopularCelebs();
        setCelebs(data);
      } catch (err) {
        console.error('Error loading celebs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCelebs();
  }, []);

  const trendingActors = celebs.slice(0, 10);
  const bornTodayActors = celebs.slice(10, 20);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #2e2e2e', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--brand-orange)', color: '#000', padding: '4px 12px', borderRadius: '6px', fontWeight: 900, fontSize: '1.2rem' }}>
              CELEBS & COMMUNITY
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
              Popular Actors & Public Figures
            </h1>
          </div>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '6px' }}>
            Explore popular trending actors, directors, and stars born today from TMDB database.
          </p>
        </div>
      </div>

      {isLoading ? (
        <CapybaraLoader caption="Fetching Popular Actor Profiles..." />
      ) : (
        <>
          {/* Section 1: Trending Actors */}
          <section style={{ marginBottom: '48px' }}>
            <div className="section-heading" style={{ marginBottom: '20px' }}>
              <div className="section-title">
                <Flame color="var(--brand-orange)" size={24} />
                <span>Trending Actors</span>
              </div>
              <div className="section-subtitle">Most searched actors this week</div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px'
            }}>
              {trendingActors.map((actor) => (
                <div
                  key={`act_${actor.id}`}
                  style={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid #2e2e2e',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ width: '100%', height: '240px', backgroundColor: '#141414', overflow: 'hidden' }}>
                    {actor.profile_path ? (
                      <img src={actor.profile_path} alt={actor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                        <User size={48} />
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{actor.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--brand-orange)', fontWeight: 700, marginTop: '2px' }}>
                        {actor.known_for_department}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '10px' }}>
                      <span style={{ fontWeight: 600, color: '#ccc' }}>Known For:</span> {actor.known_for}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Born Today */}
          <section>
            <div className="section-heading" style={{ marginBottom: '20px' }}>
              <div className="section-title">
                <User color="var(--brand-orange)" size={24} />
                <span>Born Today</span>
              </div>
              <div className="section-subtitle">Celebrities celebrating birthdays today</div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px'
            }}>
              {(bornTodayActors.length > 0 ? bornTodayActors : trendingActors).map((actor) => (
                <div
                  key={`born_${actor.id}`}
                  style={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid #2e2e2e',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ width: '100%', height: '240px', backgroundColor: '#141414', overflow: 'hidden' }}>
                    {actor.profile_path ? (
                      <img src={actor.profile_path} alt={actor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                        <User size={48} />
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{actor.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--brand-orange)', fontWeight: 700, marginTop: '2px' }}>
                        Born Today
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '10px' }}>
                      <span style={{ fontWeight: 600, color: '#ccc' }}>Known For:</span> {actor.known_for}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

    </div>
  );
};
