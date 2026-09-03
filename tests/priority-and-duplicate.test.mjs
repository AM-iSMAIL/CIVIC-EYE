/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * CivicEye Phase 7 Unit Test Suite
 *
 * Validates:
 * - Deterministic Priority Engine (100% mathematical, explainable, clamped)
 * - Multi-Signal Duplicate Detection (Distance, Category, Semantic, Recency)
 * - Idempotency & Edge Cases
 *
 * Run with: node tests/priority-and-duplicate.test.mjs
 */

import {
  calculateSeverityScore,
  calculateHazardScore,
  calculateAffectedUsersScore,
  calculateReportCountScore,
  calculateRecencyScore,
  calculatePriority,
} from '../src/services/priority.ts';

import {
  calculateDistanceMeters,
  calculateDistanceScore,
  calculateCategoryScore,
  cosineSimilarity,
  calculateTemporalRecencyScore,
  evaluateDuplicateScore,
} from '../src/services/duplicateDetection.ts';

import { INTELLIGENCE_CONFIG } from '../src/config/intelligence.ts';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
  passedTests++;
}

console.log('====================================================');
console.log('CivicEye Phase 7: Priority & Duplicate Engine Tests');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST 1: Severity 1, Low Hazard, 1 Affected Group, 1 Report, Recent -> Low Priority (< 25)
// ----------------------------------------------------
const priority1 = calculatePriority({
  severity: 1,
  hazardLevel: 'low',
  affectedUsers: ['pedestrians'],
  reportCount: 1,
  createdAtMs: Date.now(),
});
assert(
  priority1.score < 25 && priority1.level === 'low',
  `TEST 1: Mild defect produces low priority. Score: ${priority1.score} (${priority1.level})`
);

// ----------------------------------------------------
// TEST 2: Severity 10, Critical Hazard, Multiple Affected Groups, Recent -> Critical Priority (>= 75)
// ----------------------------------------------------
const priority2 = calculatePriority({
  severity: 10,
  hazardLevel: 'critical',
  affectedUsers: ['motorists', 'two_wheeler_users', 'pedestrians'],
  reportCount: 4,
  createdAtMs: Date.now(),
});
assert(
  priority2.score >= 75 && priority2.level === 'critical',
  `TEST 2: Critical defect produces critical priority. Score: ${priority2.score} (${priority2.level})`
);

// ----------------------------------------------------
// TEST 3: Report Count Logarithmic Diminishing Returns (5 reports vs 1 report)
// ----------------------------------------------------
const rc1 = calculateReportCountScore(1);
const rc2 = calculateReportCountScore(2);
const rc5 = calculateReportCountScore(5);
const rc16 = calculateReportCountScore(16);
assert(
  rc1 === 15 && rc2 === 40 && rc5 > rc2 && rc16 === 100,
  `TEST 3: Report count scores scale logarithmically: 1=${rc1}, 2=${rc2}, 5=${rc5}, 16=${rc16}`
);

// ----------------------------------------------------
// TEST 4: Same Category + 20m Distance + High Semantic Similarity -> Likely Duplicate (>= 0.80)
// ----------------------------------------------------
const dup4 = evaluateDuplicateScore({
  distanceMeters: 20, // Inside 50m radius
  categoryA: 'pothole',
  categoryB: 'pothole', // Exact match (1.0)
  semanticSimilarity: 0.90, // High semantic match
  timeDiffHours: 2, // Recent
});
assert(
  dup4.isDuplicate === true && dup4.combinedScore >= 0.80,
  `TEST 4: Same issue nearby with matching text is classified as duplicate. Score: ${dup4.combinedScore}`
);

// ----------------------------------------------------
// TEST 5: Different Category + 20m Distance -> Should NOT Automatically Be Duplicate (< 0.80)
// ----------------------------------------------------
const dup5 = evaluateDuplicateScore({
  distanceMeters: 20,
  categoryA: 'pothole',
  categoryB: 'broken_streetlight', // Unrelated (0.0)
  semanticSimilarity: 0.40,
  timeDiffHours: 2,
});
assert(
  dup5.isDuplicate === false && dup5.combinedScore < 0.65,
  `TEST 5: Close distance but different category is NOT duplicate. Score: ${dup5.combinedScore}`
);

// ----------------------------------------------------
// TEST 6: Same Category + 500m Distance -> Should NOT Be Duplicate (Outside 50m radius)
// ----------------------------------------------------
const dup6 = evaluateDuplicateScore({
  distanceMeters: 500,
  categoryA: 'pothole',
  categoryB: 'pothole',
  semanticSimilarity: 0.95,
  timeDiffHours: 1,
});
assert(
  dup6.isDuplicate === false && dup6.distanceScore === 0.0,
  `TEST 6: Distant incident (500m) has distanceScore 0 and is NOT duplicate. Score: ${dup6.combinedScore}`
);

// ----------------------------------------------------
// TEST 7: Same Category + Close Location (15m) + Low Semantic Similarity -> Should NOT Be Duplicate
// ----------------------------------------------------
const dup7 = evaluateDuplicateScore({
  distanceMeters: 15,
  categoryA: 'pothole',
  categoryB: 'pothole',
  semanticSimilarity: 0.20, // Very different visual description
  timeDiffHours: 120, // 5 days apart
});
assert(
  dup7.isDuplicate === false && dup7.combinedScore < 0.80,
  `TEST 7: Same category near but low semantic similarity and time gap is NOT duplicate. Score: ${dup7.combinedScore}`
);

// ----------------------------------------------------
// TEST 8: Old Incident -> Lower Recency Contribution
// ----------------------------------------------------
const freshRecency = calculateRecencyScore(Date.now() - 30 * 60 * 1000); // 30 mins ago
const oldRecency = calculateRecencyScore(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
assert(
  freshRecency === 70 && oldRecency === 10,
  `TEST 8: Recency decays from ${freshRecency} to ${oldRecency} for older incidents.`
);

// ----------------------------------------------------
// TEST 9: Cosine Similarity Vector Precision & Normalization
// ----------------------------------------------------
const vA = [1, 2, 3, 4, 5];
const vB = [1, 2, 3, 4, 5];
const vC = [-1, -2, -3, -4, -5];
const simIdentical = cosineSimilarity(vA, vB);
const simOpposite = cosineSimilarity(vA, vC);
assert(
  Math.abs(simIdentical - 1.0) < 0.0001 && simOpposite === 0.0,
  `TEST 9: Cosine similarity produces 1.0 for identical vectors and clamps negatives.`
);

// ----------------------------------------------------
// TEST 10: Accurate Real GPS Distance (Haversine calculation)
// ----------------------------------------------------
// Points ~111 meters apart on equator
const distMeters = calculateDistanceMeters(12.7302, 77.7099, 12.7302, 77.7109);
assert(
  distMeters > 90 && distMeters < 130,
  `TEST 10: Haversine distance correctly computes ~108m (${distMeters}m).`
);

console.log('\n====================================================');
console.log(`All ${passedTests} / ${totalTests} Phase 7 Engine Tests Passed Successfully!`);
console.log('====================================================');
