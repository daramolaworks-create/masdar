/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Menu, 
  Mic, 
  Paperclip, 
  Send, 
  Phone, 
  MessageCircle,
  Info,
  Layers,
  Zap,
  Globe,
  Briefcase,
  Home,
  Building,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithAssistant } from './lib/deepseek';
import Markdown from 'react-markdown';

// Global types for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  
  // New States
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, mode]);

  useEffect(() => {
    localStorage.setItem('masdar_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
           setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMode('chat');
  };

  const handleSend = async (text?: string) => {
    const messageContent = typeof text === 'string' ? text : input;
    if (!messageContent.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setMode('chat');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    let updatedSessionTitle = currentSession.title;
    if (currentSession.messages.length === 1 && currentSession.title === 'New Chat') {
      updatedSessionTitle = messageContent.slice(0, 30) + (messageContent.length > 30 ? '...' : '');
    }

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
        content: response || "I'm sorry, I couldn't process that. Please try calling us for more complex queries.",
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
        content: "An error occurred while connecting to the assistant. Please check your connection.",
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

  const recommendationCards = [
    {
      title: "Company Setup Packages",
      description: "Explore 100% foreign ownership and 0% import tariffs.",
      icon: <Briefcase className="w-8 h-8 mb-4 text-masdar-teal" />,
      action: "Show me Company Setup Packages"
    },
    {
      title: "Golden Visa Eligibility",
      description: "Learn about the 10-year residency for investors and talents.",
      icon: <Zap className="w-8 h-8 mb-4 text-masdar-blue" />,
      action: "Am I eligible for a Golden Visa?"
    },
    {
      title: "Commercial Real Estate",
      description: "Premium LEED-certified office spaces like The Square.",
      icon: <Building className="w-8 h-8 mb-4 text-masdar-teal" />,
      action: "Tell me about Commercial Real Estate in Masdar"
    },
    {
      title: "Residential Areas",
      description: "Sustainable living in the heart of Abu Dhabi.",
      icon: <Home className="w-8 h-8 mb-4 text-masdar-blue" />,
      action: "What Residential Areas are available?"
    }
  ];

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const filteredSessions = sessions
    .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex h-screen bg-white text-masdar-text overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden md:flex flex-col bg-masdar-sidebar border-r border-masdar-border"
          >
            {/* Logo */}
            <div className="p-8 pb-4">
              <img src="/logo.png" alt="Masdar City Logo" className="h-10 w-auto object-contain" />
            </div>

            {/* Main Sidebar Content */}
            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-20">
              {/* Related Topics */}
              <div className="bento-card">
                <h3 className="text-[10px] font-bold text-masdar-teal uppercase tracking-[0.2em] mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {relatedTopics.map((topic, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(`Tell me about ${topic.title}`)}
                      className="pill hover:bg-masdar-teal/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search History */}
              <div className="bento-card">
                <h3 className="text-[10px] font-bold text-masdar-teal uppercase tracking-[0.2em] mb-4">Search History</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-masdar-text-light" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search history..." 
                    className="w-full bg-masdar-gray border border-masdar-border rounded-lg py-1.5 pl-9 pr-3 text-[10px] text-masdar-text focus:outline-none focus:border-masdar-teal transition-colors"
                  />
                </div>
              </div>

              {/* Recent Chats */}
              <div className="bento-card">
                <h3 className="text-[10px] font-bold text-masdar-teal uppercase tracking-[0.2em] mb-4">Recent Chats</h3>
                <div className="space-y-2">
                  {filteredSessions.length === 0 ? (
                    <div className="text-xs text-masdar-text-light text-center py-4">No chats found.</div>
                  ) : (
                    filteredSessions.map((session) => (
                      <button 
                        key={session.id} 
                        onClick={() => {
                          setCurrentSessionId(session.id);
                          setMode('chat');
                        }}
                        className={`w-full flex flex-col gap-1 py-2 px-3 rounded-lg transition-all cursor-pointer ${session.id === currentSessionId && mode === 'chat' ? 'bg-masdar-teal/10 border-l-2 border-masdar-teal' : 'hover:bg-masdar-gray'}`}
                      >
                        <span className="text-xs font-medium text-left truncate w-full text-masdar-text">{session.title}</span>
                        <span className="text-[10px] text-left text-masdar-text-light">{formatRelativeTime(session.updatedAt)}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-masdar-border space-y-2 mt-auto">
              <button className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] py-2 rounded-lg text-sm font-medium border border-[#25D366]/20 transition-all cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-masdar-teal/10 hover:bg-masdar-teal/20 text-masdar-teal py-2 rounded-lg text-sm font-medium border border-masdar-teal/20 transition-all cursor-pointer">
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
        <header className="h-16 flex items-center justify-between px-8 border-b border-masdar-border bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-masdar-gray rounded-lg transition-colors text-masdar-text-light md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-4">
              {/* Chat / Recommendations toggle */}
              <div className="flex bg-masdar-gray p-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <button 
                  onClick={() => setMode('chat')}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${mode === 'chat' ? 'bg-masdar-teal text-white shadow-sm' : 'text-masdar-text-light hover:text-masdar-text'}`}
                >
                  Chat
                </button>
                <button 
                  onClick={() => setMode('recommendations')}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${mode === 'recommendations' ? 'bg-masdar-teal text-white shadow-sm' : 'text-masdar-text-light hover:text-masdar-text'}`}
                >
                  Recommendations
                </button>
              </div>
              {/* Text / Voice toggle */}
              <div className="flex bg-masdar-gray p-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <button 
                  onClick={() => setInputMode('text')}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${inputMode === 'text' ? 'bg-masdar-teal text-white shadow-sm' : 'text-masdar-text-light hover:text-masdar-text'}`}
                >
                  Text
                </button>
                <button 
                  onClick={() => setInputMode('voice')}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${inputMode === 'voice' ? 'bg-masdar-teal text-white shadow-sm' : 'text-masdar-text-light hover:text-masdar-text'}`}
                >
                  Voice
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleNewChat}
            className="flex items-center gap-1.5 bg-masdar-gray hover:bg-masdar-teal/10 text-masdar-teal px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-masdar-border hover:border-masdar-teal/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </header>

        {/* Content Area */}
        {mode === 'chat' ? (
          /* Chat Feed */
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scroll-smooth bg-masdar-gray/50">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-5 py-4 shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-masdar-teal text-white rounded-[20px] rounded-br-none' 
                      : 'bg-white border border-masdar-border text-masdar-text rounded-[20px] rounded-bl-none'
                  }`}>
                    {message.role === 'model' ? (
                      <div className="prose-chat text-sm leading-relaxed">
                        <Markdown>{message.content}</Markdown>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                    <div className={`text-[10px] mt-2 font-medium uppercase tracking-widest ${message.role === 'user' ? 'text-right text-white/60' : 'text-left text-masdar-text-light'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white border border-masdar-border px-5 py-4 rounded-[20px] rounded-bl-none shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-masdar-teal rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-masdar-teal rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-masdar-teal rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          /* Recommendations View */
          <div className="flex-1 overflow-y-auto px-8 py-12 bg-masdar-gray/50">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-light text-masdar-dark mb-2">Explore <span className="font-bold text-masdar-teal">Masdar City</span></h2>
              <p className="text-masdar-text-light mb-8 max-w-2xl">Discover opportunities in sustainability, business setup, and premium real estate in the heart of Abu Dhabi.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendationCards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleSend(card.action)}
                    className="bg-white border border-masdar-border rounded-2xl p-6 hover:border-masdar-teal/50 hover:shadow-lg cursor-pointer transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-masdar-teal/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125"></div>
                    {card.icon}
                    <h3 className="text-lg font-bold text-masdar-dark mb-2 group-hover:text-masdar-teal transition-colors relative z-10">{card.title}</h3>
                    <p className="text-sm text-masdar-text-light relative z-10">{card.description}</p>
                    <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-masdar-teal opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                      Ask Assistant <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 border-t border-masdar-border bg-white relative z-20">
          <div className="max-w-4xl mx-auto relative group">
            {inputMode === 'voice' ? (
              /* Voice Input Mode */
              <div className="flex flex-col items-center justify-center py-6 bg-masdar-gray border border-masdar-border rounded-2xl">
                <button 
                  onClick={toggleListening}
                  className={`p-6 rounded-full transition-all duration-300 cursor-pointer ${isListening ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.25)] scale-110' : 'bg-masdar-teal hover:bg-teal-600 shadow-lg shadow-masdar-teal/20'}`}
                >
                  {isListening ? <Mic className="w-8 h-8 text-white animate-pulse" /> : <Mic className="w-8 h-8 text-white" />}
                </button>
                <div className="mt-6 text-sm font-medium text-masdar-text h-6">
                  {isListening ? (input ? input : "Listening...") : (input ? input : "Tap the microphone to speak")}
                </div>
                {input && !isListening && (
                   <button 
                     onClick={() => handleSend()}
                     className="mt-6 px-6 py-2 bg-masdar-teal hover:bg-teal-600 rounded-full text-xs font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
                   >
                     Send Message
                   </button>
                )}
              </div>
            ) : (
              /* Text Input Mode */
              <div className="bg-masdar-gray border border-masdar-border rounded-2xl flex items-center p-2 gap-3 shadow-sm transition-all focus-within:border-masdar-teal focus-within:shadow-md">
                <button className="p-3 text-masdar-text-light hover:bg-white rounded-xl transition-colors cursor-pointer">
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
                  className="flex-1 bg-transparent border-none outline-none text-masdar-text px-2 placeholder:text-masdar-text-light/60 text-sm"
                />
                <button 
                  onClick={() => setInputMode('voice')}
                  className="p-3 text-masdar-text-light hover:bg-white rounded-xl transition-colors cursor-pointer"
                  title="Switch to Voice Input"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={`p-3 rounded-xl transition-all ${
                    input.trim() && !isLoading 
                      ? 'bg-masdar-teal shadow-lg shadow-masdar-teal/20 hover:bg-teal-600 cursor-pointer' 
                      : 'bg-masdar-border text-masdar-text-light pointer-events-none'
                  }`}
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
