'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Clock,
  MapPin,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { IncidentDetailModal } from '@/components/admin/IncidentDetailModal';
import { AdminMap } from '@/components/admin/AdminMap';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import {
  getAdminDashboardStats,
  subscribeToPriorityQueue,
  subscribeToAdminIncidents,
  subscribeToAdminClusters,
} from '@/services/admin';
import type { AdminDashboardStats as DashboardStatsType, AdminIncidentRow } from '@/types/admin';
import type { IncidentCluster } from '@/types/incident';
import { CATEGORY_LABELS } from '@/types/analysis';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStatsType>({
    totalIncidents: 0,
    activeIssues: 0,
    criticalCount: 0,
    highCount: 0,
    duplicateReportsCount: 0,
    resolvedCount: 0,
    avgPriorityScore: 0,
  });
  const [priorityQueue, setPriorityQueue] = useState<AdminIncidentRow[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<AdminIncidentRow[]>([]);
  const [clusters, setClusters] = useState<IncidentCluster[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<AdminIncidentRow | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    setIsRefreshing(true);
    const data = await getAdminDashboardStats();
    setStats(data);
    setIsRefreshing(false);
  }, []);

  const handleSelectCluster = useCallback((cluster: IncidentCluster) => {
    const row: AdminIncidentRow = {
      id: cluster.canonicalIncidentId || cluster.id,
      category: cluster.category,
      severity: cluster.highestSeverity,
      hazardLevel: cluster.hazardLevel,
      status: cluster.status,
      latitude: cluster.latitude,
      longitude: cluster.longitude,
      accuracy: 10,
      description: cluster.description,
      recommendedAction: cluster.recommendedAction,
      reportCount: cluster.reportCount,
      priority: cluster.priority,
      isCluster: cluster.reportCount > 1,
      clusterId: cluster.id,
      createdAt: typeof cluster.createdAt === 'string' ? cluster.createdAt : new Date().toISOString(),
    };
    setSelectedIncident(row);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getAdminDashboardStats().then((data) => {
      if (isMounted) setStats(data);
    });

    // Subscribe to highest-priority active queue (top 4)
    const unsubPriority = subscribeToPriorityQueue((rows) => {
      if (isMounted) setPriorityQueue(rows.slice(0, 4));
    });

    // Subscribe to recent reports (top 6 newest)
    const unsubRecent = subscribeToAdminIncidents(
      {
        searchQuery: '',
        category: 'all',
        priority: 'all',
        status: 'all',
        hazard: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      (rows) => {
        setRecentIncidents(rows.slice(0, 6));
      }
    );

    // Subscribe to live clusters for the map
    const unsubClusters = subscribeToAdminClusters((data) => {
      if (isMounted) setClusters(data);
    });

    return () => {
      isMounted = false;
      unsubPriority();
      unsubRecent();
      unsubClusters();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminHeader
        title="Civic Command Center"
        description="Municipal operations dashboard for real-time civic defect triage, priority scoring, and field dispatch tracking."
        breadcrumbs={[{ label: 'Admin Hub', href: '/admin' }, { label: 'Overview' }]}
        onRefresh={loadStats}
        isRefreshing={isRefreshing}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/incidents">
              <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                View All Incidents
              </Button>
            </Link>
          </div>
        }
      />

      {/* Real Firestore KPI Stats */}
      <DashboardStats stats={stats} />

      {/* Main Grid: Priority Issues Feed & Recent Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Triage Queue Preview */}
        <div className="lg:col-span-7">
          <Card className="border-slate-800 bg-slate-900/90 h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Top Priority Dispatch Queue
                </CardTitle>
                <Link href="/admin/priority">
                  <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Queue
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Urgent civic hazards ranked strictly by deterministic Phase 7 priority scores.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-start">
              {priorityQueue.length === 0 ? (
                <EmptyState
                  icon={<ShieldAlert className="w-6 h-6 text-emerald-400" />}
                  title="No Urgent Defects Pending"
                  description="All recorded civic defects have either been resolved or triaged."
                />
              ) : (
                <div className="space-y-3">
                  {priorityQueue.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIncident(item)}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-white text-xs sm:text-sm group-hover:text-emerald-400 transition-colors truncate">
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                            Score: {item.priority?.score ?? item.severity * 10}
                          </span>
                          <StatusBadge type="status" value={item.status} size="sm" />
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-1 pl-8">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between pl-8 pt-1 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {item.latitude.toFixed(4)}°, {item.longitude.toFixed(4)}°
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          {item.reportCount} {item.reportCount === 1 ? 'Report' : 'Reports'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Incident Feed */}
        <div className="lg:col-span-5">
          <Card className="border-slate-800 bg-slate-900/90 h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Chronological Intake Stream
                </CardTitle>
                <Link href="/admin/incidents">
                  <Button variant="outline" size="sm">
                    View Table
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Real-time chronological stream of citizen submissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-start">
              {recentIncidents.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="w-6 h-6 text-slate-400" />}
                  title="No Incidents in Stream"
                  description="When citizens report issues, live entries will stream here."
                />
              ) : (
                <div className="space-y-2.5">
                  {recentIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-white block truncate">
                          {CATEGORY_LABELS[inc.category] || inc.category}
                        </span>
                        <span className="text-slate-500 text-[11px] font-mono block truncate">
                          {new Date(inc.createdAt).toLocaleDateString()} • {inc.description}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <StatusBadge type="status" value={inc.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Tactical Cluster Map Card */}
      <Card className="border-slate-800 bg-slate-900/90 overflow-hidden">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Live City GIS • Tactical Cluster Map
              </CardTitle>
              <CardDescription>
                Geospatial visualization of consolidated civic defects and high-density duplicate clusters across the municipality.
              </CardDescription>
            </div>
            <Link href="/admin/map">
              <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Dedicated Map View
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <AdminMap
            clusters={clusters}
            onSelectCluster={handleSelectCluster}
          />
        </CardContent>
      </Card>

      {/* Incident Detail Inspection Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={() => {
            loadStats();
          }}
        />
      )}
    </div>
  );
}
