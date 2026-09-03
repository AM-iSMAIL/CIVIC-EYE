'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GPSLocation } from '@/types/report';

export interface GeolocationError {
  code: 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'unknown';
  message: string;
}

export interface UseGeolocationReturn {
  location: GPSLocation | null;
  loading: boolean;
  error: GeolocationError | null;
  isStale: boolean;
  detectLocation: () => Promise<GPSLocation | null>;
}

const STALE_THRESHOLD_MS = 30000; // 30 seconds

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // Periodically refresh `now` to recalculate staleness accurately
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const isStale = Boolean(
    location && now && now - location.timestamp > STALE_THRESHOLD_MS
  );

  const detectLocation = useCallback((): Promise<GPSLocation | null> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        const err: GeolocationError = {
          code: 'unsupported',
          message: 'Location services are unavailable on this device/browser.',
        };
        setError(err);
        setLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const freshLocation: GPSLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            timestamp: position.timestamp || Date.now(),
          };

          setLocation(freshLocation);
          setError(null);
          setLoading(false);
          resolve(freshLocation);
        },
        (geoErr) => {
          let code: GeolocationError['code'] = 'unknown';
          let message = 'Unable to determine your location. Please try again.';

          switch (geoErr.code) {
            case geoErr.PERMISSION_DENIED:
              code = 'denied';
              message =
                'Location access was denied. Please enable location permissions in your browser settings to accurately place this civic report.';
              break;
            case geoErr.POSITION_UNAVAILABLE:
              code = 'unavailable';
              message =
                'Location signal is currently unavailable. Please check your GPS and try again.';
              break;
            case geoErr.TIMEOUT:
              code = 'timeout';
              message = 'Location request timed out. Please try again.';
              break;
          }

          const err: GeolocationError = { code, message };
          setError(err);
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  // Attempt initial acquisition on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      detectLocation();
    }, 0);
    return () => clearTimeout(timer);
  }, [detectLocation]);

  return {
    location,
    loading,
    error,
    isStale,
    detectLocation,
  };
}
