import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getEngagementById, updateEngagement, deleteEngagement } from '@/server/actions/engagement';

export const GET = withAccess(
  'engagement:read',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await context.params;
    try {
      const data = await getEngagementById(id);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Engagement not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
    }
  },
);

export const PATCH = withAccess(
  'engagement:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const body = await req.json();
      const data = await updateEngagement(id, body, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Engagement not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'UPDATE_ERROR', message } }, { status: 400 });
    }
  },
);

export const DELETE = withAccess(
  'engagement:delete',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const data = await deleteEngagement(id, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Engagement not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'DELETE_ERROR', message } }, { status: 500 });
    }
  },
);
