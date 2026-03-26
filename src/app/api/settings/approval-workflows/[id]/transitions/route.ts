import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { addTransition, reorderTransitions } from '@/server/actions/approvalWorkflow';

export const POST = withAccess(
  'settings:manage',
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await ctx.params;
    try {
      const body = await req.json();
      const data = await addTransition(id, body);
      return Response.json({ data }, { status: 201 });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 },
      );
    }
  },
);

export const PATCH = withAccess(
  'settings:manage',
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await ctx.params;
    try {
      const body = await req.json();
      const { orderedIds } = body as { orderedIds: string[] };
      if (!Array.isArray(orderedIds)) {
        return Response.json(
          { error: { code: 'VALIDATION_ERROR', message: 'orderedIds must be an array' } },
          { status: 400 },
        );
      }
      const data = await reorderTransitions(id, orderedIds);
      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json(
        { error: { code: 'REORDER_ERROR', message } },
        { status: 400 },
      );
    }
  },
);
