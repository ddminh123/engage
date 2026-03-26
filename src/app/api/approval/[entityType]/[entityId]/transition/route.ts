import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { executeTransition } from '@/server/actions/approvalEngine';
import { prisma } from '@/lib/prisma';

export const POST = withAccess(
  'engagement:update',
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }, session: Session) => {
    const { entityType, entityId } = await context.params;
    try {
      const body = await req.json();
      const { transitionId, comment } = body as { transitionId: string; comment?: string };

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
      );

      return Response.json({ data });
    } catch (error) {
      const message = (error as Error).message;
      return Response.json({ error: { code: 'TRANSITION_ERROR', message } }, { status: 400 });
    }
  },
);

async function resolveEngagementId(entityType: string, entityId: string): Promise<string | null> {
  switch (entityType) {
    case 'procedure': {
      const p = await prisma.engagementProcedure.findUnique({
        where: { id: entityId },
        select: { engagement_id: true },
      });
      return p?.engagement_id ?? null;
    }
    default:
      return null;
  }
}
