/**
 * Firestore Service
 *
 * Handles Firestore document operations for CivicEye.
 * Manages user profile synchronization (users/{uid}) and
 * Phase 5 persistent incident creation (incidents/{incidentId}).
 */
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { type User } from 'firebase/auth';
import { db, auth } from './firebase';
import {
  type IncidentCreateInput,
  type IncidentReport,
  type PublicIncidentDocument,
  type IssueStatus,
  validateIncidentPayload,
} from '@/types/incident';
import { isAdminEmail } from '@/config/roles';

// Local storage key for fallback when Firestore is unconfigured
const LOCAL_INCIDENTS_KEY = 'civiceye_local_incidents';

function getLocalIncidents(): IncidentReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_INCIDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalIncidents(incidents: IncidentReport[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_INCIDENTS_KEY, JSON.stringify(incidents));
  } catch (e) {
    console.error('[CivicEye Firestore] Failed to save local incidents:', e);
  }
}

/**
 * Sync a Firebase Auth user to the Firestore users/{uid} document.
 */
export async function syncUserToFirestore(
  user: User,
  intendedRole?: 'admin' | 'citizen'
): Promise<void> {
  if (!db) {
    console.warn('[CivicEye Firestore] Firestore not configured. Skipping user sync.');
    return;
  }

  const userRef = doc(db, 'users', user.uid);

  try {
    const snapshot = await getDoc(userRef);
    const isNewUser = !snapshot.exists();
    const isUserAdmin = isAdminEmail(user.email) || intendedRole === 'admin';

    await setDoc(
      userRef,
      {
        uid: user.uid,
        displayName: user.displayName ?? null,
        email: user.email ?? null,
        photoURL: user.photoURL ?? null,
        lastLoginAt: serverTimestamp(),
        role: isUserAdmin ? 'admin' : (snapshot.data()?.role || 'citizen'),
        ...(isNewUser && {
          createdAt: serverTimestamp(),
        }),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('[CivicEye Firestore] User sync error:', err);
  }
}

/**
 * Phase 5: Create a persistent civic incident document in Firestore.
 * Collection: incidents/{incidentId}
 *
 * Uses Firestore auto-generated ID (addDoc), binds to auth.currentUser,
 * and records authoritative browser GPS + AI analysis.
 * Stores strictly metadata; ZERO image data or storage URLs.
 *
 * @param input IncidentCreateInput
 * @returns The Firestore generated document ID
 */
export async function createIncident(input: IncidentCreateInput): Promise<string> {
  // 1. Verify authentication against active Firebase Auth instance
  const currentUser = auth?.currentUser;
  if (!currentUser) {
    throw new Error('You need to sign in before submitting a report.');
  }

  // 2. Validate payload bounds & required fields
  const validation = validateIncidentPayload(input);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid incident report payload.');
  }

  // 3. Verify Firestore connection
  if (!db) {
    throw new Error('Firestore is not configured. Please check your environment.');
  }

  try {
    // 4. Construct strictly metadata payload (NO images, NO base64, NO Blobs, NO URLs)
    const incidentPayload = {
      reporter: {
        uid: currentUser.uid,
        displayName: currentUser.displayName ?? input.reporter.displayName ?? null,
        email: currentUser.email ?? input.reporter.email ?? null,
        photoURL: currentUser.photoURL ?? input.reporter.photoURL ?? null,
      },
      category: input.category,
      aiAnalysis: {
        category: input.aiAnalysis.category,
        severity: input.aiAnalysis.severity,
        confidence: input.aiAnalysis.confidence,
        hazardLevel: input.aiAnalysis.hazardLevel,
        affectedUsers: input.aiAnalysis.affectedUsers,
        description: input.aiAnalysis.description,
        recommendedAction: input.aiAnalysis.recommendedAction,
      },
      userConfirmation: {
        confirmed: input.userConfirmation.confirmed,
        categoryOverride: input.userConfirmation.categoryOverride ?? null,
      },
      location: {
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        accuracy: input.location.accuracy,
        capturedAt: Timestamp.fromMillis(input.location.capturedAt),
      },
      status: 'reported' as const,
      createdAt: serverTimestamp(),
    };

    // 5. Create document reference
    const incidentRef = doc(collection(db, 'incidents'));
    const incidentId = incidentRef.id;

    // 6. Write private full report to incidents/{incidentId}
    await setDoc(incidentRef, {
      ...incidentPayload,
      id: incidentId,
    });

    // 7. Write sanitized public document to publicIncidents/{incidentId}
    // Strictly map-safe: NO reporter.uid, NO email, NO displayName, NO photoURL, NO images
    try {
      const publicRef = doc(db, 'publicIncidents', incidentId);
      const publicPayload: PublicIncidentDocument = {
        id: incidentId,
        category: input.category,
        severity: input.aiAnalysis.severity,
        hazardLevel: input.aiAnalysis.hazardLevel,
        affectedUsers: input.aiAnalysis.affectedUsers,
        description: input.aiAnalysis.description,
        recommendedAction: input.aiAnalysis.recommendedAction || '',
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        accuracy: input.location.accuracy,
        status: 'reported',
        createdAt: serverTimestamp(),
      };
      await setDoc(publicRef, publicPayload);
    } catch (pubErr) {
      console.warn(
        '[CivicEye Firestore] Public incident sync notice (update rules in Firebase Console):',
        pubErr
      );
    }

    return incidentId;
  } catch (err: unknown) {
    console.error('[CivicEye Firestore Create Error]:', err);
    const errorObj = err as { code?: string; message?: string };

    if (errorObj.code === 'permission-denied') {
      throw new Error("You don't have permission to submit this report.");
    }
    if (errorObj.code === 'unavailable' || errorObj.message?.includes('network')) {
      throw new Error("Couldn't submit your report. Check your connection and try again.");
    }

    throw new Error('Something went wrong while submitting your report.');
  }
}

/**
 * Phase 6: Fetch sanitized public incidents for Google Map rendering.
 * Does NOT expose reporter identity or private incident metadata.
 */
export async function getPublicIncidents(
  limitCount = 100
): Promise<PublicIncidentDocument[]> {
  if (!db) return [];

  try {
    const publicRef = collection(db, 'publicIncidents');
    const q = query(publicRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as PublicIncidentDocument),
      id: docSnap.id,
    }));
  } catch (err) {
    console.error('[CivicEye Firestore] Get public incidents error:', err);
    return [];
  }
}

/**
 * Phase 6: Realtime listener for sanitized public incidents.
 * Automatically pushes new civic reports to the map without full page reload.
 */
export function subscribeToPublicIncidents(
  callback: (incidents: PublicIncidentDocument[]) => void,
  limitCount = 100
): Unsubscribe {
  if (!db) {
    callback([]);
    return () => {};
  }

  const publicRef = collection(db, 'publicIncidents');
  const q = query(publicRef, orderBy('createdAt', 'desc'), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const incidents = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as PublicIncidentDocument),
        id: docSnap.id,
      }));
      callback(incidents);
    },
    async (err) => {
      console.warn('[CivicEye Firestore] Public incidents subscription notice:', err);
      // Fallback: If publicIncidents rules not yet published in console, load user's authentic incidents
      const currentUser = auth?.currentUser;
      if (currentUser && db) {
        try {
          const userIncidentsRef = collection(db, 'incidents');
          const userQ = query(
            userIncidentsRef,
            where('reporter.uid', '==', currentUser.uid),
            limit(limitCount)
          );
          const snap = await getDocs(userQ);
          const sanitized = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              category: data.category || data.aiAnalysis?.category || 'other',
              severity: Number(data.aiAnalysis?.severity ?? 5),
              hazardLevel: data.aiAnalysis?.hazardLevel || 'medium',
              affectedUsers: data.aiAnalysis?.affectedUsers || [],
              description: data.aiAnalysis?.description || '',
              recommendedAction: data.aiAnalysis?.recommendedAction || '',
              latitude: Number(data.location?.latitude ?? 28.6139),
              longitude: Number(data.location?.longitude ?? 77.209),
              accuracy: Number(data.location?.accuracy ?? 0),
              status: data.status || 'reported',
              createdAt: data.createdAt,
            } as PublicIncidentDocument;
          });
          callback(sanitized);
        } catch (fbErr) {
          console.warn('[CivicEye Firestore] Fallback error:', fbErr);
          callback([]);
        }
      } else {
        callback([]);
      }
    }
  );
}

/**
 * Phase 6: Safe development backfill of user's own existing incidents to publicIncidents.
 * Ensures previously created reports (e.g. from Phase 5) are rendered on the map.
 */
export async function syncUserIncidentsToPublic(): Promise<number> {
  const currentUser = auth?.currentUser;
  if (!db || !currentUser) return 0;

  try {
    const userIncidentsRef = collection(db, 'incidents');
    const q = query(userIncidentsRef, where('reporter.uid', '==', currentUser.uid));
    const snapshot = await getDocs(q);

    let synced = 0;
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const id = docSnap.id;

      const publicRef = doc(db, 'publicIncidents', id);
      const publicSnap = await getDoc(publicRef);

      if (!publicSnap.exists()) {
        const publicPayload: PublicIncidentDocument = {
          id,
          category: data.category || data.aiAnalysis?.category || 'other',
          severity: Number(data.aiAnalysis?.severity ?? 5),
          hazardLevel: data.aiAnalysis?.hazardLevel || 'medium',
          affectedUsers: data.aiAnalysis?.affectedUsers || [],
          description: data.aiAnalysis?.description || '',
          recommendedAction: data.aiAnalysis?.recommendedAction || '',
          latitude: Number(data.location?.latitude ?? 28.6139),
          longitude: Number(data.location?.longitude ?? 77.209),
          accuracy: Number(data.location?.accuracy ?? 0),
          status: data.status || 'reported',
          createdAt: data.createdAt || serverTimestamp(),
        };
        await setDoc(publicRef, publicPayload);
        synced++;
      }
    }
    return synced;
  } catch (err) {
    console.warn('[CivicEye Firestore] syncUserIncidentsToPublic notice:', err);
    return 0;
  }
}

/**
 * Fetch all incidents from Firestore.
 */
export async function getIncidents(): Promise<IncidentReport[]> {
  if (!db) {
    return getLocalIncidents();
  }

  try {
    const incidentsRef = collection(db, 'incidents');
    const q = query(incidentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as IncidentReport;
      return {
        ...data,
        id: docSnap.id,
      };
    });
  } catch (err) {
    console.error('[CivicEye Firestore] Get incidents error, using local fallback:', err);
    return getLocalIncidents();
  }
}

/**
 * Real-time listener for incidents collection.
 * Calls callback whenever the collection changes.
 */
export function subscribeToIncidents(
  callback: (incidents: IncidentReport[]) => void
): Unsubscribe {
  if (!db) {
    callback(getLocalIncidents());
    // Polling local storage changes for cross-tab or in-tab updates
    const handleStorage = () => callback(getLocalIncidents());
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }

  const incidentsRef = collection(db, 'incidents');
  const q = query(incidentsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const incidents = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as IncidentReport),
        id: docSnap.id,
      }));
      callback(incidents);
    },
    (err) => {
      console.error('[CivicEye Firestore] Subscription error, falling back to local:', err);
      callback(getLocalIncidents());
    }
  );
}

/**
 * Update the status of an incident (e.g. from Admin Dashboard).
 */
export async function updateIncidentStatus(
  incidentId: string,
  newStatus: IssueStatus
): Promise<void> {
  const nowIso = new Date().toISOString();

  if (!db) {
    const list = getLocalIncidents().map((inc) =>
      inc.id === incidentId ? { ...inc, status: newStatus, updatedAt: nowIso } : inc
    );
    saveLocalIncidents(list);
    return;
  }

  try {
    const docRef = doc(db, 'incidents', incidentId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: nowIso,
      updatedAtServer: serverTimestamp(),
    });
  } catch (err) {
    console.error('[CivicEye Firestore] Update status error, updating local:', err);
    const list = getLocalIncidents().map((inc) =>
      inc.id === incidentId ? { ...inc, status: newStatus, updatedAt: nowIso } : inc
    );
    saveLocalIncidents(list);
  }
}
