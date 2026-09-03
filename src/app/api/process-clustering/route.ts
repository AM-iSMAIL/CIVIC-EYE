import { NextRequest, NextResponse } from 'next/server';
import { processIncidentClustering } from '@/services/clustering';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { incidentId } = body || {};

    if (!incidentId || typeof incidentId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Field "incidentId" (string) is required.',
        },
        { status: 400 }
      );
    }

    const result = await processIncidentClustering(incidentId);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to process clustering for incident ${incidentId}.`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clustering: result,
    });
  } catch (err: unknown) {
    console.error('[API /api/process-clustering Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal clustering error',
      },
      { status: 500 }
    );
  }
}
