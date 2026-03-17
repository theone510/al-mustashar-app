'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; };
type ChatSession = { id: string; title: string; messages: Message[]; lastUpdate: number; };

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
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
    setActiveMenuId(null);
    if (currentSessionId === id) {
      if (newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const renameSession = (id: string, newTitle: string) => {
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: trimmedTitle, lastUpdate: Date.now() } : s));
    }
    setEditingSessionId(null);
    setActiveMenuId(null);
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
    <div dir="rtl" className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 h-full transition-all duration-300 ease-in-out border-l border-white/5 backdrop-blur-3xl bg-slate-950/95 md:bg-slate-950/40 shadow-2xl md:shadow-none overflow-hidden flex-shrink-0 ${
        isSidebarOpen ? 'translate-x-0 w-80 opacity-100' : 'translate-x-[110%] md:translate-x-0 md:w-0 w-80 opacity-0 md:opacity-100'
      }`}>
        <div className={`flex flex-col h-full w-80 p-6 transition-opacity duration-300 min-w-[320px] ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'}`}>
          <div className="flex items-center justify-between md:hidden mb-6">
            <span className="text-amber-500 font-bold">قائمة المستشار</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
          </div>
          
          <button 
            onClick={() => {
              createNewSession();
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-dashed border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-all font-bold mb-8 shadow-lg shadow-amber-500/5 active:scale-[0.98]"
          >
            <span className="text-xl leading-none mb-1">+</span>
            استشارة جديدة
          </button>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/5 [&::-webkit-scrollbar-thumb]:rounded-full">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 px-2">سجل الاستشارات</h2>
            {sessions.map(s => (
              <div 
                key={s.id}
                onClick={() => {
                  setCurrentSessionId(s.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`group relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                  currentSessionId === s.id 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 shadow-lg shadow-amber-500/5' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <span className="text-lg opacity-60">⚖️</span>
                  {editingSessionId === s.id ? (
                    <input 
                      type="text" 
                      value={editTitle}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => renameSession(s.id, editTitle)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameSession(s.id, editTitle);
                        if (e.key === 'Escape') { setEditingSessionId(null); setActiveMenuId(null); }
                      }}
                      className="bg-slate-900 border border-amber-500/50 rounded px-2 py-1 text-sm text-slate-200 w-full focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  ) : (
                    <span className="truncate text-sm font-medium">{s.title}</span>
                  )}
                </div>
                
                {/* 3 dots menu button */}
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === s.id ? null : s.id);
                    }}
                    className={`p-1 hover:text-amber-400 transition-all rounded-md ${activeMenuId === s.id ? 'text-amber-400 bg-white/10' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === s.id && (
                    <div className="absolute left-0 top-full mt-1 w-36 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 py-1 overflow-hidden" 
                         onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => {
                          setEditTitle(s.title);
                          setEditingSessionId(s.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-right px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-amber-400 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        تعديل الاسم
                      </button>
                      <button 
                        onClick={(e) => deleteSession(s.id, e)}
                        className="w-full text-right px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-red-400 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-white/5 opacity-40 text-[10px] text-center tracking-tighter uppercase font-medium mt-auto">
            نظام التحليل القانوني العراقي v2.0
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full h-full relative z-0">
        
        {/* Header (Always Visible) */}
        <header className="bg-slate-950/90 border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between min-h-[72px] shrink-0 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -mr-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 md:hidden"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:block p-2 -mr-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/20">
                <span className="text-lg sm:text-xl mb-1">⚖️</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 leading-tight">المستشار</h1>
                <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium uppercase tracking-widest hidden sm:block">خبير القانون المدني العراقي</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={createNewSession}
              className="md:hidden flex-shrink-0 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all font-bold shadow-lg shadow-amber-500/20 active:scale-[0.95] z-30"
              title="استشارة جديدة"
            >
              <span className="text-xl leading-none mb-1">+</span>
            </button>
            <button 
              className="hidden md:flex flex-shrink-0 items-center justify-center gap-2 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all font-medium border border-white/5"
            >
              <span className="text-sm">لوحة تحكم المحامي (قريباً)</span>
              <svg className="w-4 h-4 ml-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          </div>
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
                  ? 'bg-gradient-to-tl from-amber-600 to-amber-700 text-white rounded-tr-sm border border-amber-500/30' 
                  : 'backdrop-blur-md bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm shadow-black/40'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px] md:text-[16px]">
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
            <div className="flex justify-start animate-in fade-in zoom-in-95 duration-300">
              <div className="flex-shrink-0 ml-3 mt-1 w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm shadow-sm">
                ⚖️
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl rounded-tl-sm p-5 shadow-xl flex items-center gap-4 min-w-[180px]">
                <div className="flex gap-1.5">
                  <span className="animate-bounce w-2.5 h-2.5 bg-amber-500/80 rounded-full" style={{ animationDelay: '0ms' }}></span>
                  <span className="animate-bounce w-2.5 h-2.5 bg-amber-500/80 rounded-full" style={{ animationDelay: '150ms' }}></span>
                  <span className="animate-bounce w-2.5 h-2.5 bg-amber-500/80 rounded-full" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-slate-400 text-sm font-medium pr-1">جاري التحليل...</span>
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
      </main>
    </div>
  );
}
