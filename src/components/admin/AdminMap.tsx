'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Navigation, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { MAPS_CONFIG } from '@/config/maps';
import { CATEGORY_LABELS } from '@/types/analysis';
import type { IncidentCluster } from '@/types/incident';

interface AdminMapProps {
  clusters: IncidentCluster[];
  onSelectCluster: (cluster: IncidentCluster) => void;
  selectedCluster?: IncidentCluster | null;
}

let isOptionsConfigured = false;

export const AdminMap: React.FC<AdminMapProps> = ({
  clusters,
  onSelectCluster,
  selectedCluster,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const adminMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [markerLib, setMarkerLib] = useState<google.maps.MarkerLibrary | null>(null);
  const [adminLocation, setAdminLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showDemoClusters, setShowDemoClusters] = useState(true);
  const hasAutoCenteredRef = useRef(false);

  // 1. Acquire Admin Browser GPS Location
  const locateAdmin = useCallback(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setAdminLocation(loc);
          setIsLocating(false);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat: loc.latitude, lng: loc.longitude });
            mapInstanceRef.current.setZoom(15);
          }
        },
        (err) => {
          console.warn('[CivicEye AdminMap] Geolocation error:', err);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (isMounted) {
            const loc = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            setAdminLocation(loc);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.panTo({ lat: loc.latitude, lng: loc.longitude });
              mapInstanceRef.current.setZoom(15);
            }
          }
        },
        (err) => {
          console.warn('[CivicEye AdminMap] Initial geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Generate Local Demonstration Clusters Around Admin Location with Varied Priorities
  const displayClusters = useMemo(() => {
    const center = adminLocation || {
      latitude: MAPS_CONFIG.defaultCenter.lat,
      longitude: MAPS_CONFIG.defaultCenter.lng,
    };

    if (!showDemoClusters) return clusters;

    const mockClusters: IncidentCluster[] = [
      {
        id: 'mock_cluster_crit_pothole',
        canonicalIncidentId: 'mock_inc_pothole_1',
        category: 'pothole',
        highestSeverity: 9,
        hazardLevel: 'critical',
        affectedUsers: ['drivers', 'cyclists', 'commuters'],
        status: 'reported',
        latitude: center.latitude + 0.0024,
        longitude: center.longitude + 0.0031,
        description: 'Severe structural road crater spanning the primary traffic lane. High risk of rim and tire blowout.',
        recommendedAction: 'Emergency municipal cold mix asphalt patch and high-visibility traffic cones deployment.',
        reportCount: 6,
        incidentIds: ['mock_p1', 'mock_p2', 'mock_p3', 'mock_p4', 'mock_p5', 'mock_p6'],
        priority: { score: 94, level: 'critical' },
        createdAt: '2026-09-03T05:30:00.000Z',
        updatedAt: '2026-09-03T06:30:00.000Z',
      },
      {
        id: 'mock_cluster_crit_wire',
        canonicalIncidentId: 'mock_inc_wire_2',
        category: 'exposed_wire',
        highestSeverity: 10,
        hazardLevel: 'critical',
        affectedUsers: ['pedestrians', 'children'],
        status: 'reported',
        latitude: center.latitude + 0.0015,
        longitude: center.longitude - 0.0038,
        description: 'Damaged underground junction box with exposed active conductors adjacent to pedestrian sidewalk.',
        recommendedAction: 'Immediate utility team dispatch, area cordoning with hazard tape, and conduit insulation.',
        reportCount: 8,
        incidentIds: ['mock_w1', 'mock_w2', 'mock_w3', 'mock_w4', 'mock_w5', 'mock_w6', 'mock_w7', 'mock_w8'],
        priority: { score: 98, level: 'critical' },
        createdAt: '2026-09-03T06:45:00.000Z',
        updatedAt: '2026-09-03T07:15:00.000Z',
      },
      {
        id: 'mock_cluster_high_drain',
        canonicalIncidentId: 'mock_inc_drain_3',
        category: 'blocked_drain',
        highestSeverity: 7,
        hazardLevel: 'high',
        affectedUsers: ['pedestrians', 'drivers'],
        status: 'acknowledged',
        latitude: center.latitude - 0.0028,
        longitude: center.longitude + 0.0022,
        description: 'Stormwater catchment grate congested by compacted silt and tree foliage, causing street pooling.',
        recommendedAction: 'Deploy municipal vacuum suction truck to clear subterranean drainage line.',
        reportCount: 4,
        incidentIds: ['mock_d1', 'mock_d2', 'mock_d3', 'mock_d4'],
        priority: { score: 71, level: 'high' },
        createdAt: '2026-09-03T01:00:00.000Z',
        updatedAt: '2026-09-03T05:00:00.000Z',
      },
      {
        id: 'mock_cluster_med_light',
        canonicalIncidentId: 'mock_inc_light_4',
        category: 'broken_streetlight',
        highestSeverity: 5,
        hazardLevel: 'medium',
        affectedUsers: ['pedestrians', 'commuters'],
        status: 'in_progress',
        latitude: center.latitude + 0.0036,
        longitude: center.longitude - 0.0021,
        description: 'Sodium vapor streetlight lamp failure, creating an unlit blind corridor along the residential road.',
        recommendedAction: 'Replace lamp unit with energy-efficient smart LED luminaire.',
        reportCount: 3,
        incidentIds: ['mock_l1', 'mock_l2', 'mock_l3'],
        priority: { score: 48, level: 'medium' },
        createdAt: '2026-09-02T14:00:00.000Z',
        updatedAt: '2026-09-03T03:00:00.000Z',
      },
      {
        id: 'mock_cluster_low_garbage',
        canonicalIncidentId: 'mock_inc_garbage_5',
        category: 'garbage',
        highestSeverity: 3,
        hazardLevel: 'low',
        affectedUsers: ['pedestrians'],
        status: 'reported',
        latitude: center.latitude - 0.0034,
        longitude: center.longitude - 0.0031,
        description: 'Overflowing curbside public waste receptacle with dry paper and plastic recyclables.',
        recommendedAction: 'Dispatch neighborhood sanitation collection crew and inspect bin volume.',
        reportCount: 1,
        incidentIds: ['mock_g1'],
        priority: { score: 22, level: 'low' },
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-09-02T16:00:00.000Z',
      },
    ];

    const realIds = new Set(clusters.map((c) => c.id));
    const mergedMocks = mockClusters.filter((m) => !realIds.has(m.id));
    return [...clusters, ...mergedMocks];
  }, [clusters, adminLocation, showDemoClusters]);

  // 3. Initialize Google Maps Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    if (!isOptionsConfigured) {
      setOptions({
        key: MAPS_CONFIG.apiKey,
        v: 'weekly',
      });
      isOptionsConfigured = true;
    }

    async function loadMap() {
      try {
        await importLibrary('maps');
        const markers = (await importLibrary('marker')) as google.maps.MarkerLibrary;
        setMarkerLib(markers);

        if (!mapContainerRef.current) return;

        const initialCenter = adminLocation
          ? { lat: adminLocation.latitude, lng: adminLocation.longitude }
          : displayClusters.length > 0
          ? { lat: displayClusters[0].latitude, lng: displayClusters[0].longitude }
          : MAPS_CONFIG.defaultCenter;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 15,
          mapId: MAPS_CONFIG.mapId,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
        });

        mapInstanceRef.current = map;
      } catch (err: unknown) {
        console.error('[CivicEye AdminMap] Loader failed:', err);
      }
    }

    loadMap();
  }, [displayClusters, adminLocation]);

  // 4. Render Admin Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markerLib || !adminLocation) return;

    const { AdvancedMarkerElement } = markerLib;

    const el = document.createElement('div');
    el.style.cssText =
      'position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; pointer-events: none;';
    el.innerHTML = `
      <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background-color: rgba(6, 182, 212, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; z-index: 10; width: 18px; height: 18px; border-radius: 50%; background-color: #06b6d4; border: 3px solid #ffffff; box-shadow: 0 0 14px rgba(6, 182, 212, 0.9);"></div>
    `;

    if (adminMarkerRef.current) {
      adminMarkerRef.current.position = {
        lat: adminLocation.latitude,
        lng: adminLocation.longitude,
      };
    } else {
      adminMarkerRef.current = new AdvancedMarkerElement({
        map,
        position: {
          lat: adminLocation.latitude,
          lng: adminLocation.longitude,
        },
        title: 'Admin Dispatch HQ / Current Location',
        content: el,
        zIndex: 999,
      });
    }

    if (!hasAutoCenteredRef.current) {
      map.panTo({ lat: adminLocation.latitude, lng: adminLocation.longitude });
      map.setZoom(15);
      hasAutoCenteredRef.current = true;
    }
  }, [adminLocation, markerLib]);

  // 5. Render & Synchronize Cluster Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markerLib) return;

    const { AdvancedMarkerElement, PinElement } = markerLib;
    const currentClusterIds = new Set<string>();

    displayClusters.forEach((cluster) => {
      currentClusterIds.add(cluster.id);

      const isSelected = selectedCluster?.id === cluster.id;
      const priScore = cluster.priority?.score ?? cluster.highestSeverity * 10;
      const priLevel = cluster.priority?.level || (priScore >= 75 ? 'critical' : priScore >= 50 ? 'high' : 'medium');

      const color =
        priLevel === 'critical'
          ? '#f43f5e'
          : priLevel === 'high'
          ? '#f97316'
          : priLevel === 'medium'
          ? '#06b6d4'
          : '#10b981';

      const existingMarker = markersRef.current.get(cluster.id);

      if (existingMarker) {
        existingMarker.position = { lat: cluster.latitude, lng: cluster.longitude };
        if (isSelected) existingMarker.zIndex = 100;
      } else {
        const isMulti = cluster.reportCount > 1;
        const glyph = isMulti ? String(cluster.reportCount) : '!';

        const pin = new PinElement({
          background: color,
          borderColor: isSelected ? '#ffffff' : isMulti ? '#10b981' : 'rgba(255,255,255,0.7)',
          glyphColor: '#ffffff',
          glyph,
          scale: isSelected ? 1.3 : isMulti ? 1.15 : 1.0,
        });

        const label = CATEGORY_LABELS[cluster.category] || cluster.category;
        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: cluster.latitude, lng: cluster.longitude },
          title: `[${priLevel.toUpperCase()}] ${label} (${cluster.reportCount} reports, Priority ${priScore})`,
          content: pin.element,
          zIndex: isSelected ? 100 : priScore,
        });

        marker.addListener('click', () => {
          onSelectCluster(cluster);
        });

        markersRef.current.set(cluster.id, marker);
      }
    });

    // Remove deleted markers
    markersRef.current.forEach((marker, id) => {
      if (!currentClusterIds.has(id)) {
        marker.map = null;
        markersRef.current.delete(id);
      }
    });
  }, [displayClusters, markerLib, selectedCluster, onSelectCluster]);

  return (
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Action Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={locateAdmin}
          disabled={isLocating}
          className="bg-white/95 backdrop-blur-md border-slate-200 text-xs text-slate-800 shadow-md hover:bg-slate-50"
          leftIcon={
            isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
            )
          }
        >
          {adminLocation ? 'Center to My Location' : 'Locate My Position'}
        </Button>

        <button
          type="button"
          onClick={() => setShowDemoClusters(!showDemoClusters)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
            showDemoClusters
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-white/95 text-slate-600 border-slate-200 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>{showDemoClusters ? 'Demo Clusters: ON' : 'Demo Clusters: OFF'}</span>
        </button>
      </div>

      {/* Floating Tactical Legend Overlay */}
      <div className="absolute top-3 right-3 z-10 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 text-[11px] space-y-1.5 shadow-md font-mono">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 font-sans">
            Cluster Priority Legend
          </span>
          <span className="text-[9px] text-blue-700 font-bold px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-100">
            {displayClusters.length} Active Pins
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-blue-700 font-bold">Admin HQ Location</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-600">Critical (75–100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-600">High (50–74)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-600">Medium (25–49)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Low (0–24)</span>
        </div>
        <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-sans">
          *Pin numbers denote reports
        </div>
      </div>
    </div>
  );
};
