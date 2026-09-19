import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

const MAX_BASE64_SIZE = 700 * 1024; // 700 KB limit per image in Redis

function getRedis(): Redis | null {
  const rawUrl = process.env.UPSTASH_REDIS_REST_URL;
  const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!rawUrl || !rawToken) return null;
  const url = rawUrl.trim().replace(/^['"']|['"']$/g, '');
  const token = rawToken.trim().replace(/^['"']|['"']$/g, '');
  return new Redis({ url, token });
}

/**
 * POST /api/upload
 * Accepts a base64 image data URL and stores it in Redis.
 * Returns a persistent /api/upload?id=XXX URL that any user can fetch.
 */
export async function POST(req: Request) {
  try {
    const { id, dataUrl } = await req.json();

    if (!id || !dataUrl) {
      return NextResponse.json({ success: false, error: 'id and dataUrl required' }, { status: 400 });
    }

    if (!dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ success: false, error: 'Only image data URLs are supported' }, { status: 400 });
    }

    // Check size limit
    const byteSize = Buffer.byteLength(dataUrl, 'utf8');
    if (byteSize > MAX_BASE64_SIZE) {
      return NextResponse.json({
        success: false,
        error: `Image too large (${Math.round(byteSize / 1024)}KB). Please use an image under 500KB or provide a YouTube/external URL.`
      }, { status: 413 });
    }

    const redis = getRedis();
    const key = `tradinghath:media:${id}`;

    if (redis) {
      // Store with 1-year TTL
      await redis.set(key, dataUrl, { ex: 365 * 24 * 60 * 60 });
    } else {
      // Local fallback — no-op (IndexedDB handles it client-side)
      console.warn('[upload] No Redis configured, image not persisted server-side.');
    }

    const publicUrl = `/api/upload?id=${encodeURIComponent(id)}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('[upload] POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/upload?id=XXX
 * Serves the stored image to any user (browser, mobile).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response('Missing id parameter', { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return new Response('Storage not configured', { status: 503 });
  }

  try {
    const key = `tradinghath:media:${id}`;
    const dataUrl = await redis.get<string>(key);
    if (!dataUrl) {
      return new Response('Image not found', { status: 404 });
    }

    // Parse the data URL: data:image/jpeg;base64,<data>
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
      return new Response('Invalid image data', { status: 500 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error('[upload] GET error:', err);
    return new Response('Internal error', { status: 500 });
  }
}
