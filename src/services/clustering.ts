/**
 * CivicEye Phase 7 Cluster Management & Orchestration Service
 *
 * Implements non-destructive duplicate clustering:
 * - Reads new incident and candidate reports within 50m
 * - Evaluates multi-signal duplicate confidence
 * - Maintains stable cluster documents in `incidentClusters/{clusterId}`
 * - Updates canonical public map representation with report count and recalculated priority
 * - Strictly preserves individual citizen incident documents for auditability
 */

import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { INTELLIGENCE_CONFIG } from '@/config/intelligence';
import {
  calculateDistanceMeters,
  evaluateDuplicateScore,
  generateCivicEmbedding,
  cosineSimilarity,
  computeGeohash,
} from './duplicateDetection';
import { calculatePriority } from './priority';
import type { CivicCategory, HazardLevel } from '@/types/analysis';
import type {
  DuplicateAnalysis,
  IncidentCluster,
  PriorityAssessment,
} from '@/types/incident';

export interface ClusteringResult {
  incidentId: string;
  isDuplicate: boolean;
  clusterId: string;
  duplicateOf: string | null;
  duplicateConfidence: number;
  reportCount: number;
  priority: PriorityAssessment;
}

/**
 * Server-side orchestrator for incident clustering and priority recalculation.
 * Idempotent: safe to run multiple times without duplicating report counts.
 */
export async function processIncidentClustering(
  incidentId: string
): Promise<ClusteringResult | null> {
  if (!db) {
    console.error('[CivicEye Clustering] Firestore database not initialized.');
    return null;
  }

  // 1. Fetch the target incident (try publicIncidents first, then private incidents)
  let incidentSnap = await getDoc(doc(db, 'publicIncidents', incidentId));
  let sourceCollection = 'publicIncidents';
  if (!incidentSnap.exists()) {
    try {
      incidentSnap = await getDoc(doc(db, 'incidents', incidentId));
      sourceCollection = 'incidents';
    } catch {
      // Ignored if unauthenticated
    }
  }

  if (!incidentSnap.exists()) {
    console.error(`[CivicEye Clustering] Incident ${incidentId} not found.`);
    return null;
  }

  const incidentData = incidentSnap.data();

  // 2. Idempotency Check: if already evaluated, return existing result
  if (incidentData.duplicateAnalysis?.evaluatedAt) {
    console.log(
      `[CivicEye Clustering] Incident ${incidentId} already evaluated at ${incidentData.duplicateAnalysis.evaluatedAt}. Skipping.`
    );
    return {
      incidentId,
      isDuplicate: incidentData.duplicateAnalysis.isDuplicate,
      clusterId: incidentData.duplicateAnalysis.clusterId || `cluster_${incidentId}`,
      duplicateOf: incidentData.duplicateAnalysis.duplicateOf,
      duplicateConfidence: incidentData.duplicateAnalysis.duplicateConfidence,
      reportCount: incidentData.reportCount || 1,
      priority: incidentData.priority || {
        score: 50,
        level: 'medium',
        factors: { severity: 50, hazard: 50, affectedUsers: 50, reportCount: 15, recency: 70 },
        calculatedAt: new Date().toISOString(),
      },
    };
  }

  const newLat = Number(incidentData.latitude ?? incidentData.location?.latitude);
  const newLon = Number(incidentData.longitude ?? incidentData.location?.longitude);
  const newCat = (incidentData.category ||
    incidentData.aiAnalysis?.category ||
    'other') as CivicCategory;
  const newSeverity = Number(incidentData.severity ?? incidentData.aiAnalysis?.severity ?? 5);
  const newHazard = (incidentData.hazardLevel ??
    incidentData.aiAnalysis?.hazardLevel ??
    'medium') as HazardLevel;
  const newAffected = (incidentData.affectedUsers ??
    incidentData.aiAnalysis?.affectedUsers ??
    []) as string[];
  const newDesc = incidentData.description ?? incidentData.aiAnalysis?.description ?? '';
  const newAction =
    incidentData.recommendedAction ?? incidentData.aiAnalysis?.recommendedAction ?? '';

  const newCreatedAt = incidentData.createdAt?.toDate
    ? incidentData.createdAt.toDate()
    : new Date();

  // 3. Find candidate incidents for proximity comparison (using public dataset)
  const candidatesRef = collection(db, 'publicIncidents');
  const q = query(
    candidatesRef,
    limit(INTELLIGENCE_CONFIG.MAX_DUPLICATE_CANDIDATES * 2)
  );
  let candidatesSnap = await getDocs(q);

  if (candidatesSnap.empty) {
    try {
      candidatesSnap = await getDocs(
        query(
          collection(db, 'incidents'),
          limit(INTELLIGENCE_CONFIG.MAX_DUPLICATE_CANDIDATES * 2)
        )
      );
    } catch {
      // Ignored
    }
  }

  let bestMatch: {
    candidateId: string;
    candidateClusterId: string | null;
    candidateDuplicateOf: string | null;
    combinedScore: number;
  } | null = null;

  // Generate embedding for target incident if candidates exist
  let newEmbedding: number[] | null = null;

  for (const candDoc of candidatesSnap.docs) {
    if (candDoc.id === incidentId) continue; // Skip self

    const candData = candDoc.data();
    const candLat = Number(candData.location?.latitude);
    const candLon = Number(candData.location?.longitude);

    if (isNaN(candLat) || isNaN(candLon)) continue;

    // Check GPS distance
    const distMeters = calculateDistanceMeters(newLat, newLon, candLat, candLon);
    if (distMeters > INTELLIGENCE_CONFIG.DUPLICATE_RADIUS_METERS) {
      continue; // Outside proximity threshold
    }

    const candCat = (candData.category ||
      candData.aiAnalysis?.category ||
      'other') as CivicCategory;
    const candDesc = candData.aiAnalysis?.description ?? '';
    const candAction = candData.aiAnalysis?.recommendedAction ?? '';
    const candCreatedAt = candData.createdAt?.toDate
      ? candData.createdAt.toDate()
      : new Date();

    const timeDiffHours =
      Math.abs(newCreatedAt.getTime() - candCreatedAt.getTime()) / (1000 * 60 * 60);

    // Compute semantic similarity using Gemini embeddings
    let semanticSimilarity = 0.5; // Neutral fallback if embedding fails
    if (!newEmbedding) {
      newEmbedding = await generateCivicEmbedding(
        `${newCat}: ${newDesc}. Action: ${newAction}`
      );
    }

    if (newEmbedding) {
      const candEmbedding = await generateCivicEmbedding(
        `${candCat}: ${candDesc}. Action: ${candAction}`
      );
      if (candEmbedding) {
        semanticSimilarity = cosineSimilarity(newEmbedding, candEmbedding);
      }
    }

    // Evaluate combined duplicate score
    const evalResult = evaluateDuplicateScore({
      distanceMeters: distMeters,
      categoryA: newCat,
      categoryB: candCat,
      semanticSimilarity,
      timeDiffHours,
    });

    if (
      evalResult.isDuplicate &&
      (!bestMatch || evalResult.combinedScore > bestMatch.combinedScore)
    ) {
      bestMatch = {
        candidateId: candDoc.id,
        candidateClusterId: candData.clusterId || candData.duplicateAnalysis?.clusterId || null,
        candidateDuplicateOf:
          candData.duplicateAnalysis?.duplicateOf || candDoc.id,
        combinedScore: evalResult.combinedScore,
      };
    }
  }

  // 4. Cluster Resolution
  let clusterId: string;
  let canonicalIncidentId: string;
  let isDuplicate = false;
  let duplicateOf: string | null = null;
  let duplicateConfidence = 0;
  let existingCluster: IncidentCluster | null = null;

  if (bestMatch) {
    // Matched an existing incident
    isDuplicate = true;
    duplicateConfidence = bestMatch.combinedScore;
    canonicalIncidentId = bestMatch.candidateDuplicateOf || bestMatch.candidateId;
    clusterId =
      bestMatch.candidateClusterId || `cluster_${canonicalIncidentId}`;
    duplicateOf = canonicalIncidentId;

    // Check if cluster document exists
    const clusterRef = doc(db, 'incidentClusters', clusterId);
    const clusterSnap = await getDoc(clusterRef);
    if (clusterSnap.exists()) {
      existingCluster = clusterSnap.data() as IncidentCluster;
    }
  } else {
    // New distinct incident: creates its own cluster
    isDuplicate = false;
    duplicateConfidence = 0;
    canonicalIncidentId = incidentId;
    clusterId = `cluster_${incidentId}`;
    duplicateOf = null;
  }

  // 5. Compute Consolidated Cluster Priority
  const reportCount = existingCluster ? existingCluster.reportCount + 1 : 1;
  const highestSeverity = existingCluster
    ? Math.max(existingCluster.highestSeverity, newSeverity)
    : newSeverity;

  // Merge affected user groups
  const mergedAffectedUsers = Array.from(
    new Set([...(existingCluster?.affectedUsers || []), ...newAffected])
  );

  const priorityAssessment = calculatePriority({
    severity: highestSeverity,
    hazardLevel: existingCluster?.hazardLevel || newHazard,
    affectedUsers: mergedAffectedUsers,
    reportCount,
    createdAtMs: existingCluster
      ? existingCluster.createdAt
      : newCreatedAt.getTime(),
  });

  // 6. Update Incident Document
  const duplicateAnalysis: DuplicateAnalysis = {
    isDuplicate,
    duplicateOf,
    duplicateConfidence,
    clusterId,
    evaluatedAt: new Date().toISOString(),
  };

  const geohash = computeGeohash(newLat, newLon);

  try {
    const targetRef = doc(db, sourceCollection, incidentId);
    await updateDoc(targetRef, {
      duplicateAnalysis,
      priority: priorityAssessment,
      clusterId,
      geohash,
    });
  } catch (targetErr) {
    console.warn('[CivicEye Clustering] Target update warning:', targetErr);
  }

  // 7. Write / Update Cluster Document in incidentClusters/{clusterId}
  const clusterRef = doc(db, 'incidentClusters', clusterId);
  const clusterPayload: IncidentCluster = {
    id: clusterId,
    canonicalIncidentId,
    category: existingCluster ? existingCluster.category : newCat,
    latitude: existingCluster ? existingCluster.latitude : newLat,
    longitude: existingCluster ? existingCluster.longitude : newLon,
    geohash: existingCluster ? existingCluster.geohash : geohash,
    reportCount,
    incidentIds: Array.from(
      new Set([...(existingCluster?.incidentIds || [canonicalIncidentId]), incidentId])
    ),
    highestSeverity,
    hazardLevel: existingCluster ? existingCluster.hazardLevel : newHazard,
    affectedUsers: mergedAffectedUsers,
    description: existingCluster ? existingCluster.description : newDesc,
    recommendedAction: existingCluster
      ? existingCluster.recommendedAction
      : newAction,
    priority: {
      score: priorityAssessment.score,
      level: priorityAssessment.level,
    },
    status: 'reported',
    createdAt: existingCluster ? existingCluster.createdAt : serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(clusterRef, clusterPayload, { merge: true });
  } catch (clErr) {
    console.warn('[CivicEye Clustering] Cluster write warning:', clErr);
  }

  // 8. Update Public Map Representation (publicIncidents)
  // Ensure the public map document reflects the updated reportCount and priority
  try {
    const publicRef = doc(db, 'publicIncidents', canonicalIncidentId);
    await updateDoc(publicRef, {
      clusterId,
      reportCount,
      priority: {
        score: priorityAssessment.score,
        level: priorityAssessment.level,
      },
      isCanonical: true,
      geohash,
    });

    if (isDuplicate) {
      // Mark duplicate public record as non-canonical so map groups it into the cluster
      const duplicatePublicRef = doc(db, 'publicIncidents', incidentId);
      await updateDoc(duplicatePublicRef, {
        clusterId,
        reportCount,
        priority: {
          score: priorityAssessment.score,
          level: priorityAssessment.level,
        },
        isCanonical: false,
        geohash,
      });
    }
  } catch (pubErr) {
    console.warn(
      '[CivicEye Clustering] Public incident sync warning:',
      pubErr
    );
  }

  console.log(
    `[CivicEye Clustering] Completed clustering for incident ${incidentId}. Duplicate: ${isDuplicate}, Cluster: ${clusterId}, Priority: ${priorityAssessment.score} (${priorityAssessment.level}), Reports: ${reportCount}`
  );

  return {
    incidentId,
    isDuplicate,
    clusterId,
    duplicateOf,
    duplicateConfidence,
    reportCount,
    priority: priorityAssessment,
  };
}
