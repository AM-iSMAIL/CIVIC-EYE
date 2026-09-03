'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

interface CitizenGuardProps {
  children: React.ReactNode;
}

/**
 * CitizenGuard — protects citizen-only routes (e.g. /my-reports, /notifications).
 *
 * Behaviour matrix:
 * - Loading            → silent spinner
 * - Unauthenticated    → sign-in prompt (redirect to /login)
 * - Admin              → hard redirect to /admin
 * - Citizen            → render children
 */
export const CitizenGuard: React.FC<CitizenGuardProps> = ({ children }) => {
  const { currentUser, firebaseUser, loading, isAdmin, isConfigured, signInWithGoogle } =
    useAuth();
  const router = useRouter();

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (!loading && firebaseUser && isAdmin) {
      router.replace('/admin');
    }
    // Redirect unauthenticated users to login
    if (!loading && !firebaseUser) {
      router.replace('/login');
    }
  }, [loading, firebaseUser, isAdmin, router]);

  // 1. Loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated — redirect is in progress, show sign-in as fallback
  if (!firebaseUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-slate-700/60 bg-slate-900/95 shadow-xl p-6 text-center space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Sign In Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please sign in to access this page.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={signInWithGoogle}
            disabled={!isConfigured}
            leftIcon={<LogIn className="w-4 h-4" />}
            className="w-full"
          >
            Sign In with Google
          </Button>
        </Card>
      </div>
    );
  }

  // 3. Admin — redirect is firing, show silent loader
  if (isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500 mx-auto" />
          <p className="text-xs text-slate-500">Redirecting to Admin Hub...</p>
        </div>
      </div>
    );
  }

  // 4. Authenticated Citizen — render page
  return <>{children}</>;
};
