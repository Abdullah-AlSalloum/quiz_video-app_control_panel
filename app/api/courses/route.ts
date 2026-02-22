import admin from 'firebase-admin';
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('courses').get();
    const courses = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const courseId = doc.id;
        const videosSnapshot = await adminDb
          .collection('videos')
          .where('courseId', '==', courseId)
          .get();
        const finalQuizRaw = data.final_quiz;
        const finalQuizCount = Array.isArray(finalQuizRaw)
          ? finalQuizRaw.length
          : 0;
        const createdAtValue = data.createdAt;
        const createdAt = typeof createdAtValue?.toMillis === 'function'
          ? createdAtValue.toMillis()
          : 0;
        return {
          id: courseId,
          titleAr: data.titleAr ?? '',
          descriptionAr: data.descriptionAr ?? '',
          imageUrl: data.imageUrl ?? '',
          instructor: data.instructor ?? '-',
          published: Boolean(data.published ?? false),
          videoCount: videosSnapshot.size,
          finalQuizCount,
          createdAt,
        };
      })
    );

    return NextResponse.json({ courses });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load courses.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      titleAr?: string;
      descriptionAr?: string;
      imageUrl?: string;
      instructor?: string;
      published?: boolean;
    };

    const titleAr = (body.titleAr ?? '').trim();
    if (!titleAr) {
      return NextResponse.json({ message: 'Course title is required.' }, { status: 400 });
    }

    const docRef = adminDb.collection('courses').doc();
    const courseId = docRef.id;
    const descriptionAr = (body.descriptionAr ?? '').trim();
    const instructor = (body.instructor ?? '').trim();
    const imageUrl = (body.imageUrl ?? '').trim();
    const published = typeof body.published === 'boolean' ? body.published : false;

    await docRef.set({
      id: courseId,
      titleAr,
      descriptionAr,
      imageUrl,
      instructor,
      published,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      totalLessons: 0,
      final_quiz: [],
    });

    return NextResponse.json(
      {
        course: {
          id: courseId,
          titleAr,
          descriptionAr,
          imageUrl,
          instructor,
          published,
          videoCount: 0,
          finalQuizCount: 0,
          createdAt: Date.now(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create course.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
