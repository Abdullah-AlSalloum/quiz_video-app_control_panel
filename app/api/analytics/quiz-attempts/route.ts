import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

type Range = '7d' | '30d';

type Bucket = {
  key: string;
  label: string;
  startMs: number;
  endMs: number;
};

type BucketCounts = {
  video: number;
  final: number;
};

const normalizeTimestamp = (value: unknown) => {
  if (!value) return null;
  if (typeof (value as { toMillis?: () => number }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildDailyBuckets = (days: number) => {
  const buckets: Bucket[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let i = days - 1; i >= 0; i -= 1) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const key = formatDateKey(dayStart);
    buckets.push({
      key,
      label: key,
      startMs: dayStart.getTime(),
      endMs: dayEnd.getTime(),
    });
  }

  return buckets;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') ?? '7d') as Range;
    const days = range === '30d' ? 30 : 7;
    const buckets = buildDailyBuckets(days);

    const attemptsSnap = await adminDb.collection('user_quiz_attempts').get();
    const bucketMap = new Map<string, BucketCounts>();
    buckets.forEach((bucket) => bucketMap.set(bucket.key, { video: 0, final: 0 }));

    attemptsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const ts = normalizeTimestamp(data.timestamp);
      if (!ts) return;
      const attemptDate = new Date(ts);
      const key = formatDateKey(attemptDate);
      const counts = bucketMap.get(key);
      if (!counts) return;
      const type = String(data.type ?? '').trim();
      if (type === 'final') {
        counts.final += 1;
      } else {
        counts.video += 1;
      }
    });

    const categories = buckets.map((bucket) => bucket.label);
    const videoData = buckets.map((bucket) => bucketMap.get(bucket.key)?.video ?? 0);
    const finalData = buckets.map((bucket) => bucketMap.get(bucket.key)?.final ?? 0);
    const periodTotal = videoData.reduce((sum, value) => sum + value, 0) + finalData.reduce((sum, value) => sum + value, 0);

    return NextResponse.json({
      categories,
      series: [
        { name: 'video', data: videoData },
        { name: 'final', data: finalData },
      ],
      periodTotal,
      totalAttempts: attemptsSnap.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load quiz attempts analytics.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
