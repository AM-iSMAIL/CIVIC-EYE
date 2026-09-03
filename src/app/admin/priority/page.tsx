'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PriorityQueue } from '@/components/admin/PriorityQueue';
import { IncidentDetailModal } from '@/components/admin/IncidentDetailModal';
import { subscribeToPriorityQueue } from '@/services/admin';
import type { AdminIncidentRow } from '@/types/admin';

export default function AdminPriorityPage() {
  const [incidents, setIncidents] = useState<AdminIncidentRow[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<AdminIncidentRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPriorityQueue((rows) => {
      setIncidents(rows);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Municipal Priority Queue"
        description="Ranked triage stream for active civic defects. Consumes Phase 7 priority calculations without client recalculation."
        breadcrumbs={[
          { label: 'Admin Hub', href: '/admin' },
          { label: 'Priority Queue' },
        ]}
      />

      <PriorityQueue
        incidents={incidents}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        loading={loading}
      />

      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
