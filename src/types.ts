export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  rating?: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  media_type: 'movie';
}

export interface Game {
  id: number;
  name: string;
  summary?: string;
  overview?: string;
  cover_url?: string;
  background_image?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  released?: string;
  rating?: number;
  vote_average?: number;
  rating_count?: number;
  vote_count?: number;
  genres?: { id: number; name: string }[] | string[];
  platforms?: { id: number; name: string }[] | string[];
  developers?: string[];
  publishers?: string[];
  media_type: 'game';
}

export type MediaItem = Movie | Game;

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority?: number;
}

export interface WatchProvidersResult {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  free?: WatchProvider[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Review {
  id: string;
  mediaId: string | number;
  mediaType: 'movie' | 'game';
  mediaTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  isVerifiedEmail: boolean;
  isGoogleUser: boolean;
  rating: number;
  headline: string;
  content: string;
  isSpoiler?: boolean;
  createdAt: string;
  userIp?: string;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  review?: Review;
}

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  photoURL?: string;
  role?: 'admin' | 'moderator' | 'user';
  isBanned?: boolean;
  isEmailVerified: boolean;
  isGoogleAuth: boolean;
  ipAddress: string;
  createdAt: string;
  watchlist: Array<{ id: number | string; mediaType: 'movie' | 'game'; title: string; poster: string; addedAt: string }>;
  playlists: Array<{ id: string; name: string; description: string; items: Array<{ id: number | string; mediaType: 'movie' | 'game'; title: string; poster: string }> }>;
  continueWatching: Array<{ id: number | string; mediaType: 'movie' | 'game'; title: string; poster: string; progress: number; lastWatched: string }>;
  dailyRecommendations?: Array<{ id: number | string; mediaType: 'movie' | 'game'; title: string; poster: string; overview: string; matchScore: number }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommendations?: Array<{ id: number | string; mediaType: 'movie' | 'game'; title: string; overview: string; poster: string }>;
}
