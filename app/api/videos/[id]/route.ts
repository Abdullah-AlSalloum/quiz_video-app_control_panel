import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

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
      order?: number;
    };
    const docId = await resolveVideoId(context);
    if (!docId) {
      return NextResponse.json({ message: 'Missing video id.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof body.videoId === 'string') {
      updates.id = body.videoId.trim();
      updates.youtubeId = body.videoId.trim();
    }
    if (typeof body.titleAr === 'string') {
      updates.title_ar = body.titleAr.trim();
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
