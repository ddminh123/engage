import { prisma } from '@/lib/prisma';
import { logAudit } from './teams';
import { z } from 'zod';

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  position: z.string().max(255).nullable().optional(),
  email: z.string().email('Invalid email').nullable().optional().or(z.literal('')),
  phone: z.string().max(50).nullable().optional(),
  unitId: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactSchema = createContactSchema.partial();
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

// =============================================================================
// ACTIONS
// =============================================================================

export async function listContacts(query?: string) {
  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { name: { contains: query } },
      { email: { contains: query } },
      { phone: { contains: query } },
      { position: { contains: query } },
    ];
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: {
      unit: { select: { id: true, name: true } },
    },
    orderBy: { name: 'asc' },
  });

  return contacts.map((c) => ({
    id: c.id,
    name: c.name,
    position: c.position,
    email: c.email,
    phone: c.phone,
    unitId: c.unit_id,
    unitName: c.unit?.name ?? null,
    status: c.status as 'active' | 'inactive',
    createdAt: c.created_at.toISOString(),
    updatedAt: c.updated_at.toISOString(),
  }));
}

export async function getContactById(id: string) {
  const c = await prisma.contact.findUnique({
    where: { id },
    include: {
      unit: { select: { id: true, name: true } },
    },
  });

  if (!c) throw new Error('Contact not found');

  return {
    id: c.id,
    name: c.name,
    position: c.position,
    email: c.email,
    phone: c.phone,
    unitId: c.unit_id,
    unitName: c.unit?.name ?? null,
    status: c.status as 'active' | 'inactive',
    createdAt: c.created_at.toISOString(),
    updatedAt: c.updated_at.toISOString(),
  };
}

export async function updateContact(
  id: string,
  data: UpdateContactInput,
  userId: string,
  userName: string,
) {
  const parsed = updateContactSchema.parse(data);

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) throw new Error('Contact not found');

  const changes: Record<string, { old: unknown; new: unknown }> = {};
  if (parsed.name !== undefined && parsed.name !== existing.name) {
    changes.name = { old: existing.name, new: parsed.name };
  }
  if (parsed.position !== undefined && (parsed.position ?? null) !== existing.position) {
    changes.position = { old: existing.position, new: parsed.position };
  }
  if (parsed.email !== undefined && (parsed.email || null) !== existing.email) {
    changes.email = { old: existing.email, new: parsed.email };
  }
  if (parsed.phone !== undefined && (parsed.phone ?? null) !== existing.phone) {
    changes.phone = { old: existing.phone, new: parsed.phone };
  }
  if (parsed.unitId !== undefined && (parsed.unitId ?? null) !== existing.unit_id) {
    changes.unitId = { old: existing.unit_id, new: parsed.unitId };
  }
  if (parsed.status !== undefined && parsed.status !== existing.status) {
    changes.status = { old: existing.status, new: parsed.status };
  }

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.position !== undefined && { position: parsed.position ?? null }),
      ...(parsed.email !== undefined && { email: parsed.email || null }),
      ...(parsed.phone !== undefined && { phone: parsed.phone ?? null }),
      ...(parsed.unitId !== undefined && { unit_id: parsed.unitId ?? null }),
      ...(parsed.status !== undefined && { status: parsed.status }),
      updated_by: userId,
    },
    include: {
      unit: { select: { id: true, name: true } },
    },
  });

  if (Object.keys(changes).length > 0) {
    await logAudit({
      userId,
      userName,
      action: 'update',
      entityType: 'contact',
      entityId: id,
      changes,
    });
  }

  return {
    id: contact.id,
    name: contact.name,
    position: contact.position,
    email: contact.email,
    phone: contact.phone,
    unitId: contact.unit_id,
    unitName: contact.unit?.name ?? null,
    status: contact.status as 'active' | 'inactive',
    createdAt: contact.created_at.toISOString(),
    updatedAt: contact.updated_at.toISOString(),
  };
}

export async function deleteContact(
  id: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) throw new Error('Contact not found');

  await prisma.contact.delete({ where: { id } });

  await logAudit({
    userId,
    userName,
    action: 'delete',
    entityType: 'contact',
    entityId: id,
  });

  return { success: true };
}

export async function searchContacts(query: string) {
  const contacts = await prisma.contact.findMany({
    where: {
      status: 'active',
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ],
    },
    include: {
      unit: { select: { id: true, name: true } },
    },
    orderBy: { name: 'asc' },
    take: 20,
  });

  return contacts.map((c) => ({
    id: c.id,
    name: c.name,
    position: c.position,
    email: c.email,
    phone: c.phone,
    unitId: c.unit_id,
    unitName: c.unit?.name ?? null,
    status: c.status as 'active' | 'inactive',
  }));
}

export async function createContact(
  data: CreateContactInput,
  userId: string,
  userName: string,
) {
  const parsed = createContactSchema.parse(data);

  const contact = await prisma.contact.create({
    data: {
      name: parsed.name,
      position: parsed.position ?? null,
      email: parsed.email || null,
      phone: parsed.phone ?? null,
      unit_id: parsed.unitId ?? null,
      status: parsed.status,
      updated_by: userId,
    },
    include: {
      unit: { select: { id: true, name: true } },
    },
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'contact',
    entityId: contact.id,
  });

  return {
    id: contact.id,
    name: contact.name,
    position: contact.position,
    email: contact.email,
    phone: contact.phone,
    unitId: contact.unit_id,
    unitName: contact.unit?.name ?? null,
    status: contact.status as 'active' | 'inactive',
  };
}
