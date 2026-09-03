'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CivicEyeLogo } from '@/components/splash/CivicEyeLogo';
import { CivicEyeSplashScreen } from '@/components/splash/CivicEyeSplashScreen';
import { Button } from '@/components/common/Button';
import { ArrowRight, ShieldCheck, MapPin, Sparkles, Loader2, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser: user, signInWithGoogle, isConfigured, error, isAdmin } = useAuth();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  // If user is already authenticated
  if (user && !showSplash) {
    return (
      <div className="min-h-screen bg-[#ffffff] text-slate-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Subtle Class AI Precision Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0f172a 1px, transparent 1px),
              linear-gradient(to bottom, #0f172a 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-md w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="flex justify-center mb-2">
            <CivicEyeLogo size={64} />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Authenticated Session
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome, {user.displayName || 'Citizen'}
            </h2>
            <p className="text-sm text-slate-500 font-sans">
              Signed in as <span className="font-mono text-slate-800">{user.email}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm space-y-3 text-left">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Account Role</span>
              <span className={`font-mono font-bold uppercase ${isAdmin ? 'text-cyan-600' : 'text-emerald-600'}`}>
                {isAdmin ? 'Municipal Administrator' : 'Citizen Reporter'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Civic Operations</span>
              <span className="text-slate-800 font-medium">Ready</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {isAdmin && (
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium"
                onClick={() => router.push('/admin')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Access Command Center
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => router.push('/report')}
              leftIcon={<Sparkles className="w-4 h-4 text-blue-600" />}
            >
              Report New Incident
            </Button>

            <Button
              variant="ghost"
              size="md"
              className="w-full text-slate-500 hover:text-slate-800"
              onClick={() => router.push('/map')}
              leftIcon={<MapPin className="w-4 h-4" />}
            >
              Explore Public Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* 1. First Screen: CivicEye Loading / Splash Screen */}
      {showSplash && <CivicEyeSplashScreen onComplete={handleSplashComplete} />}

      {/* Subtle Class AI Precision Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0f172a 1px, transparent 1px),
            linear-gradient(to bottom, #0f172a 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <CivicEyeLogo size={32} />
          <span className="font-extrabold text-base tracking-[0.14em] text-slate-900">
            CIVICEYE
          </span>
        </Link>

        <Link
          href="/map"
          className="text-xs font-semibold tracking-wider uppercase text-slate-500 hover:text-blue-600 transition-colors"
        >
          Public Map &rarr;
        </Link>
      </header>

      {/* Main Centered Login / Identity Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-1">
              <CivicEyeLogo size={56} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Civic Identity
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                Sign in to submit verified municipal reports, track infrastructure repairs, and dispatch civic resolutions.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Not Configured Alert */}
          {!isConfigured && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Firebase environment variables are not configured in Vercel.</span>
            </div>
          )}

          {/* Google Sign In Action */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn || !isConfigured}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-sm font-semibold shadow-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isSigningIn ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{isSigningIn ? 'Connecting to Identity...' : 'Continue with Google'}</span>
            </button>

            <p className="text-[11px] text-center text-slate-400 leading-normal">
              Secure OAuth2 authentication via Google. No passwords stored.
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative px-3 bg-white text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Or Explore Publicly
            </span>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/map"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Live Map</span>
            </Link>

            <Link
              href="/report"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Report Issue</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 text-center text-[11px] text-slate-400 font-mono tracking-wider">
        CIVICEYE &bull; AUTONOMOUS URBAN INTELLIGENCE &bull; PHASE 8
      </footer>
    </div>
  );
}
