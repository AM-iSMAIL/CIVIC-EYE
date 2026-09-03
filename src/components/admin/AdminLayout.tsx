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
      <div className="min-h-screen bg-[#fbfcfd] flex flex-col">
        {/* Mobile Navigation Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-16 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Eye className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-slate-950 uppercase tracking-wider">
              Command Center
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 h-auto text-slate-700"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-32 z-40 bg-white/95 backdrop-blur-md p-4 flex flex-col animate-in fade-in duration-150 border-b border-slate-200">
            <div className="space-y-2 flex-1" onClick={() => setMobileMenuOpen(false)}>
              <Link
                href="/admin"
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname === '/admin'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Overview
              </Link>
              <Link
                href="/admin/incidents"
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname.startsWith('/admin/incidents')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Incident Queue
              </Link>
              <Link
                href="/admin/map"
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname.startsWith('/admin/map')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Civic Map
              </Link>
              <Link
                href="/admin/analytics"
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname.startsWith('/admin/analytics')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/admin"
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname === '/admin'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
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
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 bg-[#fbfcfd]">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
};
