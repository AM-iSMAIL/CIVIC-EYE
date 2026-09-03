'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Eye } from 'lucide-react';
import { AdminGuard } from './AdminGuard';
import { AdminSidebar } from './AdminSidebar';
import { Button } from '@/components/common/Button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Mobile Navigation Header */}
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between sticky top-16 z-30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Command Center
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 h-auto text-slate-300"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-32 z-40 bg-slate-950/95 backdrop-blur-md p-4 flex flex-col animate-in fade-in duration-150">
            <div className="space-y-2 flex-1" onClick={() => setMobileMenuOpen(false)}>
              <Link
                href="/admin"
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname === '/admin'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                Overview
              </Link>
              <Link
                href="/admin/incidents"
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname.startsWith('/admin/incidents')
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                Incident Queue
              </Link>
              <Link
                href="/admin/map"
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname.startsWith('/admin/map')
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                Civic Map
              </Link>
              <Link
                href="/admin/analytics"
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname.startsWith('/admin/analytics')
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/admin"
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname === '/admin'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                Admin Hub
              </Link>
            </div>
          </div>
        )}

        {/* Desktop Body */}
        <div className="flex flex-1">
          {/* Desktop Sticky Sidebar */}
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
};
