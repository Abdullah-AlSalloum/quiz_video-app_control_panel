import { NextResponse } from 'next/server';
import { adminDb } from '../../../../../lib/firebaseAdmin';

type RouteContext = { params: { id: string } | Promise<{ id: string }> };

type QuestionPayload = {
  questionAr?: string;
  optionsAr?: string[];
  correctAnswerAr?: string;
  score?: number;
};

const resolveVideoId = async (context: RouteContext) => {
  const resolvedParams = await Promise.resolve(context.params);
  return resolvedParams.id;
};

const normalizeOptions = (options: string[] | undefined) => {
  if (!Array.isArray(options)) return [];
  return options.map((option) => String(option ?? '').trim()).filter(Boolean);
};

const validateQuestion = (payload: QuestionPayload) => {
  const questionAr = String(payload.questionAr ?? '').trim();
  const optionsAr = normalizeOptions(payload.optionsAr);
  const correctAnswerAr = String(payload.correctAnswerAr ?? '').trim();
  const score = typeof payload.score === 'number' ? payload.score : Number(payload.score ?? 0);

  if (!questionAr) {
    return { ok: false, message: 'Question text is required.' };
  }
  if (optionsAr.length < 2) {
    return { ok: false, message: 'At least two options are required.' };
  }
  if (!correctAnswerAr || !optionsAr.includes(correctAnswerAr)) {
    return { ok: false, message: 'Correct answer must match one of the options.' };
  }
  if (!Number.isFinite(score) || score <= 0) {
    return { ok: false, message: 'Score must be a positive number.' };
  }

  return {
    ok: true as const,
    question: {
      question_ar: questionAr,
      options_ar: optionsAr,
      correct_answer_ar: correctAnswerAr,
      score,
    },
  };
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const docId = await resolveVideoId(context);
    if (!docId) {
      return NextResponse.json({ message: 'Missing video id.' }, { status: 400 });
    }
    const doc = await adminDb.collection('videos').doc(docId).get();
    if (!doc.exists) {
      return NextResponse.json({ message: 'Video not found.' }, { status: 404 });
    }
    const data = doc.data() ?? {};
    const questions = Array.isArray(data.questions) ? data.questions : [];
    return NextResponse.json({
      video: {
        id: doc.id,
        titleAr: data.title_ar ?? '',
      },
      questions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load questions.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const docId = await resolveVideoId(context);
    if (!docId) {
      return NextResponse.json({ message: 'Missing video id.' }, { status: 400 });
    }
    const body = (await request.json()) as QuestionPayload;
    const validated = validateQuestion(body);
    if (!validated.ok) {
      return NextResponse.json({ message: validated.message }, { status: 400 });
    }

    const docRef = adminDb.collection('videos').doc(docId);
    await adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(docRef);
      if (!snapshot.exists) {
        throw new Error('Video not found.');
      }
      const data = snapshot.data() ?? {};
      const current = Array.isArray(data.questions) ? [...data.questions] : [];
      current.push(validated.question);
      tx.update(docRef, { questions: current });
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add question.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const docId = await resolveVideoId(context);
    if (!docId) {
      return NextResponse.json({ message: 'Missing video id.' }, { status: 400 });
    }
    const body = (await request.json()) as QuestionPayload & { index?: number };
    const index = typeof body.index === 'number' ? body.index : Number(body.index ?? -1);
    if (!Number.isInteger(index) || index < 0) {
      return NextResponse.json({ message: 'Invalid question index.' }, { status: 400 });
    }
    const validated = validateQuestion(body);
    if (!validated.ok) {
      return NextResponse.json({ message: validated.message }, { status: 400 });
    }

    const docRef = adminDb.collection('videos').doc(docId);
    await adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(docRef);
      if (!snapshot.exists) {
        throw new Error('Video not found.');
      }
      const data = snapshot.data() ?? {};
      const current = Array.isArray(data.questions) ? [...data.questions] : [];
      if (index >= current.length) {
        throw new Error('Question index out of range.');
      }
      current[index] = validated.question;
      tx.update(docRef, { questions: current });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update question.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const docId = await resolveVideoId(context);
    if (!docId) {
      return NextResponse.json({ message: 'Missing video id.' }, { status: 400 });
    }
    const body = (await request.json()) as { index?: number };
    const index = typeof body.index === 'number' ? body.index : Number(body.index ?? -1);
    if (!Number.isInteger(index) || index < 0) {
      return NextResponse.json({ message: 'Invalid question index.' }, { status: 400 });
    }

    const docRef = adminDb.collection('videos').doc(docId);
    await adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(docRef);
      if (!snapshot.exists) {
        throw new Error('Video not found.');
      }
      const data = snapshot.data() ?? {};
      const current = Array.isArray(data.questions) ? [...data.questions] : [];
      if (index >= current.length) {
        throw new Error('Question index out of range.');
      }
      current.splice(index, 1);
      tx.update(docRef, { questions: current });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete question.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
