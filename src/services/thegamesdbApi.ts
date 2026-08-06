import { Game } from '../types';

const THEGAMESDB_API_KEY = '72f0f123b332f3930d9c0715999b0d86db490a5bdb42eba1ec3b9e10414a72f2';

export async function fetchPopularGames(): Promise<Game[]> {
  try {
    // Attempt fetching from rawg or thegamesdb proxy endpoint
    const res = await fetch(`https://api.rawg.io/api/games?key=c534458d0c39434882797e8e178ee7df&page_size=20&ordering=-rating`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results.map((g: any) => formatRawgGame(g));
    }
    return getFallbackGames();
  } catch (err) {
    console.error('Error fetching games:', err);
    return getFallbackGames();
  }
}

export async function fetchTrendingGames(): Promise<Game[]> {
  try {
    const res = await fetch(`https://api.rawg.io/api/games?key=c534458d0c39434882797e8e178ee7df&page_size=20&ordering=-added`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results.map((g: any) => formatRawgGame(g));
    }
    return getFallbackGames();
  } catch (err) {
    return getFallbackGames();
  }
}

export async function fetchUpcomingGames(): Promise<Game[]> {
  try {
    const res = await fetch(`https://api.rawg.io/api/games?key=c534458d0c39434882797e8e178ee7df&page_size=20&dates=2024-01-01,2026-12-31&ordering=-added`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results.map((g: any) => formatRawgGame(g));
    }
    return getFallbackGames();
  } catch (err) {
    return getFallbackGames();
  }
}

export async function fetchGameDetails(id: number | string): Promise<Game | null> {
  try {
    const res = await fetch(`https://api.rawg.io/api/games/${id}?key=c534458d0c39434882797e8e178ee7df`);
    const data = await res.json();
    if (!data.id) return null;
    return formatRawgGame(data);
  } catch (err) {
    const fallback = getFallbackGames().find(g => String(g.id) === String(id));
    return fallback || null;
  }
}

export async function searchGames(query: string): Promise<Game[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`https://api.rawg.io/api/games?key=c534458d0c39434882797e8e178ee7df&search=${encodeURIComponent(query)}&page_size=12`);
    const data = await res.json();
    return (data.results || []).map((g: any) => formatRawgGame(g));
  } catch (err) {
    return [];
  }
}

function formatRawgGame(g: any): Game {
  return {
    id: g.id,
    name: g.name,
    summary: g.description_raw || g.overview || "An immersive high-tier title packed with action, deep storylines, and next-generation graphics.",
    overview: g.description_raw || g.overview || "An immersive high-tier title packed with action, deep storylines, and next-generation graphics.",
    cover_url: g.background_image || g.poster_path || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80",
    poster_path: g.background_image || null,
    backdrop_path: g.background_image_additional || g.background_image || null,
    background_image: g.background_image || null,
    release_date: g.released || g.release_date || "2024-03-22",
    released: g.released || "2024-03-22",
    rating: g.rating ? Math.round(g.rating * 2 * 10) / 10 : 8.8,
    vote_average: g.rating ? Math.round(g.rating * 2 * 10) / 10 : 8.8,
    rating_count: g.ratings_count || g.vote_count || 1420,
    vote_count: g.ratings_count || 1420,
    genres: Array.isArray(g.genres) ? g.genres.map((genre: any) => typeof genre === 'object' ? genre.name : genre) : ["Action", "RPG"],
    platforms: Array.isArray(g.platforms) ? g.platforms.map((p: any) => p.platform?.name || p.name || p) : ["PC", "PlayStation 5", "Xbox Series X"],
    developers: g.developers ? g.developers.map((d: any) => d.name) : ["AAA Studio"],
    publishers: g.publishers ? g.publishers.map((p: any) => p.name) : ["Global Publishing"],
    media_type: 'game'
  };
}

export function getFallbackGames(): Game[] {
  return [
    {
      id: 3498,
      name: "Grand Theft Auto V",
      summary: "Grand Theft Auto V for PC offers players the option to explore the award-winning world of Los Santos and Blaine County in resolutions up to 4k and beyond.",
      overview: "Grand Theft Auto V for PC offers players the option to explore the award-winning world of Los Santos and Blaine County in resolutions up to 4k and beyond.",
      cover_url: "https://media.rawg.io/media/games/20a/20aa692ee8e3ed0e27b1103dd64a4037.jpg",
      poster_path: "https://media.rawg.io/media/games/20a/20aa692ee8e3ed0e27b1103dd64a4037.jpg",
      backdrop_path: "https://media.rawg.io/media/screenshots/5f1/5f14170889218206d9d1ee55b253b216.jpg",
      release_date: "2013-09-17",
      vote_average: 9.2,
      rating: 9.2,
      vote_count: 7200,
      genres: ["Action", "Adventure"],
      platforms: ["PC", "PlayStation 5", "Xbox Series X/S"],
      media_type: 'game'
    },
    {
      id: 3328,
      name: "The Witcher 3: Wild Hunt",
      summary: "The Witcher: Wild Hunt is a story-driven, next-generation open world role-playing game set in a visually stunning fantasy universe.",
      overview: "The Witcher: Wild Hunt is a story-driven, next-generation open world role-playing game set in a visually stunning fantasy universe.",
      cover_url: "https://media.rawg.io/media/games/618/618c47b6e41555e9ee0e025e19744d96.jpg",
      poster_path: "https://media.rawg.io/media/games/618/618c47b6e41555e9ee0e025e19744d96.jpg",
      backdrop_path: "https://media.rawg.io/media/screenshots/1ac/1ac14f38a90e8bcf2105be134d1b8012.jpg",
      release_date: "2015-05-18",
      vote_average: 9.5,
      rating: 9.5,
      vote_count: 6500,
      genres: ["RPG", "Open World"],
      platforms: ["PC", "PlayStation 4", "PlayStation 5", "Nintendo Switch"],
      media_type: 'game'
    },
    {
      id: 5286,
      name: "Tomb Raider (2013)",
      summary: "Tomb Raider explores the intense and gritty origin story of Lara Croft and her ascent from a young woman to a hardened survivor.",
      overview: "Tomb Raider explores the intense and gritty origin story of Lara Croft and her ascent from a young woman to a hardened survivor.",
      cover_url: "https://media.rawg.io/media/games/021/021c4e21a1824d2526f925eee63711c6.jpg",
      poster_path: "https://media.rawg.io/media/games/021/021c4e21a1824d2526f925eee63711c6.jpg",
      backdrop_path: "https://media.rawg.io/media/screenshots/00f/00f074d306b9b3c3b0fb43d1a8e10410.jpg",
      release_date: "2013-03-05",
      vote_average: 8.6,
      rating: 8.6,
      vote_count: 4800,
      genres: ["Action", "Adventure"],
      platforms: ["PC", "PlayStation 4", "Xbox One"],
      media_type: 'game'
    },
    {
      id: 4200,
      name: "Portal 2",
      summary: "Portal 2 draws from the award-winning formula of innovative gameplay, story, and music that earned the original Portal over 70 industry accolades.",
      overview: "Portal 2 draws from the award-winning formula of innovative gameplay, story, and music that earned the original Portal over 70 industry accolades.",
      cover_url: "https://media.rawg.io/media/games/2ba/2bac0e87cf44e5b597b227d35b37cd21.jpg",
      poster_path: "https://media.rawg.io/media/games/2ba/2bac0e87cf44e5b597b227d35b37cd21.jpg",
      backdrop_path: "https://media.rawg.io/media/screenshots/250/25094cd3f3d7c37b2d5a37f516a75f7e.jpg",
      release_date: "2011-04-18",
      vote_average: 9.6,
      rating: 9.6,
      vote_count: 5900,
      genres: ["Puzzle", "Sci-Fi"],
      platforms: ["PC", "PlayStation 3", "Xbox 360"],
      media_type: 'game'
    },
    {
      id: 28,
      name: "Red Dead Redemption 2",
      summary: "America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels.",
      overview: "America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels.",
      cover_url: "https://media.rawg.io/media/games/511/51182150fea5e3a214a08fcc70116f41.jpg",
      poster_path: "https://media.rawg.io/media/games/511/51182150fea5e3a214a08fcc70116f41.jpg",
      backdrop_path: "https://media.rawg.io/media/screenshots/92d/92d19f446059d646f9166f25097491cf.jpg",
      release_date: "2018-10-26",
      vote_average: 9.7,
      rating: 9.7,
      vote_count: 8100,
      genres: ["Action", "Adventure", "Western"],
      platforms: ["PC", "PlayStation 4", "Xbox One"],
      media_type: 'game'
    }
  ];
}
