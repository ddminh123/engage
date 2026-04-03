import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getAvailableTransitions } from '@/server/actions/approvalEngine';
import { resolveEngagementId, getEntityApprovalStatus } from '@/server/actions/resolveEngagement';

export const GET = withAccess(
  'engagement:read',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { entityType, entityId } = await context.params;
    const subType = new URL(req.url).searchParams.get('subType') ?? '';
    try {
      // Resolve engagementId from the entity
      const engagementId = await resolveEngagementId(entityType, entityId);
      console.log('[transitions]', { entityType, entityId, subType, engagementId });
      if (!engagementId) {
        return Response.json(
          { error: { code: 'NOT_FOUND', message: 'Entity not found' } },
          { status: 404 },
        );
      }

      // Get current approval status + last publisher
      const status = await getEntityApprovalStatus(entityType, entityId);
      console.log('[transitions] status:', status);
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
        subType,
      );

      console.log('[transitions] result:', data.length, 'transitions');
      return Response.json({ data });
    } catch (error) {
      console.error('[transitions] ERROR:', (error as Error).message);
      const message = (error as Error).message;
      return Response.json({ error: { code: 'FETCH_ERROR', message } }, { status: 400 });
    }
  },
);
