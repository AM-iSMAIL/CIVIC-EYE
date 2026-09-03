/**
 * Firebase Cloud Storage Service
 *
 * Provides operations for uploading incident photos and resolving download URLs.
 * Includes graceful fallback if storage is unconfigured or encounters quota issues.
 */
import { ref, uploadBytes, getDownloadURL, type StorageReference } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Returns true when Firebase Storage is initialized and available.
 */
export function isStorageAvailable(): boolean {
  return storage !== null;
}

/**
 * Get a storage reference for a given path.
 * Returns null if storage is not configured.
 */
export function getStorageRef(path: string): StorageReference | null {
  if (!storage) return null;
  return ref(storage, path);
}

/**
 * Predefined storage path helpers.
 */
export const storagePaths = {
  incidentImage: (incidentId: string, filename: string) =>
    `incidents/${incidentId}/${filename}`,
  userAvatar: (uid: string, filename: string) =>
    `users/${uid}/avatar/${filename}`,
} as const;

/**
 * Compress an image File/Blob in the browser using HTML5 Canvas.
 * Produces an optimized Base64 JPEG (<80KB) that fits comfortably in Firestore.
 */
export function compressImage(
  file: File | Blob,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = () => resolve('');
  });
}

/**
 * Upload an incident photo.
 * If Firebase Cloud Storage bucket is active, uploads there.
 * If skipped (e.g. to avoid billing), automatically compresses and stores in Firestore.
 */
export async function uploadIncidentPhoto(
  incidentId: string,
  file: File | Blob
): Promise<string> {
  // Try uploading to Firebase Storage if available
  if (storage) {
    try {
      const cleanFilename = `${Date.now()}_evidence.jpg`;
      const storageRef = ref(storage, storagePaths.incidentImage(incidentId, cleanFilename));
      const metadata = {
        contentType: file.type || 'image/jpeg',
        customMetadata: { incidentId },
      };
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      console.warn(
        '[CivicEye Storage] Cloud Storage unavailable, falling back to optimized Firestore image:',
        error
      );
    }
  }

  // Zero-cost fallback: Compress to lightweight web JPEG (<70KB) for Firestore
  return compressImage(file);
}
