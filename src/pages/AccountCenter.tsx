import React, { useState, useEffect } from 'react';
import { User, Bookmark, ListPlus, Play, CheckCircle2, ShieldAlert, Globe, Trash2, Plus } from 'lucide-react';
import { getCurrentUser, updateUserWatchlist, saveStoredAccounts, getStoredAccounts, setCurrentUser } from '../services/supabaseClient';
import type { UserAccount } from '../types';

interface AccountCenterProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const AccountCenter: React.FC<AccountCenterProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const [currentUser, setAccountUser] = useState<UserAccount | null>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<'watchlist' | 'playlists' | 'continue'>('watchlist');

  // Playlist state
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);

  useEffect(() => {
    setAccountUser(getCurrentUser());
  }, []);

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: '#aaa' }}>
        <User size={48} color="var(--brand-orange)" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>Account Access Required</h2>
        <p style={{ marginTop: '8px', fontSize: '0.95rem' }}>
          Sign in or create an account to view your Watchlist, Custom Playlists, and Continue Watching history.
        </p>
        <button
          onClick={onOpenAuth}
          style={{
            backgroundColor: 'var(--brand-orange)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.95rem',
            padding: '12px 24px',
            borderRadius: '6px',
            marginTop: '20px'
          }}
        >
          Sign In / Register Account
        </button>
      </div>
    );
  }

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !currentUser) return;

    const newPl = {
      id: 'pl_' + Date.now(),
      name: newPlaylistName.trim(),
      description: newPlaylistDesc.trim() || 'Custom collection',
      items: []
    };

    const updatedPlaylists = [...currentUser.playlists, newPl];
    const updatedUser = { ...currentUser, playlists: updatedPlaylists };

    setCurrentUser(updatedUser);
    const accounts = getStoredAccounts().map(acc => acc.id === currentUser.id ? updatedUser : acc);
    saveStoredAccounts(accounts);

    setAccountUser(updatedUser);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreatePlaylistModal(false);
  };

  const handleDeletePlaylist = (plId: string) => {
    if (!currentUser) return;
    const updatedPlaylists = currentUser.playlists.filter(p => p.id !== plId);
    const updatedUser = { ...currentUser, playlists: updatedPlaylists };

    setCurrentUser(updatedUser);
    const accounts = getStoredAccounts().map(acc => acc.id === currentUser.id ? updatedUser : acc);
    saveStoredAccounts(accounts);
    setAccountUser(updatedUser);
  };

  const handleRemoveFromWatchlist = (id: number | string, mediaType: 'movie' | 'game') => {
    if (!currentUser) return;
    const item = currentUser.watchlist.find(w => String(w.id) === String(id) && w.mediaType === mediaType);
    if (item) {
      const updated = updateUserWatchlist(item);
      setAccountUser(updated);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      
      {/* Profile Info Header */}
      <div style={{
        backgroundColor: '#1f1f1f',
        border: '1px solid #2e2e2e',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-orange)',
            color: '#000',
            fontWeight: 900,
            fontSize: '1.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{currentUser.name}</h1>
            <div style={{ fontSize: '0.88rem', color: '#aaa', marginTop: '2px' }}>{currentUser.email}</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '0.78rem' }}>
              {currentUser.isEmailVerified || currentUser.isGoogleAuth ? (
                <span style={{ color: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  <CheckCircle2 size={13} /> Verified Email User
                </span>
              ) : (
                <span style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  <ShieldAlert size={13} /> Email Unverified
                </span>
              )}

              <span style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={13} color="var(--brand-orange)" /> IP: {currentUser.ipAddress} (1 Account Limit)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #2e2e2e', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('watchlist')}
          style={{
            backgroundColor: activeTab === 'watchlist' ? 'var(--brand-orange)' : 'transparent',
            color: activeTab === 'watchlist' ? '#000' : '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Bookmark size={18} />
          <span>Your Watchlist ({currentUser.watchlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          style={{
            backgroundColor: activeTab === 'playlists' ? 'var(--brand-orange)' : 'transparent',
            color: activeTab === 'playlists' ? '#000' : '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ListPlus size={18} />
          <span>Custom Playlists ({currentUser.playlists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('continue')}
          style={{
            backgroundColor: activeTab === 'continue' ? 'var(--brand-orange)' : 'transparent',
            color: activeTab === 'continue' ? '#000' : '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Play size={18} />
          <span>Continue Watching ({currentUser.continueWatching.length})</span>
        </button>
      </div>

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <div>
          {currentUser.watchlist.length === 0 ? (
            <div style={{ padding: '40px', backgroundColor: '#1a1a1a', borderRadius: '8px', textAlign: 'center', color: '#aaa' }}>
              <Bookmark size={36} color="var(--brand-orange)" style={{ margin: '0 auto 12px auto' }} />
              <h3>Your Watchlist is empty</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>Click the + Ribbon on any movie or video game poster to add it here!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {currentUser.watchlist.map((item) => (
                <div
                  key={`${item.mediaType}_${item.id}`}
                  onClick={() => onNavigate('detail', { id: item.id, type: item.mediaType })}
                  style={{ backgroundColor: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                >
                  <img src={item.poster} alt={item.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFromWatchlist(item.id, item.mediaType); }}
                    style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#ef4444', padding: '6px', borderRadius: '50%' }}
                  >
                    <Trash2 size={16} />
                  </button>

                  <div style={{ padding: '12px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: item.mediaType === 'movie' ? '#ff6b00' : '#8b5cf6', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
                      {item.mediaType}
                    </span>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playlists Tab */}
      {activeTab === 'playlists' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Your Custom Playlists</h2>
            <button
              onClick={() => setShowCreatePlaylistModal(true)}
              style={{ backgroundColor: 'var(--brand-orange)', color: '#000', fontWeight: 800, fontSize: '0.85rem', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Create New Playlist
            </button>
          </div>

          {showCreatePlaylistModal && (
            <form onSubmit={handleCreatePlaylist} style={{ backgroundColor: '#1a1a1a', border: '1px solid var(--border-orange)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: '12px' }}>Create Playlist</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  required
                  placeholder="Playlist Name (e.g. Favorite Sci-Fi)"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  style={{ backgroundColor: '#121212', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }}
                />
                <input
                  type="text"
                  placeholder="Short Description..."
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  style={{ backgroundColor: '#121212', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{ backgroundColor: 'var(--brand-orange)', color: '#000', fontWeight: 800, padding: '8px 16px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    Save Playlist
                  </button>
                  <button type="button" onClick={() => setShowCreatePlaylistModal(false)} style={{ color: '#aaa', padding: '8px 16px', fontSize: '0.85rem' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {currentUser.playlists.map(pl => (
              <div key={pl.id} style={{ backgroundColor: '#1f1f1f', border: '1px solid #2e2e2e', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{pl.name}</div>
                    {pl.id !== 'pl_favorites' && (
                      <button onClick={() => handleDeletePlaylist(pl.id)} style={{ color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#aaa', marginTop: '4px' }}>{pl.description}</div>
                </div>

                <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--brand-orange)', fontWeight: 700 }}>
                  {pl.items.length} titles in playlist
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue Watching Tab */}
      {activeTab === 'continue' && (
        <div>
          {currentUser.continueWatching.length === 0 ? (
            <div style={{ padding: '40px', backgroundColor: '#1a1a1a', borderRadius: '8px', textAlign: 'center', color: '#aaa' }}>
              <Play size={36} color="var(--brand-orange)" style={{ margin: '0 auto 12px auto' }} />
              <h3>No recent watching history</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>Explore movie and game detail pages to automatically track your watch progress here!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {currentUser.continueWatching.map(item => (
                <div
                  key={`cw_${item.id}`}
                  onClick={() => onNavigate('detail', { id: item.id, type: item.mediaType })}
                  style={{ backgroundColor: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
                >
                  <div style={{ position: 'relative', height: '140px', backgroundColor: '#000' }}>
                    <img src={item.poster} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={32} fill="var(--brand-orange)" color="var(--brand-orange)" />
                    </div>
                  </div>

                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{item.title}</div>
                    
                    {/* Progress Bar */}
                    <div style={{ height: '4px', backgroundColor: '#333', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.progress}%`, height: '100%', backgroundColor: 'var(--brand-orange)' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px', textAlign: 'right' }}>
                      {item.progress}% completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
