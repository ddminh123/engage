import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { listPlanningWorkpapers, getOrCreatePlanningWorkpaper } from '@/server/actions/planningWorkpaper';

export const GET = withAccess(
  'engagement:read',
  async (_req: NextRequest, ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    const { id } = await ctx.params;
    const data = await listPlanningWorkpapers(id);
    return Response.json({ data });
  },
);

export const POST = withAccess(
  'engagement:update',
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }, _session: Session) => {
    try {
      const { id } = await ctx.params;
      const body = await req.json();
      const { stepConfigId } = body;
      if (!stepConfigId) {
        return Response.json(
          { error: { code: 'VALIDATION_ERROR', message: 'stepConfigId is required' } },
          { status: 400 },
        );
      }
      const data = await getOrCreatePlanningWorkpaper(id, stepConfigId);
      return Response.json({ data });
    } catch (error) {
      return Response.json(
        { error: { code: 'SERVER_ERROR', message: (error as Error).message } },
        { status: 500 },
      );
    }
  },
);
