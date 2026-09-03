import { GoogleGenAI, Type } from '@google/genai';
import { GEMINI_MODEL, GEMINI_FALLBACK_MODELS } from '@/config/ai';
import {
  CivicIncidentAnalysisSchema,
  type CivicIncidentAnalysis,
  CIVIC_CATEGORIES,
  HAZARD_LEVELS,
  AFFECTED_USER_GROUPS,
} from '@/types/analysis';

/**
 * System prompt instructing Gemini on civic infrastructure analysis rules.
 */
const SYSTEM_PROMPT = `
You are CivicEye's visual civic-infrastructure analysis engine.
Your role is to inspect the submitted photograph and determine whether it contains a civic or municipal infrastructure defect.

Evaluation steps:
1. Look carefully at the entire image.
2. Identify the most prominent civic or municipal issue.
3. Classify it into exactly one of the allowed categories:
   - pothole: Road surface holes, asphalt cratering, severe road depression.
   - garbage: Illegal dumping, overflowing trash bins, uncollected street waste.
   - blocked_drain: Clogged stormwater drains, waterlogged gutters with debris.
   - broken_streetlight: Damaged, hanging, or non-functional public lamp posts.
   - fallen_tree: Tree branches or entire trees blocking roads, sidewalks, or lines.
   - damaged_sidewalk: Cracked, buckled, or missing pedestrian pavement/footpaths.
   - damaged_road_sign: Missing, bent, graffiti-covered, or obscured traffic signs.
   - exposed_wire: Exposed electrical cables, loose utility wires posing shock hazards.
   - other: Any other municipal or civic infrastructure defect.
   - no_civic_issue: Normal road, landscape, indoor room, or picture with no clear civic defect.
4. Estimate severity as an integer from 1 (minor cosmetic defect) to 10 (life-threatening hazard).
5. Estimate confidence score from 0.0 to 1.0 based on visual clarity and certainty.
6. Determine hazardLevel: "low", "medium", "high", or "critical". Critical is strictly reserved for severe dangers (e.g. exposed live power wires, sinkholes, road-wide obstructions).
7. Determine affected user groups from: "pedestrians", "cyclists", "two_wheeler_users", "motorists", "wheelchair_users", "public_transport_users", or "none".
8. Provide a concise, factual description based ONLY on visible evidence in the frame.
9. Recommend a practical municipal response or repair action.

CRITICAL INSTRUCTIONS:
- Never invent facts, measurements, or unobserved details.
- Never claim an exact pothole depth, road width, or distance unless visibly measurable.
- Do not infer GPS coordinates, exact address, or timestamps.
- Do not identify private individuals or classify people.
- Only analyze the civic/infrastructure condition.
- If no civic problem exists, output category "no_civic_issue", severity 1, and hazardLevel "low".
`;

export class GeminiServiceError extends Error {
  statusCode: number;
  code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'GEMINI_ERROR'
  ) {
    super(message);
    this.name = 'GeminiServiceError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Server-Side function to analyze an incident image using Google Gemini Multimodal Vision.
 *
 * @param imageBuffer - Node.js Buffer containing raw image bytes
 * @param mimeType - MIME type of the image (e.g. image/jpeg, image/png, image/webp)
 * @returns Validated CivicIncidentAnalysis object
 */
export async function analyzeCivicIncident(
  imageBuffer: Buffer,
  mimeType: string
): Promise<CivicIncidentAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiServiceError(
      'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to your .env.local file.',
      500,
      'MISSING_API_KEY'
    );
  }

  // Initialize Gemini client strictly with server environment variable
  const ai = new GoogleGenAI({ apiKey });

  const base64Data = imageBuffer.toString('base64');

  const modelsToTry = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS];
  let lastError: unknown = null;
  let responseText = '';

  try {
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: 'Inspect this image for municipal or civic infrastructure damage. Output your analysis according to the structured JSON schema.',
                },
              ],
            },
          ],
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  enum: [...CIVIC_CATEGORIES],
                },
                severity: {
                  type: Type.INTEGER,
                  description: 'Integer from 1 to 10 based on visible risk',
                },
                confidence: {
                  type: Type.NUMBER,
                  description: 'Confidence score from 0.0 to 1.0',
                },
                hazardLevel: {
                  type: Type.STRING,
                  enum: [...HAZARD_LEVELS],
                },
                affectedUsers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                    enum: [...AFFECTED_USER_GROUPS],
                  },
                },
                description: {
                  type: Type.STRING,
                  description: 'Short factual description based strictly on visible evidence',
                },
                recommendedAction: {
                  type: Type.STRING,
                  description: 'Practical civic response recommendation',
                },
              },
              required: [
                'category',
                'severity',
                'confidence',
                'hazardLevel',
                'affectedUsers',
                'description',
                'recommendedAction',
              ],
            },
          },
        });

        responseText = response.text || '';
        if (responseText) {
          break; // Successfully obtained response
        }
      } catch (err: unknown) {
        lastError = err;
        const errorObj = err as { status?: number; message?: string };
        const errorMessage = errorObj.message || '';
        console.warn(`[Gemini Model ${model} Failed]:`, errorMessage);

        // If error is high demand (503), immediately try next model in fallback list
        if (
          errorMessage.includes('503') ||
          errorMessage.includes('high demand') ||
          errorObj.status === 503
        ) {
          continue;
        }

        // If authentication error (401/403), fail fast
        if (errorMessage.includes('401') || errorMessage.includes('403')) {
          break;
        }
      }
    }

    if (!responseText) {
      if (lastError) throw lastError;
      throw new GeminiServiceError(
        'Gemini returned an empty response.',
        502,
        'EMPTY_RESPONSE'
      );
    }

    // Strip markdown code fences if present (e.g. ```json ... ```)
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
    }

    let parsedJson: Record<string, unknown>;
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch {
      console.error('[Gemini Malformed JSON]:', responseText);
      throw new GeminiServiceError(
        'Gemini output could not be parsed as valid JSON.',
        502,
        'MALFORMED_JSON'
      );
    }

    // Normalize field variations that LLMs occasionally output
    if (typeof parsedJson.severity === 'number') {
      parsedJson.severity = Math.round(Math.min(10, Math.max(1, parsedJson.severity)));
    }
    if (typeof parsedJson.confidence === 'number' && parsedJson.confidence > 1) {
      parsedJson.confidence = Math.min(1, parsedJson.confidence / 100);
    }
    if (typeof parsedJson.hazardLevel === 'string') {
      parsedJson.hazardLevel = (parsedJson.hazardLevel as string).toLowerCase();
    }
    if (typeof parsedJson.category === 'string') {
      parsedJson.category = (parsedJson.category as string).toLowerCase();
    }

    // Strict validation against Zod schema
    const validationResult = CivicIncidentAnalysisSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      console.error('[Gemini Schema Validation Error]:', validationResult.error.format());
      console.error('[Gemini Raw Parsed JSON]:', parsedJson);
      throw new GeminiServiceError(
        'Gemini response did not conform to the expected CivicEye schema.',
        502,
        'SCHEMA_VALIDATION_FAILED'
      );
    }

    return validationResult.data;
  } catch (err: unknown) {
    if (err instanceof GeminiServiceError) {
      throw err;
    }

    console.error('[Gemini Service Upstream Error]:', err);

    const errorObj = err as { status?: number; message?: string };
    const errorMessage = errorObj.message || 'Unknown error occurred during Gemini analysis.';

    // Check for rate limit or quota exhaustion (HTTP 429)
    if (
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.toLowerCase().includes('rate limit') ||
      errorObj.status === 429
    ) {
      throw new GeminiServiceError(
        'Gemini API rate limit reached. Please wait a moment and try again.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // Check for unauthorized / invalid key (HTTP 401/403)
    if (
      errorMessage.includes('401') ||
      errorMessage.includes('403') ||
      errorMessage.toLowerCase().includes('api key')
    ) {
      throw new GeminiServiceError(
        'Gemini authentication failed. Please verify your GEMINI_API_KEY.',
        401,
        'AUTHENTICATION_FAILED'
      );
    }

    // If there is a descriptive error from Gemini, include it safely
    const safeDetail = errorMessage.length < 150 ? `: ${errorMessage}` : '.';
    throw new GeminiServiceError(
      `CivicEye AI service encountered an upstream error analyzing the image${safeDetail}`,
      502,
      'UPSTREAM_ERROR'
    );
  }
}
