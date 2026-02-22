import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

type UserCounts = {
  videoQuizzes: number;
  finalQuizzes: number;
};

export async function GET() {
  try {
    const [usersSnap, attemptsSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('user_quiz_attempts').get(),
    ]);

    const countsByUser: Record<string, UserCounts> = {};
    attemptsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const userId = String(data.userId ?? '').trim();
      if (!userId) return;
      if (!countsByUser[userId]) {
        countsByUser[userId] = { videoQuizzes: 0, finalQuizzes: 0 };
      }
      const type = String(data.type ?? '').trim();
      if (type === 'final') {
        countsByUser[userId].finalQuizzes += 1;
      } else {
        countsByUser[userId].videoQuizzes += 1;
      }
    });

    const users = usersSnap.docs.map((doc) => {
      const data = doc.data();
      const counts = countsByUser[doc.id] ?? { videoQuizzes: 0, finalQuizzes: 0 };
      return {
        id: doc.id,
        name: data.name ?? '',
        surname: data.surname ?? '',
        email: data.email ?? '',
        videoQuizzes: counts.videoQuizzes,
        finalQuizzes: counts.finalQuizzes,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load users.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
