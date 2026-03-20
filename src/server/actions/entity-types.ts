import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// =============================================================================
// SCHEMAS
// =============================================================================

export const createEntityTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

export const updateEntityTypeSchema = createEntityTypeSchema.partial();

export type CreateEntityTypeInput = z.infer<typeof createEntityTypeSchema>;
export type UpdateEntityTypeInput = z.infer<typeof updateEntityTypeSchema>;

// =============================================================================
// HELPERS
// =============================================================================

function mapEntityType(r: {
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

export async function listEntityTypes(includeInactive = false) {
  const items = await prisma.entityType.findMany({
    where: includeInactive ? undefined : { is_active: true },
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  });
  return items.map(mapEntityType);
}

export async function getEntityTypeById(id: string) {
  const item = await prisma.entityType.findUnique({ where: { id } });
  if (!item) throw new Error('Entity type not found');
  return mapEntityType(item);
}

export async function createEntityType(
  body: unknown,
  userId: string,
  userName: string,
) {
  const parsed = createEntityTypeSchema.parse(body);

  const item = await prisma.entityType.create({
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
      entity_type: 'entity_type',
      entity_id: item.id,
      changes: { name: { old: null, new: item.name } },
    },
  });

  return mapEntityType(item);
}

export async function updateEntityType(
  id: string,
  body: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.entityType.findUnique({ where: { id } });
  if (!existing) throw new Error('Entity type not found');

  const parsed = updateEntityTypeSchema.parse(body);

  const item = await prisma.entityType.update({
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
      entity_type: 'entity_type',
      entity_id: id,
      changes: parsed,
    },
  });

  return mapEntityType(item);
}

export async function deleteEntityType(
  id: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.entityType.findUnique({ where: { id } });
  if (!existing) throw new Error('Entity type not found');

  // Check if any entities are using this type
  const usageCount = await prisma.auditableEntity.count({
    where: { entity_type_id: id },
  });
  if (usageCount > 0) {
    throw new Error(`Cannot delete: ${usageCount} entities are using this type`);
  }

  await prisma.entityType.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      user_id: userId,
      user_name: userName,
      action: 'delete',
      entity_type: 'entity_type',
      entity_id: id,
      changes: { name: { old: existing.name, new: null } },
    },
  });

  return { id };
}
