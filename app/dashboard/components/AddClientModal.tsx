'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddClientModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [caseType, setCaseType] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !caseType.trim()) return;

    setIsSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from('clients').insert([
      {
        name,
        case_type: caseType,
        phone,
        lawyer_id: userData?.user?.id || 'ca03fb03-38fe-4026-aa62-0870bb850147'
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error('Error adding client:', error);
      alert('حدث خطأ أثناء إضافة الموكل');
    } else {
      setName('');
      setCaseType('');
      setPhone('');
      onSuccess();
      onClose();
      router.refresh();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">إضافة موكل جديد</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">اسم الموكل</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: أحمد محمود العراقي"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">نوع القضية</label>
            <input
              required
              type="text"
              value={caseType}
              onChange={e => setCaseType(e.target.value)}
              placeholder="مثال: أحوال شخصية، تجاري، مدني..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">رقم الهاتف (اختياري)</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="07X XXXX XXXX"
              dir="ltr"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm text-right"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all font-medium text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 disabled:opacity-50 transition-all font-bold text-sm shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة الموكل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
