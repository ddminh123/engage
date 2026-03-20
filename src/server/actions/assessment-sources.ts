import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// =============================================================================
// SCHEMAS
// =============================================================================

export const createAssessmentSourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

export const updateAssessmentSourceSchema = createAssessmentSourceSchema.partial();

export type CreateAssessmentSourceInput = z.infer<typeof createAssessmentSourceSchema>;
export type UpdateAssessmentSourceInput = z.infer<typeof updateAssessmentSourceSchema>;

// =============================================================================
// HELPERS
// =============================================================================

function mapAssessmentSource(r: {
  id: string; name: string; code: string | null;
  description: string | null; is_active: boolean;
  sort_order: number; created_at: Date; updated_at: Date;
}) {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    description: r.description,
    isActive: r.is_active,
    sortOrder: r.sort_order,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

// =============================================================================
// ACTIONS
// =============================================================================

export async function listAssessmentSources(includeInactive = false) {
  const items = await prisma.assessmentSource.findMany({
    where: includeInactive ? undefined : { is_active: true },
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  });
  return items.map(mapAssessmentSource);
}

export async function getAssessmentSourceById(id: string) {
  const item = await prisma.assessmentSource.findUnique({ where: { id } });
  if (!item) throw new Error('Assessment source not found');
  return mapAssessmentSource(item);
}

export async function createAssessmentSource(
  body: unknown,
  userId: string,
  userName: string,
) {
  const parsed = createAssessmentSourceSchema.parse(body);

  const item = await prisma.assessmentSource.create({
    data: {
      name: parsed.name,
      code: parsed.code ?? null,
      description: parsed.description ?? null,
      is_active: parsed.is_active ?? true,
      sort_order: parsed.sort_order ?? 0,
    },
  });

  await prisma.auditLog.create({
    data: {
      user_id: userId,
      user_name: userName,
      action: 'create',
      entity_type: 'assessment_source',
      entity_id: item.id,
      changes: { name: { old: null, new: item.name } },
    },
  });

  return mapAssessmentSource(item);
}

export async function updateAssessmentSource(
  id: string,
  body: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.assessmentSource.findUnique({ where: { id } });
  if (!existing) throw new Error('Assessment source not found');

  const parsed = updateAssessmentSourceSchema.parse(body);

  const item = await prisma.assessmentSource.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.code !== undefined && { code: parsed.code }),
      ...(parsed.description !== undefined && { description: parsed.description }),
      ...(parsed.is_active !== undefined && { is_active: parsed.is_active }),
      ...(parsed.sort_order !== undefined && { sort_order: parsed.sort_order }),
    },
  });

  await prisma.auditLog.create({
    data: {
      user_id: userId,
      user_name: userName,
      action: 'update',
      entity_type: 'assessment_source',
      entity_id: id,
      changes: parsed,
    },
  });

  return mapAssessmentSource(item);
}

export async function deleteAssessmentSource(
  id: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.assessmentSource.findUnique({ where: { id } });
  if (!existing) throw new Error('Assessment source not found');

  // Check if any risk assessments use this source
  const usageCount = await prisma.riskAssessment.count({
    where: { assessment_source_id: id },
  });
  if (usageCount > 0) {
    throw new Error(`Cannot delete: ${usageCount} risk assessment(s) use this source`);
  }

  await prisma.assessmentSource.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      user_id: userId,
      user_name: userName,
      action: 'delete',
      entity_type: 'assessment_source',
      entity_id: id,
      changes: { name: { old: existing.name, new: null } },
    },
  });

  return { id };
}
