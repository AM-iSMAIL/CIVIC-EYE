'use client';

import React, { useState } from 'react';
import {
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { GPSLocation } from '@/types/report';
import type { GeolocationError } from '@/hooks/useGeolocation';

interface LocationCaptureProps {
  location: GPSLocation | null;
  loading: boolean;
  error: GeolocationError | null;
  isStale: boolean;
  onRefresh: () => void;
}

export const LocationCapture: React.FC<LocationCaptureProps> = ({
  location,
  loading,
  error,
  isStale,
  onRefresh,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              STEP 1: Incident Location
            </h3>
            <p className="text-xs text-slate-400">
              Capturing your real GPS coordinates at the scene
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          leftIcon={
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-400 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          }
        >
          {loading ? 'Acquiring...' : 'Refresh Location'}
        </Button>
      </div>

      {/* Main State Readout */}
      {loading && !location && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
          <div>
            <span className="font-semibold text-white block">
              Waiting for your location...
            </span>
            <span className="text-slate-400">
              Requesting high-accuracy GPS fix from browser.
            </span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-rose-200 block">
                {error.code === 'denied'
                  ? 'Location Access Required'
                  : error.code === 'unsupported'
                  ? 'Geolocation Unavailable'
                  : 'Location Acquisition Failed'}
              </span>
              <p className="text-rose-300 leading-relaxed">{error.message}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="text-rose-200 border-rose-700/60 hover:bg-rose-950/60"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {location && (
        <div className="space-y-3">
          {/* Primary Human-Friendly Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/50 gap-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-sm font-semibold text-emerald-200 block">
                  Location detected
                </span>
                <span className="text-xs text-emerald-400/90 font-mono">
                  Accuracy ±{location.accuracy}m
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors self-end sm:self-auto"
            >
              <span>{showDetails ? 'Hide details' : 'Location details'}</span>
              {showDetails ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Stale Warning (older than 30s) */}
          {isStale && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  GPS fix is older than 30 seconds. Refresh for an updated position before saving.
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="text-amber-200 border-amber-700/60 hover:bg-amber-950/50 shrink-0 ml-2"
              >
                Refresh
              </Button>
            </div>
          )}

          {/* Expandable Technical Coordinates */}
          {showDetails && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  Latitude
                </span>
                <span className="text-slate-200 font-medium">
                  {location.latitude.toFixed(6)}°
                </span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  Longitude
                </span>
                <span className="text-slate-200 font-medium">
                  {location.longitude.toFixed(6)}°
                </span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  Acquired At
                </span>
                <span className="text-slate-300 text-[11px]">
                  {new Date(location.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
