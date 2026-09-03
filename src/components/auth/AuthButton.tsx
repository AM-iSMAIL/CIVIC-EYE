'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

interface AuthButtonProps {
  /** Display variant: 'full' shows label text, 'compact' is icon-only */
  variant?: 'full' | 'compact';
  className?: string;
}

/**
 * Reusable authentication button.
 * Shows "Sign in with Google" when logged out, and "Sign out" when logged in.
 */
export const AuthButton: React.FC<AuthButtonProps> = ({
  variant = 'full',
  className = '',
}) => {
  const { currentUser, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-400 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        {variant === 'full' && <span>Loading...</span>}
      </div>
    );
  }

  if (currentUser) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        leftIcon={<LogOut className="w-4 h-4" />}
        className={className}
      >
        {variant === 'full' ? 'Sign out' : ''}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={signInWithGoogle}
      leftIcon={<LogIn className="w-4 h-4 text-emerald-400" />}
      className={className}
    >
      {variant === 'full' ? 'Sign in' : ''}
    </Button>
  );
};
