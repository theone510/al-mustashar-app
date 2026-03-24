'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'بحث ذكي في القوانين',
    description: 'ابحث في موسوعة القانون المدني العراقي وقرارات محكمة التمييز بتقنية الذكاء الاصطناعي.',
    gradient: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    title: 'استشارات فورية',
    description: 'احصل على إجابات قانونية دقيقة ومبنية على النصوص القانونية الرسمية في ثوانٍ.',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'إدارة الموكلين',
    description: 'لوحة تحكم متكاملة لإدارة بيانات الموكلين وملفاتهم والمستندات القانونية.',
    gradient: 'from-emerald-500/20 to-green-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'تحليل المستندات',
    description: 'ارفع أوراق القضية واترك الذكاء الاصطناعي يقرأها ويحللها ويقدم لك إجابات مخصصة.',
    gradient: 'from-purple-500/20 to-violet-500/10',
    iconColor: 'text-purple-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'خصوصية تامة',
    description: 'جميع البيانات مشفرة ومخزنة بشكل آمن. لا يتم مشاركة أي معلومات مع أطراف ثالثة.',
    gradient: 'from-rose-500/20 to-pink-500/10',
    iconColor: 'text-rose-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'سرعة الاستجابة',
    description: 'محرك ذكاء اصطناعي محسّن للقانون العراقي يقدم نتائج دقيقة في أقل من ثوانٍ.',
    gradient: 'from-indigo-500/20 to-blue-500/10',
    iconColor: 'text-indigo-400',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'اطرح سؤالك القانوني',
    description: 'اكتب استفسارك أو وصف قضيتك بلغة عربية طبيعية — لا حاجة لمصطلحات قانونية معقدة.',
  },
  {
    number: '02',
    title: 'البحث في الموسوعة',
    description: 'يبحث المستشار في آلاف المواد القانونية وقرارات محكمة التمييز للعثور على الأكثر صلة.',
  },
  {
    number: '03',
    title: 'استلم الإجابة المدعومة',
    description: 'تحصل على إجابة مفصلة مع الإشارة للمواد القانونية والقرارات ذات العلاقة.',
  },
];

const STATS = [
  { value: '+١٠٠٠', label: 'مادة قانونية' },
  { value: '+٥٠٠', label: 'قرار تمييزي' },
  { value: '٢٤/٧', label: 'متاح دائماً' },
  { value: '<٥ ث', label: 'وقت الاستجابة' },
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-x-hidden">

      {/* ═══════ Background ═══════ */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-600/[0.06] blur-[180px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/[0.04] blur-[180px]" />
        <div className="absolute top-[40%] left-[30%] w-[25%] h-[25%] rounded-full bg-amber-500/[0.03] blur-[120px]" />
      </div>

      {/* ═══════ Navigation ═══════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
              <span className="text-xl text-slate-900">⚖️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text-amber leading-tight">المستشار</h1>
              <p className="text-[9px] text-slate-500 font-medium uppercase tracking-[0.15em] hidden sm:block">Al-Mustashar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium"
            >
              لوحة التحكم
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 transition-all font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-[0.97]"
            >
              ابدأ الاستشارة
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════ Hero Section ═══════ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-amber-400 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            مدعوم بالذكاء الاصطناعي — القانون المدني العراقي
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.2] mb-6 animate-slide-up">
            مستشارك القانوني الذكي
            <br />
            <span className="gradient-text-amber">المتخصص بالقانون العراقي</span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
            اسأل أي سؤال قانوني واحصل على إجابات دقيقة مدعومة بنصوص القانون المدني العراقي
            وقرارات محكمة التمييز الاتحادية — في ثوانٍ معدودة.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link
              href="/chat"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 transition-all font-bold text-lg shadow-2xl shadow-amber-500/30 active:scale-[0.97]"
            >
              ابدأ الاستشارة مجاناً
              <svg className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl glass hover:bg-white/[0.08] text-slate-200 transition-all font-medium text-lg"
            >
              <svg className="w-5 h-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              لوحة تحكم المحامي
            </Link>
          </div>

          {/* Floating mock preview */}
          <div className="mt-16 animate-slide-up relative" style={{ animationDelay: '400ms' }}>
            <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                  <span className="text-lg">⚖️</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">المستشار</p>
                  <p className="text-[10px] text-slate-500">خبير القانون المدني العراقي</p>
                </div>
                <div className="mr-auto flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
              </div>
              {/* Mock conversation */}
              <div className="space-y-4 text-right">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-tl from-amber-600 to-amber-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm leading-relaxed">ما هي حقوق المستأجر في حالة فسخ العقد قبل انتهاء المدة؟</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-sm leading-relaxed text-slate-300">
                      وفقاً للقانون المدني العراقي، المادة (٧٨٧): «إذا فُسخ عقد الإيجار قبل انقضاء مدته، فللمستأجر حق المطالبة بالتعويض...»
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow behind preview */}
            <div className="absolute inset-0 -z-10 bg-amber-500/[0.05] blur-[80px] rounded-full" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 animate-fade-in" style={{ animationDelay: '800ms' }}>
          <span className="text-[10px] font-medium tracking-widest uppercase">اكتشف المزيد</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ═══════ Stats Bar ═══════ */}
      <section className="relative z-10 py-8 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold gradient-text-amber mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ Features Section ═══════ */}
      <section className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-amber-500 uppercase tracking-[0.2em] mb-3">المميزات</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">كل ما يحتاجه المحامي العراقي</h3>
            <p className="text-slate-400 max-w-xl mx-auto">أدوات ذكية مصممة خصيصاً للممارسة القانونية في العراق</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {FEATURES.map((feature, i) => (
              <div key={i} className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${feature.gradient} group`}>
                <div className={`p-3 rounded-xl bg-white/5 ${feature.iconColor} w-fit mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ How it Works ═══════ */}
      <section className="relative z-10 py-20 sm:py-28 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-amber-500 uppercase tracking-[0.2em] mb-3">كيف يعمل</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">ثلاث خطوات فقط</h3>
            <p className="text-slate-400 max-w-xl mx-auto">من السؤال إلى الإجابة القانونية المتكاملة في ثوانٍ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center group">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 -left-4 w-8 h-[2px] bg-gradient-to-l from-amber-500/30 to-transparent" />
                )}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card mb-6 group-hover:border-amber-500/30 transition-all">
                  <span className="text-2xl font-bold gradient-text-amber">{step.number}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{step.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA Section ═══════ */}
      <section className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-10 sm:p-14 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/30">
                <span className="text-3xl">⚖️</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">ابدأ استشارتك القانونية الآن</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                انضم إلى المحامين والمستشارين القانونيين الذين يعتمدون على المستشار في عملهم اليومي.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/chat"
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 transition-all font-bold text-lg shadow-2xl shadow-amber-500/30 active:scale-[0.97]"
                >
                  جرّب المستشار مجاناً
                  <svg className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ Footer ═══════ */}
      <footer className="relative z-10 border-t border-white/[0.04] py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                <span className="text-lg">⚖️</span>
              </div>
              <div>
                <p className="font-bold gradient-text-amber">المستشار</p>
                <p className="text-[10px] text-slate-600">نظام التحليل القانوني العراقي v2.0</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/chat" className="hover:text-amber-400 transition-colors">الاستشارة</Link>
              <Link href="/dashboard" className="hover:text-amber-400 transition-colors">لوحة التحكم</Link>
              <Link href="/dashboard/clients" className="hover:text-amber-400 transition-colors">الموكلين</Link>
            </div>

            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} المستشار — جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
