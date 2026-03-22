import { prisma } from '@/lib/prisma';
import { z } from 'zod/v4';

// =============================================================================
// SCHEMAS
// =============================================================================

export const createExpertiseSchema = z.object({
  label: z.string().min(1),
  code: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateExpertiseSchema = z.object({
  label: z.string().min(1).optional(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// =============================================================================
// QUERIES
// =============================================================================

export async function getExpertises(includeInactive = false) {
  const where = includeInactive ? {} : { is_active: true };

  return prisma.expertise.findMany({
    where,
    orderBy: { sort_order: 'asc' },
  });
}

export async function getExpertiseById(id: string) {
  return prisma.expertise.findUnique({ where: { id } });
}

// =============================================================================
// MUTATIONS
// =============================================================================

export async function createExpertise(data: z.infer<typeof createExpertiseSchema>) {
  return prisma.expertise.create({
    data: {
      label: data.label,
      code: data.code,
      description: data.description,
      sort_order: data.sortOrder ?? 0,
    },
  });
}

export async function updateExpertise(id: string, data: z.infer<typeof updateExpertiseSchema>) {
  const updateData: Record<string, unknown> = {};

  if (data.label !== undefined) updateData.label = data.label;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  return prisma.expertise.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteExpertise(id: string) {
  // Check if expertise is in use
  const count = await prisma.userExpertise.count({ where: { expertise_id: id } });
  if (count > 0) {
    throw new Error('Cannot delete expertise that is assigned to users. Deactivate it instead.');
  }
  await prisma.expertise.delete({ where: { id } });
}
