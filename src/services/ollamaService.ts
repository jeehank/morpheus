import type { ChatMessage } from '../types';
import { searchMovies } from './tmdbApi';
import { searchGames } from './thegamesdbApi';

const OLLAMA_BASE_URL = 'http://localhost:11434';

export async function fetchOllamaModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (res.ok) {
      const data = await res.json();
      return (data.models || []).map((m: any) => m.name || m.model);
    }
  } catch (e) {
    // ignore
  }
  return ['llama3', 'mistral', 'gemma', 'llama2'];
}

export async function sendChatMessage(messages: ChatMessage[], userText: string, modelName: string = 'llama3'): Promise<ChatMessage> {
  const conversationContext = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
  const promptText = `Context:\n${conversationContext}\n\nSystem: You are IGMDB AI Assistant, a cinematic & gaming expert. User query: "${userText}". Provide a concise, tailored recommendation response with specific title suggestions.`;

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt: promptText,
        stream: false
      })
    });

    if (res.ok) {
      const data = await res.json();
      const aiReplyText = data.response || data.text;

      const movieMatches = await searchMovies(userText.slice(0, 30));
      const gameMatches = await searchGames(userText.slice(0, 30));

      const recs = [
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

      return {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toISOString(),
        recommendations: recs.length > 0 ? recs : undefined
      };
    }
  } catch (err) {
    // If Ollama API is not running locally on 11434
  }

  const movieMatches = await searchMovies(userText.trim() || 'Action');
  const gameMatches = await searchGames(userText.trim() || 'Action');

  const liveRecs = [
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

  return {
    id: 'ai_' + Date.now(),
    sender: 'ai',
    text: `🤖 **AI Assistant Response**:\nBased on your prompt "${userText}", I analyzed our live database of top-tier movies and video games. Here are customized recommendations for your watch & play list:`,
    timestamp: new Date().toISOString(),
    recommendations: liveRecs
  };
}
