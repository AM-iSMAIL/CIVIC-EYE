'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { currentUser, firebaseUser, loading, isAdmin, isConfigured, signInWithGoogle } =
    useAuth();
  const router = useRouter();

  // Hard-redirect citizens away from admin routes.
  // This runs after auth resolves so we don't flicker.
  useEffect(() => {
    if (!loading && firebaseUser && !isAdmin) {
      router.replace('/');
    }
  }, [loading, firebaseUser, isAdmin, router]);

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

  // 2. Unauthenticated — prompt sign-in
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
          </div>
        </Card>
      </div>
    );
  }

  // 3. Authenticated but Citizen — redirect is in progress (useEffect above).
  // Render a silent loading state while the redirect fires to prevent flash.
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500 mx-auto" />
          <p className="text-xs text-slate-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin
  return <>{children}</>;
};
