'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; };
type ChatSession = { id: string; title: string; messages: Message[]; lastUpdate: number; };

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. تحميل الجلسات من التخزين المحلي عند البداية
  useEffect(() => {
    const savedSessions = localStorage.getItem('al_mustashar_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
      } else {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // 2. حفظ الجلسات عند أي تغيير
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('al_mustashar_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // 3. التمرير لأسفل عند وصول رسائل جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isLoading]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'استشارة جديدة',
      messages: [
        { role: 'assistant', content: 'أهلاً بك أستاذي الكريم في تطبيق "المستشار". أنا هنا لمساعدتك في الاستشارات القانونية والبحث بموسوعة القانون المدني العراقي وقرارات محكمة التمييز. تفضل بطرح قضيتك.' }
      ],
      lastUpdate: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentSessionId === id) {
      if (newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentSessionId) return;

    const userMsg = input.trim();
    const updatedMessages: Message[] = [...currentSession.messages, { role: 'user', content: userMsg }];
    
    // تحديث الرسائل محلياً فوراً
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: updatedMessages, title: s.messages.length === 1 ? userMsg.substring(0, 30) + '...' : s.title, lastUpdate: Date.now() } 
        : s
    ));
    
    setInput('');
    setIsLoading(true);

    try {
      // إرسال الرسالة مع تاريخ المحادثة (history) للـ AI
      const history = currentSession.messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history }),
      });

      const data = await response.json();
      if (response.ok) {
        setSessions(prev => prev.map(s => 
          s.id === currentSessionId 
            ? { ...s, messages: [...updatedMessages, { role: 'assistant', content: data.text }], lastUpdate: Date.now() } 
            : s
        ));
      } else {
        setSessions(prev => prev.map(s => 
          s.id === currentSessionId 
            ? { ...s, messages: [...updatedMessages, { role: 'assistant', content: `عذراً، حدث خطأ: ${data.error}` }], lastUpdate: Date.now() } 
            : s
        ));
      }
    } catch (error) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...updatedMessages, { role: 'assistant', content: 'عذراً، لا يمكن الاتصال بالخادم حالياً. تأكد من اتصالك بالإنترنت.' }], lastUpdate: Date.now() } 
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 overflow-hidden relative">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <aside className={`relative z-30 transition-all duration-300 ease-in-out border-l border-white/5 backdrop-blur-3xl bg-slate-950/40 ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="flex flex-col h-full w-80 p-6">
          <button 
            onClick={createNewSession}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-dashed border-amber-500/30 text-amber-400 hover:bg-amber-500/5 transition-all font-bold mb-8 shadow-lg shadow-amber-500/5 active:scale-[0.98]"
          >
            <span className="text-xl">+</span>
            استشارة جديدة
          </button>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/5 [&::-webkit-scrollbar-thumb]:rounded-full">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 px-2">سجل الاستشارات</h2>
            {sessions.map(s => (
              <div 
                key={s.id}
                onClick={() => setCurrentSessionId(s.id)}
                className={`group relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                  currentSessionId === s.id 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 shadow-lg shadow-amber-500/5' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-lg opacity-60">⚖️</span>
                  <span className="truncate text-sm font-medium">{s.title}</span>
                </div>
                <button 
                  onClick={(e) => deleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-white/5 opacity-40 text-[10px] text-center tracking-tighter uppercase font-medium">
            نظام التحليل القانوني العراقي v2.0
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full">
        
        {/* Mobile Sidebar Toggle & Header */}
        <header className="relative z-20 backdrop-blur-xl bg-slate-950/60 border-b border-white/5 shadow-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 mr-[-8px] hover:bg-white/5 rounded-xl transition-all text-slate-400"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/20">
                <span className="text-xl">⚖️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">المستشار</h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest hidden sm:block">خبير القانون المدني العراقي</p>
              </div>
            </div>
          </div>

          <button 
            onClick={createNewSession}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all font-bold shadow-lg shadow-amber-500/20 active:scale-[0.95] z-30"
          >
            <span className="text-xl leading-none">+</span>
            <span className="hidden sm:block">استشارة جديدة</span>
          </button>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          {currentSession?.messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 ml-3 mt-1 w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm shadow-sm shadow-black/40">
                  ⚖️
                </div>
              )}
              
              <div className={`relative max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 shadow-2xl transition-all duration-300 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-amber-600/95 to-amber-700/95 text-white rounded-tr-sm border border-amber-500/30' 
                  : 'backdrop-blur-md bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm shadow-black/60'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px] md:text-base">
                  {msg.content}
                </p>
              </div>

              {msg.role === 'user' && (
                <div className="flex-shrink-0 mr-3 mt-1 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm shadow-sm">
                  👤
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in active">
              <div className="flex-shrink-0 ml-3 mt-1 w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm shadow-sm">
                ⚖️
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl rounded-tl-sm p-6 shadow-2xl flex items-center gap-4 min-w-[200px]">
                <div className="flex gap-1">
                  <span className="animate-bounce w-2 h-2 bg-amber-500 rounded-full" style={{ animationDelay: '0ms' }}></span>
                  <span className="animate-bounce w-2 h-2 bg-amber-500 rounded-full" style={{ animationDelay: '150ms' }}></span>
                  <span className="animate-bounce w-2 h-2 bg-amber-500 rounded-full" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-slate-400 text-sm font-medium pr-2">المستشار يحلل السياق...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-6" />
        </main>

        {/* Input Form */}
        <footer className="relative z-20 backdrop-blur-2xl bg-slate-950/80 border-t border-white/10 p-4 sm:p-8">
          <form onSubmit={sendMessage} className="max-w-5xl mx-auto flex gap-4 relative">
            <div className="relative flex-1 group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="تفضل بطرح تساؤلك القانوني هنا..."
                className="w-full px-7 py-5 rounded-2xl border border-white/10 focus:border-amber-500/50 focus:outline-none focus:ring-4 focus:ring-amber-500/10 bg-white/5 text-slate-100 placeholder-slate-500 transition-all text-base lg:text-lg shadow-inner"
                disabled={isLoading}
                autoFocus
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
                {/* Space for future icons like mic or upload */}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="group bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-8 sm:px-10 py-5 rounded-2xl hover:brightness-110 transition-all disabled:opacity-30 disabled:hover:brightness-100 flex items-center justify-center min-w-[140px] shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)] active:scale-[0.97]"
            >
              {isLoading ? (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                </div>
              ) : (
                <span className="flex items-center gap-3">
                  توجيه للاستشارة
                </span>
              )}
            </button>
          </form>
          <div className="mt-4 text-center text-[10px] text-slate-600 font-medium uppercase tracking-[0.2em]">
            محرك ذكاء قانوني مُقيد بالسيادة القضائية العراقية
          </div>
        </footer>
      </div>
    </div>
  );
}
