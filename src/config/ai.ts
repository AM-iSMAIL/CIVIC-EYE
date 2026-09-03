/**
 * Centralized Gemini AI Model Configuration
 *
 * All server-side Gemini interactions reference this configuration.
 * Uses gemini-3.5-flash as the primary stable model, with automatic
 * resilient fallbacks to avoid transient Google 503 high-demand spikes.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

export const GEMINI_FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'] as const;
