import type { Movie, WatchProvidersResult, CastMember } from '../types';

const TMDB_API_KEY = '991bd5c9855019bd9aeeee4679ddd856';
const BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

let activeLanguage = 'en-US';

export function getTmdbLanguage(): string {
  return activeLanguage;
}

export function setTmdbLanguage(langCode: string): void {
  const languageMap: Record<string, string> = {
    'EN': 'en-US',
    'ES': 'es-ES',
    'FR': 'fr-FR',
    'DE': 'de-DE',
    'JA': 'ja-JP',
    'HI': 'hi-IN'
  };
  activeLanguage = languageMap[langCode] || langCode || 'en-US';
}

export function getTmdbImageUrl(path: string | null, size: 'w185' | 'w500' | 'original' = 'w500'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
  }
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
}

async function fetchFromTmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: activeLanguage,
    ...params
  });

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchTrendingMovies(): Promise<Movie[]> {
  try {
    const data = await fetchFromTmdb<{ results: any[] }>('/trending/movie/week');
    return data.results.map(item => ({ ...item, media_type: 'movie' }));
  } catch (error) {
    return getFallbackMovies();
  }
}

export async function fetchTopRatedMovies(): Promise<Movie[]> {
  try {
    const data = await fetchFromTmdb<{ results: any[] }>('/movie/top_rated');
    return data.results.map(item => ({ ...item, media_type: 'movie' }));
  } catch (error) {
    return getFallbackMovies();
  }
}

const TMDB_GENRE_MAP: Record<string, number> = {
  'action': 28,
  'adventure': 12,
  'animation': 16,
  'comedy': 35,
  'drama': 18,
  'fantasy': 14,
  'horror': 27,
  'sci-fi': 878,
  'thriller': 53,
  'rpg': 14
};

export function movieMatchesGenre(movie: Movie, genreName: string): boolean {
  if (!genreName || genreName.toLowerCase() === 'all') return true;
  const target = genreName.toLowerCase();
  
  if (movie.genres && Array.isArray(movie.genres)) {
    if (movie.genres.some((g: any) => (typeof g === 'object' ? g.name : String(g)).toLowerCase().includes(target))) {
      return true;
    }
  }

  const targetId = TMDB_GENRE_MAP[target];
  if (targetId && movie.genre_ids && Array.isArray(movie.genre_ids)) {
    if (movie.genre_ids.includes(targetId)) return true;
  }

  return false;
}

// Fetches extended pages of top rated feature films for infinite Load More
export async function fetchTop250MoviesFull(maxPages: number = 25): Promise<Movie[]> {
  try {
    const pages = Array.from({ length: maxPages }, (_, i) => i + 1);
    const pageRequests = pages.map(p => fetchFromTmdb<{ results: any[] }>('/movie/top_rated', { page: String(p) }));
    const results = await Promise.all(pageRequests);

    const allMovies = results.flatMap(res => (res.results || []).map(item => ({ ...item, media_type: 'movie' as const })));
    const seen = new Map<number, Movie>();
    allMovies.forEach(m => { if (!seen.has(m.id)) seen.set(m.id, m); });
    return Array.from(seen.values());
  } catch {
    return getFallbackMovies();
  }
}

export async function fetchNowPlayingMovies(): Promise<Movie[]> {
  try {
    const data = await fetchFromTmdb<{ results: any[] }>('/movie/now_playing');
    return data.results.map(item => ({ ...item, media_type: 'movie' }));
  } catch (error) {
    return getFallbackMovies();
  }
}

export async function fetchUpcomingMovies(): Promise<Movie[]> {
  try {
    const data = await fetchFromTmdb<{ results: any[] }>('/movie/upcoming');
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Strict future release date filter (must NOT be released yet)
    const unreleased = data.results.filter(item => item.release_date && item.release_date > todayStr);
    const resultsToUse = unreleased.length > 0 ? unreleased : data.results;

    return resultsToUse.map(item => ({ ...item, media_type: 'movie' }));
  } catch (error) {
    return getFallbackMovies();
  }
}

export async function fetchMovieDetails(id: number | string): Promise<Movie | null> {
  try {
    const data = await fetchFromTmdb<any>(`/movie/${id}`);
    return { ...data, media_type: 'movie' };
  } catch (error) {
    return getFallbackMovies().find(m => String(m.id) === String(id)) || null;
  }
}

export async function fetchMovieCredits(id: number | string): Promise<CastMember[]> {
  try {
    const data = await fetchFromTmdb<{ cast: any[] }>(`/movie/${id}/credits`);
    return (data.cast || []).slice(0, 12).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character || 'Cast Member',
      profile_path: c.profile_path ? getTmdbImageUrl(c.profile_path, 'w185') : null
    }));
  } catch (error) {
    return [];
  }
}

export async function fetchMovieWatchProviders(id: number | string): Promise<WatchProvidersResult | null> {
  try {
    const data = await fetchFromTmdb<{ results: Record<string, WatchProvidersResult> }>(`/movie/${id}/watch/providers`);
    return data.results.US || data.results.GB || Object.values(data.results)[0] || null;
  } catch (error) {
    return null;
  }
}

export async function fetchMovieTrailerKey(id: number | string): Promise<string | null> {
  try {
    const data = await fetchFromTmdb<{ results: any[] }>(`/movie/${id}/videos`);
    if (data.results && data.results.length > 0) {
      const trailer = data.results.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
      if (trailer) return trailer.key;
      const anyYt = data.results.find((v: any) => v.site === 'YouTube');
      if (anyYt) return anyYt.key;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function fetchPopularCelebs(): Promise<Array<{ id: number; name: string; profile_path: string | null; known_for_department: string; popularity: number; known_for: string }>> {
  try {
    const data = await fetchFromTmdb<{ results: any[] }>('/person/popular');
    return data.results.map(p => ({
      id: p.id,
      name: p.name,
      profile_path: p.profile_path ? getTmdbImageUrl(p.profile_path, 'w185') : null,
      known_for_department: p.known_for_department || 'Acting',
      popularity: p.popularity || 85.5,
      known_for: (p.known_for || []).map((kf: any) => kf.title || kf.name).filter(Boolean).join(', ') || 'Feature Films'
    }));
  } catch (error) {
    return [
      { id: 287, name: 'Brad Pitt', profile_path: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=185', known_for_department: 'Acting', popularity: 98.4, known_for: 'Fight Club, Se7en' },
      { id: 1245, name: 'Scarlett Johansson', profile_path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=185', known_for_department: 'Acting', popularity: 96.2, known_for: 'The Avengers, Marriage Story' },
      { id: 6193, name: 'Leonardo DiCaprio', profile_path: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=185', known_for_department: 'Acting', popularity: 99.1, known_for: 'Inception, Titanic' },
      { id: 1158, name: 'Al Pacino', profile_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=185', known_for_department: 'Acting', popularity: 95.8, known_for: 'The Godfather, Scarface' }
    ];
  }
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  try {
    const data = await fetchFromTmdb<{ results: any[] }>('/search/movie', { query });
    return data.results.map(item => ({ ...item, media_type: 'movie' }));
  } catch (error) {
    return [];
  }
}

export function getFallbackMovies(): Movie[] {
  return [
    {
      id: 278,
      title: "The Shawshank Redemption",
      overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.",
      poster_path: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
      backdrop_path: "/kXfqcdQKsTo22zdChrRUW3zZAb7.jpg",
      release_date: "1994-09-23",
      vote_average: 8.7,
      vote_count: 26000,
      media_type: 'movie'
    },
    {
      id: 238,
      title: "The Godfather",
      overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Vito Corleone Crime Family.",
      poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      backdrop_path: "/rSPw7tgCH9c6NqICZefy4ZjFOQ5.jpg",
      release_date: "1972-03-14",
      vote_average: 8.7,
      vote_count: 19800,
      media_type: 'movie'
    },
    {
      id: 155,
      title: "The Dark Knight",
      overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop_path: "/nMK28FiRoStOoOoTKV2Gl12SuY4.jpg",
      release_date: "2008-07-16",
      vote_average: 8.5,
      vote_count: 32000,
      media_type: 'movie'
    },
    {
      id: 680,
      title: "Pulp Fiction",
      overview: "A burger-loving hitman, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in four tales of violence and redemption.",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      backdrop_path: "/suaEOtk1N1sgg2MTM7oSM2xOLiE.jpg",
      release_date: "1994-09-10",
      vote_average: 8.5,
      vote_count: 27000,
      media_type: 'movie'
    },
    {
      id: 13,
      title: "Forrest Gump",
      overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events—each time, far exceeding what anyone imagined he could do.",
      poster_path: "/arw2vcBveWOVZr6pxd9LiyZone3.jpg",
      backdrop_path: "/qdIMLStXWfhWtkH1xTPOdVo2UtC.jpg",
      release_date: "1994-06-23",
      vote_average: 8.5,
      vote_count: 26500,
      media_type: 'movie'
    }
  ];
}
