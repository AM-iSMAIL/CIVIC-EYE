'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ShieldX, LogIn, ArrowLeft, Radio } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { currentUser, firebaseUser, loading, isAdmin, isConfigured, signInWithGoogle } =
    useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20" />
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin flex items-center justify-center" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-wide">
              Verifying Clearance
            </h3>
            <p className="text-xs text-slate-400">
              Validating municipal operations security profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!firebaseUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-amber-800/40 bg-slate-900/95 shadow-2xl p-6 text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-950/40 border border-amber-700/50 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              Municipal Operations Clearance Required
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              The CivicEye Command Center is restricted to authorized municipal operators. Please sign in with your municipal credential to continue.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={signInWithGoogle}
              disabled={!isConfigured}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In with Google
            </Button>
            <Link href="/">
              <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Authenticated but Citizen Role (Access Denied)
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-rose-800/50 bg-slate-900/95 shadow-2xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/50 border border-rose-700/60 flex items-center justify-center text-rose-400 shadow-inner">
            <ShieldX className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-950/60 text-rose-400 border border-rose-800/60">
              <Radio className="w-3 h-3 animate-pulse" />
              Access Denied • 403 Forbidden
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Administrative Clearance Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your account (<span className="text-slate-100 font-mono font-medium">{currentUser?.email || firebaseUser.email}</span>) is currently registered with <span className="text-emerald-400 font-semibold uppercase text-xs">Citizen</span> privileges. Municipal operations and incident dispatch workflows require administrative clearance.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 text-left font-mono space-y-1">
            <div className="flex justify-between">
              <span>Account UID:</span>
              <span className="text-slate-300 truncate max-w-[200px]">{firebaseUser.uid}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Role:</span>
              <span className="text-emerald-400 font-semibold">{currentUser?.role || 'citizen'}</span>
            </div>
            <div className="flex justify-between">
              <span>Required Role:</span>
              <span className="text-rose-400 font-semibold">admin</span>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/map">
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Explore Civic Map
              </Button>
            </Link>
            <Link href="/report">
              <Button variant="outline">
                Submit Civic Report
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Authorized Admin
  return <>{children}</>;
};
