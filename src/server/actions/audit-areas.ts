import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// =============================================================================
// SCHEMAS
// =============================================================================

export const createAuditAreaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

export const updateAuditAreaSchema = createAuditAreaSchema.partial();

export type CreateAuditAreaInput = z.infer<typeof createAuditAreaSchema>;
export type UpdateAuditAreaInput = z.infer<typeof updateAuditAreaSchema>;

// =============================================================================
// HELPERS
// =============================================================================

function mapAuditArea(r: {
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

export async function listAuditAreas(includeInactive = false) {
  const items = await prisma.auditArea.findMany({
    where: includeInactive ? undefined : { is_active: true },
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  });
  return items.map(mapAuditArea);
}

export async function getAuditAreaById(id: string) {
  const item = await prisma.auditArea.findUnique({ where: { id } });
  if (!item) throw new Error('Audit area not found');
  return mapAuditArea(item);
}

export async function createAuditArea(
  body: unknown,
  userId: string,
  userName: string,
) {
  const parsed = createAuditAreaSchema.parse(body);

  const item = await prisma.auditArea.create({
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
      entity_type: 'audit_area',
      entity_id: item.id,
      changes: { name: { old: null, new: item.name } },
    },
  });

  return mapAuditArea(item);
}

export async function updateAuditArea(
  id: string,
  body: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.auditArea.findUnique({ where: { id } });
  if (!existing) throw new Error('Audit area not found');

  const parsed = updateAuditAreaSchema.parse(body);

  const item = await prisma.auditArea.update({
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
      entity_type: 'audit_area',
      entity_id: id,
      changes: parsed,
    },
  });

  return mapAuditArea(item);
}

export async function deleteAuditArea(
  id: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.auditArea.findUnique({ where: { id } });
  if (!existing) throw new Error('Audit area not found');

  // Check if any entities are using this area
  const usageCount = await prisma.auditableEntityArea.count({
    where: { area_id: id },
  });
  if (usageCount > 0) {
    throw new Error(`Cannot delete: ${usageCount} entities are using this area`);
  }

  await prisma.auditArea.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      user_id: userId,
      user_name: userName,
      action: 'delete',
      entity_type: 'audit_area',
      entity_id: id,
      changes: { name: { old: existing.name, new: null } },
    },
  });

  return { id };
}
