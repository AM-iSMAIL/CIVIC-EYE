'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { ShieldAlert, LogIn, AlertTriangle } from 'lucide-react';

interface AuthRequiredCardProps {
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Displayed when an unauthenticated user visits a protected page.
 * Shows a professional message and provides a Google Sign-In button.
 */
export const AuthRequiredCard: React.FC<AuthRequiredCardProps> = ({
  title = 'Authentication Required',
  description = 'You need to sign in with your Google account to access this feature. Your identity helps us verify civic reports and track resolution progress.',
  className = '',
}) => {
  const { signInWithGoogle, isConfigured, error } = useAuth();

  return (
    <div className={`flex items-center justify-center min-h-[60vh] px-4 ${className}`}>
      <Card className="max-w-md w-full border-slate-800 bg-slate-900/90">
        <CardContent className="p-8 sm:p-10 text-center space-y-5">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>

          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Not Configured Warning */}
          {!isConfigured && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Firebase is not configured yet. Add your Firebase credentials to{' '}
                <code className="text-amber-200 font-mono">.env.local</code> to enable
                authentication.
              </span>
            </div>
          )}

          {/* Sign In Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={signInWithGoogle}
            leftIcon={<LogIn className="w-5 h-5" />}
            disabled={!isConfigured}
          >
            Sign in with Google
          </Button>

          <p className="text-[11px] text-slate-500">
            By signing in, you agree to help improve civic infrastructure in your community.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
