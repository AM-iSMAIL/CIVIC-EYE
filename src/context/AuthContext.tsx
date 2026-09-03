'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/services/firebase';
import {
  signInWithGoogle as doGoogleSignIn,
  signOutUser as doSignOut,
  mapFirebaseUser,
} from '@/services/auth';
import { syncUserToFirestore } from '@/services/firestore';
import type { CivicUser } from '@/types/user';

interface AuthContextValue {
  /** Mapped CivicEye domain user, null when signed out */
  currentUser: CivicUser | null;
  /** Raw Firebase Auth user object */
  firebaseUser: User | null;
  /** True while initial auth state is being determined */
  loading: boolean;
  /** True when Firebase environment keys are present */
  isConfigured: boolean;
  /** Whether the authenticated user possesses administrative clearance */
  isAdmin: boolean;
  /** User-friendly error message, null when no error */
  error: string | null;
  /** Trigger Google popup sign-in */
  signInWithGoogle: () => Promise<void>;
  /** Sign out the current user */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseConfigured();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<CivicUser | null>(null);
  const [loading, setLoading] = useState(() => Boolean(configured && auth));
  const [error, setError] = useState<string | null>(null);

  // Subscribe to Firebase Auth and Firestore user profile changes
  useEffect(() => {
    if (!configured || !auth) {
      return;
    }

    let userDocUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = null;
      }

      if (user) {
        // Initial optimistic mapping
        const baseUser = mapFirebaseUser(user);
        setCurrentUser(baseUser);

        // Sync user profile to Firestore
        await syncUserToFirestore(user);

        // Real-time listener for user role updates in Firestore users/{uid}
        if (db) {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            userDocUnsubscribe = onSnapshot(userDocRef, (snap) => {
              if (snap.exists()) {
                const data = snap.data();
                const role = data.role || 'citizen';
                setCurrentUser((prev) => (prev ? { ...prev, role } : { ...baseUser, role }));
              }
            });
          } catch (profileErr) {
            console.warn('[CivicEye Auth] Profile listener warning:', profileErr);
          }
        }
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
      setError(null);
    });

    return () => {
      authUnsubscribe();
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    };
  }, [configured]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const result = await doGoogleSignIn();

    if ('error' in result) {
      // Don't show error for popup cancellation
      if (result.error.code !== 'popup-cancelled') {
        setError(result.error.message);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    const result = await doSignOut();

    if (result.error) {
      setError(result.error.message);
    }
  }, []);

  const isAdmin = useMemo(() => {
    return currentUser?.role === 'admin';
  }, [currentUser?.role]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      firebaseUser,
      loading,
      isConfigured: configured,
      isAdmin,
      error,
      signInWithGoogle,
      signOut,
    }),
    [currentUser, firebaseUser, loading, configured, isAdmin, error, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access the auth context.
 * Must be used inside an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
