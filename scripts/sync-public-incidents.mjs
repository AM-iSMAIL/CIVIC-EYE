/**
 * CivicEye Development Migration Utility
 *
 * Synchronizes existing private test incidents into the sanitized publicIncidents collection
 * so they become immediately visible on the Phase 6 Google Map.
 *
 * Strips all reporter identity fields (uid, email, displayName, photoURL).
 * Run with: node scripts/sync-public-incidents.mjs
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Parse .env.local for Firebase Client configuration
const envPath = path.resolve(process.cwd(), '.env.local');
const envText = fs.readFileSync(envPath, 'utf-8');

function getEnv(key) {
  const match = envText.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : '';
}

const firebaseConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function sync() {
  console.log('----------------------------------------------------');
  console.log('CivicEye Development Migration: incidents -> publicIncidents');
  console.log('Project:', firebaseConfig.projectId);
  console.log('----------------------------------------------------');

  const incidentsSnap = await getDocs(collection(db, 'incidents'));
  console.log(`Found ${incidentsSnap.size} existing private incident documents.`);

  let syncedCount = 0;

  for (const docSnap of incidentsSnap.docs) {
    const data = docSnap.data();
    const id = docSnap.id;

    // Sanitize metadata - strictly NO reporter identity fields
    const publicPayload = {
      id: id,
      category: data.category || data.aiAnalysis?.category || 'other',
      severity: Number(data.aiAnalysis?.severity ?? 5),
      hazardLevel: data.aiAnalysis?.hazardLevel || 'medium',
      affectedUsers: data.aiAnalysis?.affectedUsers || [],
      description: data.aiAnalysis?.description || data.description || '',
      recommendedAction: data.aiAnalysis?.recommendedAction || '',
      latitude: Number(data.location?.latitude ?? 28.6139),
      longitude: Number(data.location?.longitude ?? 77.209),
      accuracy: Number(data.location?.accuracy ?? 0),
      status: data.status || 'reported',
      createdAt: data.createdAt || new Date(),
    };

    const publicRef = doc(db, 'publicIncidents', id);
    await setDoc(publicRef, publicPayload, { merge: true });
    syncedCount++;
    console.log(`✓ Synced publicIncidents/${id} [Category: ${publicPayload.category}, Severity: ${publicPayload.severity}]`);
  }

  console.log('----------------------------------------------------');
  console.log(`Migration Complete! Successfully synced ${syncedCount} public incident documents.`);
  console.log('These incidents are now live and visible on /map.');
  console.log('----------------------------------------------------');
}

sync().catch((err) => {
  console.error('[CivicEye Migration Error]:', err);
  process.exit(1);
});
