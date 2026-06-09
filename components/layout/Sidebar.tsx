'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  FileText,
  Settings,
  HelpCircle,
  Menu,
  Sparkles,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Stakeholders', icon: Users, href: '/stakeholders' },
  { label: 'Engagements', icon: Calendar, href: '/engagements' },
  { label: 'Opportunities', icon: Briefcase, href: '/opportunities' },
  { label: 'Follow-Ups', icon: Calendar, href: '/followups' },
  { label: 'Documents', icon: FileText, href: '/documents' },
  { label: 'Import Wizard', icon: Upload, href: '/import' },
];

const BOTTOM_NAV_ITEMS = [
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Help & Support', icon: HelpCircle, href: '/help' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-[#0B1121] border-r border-white/[0.06] transition-all duration-300 relative',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 left-0 w-full h-48 bg-sky-500/5 blur-[50px] pointer-events-none" />

      {/* Collapse toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-[#1E293B] border border-white/10 rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Logo / Brand */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]', collapsed && 'justify-center px-0')}>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-[0_0_15px_rgba(14,165,233,0.3)] border border-white/20">
          <img src="/logo.jpg" alt="Uzury Empowerment Hub" className="h-full w-full object-contain mix-blend-multiply" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-white leading-tight">Uzury Hub</div>
            <div className="text-[10px] text-sky-400/80 font-medium uppercase tracking-widest">Platform</div>
          </div>
        )}
      </div>

      {/* Main nav */}
      <div className="flex-1 overflow-y-auto scrollbar-none py-4 px-3 space-y-1 relative z-10">
        <div className={cn('mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider', collapsed && 'sr-only')}>
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all group relative',
                isActive 
                  ? 'bg-sky-500/10 text-sky-400' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-400 rounded-r-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
              )}
              <item.icon className={cn('h-5 w-5 shrink-0 transition-transform group-hover:scale-110', isActive && 'text-sky-400')} />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div className="p-3 border-t border-white/[0.06] space-y-1 relative z-10">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all group',
                isActive 
                  ? 'bg-sky-500/10 text-sky-400' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-300',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
