/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  History, 
  Settings, 
  Menu, 
  X, 
  Mic, 
  Paperclip, 
  Send, 
  Phone, 
  MessageCircle,
  ChevronRight,
  Info,
  Layers,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithAssistant } from './lib/deepseek';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

interface Session {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'model',
  content: 'Welcome to Masdar City. I am your AI Assistant. How can I assist with your Masdar City journey today?',
  timestamp: new Date(),
};

function createNewSession(): Session {
  return {
    id: Date.now().toString(),
    title: 'New Chat',
    updatedAt: Date.now(),
    messages: [{ ...DEFAULT_WELCOME_MESSAGE, timestamp: new Date() }],
  };
}

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('masdar_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Revive dates
        parsed.forEach((s: any) => {
          s.messages.forEach((m: any) => {
            m.timestamp = new Date(m.timestamp);
          });
        });
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse sessions from local storage', e);
      }
    }
    return [createNewSession()];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(sessions[0]?.id);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mode, setMode] = useState<'chat' | 'recommendations'>('chat');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('masdar_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleSend = async (text?: string) => {
    const messageContent = typeof text === 'string' ? text : input;
    if (!messageContent.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    let updatedSessionTitle = currentSession.title;
    // Auto-title if it's the first user message
    if (currentSession.messages.length === 1 && currentSession.title === 'New Chat') {
      updatedSessionTitle = messageContent.slice(0, 30) + (messageContent.length > 30 ? '...' : '');
    }

    // Optimistically update UI
    const updatedSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          title: updatedSessionTitle,
          updatedAt: Date.now(),
          messages: [...s.messages, userMsg]
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    if (messageContent === input) setInput('');
    setIsLoading(true);

    try {
      const history = currentSession.messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const response = await chatWithAssistant(messageContent, history);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response || "I'm sorry, I couldn't process that. Please try calling us for more complex legal or pricing queries.",
        timestamp: new Date(),
      };
      
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: [...s.messages, assistantMsg]
          };
        }
        return s;
      }));
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "An error occurred while connecting to the assistant. Please check your connection or try again later.",
        timestamp: new Date(),
      };
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: [...s.messages, errorMsg]
          };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const relatedTopics = [
    { title: 'Freezone Setup', icon: <Layers className="w-4 h-4" /> },
    { title: 'UAE Golden Visa', icon: <Zap className="w-4 h-4" /> },
    { title: 'Sustainable Real Estate', icon: <Globe className="w-4 h-4" /> },
    { title: 'Registration FAQs', icon: <Info className="w-4 h-4" /> },
  ];

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return \`\${minutes}m ago\`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return \`\${hours}h ago\`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return \`\${days}d ago\`;
  };

  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex h-screen bg-masdar-black text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden md:flex flex-col bg-masdar-dark border-r border-white/5"
          >
            {/* Sidebar Logo & Clear Space (2X height padding) */}
            <div className="p-12 mb-2">
              <img src="/logo.png" alt="Masdar City Logo" className="h-12 w-auto object-contain" />
            </div>

            {/* Main Sidebar Content */}
            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-20">
              {/* Related Topics - Bento Card */}
              <div className="bento-card">
                <h3 className="text-[10px] font-bold text-masdar-blue uppercase tracking-[0.2em] mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {relatedTopics.map((topic, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(\`Tell me about \${topic.title}\`)}
                      className="pill hover:bg-masdar-teal/20 transition-all flex items-center gap-1.5"
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Chats - Bento Card */}
              <div className="bento-card">
                <h3 className="text-[10px] font-bold text-masdar-blue uppercase tracking-[0.2em] mb-4">Recent Chats</h3>
                <div className="space-y-2">
                  {sortedSessions.map((session) => (
                    <button 
                      key={session.id} 
                      onClick={() => setCurrentSessionId(session.id)}
                      className={\`w-full flex flex-col gap-1 py-2 px-3 rounded-lg transition-all \${session.id === currentSessionId ? 'bg-white/5 border-l-2 border-masdar-teal' : 'hover:bg-white/5 opacity-60'}\`}
                    >
                      <span className="text-xs font-medium text-left truncate">{session.title}</span>
                      <span className="text-[10px] text-left opacity-40">{formatRelativeTime(session.updatedAt)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search History Section - Bento Card */}
              <div className="bento-card">
                <h3 className="text-[10px] font-bold text-masdar-blue uppercase tracking-[0.2em] mb-4">Search History</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search history..." 
                    className="w-full bg-masdar-black/30 border border-slate-700/50 rounded-lg py-1.5 pl-9 pr-3 text-[10px] focus:outline-none focus:border-masdar-teal transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5 space-y-2 mt-auto">
              <button className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] py-2 rounded-lg text-sm font-medium border border-[#25D366]/20 transition-all">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-masdar-teal/10 hover:bg-masdar-teal/20 text-masdar-teal py-2 rounded-lg text-sm font-medium border border-masdar-teal/20 transition-all">
                <Phone className="w-4 h-4" />
                <span>Call Us</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-masdar-black/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex bg-masdar-dark p-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <button 
                  onClick={() => setMode('chat')}
                  className={\`px-4 py-1.5 rounded-full transition-all \${mode === 'chat' ? 'bg-masdar-teal text-white' : 'text-slate-400 hover:text-slate-200'}\`}
                >
                  Chat
                </button>
                <button 
                  onClick={() => setMode('recommendations')}
                  className={\`px-4 py-1.5 rounded-full transition-all \${mode === 'recommendations' ? 'bg-masdar-teal text-white' : 'text-slate-400 hover:text-slate-200'}\`}
                >
                  Recommendations
                </button>
              </div>
              <div className="flex bg-masdar-dark p-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <button 
                  onClick={() => setInputMode('text')}
                  className={\`px-4 py-1.5 rounded-full transition-all \${inputMode === 'text' ? 'bg-masdar-teal text-white' : 'text-slate-400 hover:text-slate-200'}\`}
                >
                  Text
                </button>
                <button 
                  onClick={() => setInputMode('voice')}
                  className={\`px-4 py-1.5 rounded-full transition-all \${inputMode === 'voice' ? 'bg-masdar-teal text-white' : 'text-slate-400 hover:text-slate-200'}\`}
                >
                  Voice
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleNewChat}
            className="flex items-center gap-1.5 bg-masdar-dark hover:bg-masdar-teal/20 text-masdar-teal px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-transparent hover:border-masdar-teal/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </header>

        {/* Chat Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={message.id}
                className={\`flex \${message.role === 'user' ? 'justify-end' : 'justify-start'}\`}
              >
                <div className={\`max-w-[85%] px-5 py-4 \${
                  message.role === 'user' 
                    ? 'bg-masdar-dark text-white rounded-[20px] rounded-br-none' 
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-[20px] rounded-bl-none'
                }\`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className={\`text-[10px] mt-2 font-medium uppercase tracking-widest opacity-40 \${message.role === 'user' ? 'text-right' : 'text-left'}\`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-[20px] rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-masdar-teal rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-masdar-teal rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-masdar-teal rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-white/5 bg-masdar-black">
          <div className="max-w-4xl mx-auto relative group">
            <div className="bg-masdar-dark border border-white/10 rounded-2xl flex items-center p-2 gap-3 shadow-2xl transition-all focus-within:border-white/20">
              <button className="p-3 text-masdar-blue hover:bg-white/5 rounded-xl transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about Freezone, Visas, or Masdar Real Estate..."
                className="flex-1 bg-transparent border-none outline-none text-slate-200 px-2 placeholder:text-masdar-blue text-sm"
              />
              <button 
                className="p-3 text-masdar-blue hover:bg-white/5 rounded-xl transition-colors"
                title="Voice Input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={\`p-3 rounded-xl transition-all \${
                  input.trim() && !isLoading 
                    ? 'bg-masdar-teal shadow-lg shadow-teal-500/20 hover:bg-teal-600' 
                    : 'bg-slate-800 text-slate-600 pointer-events-none'
                }\`}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
