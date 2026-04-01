import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { executeTransition } from '@/server/actions/approvalEngine';
import { resolveEngagementId } from '@/server/actions/resolveEngagement';

export const POST = withAccess(
  'engagement:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { entityType, entityId } = await context.params;
    try {
      const body = await req.json();
      const { transitionId, comment, nextAssigneeId } = body as { transitionId: string; comment?: string; nextAssigneeId?: string };

      if (!transitionId) {
        return Response.json(
          { error: { code: 'VALIDATION_ERROR', message: 'transitionId is required' } },
          { status: 400 },
        );
      }

      // Resolve engagementId from the entity
      const engagementId = await resolveEngagementId(entityType, entityId);
      if (!engagementId) {
        return Response.json(
          { error: { code: 'NOT_FOUND', message: 'Entity not found' } },
          { status: 404 },
        );
      }

      const data = await executeTransition(
        entityType,
        entityId,
        transitionId,
        session.user.id,
        session.user.name,
        engagementId,
        comment,
        nextAssigneeId,
      );

      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'TRANSITION_ERROR', message } }, { status: 400 });
    }
  },
);
