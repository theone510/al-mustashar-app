'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Message = { role: 'user' | 'assistant'; content: string; timestamp?: number; };
type ChatSession = { id: string; title: string; messages: Message[]; lastUpdate: number; };

// Helper: relative time in Arabic
function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

// Simple markdown-to-html for AI responses
function renderMarkdown(text: string) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="text-slate-300 italic">$1</em>')
    .replace(/(المادة\s*\(?\s*\d+[^)]*\)?)/g, '<span class="text-amber-500 font-semibold px-1 bg-amber-500/10 rounded">$1</span>')
    .replace(/^[-•]\s+(.+)$/gm, '<li class="flex gap-2.5 items-start mt-2"><span class="text-amber-500 mt-1 shrink-0 text-sm">●</span><span class="leading-relaxed">$1</span></li>')
    .replace(/^(\d+)[.)]\s+(.+)$/gm, '<li class="flex gap-2.5 items-start mt-2.5"><span class="text-amber-500 font-bold shrink-0">$1.</span><span class="leading-relaxed">$2</span></li>')
    .replace(/((?:<li[^>]*>.*?<\/li>\n?)+)/g, '<ul class="space-y-1 my-3">$1</ul>')
    .replace(/\n\n/g, '</p><p class="mt-4 leading-relaxed">')
    .replace(/\n/g, '<br />');
  return `<p class="leading-relaxed text-[15px]">${html}</p>`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg transition-colors text-slate-500 hover:text-slate-300 hover:bg-slate-800" title="نسخ النص">
      {copied ? (
        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      )}
    </button>
  );
}

const SUGGESTIONS = [
  { icon: '📜', text: 'كيف ينظم القانون المدني العراقي عقد الإيجار؟' },
  { icon: '⚖️', text: 'ما هي شروط المسؤولية التقصيرية؟' },
  { icon: '💼', text: 'أحكام فسخ العقد وفقاً للقانون العراقي' },
  { icon: '🏢', text: 'ما هي أحكام الملكية الشائعة وقسمتها؟' },
];

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('al_mustashar_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
      else createNewSession();
    } else {
      createNewSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const valid = sessions.filter(s => s.messages.length > 0);
    if (valid.length > 0) localStorage.setItem('al_mustashar_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isLoading]);

  const createNewSession = useCallback(() => {
    const id = Date.now().toString();
    setSessions(prev => [{ id, title: 'محادثة جديدة', messages: [], lastUpdate: Date.now() }, ...prev]);
    setCurrentSessionId(id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, []);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      if (filtered.length > 0) setCurrentSessionId(filtered[0].id);
      else createNewSession();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 250) + 'px';
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const isNew = currentSession?.messages.length === 0;

  const sendMessage = async (e?: React.FormEvent, override?: string) => {
    e?.preventDefault?.();
    const msg = override || input.trim();
    if (!msg || isLoading || !currentSessionId) return;

    const userMsg: Message = { role: 'user', content: msg, timestamp: Date.now() };
    const historyMsgs = currentSession.messages;
    const newMsgs = [...historyMsgs, userMsg];

    setSessions(prev => prev.map(s => s.id === currentSessionId ? {
      ...s, 
      messages: newMsgs, 
      title: historyMsgs.length === 0 ? msg.substring(0, 30) + '...' : s.title,
      lastUpdate: Date.now()
    } : s));

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const historyFormatted = historyMsgs.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: historyFormatted }),
      });

      const data = await res.json();
      setSessions(prev => prev.map(s => s.id === currentSessionId ? {
        ...s, 
        messages: [...newMsgs, { role: 'assistant', content: res.ok ? data.text : `خطأ: ${data.error}`, timestamp: Date.now() }],
        lastUpdate: Date.now()
      } : s));
    } catch {
      setSessions(prev => prev.map(s => s.id === currentSessionId ? {
        ...s, 
        messages: [...newMsgs, { role: 'assistant', content: 'خطأ في الاتصال بالخادم.', timestamp: Date.now() }],
      } : s));
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div dir="rtl" className="flex h-screen w-full bg-[#090D14] text-slate-200 font-sans overflow-hidden">
      
      {/* ── Mobile Sidebar Overlay ── */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:relative z-50 h-full w-[280px] bg-[#111827] border-l border-white/5 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-[100%] lg:translate-x-0'
      }`}>
        {/* Sidebar Header & New Chat */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between lg:hidden mb-2">
            <span className="font-bold text-lg text-white">القائمة</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-between gap-3 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-3 rounded-xl font-bold transition-colors shadow-sm active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              محادثة جديدة
            </span>
          </button>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-4 space-y-1 scroll-smooth">
          <p className="px-3 pb-2 pt-2 text-xs font-semibold text-slate-500 tracking-wider">السجل</p>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => { setCurrentSessionId(s.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={`group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                currentSessionId === s.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <svg className="w-4 h-4 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                <div className="truncate text-[13px] font-medium leading-relaxed">{s.title}</div>
              </div>
              
              {sessions.length > 1 && (
                <button onClick={(e) => deleteSession(s.id, e)} className="opacity-0 group-hover:opacity-100 p-1.5 -mr-1.5 text-slate-500 hover:text-red-400 rounded-md transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0F172A]">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            الرئيسية
          </Link>
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-[#090D14] relative">
        
        {/* Header (Fully Fixed Height) */}
        <header className="h-[68px] shrink-0 border-b border-white/5 bg-[#090D14]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-20">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                 <span className="text-sm">⚖️</span>
               </div>
               <h1 className="font-bold text-base text-white tracking-wide">المستشار</h1>
             </div>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth w-full px-4 sm:px-6 py-6 custom-scrollbar">
          {isNew && !isLoading ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 py-10 fade-in">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center mb-6 shadow-2xl border border-white/5">
                 <span className="text-3xl drop-shadow-md">⚖️</span>
               </div>
               <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center">أهلاً بك في المستشار</h2>
               <p className="text-slate-400 text-center text-[15px] mb-10 max-w-md leading-relaxed">
                 مساعدك الذكي لقانون التجارة المدني العراقي. يمكنك سؤالي عن العقود، التعويضات، أو قرارات محكمة التمييز.
               </p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                 {SUGGESTIONS.map((sug, i) => (
                   <button key={i} onClick={(e) => { setInput(sug.text); sendMessage(e, sug.text); }} className="text-right p-4 rounded-xl border border-white/5 bg-[#111827]/50 hover:bg-[#111827] hover:border-white/10 transition-all flex items-start gap-3 group">
                     <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">{sug.icon}</span>
                     <span className="text-sm text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">{sug.text}</span>
                   </button>
                 ))}
               </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-2">
              {currentSession?.messages.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
                  
                  {/* AI Avatar */}
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center ml-4 shrink-0 shadow-md">
                      <span className="text-[12px]">⚖️</span>
                    </div>
                  )}

                  <div className={`flex flex-col gap-2 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    
                    {/* User Bubble */}
                    {msg.role === 'user' ? (
                      <div className="bg-[#1E293B] text-slate-100 px-5 py-3.5 rounded-2xl rounded-tr-sm leading-relaxed text-[15px] shadow-sm">
                        {msg.content}
                      </div>
                    ) : (
                      /* AI Bubble */
                      <div className="flex flex-col w-full text-slate-300 py-1">
                        <div className="prose-chat" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                        
                        {/* AI Action Buttons */}
                        <div className="flex items-center gap-1 mt-4">
                          <CopyButton text={msg.content} />
                          <button className="p-1.5 text-slate-500 hover:text-emerald-500 hover:bg-slate-800 rounded-lg transition-colors" title="إجابة جيدة">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                          </button>
                          <button className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-lg transition-colors" title="إجابة غير دقيقة">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex w-full justify-start fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center ml-4 shrink-0 shadow-md">
                    <span className="text-[12px]">⚖️</span>
                  </div>
                  <div className="flex items-center justify-center h-10 px-4 bg-[#111827] rounded-2xl rounded-tl-sm border border-white/5">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500/80 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-500/80 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-500/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* ── Input Area ── */}
        <div className="shrink-0 bg-[#090D14] px-4 sm:px-6 pt-2 pb-6 w-full z-20">
          <div className="max-w-4xl mx-auto relative group">
            <form onSubmit={sendMessage} className="relative flex items-end">
              
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all z-10 ${
                  isRecording 
                    ? 'text-red-400 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' 
                    : 'text-slate-500 hover:text-white hover:bg-[#2A3648]'
                }`}
                title="ملاحظة صوتية"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="اسأل المستشار عن قضيتك العمالية أو المدنية..."
                rows={1}
                className="w-full bg-[#1E293B] border border-white/5 text-slate-100 placeholder-slate-500 rounded-2xl py-4 pr-14 pl-14 text-[15px] leading-relaxed transition-all focus:outline-none focus:border-amber-500/40 focus:bg-[#1E293B] shadow-sm resize-none"
                disabled={isLoading}
                autoFocus
                style={{ minHeight: '56px', maxHeight: '250px' }}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute left-2.5 bottom-2.5 w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:bg-[#2A3648] disabled:text-slate-500 transition-all z-10 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-[2.5px] border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <svg className="w-[18px] h-[18px] -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
            <div className="text-center mt-3">
              <span className="text-[11px] text-slate-500 font-medium">يمكن للمستشار ارتكاب أخطاء. يرجى مراجعة النصوص القانونية الهامة.</span>
            </div>
          </div>
        </div>

      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
