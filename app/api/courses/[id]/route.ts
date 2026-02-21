import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

type RouteContext = { params: { id: string } | Promise<{ id: string }> };

const resolveCourseId = async (context: RouteContext) => {
  const resolvedParams = await Promise.resolve(context.params);
  return resolvedParams.id;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const body = await request.json();
    const courseId = await resolveCourseId(context);
    if (!courseId) {
      return NextResponse.json({ message: 'Missing course id.' }, { status: 400 });
    }
    const updates: Record<string, unknown> = {};

    if (typeof body.published === 'boolean') {
      updates.published = body.published;
    }
    if (typeof body.titleAr === 'string') {
      updates.titleAr = body.titleAr;
    }
    if (typeof body.descriptionAr === 'string') {
      updates.descriptionAr = body.descriptionAr;
    }
    if (typeof body.instructor === 'string') {
      updates.instructor = body.instructor;
    }
    if (typeof body.imageUrl === 'string') {
      updates.imageUrl = body.imageUrl;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No valid fields to update.' }, { status: 400 });
    }

    await adminDb.collection('courses').doc(courseId).update(updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update course.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const courseId = await resolveCourseId(context);
    if (!courseId) {
      return NextResponse.json({ message: 'Missing course id.' }, { status: 400 });
    }
    await adminDb.collection('courses').doc(courseId).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete course.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
