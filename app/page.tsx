'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'أهلاً بك أستاذي الكريم في تطبيق "المستشار". أنا هنا لمساعدتك في الاستشارات القانونية والبحث بموسوعة القانون المدني العراقي وقرارات محكمة التمييز. تفضل بطرح قضيتك.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `عذراً، حدث خطأ: ${data.error}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، لا يمكن الاتصال بالخادم حالياً. تأكد من اتصالك بالإنترنت.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 overflow-hidden relative">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Header (Glassmorphism) */}
      <header className="relative z-10 backdrop-blur-xl bg-slate-950/60 border-b border-white/5 shadow-2xl px-6 py-5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/20">
            <span className="text-2xl">⚖️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 tracking-wide">المستشار</h1>
            <p className="text-sm text-slate-400 font-medium">مساعد قانوني مدعوم بالذكاء الاصطناعي</p>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 relative z-10 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
        
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 ml-3 mt-1 w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm shadow-sm">
                ⚖️
              </div>
            )}
            
            <div className={`relative max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 shadow-xl transition-all duration-300 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-amber-600/90 to-amber-700/90 text-white rounded-tr-sm border border-amber-500/20 shadow-amber-900/20' 
                : 'backdrop-blur-md bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm shadow-black/40'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed text-[15px] md:text-base">
                {msg.content}
              </p>
            </div>

            {msg.role === 'user' && (
              <div className="flex-shrink-0 mr-3 mt-1 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm">
                👤
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="flex-shrink-0 ml-3 mt-1 w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm shadow-sm">
              ⚖️
            </div>
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl rounded-tl-sm p-5 shadow-xl flex items-center space-x-2 space-x-reverse min-w-[200px]">
              <span className="animate-bounce w-2 h-2 bg-amber-500 rounded-full" style={{ animationDelay: '0ms' }}></span>
              <span className="animate-bounce w-2 h-2 bg-amber-500 rounded-full" style={{ animationDelay: '150ms' }}></span>
              <span className="animate-bounce w-2 h-2 bg-amber-500 rounded-full" style={{ animationDelay: '300ms' }}></span>
              <span className="text-slate-400 text-sm mr-4 font-medium tracking-wide">جاري دراسة الملفات...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Footer / Input Area (Glassmorphism) */}
      <footer className="relative z-20 backdrop-blur-xl bg-slate-950/80 border-t border-white/10 p-4 sm:p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
        <form onSubmit={sendMessage} className="max-w-5xl mx-auto flex gap-3 sm:gap-4 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل المستشار عن القضايا، القوانين، أو القرارات التمييزية..."
            className="flex-1 px-6 py-4 rounded-2xl border border-white/10 focus:border-amber-500/50 focus:outline-none focus:ring-4 focus:ring-amber-500/10 bg-white/5 text-slate-100 placeholder-slate-500 transition-all shadow-inner text-base lg:text-lg"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="group bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold px-6 sm:px-8 py-4 rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 disabled:hover:brightness-100 flex items-center justify-center min-w-[120px] shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="animate-pulse">إرسال...</span>
            ) : (
              <span className="flex items-center gap-2">
                استشارة
                <svg className="w-5 h-5 rtl:rotate-180 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}
