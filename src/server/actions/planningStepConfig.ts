import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ── Schemas ──

export const createPlanningStepSchema = z.object({
  title: z.string().min(1, 'Tên bước không được để trống'),
  icon: z.string().nullable().optional(),
  step_type: z.enum(['fixed', 'workpaper']).default('workpaper'),
  is_active: z.boolean().default(true),
});

export const updatePlanningStepSchema = z.object({
  title: z.string().min(1).optional(),
  icon: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const reorderPlanningStepsSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
});

// ── Mapper ──

function mapStep(s: {
  id: string;
  key: string;
  title: string;
  icon: string | null;
  step_type: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: s.id,
    key: s.key,
    title: s.title,
    icon: s.icon,
    stepType: s.step_type,
    isActive: s.is_active,
    sortOrder: s.sort_order,
    createdAt: s.created_at.toISOString(),
    updatedAt: s.updated_at.toISOString(),
  };
}

// ── Actions ──

export async function getPlanningStepConfigs(activeOnly = false) {
  const where = activeOnly ? { is_active: true } : {};
  const rows = await prisma.planningStepConfig.findMany({
    where,
    orderBy: { sort_order: 'asc' },
  });
  return rows.map(mapStep);
}

export async function createPlanningStepConfig(data: z.infer<typeof createPlanningStepSchema>) {
  // Auto-generate a unique key for custom steps
  const key = `custom_${Date.now()}`;

  // Get max sort_order
  const last = await prisma.planningStepConfig.findFirst({
    orderBy: { sort_order: 'desc' },
    select: { sort_order: true },
  });
  const nextOrder = (last?.sort_order ?? -1) + 1;

  const row = await prisma.planningStepConfig.create({
    data: {
      key,
      title: data.title,
      icon: data.icon ?? null,
      step_type: data.step_type,
      is_active: data.is_active,
      sort_order: nextOrder,
    },
  });
  return mapStep(row);
}

export async function updatePlanningStepConfig(
  id: string,
  data: z.infer<typeof updatePlanningStepSchema>,
) {
  const row = await prisma.planningStepConfig.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.is_active !== undefined && { is_active: data.is_active }),
      ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
    },
  });
  return mapStep(row);
}

export async function deletePlanningStepConfig(id: string) {
  // Only allow deleting workpaper-type steps
  const step = await prisma.planningStepConfig.findUnique({ where: { id } });
  if (!step) throw new Error('Không tìm thấy bước kế hoạch');
  if (step.step_type === 'fixed') throw new Error('Không thể xóa bước cố định');

  return prisma.planningStepConfig.delete({ where: { id } });
}

export async function reorderPlanningSteps(orderedIds: string[]) {
  const updates = orderedIds.map((id, index) =>
    prisma.planningStepConfig.update({
      where: { id },
      data: { sort_order: index },
    }),
  );
  await prisma.$transaction(updates);
}
