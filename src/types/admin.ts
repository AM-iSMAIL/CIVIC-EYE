/**
 * CivicEye Phase 8: Admin Command Center Types
 *
 * Strongly-typed domain models for municipal operations,
 * incident management tables, priority queues, and analytics.
 */

import type { CivicCategory, HazardLevel } from './analysis';
import type { IssueStatus, PriorityAssessment } from './incident';

export type PriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
export type StatusFilter = 'all' | IssueStatus;
export type CategoryFilter = 'all' | CivicCategory;
export type SortField = 'priority' | 'severity' | 'reports' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface AdminIncidentFilters {
  searchQuery: string;
  category: CategoryFilter;
  priority: PriorityFilter;
  status: StatusFilter;
  hazard: 'all' | HazardLevel;
  sortBy: SortField;
  sortOrder: SortOrder;
}

/**
 * Standardized row representation for the Incident Management Table.
 * Supports individual citizen reports or consolidated clusters.
 */
export interface AdminIncidentRow {
  id: string;
  category: CivicCategory;
  severity: number;
  hazardLevel: HazardLevel;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  accuracy?: number;
  description: string;
  recommendedAction?: string;
  reportCount: number;
  priority: PriorityAssessment | {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
  };
  isCluster: boolean;
  clusterId?: string | null;
  canonicalIncidentId?: string;
  reporterUid?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * High-level municipal KPI aggregates derived strictly from real Firestore data.
 */
export interface AdminDashboardStats {
  totalIncidents: number;
  activeIssues: number;
  criticalCount: number;
  highCount: number;
  duplicateReportsCount: number;
  resolvedCount: number;
  avgPriorityScore: number;
}

/**
 * Lightweight analytics computed from real Firestore records.
 */
export interface AdminAnalyticsData {
  categoryDistribution: Array<{
    category: CivicCategory;
    label: string;
    count: number;
    percentage: number;
  }>;
  priorityDistribution: Array<{
    tier: 'critical' | 'high' | 'medium' | 'low';
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: IssueStatus;
    count: number;
    percentage: number;
  }>;
  totalClusters: number;
  totalReports: number;
  duplicateConsensusRate: number; // Percentage of total reports that joined clusters
  avgReportsPerCluster: number;
}

/**
 * Validated status transition graph to prevent illegal status regressions.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  reported: ['acknowledged', 'in_progress', 'rejected'],
  acknowledged: ['in_progress', 'resolved', 'rejected'],
  in_progress: ['resolved', 'rejected'],
  resolved: ['in_progress'], // Can reopen if defect resurfaces
  rejected: ['reported'],     // Can reinstate if verified genuine
  submitted: ['acknowledged', 'in_progress', 'resolved', 'rejected'],
  analyzing: ['reported', 'acknowledged'],
  in_review: ['in_progress', 'resolved', 'rejected'],
};
