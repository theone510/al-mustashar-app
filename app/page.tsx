'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'أهلاً بك أستاذي الكريم في تطبيق "المستشار". أنا هنا لمساعدتك في الاستشارات القانونية والبحث في القانون المدني العراقي وقرارات محكمة التمييز. تفضل بطرح قضيتك.' }
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
        setMessages(prev =>[...prev, { role: 'assistant', content: `خطأ: ${data.error}` }]);
      }
    } catch (error) {
      setMessages(prev =>[...prev, { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال بالخادم.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex flex-col h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-amber-500 py-4 px-6 shadow-md flex items-center justify-between border-b-4 border-amber-600">
        <div>
          <h1 className="text-2xl font-bold">⚖️ المستشار</h1>
          <p className="text-sm text-slate-300">مساعد المحامي الذكي (RAG + Gemini 3 Flash)</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-amber-100 text-slate-800 rounded-tr-none border border-amber-200' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border flex items-center space-x-2 space-x-reverse">
              <span className="animate-pulse w-2 h-2 bg-amber-500 rounded-full"></span>
              <span className="animate-pulse w-2 h-2 bg-amber-500 rounded-full delay-75"></span>
              <span className="animate-pulse w-2 h-2 bg-amber-500 rounded-full delay-150"></span>
              <span className="text-slate-500 text-sm mr-2">جاري البحث في الملفات القانونية...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white border-t p-4 shadow-inner">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب استشارتك أو مسألتك القانونية هنا..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-slate-800"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-slate-900 text-amber-400 font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          >
            {isLoading ? 'إرسال...' : 'استشارة'}
          </button>
        </form>
      </footer>
    </div>
  );
}
