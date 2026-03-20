import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getAssessmentSourceById, updateAssessmentSource, deleteAssessmentSource } from '@/server/actions/assessment-sources';

export const GET = withAccess(
  'settings:manage',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await context.params;
    try {
      const data = await getAssessmentSourceById(id);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('not found')) {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
    }
  },
);

export const PATCH = withAccess(
  'settings:manage',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const body = await req.json();
      const data = await updateAssessmentSource(id, body, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('not found')) {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'UPDATE_ERROR', message } }, { status: 400 });
    }
  },
);

export const DELETE = withAccess(
  'settings:manage',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const data = await deleteAssessmentSource(id, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('not found')) {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      if (message.includes('Cannot delete')) {
        return Response.json({ error: { code: 'CONFLICT', message } }, { status: 409 });
      }
      return Response.json({ error: { code: 'DELETE_ERROR', message } }, { status: 500 });
    }
  },
);
