import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

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
        description: data.description ?? data.description_ar ?? '',
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
      description?: string;
      order?: number;
    };
    const courseId = (body.courseId ?? '').trim();
    const videoId = parseYouTubeId(body.videoId ?? '');
    const titleAr = (body.titleAr ?? '').trim();
    const description = (body.description ?? '').trim();
    let order = typeof body.order === 'number' ? body.order : 0;

    if (!courseId || !videoId || !titleAr) {
      return NextResponse.json({ message: 'Missing required fields or invalid YouTube link.' }, { status: 400 });
    }

    if (order <= 0) {
      const courseVideosSnapshot = await adminDb
        .collection('videos')
        .where('courseId', '==', courseId)
        .get();
      const lastOrder = courseVideosSnapshot.docs.reduce((maxOrder, doc) => {
        const currentOrder = Number(doc.data().order ?? 0);
        return currentOrder > maxOrder ? currentOrder : maxOrder;
      }, 0);
      order = lastOrder + 1;
    }

    const docRef = adminDb.collection('videos').doc();
    await docRef.set({
      id: videoId,
      youtubeId: videoId,
      title_ar: titleAr,
      description,
      description_ar: description,
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
