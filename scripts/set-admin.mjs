/**
 * CivicEye Admin Provisioning CLI Tool
 *
 * Promotes or demotes a Firestore user profile to 'admin' or 'citizen'.
 *
 * Usage:
 *   node scripts/set-admin.mjs <uid> [admin|citizen]
 */

const uid = process.argv[2];
const role = process.argv[3] || 'admin';

if (!uid) {
  console.error('❌ Usage: node scripts/set-admin.mjs <uid> [admin|citizen]');
  process.exit(1);
}

async function setRole() {
  console.log(`Setting role for UID: ${uid} -> ${role}...`);
  try {
    const res = await fetch('http://localhost:3000/api/admin/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, role, secret: 'civiceye_admin_secret_dev' }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      console.log(`✓ SUCCESS: ${data.message}`);
    } else {
      console.error(`❌ ERROR (${res.status}):`, data.error || data);
    }
  } catch (err) {
    console.error('❌ Failed to connect to server. Ensure Next.js dev server is running:', err.message);
  }
}

setRole();
