'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AddClientModal from '../components/AddClientModal';

type Client = {
  id: string;
  name: string;
  case_type: string;
  phone: string;
  files_count?: number;
};

const AVATAR_GRADIENTS = [
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-green-600',
  'from-purple-500 to-violet-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-600',
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  async function fetchClients() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        case_type,
        phone,
        client_files(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      const formattedClients = data?.map(c => ({
        ...c,
        files_count: c.client_files[0]?.count || 0
      })) || [];
      setClients(formattedClients);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c =>
    c.name.includes(searchQuery) || c.case_type.includes(searchQuery) || c.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">إدارة الموكلين</h2>
          <p className="text-slate-400 text-sm">أضف موكلين جدد وقم بإدارة ملفاتهم واستشاراتهم الذكية.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 transition-all font-bold shadow-lg shadow-amber-500/20 active:scale-[0.98]"
        >
          <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          إضافة موكل جديد
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن موكل بالاسم أو نوع القضية..."
          className="w-full pr-12 pl-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/10 bg-white/[0.03] text-slate-200 placeholder-slate-500 transition-all text-sm"
        />
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {searchQuery ? 'لا توجد نتائج' : 'لا يوجد موكلين حالياً'}
          </h3>
          <p className="text-slate-500 text-sm">
            {searchQuery ? 'جرب كلمات بحث مختلفة' : 'انقر على الزر أعلاه لإضافة أول موكل لك.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {filteredClients.map((client, i) => (
            <div key={client.id} className="glass-card rounded-2xl p-5 flex flex-col group relative overflow-hidden">

              {/* Hover Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.07] blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} flex items-center justify-center text-base font-bold text-white shrink-0 shadow-lg`}>
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">{client.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{client.case_type}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 text-sm text-slate-400 mb-6 relative z-10">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>{client.files_count} ملفات</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span dir="ltr">{client.phone || 'غير مدرج'}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3 relative z-10">
                <Link href={`/dashboard/clients/${client.id}`} className="flex-1 text-center py-2.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-sm font-bold text-slate-300 transition-all">
                  عرض الملفات
                </Link>
                <Link href={`/dashboard/clients/${client.id}/chat`} className="flex-1 text-center py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/15 rounded-xl text-sm font-bold text-amber-400 transition-all">
                  محادثة مخصصة
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClients}
      />
    </div>
  );
}
