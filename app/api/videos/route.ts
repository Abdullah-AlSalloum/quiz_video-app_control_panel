import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const snapshot = courseId
      ? await adminDb.collection('videos').where('courseId', '==', courseId).get()
      : await adminDb.collection('videos').get();
    const videos = snapshot.docs.map((doc) => {
      const data = doc.data();
      const questions = Array.isArray(data.questions) ? data.questions.length : 0;
      return {
        id: doc.id,
        videoId: data.id ?? data.youtubeId ?? doc.id,
        titleAr: data.title_ar ?? '',
        titleEn: data.title_en ?? '',
        order: typeof data.order === 'number' ? data.order : 0,
        courseId: data.courseId ?? '',
        questionsCount: questions,
      };
    });

    return NextResponse.json({ videos });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load videos.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      courseId?: string;
      videoId?: string;
      titleAr?: string;
      order?: number;
    };
    const courseId = (body.courseId ?? '').trim();
    const videoId = (body.videoId ?? '').trim();
    const titleAr = (body.titleAr ?? '').trim();
    let order = typeof body.order === 'number' ? body.order : 0;

    if (!courseId || !videoId || !titleAr) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    if (order <= 0) {
      const lastSnapshot = await adminDb
        .collection('videos')
        .where('courseId', '==', courseId)
        .orderBy('order', 'desc')
        .limit(1)
        .get();
      const lastOrder = lastSnapshot.empty ? 0 : Number(lastSnapshot.docs[0].data().order ?? 0);
      order = lastOrder + 1;
    }

    const docRef = adminDb.collection('videos').doc();
    await docRef.set({
      id: videoId,
      youtubeId: videoId,
      title_ar: titleAr,
      order,
      courseId,
      questions: [],
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create video.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
