'use client';

import { Bell, Search, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Analytics & Overview' },
  '/stakeholders': { title: 'Stakeholder Directory', subtitle: 'All organizations and individuals' },
  '/engagements': { title: 'Engagement Log', subtitle: 'All stakeholder interactions' },
  '/opportunities': { title: 'Opportunity Pipeline', subtitle: 'Funding & partnership opportunities' },
  '/followups': { title: 'Follow-Up Manager', subtitle: 'Scheduled reminders and tasks' },
  '/documents': { title: 'Document Repository', subtitle: 'Files and agreements' },
  '/import': { title: 'Import Data', subtitle: 'Excel & CSV import wizard' },
  '/settings': { title: 'Settings', subtitle: 'Platform configuration' },
};

const QUICK_ACTIONS = [
  { label: 'New Stakeholder', href: '/stakeholders/new' },
  { label: 'Log Engagement', href: '/engagements/new' },
  { label: 'Add Opportunity', href: '/opportunities/new' },
  { label: 'Schedule Follow-Up', href: '/followups/new' },
];

const mockNotifications = [
  { id: 1, text: 'Follow-up overdue: Check US Embassy Grant Decision', time: '2h ago', urgent: true },
  { id: 2, text: 'Draft UNICEF MoU due tomorrow', time: '5h ago', urgent: true },
  { id: 3, text: 'New opportunity: FCDO Arid Lands Grant available', time: '1d ago', urgent: false },
];

export default function TopBar() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Match route prefix
  const pageKey = Object.keys(PAGE_TITLES)
    .filter((k) => k !== '/')
    .find((k) => pathname.startsWith(k)) ?? pathname;
  const page = PAGE_TITLES[pageKey] ?? PAGE_TITLES['/'];

  return (
    <header className="header-blur sticky top-0 z-30 flex h-14 items-center gap-4 pl-14 md:pl-6 pr-6">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-white truncate">{page.title}</h1>
        <p className="text-xs text-slate-500 truncate">{page.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 w-56 focus-within:border-sky-500/40 transition-colors">
        <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search stakeholders…"
          className="bg-transparent text-sm text-slate-300 placeholder:text-slate-500 outline-none w-full"
        />
      </div>

      {/* Quick Add */}
      <div className="relative">
        <button
          onClick={() => { setShowQuickAdd(!showQuickAdd); setShowNotifications(false); }}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
        {showQuickAdd && (
          <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl border border-white/10 py-1 shadow-2xl z-50">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                onClick={() => setShowQuickAdd(false)}
                className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {a.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotifications(!showNotifications); setShowQuickAdd(false); }}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <Bell className="h-4 w-4 text-slate-400" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-sky-500 text-[9px] font-bold text-white flex items-center justify-center">
            {mockNotifications.filter((n) => n.urgent).length}
          </span>
        </button>
        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 w-80 glass-card rounded-xl border border-white/10 shadow-2xl z-50">
            <div className="px-4 py-3 border-b border-white/10">
              <span className="text-sm font-semibold text-white">Notifications</span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {mockNotifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-white/[0.03] transition-colors">
                  <p className={`text-xs leading-relaxed ${n.urgent ? 'text-amber-300' : 'text-slate-300'}`}>
                    {n.text}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-white/10">
              <button className="text-xs text-sky-400 hover:text-sky-300 transition-colors">Mark all as read</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
