import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc, getDocs, collection, query, where, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { isAdminEmail } from '@/config/roles';

const ADMIN_SECRET = process.env.ADMIN_SETUP_SECRET || 'civiceye_admin_secret_dev';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, role, secret } = body || {};

    if ((!uid || typeof uid !== 'string') && (!email || typeof email !== 'string')) {
      return NextResponse.json(
        { success: false, error: 'Field "uid" or "email" (string) is required.' },
        { status: 400 }
      );
    }

    if (role !== 'citizen' && role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Field "role" must be either "citizen" or "admin".' },
        { status: 400 }
      );
    }

    // Protect role elevation: verify admin setup secret or admin email match
    const isSecretValid = (secret && secret === ADMIN_SECRET) || isAdminEmail(email);

    if (!isSecretValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin setup credential.' },
        { status: 403 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firestore database is not initialized.' },
        { status: 500 }
      );
    }

    let targetUid = uid;
    if (!targetUid && email) {
      const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        targetUid = qSnap.docs[0].id;
      } else {
        return NextResponse.json(
          { success: false, error: `User with email "${email}" not found.` },
          { status: 404 }
        );
      }
    }

    const userRef = doc(db, 'users', targetUid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return NextResponse.json(
        { success: false, error: `User document for UID "${uid}" not found in Firestore.` },
        { status: 404 }
      );
    }

    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp(),
    });

    console.log(`[CivicEye Admin Authorization] Updated role for UID ${uid} -> ${role}`);

    return NextResponse.json({
      success: true,
      uid: targetUid,
      role,
      message: `User ${targetUid} successfully assigned role "${role}".`,
    });
  } catch (err: unknown) {
    console.error('[API /api/admin/set-role Error]:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Role update error' },
      { status: 500 }
    );
  }
}
