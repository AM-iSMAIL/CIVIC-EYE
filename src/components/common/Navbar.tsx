'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/context/AuthContext';
import {
  Eye,
  PlusCircle,
  Map,
  Shield,
  Home,
  Menu,
  X,
  Activity,
  LogIn,
  LogOut,
  User,
  Loader2,
} from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, loading, signInWithGoogle, signOut } = useAuth();

  const getNavIcon = (href: string) => {
    switch (href) {
      case '/':
        return <Home className="w-4 h-4" />;
      case '/report':
        return <PlusCircle className="w-4 h-4" />;
      case '/map':
        return <Map className="w-4 h-4" />;
      case '/admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const renderUserSection = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      );
    }

    if (currentUser) {
      return (
        <div className="flex items-center gap-3">
          {/* User Avatar & Name */}
          <div className="flex items-center gap-2">
            {currentUser.photoURL ? (
              <Image
                src={currentUser.photoURL}
                alt={currentUser.displayName ?? 'User avatar'}
                width={28}
                height={28}
                unoptimized
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-slate-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
            <span className="text-xs text-slate-300 font-medium max-w-[100px] truncate hidden lg:inline">
              {currentUser.displayName ?? currentUser.email ?? 'Citizen'}
            </span>
          </div>

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
      <Button
        variant="outline"
        size="sm"
        onClick={signInWithGoogle}
        leftIcon={<LogIn className="w-3.5 h-3.5 text-emerald-400" />}
      >
        Sign in
      </Button>
    );
  };

  const renderMobileUserSection = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Checking credentials...</span>
        </div>
      );
    }

    if (currentUser) {
      return (
        <div className="space-y-3">
          {/* User Profile Row */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
            {currentUser.photoURL ? (
              <Image
                src={currentUser.photoURL}
                alt={currentUser.displayName ?? 'User avatar'}
                width={32}
                height={32}
                unoptimized
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-slate-600"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm text-white font-medium block truncate">
                {currentUser.displayName ?? 'Citizen'}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {currentUser.email ?? ''}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
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
      <Button
        variant="outline"
        size="md"
        className="w-full"
        onClick={() => {
          signInWithGoogle();
          setIsOpen(false);
        }}
        leftIcon={<LogIn className="w-4 h-4 text-emerald-400" />}
      >
        Sign in with Google
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Eye className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Civic<span className="text-emerald-400">Eye</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                AI Urban Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {siteConfig.navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
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
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <nav className="space-y-1" aria-label="Mobile Navigation">
            {siteConfig.navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
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

          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <Link href="/report" onClick={() => setIsOpen(false)} className="block w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Report an Issue Now
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
