import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const updatePlanningWorkpaperSchema = z.object({
  content: z.any().optional(),
});

// =============================================================================
// GET OR CREATE — Lazy init: returns existing or creates empty workpaper
// =============================================================================

export async function getOrCreatePlanningWorkpaper(
  engagementId: string,
  stepConfigId: string,
) {
  let wp = await prisma.planningWorkpaper.findUnique({
    where: {
      engagement_id_step_config_id: {
        engagement_id: engagementId,
        step_config_id: stepConfigId,
      },
    },
  });

  if (!wp) {
    wp = await prisma.planningWorkpaper.create({
      data: {
        engagement_id: engagementId,
        step_config_id: stepConfigId,
      },
    });
  }

  return mapWorkpaper(wp);
}

// =============================================================================
// LIST — All planning workpapers for an engagement
// =============================================================================

export async function listPlanningWorkpapers(engagementId: string) {
  const wps = await prisma.planningWorkpaper.findMany({
    where: { engagement_id: engagementId },
    include: {
      step_config: {
        select: { id: true, key: true, title: true, icon: true, step_type: true, sort_order: true },
      },
    },
    orderBy: { step_config: { sort_order: 'asc' } },
  });

  return wps.map((wp) => ({
    ...mapWorkpaper(wp),
    stepConfig: {
      id: wp.step_config.id,
      key: wp.step_config.key,
      title: wp.step_config.title,
      icon: wp.step_config.icon,
      stepType: wp.step_config.step_type,
      sortOrder: wp.step_config.sort_order,
    },
  }));
}

// =============================================================================
// UPDATE — Save content
// =============================================================================

export async function updatePlanningWorkpaper(id: string, input: unknown) {
  const parsed = updatePlanningWorkpaperSchema.parse(input);

  const wp = await prisma.planningWorkpaper.update({
    where: { id },
    data: {
      content: parsed.content ?? undefined,
    },
  });

  return mapWorkpaper(wp);
}

// =============================================================================
// MAPPER
// =============================================================================

function mapWorkpaper(wp: {
  id: string;
  engagement_id: string;
  step_config_id: string;
  content: unknown;
  approval_status: string;
  current_version: number;
  approved_by: string | null;
  approved_at: Date | null;
  approved_version: number | null;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: wp.id,
    engagementId: wp.engagement_id,
    stepConfigId: wp.step_config_id,
    content: wp.content,
    approvalStatus: wp.approval_status,
    currentVersion: wp.current_version,
    approvedBy: wp.approved_by,
    approvedAt: wp.approved_at?.toISOString() ?? null,
    approvedVersion: wp.approved_version,
    createdAt: wp.created_at.toISOString(),
    updatedAt: wp.updated_at.toISOString(),
  };
}
