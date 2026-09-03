/**
 * Central Environment Configuration
 * 
 * Provides safe access to environment variables.
 * In Phase 1, keys are optional placeholders. In future phases,
 * missing required keys will log clear console warnings.
 */

export const env = {
  // Google Gemini API (Server-side)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    isConfigured: Boolean(process.env.GEMINI_API_KEY),
  },

  // Google Maps Platform (Client-side)
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || '',
    isConfigured: Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
  },

  // Firebase Client SDK (Client-side)
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
    isConfigured: Boolean(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ),
  },

  // FastAPI Python Backend (Client & Server)
  fastApi: {
    url: process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000',
    isConfigured: Boolean(process.env.NEXT_PUBLIC_FASTAPI_URL),
  },
} as const;
