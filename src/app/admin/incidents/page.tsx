'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { IncidentFilters } from '@/components/admin/IncidentFilters';
import { IncidentTable } from '@/components/admin/IncidentTable';
import { IncidentDetailModal } from '@/components/admin/IncidentDetailModal';
import { subscribeToAdminIncidents } from '@/services/admin';
import type { AdminIncidentFilters, AdminIncidentRow } from '@/types/admin';

const DEFAULT_FILTERS: AdminIncidentFilters = {
  searchQuery: '',
  category: 'all',
  priority: 'all',
  status: 'all',
  hazard: 'all',
  sortBy: 'priority',
  sortOrder: 'desc',
};

export default function AdminIncidentsPage() {
  const [filters, setFilters] = useState<AdminIncidentFilters>(DEFAULT_FILTERS);
  const [incidents, setIncidents] = useState<AdminIncidentRow[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<AdminIncidentRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAdminIncidents(filters, (rows) => {
      setIncidents(rows);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filters]);

  const handleFilterChange = (updated: Partial<AdminIncidentFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Incident Management Table"
        description="Filter, inspect, and dispatch active civic infrastructure incidents across municipal boundaries."
        breadcrumbs={[
          { label: 'Admin Hub', href: '/admin' },
          { label: 'Incidents Table' },
        ]}
      />

      {/* Filter Toolbar */}
      <IncidentFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalCount={incidents.length}
      />

      {/* Realtime Incident Table */}
      <IncidentTable
        incidents={incidents}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        loading={loading}
      />

      {/* Detailed Inspection Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={() => {
            // Updated in real time via Firestore listener
          }}
        />
      )}
    </div>
  );
}
