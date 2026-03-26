import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// =============================================================================
// CONSTANTS
// =============================================================================

const VALID_CATEGORIES = ['open', 'active', 'review', 'done'] as const;

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const createStatusSchema = z.object({
  key: z.string().min(1).max(50).regex(/^[a-z][a-z0-9_]*$/, 'Key must be lowercase snake_case'),
  label: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  category: z.enum(VALID_CATEGORIES),
  sortOrder: z.number().int().optional().default(0),
});

export const updateStatusSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
  category: z.enum(VALID_CATEGORIES).optional(),
  sortOrder: z.number().int().optional(),
});

// =============================================================================
// CRUD
// =============================================================================

export async function getStatuses() {
  const statuses = await prisma.approvalStatus.findMany({
    orderBy: [{ category: 'asc' }, { sort_order: 'asc' }],
  });
  return statuses.map(mapStatus);
}

export async function getStatus(id: string) {
  const status = await prisma.approvalStatus.findUnique({ where: { id } });
  if (!status) throw new Error('Status not found');
  return mapStatus(status);
}

export async function createStatus(input: unknown) {
  const parsed = createStatusSchema.parse(input);

  // Check key uniqueness (Prisma unique constraint will also catch this)
  const existing = await prisma.approvalStatus.findUnique({ where: { key: parsed.key } });
  if (existing) {
    throw Object.assign(new Error(`Status key "${parsed.key}" already exists`), { code: 'DUPLICATE_KEY' });
  }

  const status = await prisma.approvalStatus.create({
    data: {
      key: parsed.key,
      label: parsed.label,
      color: parsed.color,
      category: parsed.category,
      is_system: false,
      sort_order: parsed.sortOrder,
    },
  });

  return mapStatus(status);
}

export async function updateStatus(id: string, input: unknown) {
  const parsed = updateStatusSchema.parse(input);

  const existing = await prisma.approvalStatus.findUnique({ where: { id } });
  if (!existing) throw new Error('Status not found');

  // System statuses: only label and color can be changed
  if (existing.is_system) {
    if (parsed.category !== undefined && parsed.category !== existing.category) {
      throw Object.assign(new Error('Cannot change category of a system status'), { code: 'SYSTEM_STATUS' });
    }
  }

  const data: Record<string, unknown> = {};
  if (parsed.label !== undefined) data.label = parsed.label;
  if (parsed.color !== undefined) data.color = parsed.color;
  if (parsed.category !== undefined) data.category = parsed.category;
  if (parsed.sortOrder !== undefined) data.sort_order = parsed.sortOrder;

  const status = await prisma.approvalStatus.update({ where: { id }, data });
  return mapStatus(status);
}

export async function archiveStatus(id: string) {
  const existing = await prisma.approvalStatus.findUnique({ where: { id } });
  if (!existing) throw new Error('Status not found');

  if (existing.is_system) {
    throw Object.assign(new Error('Cannot archive a system status'), { code: 'SYSTEM_STATUS' });
  }

  if (existing.is_archived) {
    return { success: true };
  }

  // Check if status is used in any transition
  const usedInTransitions = await prisma.approvalTransition.count({
    where: {
      OR: [
        { from_status: existing.key },
        { to_status: existing.key },
      ],
    },
  });

  if (usedInTransitions > 0) {
    throw Object.assign(
      new Error(`Trạng thái "${existing.label}" đang được dùng trong ${usedInTransitions} bước chuyển. Hãy xóa các bước chuyển trước.`),
      { code: 'STATUS_IN_USE' },
    );
  }

  // Check if any entity currently holds this status
  const [procedureCount, wpCount, planningWpCount] = await Promise.all([
    prisma.engagementProcedure.count({ where: { approval_status: existing.key } }),
    prisma.engagement.count({ where: { wp_approval_status: existing.key } }),
    prisma.planningWorkpaper.count({ where: { approval_status: existing.key } }),
  ]);
  const entityCount = procedureCount + wpCount + planningWpCount;

  if (entityCount > 0) {
    throw Object.assign(
      new Error(`${entityCount} thực thể đang ở trạng thái "${existing.label}". Hãy chuyển chúng sang trạng thái khác trước khi lưu trữ.`),
      { code: 'STATUS_HAS_ENTITIES', details: { procedureCount, wpCount, planningWpCount } },
    );
  }

  await prisma.approvalStatus.update({ where: { id }, data: { is_archived: true } });
  return { success: true };
}

export async function restoreStatus(id: string) {
  const existing = await prisma.approvalStatus.findUnique({ where: { id } });
  if (!existing) throw new Error('Status not found');

  if (!existing.is_archived) {
    return mapStatus(existing);
  }

  const status = await prisma.approvalStatus.update({
    where: { id },
    data: { is_archived: false },
  });
  return mapStatus(status);
}

export async function reorderStatuses(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.approvalStatus.update({
        where: { id },
        data: { sort_order: idx },
      }),
    ),
  );
  return getStatuses();
}

// =============================================================================
// MAPPER
// =============================================================================

type StatusRow = Awaited<ReturnType<typeof prisma.approvalStatus.findMany>>[number];

function mapStatus(s: StatusRow) {
  return {
    id: s.id,
    key: s.key,
    label: s.label,
    color: s.color,
    category: s.category,
    isSystem: s.is_system,
    isArchived: s.is_archived,
    sortOrder: s.sort_order,
    createdAt: s.created_at.toISOString(),
    updatedAt: s.updated_at.toISOString(),
  };
}
