'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = [
    { name: 'نظرة عامة', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'الموكلين', href: '/dashboard/clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'الملفات', href: '/dashboard/files', icon: 'M5 19a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H7a2 2 0 00-2 2v12z' },
    { name: 'الإعدادات', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2.5 glass-strong rounded-xl text-slate-300 shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 h-full shrink-0 transition-all duration-300 ease-out glass-strong shadow-2xl md:shadow-none flex flex-col ${
        isMobileOpen ? 'translate-x-0 w-72' : 'translate-x-full md:translate-x-0'
      } ${isCollapsed ? 'md:w-20' : 'md:w-72'}`}>

        {/* Logo Area */}
        <div className={`flex items-center gap-3 p-5 border-b border-white/5 ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 flex-shrink-0">
            <span className="text-xl text-slate-900">⚖️</span>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className="text-xl font-bold gradient-text-amber leading-tight whitespace-nowrap">المستشار</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.12em] mt-0.5 whitespace-nowrap">لوحة تحكم المحامي</p>
          </div>
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -left-3 top-[72px] w-6 h-6 rounded-full bg-slate-800 border border-white/10 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-50 shadow-md"
        >
          <svg className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? link.name : undefined}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isCollapsed ? 'md:justify-center md:px-0' : ''
                } ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-amber-500 rounded-l-full" />
                )}
                <svg className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'text-amber-400' : 'group-hover:scale-110'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
                <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
                  {link.name}
                </span>

                {/* Tooltip on collapsed */}
                {isCollapsed && (
                  <span className="hidden md:block absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-800 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {link.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className={`p-4 border-t border-white/5 space-y-3 ${isCollapsed ? 'md:px-2' : ''}`}>
          {/* User Profile */}
          <div className={`flex items-center gap-3 p-2 rounded-xl ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-sm font-bold text-amber-400 flex-shrink-0 border border-white/10">
              م
            </div>
            <div className={`overflow-hidden transition-all duration-300 min-w-0 ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
              <p className="text-sm font-medium text-slate-200 truncate">المحامي</p>
              <p className="text-[10px] text-slate-500 truncate">محامي@المستشار</p>
            </div>
          </div>

          {/* Back to Chat */}
          <Link
            href="/chat"
            title={isCollapsed ? 'العودة للاستشارة' : undefined}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium ${isCollapsed ? 'md:px-0' : ''}`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
              العودة للاستشارة
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
