import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

const BATCH_LIMIT = 400;

const chunk = <T,>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

const DEFAULT_DESCRIPTION_AR =
  'هذا الفيديو هو جزء من سلسلة دروس لتعلم اللغة العربية. شاهد الفيديو كاملاً قبل الانتقال إلى الاختبار.';

export async function POST() {
  try {
    const videosSnap = await adminDb.collection('videos').get();
    const toUpdate = videosSnap.docs.filter((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      const description = String(data.description ?? '').trim();
      const descriptionAr = String(data.description_ar ?? '').trim();
      return !description || !descriptionAr;
    });

    const batches = chunk<QueryDocumentSnapshot<DocumentData>>(toUpdate, BATCH_LIMIT);
    let updated = 0;

    for (const docsBatch of batches) {
      const batch = adminDb.batch();
      docsBatch.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        const fallback = String(data.description ?? data.description_ar ?? data.title_ar ?? '').trim();
        const descriptionValue = fallback || DEFAULT_DESCRIPTION_AR;
        batch.update(doc.ref, {
          description: descriptionValue,
          description_ar: descriptionValue,
        });
      });
      await batch.commit();
      updated += docsBatch.length;
    }

    return NextResponse.json({
      ok: true,
      totalVideos: videosSnap.size,
      updated,
      skipped: videosSnap.size - updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to backfill video descriptions.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
