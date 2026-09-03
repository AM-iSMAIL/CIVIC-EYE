/**
 * Phase 3: Client-Side Civic Issue Report Model
 *
 * All state is held in client memory until Phase 4 (Gemini AI) and Phase 5 (Dispatch Submission).
 */

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

import type { CivicIncidentAnalysis, CivicCategory } from './analysis';

export interface ReportDraft {
  /** Captured photograph (File/Blob) */
  photo: File | null;
  /** Browser object URL for preview (revoked on retake/unmount) */
  photoPreviewUrl: string | null;
  /** Epoch timestamp when photo was taken */
  capturedAt: number | null;
  /** Whether the user clicked "Use Photo" */
  photoConfirmed: boolean;
  /** Real GPS location captured from browser Geolocation API */
  location: GPSLocation | null;
  /** Structured AI analysis returned by Gemini Vision */
  aiAnalysis: CivicIncidentAnalysis | null;
  /** User-corrected category if overridden */
  userCategoryOverride: CivicCategory | null;
}
