import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { courseId?: string };
    const courseId = (body.courseId ?? '').trim();
    if (!courseId) {
      return NextResponse.json({ message: 'Missing course id.' }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection('videos')
      .where('courseId', '==', courseId)
      .get();

    const docs = snapshot.docs
      .map((doc) => ({ id: doc.id, order: Number(doc.data().order ?? 0) }))
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

    const batch = adminDb.batch();
    docs.forEach((doc, index) => {
      batch.update(adminDb.collection('videos').doc(doc.id), { order: index + 1 });
    });
    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reindex videos.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
