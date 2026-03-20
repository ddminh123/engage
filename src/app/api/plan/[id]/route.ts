import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getPlanById, updatePlan, deletePlan } from '@/server/actions/plan';

export const GET = withAccess(
  'plan:read',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await context.params;
    try {
      const data = await getPlanById(id);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Plan not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
    }
  },
);

export const PATCH = withAccess(
  'plan:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const body = await req.json();
      const data = await updatePlan(id, body, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Plan not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'UPDATE_ERROR', message } }, { status: 400 });
    }
  },
);

export const DELETE = withAccess(
  'plan:delete',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const data = await deletePlan(id, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Plan not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'DELETE_ERROR', message } }, { status: 500 });
    }
  },
);
