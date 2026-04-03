import { prisma } from '@/lib/prisma';
import { z } from 'zod/v4';

// =============================================================================
// SCHEMAS
// =============================================================================

export const createEntityRiskSchema = z.object({
  catalogueItemId: z.string().nullable().optional(),
  name: z.string().min(1),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  riskType: z.string().min(1),
  riskDomain: z.string().nullable().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateEntityRiskSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  riskType: z.string().min(1).optional(),
  riskDomain: z.string().nullable().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const copyFromCatalogueSchema = z.object({
  catalogueItemIds: z.array(z.string().min(1)).min(1),
});

// =============================================================================
// QUERIES
// =============================================================================

export async function getEntityRisks(entityId: string) {
  return prisma.entityRisk.findMany({
    where: { entity_id: entityId },
    include: { catalogue_item: { select: { id: true, name: true, code: true } } },
    orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }, { name: 'asc' }],
  });
}

// =============================================================================
// MUTATIONS
// =============================================================================

export async function createEntityRisk(entityId: string, data: z.infer<typeof createEntityRiskSchema>) {
  return prisma.entityRisk.create({
    data: {
      entity_id: entityId,
      catalogue_item_id: data.catalogueItemId ?? null,
      name: data.name,
      code: data.code ?? null,
      description: data.description ?? null,
      risk_type: data.riskType,
      risk_domain: data.riskDomain ?? null,
      is_primary: data.isPrimary ?? false,
      sort_order: data.sortOrder ?? 0,
    },
    include: { catalogue_item: { select: { id: true, name: true, code: true } } },
  });
}

export async function copyFromCatalogue(entityId: string, catalogueItemIds: string[]) {
  const items = await prisma.riskCatalogItem.findMany({
    where: { id: { in: catalogueItemIds }, is_active: true },
  });

  // Filter out items already linked to this entity
  const existing = await prisma.entityRisk.findMany({
    where: { entity_id: entityId, catalogue_item_id: { in: catalogueItemIds } },
    select: { catalogue_item_id: true },
  });
  const existingIds = new Set(existing.map((e) => e.catalogue_item_id));
  const newItems = items.filter((item) => !existingIds.has(item.id));

  if (newItems.length === 0) {
    return [];
  }

  await prisma.entityRisk.createMany({
    data: newItems.map((item) => ({
      entity_id: entityId,
      catalogue_item_id: item.id,
      name: item.name,
      code: item.code,
      description: item.description,
      risk_type: item.risk_type ?? 'operational',
      risk_domain: null,
      is_primary: false,
      sort_order: item.sort_order,
    })),
  });

  return getEntityRisks(entityId);
}

export async function updateEntityRisk(id: string, data: z.infer<typeof updateEntityRiskSchema>) {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.riskType !== undefined) updateData.risk_type = data.riskType;
  if (data.riskDomain !== undefined) updateData.risk_domain = data.riskDomain;
  if (data.isPrimary !== undefined) updateData.is_primary = data.isPrimary;
  if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

  return prisma.entityRisk.update({
    where: { id },
    data: updateData,
    include: { catalogue_item: { select: { id: true, name: true, code: true } } },
  });
}

export async function deleteEntityRisk(id: string) {
  await prisma.entityRisk.delete({ where: { id } });
}
