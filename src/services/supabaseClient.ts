import type { UserAccount, Review } from '../types';

const USERS_KEY = 'igmdb_users_db_v3';
const REVIEWS_KEY = 'igmdb_reviews_db_v3';
const CURRENT_USER_KEY = 'igmdb_current_user_v3';

export async function getClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || '127.0.0.1';
  } catch (err) {
    return '127.0.0.1';
  }
}

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

export async function registerUser(email: string, password: string, name: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const currentIp = await getClientIp();
  const accounts = getStoredAccounts();

  const existingIpAccount = accounts.find(a => a.ipAddress === currentIp);
  if (existingIpAccount) {
    return {
      success: false,
      error: `Registration blocked: An account (${existingIpAccount.email}) has already been registered from IP address ${currentIp}. Only one account per IP address is permitted.`
    };
  }

  const existingEmailAccount = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (existingEmailAccount) {
    return {
      success: false,
      error: 'An account with this email address already exists. Please sign in.'
    };
  }

  if (!password || password.length < 4) {
    return {
      success: false,
      error: 'Password must be at least 4 characters long.'
    };
  }

  // Directly set isEmailVerified: true (Removed code verification requirement)
  const newUser: UserAccount = {
    id: 'user_' + Date.now(),
    email: email.trim(),
    password: password.trim(),
    name: name.trim() || email.split('@')[0],
    isEmailVerified: true,
    isGoogleAuth: false,
    ipAddress: currentIp,
    createdAt: new Date().toISOString(),
    watchlist: [],
    playlists: [
      { id: 'pl_favorites', name: 'My Favorites', description: 'All-time favorite movies and games', items: [] },
      { id: 'pl_weekend', name: 'Weekend Binge', description: 'Titles planned for this weekend', items: [] }
    ],
    continueWatching: []
  };

  accounts.push(newUser);
  saveStoredAccounts(accounts);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

export async function registerWithGoogle(googleEmailInput: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const currentIp = await getClientIp();
  const accounts = getStoredAccounts();

  const googleEmail = googleEmailInput.trim();
  if (!googleEmail || !googleEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid Google email address.' };
  }

  const existingIpAccount = accounts.find(a => a.ipAddress === currentIp);
  if (existingIpAccount && existingIpAccount.email.toLowerCase() !== googleEmail.toLowerCase()) {
    return {
      success: false,
      error: `Registration blocked: An account (${existingIpAccount.email}) has already been registered from IP address ${currentIp}.`
    };
  }

  const existingUser = accounts.find(a => a.email.toLowerCase() === googleEmail.toLowerCase());
  if (existingUser) {
    setCurrentUser(existingUser);
    return { success: true, user: existingUser };
  }

  const newUser: UserAccount = {
    id: 'google_user_' + Date.now(),
    email: googleEmail,
    name: googleEmail.split('@')[0],
    isEmailVerified: true,
    isGoogleAuth: true,
    ipAddress: currentIp,
    createdAt: new Date().toISOString(),
    watchlist: [],
    playlists: [
      { id: 'pl_favorites', name: 'My Favorites', description: 'All-time favorite movies and games', items: [] }
    ],
    continueWatching: []
  };

  accounts.push(newUser);
  saveStoredAccounts(accounts);
  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

export async function loginUser(email: string, passwordInput: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const accounts = getStoredAccounts();
  const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

  if (!account) {
    return { success: false, error: 'Account not found for this email. Please register first.' };
  }

  if (account.password && account.password !== passwordInput.trim()) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  setCurrentUser(account);
  return { success: true, user: account };
}

export function logoutUser(): void {
  setCurrentUser(null);
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

export async function addReview(
  mediaId: string | number,
  mediaType: 'movie' | 'game',
  mediaTitle: string,
  rating: number,
  headline: string,
  content: string
): Promise<{ success: boolean; review?: Review; error?: string }> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return { success: false, error: 'You must be signed in to post a review.' };
  }

  const newReview: Review = {
    id: 'rev_' + Date.now(),
    mediaId,
    mediaType,
    mediaTitle,
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    isVerifiedEmail: currentUser.isEmailVerified,
    isGoogleUser: currentUser.isGoogleAuth,
    rating,
    headline,
    content,
    createdAt: new Date().toISOString(),
    userIp: currentUser.ipAddress
  };

  const reviews = getStoredReviews();
  reviews.unshift(newReview);
  saveStoredReviews(reviews);

  return { success: true, review: newReview };
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

  const accounts = getStoredAccounts().map(acc => acc.id === user.id ? updatedUser : acc);
  saveStoredAccounts(accounts);

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

  const accounts = getStoredAccounts().map(acc => acc.id === user.id ? updatedUser : acc);
  saveStoredAccounts(accounts);

  return updatedUser;
}
