/**
 * Centralized CivicEye Phase 7 Intelligence Configuration
 *
 * Configures thresholds, mathematical weights, and heuristic parameters
 * for multi-signal duplicate detection and deterministic priority scoring.
 */

import type { CivicCategory, HazardLevel } from '@/types/analysis';

export const INTELLIGENCE_CONFIG = {
  // Duplicate Detection Distance Radius (in meters)
  DUPLICATE_RADIUS_METERS: 50,

  // Maximum candidate incidents to consider per clustering run (cost control)
  MAX_DUPLICATE_CANDIDATES: 20,

  // Semantic similarity threshold using cosine similarity (Gemini embeddings)
  SEMANTIC_DUPLICATE_THRESHOLD: 0.80,

  // Combined score threshold to classify as an authentic duplicate
  // >= 0.80: Strong duplicate candidate (linked to cluster)
  // 0.65–0.79: Possible duplicate (logged, but not automatically merged)
  // < 0.65: Distinct incident
  DUPLICATE_SCORE_THRESHOLD: 0.80,
  POSSIBLE_DUPLICATE_MIN: 0.65,

  // Multi-signal combined duplicate score weights (must sum to 1.0)
  DUPLICATE_WEIGHTS: {
    distance: 0.35,  // Real GPS proximity
    category: 0.25,  // Civic defect taxonomy compatibility
    semantic: 0.30,  // Gemini text embeddings cosine similarity
    recency: 0.10,   // Temporal proximity (hours/days between reports)
  },

  // Gemini Embedding Model
  EMBEDDING_MODEL: 'gemini-embedding-001',

  // Priority Engine Factor Weights (must sum to 1.0)
  PRIORITY_WEIGHTS: {
    severity: 0.30,      // Defect physical severity rating (1–10)
    hazard: 0.25,        // Qualitative hazard level (low, medium, high, critical)
    affectedUsers: 0.15, // Volume and vulnerability of impacted commuters
    reportCount: 0.20,   // Citizen consensus / duplicate volume (log diminishing)
    recency: 0.10,       // Temporal freshness of reports
  },

  // Hazard level point mapping (0–100)
  HAZARD_SCORES: {
    low: 20,
    medium: 50,
    high: 75,
    critical: 100,
  } as Record<HazardLevel, number>,

  // Affected user groups count base score (0–100)
  AFFECTED_COUNT_SCORES: {
    0: 0,
    1: 25,
    2: 50,
    3: 75,
    4: 90, // 4 or more
  } as Record<number, number>,

  // Multiplier bonus if vulnerable commuter groups are impacted
  VULNERABLE_GROUPS: [
    'motorists',
    'two_wheeler_users',
    'pedestrians',
    'wheelchair_users',
    'cyclists',
    'children',
    'elderly',
  ],
  VULNERABLE_GROUP_BONUS_MULTIPLIER: 1.10,

  // Recency score tiers based on elapsed time since report creation
  RECENCY_TIERS_HOURS: [
    { maxHours: 1, score: 70 },
    { maxHours: 6, score: 60 },
    { maxHours: 24, score: 50 },
    { maxHours: 72, score: 35 },  // 3 days
    { maxHours: 168, score: 20 }, // 7 days
    { maxHours: Infinity, score: 10 },
  ],

  // Priority classification tiers (0–100)
  PRIORITY_LEVEL_THRESHOLDS: {
    low: { min: 0, max: 24 },
    medium: { min: 25, max: 49 },
    high: { min: 50, max: 74 },
    critical: { min: 75, max: 100 },
  },

  // Category compatibility matrix (1.0 = exact match, 0.5 = related, 0.0 = unrelated)
  CATEGORY_COMPATIBILITY: {
    pothole: ['damaged_sidewalk', 'other'],
    garbage: ['blocked_drain', 'other'],
    blocked_drain: ['garbage', 'water_leak', 'other'],
    broken_streetlight: ['exposed_wire', 'other'],
    fallen_tree: ['blocked_drain', 'damaged_sidewalk', 'other'],
    damaged_sidewalk: ['pothole', 'damaged_road_sign', 'other'],
    damaged_road_sign: ['damaged_sidewalk', 'other'],
    water_leak: ['blocked_drain', 'pothole', 'other'],
    exposed_wire: ['broken_streetlight', 'other'],
    other: [],
    no_civic_issue: [],
  } as Record<CivicCategory, CivicCategory[]>,
} as const;
