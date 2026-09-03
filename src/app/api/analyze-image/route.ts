import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { AiDetectionResult, IssueCategory, IssueSeverity } from '@/types/incident';

const SYSTEM_PROMPT = `
You are the CivicEye AI Vision Model, specialized in municipal defect triage and public hazard detection.
Analyze the provided image of a civic issue and return a JSON object with this EXACT structure:
{
  "detectedCategory": "pothole" | "garbage" | "blocked_drain" | "streetlight" | "fallen_tree" | "water_leak" | "other",
  "confidenceScore": number (float between 0.50 and 0.99),
  "detectedSeverity": "low" | "medium" | "high" | "critical",
  "tags": string[] (3-5 keywords describing visible hazards, e.g. ["asphalt crater", "traffic lane obstruction", "trip hazard"]),
  "rationale": string (1-2 concise sentences explaining what defect was identified and why the severity level was assigned)
}

Only return valid JSON without markdown fences.
`;

function getHeuristicFallback(filenameHint?: string): AiDetectionResult {
  const categories: Array<{
    category: IssueCategory;
    severity: IssueSeverity;
    tags: string[];
    rationale: string;
  }> = [
    {
      category: 'pothole',
      severity: 'high',
      tags: ['asphalt crater', 'road hazard', 'sub-base erosion'],
      rationale: 'Deep asphalt depression detected on transit roadway posing immediate vehicle wheel/suspension damage hazard.',
    },
    {
      category: 'garbage',
      severity: 'medium',
      tags: ['waste accumulation', 'overflowing bin', 'public health'],
      rationale: 'Substantial solid waste accumulation on pedestrian walkway requiring sanitation dispatch.',
    },
    {
      category: 'blocked_drain',
      severity: 'high',
      tags: ['storm drain obstruction', 'stagnant water', 'flood risk'],
      rationale: 'Debris blockage covering municipal storm drain grate with risk of localized road flooding during precipitation.',
    },
    {
      category: 'streetlight',
      severity: 'low',
      tags: ['luminaire malfunction', 'dark corridor', 'pole fixture'],
      rationale: 'Non-functional overhead street lighting fixture resulting in reduced nighttime intersection visibility.',
    },
    {
      category: 'fallen_tree',
      severity: 'critical',
      tags: ['fallen limb', 'blocked lane', 'powerline proximity'],
      rationale: 'Severed tree limb obstructing vehicular roadway with imminent hazard to traffic flow and overhead utilities.',
    },
    {
      category: 'water_leak',
      severity: 'high',
      tags: ['surface pooling', 'pressurized leak', 'utility water line'],
      rationale: 'Subsurface municipal water pipe failure creating pooling on curb and sidewalk infrastructure.',
    },
  ];

  // Try matching hint or pick deterministic entry based on string or timestamp
  const hint = (filenameHint || '').toLowerCase();
  let matched = categories.find((c) => hint.includes(c.category) || hint.includes(c.category.replace('_', '')));
  if (!matched) {
    matched = categories[Math.floor(Math.random() * categories.length)];
  }

  return {
    detectedCategory: matched.category,
    confidenceScore: 0.93,
    detectedSeverity: matched.severity,
    tags: matched.tags,
    rationale: `[AI Simulated Demo Mode] ${matched.rationale}`,
    analysisTimestamp: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, filename } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64 payload' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful demo/fallback mode when GEMINI_API_KEY is not configured
      const fallbackResult = getHeuristicFallback(filename);
      return NextResponse.json({
        ...fallbackResult,
        isSimulated: true,
      });
    }

    try {
      const client = new GoogleGenAI({ apiKey });
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const response = await client.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: SYSTEM_PROMPT,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText) as AiDetectionResult;

      return NextResponse.json({
        detectedCategory: parsed.detectedCategory || 'other',
        confidenceScore: parsed.confidenceScore || 0.85,
        detectedSeverity: parsed.detectedSeverity || 'medium',
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['civic issue'],
        rationale: parsed.rationale || 'Hazard identified by Gemini AI multimodal vision.',
        analysisTimestamp: new Date().toISOString(),
        isSimulated: false,
      });
    } catch (geminiError) {
      console.error('[CivicEye Gemini API] Gemini execution failed, using fallback:', geminiError);
      const fallbackResult = getHeuristicFallback(filename);
      return NextResponse.json({
        ...fallbackResult,
        isSimulated: true,
      });
    }
  } catch (error) {
    console.error('[CivicEye API] Analyze image error:', error);
    return NextResponse.json(
      { error: 'Failed to process image analysis' },
      { status: 500 }
    );
  }
}
