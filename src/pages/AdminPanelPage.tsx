import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Trash2, EyeOff, Ban, CheckCircle, AlertTriangle, RefreshCw, Lock } from 'lucide-react';
import {
  getCurrentUser,
  createModeratorAccount,
  fetchAdminReports,
  resolveReport,
  deleteReview,
  toggleReviewSpoiler,
  banUser,
  unbanUser,
  fetchAllProfiles
} from '../services/supabaseClient';
import type { ReviewReport, UserAccount } from '../types';

interface AdminPanelPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ onNavigate }) => {
  const [currentUser] = useState<UserAccount | null>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<'reports' | 'mods' | 'users'>('reports');

  // Reports state
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Users state
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Mod Creation Form state
  const [modEmail, setModEmail] = useState('');
  const [modName, setModName] = useState('');
  const [modPassword, setModPassword] = useState('');
  const [modStatus, setModStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isCreatingMod, setIsCreatingMod] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email.toLowerCase() === 'morpheus@morpheus.com';
  const isMod = currentUser?.role === 'moderator' || isAdmin;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingReports(true);
    setIsLoadingProfiles(true);

    const [repsData, profsData] = await Promise.all([
      fetchAdminReports(),
      fetchAllProfiles()
    ]);

    setReports(repsData);
    setProfiles(profsData);
    setIsLoadingReports(false);
    setIsLoadingProfiles(false);
  };

  const handleCreateModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setModStatus(null);

    if (!modEmail.trim() || !modPassword.trim()) {
      setModStatus({ type: 'error', message: 'Please provide both email and password.' });
      return;
    }

    setIsCreatingMod(true);
    const res = await createModeratorAccount(modEmail, modName, modPassword);
    setIsCreatingMod(false);

    if (!res.success) {
      setModStatus({ type: 'error', message: res.error || 'Failed to create moderator account.' });
      return;
    }

    setModStatus({ type: 'success', message: `Moderator account (${modEmail}) created successfully!` });
    setModEmail('');
    setModName('');
    setModPassword('');
    loadData();
  };

  const handleMarkReportedAsSpoiler = async (report: ReviewReport) => {
    if (!report.review) return;
    await toggleReviewSpoiler(report.review.id, true);
    await resolveReport(report.id);
    loadData();
  };

  const handleDeleteReportedReview = async (report: ReviewReport) => {
    if (!report.review) return;
    await deleteReview(report.review.id);
    await resolveReport(report.id);
    loadData();
  };

  const handleBanAuthorAndResolve = async (report: ReviewReport) => {
    if (!report.review) return;
    await banUser(report.review.userId);
    await deleteReview(report.review.id);
    await resolveReport(report.id);
    loadData();
  };

  const handleDismissReport = async (reportId: string) => {
    await resolveReport(reportId);
    loadData();
  };

  const handleToggleBanUser = async (userId: string, currentBanned: boolean) => {
    if (currentBanned) {
      await unbanUser(userId);
    } else {
      await banUser(userId);
    }
    loadData();
  };

  if (!isMod) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '12px', padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <Lock size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Access Restricted</h2>
          <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '12px 0 24px 0' }}>
            The Admin & Moderation Panel is restricted to Morpheus (Admin) and authorized Moderator accounts only.
          </p>
          <button
            onClick={() => onNavigate('home')}
            style={{ backgroundColor: 'var(--brand-orange)', color: '#000', fontWeight: 800, padding: '10px 24px', borderRadius: '6px' }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #2e2e2e', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={28} color="var(--brand-orange)" />
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
              {isAdmin ? 'Admin Portal Dashboard' : 'Moderator Panel'}
            </h1>
          </div>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage user accounts, moderator access, reported reviews, and spoiler tags.
          </p>
        </div>

        <button
          onClick={loadData}
          style={{ backgroundColor: '#262626', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #383838' }}
        >
          <RefreshCw size={15} />
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            backgroundColor: activeTab === 'reports' ? 'var(--brand-orange)' : '#1f1f1f',
            color: activeTab === 'reports' ? '#000' : '#fff',
            fontWeight: 800,
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={18} />
          <span>Reported Reviews ({reports.length})</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('mods')}
            style={{
              backgroundColor: activeTab === 'mods' ? 'var(--brand-orange)' : '#1f1f1f',
              color: activeTab === 'mods' ? '#000' : '#fff',
              fontWeight: 800,
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <UserPlus size={18} />
            <span>Create Moderator Account</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('users')}
          style={{
            backgroundColor: activeTab === 'users' ? 'var(--brand-orange)' : '#1f1f1f',
            color: activeTab === 'users' ? '#000' : '#fff',
            fontWeight: 800,
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Ban size={18} />
          <span>User Moderation ({profiles.length})</span>
        </button>
      </div>

      {/* Tab 1: Reported Reviews */}
      {activeTab === 'reports' && (
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '10px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
            Pending Review Reports
          </h2>

          {isLoadingReports ? (
            <p style={{ color: '#aaa' }}>Loading reports...</p>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888', backgroundColor: '#141414', borderRadius: '8px' }}>
              <CheckCircle size={32} color="#22c55e" style={{ marginBottom: '8px' }} />
              <p>No pending review reports! All reviews are in compliance.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reports.map((rep) => (
                <div key={rep.id} style={{ backgroundColor: '#141414', border: '1px solid #2e2e2e', borderRadius: '8px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--brand-orange)', fontWeight: 800, textTransform: 'uppercase' }}>
                        Reason: {rep.reason}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                        Title: {rep.review?.mediaTitle || 'Unknown Media'} ({rep.review?.mediaType})
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#777' }}>
                      Reported: {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {rep.review && (
                    <div style={{ backgroundColor: '#1f1f1f', padding: '12px', borderRadius: '6px', marginBottom: '14px', borderLeft: '3px solid var(--brand-orange)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        By {rep.review.userName} ({rep.review.userEmail})
                      </div>
                      <div style={{ fontWeight: 700, color: '#ff9800', marginTop: '4px' }}>
                        "{rep.review.headline}"
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#ccc', marginTop: '4px' }}>
                        {rep.review.content}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleMarkReportedAsSpoiler(rep)}
                      style={{ backgroundColor: '#d97706', color: '#fff', fontWeight: 700, padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <EyeOff size={15} />
                      Tag as Spoiler
                    </button>

                    <button
                      onClick={() => handleDeleteReportedReview(rep)}
                      style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Trash2 size={15} />
                      Delete Review
                    </button>

                    <button
                      onClick={() => handleBanAuthorAndResolve(rep)}
                      style={{ backgroundColor: '#991b1b', color: '#fff', fontWeight: 700, padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Ban size={15} />
                      Ban Author & Delete
                    </button>

                    <button
                      onClick={() => handleDismissReport(rep.id)}
                      style={{ backgroundColor: '#333', color: '#aaa', fontWeight: 700, padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem', marginLeft: 'auto' }}
                    >
                      Dismiss Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Create Moderator Account (Admin Only) */}
      {activeTab === 'mods' && isAdmin && (
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '10px', padding: '24px', maxWidth: '540px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            Create New Moderator Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '20px' }}>
            Moderators can log in using the same main login panel and have full access to delete reviews, ban abusive users, and tag spoilers.
          </p>

          {modStatus && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              backgroundColor: modStatus.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: modStatus.type === 'success' ? '#4ade80' : '#f87171',
              border: modStatus.type === 'success' ? '1px solid #22c55e' : '1px solid #ef4444'
            }}>
              {modStatus.message}
            </div>
          )}

          <form onSubmit={handleCreateModerator} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ccc', display: 'block', marginBottom: '6px' }}>
                Moderator Name / Handle
              </label>
              <input
                type="text"
                required
                placeholder="Moderator Alex"
                value={modName}
                onChange={(e) => setModName(e.target.value)}
                style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #333', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ccc', display: 'block', marginBottom: '6px' }}>
                Moderator Email Address
              </label>
              <input
                type="email"
                required
                placeholder="mod.alex@igmdb.com"
                value={modEmail}
                onChange={(e) => setModEmail(e.target.value)}
                style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #333', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ccc', display: 'block', marginBottom: '6px' }}>
                Set Password
              </label>
              <input
                type="password"
                required
                placeholder="Create password for moderator..."
                value={modPassword}
                onChange={(e) => setModPassword(e.target.value)}
                style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #333', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={isCreatingMod}
              style={{ backgroundColor: 'var(--brand-orange)', color: '#000', fontWeight: 800, padding: '12px', borderRadius: '6px', fontSize: '0.95rem', marginTop: '8px' }}
            >
              {isCreatingMod ? 'Creating Account...' : 'Register Moderator Account'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: User Moderation */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '10px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
            Registered Users & Role Status
          </h2>

          {isLoadingProfiles ? (
            <p style={{ color: '#aaa' }}>Loading users...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profiles.map((prof) => (
                <div key={prof.id} style={{ backgroundColor: '#141414', border: '1px solid #2e2e2e', borderRadius: '8px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>{prof.username}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: prof.role === 'admin' ? '#f57c00' : prof.role === 'moderator' ? '#8b5cf6' : '#333',
                        color: prof.role === 'admin' ? '#000' : '#fff'
                      }}>
                        {prof.role || 'user'}
                      </span>
                      {prof.is_banned && (
                        <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                          BANNED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '2px' }}>
                      Email: {prof.email} {prof.ip_address ? `| IP: ${prof.ip_address}` : ''}
                    </div>
                  </div>

                  {/* Action: Ban / Unban */}
                  {prof.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleBanUser(prof.id, prof.is_banned)}
                      style={{
                        backgroundColor: prof.is_banned ? '#22c55e' : '#dc2626',
                        color: prof.is_banned ? '#000' : '#fff',
                        fontWeight: 800,
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem'
                      }}
                    >
                      {prof.is_banned ? 'Unban User' : 'Ban User'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
