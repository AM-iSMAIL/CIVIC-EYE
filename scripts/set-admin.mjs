/**
 * CivicEye Admin Provisioning CLI Tool
 *
 * Promotes or demotes a user profile to 'admin' or 'citizen'.
 * Accepts UID or Email.
 *
 * Usage:
 *   node scripts/set-admin.mjs <uid_or_email> [admin|citizen]
 */

const target = process.argv[2];
const role = process.argv[3] || 'admin';

if (!target) {
  console.error('❌ Usage: node scripts/set-admin.mjs <uid_or_email> [admin|citizen]');
  process.exit(1);
}

const isEmail = target.includes('@');
const payload = isEmail
  ? { email: target, role, secret: 'civiceye_admin_secret_dev' }
  : { uid: target, role, secret: 'civiceye_admin_secret_dev' };

async function setRole() {
  console.log(`Setting role for ${isEmail ? 'Email' : 'UID'}: ${target} -> ${role}...`);
  try {
    const res = await fetch('http://localhost:3000/api/admin/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
