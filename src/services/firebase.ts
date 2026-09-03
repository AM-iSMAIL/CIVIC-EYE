/**
 * Firebase Client Initialization
 *
 * Centralized singleton for Firebase App, Auth, Firestore, and Cloud Storage.
 * All configuration is sourced exclusively from environment variables.
 * Never hardcode API keys or project credentials.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

/**
 * Returns true when the minimum required Firebase config values are present.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

/**
 * Singleton Firebase App instance.
 * Only initializes when configuration is available.
 */
function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;

  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = getFirebaseApp();

/**
 * Firebase Authentication instance.
 * Returns null when Firebase is not configured.
 */
export const auth: Auth | null = app ? getAuth(app) : null;

/**
 * Cloud Firestore instance.
 * Returns null when Firebase is not configured.
 */
export const db: Firestore | null = app ? getFirestore(app) : null;

/**
 * Firebase Cloud Storage instance.
 * Returns null when Firebase is not configured.
 */
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

export { app };
