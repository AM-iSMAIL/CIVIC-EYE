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
      icon: <MapPin className="w-4 h-4 text-blue-600" />,
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: 'Admin Hub',
      href: '/admin/hub',
      icon: <Flame className="w-4 h-4 text-rose-500" />,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Top Header / Branding */}
      <div className="p-4 space-y-4">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-slate-950 uppercase block">
                Command Center
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
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
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Admin Profile & Sign Out */}
      <div className="p-4 border-t border-slate-200/80 space-y-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900 truncate block">
                {currentUser?.displayName || 'Municipal Admin'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono truncate block">
              {currentUser?.email}
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            Admin
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="w-full text-xs text-slate-600 hover:text-rose-600 hover:border-rose-300 justify-center"
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
        >
          Sign Out of Console
        </Button>
      </div>
    </aside>
  );
};
