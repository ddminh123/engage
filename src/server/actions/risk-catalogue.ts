import { prisma } from '@/lib/prisma';
import { z } from 'zod/v4';

// =============================================================================
// SCHEMAS
// =============================================================================

export const createRiskCatalogueSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  description: z.string().optional(),
  riskType: z.string().optional(),
  categoryId: z.string().min(1),
  frameworkRef: z.string().nullable().optional(),
  source: z.string().optional(),
  riskRating: z.string().nullable().optional(),
  likelihood: z.string().nullable().optional(),
  impact: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateRiskCatalogueSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  riskType: z.string().nullable().optional(),
  categoryId: z.string().min(1).optional(),
  frameworkRef: z.string().nullable().optional(),
  source: z.string().optional(),
  riskRating: z.string().nullable().optional(),
  likelihood: z.string().nullable().optional(),
  impact: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// =============================================================================
// QUERIES
// =============================================================================

export async function getRiskCatalogueItems(includeInactive = false) {
  const where = includeInactive ? {} : { is_active: true };

  return prisma.riskCatalogItem.findMany({
    where,
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  });
}

export async function getRiskCatalogueItemById(id: string) {
  return prisma.riskCatalogItem.findUnique({ where: { id } });
}

// =============================================================================
// MUTATIONS
// =============================================================================

export async function createRiskCatalogueItem(data: z.infer<typeof createRiskCatalogueSchema>) {
  return prisma.riskCatalogItem.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      risk_type: data.riskType ?? null,
      category_id: data.categoryId,
      framework_ref: data.frameworkRef ?? null,
      source: data.source ?? 'custom',
      risk_rating: data.riskRating ?? null,
      likelihood: data.likelihood ?? null,
      impact: data.impact ?? null,
      sort_order: data.sortOrder ?? 0,
    },
  });
}

export async function updateRiskCatalogueItem(id: string, data: z.infer<typeof updateRiskCatalogueSchema>) {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.riskType !== undefined) updateData.risk_type = data.riskType;
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
  if (data.frameworkRef !== undefined) updateData.framework_ref = data.frameworkRef;
  if (data.source !== undefined) updateData.source = data.source;
  if (data.riskRating !== undefined) updateData.risk_rating = data.riskRating;
  if (data.likelihood !== undefined) updateData.likelihood = data.likelihood;
  if (data.impact !== undefined) updateData.impact = data.impact;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;
  if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

  return prisma.riskCatalogItem.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteRiskCatalogueItem(id: string) {
  const count = await prisma.entityRisk.count({ where: { catalogue_item_id: id } });
  if (count > 0) {
    throw new Error('Không thể xóa rủi ro đang được sử dụng trong đối tượng kiểm toán. Hãy vô hiệu hóa thay vì xóa.');
  }
  await prisma.riskCatalogItem.delete({ where: { id } });
}
