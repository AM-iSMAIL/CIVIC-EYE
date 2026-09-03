import type { Timestamp, FieldValue } from 'firebase/firestore';
import type { CivicCategory, CivicIncidentAnalysis } from './analysis';

// Re-export CivicCategory for unified usage
export type { CivicCategory };

export type IssueCategory = CivicCategory | 'streetlight' | 'water_leak';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus =
  | 'reported'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'submitted'
  | 'analyzing'
  | 'in_review';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationData {
  coordinates: Coordinates | null;
  address?: string;
  city?: string;
  ward?: string;
  postalCode?: string;
  timestamp?: number;
}

export interface AiDetectionResult {
  detectedCategory: IssueCategory;
  confidenceScore: number;
  detectedSeverity: IssueSeverity;
  tags: string[];
  rationale: string;
  analysisTimestamp?: string;
}

/**
 * Reporter information bound directly to authenticated Firebase user
 */
export interface IncidentReporter {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

/**
 * Real browser GPS location captured in Phase 3
 */
export interface IncidentLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: Timestamp | Date | number;
}

/**
 * User confirmation and category override status
 */
export interface IncidentUserConfirmation {
  confirmed: boolean;
  categoryOverride: CivicCategory | null;
}

export interface DuplicateAnalysis {
  isDuplicate: boolean;
  duplicateOf: string | null;
  duplicateConfidence: number;
  clusterId: string | null;
  evaluatedAt: Timestamp | Date | string;
}

export interface PriorityFactors {
  severity: number;
  hazard: number;
  affectedUsers: number;
  reportCount: number;
  recency: number;
}

export interface PriorityAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: PriorityFactors;
  calculatedAt: Timestamp | Date | string;
}

/**
 * Phase 7 Cluster Model: incidentClusters/{clusterId}
 * Aggregates duplicate civic defect reports into a unified incident cluster.
 * Strictly NO reporter PII, NO images.
 */
export interface IncidentCluster {
  id: string;
  canonicalIncidentId: string;
  category: CivicCategory;
  latitude: number;
  longitude: number;
  geohash?: string;
  reportCount: number;
  incidentIds: string[];
  highestSeverity: number;
  hazardLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: string[];
  description: string;
  recommendedAction: string;
  priority: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
  };
  status: IssueStatus;
  createdAt: Timestamp | FieldValue | Date | string;
  updatedAt: Timestamp | FieldValue | Date | string;
}

/**
 * Phase 5 & 7 Canonical Firestore Document Model: incidents/{incidentId}
 * Strictly metadata only; zero image files, base64 data, or Blobs.
 */
export interface IncidentDocument {
  id: string;
  reporter: IncidentReporter;
  category: CivicCategory;
  aiAnalysis: CivicIncidentAnalysis;
  userConfirmation: IncidentUserConfirmation;
  location: IncidentLocation;
  status: IssueStatus;
  createdAt: Timestamp | FieldValue | Date | string;
  updatedAt?: Timestamp | FieldValue | Date | string;
  geohash?: string;
  duplicateAnalysis?: DuplicateAnalysis;
  priority?: PriorityAssessment;
  clusterId?: string | null;
  statusHistory?: Array<{
    status: IssueStatus;
    changedAt: string;
    changedByUid?: string;
    note?: string;
  }>;
}

/**
 * Input payload passed to createIncident() service
 */
export interface IncidentCreateInput {
  reporter: IncidentReporter;
  category: CivicCategory;
  aiAnalysis: CivicIncidentAnalysis;
  userConfirmation: IncidentUserConfirmation;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    capturedAt: number;
  };
}

/**
 * Application-level validation before Firestore document creation
 */
export function validateIncidentPayload(input: IncidentCreateInput): {
  valid: boolean;
  error?: string;
} {
  if (!input.reporter || !input.reporter.uid) {
    return { valid: false, error: 'You need to sign in before submitting a report.' };
  }

  const { latitude, longitude, accuracy } = input.location || {};
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { valid: false, error: 'Location is required to submit a civic report.' };
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return {
      valid: false,
      error: 'Your location data is invalid. Please recapture your location.',
    };
  }

  if (typeof accuracy !== 'number' || accuracy < 0) {
    return {
      valid: false,
      error: 'GPS accuracy is invalid. Please refresh location.',
    };
  }

  if (!input.aiAnalysis) {
    return { valid: false, error: 'Please analyze the photo before submitting.' };
  }

  return { valid: true };
}

// Backward-compatible interface for earlier components
export interface IncidentReport {
  id: string;
  title?: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  imageUrl?: string;
  location: GeolocationData;
  aiAnalysis?: AiDetectionResult;
  reporterId?: string;
  reporterName?: string;
  createdAt: string;
  updatedAt: string;
  assignedDepartment?: string;
  resolutionNotes?: string;
  resolutionImageUrl?: string;
}

export interface CategoryMetadata {
  id: IssueCategory;
  label: string;
  description: string;
  iconName: string;
}

/**
 * Phase 6 & 7 Canonical Public Firestore Document Model: publicIncidents/{incidentId}
 * Sanitized map-safe dataset: strictly NO reporter identity, NO images, NO auth tokens.
 */
export interface PublicIncidentDocument {
  id: string;
  category: CivicCategory;
  severity: number;
  hazardLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: string[];
  description: string;
  recommendedAction?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  status: IssueStatus;
  createdAt: Timestamp | FieldValue | Date | string;
  geohash?: string;
  clusterId?: string | null;
  reportCount?: number;
  priority?: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
  };
  isCanonical?: boolean;
}
