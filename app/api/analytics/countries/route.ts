import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

type Range = 'week' | 'month' | 'year';

type CountryCount = {
  code: string;
  name: string;
  count: number;
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

const rangeToMs = (range: Range) => {
  switch (range) {
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'year':
      return 365 * 24 * 60 * 60 * 1000;
    case 'month':
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') ?? 'month') as Range;
    const now = Date.now();
    const cutoff = now - rangeToMs(range);

    const usersSnap = await adminDb.collection('users').get();

    const counts = new Map<string, CountryCount>();
    usersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const lastLoginAt = normalizeTimestamp(data.lastLoginAt ?? data.last_login_at);
      const createdAt = normalizeTimestamp(data.createdAt ?? data.created_at);
      const activityTs = lastLoginAt ?? createdAt;
      if (!activityTs || activityTs < cutoff) return;
      const rawCode = String(data.countryCode ?? data.country_code ?? '').trim();
      if (!rawCode) return;
      const code = rawCode.toUpperCase();
      const name = String(data.countryName ?? data.country_name ?? '').trim();

      const existing = counts.get(code);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(code, {
          code,
          name,
          count: 1,
        });
      }
    });

    const countries = Array.from(counts.values()).sort((a, b) => b.count - a.count);
    const totalUsers = countries.reduce((sum, item) => sum + item.count, 0);

    return NextResponse.json({
      countries,
      totalUsers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load country analytics.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
