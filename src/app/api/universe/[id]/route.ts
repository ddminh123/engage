import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getEntityById, updateEntity, deleteEntity } from '@/server/actions/universe';
import type { UpdateEntityInput } from '@/server/actions/universe';

export const GET = withAccess(
  'universe:view',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await context.params;
    try {
      const data = await getEntityById(id);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Entity not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
    }
  },
);

export const PATCH = withAccess(
  'universe:edit',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateEntityInput;
    try {
      const data = await updateEntity(id, body, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Entity not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'UPDATE_ERROR', message } }, { status: 400 });
    }
  },
);

export const DELETE = withAccess(
  'universe:delete',
  async (_req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { id } = await context.params;
    try {
      const data = await deleteEntity(id, session.user.id, session.user.name);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Entity not found') {
        return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
      }
      return Response.json({ error: { code: 'DELETE_ERROR', message } }, { status: 500 });
    }
  },
);
