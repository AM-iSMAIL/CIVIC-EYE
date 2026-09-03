/**
 * CivicEye Phase 7 Multi-Signal Duplicate Detection Engine
 *
 * Evaluates candidate incidents against new citizen reports using:
 * 1. Geographic proximity (Real GPS Haversine distance via geofire-common)
 * 2. Category taxonomy match (Exact, compatible, or incompatible)
 * 3. Semantic similarity (Gemini embeddings cosine similarity)
 * 4. Temporal recency (Elapsed hours between observations)
 */

import { GoogleGenAI } from '@google/genai';
import { distanceBetween, geohashForLocation, geohashQueryBounds } from 'geofire-common';
import { INTELLIGENCE_CONFIG } from '@/config/intelligence';
import type { CivicCategory } from '@/types/analysis';

// Initialize server-side Gemini client for embeddings (never exposed to client)
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Calculates authoritative real GPS distance in meters between two coordinates.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const distKm = distanceBetween([lat1, lon1], [lat2, lon2]);
  return Math.round(distKm * 1000 * 10) / 10;
}

/**
 * Normalizes distance into a 0–1 proximity score.
 * 0m -> 1.0, 50m -> 0.0, > 50m -> 0.0
 */
export function calculateDistanceScore(
  distanceMeters: number,
  radiusMeters = INTELLIGENCE_CONFIG.DUPLICATE_RADIUS_METERS
): number {
  if (distanceMeters > radiusMeters) return 0.0;
  return Math.max(0, Math.min(1.0, 1 - distanceMeters / radiusMeters));
}

/**
 * Evaluates category taxonomy compatibility.
 * Exact match: 1.0, Compatible: 0.5, Incompatible: 0.0
 */
export function calculateCategoryScore(
  categoryA: CivicCategory,
  categoryB: CivicCategory
): number {
  if (categoryA === categoryB) return 1.0;

  const compatibleList = INTELLIGENCE_CONFIG.CATEGORY_COMPATIBILITY[categoryA] || [];
  if (compatibleList.includes(categoryB)) {
    return 0.5;
  }

  return 0.0;
}

/**
 * Computes cosine similarity between two vector embeddings.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0.0;
  if (vecA.length !== vecB.length) return 0.0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0.0;

  const similarity = dot / denominator;
  return Math.max(0.0, Math.min(1.0, similarity));
}

/**
 * Generates text embedding using Gemini embeddings API.
 * Uses concise civic defect text only; strictly NO reporter PII.
 */
export async function generateCivicEmbedding(text: string): Promise<number[] | null> {
  const client = getGeminiClient();
  if (!client) {
    console.warn('[CivicEye Duplicate] Gemini client unavailable for embeddings.');
    return null;
  }

  try {
    const cleanText = text.trim().slice(0, 1000);
    const response = await client.models.embedContent({
      model: INTELLIGENCE_CONFIG.EMBEDDING_MODEL,
      contents: cleanText,
    });

    const values = response.embeddings?.[0]?.values;
    if (Array.isArray(values) && values.length > 0) {
      return values;
    }
    return null;
  } catch (err) {
    console.error('[CivicEye Duplicate] Gemini embedding generation error:', err);
    return null;
  }
}

/**
 * Computes temporal recency score based on elapsed hours between reports.
 */
export function calculateTemporalRecencyScore(timeDiffHours: number): number {
  const diff = Math.max(0, Math.abs(timeDiffHours));
  if (diff <= 24) return 1.0;
  if (diff <= 72) return 0.8;
  if (diff <= 168) return 0.6;
  if (diff <= 720) return 0.4;
  return 0.2;
}

export interface DuplicateEvaluationResult {
  distanceMeters: number;
  distanceScore: number;
  categoryScore: number;
  semanticScore: number;
  recencyScore: number;
  combinedScore: number;
  isDuplicate: boolean;
  isPossibleDuplicate: boolean;
}

/**
 * Calculates the combined multi-signal duplicate score.
 */
export function evaluateDuplicateScore(params: {
  distanceMeters: number;
  categoryA: CivicCategory;
  categoryB: CivicCategory;
  semanticSimilarity: number;
  timeDiffHours: number;
}): DuplicateEvaluationResult {
  const distanceScore = calculateDistanceScore(params.distanceMeters);
  const categoryScore = calculateCategoryScore(params.categoryA, params.categoryB);
  const semanticScore = Math.max(0, Math.min(1.0, params.semanticSimilarity));
  const recencyScore = calculateTemporalRecencyScore(params.timeDiffHours);

  const { DUPLICATE_WEIGHTS, DUPLICATE_SCORE_THRESHOLD, POSSIBLE_DUPLICATE_MIN } =
    INTELLIGENCE_CONFIG;

  const rawCombined =
    distanceScore * DUPLICATE_WEIGHTS.distance +
    categoryScore * DUPLICATE_WEIGHTS.category +
    semanticScore * DUPLICATE_WEIGHTS.semantic +
    recencyScore * DUPLICATE_WEIGHTS.recency;

  const combinedScore = Math.round(rawCombined * 1000) / 1000;
  const isDuplicate = combinedScore >= DUPLICATE_SCORE_THRESHOLD;
  const isPossibleDuplicate =
    !isDuplicate && combinedScore >= POSSIBLE_DUPLICATE_MIN;

  return {
    distanceMeters: params.distanceMeters,
    distanceScore: Math.round(distanceScore * 1000) / 1000,
    categoryScore: Math.round(categoryScore * 1000) / 1000,
    semanticScore: Math.round(semanticScore * 1000) / 1000,
    recencyScore: Math.round(recencyScore * 1000) / 1000,
    combinedScore,
    isDuplicate,
    isPossibleDuplicate,
  };
}

/**
 * Generates a geohash string for database indexing.
 */
export function computeGeohash(latitude: number, longitude: number): string {
  return geohashForLocation([latitude, longitude]);
}

/**
 * Generates geohash query bounds for spatial indexing.
 */
export function computeGeohashBounds(
  latitude: number,
  longitude: number,
  radiusMeters = INTELLIGENCE_CONFIG.DUPLICATE_RADIUS_METERS
) {
  return geohashQueryBounds([latitude, longitude], radiusMeters);
}
