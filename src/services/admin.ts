/**
 * CivicEye Phase 8: Admin Data Service
 *
 * Centralized data access, real-time telemetry subscriptions,
 * synchronized multi-document status updates, and municipal analytics.
 */

import {
  doc,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  query,
  limit,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type {
  AdminDashboardStats,
  AdminIncidentRow,
  AdminIncidentFilters,
  AdminAnalyticsData,
} from '@/types/admin';
import { ALLOWED_STATUS_TRANSITIONS } from '@/types/admin';
import type { CivicCategory, HazardLevel } from '@/types/analysis';
import { CATEGORY_LABELS } from '@/types/analysis';
import type {
  IncidentDocument,
  IncidentCluster,
  IssueStatus,
  PublicIncidentDocument,
} from '@/types/incident';

/**
 * Normalizes Firestore document dates/timestamps into ISO strings.
 */
function normalizeDate(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'number') return new Date(val).toISOString();
  return new Date().toISOString();
}

/**
 * Subscribes to the live Incident Table with client-side search, filtering, and sorting.
 */
export function subscribeToAdminIncidents(
  filters: AdminIncidentFilters,
  onData: (rows: AdminIncidentRow[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) {
    onData([]);
    return () => {};
  }

  // Use publicIncidents as primary base (includes clusters and deduplicated records)
  const collRef = collection(db, 'publicIncidents');
  const q = query(collRef, limit(200));

  return onSnapshot(
    q,
    (snapshot) => {
      const allRows: AdminIncidentRow[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as PublicIncidentDocument;
        const category = (data.category || 'other') as CivicCategory;
        const severity = Number(data.severity ?? 5);
        const hazardLevel = (data.hazardLevel || 'medium') as HazardLevel;
        const status = (data.status || 'reported') as IssueStatus;
        const reportCount = Number(data.reportCount ?? 1);
        const priority = data.priority || {
          score: severity * 10,
          level: severity >= 8 ? 'critical' : severity >= 6 ? 'high' : severity >= 4 ? 'medium' : 'low',
        };

        return {
          id: docSnap.id,
          category,
          severity,
          hazardLevel,
          status,
          latitude: Number(data.latitude ?? 0),
          longitude: Number(data.longitude ?? 0),
          accuracy: Number(data.accuracy ?? 0),
          description: data.description ?? '',
          recommendedAction: data.recommendedAction ?? '',
          reportCount,
          priority,
          isCluster: reportCount > 1,
          clusterId: data.clusterId || null,
          createdAt: normalizeDate(data.createdAt),
        };
      });

      // Apply Filter Pipeline
      const filtered = allRows.filter((row) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const qLower = filters.searchQuery.toLowerCase();
          const matchDesc = row.description.toLowerCase().includes(qLower);
          const matchCat = row.category.toLowerCase().includes(qLower);
          const matchLabel = (CATEGORY_LABELS[row.category] || '').toLowerCase().includes(qLower);
          const matchId = row.id.toLowerCase().includes(qLower);
          if (!matchDesc && !matchCat && !matchLabel && !matchId) {
            return false;
          }
        }

        // Category filter
        if (filters.category !== 'all' && row.category !== filters.category) {
          return false;
        }

        // Priority filter
        if (filters.priority !== 'all' && row.priority.level !== filters.priority) {
          return false;
        }

        // Status filter
        if (filters.status !== 'all' && row.status !== filters.status) {
          return false;
        }

        // Hazard filter
        if (filters.hazard !== 'all' && row.hazardLevel !== filters.hazard) {
          return false;
        }

        return true;
      });

      // Apply Sorting
      filtered.sort((a, b) => {
        let diff = 0;
        if (filters.sortBy === 'priority') {
          diff = (a.priority.score || 0) - (b.priority.score || 0);
        } else if (filters.sortBy === 'severity') {
          diff = a.severity - b.severity;
        } else if (filters.sortBy === 'reports') {
          diff = a.reportCount - b.reportCount;
        } else if (filters.sortBy === 'createdAt') {
          diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }

        return filters.sortOrder === 'asc' ? diff : -diff;
      });

      onData(filtered);
    },
    (err) => {
      console.error('[CivicEye Admin] Incident subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to the live Priority Queue (active civic defects ordered by priority score descending).
 */
export function subscribeToPriorityQueue(
  onData: (rows: AdminIncidentRow[]) => void,
  limitCount = 50,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) {
    onData([]);
    return () => {};
  }

  const collRef = collection(db, 'publicIncidents');
  const q = query(collRef, limit(limitCount * 2));

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: AdminIncidentRow[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as PublicIncidentDocument;
          const severity = Number(data.severity ?? 5);
          const priority = data.priority || {
            score: severity * 10,
            level: severity >= 8 ? 'critical' : severity >= 6 ? 'high' : severity >= 4 ? 'medium' : 'low',
          };

          return {
            id: docSnap.id,
            category: (data.category || 'other') as CivicCategory,
            severity,
            hazardLevel: (data.hazardLevel || 'medium') as HazardLevel,
            status: (data.status || 'reported') as IssueStatus,
            latitude: Number(data.latitude ?? 0),
            longitude: Number(data.longitude ?? 0),
            accuracy: Number(data.accuracy ?? 0),
            description: data.description ?? '',
            recommendedAction: data.recommendedAction ?? '',
            reportCount: Number(data.reportCount ?? 1),
            priority,
            isCluster: Boolean(data.reportCount && data.reportCount > 1),
            clusterId: data.clusterId || null,
            createdAt: normalizeDate(data.createdAt),
          };
        })
        // Active issues only (exclude resolved and rejected)
        .filter((row) => row.status !== 'resolved' && row.status !== 'rejected')
        // Sort strictly by Priority Score DESC, then Severity DESC, then Date ASC
        .sort((a, b) => {
          const scoreDiff = (b.priority.score || 0) - (a.priority.score || 0);
          if (scoreDiff !== 0) return scoreDiff;

          const sevDiff = b.severity - a.severity;
          if (sevDiff !== 0) return sevDiff;

          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
        .slice(0, limitCount);

      onData(rows);
    },
    (err) => {
      console.error('[CivicEye Admin] Priority queue subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to live consolidated clusters for the tactical Admin Map.
 */
export function subscribeToAdminClusters(
  onData: (clusters: IncidentCluster[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const firestore = db;
  if (!firestore) {
    onData([]);
    return () => {};
  }

  const collRef = collection(firestore, 'incidentClusters');
  const q = query(collRef, limit(100));

  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty) {
        // Fallback: populate clusters dynamically from publicIncidents
        try {
          const pubColl = collection(firestore, 'publicIncidents');
          const pubSnap = await getDocs(query(pubColl, limit(100)));
          const fallbackClusters: IncidentCluster[] = pubSnap.docs.map((docSnap) => {
            const d = docSnap.data() as PublicIncidentDocument;
            const sev = Number(d.severity ?? 5);
            return {
              id: d.clusterId || `cluster_${docSnap.id}`,
              canonicalIncidentId: docSnap.id,
              category: d.category || 'other',
              highestSeverity: sev,
              hazardLevel: d.hazardLevel || 'medium',
              affectedUsers: d.affectedUsers || ['pedestrians'],
              status: d.status || 'reported',
              latitude: Number(d.latitude ?? 0),
              longitude: Number(d.longitude ?? 0),
              description: d.description ?? '',
              recommendedAction: d.recommendedAction ?? '',
              reportCount: Number(d.reportCount ?? 1),
              incidentIds: [docSnap.id],
              priority: d.priority || { score: sev * 10, level: 'medium' },
              createdAt: normalizeDate(d.createdAt),
              updatedAt: normalizeDate(d.createdAt),
            };
          });
          onData(fallbackClusters);
          return;
        } catch (e) {
          console.warn('[CivicEye Admin] Fallback public incidents query error:', e);
        }
      }

      const clusters: IncidentCluster[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as IncidentCluster;
        return {
          ...data,
          id: docSnap.id,
          reportCount: Number(data.reportCount ?? 1),
          latitude: Number(data.latitude ?? 0),
          longitude: Number(data.longitude ?? 0),
          highestSeverity: Number(data.highestSeverity ?? 5),
          priority: data.priority || { score: 50, level: 'medium' },
          status: data.status || 'reported',
          createdAt: normalizeDate(data.createdAt),
          updatedAt: normalizeDate(data.updatedAt),
        };
      });

      onData(clusters);
    },
    (err) => {
      console.error('[CivicEye Admin] Cluster subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Fetches comprehensive incident details including private reporter information (Admin-only).
 */
export async function getAdminIncidentDetails(
  incidentId: string
): Promise<{
  incident: IncidentDocument | null;
  publicIncident: PublicIncidentDocument | null;
  cluster: IncidentCluster | null;
}> {
  if (!db) {
    return { incident: null, publicIncident: null, cluster: null };
  }

  let incident: IncidentDocument | null = null;
  let publicIncident: PublicIncidentDocument | null = null;
  let cluster: IncidentCluster | null = null;

  // 1. Fetch private incident (contains reporter UID/email/name)
  try {
    const incSnap = await getDoc(doc(db, 'incidents', incidentId));
    if (incSnap.exists()) {
      incident = { ...(incSnap.data() as IncidentDocument), id: incSnap.id };
    }
  } catch (privErr) {
    console.warn('[CivicEye Admin] Private document fetch warning:', privErr);
  }

  // 2. Fetch public incident
  try {
    const pubSnap = await getDoc(doc(db, 'publicIncidents', incidentId));
    if (pubSnap.exists()) {
      publicIncident = { ...(pubSnap.data() as PublicIncidentDocument), id: pubSnap.id };
    }
  } catch (pubErr) {
    console.warn('[CivicEye Admin] Public document fetch warning:', pubErr);
  }

  // 3. Fetch cluster if referenced
  const clusterId =
    incident?.clusterId || publicIncident?.clusterId || `cluster_${incidentId}`;
  try {
    const clSnap = await getDoc(doc(db, 'incidentClusters', clusterId));
    if (clSnap.exists()) {
      cluster = { ...(clSnap.data() as IncidentCluster), id: clSnap.id };
    }
  } catch (clErr) {
    console.warn('[CivicEye Admin] Cluster fetch warning:', clErr);
  }

  return { incident, publicIncident, cluster };
}

/**
 * Synchronized status update across private incidents, public map representation, and clusters.
 */
export async function updateIncidentStatus(
  incidentId: string,
  newStatus: IssueStatus,
  currentStatus: IssueStatus = 'reported',
  clusterId?: string | null,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: 'Database uninitialized.' };
  }

  // Validate allowed status transition
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus) && currentStatus !== newStatus) {
    return {
      success: false,
      error: `Invalid transition from "${currentStatus}" to "${newStatus}".`,
    };
  }

  const currentAdminUid = auth?.currentUser?.uid || 'unknown_admin';
  const historyEntry = {
    status: newStatus,
    changedAt: new Date().toISOString(),
    changedByUid: currentAdminUid,
    note: note || `Status updated to ${newStatus} by municipal operator.`,
  };

  try {
    // 1. Update private incident
    const incRef = doc(db, 'incidents', incidentId);
    try {
      const snap = await getDoc(incRef);
      if (snap.exists()) {
        const existingHistory = snap.data()?.statusHistory || [];
        await updateDoc(incRef, {
          status: newStatus,
          statusHistory: [...existingHistory, historyEntry],
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn('[CivicEye Admin] Private incident status write warning:', e);
    }

    // 2. Update public sanitized incident record
    const pubRef = doc(db, 'publicIncidents', incidentId);
    try {
      await updateDoc(pubRef, {
        status: newStatus,
      });
    } catch (e) {
      console.warn('[CivicEye Admin] Public incident status write warning:', e);
    }

    // 3. Update consolidated cluster record if linked
    const targetClusterId = clusterId || `cluster_${incidentId}`;
    const clusterRef = doc(db, 'incidentClusters', targetClusterId);
    try {
      const clSnap = await getDoc(clusterRef);
      if (clSnap.exists()) {
        await updateDoc(clusterRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn('[CivicEye Admin] Cluster status write warning:', e);
    }

    console.log(
      `[CivicEye Admin] Status successfully updated for ${incidentId} -> ${newStatus}`
    );
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update status';
    console.error('[CivicEye Admin] Status update error:', err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Computes high-level municipal KPI aggregates from real Firestore collections.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  if (!db) {
    return {
      totalIncidents: 0,
      activeIssues: 0,
      criticalCount: 0,
      highCount: 0,
      duplicateReportsCount: 0,
      resolvedCount: 0,
      avgPriorityScore: 0,
    };
  }

  try {
    const snap = await getDocs(collection(db, 'publicIncidents'));
    const all = snap.docs.map((d) => d.data() as PublicIncidentDocument);

    let criticalCount = 0;
    let highCount = 0;
    let activeIssues = 0;
    let resolvedCount = 0;
    let prioritySum = 0;
    let duplicateReportsCount = 0;

    all.forEach((inc) => {
      const sev = Number(inc.severity ?? 5);
      const priScore = inc.priority?.score ?? sev * 10;
      const priLevel = inc.priority?.level || (priScore >= 75 ? 'critical' : priScore >= 50 ? 'high' : 'medium');
      const isResolved = inc.status === 'resolved';
      const isRejected = inc.status === 'rejected';

      if (!isResolved && !isRejected) {
        activeIssues++;
      }
      if (isResolved) {
        resolvedCount++;
      }
      if (priLevel === 'critical') {
        criticalCount++;
      } else if (priLevel === 'high') {
        highCount++;
      }

      if (inc.reportCount && inc.reportCount > 1) {
        duplicateReportsCount += inc.reportCount - 1;
      }

      prioritySum += priScore;
    });

    const totalIncidents = all.length + duplicateReportsCount;
    const avgPriorityScore = all.length > 0 ? Math.round(prioritySum / all.length) : 0;

    return {
      totalIncidents,
      activeIssues,
      criticalCount,
      highCount,
      duplicateReportsCount,
      resolvedCount,
      avgPriorityScore,
    };
  } catch (err) {
    console.error('[CivicEye Admin] Stats aggregation error:', err);
    return {
      totalIncidents: 0,
      activeIssues: 0,
      criticalCount: 0,
      highCount: 0,
      duplicateReportsCount: 0,
      resolvedCount: 0,
      avgPriorityScore: 0,
    };
  }
}

/**
 * Computes lightweight real municipal analytics from Firestore data.
 */
export async function getAdminAnalytics(): Promise<AdminAnalyticsData> {
  const fallback: AdminAnalyticsData = {
    categoryDistribution: [],
    priorityDistribution: [],
    statusDistribution: [],
    totalClusters: 0,
    totalReports: 0,
    duplicateConsensusRate: 0,
    avgReportsPerCluster: 1.0,
  };

  if (!db) return fallback;

  try {
    const snap = await getDocs(collection(db, 'publicIncidents'));
    const all = snap.docs.map((d) => d.data() as PublicIncidentDocument);

    const catCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {
      reported: 0,
      acknowledged: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    };
    const priCounts: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    let totalRawReports = 0;
    let duplicateReports = 0;

    all.forEach((inc) => {
      const cat = inc.category || 'other';
      catCounts[cat] = (catCounts[cat] || 0) + (inc.reportCount || 1);

      const status = inc.status || 'reported';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      const priLevel = inc.priority?.level || 'medium';
      priCounts[priLevel] = (priCounts[priLevel] || 0) + 1;

      const count = inc.reportCount || 1;
      totalRawReports += count;
      if (count > 1) {
        duplicateReports += count - 1;
      }
    });

    const totalClusters = all.length;
    const categoryDistribution = Object.entries(catCounts).map(([cat, count]) => ({
      category: cat as CivicCategory,
      label: CATEGORY_LABELS[cat as CivicCategory] || cat,
      count,
      percentage: totalRawReports > 0 ? Math.round((count / totalRawReports) * 100) : 0,
    }));

    const priorityDistribution = Object.entries(priCounts).map(([tier, count]) => ({
      tier: tier as 'critical' | 'high' | 'medium' | 'low',
      count,
      percentage: totalClusters > 0 ? Math.round((count / totalClusters) * 100) : 0,
    }));

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as IssueStatus,
      count,
      percentage: totalClusters > 0 ? Math.round((count / totalClusters) * 100) : 0,
    }));

    const duplicateConsensusRate =
      totalRawReports > 0 ? Math.round((duplicateReports / totalRawReports) * 100) : 0;
    const avgReportsPerCluster =
      totalClusters > 0 ? Math.round((totalRawReports / totalClusters) * 10) / 10 : 1.0;

    return {
      categoryDistribution,
      priorityDistribution,
      statusDistribution,
      totalClusters,
      totalReports: totalRawReports,
      duplicateConsensusRate,
      avgReportsPerCluster,
    };
  } catch (err) {
    console.error('[CivicEye Admin] Analytics aggregation error:', err);
    return fallback;
  }
}
