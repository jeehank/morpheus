import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Plus, Check, Bot, User as UserIcon } from 'lucide-react';
import type { ChatMessage, UserAccount } from '../types';
import { sendGeminiChatMessage } from '../services/geminiService';
import { getCurrentUser, updateUserWatchlist } from '../services/firebaseClient';

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth?: () => void;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAuth
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser());
  const messagesEndRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreeting: ChatMessage = {
        id: 'msg_welcome',
        sender: 'ai',
        text: "Welcome to IGMDB Assistant! I can help you discover movies, video games, storyline details, and personalized recommendations. What are you in the mood for today?",
        timestamp: new Date().toISOString()
      };
      setMessages([initialGreeting]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsSending(true);

    try {
      const responseMsg = await sendGeminiChatMessage(newHistory, query);
      setMessages(prev => [...prev, responseMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: "I am ready to assist you. Ask me about any movie or game!",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddRecommendationToWatchlist = (item: { id: number | string; mediaType: 'movie' | 'game'; title: string; poster: string }) => {
    const user = getCurrentUser();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const updated = updateUserWatchlist(item);
    setCurrentUser(updated);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '420px',
      height: '600px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 40px)',
      backgroundColor: '#1f1f1f',
      border: '1px solid var(--border-orange)',
      borderRadius: '12px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.85)',
      zIndex: 2500,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #181818, #2a2a2a)',
        padding: '14px 16px',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-orange)',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            AI
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              IGMDB AI Assistant
            </div>
            <div style={{ fontSize: '0.75rem', color: '#aaa' }}>Cinema & Gaming Concierge</div>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ color: '#aaa', padding: '4px' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#141414'
      }}>
        {messages.map((msg) => (
          <div 
            key={msg.id}
            style={{
              display: 'flex',
              gap: '10px',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: msg.sender === 'user' ? '#333' : 'var(--brand-orange)',
              color: msg.sender === 'user' ? '#fff' : '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {msg.sender === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
            </div>

            <div style={{ maxWidth: '80%' }}>
              <div style={{
                backgroundColor: msg.sender === 'user' ? '#2a2a2a' : '#222',
                border: msg.sender === 'ai' ? '1px solid #333' : 'none',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                lineHeight: 1.4,
                whiteSpace: 'pre-line'
              }}>
                {msg.text}
              </div>

              {/* Recommendations Card Carousel inside AI reply */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-orange)', textTransform: 'uppercase' }}>
                    Recommended Titles for your Watchlist:
                  </div>
                  {msg.recommendations.map((rec) => {
                    const inWatchlist = currentUser?.watchlist.some(
                      w => String(w.id) === String(rec.id) && w.mediaType === rec.mediaType
                    );

                    return (
                      <div
                        key={rec.id}
                        style={{
                          backgroundColor: '#1f1f1f',
                          border: '1px solid #333',
                          borderRadius: '8px',
                          padding: '8px',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'center'
                        }}
                      >
                        <img src={rec.poster} alt={rec.title} style={{ width: '42px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{rec.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#aaa', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {rec.overview}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddRecommendationToWatchlist(rec)}
                          style={{
                            backgroundColor: inWatchlist ? '#2a2a2a' : 'var(--brand-orange)',
                            color: inWatchlist ? '#aaa' : '#000',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {inWatchlist ? <Check size={14} /> : <Plus size={14} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {isSending && (
          <div style={{ display: 'flex', gap: '8px', color: '#aaa', fontSize: '0.8rem', alignItems: 'center' }}>
            <span>AI Assistant is generating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div style={{ padding: '8px 12px', backgroundColor: '#181818', borderTop: '1px solid #2e2e2e', display: 'flex', gap: '6px', overflowX: 'auto' }}>
        {['Mind-bending Thrillers', 'Open-World Games', 'High-Octane Action', 'Top Sci-Fi Movies'].map((chip) => (
          <button
            key={chip}
            onClick={() => handleSend(`Recommend me some ${chip}`)}
            style={{
              backgroundColor: '#262626',
              color: '#ccc',
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '12px',
              whiteSpace: 'nowrap',
              border: '1px solid #3a3a3a'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-orange)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3a3a3a'}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Footer Input Bar */}
      <div style={{ padding: '12px', backgroundColor: '#1f1f1f', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Ask Gemini AI for movie or game suggestions..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{
            flex: 1,
            backgroundColor: '#121212',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isSending}
          style={{
            backgroundColor: 'var(--brand-orange)',
            color: '#000',
            fontWeight: 700,
            padding: '0 14px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (!inputText.trim() || isSending) ? 0.5 : 1
          }}
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );
};
