import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { updatePlanningWorkpaper } from '@/server/actions/planningWorkpaper';
import { logAudit } from '@/server/actions/teams';

export const PATCH = withAccess(
  'engagement:update',
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }, session: Session) => {
    try {
      const { wpId } = await ctx.params;
      const body = await req.json();
      const data = await updatePlanningWorkpaper(wpId, body);

      await logAudit({
        userId: session.user.id,
        userName: session.user.name,
        action: 'update',
        entityType: 'planning_workpaper',
        entityId: wpId,
      });

      return Response.json({ data });
    } catch (error) {
      return Response.json(
        { error: { code: 'SERVER_ERROR', message: (error as Error).message } },
        { status: 500 },
      );
    }
  },
);
