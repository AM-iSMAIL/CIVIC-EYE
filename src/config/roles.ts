/**
 * Admin & Role Configuration
 */

export const DEFAULT_ADMIN_EMAILS = [
  'amismail164@gmail.com',
];

/**
 * Checks if a given email has administrative clearance.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();

  // Check default hardcoded list
  if (DEFAULT_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized)) {
    return true;
  }

  // Check environment variables
  const envAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
  const parsedEnvAdmins = envAdmins
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return parsedEnvAdmins.includes(normalized);
}
