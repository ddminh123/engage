import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getWorkflow, updateWorkflow, deleteWorkflow } from '@/server/actions/approvalWorkflow';

export const GET = withAccess(
  'settings:read',
  async (_req: NextRequest, ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await ctx.params;
    try {
      const data = await getWorkflow(id);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
    }
  },
);

export const PATCH = withAccess(
  'settings:manage',
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await ctx.params;
    try {
      const body = await req.json();
      const data = await updateWorkflow(id, body);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('not found') ? 404 : 400;
      return Response.json(
        { error: { code: status === 404 ? 'NOT_FOUND' : 'VALIDATION_ERROR', message } },
        { status },
      );
    }
  },
);

export const DELETE = withAccess(
  'settings:manage',
  async (_req: NextRequest, ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await ctx.params;
    try {
      const data = await deleteWorkflow(id);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'DELETE_ERROR', message } }, { status: 400 });
    }
  },
);
