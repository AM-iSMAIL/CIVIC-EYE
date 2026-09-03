/**
 * Centralized Google Maps Platform Configuration
 *
 * Configures modern Maps JavaScript API with AdvancedMarkerElement support.
 * All map settings, glyphs, color tokens, and viewports are defined here.
 */
import type { HazardLevel } from '@/types/analysis';

export const MAPS_CONFIG = {
  // Google Maps Browser API Key (publicly safe with HTTP referrer restrictions)
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',

  // Modern Map ID required for AdvancedMarkerElement (DEMO_MAP_ID supported for dev)
  mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',

  // Sensible default fallback center (used when GPS is unavailable)
  defaultCenter: {
    lat: 28.6139,
    lng: 77.209,
  },

  defaultZoom: 13,
  minZoom: 3,
  maxZoom: 20,

  // Maximum public incidents fetched in a single realtime query
  queryLimit: 100,
} as const;

/**
 * Returns true when a Google Maps browser API key is present.
 */
export function isGoogleMapsConfigured(): boolean {
  return Boolean(MAPS_CONFIG.apiKey && MAPS_CONFIG.apiKey.trim().length > 0);
}

/**
 * Maps numerical severity (1-10) to hazard tier.
 */
export function getSeverityTier(severity: number): HazardLevel {
  if (severity >= 9) return 'critical';
  if (severity >= 7) return 'high';
  if (severity >= 4) return 'medium';
  return 'low';
}

/**
 * Maps numerical severity (1-10) to pin color.
 */
export function getSeverityColor(severity: number): string {
  if (severity >= 9) return '#f43f5e'; // Rose-500 (Critical)
  if (severity >= 7) return '#f97316'; // Orange-500 (High)
  if (severity >= 4) return '#06b6d4'; // Cyan-500 (Medium)
  return '#10b981'; // Emerald-500 (Low)
}

/**
 * Maps civic categories to distinctive single-character pin glyphs.
 */
export const CATEGORY_GLYPHS: Record<string, string> = {
  pothole: 'P',
  garbage: 'G',
  blocked_drain: 'D',
  broken_streetlight: 'L',
  streetlight: 'L',
  fallen_tree: 'T',
  damaged_sidewalk: 'S',
  damaged_road_sign: 'R',
  exposed_wire: 'W',
  water_leak: 'A',
  other: '?',
  no_civic_issue: '✓',
};

export function getCategoryGlyph(category: string): string {
  return CATEGORY_GLYPHS[category] || '?';
}
