/**
 * Google Maps Platform & Geospatial Service
 *
 * Manages geolocation, reverse geocoding, and map viewport helpers.
 */
import { env } from '@/config/env';
import type { Coordinates, GeolocationData } from '@/types/incident';

export function isGoogleMapsAvailable(): boolean {
  return env.googleMaps.isConfigured;
}

export interface MapViewportOptions {
  center: Coordinates;
  zoom: number;
}

// Default fallback viewport (City Center benchmark)
export const DEFAULT_VIEWPORT: MapViewportOptions = {
  center: {
    latitude: 28.6139,
    longitude: 77.209,
  },
  zoom: 13,
};

/**
 * Reverse geocode latitude and longitude into a human-readable street address.
 * Uses OpenStreetMap Nominatim for free client-side resolution with fallback.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (!res.ok) throw new Error('Geocoding response not ok');
    const data = await res.json();
    if (data && data.display_name) {
      // Shorten display name to first 3-4 segments
      const parts = data.display_name.split(', ');
      return parts.slice(0, 4).join(', ');
    }
    return `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
  } catch {
    return `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
  }
}

/**
 * Retrieve current browser geolocation coordinates and accuracy.
 */
export function getBrowserGeolocation(): Promise<GeolocationData> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: Coordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        };

        const address = await reverseGeocode(coords.latitude, coords.longitude);

        resolve({
          coordinates: coords,
          address,
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

