'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Loader2, Navigation, MapPin } from 'lucide-react';
import { Button } from '@/components/common/Button';
import {
  MAPS_CONFIG,
  isGoogleMapsConfigured,
  getSeverityColor,
  getCategoryGlyph,
} from '@/config/maps';
import { CATEGORY_LABELS } from '@/types/analysis';
import type { PublicIncidentDocument } from '@/types/incident';
import type { GPSLocation } from '@/types/report';

interface CivicGoogleMapProps {
  incidents: PublicIncidentDocument[];
  selectedIncident: PublicIncidentDocument | null;
  onSelectIncident: (incident: PublicIncidentDocument) => void;
  userLocation: GPSLocation | null;
  onRefreshUserLocation?: () => void;
  className?: string;
}

let isGoogleMapsOptionsSet = false;

export const CivicGoogleMap: React.FC<CivicGoogleMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  userLocation,
  onRefreshUserLocation,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersMapRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(
    new Map()
  );
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const isConfigured = isGoogleMapsConfigured();
  const [loading, setLoading] = useState(isConfigured);
  const [loadError, setLoadError] = useState<string | null>(
    isConfigured ? null : 'MAPS_API_KEY_UNCONFIGURED'
  );
  const [markerLib, setMarkerLib] = useState<google.maps.MarkerLibrary | null>(null);

  const initialLocationRef = useRef(userLocation);
  const hasCenteredToUserRef = useRef(false);

  // Initialize Google Maps instance
  useEffect(() => {
    let isMounted = true;

    if (!isConfigured) {
      return;
    }

    async function loadMap() {
      if (!containerRef.current) return;

      try {
        if (!isGoogleMapsOptionsSet) {
          setOptions({
            key: MAPS_CONFIG.apiKey,
            v: 'weekly',
          });
          isGoogleMapsOptionsSet = true;
        }

        const [mapsLibrary, markerLibrary] = await Promise.all([
          importLibrary('maps') as Promise<google.maps.MapsLibrary>,
          importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
        ]);

        if (!isMounted || !containerRef.current) return;

        setMarkerLib(markerLibrary);

        const initialCenter = initialLocationRef.current
          ? {
              lat: initialLocationRef.current.latitude,
              lng: initialLocationRef.current.longitude,
            }
          : MAPS_CONFIG.defaultCenter;

        const map = new mapsLibrary.Map(containerRef.current, {
          center: initialCenter,
          zoom: MAPS_CONFIG.defaultZoom,
          minZoom: MAPS_CONFIG.minZoom,
          maxZoom: MAPS_CONFIG.maxZoom,
          mapId: MAPS_CONFIG.mapId,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          cameraControl: false,
        });

        mapInstanceRef.current = map;
        setLoading(false);
      } catch (err: unknown) {
        console.error('[CivicEye Google Maps Load Error]:', err);
        if (isMounted) {
          setLoadError(
            'Google Maps failed to initialize. Please verify your Maps API key and ensure Maps JavaScript API is enabled.'
          );
          setLoading(false);
        }
      }
    }

    loadMap();

    const markersMap = markersMapRef.current;

    return () => {
      isMounted = false;
      // Clean up markers
      markersMap.forEach((marker) => {
        marker.map = null;
      });
      markersMap.clear();
      if (userMarkerRef.current) {
        userMarkerRef.current.map = null;
        userMarkerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [isConfigured]); // Mount once with config check

  // Render & Update User Current Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markerLib || !userLocation) return;

    const { AdvancedMarkerElement } = markerLib;

    // Create custom pulsing blue circle with bulletproof inline styles
    const userLocationElement = document.createElement('div');
    userLocationElement.style.cssText =
      'position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; pointer-events: none;';
    userLocationElement.innerHTML = `
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; z-index: 10; width: 14px; height: 14px; border-radius: 50%; background-color: #3b82f6; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(59, 130, 246, 0.9);"></div>
    `;

    if (userMarkerRef.current) {
      userMarkerRef.current.position = {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };
    } else {
      const marker = new AdvancedMarkerElement({
        map,
        position: {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        },
        title: 'Your Current Location',
        content: userLocationElement,
        zIndex: 999, // Keep above incident markers
      });
      userMarkerRef.current = marker;
    }

    // Auto-center to user location when first detected
    if (!hasCenteredToUserRef.current) {
      map.panTo({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      map.setZoom(15);
      hasCenteredToUserRef.current = true;
    }
  }, [userLocation, markerLib]);

  // Render & Update Incident Markers with AdvancedMarkerElement
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markerLib) return;

    const { AdvancedMarkerElement, PinElement } = markerLib;
    const currentMarkerIds = new Set<string>();

    // Add or update markers for currently visible incidents
    incidents.forEach((inc) => {
      // Phase 7: Skip non-canonical duplicate reports to avoid overlapping markers
      if (inc.isCanonical === false) {
        return;
      }

      currentMarkerIds.add(inc.id);

      const isSelected = selectedIncident?.id === inc.id;
      const color = getSeverityColor(inc.severity);
      const isCluster = Boolean(inc.reportCount && inc.reportCount > 1);
      const glyph = isCluster
        ? String(inc.reportCount)
        : getCategoryGlyph(inc.category);
      const label = CATEGORY_LABELS[inc.category] || inc.category;

      const priorityStr = inc.priority
        ? ` [Priority ${inc.priority.score}/100 - ${inc.priority.level.toUpperCase()}]`
        : '';
      const countStr = isCluster ? ` (${inc.reportCount} Citizen Reports)` : '';

      const existingMarker = markersMapRef.current.get(inc.id);

      if (existingMarker) {
        // Update position if needed
        existingMarker.position = { lat: inc.latitude, lng: inc.longitude };
        if (isSelected) {
          existingMarker.zIndex = 100;
        }
      } else {
        // Create new pin
        const pin = new PinElement({
          background: color,
          borderColor: isSelected ? '#ffffff' : isCluster ? '#10b981' : 'rgba(255,255,255,0.7)',
          glyphColor: '#ffffff',
          glyph: glyph,
          scale: isSelected ? 1.25 : isCluster ? 1.15 : 1.0,
        });

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: inc.latitude, lng: inc.longitude },
          title: `${label}${countStr}${priorityStr}`,
          content: pin.element,
          zIndex: isSelected ? 100 : isCluster ? 50 : 10,
        });

        marker.addListener('click', () => {
          onSelectIncident(inc);
        });

        markersMapRef.current.set(inc.id, marker);
      }
    });

    // Remove markers that are no longer in the filtered list
    markersMapRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        marker.map = null;
        markersMapRef.current.delete(id);
      }
    });

    // Auto-center to the latest incident if citizen location is not yet acquired
    if (!hasCenteredToUserRef.current && incidents.length > 0 && !userLocation) {
      map.panTo({
        lat: incidents[0].latitude,
        lng: incidents[0].longitude,
      });
      map.setZoom(14);
      hasCenteredToUserRef.current = true;
    }
  }, [incidents, selectedIncident, markerLib, onSelectIncident, userLocation]);

  // Recenter on user's current GPS location
  const handleRecenterToUser = useCallback(() => {
    if (onRefreshUserLocation) {
      onRefreshUserLocation();
    }
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.panTo({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      mapInstanceRef.current.setZoom(16);
    }
  }, [userLocation, onRefreshUserLocation]);

  // Pan to selected incident when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedIncident) return;
    mapInstanceRef.current.panTo({
      lat: selectedIncident.latitude,
      lng: selectedIncident.longitude,
    });
  }, [selectedIncident]);

  return (
    <div className={`relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 ${className}`}>
      {/* Map DOM Target */}
      <div ref={containerRef} className="w-full h-full min-h-[500px]" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider">
              Loading Google Maps & Incident Markers...
            </span>
          </div>
        </div>
      )}

      {/* Floating Map Controls: Recenter to My Location */}
      {!loading && !loadError && (
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRecenterToUser}
            className="bg-slate-900/90 hover:bg-slate-800 text-xs shadow-md border-slate-700"
            title="Recenter to your current location"
            leftIcon={<Navigation className="w-3.5 h-3.5 text-blue-400" />}
          >
            My Location
          </Button>
        </div>
      )}

      {/* Map Configuration / Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center p-6 z-20">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
              <MapPin className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {loadError === 'MAPS_API_KEY_UNCONFIGURED'
                  ? 'Google Maps API Key Required'
                  : 'Map Engine Notice'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {loadError === 'MAPS_API_KEY_UNCONFIGURED'
                  ? 'To render live Google Maps with Advanced Markers, add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.'
                  : loadError}
              </p>
            </div>

            {loadError === 'MAPS_API_KEY_UNCONFIGURED' && (
              <div className="text-left bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-2">
                <span className="font-semibold text-slate-200 block">Setup Instructions:</span>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Open Google Cloud Console for project <code className="text-emerald-300 font-mono">civic-eye-56b8d</code></li>
                  <li>Enable the <strong>Maps JavaScript API</strong></li>
                  <li>Create or copy a browser API key</li>
                  <li>Add to <code className="text-emerald-300 font-mono">.env.local</code>:
                    <pre className="bg-slate-900 p-1.5 rounded mt-1 font-mono text-[10px] text-emerald-400">
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
                    </pre>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
