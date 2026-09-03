'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Map as MapIcon,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { CivicGoogleMap } from '@/components/map/CivicGoogleMap';
import { IncidentMapCard } from '@/components/map/IncidentMapCard';
import { MapFilters } from '@/components/map/MapFilters';
import {
  subscribeToPublicIncidents,
  syncUserIncidentsToPublic,
} from '@/services/firestore';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { PublicIncidentDocument } from '@/types/incident';
import type { MapCategoryFilter, MapSeverityFilter } from '@/types/map';

export default function MapPage() {
  const [incidents, setIncidents] = useState<PublicIncidentDocument[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<PublicIncidentDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<MapCategoryFilter>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<MapSeverityFilter>('all');

  // Real browser geolocation for citizen center
  const { location: userLocation, detectLocation } = useGeolocation();

  // Subscribe to real-time public incidents from Firestore
  useEffect(() => {
    // Development backfill of user's own existing incidents
    syncUserIncidentsToPublic().catch(() => {});

    const unsubscribe = subscribeToPublicIncidents((records) => {
      setIncidents(records);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtered incidents based on active category & severity
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Category filter
      if (selectedCategory !== 'all' && inc.category !== selectedCategory) {
        return false;
      }
      // Severity / Hazard filter
      if (selectedSeverity !== 'all' && inc.hazardLevel !== selectedSeverity) {
        return false;
      }
      return true;
    });
  }, [incidents, selectedCategory, selectedSeverity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Civic Incident Map"
        description="Live geospatial visualization of citizen-reported infrastructure defects. Data is updated in real time from Cloud Firestore."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
            Phase 6: Live Google Maps
          </span>
        }
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Civic Map' },
        ]}
      />

      {/* Filter Toolbar */}
      <MapFilters
        selectedCategory={selectedCategory}
        selectedSeverity={selectedSeverity}
        onCategoryChange={setSelectedCategory}
        onSeverityChange={setSelectedSeverity}
        totalCount={incidents.length}
        filteredCount={filteredIncidents.length}
      />

      {/* Main Map Viewport & Detail Container */}
      <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
        <CivicGoogleMap
          incidents={filteredIncidents}
          selectedIncident={selectedIncident}
          onSelectIncident={setSelectedIncident}
          userLocation={userLocation}
          onRefreshUserLocation={detectLocation}
          className="w-full h-full"
        />

        {/* Selected Incident Drawer / Card */}
        {selectedIncident && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10">
            <IncidentMapCard
              incident={selectedIncident}
              onClose={() => setSelectedIncident(null)}
            />
          </div>
        )}

        {/* Empty Filter State Overlay (if 0 matches) */}
        {!loading && incidents.length > 0 && filteredIncidents.length === 0 && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 max-w-sm w-full px-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-lg space-y-1.5">
              <span className="text-xs font-bold text-slate-900 block">
                No matching incidents in view
              </span>
              <p className="text-[11px] text-slate-500">
                Try switching filters to &quot;All Issues&quot; or &quot;All Severities&quot;.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSeverity('all');
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        {/* No Incidents In Firestore State */}
        {!loading && incidents.length === 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-sm w-full px-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-lg space-y-2">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-900">
                  No Civic Incidents in View
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Your area is clear! Click below to report a new infrastructure defect.
              </p>
              <Link href="/report" className="inline-block">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Report an Issue
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
