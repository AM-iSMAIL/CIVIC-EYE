export type UserRole = 'citizen' | 'field_officer' | 'admin' | 'dispatcher';

export interface CivicUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  role: UserRole;
  department?: string;
  badgeCount?: number;
  reportsSubmittedCount?: number;
  createdAt: string;
}

/**
 * Firestore document shape for users/{uid}.
 * Uses Firebase server timestamps for createdAt and lastLoginAt.
 */
export interface FirestoreUserDoc {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: unknown; // Firebase FieldValue (serverTimestamp)
  lastLoginAt: unknown; // Firebase FieldValue (serverTimestamp)
}
