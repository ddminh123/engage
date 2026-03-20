import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// =============================================================================
// SCHEMAS
// =============================================================================

export const RELATES_TO_VALUES = ['impact', 'likelihood', 'control'] as const;

export const createRiskAssessmentFactorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  relates_to: z.enum(RELATES_TO_VALUES).default('impact'),
  is_positive: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

export const updateRiskAssessmentFactorSchema = createRiskAssessmentFactorSchema.partial();

export type CreateRiskAssessmentFactorInput = z.infer<typeof createRiskAssessmentFactorSchema>;
export type UpdateRiskAssessmentFactorInput = z.infer<typeof updateRiskAssessmentFactorSchema>;

// =============================================================================
// HELPERS
// =============================================================================

function mapRiskAssessmentFactor(r: {
  id: string; name: string; code: string | null;
  description: string | null; relates_to: string; is_positive: boolean;
  is_active: boolean; sort_order: number; created_at: Date; updated_at: Date;
}) {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    description: r.description,
    relatesTo: r.relates_to as 'impact' | 'likelihood' | 'control',
    isPositive: r.is_positive,
    isActive: r.is_active,
    sortOrder: r.sort_order,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

// =============================================================================
// ACTIONS
// =============================================================================

export async function listRiskAssessmentFactors(includeInactive = false) {
  const items = await prisma.riskAssessmentFactor.findMany({
    where: includeInactive ? undefined : { is_active: true },
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  });
  return items.map(mapRiskAssessmentFactor);
}

export async function getRiskAssessmentFactorById(id: string) {
  const item = await prisma.riskAssessmentFactor.findUnique({ where: { id } });
  if (!item) throw new Error('Risk assessment factor not found');
  return mapRiskAssessmentFactor(item);
}

export async function createRiskAssessmentFactor(
  body: unknown,
  userId: string,
  userName: string,
) {
  const parsed = createRiskAssessmentFactorSchema.parse(body);

  const item = await prisma.riskAssessmentFactor.create({
    data: {
      name: parsed.name,
      code: parsed.code ?? null,
      description: parsed.description ?? null,
      relates_to: parsed.relates_to,
      is_positive: parsed.is_positive ?? false,
      is_active: parsed.is_active ?? true,
      sort_order: parsed.sort_order ?? 0,
    },
  });

  await prisma.auditLog.create({
    data: {
      user_id: userId,
      user_name: userName,
      action: 'create',
      entity_type: 'risk_assessment_factor',
      entity_id: item.id,
      changes: { name: { old: null, new: item.name } },
    },
  });

  return mapRiskAssessmentFactor(item);
}

export async function updateRiskAssessmentFactor(
  id: string,
  body: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.riskAssessmentFactor.findUnique({ where: { id } });
  if (!existing) throw new Error('Risk assessment factor not found');

  const parsed = updateRiskAssessmentFactorSchema.parse(body);

  const item = await prisma.riskAssessmentFactor.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.code !== undefined && { code: parsed.code }),
      ...(parsed.description !== undefined && { description: parsed.description }),
      ...(parsed.relates_to !== undefined && { relates_to: parsed.relates_to }),
      ...(parsed.is_positive !== undefined && { is_positive: parsed.is_positive }),
      ...(parsed.is_active !== undefined && { is_active: parsed.is_active }),
      ...(parsed.sort_order !== undefined && { sort_order: parsed.sort_order }),
    },
  });

  await prisma.auditLog.create({
    data: {
      user_id: userId,
      user_name: userName,
      action: 'update',
      entity_type: 'risk_assessment_factor',
      entity_id: id,
      changes: parsed,
    },
  });

  return mapRiskAssessmentFactor(item);
}

export async function deleteRiskAssessmentFactor(
  id: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.riskAssessmentFactor.findUnique({ where: { id } });
  if (!existing) throw new Error('Risk assessment factor not found');

  await prisma.riskAssessmentFactor.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      user_id: userId,
      user_name: userName,
      action: 'delete',
      entity_type: 'risk_assessment_factor',
      entity_id: id,
      changes: { name: { old: existing.name, new: null } },
    },
  });

  return { id };
}
