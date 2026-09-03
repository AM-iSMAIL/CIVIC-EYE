/**
 * FastAPI Backend Client (Placeholder Stub for Phase 3)
 * 
 * Will communicate with the high-performance Python FastAPI service for advanced analytics,
 * automated department routing, and automated notifications.
 */
import { env } from '@/config/env';

export const API_BASE_URL = env.fastApi.url;

export function getFastApiStatus(): { isConfigured: boolean; baseUrl: string } {
  return {
    isConfigured: env.fastApi.isConfigured,
    baseUrl: API_BASE_URL,
  };
}
