'use client';

import React, { useState } from 'react';
import { MapPin, Crosshair, Loader2, CheckCircle2, AlertCircle, Compass } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { getBrowserGeolocation } from '@/services/maps';
import type { GeolocationData } from '@/types/incident';

interface LocationTrackerProps {
  locationData: GeolocationData;
  onLocationUpdated: (data: GeolocationData) => void;
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({
  locationData,
  onLocationUpdated,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDetectLocation = async () => {
    setIsLocating(true);
    setErrorMsg(null);
    try {
      const geo = await getBrowserGeolocation();
      onLocationUpdated(geo);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMsg(e.message || 'Unable to retrieve your location. Check browser GPS permissions.');
    } finally {
      setIsLocating(false);
    }
  };

  const hasCoords = Boolean(locationData.coordinates);

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Incident Location</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDetectLocation}
          disabled={isLocating}
          leftIcon={
            isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            )
          }
        >
          {isLocating ? 'Acquiring GPS...' : hasCoords ? 'Re-detect GPS' : 'Detect Location'}
        </Button>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {hasCoords ? (
        <div className="space-y-2 text-xs">
          {/* Coordinates & Accuracy */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Coordinates
              </span>
              <span className="font-mono text-emerald-300 font-medium">
                {locationData.coordinates?.latitude.toFixed(5)}°, {locationData.coordinates?.longitude.toFixed(5)}°
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                GPS Accuracy
              </span>
              <span className="font-mono text-cyan-300 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                ±{locationData.coordinates?.accuracy ?? 15} meters
              </span>
            </div>
          </div>

          {/* Resolved Address */}
          {locationData.address && (
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
                Resolved Street Address
              </span>
              <span className="text-slate-200 font-medium block">
                {locationData.address}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
          <Compass className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Click &quot;Detect Location&quot; to stamp exact GPS coordinates onto this report.</span>
        </div>
      )}
    </div>
  );
};
