'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Flame,
  MapPin,
  BarChart3,
  ShieldCheck,
  LogOut,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, signOut } = useAuth();

  const navItems: NavItem[] = [
    {
      label: 'Overview',
      href: '/admin',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Incident Queue',
      href: '/admin/incidents',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: 'Live',
    },
    {
      label: 'Civic Map',
      href: '/admin/map',
      icon: <MapPin className="w-4 h-4 text-cyan-400" />,
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: 'Admin Hub',
      href: '/admin',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Top Header / Branding */}
      <div className="p-4 space-y-4">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-white uppercase block">
                Command Center
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Civic Operations
              </span>
            </div>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Admin Profile & Sign Out */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-white truncate block">
                {currentUser?.displayName || 'Municipal Admin'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono truncate block">
              {currentUser?.email}
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
            Admin
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="w-full text-xs text-slate-400 hover:text-rose-400 hover:border-rose-900 justify-center"
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
        >
          Sign Out of Console
        </Button>
      </div>
    </aside>
  );
};
