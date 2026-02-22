import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

const parseYouTubeId = (value: string) => {
  const input = value.trim();
  const idPattern = /^[A-Za-z0-9_-]{11}$/;
  if (idPattern.test(input)) {
    return input;
  }

  const queryMatch = input.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (queryMatch?.[1]) {
    return queryMatch[1];
  }
  const shortMatch = input.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch?.[1]) {
    return shortMatch[1];
  }
  const shortsMatch = input.match(/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
  if (shortsMatch?.[1]) {
    return shortsMatch[1];
  }

  try {
    const normalized = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      const candidate = parsed.pathname.replace('/', '').split('/')[0] ?? '';
      return idPattern.test(candidate) ? candidate : '';
    }

    if (host.endsWith('youtube.com')) {
      const queryId = parsed.searchParams.get('v') ?? '';
      if (idPattern.test(queryId)) {
        return queryId;
      }
      const parts = parsed.pathname.split('/').filter(Boolean);
      const watchLike = parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live';
      if (watchLike) {
        const pathId = parts[1] ?? '';
        return idPattern.test(pathId) ? pathId : '';
      }
    }
  } catch {
    return '';
  }

  return '';
};

type RouteContext = { params: { id: string } | Promise<{ id: string }> };

const resolveVideoId = async (context: RouteContext) => {
  const resolvedParams = await Promise.resolve(context.params);
  return resolvedParams.id;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const body = (await request.json()) as {
      videoId?: string;
      titleAr?: string;
      description?: string;
      order?: number;
    };
    const docId = await resolveVideoId(context);
    if (!docId) {
      return NextResponse.json({ message: 'Missing video id.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof body.videoId === 'string') {
      const parsedVideoId = parseYouTubeId(body.videoId);
      if (!parsedVideoId) {
        return NextResponse.json({ message: 'Invalid YouTube video link or id.' }, { status: 400 });
      }
      updates.id = parsedVideoId;
      updates.youtubeId = parsedVideoId;
    }
    if (typeof body.titleAr === 'string') {
      updates.title_ar = body.titleAr.trim();
    }
    if (typeof body.description === 'string') {
      const trimmedDescription = body.description.trim();
      if (!trimmedDescription) {
        return NextResponse.json({ message: 'Description is required.' }, { status: 400 });
      }
      updates.description = trimmedDescription;
      updates.description_ar = trimmedDescription;
    }
    if (typeof body.order === 'number') {
      updates.order = body.order;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No valid fields to update.' }, { status: 400 });
    }

    await adminDb.collection('videos').doc(docId).update(updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update video.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const docId = await resolveVideoId(context);
    if (!docId) {
      return NextResponse.json({ message: 'Missing video id.' }, { status: 400 });
    }
    await adminDb.collection('videos').doc(docId).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete video.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
