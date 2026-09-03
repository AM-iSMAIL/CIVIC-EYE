'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminMap } from '@/components/admin/AdminMap';
import { IncidentDetailModal } from '@/components/admin/IncidentDetailModal';
import { subscribeToAdminClusters } from '@/services/admin';
import type { IncidentCluster } from '@/types/incident';
import type { AdminIncidentRow } from '@/types/admin';

export default function AdminMapPage() {
  const [clusters, setClusters] = useState<IncidentCluster[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<AdminIncidentRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAdminClusters((data) => {
      setClusters(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectCluster = (cluster: IncidentCluster) => {
    // Map cluster to AdminIncidentRow for the detail modal
    const row: AdminIncidentRow = {
      id: cluster.canonicalIncidentId || cluster.id,
      category: cluster.category,
      severity: cluster.highestSeverity,
      hazardLevel: cluster.hazardLevel,
      status: cluster.status,
      latitude: cluster.latitude,
      longitude: cluster.longitude,
      description: cluster.description,
      recommendedAction: cluster.recommendedAction,
      reportCount: cluster.reportCount,
      priority: cluster.priority,
      isCluster: cluster.reportCount > 1,
      clusterId: cluster.id,
      createdAt: typeof cluster.createdAt === 'string' ? cluster.createdAt : new Date().toISOString(),
    };

    setSelectedIncident(row);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Tactical Cluster Map"
        description="Geospatial visualization of consolidated civic defect clusters. Individual duplicate reports are unified under representative pins."
        breadcrumbs={[
          { label: 'Admin Hub', href: '/admin' },
          { label: 'Tactical Map' },
        ]}
      />

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">
          Loading cluster coordinates from Firestore...
        </div>
      ) : (
        <AdminMap
          clusters={clusters}
          onSelectCluster={handleSelectCluster}
        />
      )}

      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
