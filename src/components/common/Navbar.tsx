'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/context/AuthContext';
import {
  PlusCircle,
  Map,
  Home,
  Menu,
  X,
  Activity,
  LogIn,
  LogOut,
  User,
  Loader2,
  FileText,
  Bell,
  UserCircle2,
} from 'lucide-react';
import { Button } from './Button';
import { CivicEyeLogo } from '@/components/splash/CivicEyeLogo';

/** Maps citizen nav hrefs to their lucide icon. */
const getNavIcon = (href: string) => {
  switch (href) {
    case '/':
      return <Home className="w-4 h-4" />;
    case '/report':
      return <PlusCircle className="w-4 h-4" />;
    case '/map':
      return <Map className="w-4 h-4" />;
    case '/my-reports':
      return <FileText className="w-4 h-4" />;
    case '/notifications':
      return <Bell className="w-4 h-4" />;
    case '/profile':
      return <UserCircle2 className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, loading, signInWithGoogle, signOut } = useAuth();

  // Always use citizen nav items — this Navbar is never shown on /admin/* routes
  const navItems = siteConfig.citizenNavItems;

  /* ── Desktop User Section ── */
  const renderUserSection = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        </div>
      );
    }

    if (currentUser) {
      return (
        <div className="flex items-center gap-3">
          {/* User Avatar & Name */}
          <Link
            href="/profile"
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {currentUser.photoURL ? (
              <Image
                src={currentUser.photoURL}
                alt={currentUser.displayName ?? 'User avatar'}
                width={28}
                height={28}
                unoptimized
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-slate-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}
            <span className="text-xs text-slate-700 font-medium max-w-[110px] truncate hidden lg:inline">
              {currentUser.displayName ?? currentUser.email ?? 'Citizen'}
            </span>
          </Link>

          {/* Sign Out */}
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign out
          </Button>
        </div>
      );
    }

    return (
      <Link href="/login">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<LogIn className="w-3.5 h-3.5 text-blue-600" />}
        >
          Sign in
        </Button>
      </Link>
    );
  };

  /* ── Mobile User Section ── */
  const renderMobileUserSection = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Verifying identity...</span>
        </div>
      );
    }

    if (currentUser) {
      return (
        <div className="space-y-3">
          {/* User Profile Row */}
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
          >
            {currentUser.photoURL ? (
              <Image
                src={currentUser.photoURL}
                alt={currentUser.displayName ?? 'User avatar'}
                width={32}
                height={32}
                unoptimized
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm text-slate-900 font-semibold block truncate">
                {currentUser.displayName ?? 'Citizen'}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                {currentUser.email ?? ''}
              </span>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-slate-600 hover:text-slate-900"
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign out
          </Button>
        </div>
      );
    }

    return (
      <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full">
        <Button
          variant="outline"
          size="md"
          className="w-full justify-center"
          leftIcon={<LogIn className="w-4 h-4 text-blue-600" />}
        >
          Sign in with Google
        </Button>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1"
          >
            <CivicEyeLogo size={32} />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-950 flex items-center gap-1.5">
                CIVIC<span className="text-blue-600">EYE</span>
              </span>
              <span className="text-[9px] text-slate-400 font-medium tracking-[0.16em] uppercase">
                AI Urban Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Citizen Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {getNavIcon(item.href)}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions: Report CTA + User Section */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/report">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Report Issue
              </Button>
            </Link>

            {/* Auth State */}
            {renderUserSection()}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200 shadow-lg">
          <nav className="space-y-1" aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {getNavIcon(item.href)}
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <Link href="/report" onClick={() => setIsOpen(false)} className="block w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Report an Issue
              </Button>
            </Link>

            {/* Mobile Auth Section */}
            {renderMobileUserSection()}
          </div>
        </div>
      )}
    </header>
  );
};
