import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { updateFinding, deleteFinding } from '@/server/actions/engagement';

export const PATCH = withAccess(
  'engagement:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { findingId } = await context.params;
    try {
      const body = await req.json();
      const data = await updateFinding(findingId, body, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'UPDATE_ERROR', message } }, { status: 400 });
    }
  },
);

export const DELETE = withAccess(
  'engagement:update',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { findingId } = await context.params;
    try {
      const data = await deleteFinding(findingId, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'DELETE_ERROR', message } }, { status: 500 });
    }
  },
);
