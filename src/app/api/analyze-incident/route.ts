import { NextRequest, NextResponse } from 'next/server';
import { analyzeCivicIncident, GeminiServiceError } from '@/services/gemini';

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB limit
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
]);

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content-Type must be multipart/form-data with an "image" field.',
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const imageEntry = formData.get('image');

    if (!imageEntry || !(imageEntry instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing image file. Please provide an image under the form field "image".',
        },
        { status: 400 }
      );
    }

    const mimeType = imageEntry.type || 'image/jpeg';

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported image format (${mimeType}). Supported formats: JPEG, PNG, WebP, HEIC.`,
        },
        { status: 400 }
      );
    }

    if (imageEntry.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Image file is too large (${(imageEntry.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 15MB.`,
        },
        { status: 413 }
      );
    }

    // Convert file to buffer for in-memory processing
    const arrayBuffer = await imageEntry.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Call server-side Gemini service
    const analysis = await analyzeCivicIncident(imageBuffer, mimeType);

    return NextResponse.json(
      {
        success: true,
        analysis,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof GeminiServiceError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
          code: err.code,
        },
        { status: err.statusCode }
      );
    }

    // Default safe fallback without exposing internal stack traces
    return NextResponse.json(
      {
        success: false,
        error: "CivicEye AI couldn't analyze this photo. Please try again.",
      },
      { status: 500 }
    );
  }
}
