import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getAvailableTransitions } from '@/server/actions/approvalEngine';
import { resolveEngagementId, getEntityApprovalStatus } from '@/server/actions/resolveEngagement';

export const GET = withAccess(
  'engagement:read',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { entityType, entityId } = await context.params;
    try {
      // Resolve engagementId from the entity
      const engagementId = await resolveEngagementId(entityType, entityId);
      if (!engagementId) {
        return Response.json(
          { error: { code: 'NOT_FOUND', message: 'Entity not found' } },
          { status: 404 },
        );
      }

      // Get current approval status + last publisher
      const status = await getEntityApprovalStatus(entityType, entityId);
      if (!status) {
        return Response.json(
          { error: { code: 'NOT_FOUND', message: 'Entity not found' } },
          { status: 404 },
        );
      }

      const data = await getAvailableTransitions(
        entityType,
        status.approvalStatus,
        session.user.id,
        engagementId,
        status.lastPublishedBy,
      );

      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'FETCH_ERROR', message } }, { status: 400 });
    }
  },
);
