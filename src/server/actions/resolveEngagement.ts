import { prisma } from '@/lib/prisma';

// =============================================================================
// RESOLVE ENGAGEMENT ID — Shared utility for all entity types
// =============================================================================

/**
 * Given an entityType + entityId, resolve which engagement it belongs to.
 * Used by approval routes, workpaper content helpers, etc.
 */
export async function resolveEngagementId(
  entityType: string,
  entityId: string,
): Promise<string | null> {
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
    case 'section': {
      const s = await prisma.engagementSection.findUnique({
        where: { id: entityId },
        select: { engagement_id: true },
      });
      return s?.engagement_id ?? null;
    }
    case 'objective': {
      const o = await prisma.engagementObjective.findUnique({
        where: { id: entityId },
        select: { engagement_id: true },
      });
      return o?.engagement_id ?? null;
    }
    default:
      return null;
  }
}

// =============================================================================
// GET ENTITY APPROVAL STATUS — Shared utility
// =============================================================================

/**
 * Get the current approval status and last publisher for any entity type.
 * Used by the transitions route to determine available transitions.
 */
export async function getEntityApprovalStatus(
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
    case 'section': {
      const s = await prisma.engagementSection.findUnique({
        where: { id: entityId },
        select: { status: true },
      });
      if (!s) return null;
      return { approvalStatus: s.status, lastPublishedBy: null };
    }
    case 'objective': {
      const o = await prisma.engagementObjective.findUnique({
        where: { id: entityId },
        select: { status: true },
      });
      if (!o) return null;
      return { approvalStatus: o.status, lastPublishedBy: null };
    }
    default:
      return null;
  }
}
