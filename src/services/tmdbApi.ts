import { Movie, WatchProvidersResult, CastMember } from '../types';

const TMDB_API_KEY = '991bd5c9855019bd9aeeee4679ddd856';
const BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_ORIGINAL_IMAGE = 'https://image.tmdb.org/t/p/original';

export function getTmdbImageUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
  if (path.startsWith('http')) return path;
  return size === 'original' ? `${TMDB_ORIGINAL_IMAGE}${path}` : `${TMDB_IMAGE_BASE}${path}`;
}

export async function fetchTrendingMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    return (data.results || []).map((m: any) => ({ ...m, media_type: 'movie' }));
  } catch (err) {
    console.error('Error fetching trending movies:', err);
    return getFallbackMovies();
  }
}

export async function fetchTopRatedMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    return (data.results || []).map((m: any) => ({ ...m, media_type: 'movie' }));
  } catch (err) {
    console.error('Error fetching top rated movies:', err);
    return getFallbackMovies();
  }
}

export async function fetchNowPlayingMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    return (data.results || []).map((m: any) => ({ ...m, media_type: 'movie' }));
  } catch (err) {
    console.error('Error fetching now playing movies:', err);
    return getFallbackMovies();
  }
}

export async function fetchUpcomingMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    return (data.results || []).map((m: any) => ({ ...m, media_type: 'movie' }));
  } catch (err) {
    console.error('Error fetching upcoming movies:', err);
    return getFallbackMovies();
  }
}

export async function fetchMovieDetails(id: number | string): Promise<Movie | null> {
  try {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,watch/providers`);
    const data = await res.json();
    if (!data.id) return null;
    return { ...data, media_type: 'movie' };
  } catch (err) {
    console.error('Error fetching movie details:', err);
    return null;
  }
}

export async function fetchMovieCredits(id: number | string): Promise<CastMember[]> {
  try {
    const res = await fetch(`${BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    return (data.cast || []).slice(0, 12).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path ? getTmdbImageUrl(c.profile_path) : null
    }));
  } catch (err) {
    return [];
  }
}

export async function fetchMovieVideos(id: number | string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    const trailer = (data.results || []).find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    return trailer ? trailer.key : (data.results?.[0]?.key || null);
  } catch (err) {
    return null;
  }
}

export async function fetchMovieWatchProviders(id: number | string): Promise<WatchProvidersResult | null> {
  try {
    const res = await fetch(`${BASE_URL}/movie/${id}/watch/providers?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    const results = data.results || {};
    // US or default country providers
    const usOrFirst = results.US || results.GB || results.IN || Object.values(results)[0];
    return usOrFirst || null;
  } catch (err) {
    return null;
  }
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    return (data.results || []).map((m: any) => ({ ...m, media_type: 'movie' }));
  } catch (err) {
    return [];
  }
}

function getFallbackMovies(): Movie[] {
  return [
    {
      id: 550,
      title: "Fight Club",
      overview: "An ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
      poster_path: "/pB8BMsqGGw2vB17zWv3poP3iZxy.jpg",
      backdrop_path: "/hZkgoQY85KGpToVUTeY2wA0my9D.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      vote_count: 27500,
      media_type: "movie"
    },
    {
      id: 27205,
      title: "Inception",
      overview: "Cobb, a skilled thief who steals valuable secrets from deep within the subconscious during the dream state, is given a chance at redemption.",
      poster_path: "/oYuLEW9WAFUh1yCxXYgiGvZwqYv.jpg",
      backdrop_path: "/8ZTVqvKDQ8emSGUEMjsv4yWBjfi.jpg",
      release_date: "2010-07-15",
      vote_average: 8.4,
      vote_count: 35000,
      media_type: "movie"
    },
    {
      id: 157336,
      title: "Interstellar",
      overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      backdrop_path: "/xJHokMbljvjADYdit5fK5VQsY2E.jpg",
      release_date: "2014-11-05",
      vote_average: 8.4,
      vote_count: 33000,
      media_type: "movie"
    },
    {
      id: 299536,
      title: "Avengers: Infinity War",
      overview: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.",
      poster_path: "/7WsyChLLEzcqIzonjHYGq58wv9c.jpg",
      backdrop_path: "/mGJu3aLq7Uuuftd2aYl8kQzK46o.jpg",
      release_date: "2018-04-25",
      vote_average: 8.3,
      vote_count: 28000,
      media_type: "movie"
    },
    {
      id: 155,
      title: "The Dark Knight",
      overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop_path: "/nMK281iIdPMyHooRvxWZa27n32i.jpg",
      release_date: "2008-07-16",
      vote_average: 8.5,
      vote_count: 31000,
      media_type: "movie"
    }
  ];
}
