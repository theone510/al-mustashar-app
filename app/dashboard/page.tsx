'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

type RecentClient = {
  id: string;
  name: string;
  case_type: string;
  created_at: string;
  status: string;
};

// Animated counter hook
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;

    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export default function DashboardOverviewPage() {
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const animatedTotal = useCountUp(totalClients);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, case_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!clientsError && clientsData) {
        setRecentClients(clientsData.map(c => ({
          ...c,
          status: 'نشط'
        })));
      }

      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (count !== null) setTotalClients(count);

      setIsLoading(false);
    }
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'موكل نشط',
      value: isLoading ? '...' : animatedTotal.toString(),
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      gradient: 'from-amber-500/10 to-orange-500/5',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15',
    },
    {
      title: 'ملفات مرفوعة',
      value: '0',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      gradient: 'from-blue-500/10 to-cyan-500/5',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15',
    },
    {
      title: 'استشارات مجراة',
      value: '0',
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      gradient: 'from-emerald-500/10 to-green-500/5',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15',
    },
    {
      title: 'قضايا منجزة',
      value: '0',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      gradient: 'from-purple-500/10 to-violet-500/5',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15',
    },
  ];

  const quickActions = [
    { label: 'إضافة موكل', href: '/dashboard/clients', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    { label: 'استشارة جديدة', href: '/', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { label: 'رفع مستند', href: '/dashboard/clients', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
  ];

  return (
    <div className="space-y-8 animate-slide-up">

      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">نظرة عامة على لوحة التحكم</h2>
        <p className="text-slate-400 text-sm sm:text-base">تابع نشاط الموكلين وإحصائيات الاستشارات القانونية الخاصة بك.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm font-medium text-slate-300 hover:text-amber-400 transition-all"
          >
            <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
            </svg>
            {action.label}
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((stat, i) => (
          <div key={i} className={`glass-card rounded-2xl p-5 group bg-gradient-to-br ${stat.gradient}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.iconBg} ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-white tabular-nums">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">أحدث الموكلين المضافين</h3>
          <Link href="/dashboard/clients" className="text-sm text-amber-500 hover:text-amber-400 font-medium transition-colors flex items-center gap-1">
            عرض الكل
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentClients.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium mb-1">لا يوجد موكلين حتى الآن</p>
            <p className="text-slate-600 text-sm">أضف أول موكل لك من صفحة الموكلين</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-500 text-sm">
                  <th className="pb-3 font-medium">اسم الموكل</th>
                  <th className="pb-3 font-medium">نوع القضية</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">تاريخ الإضافة</th>
                  <th className="pb-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentClients.map(client => (
                  <tr key={client.id} className="text-slate-200 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400">{client.case_type}</td>
                    <td className="py-4 text-slate-400 hidden sm:table-cell">{new Date(client.created_at).toLocaleDateString('ar-IQ')}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/15">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
