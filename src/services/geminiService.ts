import type { ChatMessage } from '../types';
import { searchMovies } from './tmdbApi';
import { searchGames } from './thegamesdbApi';

const GEMINI_API_KEY = 'AQ.Ab8RN6LkwEB5sd2IEN1YO6k8d9uVC_KDUJJ9jeSHzqO_qeMhtg';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function isRecommendationRequested(text: string): boolean {
  const lower = text.toLowerCase();
  const recKeywords = [
    'recommend', 'recommendation', 'suggest', 'suggestion',
    'what should i watch', 'what should i play', 'what to watch', 'what to play',
    'top movies', 'top games', 'best movies', 'best games', 'list of movies',
    'show me movies', 'show me games', 'give me movies', 'give me games'
  ];
  return recKeywords.some(kw => lower.includes(kw));
}

export async function sendGeminiChatMessage(messages: ChatMessage[], userText: string): Promise<ChatMessage> {
  const historyText = messages.slice(-6).map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
  const needsRecs = isRecommendationRequested(userText);

  const systemPrompt = `You are IGMDB AI Assistant, an engaging and intelligent cinema & gaming concierge.
User says: "${userText}".
Instructions: Respond in a natural, polite, and helpful conversational manner. Answer questions directly. Do not spam lists unless requested. Do not use emojis in your response.`;

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
      const aiReplyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hello! How can I assist you with movies and games today?";
      const cleanText = aiReplyText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

      let recs = undefined;

      if (needsRecs) {
        const movieMatches = await searchMovies(userText.slice(0, 25));
        const gameMatches = await searchGames(userText.slice(0, 25));

        const matchedList = [
          ...movieMatches.slice(0, 2).map(m => ({
            id: m.id,
            mediaType: 'movie' as const,
            title: m.title,
            overview: m.overview,
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'
          })),
          ...gameMatches.slice(0, 2).map(g => ({
            id: g.id,
            mediaType: 'game' as const,
            title: g.name,
            overview: g.overview || g.summary || '',
            poster: g.cover_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500'
          }))
        ];

        if (matchedList.length > 0) recs = matchedList;
      }

      return {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: cleanText,
        timestamp: new Date().toISOString(),
        recommendations: recs
      };
    }
  } catch (err) {
    console.warn('Gemini API fetch error, falling back to conversational assistant:', err);
  }

  // Conversational Fallback
  let responseText = `Hello! I am IGMDB AI Assistant. How can I help you today?`;
  let recs = undefined;

  if (needsRecs) {
    const movieMatches = await searchMovies(userText.trim() || 'Action');
    const gameMatches = await searchGames(userText.trim() || 'Action');

    recs = [
      ...movieMatches.slice(0, 2).map(m => ({
        id: m.id,
        mediaType: 'movie' as const,
        title: m.title,
        overview: m.overview,
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'
      })),
      ...gameMatches.slice(0, 2).map(g => ({
        id: g.id,
        mediaType: 'game' as const,
        title: g.name,
        overview: g.overview || g.summary || '',
        poster: g.cover_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500'
      }))
    ];
    responseText = `Here are some recommendations based on your request:`;
  }

  return {
    id: 'ai_' + Date.now(),
    sender: 'ai',
    text: responseText,
    timestamp: new Date().toISOString(),
    recommendations: recs
  };
}
