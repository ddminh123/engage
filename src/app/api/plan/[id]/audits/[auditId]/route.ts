import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { updatePlannedAudit, removePlannedAudit } from '@/server/actions/plan';

export const PATCH = withAccess(
  'plan:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id, auditId } = await context.params;
    try {
      const body = await req.json();
      const data = await updatePlannedAudit(id, auditId, body, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Planned audit not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'UPDATE_ERROR', message } }, { status: 400 });
    }
  },
);

export const DELETE = withAccess(
  'plan:update',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id, auditId } = await context.params;
    try {
      const data = await removePlannedAudit(id, auditId, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Planned audit not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'DELETE_ERROR', message } }, { status: 500 });
    }
  },
);
