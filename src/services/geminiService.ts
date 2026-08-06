import type { ChatMessage } from '../types';
import { searchMovies, fetchTrendingMovies } from './tmdbApi';
import { searchGames, fetchPopularGames } from './thegamesdbApi';

const GEMINI_API_KEY = 'AQ.Ab8RN6LkwEB5sd2IEN1YO6k8d9uVC_KDUJJ9jeSHzqO_qeMhtg';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function isRecommendationRequested(text: string): boolean {
  const lower = text.toLowerCase();
  const recKeywords = [
    'recommend', 'recommendation', 'suggest', 'suggestion',
    'what should i watch', 'what should i play', 'what to watch', 'what to play',
    'top movies', 'top games', 'best movies', 'best games', 'list of movies',
    'show me movies', 'show me games', 'give me movies', 'give me games',
    'movies', 'games', 'films'
  ];
  return recKeywords.some(kw => lower.includes(kw));
}

async function getRecommendationsForQuery(userText: string) {
  // Strip common filler words
  const cleanTerm = userText
    .toLowerCase()
    .replace(/recommend|recommendation|suggest|suggestion|some|movies|movie|games|game|top|best|show|me|give|what|should|i|watch|play|list|of|please/g, '')
    .trim();

  let movieMatches: any[] = [];
  let gameMatches: any[] = [];

  if (cleanTerm.length >= 3) {
    movieMatches = await searchMovies(cleanTerm);
    gameMatches = await searchGames(cleanTerm);
  }

  // Fallback to trending/popular if no specific search keyword
  if (movieMatches.length === 0) {
    const trending = await fetchTrendingMovies();
    movieMatches = trending.slice(0, 3);
  }

  if (gameMatches.length === 0) {
    const popularG = await fetchPopularGames();
    gameMatches = popularG.slice(0, 3);
  }

  return [
    ...movieMatches.slice(0, 2).map(m => ({
      id: m.id,
      mediaType: 'movie' as const,
      title: m.title,
      overview: m.overview || 'Featured feature film.',
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'
    })),
    ...gameMatches.slice(0, 2).map(g => ({
      id: g.id,
      mediaType: 'game' as const,
      title: g.name,
      overview: g.overview || g.summary || 'Featured video game.',
      poster: g.cover_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500'
    }))
  ];
}

export async function sendGeminiChatMessage(messages: ChatMessage[], userText: string): Promise<ChatMessage> {
  const historyText = messages.slice(-8).map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
  const needsRecs = isRecommendationRequested(userText);

  const systemPrompt = `You are IGMDB Assistant, a movie and gaming expert.
User query: "${userText}".
Instructions:
- Provide a helpful, intelligent, natural response.
- Do NOT use emojis.
- Do NOT use technical jargon like "REST API", "Gemini 1.5", or "Supabase".
- If the user asks for recommendations, mention that you've selected great titles below.`;

  let responseText = "";
  let recs = undefined;

  if (needsRecs) {
    recs = await getRecommendationsForQuery(userText);
  }

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${historyText}\n${systemPrompt}` }
            ]
          }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const aiReplyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiReplyText) {
        responseText = aiReplyText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
      }
    }
  } catch (err) {
    console.warn('Gemini API request error:', err);
  }

  if (!responseText) {
    const lower = userText.toLowerCase();
    if (needsRecs) {
      responseText = "Here are top recommended movies and games tailored for you:";
    } else if (lower.includes('empty') || lower.includes('dumb') || lower.includes('why')) {
      responseText = "My apologies! I have refreshed the recommendation engine for you. Check out the top titles below!";
      if (!recs) recs = await getRecommendationsForQuery("movies");
    } else {
      responseText = `I'm happy to help you with movies, TV shows, and video games. What would you like to explore?`;
    }
  }

  return {
    id: 'ai_' + Date.now(),
    sender: 'ai',
    text: responseText,
    timestamp: new Date().toISOString(),
    recommendations: recs
  };
}
