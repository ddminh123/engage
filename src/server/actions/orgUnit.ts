import { prisma } from '@/lib/prisma';
import { logAudit } from './teams';
import { z } from 'zod';

// =============================================================================
// TYPES
// =============================================================================

export interface OrgUnitFilters {
  status?: 'active' | 'inactive';
  search?: string;
  parentId?: string | null;
}

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(255),
  position: z.string().max(255).nullable().optional(),
  email: z.string().email('Invalid email').nullable().optional().or(z.literal('')),
  phone: z.string().max(50).nullable().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const createOrgUnitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().max(50).nullable().optional(),
  parentId: z.string().nullable().optional(),
  leader: contactSchema.nullable().optional(),
  contactPoint: contactSchema.nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  established: z.coerce.date().nullable().optional(),
  discontinued: z.coerce.date().nullable().optional(),
});

export const updateOrgUnitSchema = createOrgUnitSchema.partial();

export type CreateOrgUnitInput = z.infer<typeof createOrgUnitSchema>;
export type UpdateOrgUnitInput = z.infer<typeof updateOrgUnitSchema>;

async function getDepth(parentId: string | null): Promise<number> {
  if (!parentId) return 0;
  
  let depth = 0;
  let currentId: string | null = parentId;
  
  while (currentId) {
    depth++;
    const parent: { parent_id: string | null } | null = await prisma.orgUnit.findUnique({
      where: { id: currentId },
      select: { parent_id: true },
    });
    currentId = parent?.parent_id ?? null;
  }
  
  return depth;
}

async function wouldCreateCircularRef(
  unitId: string,
  newParentId: string | null
): Promise<boolean> {
  if (!newParentId) return false;
  if (unitId === newParentId) return true;
  
  let currentId: string | null = newParentId;
  while (currentId) {
    if (currentId === unitId) return true;
    const parent: { parent_id: string | null } | null = await prisma.orgUnit.findUnique({
      where: { id: currentId },
      select: { parent_id: true },
    });
    currentId = parent?.parent_id ?? null;
  }
  
  return false;
}

// =============================================================================
// CRUD ACTIONS
// =============================================================================

export async function getOrgUnits(filters?: OrgUnitFilters) {
  const where: Record<string, unknown> = {};
  
  if (filters?.status) {
    where.status = filters.status;
  }
  
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { code: { contains: filters.search } },
      { leader: { name: { contains: filters.search } } },
    ];
  }
  
  if (filters?.parentId !== undefined) {
    where.parent_id = filters.parentId;
  }
  
  const units = await prisma.orgUnit.findMany({
    where,
    include: {
      parent: { select: { id: true, name: true } },
      leader: true,
      contact_point: true,
      _count: { select: { children: true } },
    },
    orderBy: [{ name: 'asc' }],
  });
  
  return units.map((unit: typeof units[number]) => ({
    id: unit.id,
    name: unit.name,
    code: unit.code,
    parentId: unit.parent_id,
    parentName: unit.parent?.name ?? null,
    leaderId: unit.leader_id,
    leader: unit.leader ? mapContact(unit.leader) : null,
    contactPointId: unit.contact_point_id,
    contactPoint: unit.contact_point ? mapContact(unit.contact_point) : null,
    description: unit.description,
    status: unit.status as 'active' | 'inactive',
    established: unit.established ? unit.established.toISOString() : null,
    discontinued: unit.discontinued ? unit.discontinued.toISOString() : null,
    createdAt: unit.created_at.toISOString(),
    updatedAt: unit.updated_at.toISOString(),
    updatedBy: unit.updated_by,
    childrenCount: unit._count.children,
  }));
}

// =============================================================================
// HELPERS
// =============================================================================

type ContactRecord = { id: string; name: string; position: string | null; email: string | null; phone: string | null; status: string };

function mapContact(c: ContactRecord) {
  return {
    id: c.id,
    name: c.name,
    position: c.position,
    email: c.email,
    phone: c.phone,
    status: c.status as 'active' | 'inactive',
  };
}

export async function getOrgUnitById(id: string) {
  const unit = await prisma.orgUnit.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      leader: true,
      contact_point: true,
      children: {
        select: { id: true, name: true, status: true },
        orderBy: { name: 'asc' },
      },
    },
  });
  
  if (!unit) return null;
  
  return {
    id: unit.id,
    name: unit.name,
    code: unit.code,
    parentId: unit.parent_id,
    parentName: unit.parent?.name ?? null,
    leaderId: unit.leader_id,
    leader: unit.leader ? mapContact(unit.leader) : null,
    contactPointId: unit.contact_point_id,
    contactPoint: unit.contact_point ? mapContact(unit.contact_point) : null,
    description: unit.description,
    status: unit.status as 'active' | 'inactive',
    established: unit.established ? unit.established.toISOString() : null,
    discontinued: unit.discontinued ? unit.discontinued.toISOString() : null,
    createdAt: unit.created_at.toISOString(),
    updatedAt: unit.updated_at.toISOString(),
    updatedBy: unit.updated_by,
    children: unit.children.map((c: { id: string; name: string; status: string }) => ({
      id: c.id,
      name: c.name,
      status: c.status as 'active' | 'inactive',
    })),
  };
}

export async function createOrgUnit(
  data: CreateOrgUnitInput,
  userId: string,
  userName: string
) {
  // Zod validation
  const parsed = createOrgUnitSchema.parse(data);
  
  // Validate code uniqueness
  if (parsed.code) {
    const existing = await prisma.orgUnit.findUnique({
      where: { code: parsed.code },
    });
    if (existing) {
      throw new Error('Code already exists');
    }
  }
  
  // Validate parent exists
  if (parsed.parentId) {
    const parent = await prisma.orgUnit.findUnique({
      where: { id: parsed.parentId },
    });
    if (!parent) {
      throw new Error('Parent unit not found');
    }
    
    // Check max depth (5 levels)
    const depth = await getDepth(parsed.parentId);
    if (depth >= 4) {
      throw new Error('Maximum hierarchy depth (5 levels) exceeded');
    }
  }
  
  const unit = await prisma.$transaction(async (tx) => {
    let leaderId: string | undefined;
    let contactPointId: string | undefined;

    if (parsed.leader) {
      if (parsed.leader.id) {
        leaderId = parsed.leader.id;
      } else {
        const leader = await tx.contact.create({
          data: {
            name: parsed.leader.name,
            position: parsed.leader.position ?? null,
            email: parsed.leader.email || null,
            phone: parsed.leader.phone ?? null,
            status: parsed.leader.status ?? 'active',
            updated_by: userId,
          },
        });
        leaderId = leader.id;
      }
    }

    if (parsed.contactPoint) {
      if (parsed.contactPoint.id) {
        contactPointId = parsed.contactPoint.id;
      } else {
        const cp = await tx.contact.create({
          data: {
            name: parsed.contactPoint.name,
            position: parsed.contactPoint.position ?? null,
            email: parsed.contactPoint.email || null,
            phone: parsed.contactPoint.phone ?? null,
            status: parsed.contactPoint.status ?? 'active',
            updated_by: userId,
          },
        });
        contactPointId = cp.id;
      }
    }

    return tx.orgUnit.create({
      data: {
        name: parsed.name,
        code: parsed.code ?? null,
        parent_id: parsed.parentId ?? null,
        leader_id: leaderId ?? null,
        contact_point_id: contactPointId ?? null,
        description: parsed.description ?? null,
        status: parsed.status,
        established: parsed.established ?? null,
        discontinued: parsed.discontinued ?? null,
        updated_by: userId,
      },
    });
  });
  
  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'org_unit',
    entityId: unit.id,
  });
  
  return {
    id: unit.id,
    name: unit.name,
    code: unit.code,
    parentId: unit.parent_id,
    status: unit.status as 'active' | 'inactive',
  };
}

export async function updateOrgUnit(
  id: string,
  data: UpdateOrgUnitInput,
  userId: string,
  userName: string
) {
  // Zod validation
  const parsed = updateOrgUnitSchema.parse(data);
  
  const existing = await prisma.orgUnit.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Unit not found');
  }
  
  // Validate code uniqueness
  if (parsed.code && parsed.code !== existing.code) {
    const codeExists = await prisma.orgUnit.findUnique({
      where: { code: parsed.code },
    });
    if (codeExists) {
      throw new Error('Code already exists');
    }
  }
  
  // Validate parent change
  if (parsed.parentId !== undefined && parsed.parentId !== existing.parent_id) {
    if (parsed.parentId) {
      // Check circular reference
      if (await wouldCreateCircularRef(id, parsed.parentId)) {
        throw new Error('Cannot set parent: would create circular reference');
      }
      
      // Check max depth
      const depth = await getDepth(parsed.parentId);
      if (depth >= 4) {
        throw new Error('Maximum hierarchy depth (5 levels) exceeded');
      }
    }
  }
  
  // Build changes for audit log
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  if (parsed.name !== undefined && parsed.name !== existing.name) {
    changes.name = { old: existing.name, new: parsed.name };
  }
  if (parsed.code !== undefined && parsed.code !== existing.code) {
    changes.code = { old: existing.code, new: parsed.code };
  }
  if (parsed.parentId !== undefined && parsed.parentId !== existing.parent_id) {
    changes.parentId = { old: existing.parent_id, new: parsed.parentId };
  }
  if (parsed.status !== undefined && parsed.status !== existing.status) {
    changes.status = { old: existing.status, new: parsed.status };
  }
  
  const unit = await prisma.$transaction(async (tx) => {
    if (parsed.leader !== undefined) {
      if (parsed.leader === null) {
        if (existing.leader_id) await tx.contact.delete({ where: { id: existing.leader_id } });
      } else if (parsed.leader.id && parsed.leader.id !== existing.leader_id) {
        // Link to an existing contact (e.g. pre-created via ContactForm)
        await tx.orgUnit.update({ where: { id }, data: { leader_id: parsed.leader.id } });
      } else if (existing.leader_id) {
        await tx.contact.update({
          where: { id: existing.leader_id },
          data: { name: parsed.leader.name, position: parsed.leader.position ?? null, email: parsed.leader.email || null, phone: parsed.leader.phone ?? null, status: parsed.leader.status ?? 'active', updated_by: userId },
        });
      } else {
        const leader = await tx.contact.create({
          data: { name: parsed.leader.name, position: parsed.leader.position ?? null, email: parsed.leader.email || null, phone: parsed.leader.phone ?? null, status: parsed.leader.status ?? 'active', updated_by: userId },
        });
        await tx.orgUnit.update({ where: { id }, data: { leader_id: leader.id } });
      }
    }

    if (parsed.contactPoint !== undefined) {
      if (parsed.contactPoint === null) {
        if (existing.contact_point_id) await tx.contact.delete({ where: { id: existing.contact_point_id } });
      } else if (parsed.contactPoint.id && parsed.contactPoint.id !== existing.contact_point_id) {
        // Link to an existing contact (e.g. pre-created via ContactForm)
        await tx.orgUnit.update({ where: { id }, data: { contact_point_id: parsed.contactPoint.id } });
      } else if (existing.contact_point_id) {
        await tx.contact.update({
          where: { id: existing.contact_point_id },
          data: { name: parsed.contactPoint.name, position: parsed.contactPoint.position ?? null, email: parsed.contactPoint.email || null, phone: parsed.contactPoint.phone ?? null, status: parsed.contactPoint.status ?? 'active', updated_by: userId },
        });
      } else {
        const cp = await tx.contact.create({
          data: { name: parsed.contactPoint.name, position: parsed.contactPoint.position ?? null, email: parsed.contactPoint.email || null, phone: parsed.contactPoint.phone ?? null, status: parsed.contactPoint.status ?? 'active', updated_by: userId },
        });
        await tx.orgUnit.update({ where: { id }, data: { contact_point_id: cp.id } });
      }
    }

    return tx.orgUnit.update({
      where: { id },
      data: {
        name: parsed.name,
        code: parsed.code,
        parent_id: parsed.parentId,
        leader_id: parsed.leader === null ? null : undefined,
        contact_point_id: parsed.contactPoint === null ? null : undefined,
        description: parsed.description,
        status: parsed.status,
        established: parsed.established,
        discontinued: parsed.discontinued,
        updated_by: userId,
      },
    });
  });
  
  if (Object.keys(changes).length > 0) {
    await logAudit({
      userId,
      userName,
      action: 'update',
      entityType: 'org_unit',
      entityId: id,
      changes,
    });
  }
  
  return {
    id: unit.id,
    name: unit.name,
    code: unit.code,
    parentId: unit.parent_id,
    status: unit.status as 'active' | 'inactive',
  };
}

export async function deleteOrgUnit(
  id: string,
  userId: string,
  userName: string
) {
  const existing = await prisma.orgUnit.findUnique({
    where: { id },
    include: {
      _count: { select: { children: true } },
    },
  });
  
  if (!existing) {
    throw new Error('Unit not found');
  }
  
  // Check for children
  if (existing._count.children > 0) {
    throw new Error('Cannot delete: unit has child units');
  }
  
  // TODO: Check for entity references when Universe module is implemented
  
  await prisma.orgUnit.delete({ where: { id } });
  
  await logAudit({
    userId,
    userName,
    action: 'delete',
    entityType: 'org_unit',
    entityId: id,
  });
  
  return { success: true };
}
