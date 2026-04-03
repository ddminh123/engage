import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// =============================================================================
// CONSTANTS
// =============================================================================

const RISK_TYPES = [
  'operational', 'financial', 'compliance', 'strategic', 'it', 'governance', 'reputational',
] as const;
const RISK_RATINGS = ['low', 'medium', 'high', 'critical'] as const;
const LIKELIHOOD_LEVELS = ['rare', 'unlikely', 'possible', 'likely', 'almost_certain'] as const;
const IMPACT_LEVELS = ['insignificant', 'minor', 'moderate', 'major', 'catastrophic'] as const;
const CONTROL_TYPES = ['preventive', 'detective', 'corrective'] as const;
const CONTROL_NATURES = ['manual', 'automated', 'it_dependent'] as const;
const CONTROL_FREQUENCIES = [
  'continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'event_driven',
] as const;
const PROCEDURE_TYPES = [
  'inquiry', 'observation', 'inspection', 're_performance', 'analytical', 'walkthrough', 'other',
] as const;
const PROCEDURE_CATEGORIES = ['toc', 'substantive'] as const;
const SOURCES = ['system', 'custom'] as const;

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const createDomainSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  framework: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const updateDomainSchema = createDomainSchema.partial();

export const createCategorySchema = z.object({
  domainId: z.string().min(1, 'Domain is required'),
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  description: z.string().nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createRiskItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  riskType: z.enum(RISK_TYPES).nullable().optional(),
  riskRating: z.enum(RISK_RATINGS).nullable().optional(),
  likelihood: z.enum(LIKELIHOOD_LEVELS).nullable().optional(),
  impact: z.enum(IMPACT_LEVELS).nullable().optional(),
  frameworkRef: z.string().nullable().optional(),
  source: z.enum(SOURCES).optional(),
});

export const updateRiskItemSchema = createRiskItemSchema.partial();

export const createControlItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  controlType: z.enum(CONTROL_TYPES).nullable().optional(),
  controlNature: z.enum(CONTROL_NATURES).nullable().optional(),
  frequency: z.enum(CONTROL_FREQUENCIES).nullable().optional(),
  frameworkRef: z.string().nullable().optional(),
  source: z.enum(SOURCES).optional(),
});

export const updateControlItemSchema = createControlItemSchema.partial();

export const createProcedureItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  procedureType: z.enum(PROCEDURE_TYPES).nullable().optional(),
  procedureCategory: z.enum(PROCEDURE_CATEGORIES).nullable().optional(),
  frameworkRef: z.string().nullable().optional(),
  source: z.enum(SOURCES).optional(),
});

export const updateProcedureItemSchema = createProcedureItemSchema.partial();

// =============================================================================
// TREE / LIST QUERIES
// =============================================================================

/**
 * Get domain → category tree with item counts per category.
 * Returns active domains with their categories, each annotated with risk item count.
 */
export async function getRiskCatalogTree() {
  const domains = await prisma.riskCatalogDomain.findMany({
    where: { is_active: true },
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    include: {
      categories: {
        where: { is_active: true },
        orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: { risks: true },
          },
        },
      },
    },
  });

  return domains;
}

/**
 * Paginated risk catalog items with optional filters.
 */
export async function getRiskCatalogItems(filters?: {
  categoryId?: string;
  domainId?: string;
  source?: string;
  riskType?: string;
  search?: string;
}) {
  const where: NonNullable<Parameters<typeof prisma.riskCatalogItem.findMany>[0]>['where'] = {
    is_active: true,
  };

  const conditions: NonNullable<typeof where>['AND'] = [];

  if (filters?.categoryId) {
    conditions.push({ category_id: filters.categoryId });
  }

  if (filters?.domainId) {
    conditions.push({ category: { domain_id: filters.domainId } });
  }

  if (filters?.source) {
    conditions.push({ source: filters.source });
  }

  if (filters?.riskType) {
    conditions.push({ risk_type: filters.riskType });
  }

  if (filters?.search) {
    conditions.push({
      OR: [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
        { description: { contains: filters.search } },
      ],
    });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const items = await prisma.riskCatalogItem.findMany({
    where,
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    include: {
      category: {
        include: {
          domain: { select: { id: true, name: true, code: true } },
        },
      },
      control_refs: {
        include: {
          control: { select: { id: true, name: true, code: true, control_type: true } },
        },
      },
    },
  });

  return items;
}

/**
 * Paginated control catalog items with optional filters.
 */
export async function getControlCatalogItems(filters?: {
  source?: string;
  controlType?: string;
  search?: string;
}) {
  const where: NonNullable<Parameters<typeof prisma.controlCatalogItem.findMany>[0]>['where'] = {
    is_active: true,
  };

  const conditions: NonNullable<typeof where>['AND'] = [];

  if (filters?.source) {
    conditions.push({ source: filters.source });
  }

  if (filters?.controlType) {
    conditions.push({ control_type: filters.controlType });
  }

  if (filters?.search) {
    conditions.push({
      OR: [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
        { description: { contains: filters.search } },
      ],
    });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const items = await prisma.controlCatalogItem.findMany({
    where,
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    include: {
      risk_refs: {
        include: {
          risk: { select: { id: true, name: true, code: true, risk_type: true } },
        },
      },
      procedure_refs: {
        include: {
          procedure: { select: { id: true, name: true, code: true, procedure_type: true } },
        },
      },
    },
  });

  return items;
}

/**
 * Paginated procedure catalog items with optional filters.
 */
export async function getProcedureCatalogItems(filters?: {
  source?: string;
  procedureType?: string;
  search?: string;
}) {
  const where: NonNullable<Parameters<typeof prisma.procedureCatalogItem.findMany>[0]>['where'] = {
    is_active: true,
  };

  const conditions: NonNullable<typeof where>['AND'] = [];

  if (filters?.source) {
    conditions.push({ source: filters.source });
  }

  if (filters?.procedureType) {
    conditions.push({ procedure_type: filters.procedureType });
  }

  if (filters?.search) {
    conditions.push({
      OR: [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
        { description: { contains: filters.search } },
      ],
    });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const items = await prisma.procedureCatalogItem.findMany({
    where,
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    include: {
      control_refs: {
        include: {
          control: { select: { id: true, name: true, code: true, control_type: true } },
        },
      },
    },
  });

  return items;
}

// =============================================================================
// CRUD — DOMAINS
// =============================================================================

export async function createRiskCatalogDomain(input: unknown) {
  const parsed = createDomainSchema.parse(input);

  const maxOrder = await prisma.riskCatalogDomain.aggregate({
    _max: { sort_order: true },
  });

  const domain = await prisma.riskCatalogDomain.create({
    data: {
      name: parsed.name,
      code: parsed.code,
      framework: parsed.framework ?? null,
      description: parsed.description ?? null,
      sort_order: (maxOrder._max.sort_order ?? 0) + 1,
    },
  });

  return domain;
}

export async function updateRiskCatalogDomain(id: string, input: unknown) {
  const parsed = updateDomainSchema.parse(input);

  const domain = await prisma.riskCatalogDomain.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.code !== undefined && { code: parsed.code }),
      ...(parsed.framework !== undefined && { framework: parsed.framework ?? null }),
      ...(parsed.description !== undefined && { description: parsed.description ?? null }),
    },
  });

  return domain;
}

export async function deleteRiskCatalogDomain(id: string) {
  // Soft delete — mark as inactive
  await prisma.riskCatalogDomain.update({
    where: { id },
    data: { is_active: false },
  });
}

// =============================================================================
// CRUD — CATEGORIES
// =============================================================================

export async function createRiskCatalogCategory(input: unknown) {
  const parsed = createCategorySchema.parse(input);

  const maxOrder = await prisma.riskCatalogCategory.aggregate({
    where: { domain_id: parsed.domainId },
    _max: { sort_order: true },
  });

  const category = await prisma.riskCatalogCategory.create({
    data: {
      domain_id: parsed.domainId,
      name: parsed.name,
      code: parsed.code,
      description: parsed.description ?? null,
      sort_order: (maxOrder._max.sort_order ?? 0) + 1,
    },
  });

  return category;
}

export async function updateRiskCatalogCategory(id: string, input: unknown) {
  const parsed = updateCategorySchema.parse(input);

  const category = await prisma.riskCatalogCategory.update({
    where: { id },
    data: {
      ...(parsed.domainId !== undefined && { domain_id: parsed.domainId }),
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.code !== undefined && { code: parsed.code }),
      ...(parsed.description !== undefined && { description: parsed.description ?? null }),
    },
  });

  return category;
}

export async function deleteRiskCatalogCategory(id: string) {
  // Soft delete — mark as inactive
  await prisma.riskCatalogCategory.update({
    where: { id },
    data: { is_active: false },
  });
}

// =============================================================================
// CRUD — RISK ITEMS
// =============================================================================

export async function createRiskCatalogItem(input: unknown) {
  const parsed = createRiskItemSchema.parse(input);

  const maxOrder = await prisma.riskCatalogItem.aggregate({
    where: { category_id: parsed.categoryId },
    _max: { sort_order: true },
  });

  const item = await prisma.riskCatalogItem.create({
    data: {
      category_id: parsed.categoryId,
      name: parsed.name,
      code: parsed.code ?? null,
      description: parsed.description ?? null,
      risk_type: parsed.riskType ?? null,
      risk_rating: parsed.riskRating ?? null,
      likelihood: parsed.likelihood ?? null,
      impact: parsed.impact ?? null,
      framework_ref: parsed.frameworkRef ?? null,
      source: parsed.source ?? 'custom',
      sort_order: (maxOrder._max.sort_order ?? 0) + 1,
    },
    include: {
      category: {
        include: {
          domain: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });

  return item;
}

export async function updateRiskCatalogItem(id: string, input: unknown) {
  const parsed = updateRiskItemSchema.parse(input);

  const item = await prisma.riskCatalogItem.update({
    where: { id },
    data: {
      ...(parsed.categoryId !== undefined && { category_id: parsed.categoryId }),
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.code !== undefined && { code: parsed.code ?? null }),
      ...(parsed.description !== undefined && { description: parsed.description ?? null }),
      ...(parsed.riskType !== undefined && { risk_type: parsed.riskType ?? null }),
      ...(parsed.riskRating !== undefined && { risk_rating: parsed.riskRating ?? null }),
      ...(parsed.likelihood !== undefined && { likelihood: parsed.likelihood ?? null }),
      ...(parsed.impact !== undefined && { impact: parsed.impact ?? null }),
      ...(parsed.frameworkRef !== undefined && { framework_ref: parsed.frameworkRef ?? null }),
      ...(parsed.source !== undefined && { source: parsed.source }),
    },
    include: {
      category: {
        include: {
          domain: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });

  return item;
}

export async function deleteRiskCatalogItem(id: string) {
  // Soft delete — mark as inactive
  await prisma.riskCatalogItem.update({
    where: { id },
    data: { is_active: false },
  });
}

// =============================================================================
// CRUD — CONTROL ITEMS
// =============================================================================

export async function createControlCatalogItem(input: unknown) {
  const parsed = createControlItemSchema.parse(input);

  const maxOrder = await prisma.controlCatalogItem.aggregate({
    _max: { sort_order: true },
  });

  const item = await prisma.controlCatalogItem.create({
    data: {
      name: parsed.name,
      code: parsed.code ?? null,
      description: parsed.description ?? null,
      control_type: parsed.controlType ?? null,
      control_nature: parsed.controlNature ?? null,
      frequency: parsed.frequency ?? null,
      framework_ref: parsed.frameworkRef ?? null,
      source: parsed.source ?? 'custom',
      sort_order: (maxOrder._max.sort_order ?? 0) + 1,
    },
    include: {
      risk_refs: {
        include: {
          risk: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });

  return item;
}

export async function updateControlCatalogItem(id: string, input: unknown) {
  const parsed = updateControlItemSchema.parse(input);

  const item = await prisma.controlCatalogItem.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.code !== undefined && { code: parsed.code ?? null }),
      ...(parsed.description !== undefined && { description: parsed.description ?? null }),
      ...(parsed.controlType !== undefined && { control_type: parsed.controlType ?? null }),
      ...(parsed.controlNature !== undefined && { control_nature: parsed.controlNature ?? null }),
      ...(parsed.frequency !== undefined && { frequency: parsed.frequency ?? null }),
      ...(parsed.frameworkRef !== undefined && { framework_ref: parsed.frameworkRef ?? null }),
      ...(parsed.source !== undefined && { source: parsed.source }),
    },
  });

  return item;
}

export async function deleteControlCatalogItem(id: string) {
  // Soft delete — mark as inactive
  await prisma.controlCatalogItem.update({
    where: { id },
    data: { is_active: false },
  });
}

// =============================================================================
// CRUD — PROCEDURE ITEMS
// =============================================================================

export async function createProcedureCatalogItem(input: unknown) {
  const parsed = createProcedureItemSchema.parse(input);

  const maxOrder = await prisma.procedureCatalogItem.aggregate({
    _max: { sort_order: true },
  });

  const item = await prisma.procedureCatalogItem.create({
    data: {
      name: parsed.name,
      code: parsed.code ?? null,
      description: parsed.description ?? null,
      procedure_type: parsed.procedureType ?? null,
      procedure_category: parsed.procedureCategory ?? null,
      framework_ref: parsed.frameworkRef ?? null,
      source: parsed.source ?? 'custom',
      sort_order: (maxOrder._max.sort_order ?? 0) + 1,
    },
    include: {
      control_refs: {
        include: {
          control: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });

  return item;
}

export async function updateProcedureCatalogItem(id: string, input: unknown) {
  const parsed = updateProcedureItemSchema.parse(input);

  const item = await prisma.procedureCatalogItem.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.code !== undefined && { code: parsed.code ?? null }),
      ...(parsed.description !== undefined && { description: parsed.description ?? null }),
      ...(parsed.procedureType !== undefined && { procedure_type: parsed.procedureType ?? null }),
      ...(parsed.procedureCategory !== undefined && { procedure_category: parsed.procedureCategory ?? null }),
      ...(parsed.frameworkRef !== undefined && { framework_ref: parsed.frameworkRef ?? null }),
      ...(parsed.source !== undefined && { source: parsed.source }),
    },
  });

  return item;
}

export async function deleteProcedureCatalogItem(id: string) {
  // Soft delete — mark as inactive
  await prisma.procedureCatalogItem.update({
    where: { id },
    data: { is_active: false },
  });
}

// =============================================================================
// M:N LINKS
// =============================================================================

export async function linkRiskControl(riskCatalogId: string, controlCatalogId: string) {
  const ref = await prisma.riskControlCatalogRef.create({
    data: {
      risk_catalog_id: riskCatalogId,
      control_catalog_id: controlCatalogId,
    },
  });

  return ref;
}

export async function unlinkRiskControl(riskCatalogId: string, controlCatalogId: string) {
  await prisma.riskControlCatalogRef.delete({
    where: {
      risk_catalog_id_control_catalog_id: {
        risk_catalog_id: riskCatalogId,
        control_catalog_id: controlCatalogId,
      },
    },
  });
}

export async function linkControlProcedure(controlCatalogId: string, procedureCatalogId: string) {
  const ref = await prisma.controlProcedureCatalogRef.create({
    data: {
      control_catalog_id: controlCatalogId,
      procedure_catalog_id: procedureCatalogId,
    },
  });

  return ref;
}

export async function unlinkControlProcedure(controlCatalogId: string, procedureCatalogId: string) {
  await prisma.controlProcedureCatalogRef.delete({
    where: {
      control_catalog_id_procedure_catalog_id: {
        control_catalog_id: controlCatalogId,
        procedure_catalog_id: procedureCatalogId,
      },
    },
  });
}

// =============================================================================
// COPY TO ENGAGEMENT
// =============================================================================

/**
 * Copy catalog risk items into an engagement as EngagementRisk rows.
 * Sets `catalog_risk_id` for traceability back to the library.
 * Also copies linked controls if they exist.
 */
export async function copyRisksToEngagement(
  catalogRiskIds: string[],
  engagementId: string,
  rcmObjectiveId?: string,
) {
  // Fetch catalog risks with their linked controls
  const catalogRisks = await prisma.riskCatalogItem.findMany({
    where: { id: { in: catalogRiskIds }, is_active: true },
    include: {
      control_refs: {
        include: {
          control: true,
        },
      },
    },
  });

  // Get the current max sort_order for engagement risks
  const maxOrder = await prisma.engagementRisk.aggregate({
    where: { engagement_id: engagementId },
    _max: { sort_order: true },
  });

  let nextOrder = (maxOrder._max.sort_order ?? 0) + 1;

  const createdRisks = [];

  for (const catalogRisk of catalogRisks) {
    const risk = await prisma.engagementRisk.create({
      data: {
        engagement_id: engagementId,
        rcm_objective_id: rcmObjectiveId ?? null,
        catalog_risk_id: catalogRisk.id,
        risk_description: catalogRisk.name,
        risk_rating: catalogRisk.risk_rating,
        risk_category: catalogRisk.risk_type,
        likelihood: catalogRisk.likelihood,
        impact: catalogRisk.impact,
        sort_order: nextOrder++,
      },
    });

    createdRisks.push(risk);
  }

  return createdRisks;
}

/**
 * Copy catalog control items into an engagement as EngagementControl rows.
 * Sets `catalog_control_id` for traceability back to the library.
 */
export async function copyControlsToEngagement(
  catalogControlIds: string[],
  engagementId: string,
  linkToRiskId?: string,
) {
  const catalogControls = await prisma.controlCatalogItem.findMany({
    where: { id: { in: catalogControlIds }, is_active: true },
  });

  const maxOrder = await prisma.engagementControl.aggregate({
    where: { engagement_id: engagementId },
    _max: { sort_order: true },
  });

  let nextOrder = (maxOrder._max.sort_order ?? 0) + 1;

  const createdControls = [];

  for (const catalogControl of catalogControls) {
    const control = await prisma.engagementControl.create({
      data: {
        engagement_id: engagementId,
        catalog_control_id: catalogControl.id,
        description: catalogControl.name,
        control_type: catalogControl.control_type,
        control_nature: catalogControl.control_nature,
        frequency: catalogControl.frequency,
        sort_order: nextOrder++,
      },
    });

    // Link the new control to the specified risk
    if (linkToRiskId) {
      await prisma.riskControlRef.create({
        data: {
          risk_id: linkToRiskId,
          control_id: control.id,
        },
      });
    }

    createdControls.push(control);
  }

  return createdControls;
}
