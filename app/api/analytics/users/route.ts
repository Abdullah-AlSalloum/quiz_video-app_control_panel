import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

type Range = 'monthly' | 'yearly';

type Bucket = {
  key: string;
  label: string;
  startMs: number;
  endMs: number;
};

const normalizeTimestamp = (value: unknown) => {
  if (!value) return null;
  if (typeof (value as { toMillis?: () => number }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === 'object') {
    const seconds = (value as { seconds?: number }).seconds;
    const nanoseconds = (value as { nanoseconds?: number }).nanoseconds ?? 0;
    if (typeof seconds === 'number') {
      return seconds * 1000 + Math.floor(nanoseconds / 1_000_000);
    }
  }
  if (typeof value === 'number') {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
    }
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const buildMonthlyBuckets = () => {
  const buckets: Bucket[] = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  for (let i = 0; i < 12; i += 1) {
    const bucketStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const bucketEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 1);
    const key = `${bucketStart.getFullYear()}-${String(bucketStart.getMonth() + 1).padStart(2, '0')}`;
    buckets.push({
      key,
      label: key,
      startMs: bucketStart.getTime(),
      endMs: bucketEnd.getTime(),
    });
  }

  return buckets;
};

const buildYearlyBuckets = () => {
  const buckets: Bucket[] = [];
  const now = new Date();
  const startYear = now.getFullYear() - 4;

  for (let i = 0; i < 5; i += 1) {
    const year = startYear + i;
    const bucketStart = new Date(year, 0, 1);
    const bucketEnd = new Date(year + 1, 0, 1);
    const key = String(year);
    buckets.push({
      key,
      label: key,
      startMs: bucketStart.getTime(),
      endMs: bucketEnd.getTime(),
    });
  }

  return buckets;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') ?? 'monthly') as Range;
    const buckets = range === 'yearly' ? buildYearlyBuckets() : buildMonthlyBuckets();

    const [usersSnap, attemptsSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('user_quiz_attempts').get(),
    ]);

    const attemptMap = new Map<string, number>();
    attemptsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const userId = String(data.userId ?? '').trim();
      if (!userId) return;
      const ts = normalizeTimestamp(data.timestamp);
      if (!ts) return;
      const existing = attemptMap.get(userId);
      if (!existing || ts < existing) {
        attemptMap.set(userId, ts);
      }
    });

    const bucketCounts = new Map<string, number>();
    buckets.forEach((bucket) => bucketCounts.set(bucket.key, 0));

    usersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const createdAt =
        normalizeTimestamp(data.createdAt ?? data.created_at) ?? attemptMap.get(doc.id) ?? null;
      if (!createdAt) return;

      const bucket = buckets.find((item) => createdAt >= item.startMs && createdAt < item.endMs);
      if (!bucket) return;
      bucketCounts.set(bucket.key, (bucketCounts.get(bucket.key) ?? 0) + 1);
    });

    const categories = buckets.map((bucket) => bucket.label);
    const dataSeries = buckets.map((bucket) => bucketCounts.get(bucket.key) ?? 0);
    const periodTotal = dataSeries.reduce((sum, value) => sum + value, 0);

    return NextResponse.json({
      categories,
      series: [{ name: 'New users', data: dataSeries }],
      totalUsers: usersSnap.size,
      periodTotal,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load users analytics.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
