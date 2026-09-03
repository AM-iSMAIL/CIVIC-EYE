/**
 * CivicEye Phase 7 Deterministic Priority Engine
 *
 * Computes an objective, explainable priority score (0–100) and severity tier
 * based on physical defect severity, hazard level, affected commuter vulnerability,
 * duplicate citizen report consensus (logarithmic scale), and report recency.
 */

import { INTELLIGENCE_CONFIG } from '@/config/intelligence';
import type { HazardLevel } from '@/types/analysis';
import type { PriorityAssessment, PriorityFactors } from '@/types/incident';

export interface PriorityCalculationInput {
  severity: number;              // 1–10
  hazardLevel: HazardLevel;      // 'low' | 'medium' | 'high' | 'critical'
  affectedUsers: string[];       // User group labels
  reportCount: number;           // Number of independent citizen reports
  createdAtMs?: number | Date;   // Timestamp in milliseconds or Date
}

/**
 * Converts defect severity (1–10) into a normalized 0–100 score.
 */
export function calculateSeverityScore(severity: number): number {
  const clamped = Math.max(1, Math.min(10, severity));
  return clamped * 10;
}

/**
 * Maps categorical hazard level to standard 0–100 hazard points.
 */
export function calculateHazardScore(hazardLevel: HazardLevel): number {
  return INTELLIGENCE_CONFIG.HAZARD_SCORES[hazardLevel] ?? 50;
}

/**
 * Calculates affected commuter score considering volume and vulnerable group multipliers.
 */
export function calculateAffectedUsersScore(affectedUsers: string[]): number {
  if (!affectedUsers || affectedUsers.length === 0) {
    return INTELLIGENCE_CONFIG.AFFECTED_COUNT_SCORES[0];
  }

  const count = affectedUsers.length;
  let baseScore = INTELLIGENCE_CONFIG.AFFECTED_COUNT_SCORES[4];
  if (count === 1) baseScore = INTELLIGENCE_CONFIG.AFFECTED_COUNT_SCORES[1];
  else if (count === 2) baseScore = INTELLIGENCE_CONFIG.AFFECTED_COUNT_SCORES[2];
  else if (count === 3) baseScore = INTELLIGENCE_CONFIG.AFFECTED_COUNT_SCORES[3];

  // Check for vulnerable commuter groups (motorists, two-wheeler users, pedestrians, etc.)
  const hasVulnerable = affectedUsers.some((group) => {
    const normalized = group.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return INTELLIGENCE_CONFIG.VULNERABLE_GROUPS.some((vg) => normalized.includes(vg));
  });

  if (hasVulnerable) {
    baseScore = Math.min(
      100,
      Math.round(baseScore * INTELLIGENCE_CONFIG.VULNERABLE_GROUP_BONUS_MULTIPLIER)
    );
  }

  return baseScore;
}

/**
 * Computes report count score using logarithmic diminishing returns.
 * 1 report  -> 30
 * 2 reports -> 50
 * 4 reports -> 70
 * 8 reports -> 90
 * 16+       -> 100
 */
export function calculateReportCountScore(reportCount: number): number {
  const count = Math.max(1, reportCount);
  const score = Math.round(15 + 25 * Math.log2(count));
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates temporal decay recency score based on elapsed hours.
 */
export function calculateRecencyScore(createdAt?: number | Date): number {
  if (!createdAt) return INTELLIGENCE_CONFIG.RECENCY_TIERS_HOURS[0].score;

  const createdMs = typeof createdAt === 'number' ? createdAt : createdAt.getTime();
  const elapsedMs = Math.max(0, Date.now() - createdMs);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  for (const tier of INTELLIGENCE_CONFIG.RECENCY_TIERS_HOURS) {
    if (elapsedHours <= tier.maxHours) {
      return tier.score;
    }
  }

  return 15;
}

/**
 * Maps a numeric score (0–100) to its priority classification tier.
 */
export function getPriorityLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  const { low, medium, high } = INTELLIGENCE_CONFIG.PRIORITY_LEVEL_THRESHOLDS;
  if (score <= low.max) return 'low';
  if (score <= medium.max) return 'medium';
  if (score <= high.max) return 'high';
  return 'critical';
}

/**
 * Computes the unified, deterministic PriorityAssessment.
 */
export function calculatePriority(input: PriorityCalculationInput): PriorityAssessment {
  const severityScore = calculateSeverityScore(input.severity);
  const hazardScore = calculateHazardScore(input.hazardLevel);
  const affectedUsersScore = calculateAffectedUsersScore(input.affectedUsers);
  const reportCountScore = calculateReportCountScore(input.reportCount);
  const recencyScore = calculateRecencyScore(input.createdAtMs);

  const { PRIORITY_WEIGHTS } = INTELLIGENCE_CONFIG;

  const rawScore =
    severityScore * PRIORITY_WEIGHTS.severity +
    hazardScore * PRIORITY_WEIGHTS.hazard +
    affectedUsersScore * PRIORITY_WEIGHTS.affectedUsers +
    reportCountScore * PRIORITY_WEIGHTS.reportCount +
    recencyScore * PRIORITY_WEIGHTS.recency;

  const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const level = getPriorityLevel(clampedScore);

  const factors: PriorityFactors = {
    severity: severityScore,
    hazard: hazardScore,
    affectedUsers: affectedUsersScore,
    reportCount: reportCountScore,
    recency: recencyScore,
  };

  return {
    score: clampedScore,
    level,
    factors,
    calculatedAt: new Date().toISOString(),
  };
}
