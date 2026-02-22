import admin from 'firebase-admin';
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

const BATCH_LIMIT = 400;

const chunk = <T,>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

export async function POST() {
  try {
    const coursesSnap = await adminDb.collection('courses').get();
    const videosSnap = await adminDb.collection('videos').get();

    const courseDocs = coursesSnap.docs;
    const videoDocs = videosSnap.docs;

    const courseBatches = chunk(courseDocs, BATCH_LIMIT);
    const videoBatches = chunk(videoDocs, BATCH_LIMIT);

    let coursesUpdated = 0;
    let videosUpdated = 0;

    for (const batchDocs of courseBatches) {
      const batch = adminDb.batch();
      batchDocs.forEach((doc) => {
        batch.update(doc.ref, { titleEn: admin.firestore.FieldValue.delete() });
      });
      await batch.commit();
      coursesUpdated += batchDocs.length;
    }

    for (const batchDocs of videoBatches) {
      const batch = adminDb.batch();
      batchDocs.forEach((doc) => {
        batch.update(doc.ref, { title_en: admin.firestore.FieldValue.delete() });
      });
      await batch.commit();
      videosUpdated += batchDocs.length;
    }

    return NextResponse.json({ ok: true, coursesUpdated, videosUpdated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove titleEn fields.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
