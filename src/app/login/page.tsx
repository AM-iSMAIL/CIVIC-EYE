'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CivicEyeLogo } from '@/components/splash/CivicEyeLogo';
import { Loader2, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, loading, signInWithGoogle, isConfigured, error: authError, isAdmin } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isRouting, setIsRouting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Route user deterministically based on their verified role
  const routeUserByRole = useCallback(
    async (roleOverride?: string) => {
      setIsRouting(true);
      try {
        let role = roleOverride;

        // If no explicit override passed, query Firestore for highest accuracy
        if (!role && auth?.currentUser && db) {
          try {
            const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (snap.exists()) {
              role = snap.data()?.role;
            }
          } catch {
            // Fallback to context if query fails
            role = currentUser?.role;
          }
        }

        const targetIsAdmin = role === 'admin' || isAdmin;
        if (targetIsAdmin) {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      } catch {
        router.replace('/');
      }
    },
    [currentUser?.role, isAdmin, router]
  );

  // If already authenticated on arrival, automatically route to appropriate workspace
  useEffect(() => {
    if (!loading && currentUser) {
      routeUserByRole(currentUser.role);
    }
  }, [loading, currentUser, routeUserByRole]);

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();

      // Immediately verify role from Firestore document to avoid stale cache or race condition
      if (auth?.currentUser && db) {
        const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const role = snap.exists() ? snap.data()?.role : 'citizen';
        await routeUserByRole(role);
      } else {
        await routeUserByRole();
      }
    } catch (err: unknown) {
      console.error('[CivicEye Auth] Sign-in error:', err);
      setLocalError(err instanceof Error ? err.message : 'Authentication could not be completed.');
      setIsSigningIn(false);
      setIsRouting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen w-full bg-[#fcfdfd] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      {/* Precision Class AI Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0f172a 1px, transparent 1px),
            linear-gradient(to bottom, #0f172a 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Subtle Radial Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] bg-gradient-to-tr from-blue-500/[0.04] via-cyan-500/[0.02] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Minimal Top-Left Brand Mark */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-20 flex items-center gap-3">
        <CivicEyeLogo size={32} />
        <div className="flex flex-col">
          <span className="font-extrabold text-sm tracking-[0.14em] text-slate-950 leading-tight uppercase">
            CIVIC EYE
          </span>
          <span className="text-[9px] font-medium tracking-[0.18em] uppercase text-slate-400">
            AI URBAN INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Centered Authentication Card */}
      <main className="relative z-10 w-full max-w-[420px] mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-11 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)]">
          {/* Subtle Logo Badge */}
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50/80 border border-blue-100/80 flex items-center justify-center mb-6 text-blue-600 shadow-sm">
            <CivicEyeLogo size={28} />
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-950 tracking-tight">
              Civic Identity
            </h1>
            <p className="text-sm text-slate-500 font-normal leading-relaxed">
              Your verified connection to the city.
            </p>
          </div>

          {/* Error Alert */}
          {displayError && (
            <div className="mt-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200/70 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{displayError}</span>
            </div>
          )}

          {/* Unconfigured Alert */}
          {!isConfigured && (
            <div className="mt-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Authentication configuration is pending.</span>
            </div>
          )}

          {/* Action Area */}
          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn || isRouting || !isConfigured}
              className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-sm font-semibold shadow-sm hover:shadow transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSigningIn || isRouting ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {isRouting
                  ? 'Connecting to workspace...'
                  : isSigningIn
                  ? 'Verifying credential...'
                  : 'Continue with Google'}
              </span>
            </button>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Secure authentication via Google. No passwords stored.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
