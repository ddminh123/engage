import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { updatePlanningWorkpaper } from '@/server/actions/planningWorkpaper';
import { invalidateSignoffs } from '@/server/actions/approvalEngine';
import { logAudit } from '@/server/actions/teams';

export const PATCH = withAccess(
  'engagement:update',
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }, session: Session) => {
    try {
      const { wpId } = await ctx.params;
      const body = await req.json();
      const data = await updatePlanningWorkpaper(wpId, body);

      // Invalidate review/approve sign-offs when planning workpaper content changes
      await invalidateSignoffs('planning_workpaper', wpId, session.user.id);

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
