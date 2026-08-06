import { createClient } from '@supabase/supabase-js';
import type { UserAccount, Review, ReviewReport } from '../types';
import { containsProfanity } from './profanityFilter';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nlvunhotvqawgpemkjvf.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdnVuaG90dnFhd2dwZW1ranZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NTA5ODQsImV4cCI6MjEwMTUyNjk4NH0.RtVR7Ok3rKlG188lfZ_YFO7kn_CIwdRKko6kLnP64jc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const USERS_KEY = 'igmdb_users_db_supabase_v6';
const REVIEWS_KEY = 'igmdb_reviews_db_supabase_v6';
const CURRENT_USER_KEY = 'igmdb_current_user_supabase_v6';

export async function getClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

export function getCurrentUser(): UserAccount | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 1. User Registration with Strict 1 Account per IP limit & Valid Email Enforcement
export async function registerUser(
  emailInput: string,
  passwordInput: string,
  nameInput: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const email = emailInput.trim();
  const password = passwordInput.trim();
  const name = nameInput.trim() || email.split('@')[0];

  // Validate Email Format
  if (!isValidEmailFormat(email)) {
    return { success: false, error: 'Please enter a valid email address (e.g., user@example.com).' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const currentIp = await getClientIp();

  // Strict IP enforcement: Check Supabase profiles table for existing account registered from same IP
  try {
    const { data: existingIpProfiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('ip_address', currentIp);

    if (existingIpProfiles && existingIpProfiles.length > 0) {
      const match = existingIpProfiles.find(p => p.email.toLowerCase() !== email.toLowerCase());
      if (match) {
        return {
          success: false,
          error: `Registration blocked: An account (${match.email}) has already been registered from IP address ${currentIp}. Only 1 account per IP address is permitted.`
        };
      }
    }
  } catch (err) {
    console.warn('IP verification check notice:', err);
  }

  try {
    // Supabase Auth Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: name, ip_address: currentIp }
      }
    });

    if (authError && !authError.message.includes('already registered')) {
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id || 'usr_' + Date.now();
    const profileRole = (email.toLowerCase() === 'morpheus@morpheus.com' || email.toLowerCase() === 'morpheus') ? 'admin' : 'user';

    // Save profile to Supabase Postgres profiles table
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      username: name,
      role: profileRole,
      is_banned: false,
      ip_address: currentIp
    });

    const isVerified = authData.user?.email_confirmed_at ? true : false;

    const userAccount: UserAccount = {
      id: userId,
      email,
      name,
      role: profileRole,
      isBanned: false,
      isEmailVerified: isVerified,
      isGoogleAuth: false,
      ipAddress: currentIp,
      createdAt: new Date().toISOString(),
      watchlist: [],
      playlists: [],
      continueWatching: []
    };

    setCurrentUser(userAccount);
    return { success: true, user: userAccount };
  } catch (err: any) {
    return { success: false, error: err.message || 'Registration failed.' };
  }
}

// 2. Email / Password Login via Supabase Auth & Profile Banned Check
export async function loginUser(
  emailOrUsernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const input = emailOrUsernameInput.trim();
  const password = passwordInput.trim();
  const currentIp = await getClientIp();

  let emailToUse = input;
  if (input.toLowerCase() === 'morpheus') {
    emailToUse = 'morpheus@morpheus.com';
  }

  // Admin Account: morpheus / xclubskimkc.vercel.app
  if (emailToUse.toLowerCase() === 'morpheus@morpheus.com') {
    if (password !== 'xclubskimkc.vercel.app') {
      return { success: false, error: 'Incorrect password for Admin account (morpheus).' };
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password
    });

    let adminId = signInData.user?.id;

    if (signInError) {
      const { data: signUpData } = await supabase.auth.signUp({
        email: emailToUse,
        password,
        options: { data: { username: 'Morpheus' } }
      });
      adminId = signUpData.user?.id || 'admin_morpheus';
    }

    await supabase.from('profiles').upsert({
      id: adminId || 'admin_morpheus',
      email: emailToUse,
      username: 'Morpheus (Admin)',
      role: 'admin',
      is_banned: false,
      ip_address: currentIp
    });

    const adminUser: UserAccount = {
      id: adminId || 'admin_morpheus',
      email: emailToUse,
      name: 'Morpheus (Admin)',
      role: 'admin',
      isBanned: false,
      isEmailVerified: true,
      isGoogleAuth: false,
      ipAddress: currentIp,
      createdAt: new Date().toISOString(),
      watchlist: [],
      playlists: [],
      continueWatching: []
    };

    setCurrentUser(adminUser);
    return { success: true, user: adminUser };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password
    });

    // If email not confirmed, still let user in — they verify later in Account Center
    if (authError) {
      const errMsg = authError.message || '';
      const isUnconfirmed = errMsg.toLowerCase().includes('email not confirmed') || errMsg.toLowerCase().includes('not confirmed');

      if (!isUnconfirmed) {
        return { success: false, error: errMsg || 'Invalid email or password.' };
      }

      // Email not confirmed — look up profile from DB and let them in as unverified
      const { data: profileMatch } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', emailToUse)
        .single();

      if (!profileMatch) {
        return { success: false, error: 'Account not found. Please register first.' };
      }

      if (profileMatch.is_banned) {
        return { success: false, error: 'Your account has been banned by an administrator.' };
      }

      const unverifiedUser: UserAccount = {
        id: profileMatch.id,
        email: profileMatch.email,
        name: profileMatch.username || emailToUse.split('@')[0],
        role: profileMatch.role || 'user',
        isBanned: false,
        isEmailVerified: false,
        isGoogleAuth: false,
        ipAddress: currentIp,
        createdAt: profileMatch.created_at || new Date().toISOString(),
        watchlist: [],
        playlists: [],
        continueWatching: []
      };

      setCurrentUser(unverifiedUser);
      return { success: true, user: unverifiedUser };
    }

    const userId = authData.user.id;

    // Fetch user profile from Supabase profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile?.is_banned) {
      return { success: false, error: 'Your account has been banned by an administrator.' };
    }

    const userAccount: UserAccount = {
      id: userId,
      email: authData.user.email || emailToUse,
      name: profile?.username || authData.user.user_metadata?.username || emailToUse.split('@')[0],
      role: profile?.role || 'user',
      isBanned: false,
      isEmailVerified: authData.user.email_confirmed_at ? true : false,
      isGoogleAuth: false,
      ipAddress: currentIp,
      createdAt: authData.user.created_at,
      watchlist: [],
      playlists: [],
      continueWatching: []
    };

    setCurrentUser(userAccount);
    return { success: true, user: userAccount };
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed.' };
  }
}

export function logoutUser(): void {
  supabase.auth.signOut();
  setCurrentUser(null);
}

// 3. Create Moderator Account (Admin Only)
export async function createModeratorAccount(
  emailInput: string,
  nameInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  const email = emailInput.trim();
  const password = passwordInput.trim();
  const name = nameInput.trim() || email.split('@')[0];

  if (!isValidEmailFormat(email)) {
    return { success: false, error: 'Please enter a valid email address for the moderator.' };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: name, role: 'moderator' } }
    });

    if (authError && !authError.message.includes('already registered')) {
      return { success: false, error: authError.message };
    }

    const modId = authData.user?.id || 'mod_' + Date.now();

    await supabase.from('profiles').upsert({
      id: modId,
      email,
      username: name,
      role: 'moderator',
      is_banned: false
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create moderator account.' };
  }
}

// 4. Supabase PostgreSQL Persistent Reviews API
export async function fetchReviews(mediaId: string | number, mediaType: 'movie' | 'game'): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('media_id', String(mediaId))
      .eq('media_type', mediaType)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return getStoredReviews().filter(r => String(r.mediaId) === String(mediaId) && r.mediaType === mediaType);
    }

    return data.map(r => ({
      id: r.id,
      mediaId: r.media_id,
      mediaType: r.media_type,
      mediaTitle: r.media_title,
      userId: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      isVerifiedEmail: true,
      isGoogleUser: false,
      rating: Number(r.rating),
      headline: r.headline,
      content: r.content,
      isSpoiler: Boolean(r.is_spoiler),
      createdAt: r.created_at,
      userIp: r.user_ip
    }));
  } catch {
    return getStoredReviews().filter(r => String(r.mediaId) === String(mediaId) && r.mediaType === mediaType);
  }
}

export async function addReview(
  mediaId: string | number,
  mediaType: 'movie' | 'game',
  mediaTitle: string,
  rating: number,
  headline: string,
  content: string,
  isSpoiler: boolean = false
): Promise<{ success: boolean; review?: Review; error?: string }> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'You must be signed in to post a review.' };
  }

  if (currentUser.isBanned) {
    return { success: false, error: 'Your account is banned from posting reviews.' };
  }

  // Profanity check
  if (containsProfanity(headline) || containsProfanity(content)) {
    return {
      success: false,
      error: 'Review blocked: Your review contains prohibited curse/profane words. Please clean up your language before submitting.'
    };
  }

  const reviewRow = {
    media_id: String(mediaId),
    media_type: mediaType,
    media_title: mediaTitle,
    user_id: currentUser.id,
    user_name: currentUser.name,
    user_email: currentUser.email,
    rating: rating,
    headline: headline,
    content: content,
    is_spoiler: isSpoiler,
    user_ip: currentUser.ipAddress
  };

  try {
    const { data, error } = await supabase.from('reviews').insert(reviewRow).select().single();

    if (error) {
      console.warn('Supabase review insert error, fallback local:', error);
    }

    const reviewObj: Review = {
      id: data?.id || 'rev_' + Date.now(),
      mediaId,
      mediaType,
      mediaTitle,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      isVerifiedEmail: currentUser.isEmailVerified,
      isGoogleUser: false,
      rating,
      headline,
      content,
      isSpoiler,
      createdAt: new Date().toISOString(),
      userIp: currentUser.ipAddress
    };

    const localRevs = getStoredReviews();
    localRevs.unshift(reviewObj);
    saveStoredReviews(localRevs);

    return { success: true, review: reviewObj };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to post review' };
  }
}

export async function toggleReviewSpoiler(reviewId: string, isSpoiler: boolean): Promise<boolean> {
  try {
    await supabase.from('reviews').update({ is_spoiler: isSpoiler }).eq('id', reviewId);
    const localRevs = getStoredReviews().map(r => r.id === reviewId ? { ...r, isSpoiler } : r);
    saveStoredReviews(localRevs);
    return true;
  } catch {
    return false;
  }
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    await supabase.from('reviews').delete().eq('id', reviewId);
    const localRevs = getStoredReviews().filter(r => r.id !== reviewId);
    saveStoredReviews(localRevs);
    return true;
  } catch {
    return false;
  }
}

export async function reportReview(reviewId: string, reason: string = 'spoiler'): Promise<{ success: boolean; error?: string }> {
  const currentUser = getCurrentUser();
  try {
    await supabase.from('reports').insert({
      review_id: reviewId,
      reported_by: currentUser?.id || null,
      reason: reason,
      status: 'pending'
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit report' };
  }
}

export async function fetchAdminReports(): Promise<ReviewReport[]> {
  try {
    const { data: reportsData } = await supabase.from('reports').select('*').eq('status', 'pending');
    if (!reportsData) return [];

    const reviewIds = reportsData.map(r => r.review_id);
    const { data: reviewsData } = await supabase.from('reviews').select('*').in('id', reviewIds);

    return reportsData.map(rep => {
      const rev = reviewsData?.find(r => r.id === rep.review_id);
      return {
        id: rep.id,
        reviewId: rep.review_id,
        reportedBy: rep.reported_by || 'Anonymous User',
        reason: rep.reason,
        status: rep.status,
        createdAt: rep.created_at,
        review: rev ? {
          id: rev.id,
          mediaId: rev.media_id,
          mediaType: rev.media_type,
          mediaTitle: rev.media_title,
          userId: rev.user_id,
          userName: rev.user_name,
          userEmail: rev.user_email,
          isVerifiedEmail: true,
          isGoogleUser: false,
          rating: Number(rev.rating),
          headline: rev.headline,
          content: rev.content,
          isSpoiler: Boolean(rev.is_spoiler),
          createdAt: rev.created_at
        } : undefined
      };
    });
  } catch {
    return [];
  }
}

export async function resolveReport(reportId: string): Promise<boolean> {
  try {
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
    return true;
  } catch {
    return false;
  }
}

export async function fetchAllProfiles(): Promise<any[]> {
  try {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export async function banUser(userId: string): Promise<boolean> {
  try {
    await supabase.from('profiles').update({ is_banned: true }).eq('id', userId);
    return true;
  } catch {
    return false;
  }
}

export async function unbanUser(userId: string): Promise<boolean> {
  try {
    await supabase.from('profiles').update({ is_banned: false }).eq('id', userId);
    return true;
  } catch {
    return false;
  }
}

// Local Storage Fallback helpers
export function getStoredAccounts(): UserAccount[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredAccounts(accounts: UserAccount[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

export function getStoredReviews(): Review[] {
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredReviews(reviews: Review[]): void {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export function updateUserWatchlist(mediaItem: { id: number | string; mediaType: 'movie' | 'game'; title: string; poster: string }): UserAccount | null {
  const user = getCurrentUser();
  if (!user) return null;

  const exists = user.watchlist.some(item => String(item.id) === String(mediaItem.id) && item.mediaType === mediaItem.mediaType);
  
  let newWatchlist = [...user.watchlist];
  if (exists) {
    newWatchlist = newWatchlist.filter(item => !(String(item.id) === String(mediaItem.id) && item.mediaType === mediaItem.mediaType));
  } else {
    newWatchlist.unshift({ ...mediaItem, addedAt: new Date().toISOString() });
  }

  const updatedUser = { ...user, watchlist: newWatchlist };
  setCurrentUser(updatedUser);
  return updatedUser;
}

export function updateContinueWatching(mediaItem: { id: number | string; mediaType: 'movie' | 'game'; title: string; poster: string }): UserAccount | null {
  const user = getCurrentUser();
  if (!user) return null;

  const filtered = user.continueWatching.filter(item => !(String(item.id) === String(mediaItem.id) && item.mediaType === mediaItem.mediaType));
  filtered.unshift({
    ...mediaItem,
    progress: Math.floor(Math.random() * 60) + 20,
    lastWatched: new Date().toISOString()
  });

  const updatedUser = { ...user, continueWatching: filtered.slice(0, 10) };
  setCurrentUser(updatedUser);
  return updatedUser;
}
