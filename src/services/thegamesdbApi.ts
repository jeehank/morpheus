import type { Game } from '../types';

export const IGDB_PROXY_BASE = "https://igdb-proxy-production.up.railway.app";
export const IGDB_IMG_BASE = "https://images.igdb.com/igdb/image/upload/t_cover_big";

export function buildGamesQuery(filters?: any, offset = 0): string {
  const clauses = [
    "fields name,total_rating,total_rating_count,aggregated_rating,rating,first_release_date,genres.name,cover.image_id,summary,platforms.name,videos.video_id",
    "sort total_rating_count desc",
    `limit 60`,
    `offset ${offset}`
  ];

  const whereParts = ["total_rating_count > 5"];
  const genreId = filters && filters.genre;
  if (genreId && genreId !== "all") whereParts.push(`genres = (${genreId})`);
  if (filters && filters.year) {
    const start = Math.floor(new Date(`${filters.year}-01-01T00:00:00Z`).getTime() / 1000);
    const end = Math.floor(new Date(`${Number(filters.year) + 1}-01-01T00:00:00Z`).getTime() / 1000);
    whereParts.push(`first_release_date >= ${start} & first_release_date < ${end}`);
  }
  clauses.push(`where ${whereParts.join(" & ")}`);

  return clauses.join(";\n") + ";";
}

export function gameMatchesGenre(game: Game, genreName: string): boolean {
  if (!genreName || genreName.toLowerCase() === 'all') return true;
  const target = genreName.toLowerCase();

  const gameGenres: string[] = (game.genres || []).map((g: any) =>
    (typeof g === 'object' ? g.name : String(g)).toLowerCase()
  );

  if (gameGenres.length === 0) return true;

  if (target === 'rpg') {
    return gameGenres.some(g => g.includes('rpg') || g.includes('role-playing') || g.includes('tactical'));
  }
  if (target === 'action') {
    return gameGenres.some(g => g.includes('action') || g.includes('shooter') || g.includes('fighting') || g.includes('hack and slash') || g.includes('arcade'));
  }
  if (target === 'sci-fi') {
    return gameGenres.some(g => g.includes('sci-fi') || g.includes('science fiction') || g.includes('futuristic') || g.includes('space') || g.includes('cyberpunk'));
  }
  if (target === 'animation') {
    return gameGenres.some(g => g.includes('anime') || g.includes('animation') || g.includes('cartoon') || g.includes('indie'));
  }

  return gameGenres.some(g => g.includes(target));
}

let igdbGamesCache: { data: Game[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchGamesFromIGDB(filters?: any, extraPages: boolean = false): Promise<Game[]> {
  const cacheKey = JSON.stringify(filters || {});
  const now = Date.now();
  
  // Return cached games instantly if valid
  if (!filters && igdbGamesCache && (now - igdbGamesCache.timestamp < CACHE_TTL)) {
    return igdbGamesCache.data;
  }

  try {
    const offsets = extraPages ? [0, 60, 120, 180] : [0, 60];
    const requests = offsets.map(offset =>
      fetch(`${IGDB_PROXY_BASE}/games`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: buildGamesQuery(filters, offset)
      }).then(res => {
        if (!res.ok) throw new Error(`IGDB proxy responded with status ${res.status}`);
        return res.json();
      })
    );

    const resultsArray = await Promise.all(requests);
    let games = resultsArray.flat().filter(Boolean);

    const seen = new Map();
    games.forEach(g => { if (!seen.has(g.id)) seen.set(g.id, g); });
    const formatted = Array.from(seen.values()).map(g => formatIgdbGame(g));
    if (formatted.length > 0) {
      if (!filters) {
        igdbGamesCache = { data: formatted, timestamp: Date.now() };
      }
      return formatted;
    }
    return getFallbackGames();
  } catch (err) {
    console.warn('IGDB Proxy fetch error, using fallbacks:', err);
    return getFallbackGames();
  }
}

export async function fetchPopularGames(): Promise<Game[]> {
  return fetchGamesFromIGDB();
}

export async function fetchTrendingGames(): Promise<Game[]> {
  return fetchGamesFromIGDB();
}

export async function fetchUpcomingGames(): Promise<Game[]> {
  return fetchGamesFromIGDB({ year: 2026 });
}

export async function fetchGameDetails(id: number | string): Promise<Game | null> {
  const games = await fetchGamesFromIGDB();
  const match = games.find(g => String(g.id) === String(id));
  if (match) return match;
  return getFallbackGames().find(g => String(g.id) === String(id)) || null;
}

const GAME_TRAILER_MAP: Record<string, string> = {
  "grand theft auto v": "QkkoHAzjinY",
  "gta v": "QkkoHAzjinY",
  "the witcher 3: wild hunt": "c0i88t0Kacs",
  "elden ring": "E3Huy2cdih0",
  "elden ring: shadow of the erdtree": "qLZenOn7WUo",
  "red dead redemption 2": "eaW0tYxi4sU",
  "cyberpunk 2077": "8X2kIfS6fb8",
  "god of war ragnarök": "hfJ4Km46A-0",
  "god of war ragnarok": "hfJ4Km46A-0",
  "the legend of zelda: tears of the kingdom": "uHGShqc8XR8",
  "baldur's gate 3": "1T22wNvoNiU",
  "the last of us part i": "WxjeV10H1F0",
  "marvel's spider-man 2": "bgqGdIoa52s",
  "black myth: wukong": "pnD_e44M6a8",
  "hollow knight": "UAO2urG23S4",
  "portal 2": "tax4e4hBB43",
  "minecraft": "MmB9b5njVbA",
  "skyrim": "JSRtYapm7jA",
  "starfield": "kfYEiTdsyas"
};

export async function fetchGameTrailerKey(item: Game | string | number): Promise<string | null> {
  if (typeof item === 'object' && item !== null) {
    if (item.trailer_key) return item.trailer_key;
    const nameLower = item.name.toLowerCase();
    if (GAME_TRAILER_MAP[nameLower]) return GAME_TRAILER_MAP[nameLower];
    for (const [title, key] of Object.entries(GAME_TRAILER_MAP)) {
      if (nameLower.includes(title) || title.includes(nameLower)) return key;
    }
  } else {
    const game = await fetchGameDetails(item as string | number);
    if (game) return fetchGameTrailerKey(game);
  }
  return null;
}

export async function searchGames(query: string): Promise<Game[]> {
  if (!query.trim()) return [];
  const allGames = await fetchGamesFromIGDB();
  return allGames.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));
}

function formatIgdbGame(g: any): Game {
  const imageId = g.cover?.image_id;
  const coverUrl = imageId 
    ? `${IGDB_IMG_BASE}/${imageId}.jpg`
    : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80';

  const releaseYear = g.first_release_date 
    ? new Date(g.first_release_date * 1000).toISOString().split('T')[0]
    : '2025-05-10';

  const roundedRating = g.total_rating 
    ? Math.round((g.total_rating / 10) * 10) / 10
    : (g.rating ? Math.round((g.rating / 10) * 10) / 10 : 8.8);

  const trailerKey = (g.videos && g.videos.length > 0 && g.videos[0].video_id)
    ? g.videos[0].video_id
    : (GAME_TRAILER_MAP[(g.name || '').toLowerCase()] || undefined);

  return {
    id: g.id,
    name: g.name,
    summary: g.summary || "An immersive high-tier video game packed with next-generation visuals and intense gameplay.",
    overview: g.summary || "An immersive high-tier video game packed with next-generation visuals and intense gameplay.",
    cover_url: coverUrl,
    poster_path: coverUrl,
    backdrop_path: coverUrl,
    background_image: coverUrl,
    release_date: releaseYear,
    released: releaseYear,
    rating: roundedRating,
    vote_average: roundedRating,
    rating_count: g.total_rating_count || 1420,
    vote_count: g.total_rating_count || 1420,
    genres: Array.isArray(g.genres) ? g.genres.map((genre: any) => typeof genre === 'object' ? genre.name : genre) : ["Action", "RPG"],
    platforms: Array.isArray(g.platforms) ? g.platforms.map((p: any) => typeof p === 'object' ? p.name : p) : ["PC", "PlayStation 5", "Xbox Series X"],
    developers: ["AAA Game Studio"],
    publishers: ["Global Publishing"],
    trailer_key: trailerKey,
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
      cover_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg",
      poster_path: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg",
      backdrop_path: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg",
      release_date: "2013-09-17",
      vote_average: 9.2,
      rating: 9.2,
      vote_count: 7200,
      genres: ["Action", "Adventure"],
      platforms: ["PC", "PlayStation 5", "Xbox Series X"],
      trailer_key: "QkkoHAzjinY",
      media_type: 'game'
    },
    {
      id: 3328,
      name: "The Witcher 3: Wild Hunt",
      summary: "The Witcher: Wild Hunt is a story-driven, next-generation open world role-playing game set in a visually stunning fantasy universe.",
      overview: "The Witcher: Wild Hunt is a story-driven, next-generation open world role-playing game set in a visually stunning fantasy universe.",
      cover_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
      poster_path: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
      backdrop_path: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
      release_date: "2015-05-18",
      vote_average: 9.5,
      rating: 9.5,
      vote_count: 6500,
      genres: ["RPG", "Open World"],
      platforms: ["PC", "PlayStation 5", "Nintendo Switch"],
      trailer_key: "c0i88t0Kacs",
      media_type: 'game'
    },
    {
      id: 1942,
      name: "Elden Ring",
      summary: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
      overview: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
      cover_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
      poster_path: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
      backdrop_path: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
      release_date: "2022-02-25",
      vote_average: 9.6,
      rating: 9.6,
      vote_count: 9800,
      genres: ["Action", "RPG"],
      platforms: ["PC", "PlayStation 5", "Xbox Series X"],
      trailer_key: "E3Huy2cdih0",
      media_type: 'game'
    },
    {
      id: 119133,
      name: "Elden Ring: Shadow of the Erdtree",
      summary: "An expansion for Elden Ring featuring a new story set in the Land of Shadow, filled with dangerous dungeons, terrifying bosses, and new weapons.",
      overview: "An expansion for Elden Ring featuring a new story set in the Land of Shadow, filled with dangerous dungeons, terrifying bosses, and new weapons.",
      cover_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7vhn.jpg",
      poster_path: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7vhn.jpg",
      backdrop_path: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7vhn.jpg",
      release_date: "2024-06-21",
      vote_average: 9.4,
      rating: 9.4,
      vote_count: 4500,
      genres: ["RPG", "Action"],
      platforms: ["PC", "PlayStation 5", "Xbox Series X"],
      trailer_key: "qLZenOn7WUo",
      media_type: 'game'
    },
    {
      id: 28,
      name: "Red Dead Redemption 2",
      summary: "America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels.",
      overview: "America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels.",
      cover_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1qfc.jpg",
      poster_path: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1qfc.jpg",
      backdrop_path: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1qfc.jpg",
      release_date: "2018-10-26",
      vote_average: 9.7,
      rating: 9.7,
      vote_count: 8100,
      genres: ["Action", "Adventure"],
      platforms: ["PC", "PlayStation 4", "Xbox One"],
      trailer_key: "eaW0tYxi4sU",
      media_type: 'game'
    }
  ];
}
