import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// =============================================================================
// SCHEMAS
// =============================================================================

export const createTemplateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  parent_id: z.string().optional().nullable(),
  sort_order: z.number().int().optional().default(0),
});

export const updateTemplateCategorySchema = createTemplateCategorySchema.partial();

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  content: z.any(), // Tiptap JSON
  entity_type: z.string().min(1),
  category_id: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export type CreateTemplateCategoryInput = z.infer<typeof createTemplateCategorySchema>;
export type UpdateTemplateCategoryInput = z.infer<typeof updateTemplateCategorySchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

// =============================================================================
// HELPERS
// =============================================================================

function mapCategory(r: {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  children?: { id: string; name: string; sort_order: number }[];
  _count?: { templates: number };
}) {
  return {
    id: r.id,
    name: r.name,
    parentId: r.parent_id,
    sortOrder: r.sort_order,
    templateCount: r._count?.templates ?? 0,
    children: r.children?.map((c) => ({
      id: c.id,
      name: c.name,
      sortOrder: c.sort_order,
    })),
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

function mapTemplate(r: {
  id: string;
  name: string;
  description: string | null;
  content: unknown;
  entity_type: string;
  category_id: string | null;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  category?: { id: string; name: string } | null;
  creator?: { id: string; name: string } | null;
}) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    content: r.content,
    entityType: r.entity_type,
    categoryId: r.category_id,
    categoryName: r.category?.name ?? null,
    isActive: r.is_active,
    createdBy: r.created_by,
    creatorName: r.creator?.name ?? null,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

// =============================================================================
// CATEGORY ACTIONS
// =============================================================================

export async function listTemplateCategories() {
  const items = await prisma.templateCategory.findMany({
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    include: {
      children: { select: { id: true, name: true, sort_order: true }, orderBy: { sort_order: 'asc' } },
      _count: { select: { templates: true } },
    },
  });
  return items.map(mapCategory);
}

export async function createTemplateCategory(data: CreateTemplateCategoryInput) {
  const parsed = createTemplateCategorySchema.parse(data);
  const item = await prisma.templateCategory.create({
    data: {
      name: parsed.name,
      parent_id: parsed.parent_id ?? null,
      sort_order: parsed.sort_order,
    },
    include: {
      children: { select: { id: true, name: true, sort_order: true } },
      _count: { select: { templates: true } },
    },
  });
  return mapCategory(item);
}

export async function updateTemplateCategory(id: string, data: UpdateTemplateCategoryInput) {
  const parsed = updateTemplateCategorySchema.parse(data);
  const item = await prisma.templateCategory.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.parent_id !== undefined && { parent_id: parsed.parent_id }),
      ...(parsed.sort_order !== undefined && { sort_order: parsed.sort_order }),
    },
    include: {
      children: { select: { id: true, name: true, sort_order: true } },
      _count: { select: { templates: true } },
    },
  });
  return mapCategory(item);
}

export async function deleteTemplateCategory(id: string) {
  await prisma.templateCategory.delete({ where: { id } });
}

// =============================================================================
// TEMPLATE ACTIONS
// =============================================================================

export async function listTemplates(filters?: { entity_type?: string; category_id?: string; is_active?: boolean }) {
  const where: Record<string, unknown> = {};
  if (filters?.entity_type) where.entity_type = filters.entity_type;
  if (filters?.category_id) where.category_id = filters.category_id;
  if (filters?.is_active !== undefined) where.is_active = filters.is_active;

  const items = await prisma.template.findMany({
    where,
    orderBy: [{ updated_at: 'desc' }],
    include: {
      category: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  });
  return items.map(mapTemplate);
}

export async function getTemplateById(id: string) {
  const item = await prisma.template.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  });
  if (!item) throw new Error('Template not found');
  return mapTemplate(item);
}

export async function createTemplate(data: CreateTemplateInput, userId: string) {
  const parsed = createTemplateSchema.parse(data);
  const item = await prisma.template.create({
    data: {
      name: parsed.name,
      description: parsed.description ?? null,
      content: parsed.content ?? {},
      entity_type: parsed.entity_type,
      category_id: parsed.category_id ?? null,
      is_active: parsed.is_active,
      created_by: userId,
    },
    include: {
      category: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  });
  return mapTemplate(item);
}

export async function updateTemplate(id: string, data: UpdateTemplateInput) {
  const parsed = updateTemplateSchema.parse(data);
  const updateData: Record<string, unknown> = {};
  if (parsed.name !== undefined) updateData.name = parsed.name;
  if (parsed.description !== undefined) updateData.description = parsed.description;
  if (parsed.content !== undefined) updateData.content = parsed.content;
  if (parsed.entity_type !== undefined) updateData.entity_type = parsed.entity_type;
  if (parsed.category_id !== undefined) updateData.category_id = parsed.category_id;
  if (parsed.is_active !== undefined) updateData.is_active = parsed.is_active;

  const item = await prisma.template.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  });
  return mapTemplate(item);
}

export async function deleteTemplate(id: string) {
  await prisma.template.delete({ where: { id } });
}
