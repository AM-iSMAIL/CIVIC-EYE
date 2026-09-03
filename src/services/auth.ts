/**
 * Firebase Authentication Service
 *
 * Provides Google Sign-In and Sign-Out functions with friendly error handling.
 * All Firebase access is via the centralized firebase.ts singleton.
 */
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import type { CivicUser } from '@/types/user';
import { isAdminEmail } from '@/config/roles';

const googleProvider = new GoogleAuthProvider();

export type AuthError =
  | { code: 'not-configured'; message: string }
  | { code: 'popup-cancelled'; message: string }
  | { code: 'unknown'; message: string };

/**
 * Sign in using Google popup.
 * Returns the Firebase User on success, or an AuthError on failure.
 */
export async function signInWithGoogle(): Promise<
  { user: User } | { error: AuthError }
> {
  if (!isFirebaseConfigured() || !auth) {
    return {
      error: {
        code: 'not-configured',
        message:
          'Firebase is not configured. Add your Firebase credentials to .env.local to enable authentication.',
      },
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (err: unknown) {
    const firebaseError = err as { code?: string; message?: string };

    if (
      firebaseError.code === 'auth/popup-closed-by-user' ||
      firebaseError.code === 'auth/cancelled-popup-request'
    ) {
      return {
        error: {
          code: 'popup-cancelled',
          message: 'Sign-in was cancelled. Please try again when ready.',
        },
      };
    }

    console.error('[CivicEye Auth] Sign-in error:', firebaseError.code);
    return {
      error: {
        code: 'unknown',
        message: 'Unable to complete sign-in. Please try again later.',
      },
    };
  }
}

/**
 * Sign out the current user.
 */
export async function signOutUser(): Promise<{ error?: AuthError }> {
  if (!auth) {
    return {
      error: {
        code: 'not-configured',
        message: 'Firebase is not configured.',
      },
    };
  }

  try {
    await firebaseSignOut(auth);
    return {};
  } catch (err: unknown) {
    console.error('[CivicEye Auth] Sign-out error:', err);
    return {
      error: {
        code: 'unknown',
        message: 'Unable to sign out. Please try again.',
      },
    };
  }
}

/**
 * Map a Firebase Auth User object to the CivicEye domain model.
 */
export function mapFirebaseUser(user: User): CivicUser {
  const role = isAdminEmail(user.email) ? 'admin' : 'citizen';
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber ?? null,
    photoURL: user.photoURL,
    role,
    createdAt: user.metadata.creationTime ?? new Date().toISOString(),
  };
}
