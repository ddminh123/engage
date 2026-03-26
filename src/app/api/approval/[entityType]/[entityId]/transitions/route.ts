import { NextRequest } from 'next/server';
import { withAccess, type Session } from '@/server/middleware/withAccess';
import { getAvailableTransitions } from '@/server/actions/approvalEngine';
import { prisma } from '@/lib/prisma';

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

async function resolveEngagementId(entityType: string, entityId: string): Promise<string | null> {
  switch (entityType) {
    case 'procedure': {
      const p = await prisma.engagementProcedure.findUnique({
        where: { id: entityId },
        select: { engagement_id: true },
      });
      return p?.engagement_id ?? null;
    }
    case 'work_program': {
      // entityId IS the engagementId for work_program
      const eng = await prisma.engagement.findUnique({
        where: { id: entityId },
        select: { id: true },
      });
      return eng?.id ?? null;
    }
    case 'planning_workpaper': {
      const pw = await prisma.planningWorkpaper.findUnique({
        where: { id: entityId },
        select: { engagement_id: true },
      });
      return pw?.engagement_id ?? null;
    }
    default:
      return null;
  }
}

async function getEntityApprovalStatus(
  entityType: string,
  entityId: string,
): Promise<{ approvalStatus: string; lastPublishedBy: string | null } | null> {
  switch (entityType) {
    case 'procedure': {
      const p = await prisma.engagementProcedure.findUnique({
        where: { id: entityId },
        select: { approval_status: true },
      });
      if (!p) return null;

      const lastVersion = await prisma.entityVersion.findFirst({
        where: { entity_type: 'procedure', entity_id: entityId },
        orderBy: { version: 'desc' },
        select: { published_by: true },
      });

      return {
        approvalStatus: p.approval_status,
        lastPublishedBy: lastVersion?.published_by ?? null,
      };
    }
    case 'work_program': {
      const eng = await prisma.engagement.findUnique({
        where: { id: entityId },
        select: { wp_approval_status: true },
      });
      if (!eng) return null;
      return { approvalStatus: eng.wp_approval_status, lastPublishedBy: null };
    }
    case 'planning_workpaper': {
      const pw = await prisma.planningWorkpaper.findUnique({
        where: { id: entityId },
        select: { approval_status: true },
      });
      if (!pw) return null;
      return { approvalStatus: pw.approval_status, lastPublishedBy: null };
    }
    default:
      return null;
  }
}
