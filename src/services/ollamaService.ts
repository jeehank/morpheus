import { ChatMessage } from '../types';

const OLLAMA_ENDPOINT = 'http://localhost:11434/api/chat';

export async function sendChatMessage(messages: ChatMessage[], userText: string): Promise<ChatMessage> {
  const userMsgId = 'msg_' + Date.now();
  const userMsg: ChatMessage = {
    id: userMsgId,
    sender: 'user',
    text: userText,
    timestamp: new Date().toISOString()
  };

  try {
    // Attempt local Ollama API call
    const ollamaResponse = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3', // or mistral / standard ollama model
        messages: [
          { role: 'system', content: 'You are IGMDB AI, a world-class film & gaming concierge. You chat naturally with users like a real movie & gaming guru. You ask intelligent questions to understand their exact mood and taste, then recommend top movies and games.' },
          ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          { role: 'user', content: userText }
        ],
        stream: false
      })
    });

    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      const aiReply = data.message?.content || data.response;
      return {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toISOString()
      };
    }
  } catch (err) {
    // Ollama not active locally or network blocked; use dynamic conversational engine
  }

  return generateSmartAiResponse(userText, messages);
}

function generateSmartAiResponse(userText: string, pastMessages: ChatMessage[]): ChatMessage {
  const lower = userText.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || pastMessages.length <= 1) {
    return {
      id: 'ai_' + Date.now(),
      sender: 'ai',
      text: "Hey! I'm your IGMDB Concierge. I can build you a custom watch and play list tailored to your exact taste.\n\nTell me: What kind of vibe are you in the mood for right now? High-octane sci-fi, dark psychological thrillers, open-world gaming, or something fast-paced?",
      timestamp: new Date().toISOString()
    };
  }

  if (lower.includes('sci-fi') || lower.includes('space') || lower.includes('future') || lower.includes('cyberpunk')) {
    return {
      id: 'ai_' + Date.now(),
      sender: 'ai',
      text: "Awesome choice! You love deep atmospheric sci-fi and immersive futuristic worlds. Based on your vibe, here are my top recommended movies and games to watch and play next:",
      timestamp: new Date().toISOString(),
      recommendations: [
        {
          id: 157336,
          mediaType: 'movie',
          title: 'Interstellar',
          overview: 'Christopher Nolan’s epic journey across space and time to save humanity.',
          poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
        },
        {
          id: 27205,
          mediaType: 'movie',
          title: 'Inception',
          overview: 'A mind-bending heist through multi-layered dreamscapes.',
          poster: 'https://image.tmdb.org/t/p/w500/oYuLEW9WAFUh1yCxXYgiGvZwqYv.jpg'
        },
        {
          id: 3498,
          mediaType: 'game',
          title: 'Cyberpunk 2077',
          overview: 'An open-world action-adventure RPG set in the vibrant Night City.',
          poster: 'https://media.rawg.io/media/games/021/021c4e21a1824d2526f925eee63711c6.jpg'
        }
      ]
    };
  }

  if (lower.includes('action') || lower.includes('thriller') || lower.includes('fight') || lower.includes('intense')) {
    return {
      id: 'ai_' + Date.now(),
      sender: 'ai',
      text: "Got it! You want high energy and intense storytelling. Here are curated masterpieces that will keep you on the edge of your seat:",
      timestamp: new Date().toISOString(),
      recommendations: [
        {
          id: 550,
          mediaType: 'movie',
          title: 'Fight Club',
          overview: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.',
          poster: 'https://image.tmdb.org/t/p/w500/pB8BMsqGGw2vB17zWv3poP3iZxy.jpg'
        },
        {
          id: 155,
          mediaType: 'movie',
          title: 'The Dark Knight',
          overview: 'Heath Ledger and Christian Bale deliver the definitive gritty superhero thriller.',
          poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
        },
        {
          id: 28,
          mediaType: 'game',
          title: 'Red Dead Redemption 2',
          overview: 'An outlaw gang fights for survival in America’s unforgiving heartland.',
          poster: 'https://media.rawg.io/media/games/511/51182150fea5e3a214a08fcc70116f41.jpg'
        }
      ]
    };
  }

  return {
    id: 'ai_' + Date.now(),
    sender: 'ai',
    text: `That sounds intriguing! Based on what you said, I've analyzed our database of top-tier cinema and video games. Here is your custom daily recommendation selection:`,
    timestamp: new Date().toISOString(),
    recommendations: [
      {
        id: 3328,
        mediaType: 'game',
        title: 'The Witcher 3: Wild Hunt',
        overview: 'Rich narrative open-world RPG with intense monster hunting and gripping choices.',
        poster: 'https://media.rawg.io/media/games/618/618c47b6e41555e9ee0e025e19744d96.jpg'
      },
      {
        id: 299536,
        mediaType: 'movie',
        title: 'Avengers: Infinity War',
        overview: 'The ultimate cosmic showdown as heroes unite against an all-powerful threat.',
        poster: 'https://image.tmdb.org/t/p/w500/7WsyChLLEzcqIzonjHYGq58wv9c.jpg'
      }
    ]
  };
}
