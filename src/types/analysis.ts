import { z } from 'zod';

export const CIVIC_CATEGORIES = [
  'pothole',
  'garbage',
  'blocked_drain',
  'broken_streetlight',
  'fallen_tree',
  'damaged_sidewalk',
  'damaged_road_sign',
  'exposed_wire',
  'other',
  'no_civic_issue',
] as const;

export type CivicCategory = (typeof CIVIC_CATEGORIES)[number];

export const HAZARD_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export type HazardLevel = (typeof HAZARD_LEVELS)[number];

export const AFFECTED_USER_GROUPS = [
  'pedestrians',
  'cyclists',
  'two_wheeler_users',
  'motorists',
  'wheelchair_users',
  'public_transport_users',
  'none',
] as const;
export type AffectedUserGroup = (typeof AFFECTED_USER_GROUPS)[number];

/**
 * Zod validation schema for Gemini structured output
 */
export const CivicIncidentAnalysisSchema = z.object({
  category: z.enum(CIVIC_CATEGORIES),
  severity: z.number().int().min(1).max(10),
  confidence: z.number().min(0).max(1),
  hazardLevel: z.enum(HAZARD_LEVELS),
  affectedUsers: z.array(z.enum(AFFECTED_USER_GROUPS)),
  description: z.string().min(1),
  recommendedAction: z.string().min(1),
});

export type CivicIncidentAnalysis = z.infer<typeof CivicIncidentAnalysisSchema>;

/**
 * Human-friendly labels for UI rendering
 */
export const CATEGORY_LABELS: Record<CivicCategory, string> = {
  pothole: 'Pothole',
  garbage: 'Garbage & Waste',
  blocked_drain: 'Blocked Drain',
  broken_streetlight: 'Broken Streetlight',
  fallen_tree: 'Fallen Tree / Branches',
  damaged_sidewalk: 'Damaged Sidewalk',
  damaged_road_sign: 'Damaged Road Sign',
  exposed_wire: 'Exposed Electrical Wire',
  other: 'Other Civic Defect',
  no_civic_issue: 'No Civic Issue Detected',
};

export const HAZARD_COLORS: Record<HazardLevel, { bg: string; text: string; border: string }> = {
  low: {
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-800/60',
  },
  medium: {
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-800/60',
  },
  high: {
    bg: 'bg-orange-950/60',
    text: 'text-orange-300',
    border: 'border-orange-800/60',
  },
  critical: {
    bg: 'bg-rose-950/70',
    text: 'text-rose-300',
    border: 'border-rose-800/70',
  },
};

export const AFFECTED_USER_LABELS: Record<AffectedUserGroup, string> = {
  pedestrians: 'Pedestrians',
  cyclists: 'Cyclists',
  two_wheeler_users: 'Two-Wheeler Users',
  motorists: 'Motorists',
  wheelchair_users: 'Wheelchair Users',
  public_transport_users: 'Public Transit',
  none: 'None',
};
