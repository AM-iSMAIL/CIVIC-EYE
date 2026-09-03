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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950 tracking-wide uppercase">
              STEP 1: Incident Location
            </h3>
            <p className="text-xs text-slate-500">
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
              className={`w-3.5 h-3.5 text-blue-600 ${
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
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          <div>
            <span className="font-bold text-slate-900 block">
              Waiting for your location...
            </span>
            <span className="text-slate-500">
              Requesting high-accuracy GPS fix from browser.
            </span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-rose-900 block">
                {error.code === 'denied'
                  ? 'Location Access Required'
                  : error.code === 'unsupported'
                  ? 'Geolocation Unavailable'
                  : 'Location Acquisition Failed'}
              </span>
              <p className="text-rose-700 leading-relaxed">{error.message}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="text-rose-700 border-rose-300 hover:bg-rose-100"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {location && (
        <div className="space-y-3">
          {/* Primary Human-Friendly Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 gap-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-sm font-bold text-emerald-950 block">
                  Location detected
                </span>
                <span className="text-xs text-emerald-700 font-mono font-medium">
                  Accuracy ±{location.accuracy}m
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors self-end sm:self-auto cursor-pointer font-medium"
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
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  GPS fix is older than 30 seconds. Refresh for an updated position before saving.
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="text-amber-800 border-amber-300 hover:bg-amber-100 shrink-0 ml-2"
              >
                Refresh
              </Button>
            </div>
          )}

          {/* Expandable Technical Coordinates */}
          {showDetails && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-medium">
                  Latitude
                </span>
                <span className="text-slate-900 font-bold">
                  {location.latitude.toFixed(6)}°
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-medium">
                  Longitude
                </span>
                <span className="text-slate-900 font-bold">
                  {location.longitude.toFixed(6)}°
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-medium">
                  Acquired At
                </span>
                <span className="text-slate-700 text-[11px] font-medium">
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
