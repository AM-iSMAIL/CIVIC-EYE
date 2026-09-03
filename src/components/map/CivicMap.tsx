'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { IncidentReport } from '@/types/incident';
import { Loader2, Layers, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { env } from '@/config/env';
import { DEFAULT_VIEWPORT } from '@/services/maps';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';

interface CivicMapProps {
  incidents: IncidentReport[];
  selectedIncident: IncidentReport | null;
  onSelectIncident: (incident: IncidentReport) => void;
  className?: string;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('leaflet');
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markersGroupRef = useRef<LayerGroup | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const googleMarkersRef = useRef<google.maps.Marker[]>([]);

  // Severity to HEX color helper
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#f43f5e'; // Rose-500
      case 'high':
        return '#f97316'; // Orange-500
      case 'medium':
        return '#06b6d4'; // Cyan-500
      default:
        return '#10b981'; // Emerald-500
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!containerRef.current) return;

      const hasGoogleKey = env.googleMaps.isConfigured;

      if (hasGoogleKey) {
        // --- Initialize Google Maps using modern functional API ---
        try {
          const { setOptions, importLibrary } = await import('@googlemaps/js-api-loader');
          setOptions({
            key: env.googleMaps.apiKey,
          });

          const { Map: GoogleMap } = (await importLibrary('maps')) as google.maps.MapsLibrary;
          if (!isMounted || !containerRef.current) return;

          setMapEngine('google');
          const center = {
            lat: DEFAULT_VIEWPORT.center.latitude,
            lng: DEFAULT_VIEWPORT.center.longitude,
          };

          const gMap = new GoogleMap(containerRef.current, {
            center,
            zoom: DEFAULT_VIEWPORT.zoom,
            mapId: env.googleMaps.mapId || undefined,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          googleMapRef.current = gMap;
          setLoading(false);
          return;
        } catch (gErr) {
          console.warn('[CivicEye Map] Google Maps failed to load, falling back to Leaflet:', gErr);
        }
      }

      // --- Initialize Leaflet Engine (Fallback) ---
      try {
        // Inject Leaflet CSS once if not present
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        const L = await import('leaflet');
        if (!isMounted || !containerRef.current) return;

        setMapEngine('leaflet');

        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }

        const map = L.map(containerRef.current, {
          center: [DEFAULT_VIEWPORT.center.latitude, DEFAULT_VIEWPORT.center.longitude],
          zoom: DEFAULT_VIEWPORT.zoom,
          zoomControl: false,
        });

        // Dark-themed tiles from CartoDB
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        leafletMapRef.current = map;
        markersGroupRef.current = markersLayer;

        setLoading(false);
      } catch (lErr) {
        console.error('[CivicEye Map] Leaflet map failed to initialize:', lErr);
        setLoading(false);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Markers whenever incidents change
  useEffect(() => {
    if (mapEngine === 'leaflet' && leafletMapRef.current && markersGroupRef.current) {
      import('leaflet').then((L) => {
        if (!markersGroupRef.current) return;
        markersGroupRef.current.clearLayers();

        incidents.forEach((incident) => {
          const coords = incident.location.coordinates;
          if (!coords) return;

          const color = getSeverityColor(incident.severity);
          const isSelected = selectedIncident?.id === incident.id;

          const customIcon = L.divIcon({
            className: 'civic-marker',
            html: `
              <div style="
                width: ${isSelected ? '28px' : '20px'};
                height: ${isSelected ? '28px' : '20px'};
                background: ${color};
                border: 2px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 0 ${isSelected ? '14px' : '8px'} ${color};
                cursor: pointer;
                transition: transform 0.2s ease;
              "></div>
            `,
            iconSize: [isSelected ? 28 : 20, isSelected ? 28 : 20],
            iconAnchor: [isSelected ? 14 : 10, isSelected ? 14 : 10],
          });

          const marker = L.marker([coords.latitude, coords.longitude], {
            icon: customIcon,
          });

          marker.on('click', () => {
            onSelectIncident(incident);
          });

          const popupContent = `
            <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; max-width: 200px;">
              <strong style="display: block; margin-bottom: 4px; font-size: 13px;">${incident.title || 'Civic Incident'}</strong>
              <div style="margin-bottom: 4px; color: #64748b;">${incident.location.address || 'Address not resolved'}</div>
              <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background: ${color}22; color: ${color};">
                ${incident.severity.toUpperCase()} PRIORITY
              </span>
            </div>
          `;
          marker.bindPopup(popupContent);

          markersGroupRef.current?.addLayer(marker);
        });
      });
    }

    if (mapEngine === 'google' && googleMapRef.current) {
      // Clear old google markers
      googleMarkersRef.current.forEach((m) => m.setMap(null));
      googleMarkersRef.current = [];

      incidents.forEach((incident) => {
        const coords = incident.location.coordinates;
        if (!coords || !googleMapRef.current) return;

        const color = getSeverityColor(incident.severity);
        const marker = new window.google.maps.Marker({
          position: { lat: coords.latitude, lng: coords.longitude },
          map: googleMapRef.current,
          title: incident.title || 'Incident',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: selectedIncident?.id === incident.id ? 10 : 7,
          },
        });

        marker.addListener('click', () => {
          onSelectIncident(incident);
        });

        googleMarkersRef.current.push(marker);
      });
    }
  }, [incidents, selectedIncident, mapEngine, onSelectIncident]);

  // Pan to selected incident coordinates
  useEffect(() => {
    if (!selectedIncident?.location.coordinates) return;
    const { latitude, longitude } = selectedIncident.location.coordinates;

    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      leafletMapRef.current.flyTo([latitude, longitude], 15, { duration: 1.2 });
    } else if (mapEngine === 'google' && googleMapRef.current) {
      googleMapRef.current.panTo({ lat: latitude, lng: longitude });
      googleMapRef.current.setZoom(15);
    }
  }, [selectedIncident, mapEngine]);

  const handleZoomIn = () => {
    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    } else if (mapEngine === 'google' && googleMapRef.current) {
      const currentZoom = googleMapRef.current.getZoom() ?? DEFAULT_VIEWPORT.zoom;
      googleMapRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
    } else if (mapEngine === 'google' && googleMapRef.current) {
      const currentZoom = googleMapRef.current.getZoom() ?? DEFAULT_VIEWPORT.zoom;
      googleMapRef.current.setZoom(currentZoom - 1);
    }
  };

  const handleRecenter = () => {
    if (incidents.length > 0 && incidents[0].location.coordinates) {
      const { latitude, longitude } = incidents[0].location.coordinates;
      if (mapEngine === 'leaflet' && leafletMapRef.current) {
        leafletMapRef.current.setView([latitude, longitude], DEFAULT_VIEWPORT.zoom);
      } else if (mapEngine === 'google' && googleMapRef.current) {
        googleMapRef.current.setCenter({ lat: latitude, lng: longitude });
        googleMapRef.current.setZoom(DEFAULT_VIEWPORT.zoom);
      }
    } else {
      if (mapEngine === 'leaflet' && leafletMapRef.current) {
        leafletMapRef.current.setView(
          [DEFAULT_VIEWPORT.center.latitude, DEFAULT_VIEWPORT.center.longitude],
          DEFAULT_VIEWPORT.zoom
        );
      }
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 ${className}`}>
      {/* Map DOM Target */}
      <div ref={containerRef} className="w-full h-full min-h-[450px]" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-emerald-400 z-10">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm font-medium text-slate-300">
            Initializing City Map Layer...
          </span>
        </div>
      )}

      {/* Map Engine Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-md text-xs text-slate-300">
        <Layers className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-medium">
          {mapEngine === 'google' ? 'Google Maps Platform' : 'Interactive Map (OSM/Leaflet)'}
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-emerald-400 font-mono font-medium">
          {incidents.length} {incidents.length === 1 ? 'Pin' : 'Pins'}
        </span>
      </div>

      {/* Custom Map Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-200 shadow-md transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-200 shadow-md transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-200 shadow-md transition-colors"
          title="Recenter Map"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-[11px] text-slate-300 shadow-md">
        <span className="text-slate-400 font-medium">Severity:</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Critical
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> High
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Low
        </span>
      </div>
    </div>
  );
};
