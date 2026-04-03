import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const createWorkflowSchema = z.object({
  entityType: z.string().optional(), // deprecated — kept for backward compat
  name: z.string().min(1),
  allowSelfApproval: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
});

export const upsertEntityBindingSchema = z.object({
  entityType: z.string().min(1),
  subType: z.string().optional().default(''),
  workflowId: z.string().min(1),
  label: z.string().optional(),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  allowSelfApproval: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export const createTransitionSchema = z.object({
  fromStatus: z.string().min(1),
  toStatus: z.string().min(1),
  actionLabel: z.string().min(1),
  actionType: z.enum(['start', 'submit', 'review', 'approve', 'reject', 'revise']),
  allowedRoles: z.array(z.string()).min(1),
  sortOrder: z.number().int().optional().default(0),
  generatesSignoff: z.boolean().optional().default(false),
  signoffType: z.enum(['prepare', 'review', 'approve']).nullable().optional().default(null),
});

export const updateTransitionSchema = z.object({
  fromStatus: z.string().min(1).optional(),
  toStatus: z.string().min(1).optional(),
  actionLabel: z.string().min(1).optional(),
  actionType: z.enum(['start', 'submit', 'review', 'approve', 'reject', 'revise']).optional(),
  allowedRoles: z.array(z.string()).min(1).optional(),
  sortOrder: z.number().int().optional(),
  generatesSignoff: z.boolean().optional(),
  signoffType: z.enum(['prepare', 'review', 'approve']).nullable().optional(),
});

// =============================================================================
// WORKFLOW CRUD
// =============================================================================

export async function getWorkflows() {
  const workflows = await prisma.approvalWorkflow.findMany({
    orderBy: { created_at: 'asc' },
    include: {
      transitions: {
        orderBy: { sort_order: 'asc' },
      },
      entity_bindings: true,
    },
  });

  return workflows.map(mapWorkflow);
}

export async function getWorkflow(id: string) {
  const workflow = await prisma.approvalWorkflow.findUnique({
    where: { id },
    include: {
      transitions: {
        orderBy: { sort_order: 'asc' },
      },
      entity_bindings: true,
    },
  });

  if (!workflow) throw new Error('Workflow not found');
  return mapWorkflow(workflow);
}

export async function createWorkflow(input: unknown) {
  const parsed = createWorkflowSchema.parse(input);

  // If setting as default, unset previous default
  if (parsed.isDefault) {
    await prisma.approvalWorkflow.updateMany({
      where: { is_default: true },
      data: { is_default: false },
    });
  }

  const workflow = await prisma.approvalWorkflow.create({
    data: {
      entity_type: parsed.entityType || null,
      name: parsed.name,
      allow_self_approval: parsed.allowSelfApproval,
      is_active: parsed.isActive,
      is_default: parsed.isDefault,
    },
    include: {
      transitions: {
        orderBy: { sort_order: 'asc' },
      },
      entity_bindings: true,
    },
  });

  return mapWorkflow(workflow);
}

export async function updateWorkflow(id: string, input: unknown) {
  const parsed = updateWorkflowSchema.parse(input);

  const existing = await prisma.approvalWorkflow.findUnique({ where: { id } });
  if (!existing) throw new Error('Workflow not found');

  const data: Record<string, unknown> = {};
  if (parsed.name !== undefined) data.name = parsed.name;
  if (parsed.allowSelfApproval !== undefined) data.allow_self_approval = parsed.allowSelfApproval;
  if (parsed.isActive !== undefined) data.is_active = parsed.isActive;
  if (parsed.isDefault !== undefined) {
    data.is_default = parsed.isDefault;
    // If setting as default, unset previous default
    if (parsed.isDefault) {
      await prisma.approvalWorkflow.updateMany({
        where: { is_default: true, id: { not: id } },
        data: { is_default: false },
      });
    }
  }

  const workflow = await prisma.approvalWorkflow.update({
    where: { id },
    data,
    include: {
      transitions: {
        orderBy: { sort_order: 'asc' },
      },
      entity_bindings: true,
    },
  });

  return mapWorkflow(workflow);
}

export async function deleteWorkflow(id: string) {
  const existing = await prisma.approvalWorkflow.findUnique({ where: { id } });
  if (!existing) throw new Error('Workflow not found');

  await prisma.approvalWorkflow.delete({ where: { id } });
  return { success: true };
}

// =============================================================================
// TRANSITION CRUD
// =============================================================================

export async function addTransition(workflowId: string, input: unknown) {
  const parsed = createTransitionSchema.parse(input);

  const workflow = await prisma.approvalWorkflow.findUnique({ where: { id: workflowId } });
  if (!workflow) throw new Error('Workflow not found');

  const transition = await prisma.approvalTransition.create({
    data: {
      workflow_id: workflowId,
      from_status: parsed.fromStatus,
      to_status: parsed.toStatus,
      action_label: parsed.actionLabel,
      action_type: parsed.actionType,
      allowed_roles: parsed.allowedRoles,
      sort_order: parsed.sortOrder,
      generates_signoff: parsed.generatesSignoff,
      signoff_type: parsed.signoffType ?? null,
    },
  });

  return mapTransition(transition);
}

export async function updateTransition(id: string, input: unknown) {
  const parsed = updateTransitionSchema.parse(input);

  const existing = await prisma.approvalTransition.findUnique({ where: { id } });
  if (!existing) throw new Error('Transition not found');

  const data: Record<string, unknown> = {};
  if (parsed.fromStatus !== undefined) data.from_status = parsed.fromStatus;
  if (parsed.toStatus !== undefined) data.to_status = parsed.toStatus;
  if (parsed.actionLabel !== undefined) data.action_label = parsed.actionLabel;
  if (parsed.actionType !== undefined) data.action_type = parsed.actionType;
  if (parsed.allowedRoles !== undefined) data.allowed_roles = parsed.allowedRoles;
  if (parsed.sortOrder !== undefined) data.sort_order = parsed.sortOrder;
  if (parsed.generatesSignoff !== undefined) data.generates_signoff = parsed.generatesSignoff;
  if (parsed.signoffType !== undefined) data.signoff_type = parsed.signoffType;

  const transition = await prisma.approvalTransition.update({
    where: { id },
    data,
  });

  return mapTransition(transition);
}

export async function reorderTransitions(workflowId: string, orderedIds: string[]) {
  // Batch update sort_order for all transitions in a single transaction
  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.approvalTransition.update({
        where: { id },
        data: { sort_order: idx },
      }),
    ),
  );

  // Return the updated workflow
  const workflow = await prisma.approvalWorkflow.findUnique({
    where: { id: workflowId },
    include: {
      transitions: { orderBy: { sort_order: 'asc' } },
      entity_bindings: true,
    },
  });
  if (!workflow) throw new Error('Workflow not found');
  return mapWorkflow(workflow);
}

export async function deleteTransition(id: string) {
  const existing = await prisma.approvalTransition.findUnique({ where: { id } });
  if (!existing) throw new Error('Transition not found');

  await prisma.approvalTransition.delete({ where: { id } });
  return { success: true };
}

/**
 * Count entities currently at a given approval status.
 * Used by the UI to warn before deleting a transition whose from_status has live entities.
 */
export async function countEntitiesAtStatus(statusKey: string) {
  const [procedureCount, wpCount, planningWpCount] = await Promise.all([
    prisma.engagementProcedure.count({ where: { approval_status: statusKey } }),
    prisma.engagement.count({ where: { wp_approval_status: statusKey } }),
    prisma.planningWorkpaper.count({ where: { approval_status: statusKey } }),
  ]);
  return { total: procedureCount + wpCount + planningWpCount, procedureCount, wpCount, planningWpCount };
}

// =============================================================================
// ENTITY BINDING CRUD
// =============================================================================

export async function getEntityBindings() {
  const bindings = await prisma.approvalEntityBinding.findMany({
    include: { workflow: { select: { id: true, name: true } } },
  });
  return bindings.map((b) => ({
    id: b.id,
    entityType: b.entity_type,
    subType: b.sub_type,
    workflowId: b.workflow_id,
    workflowName: b.workflow.name,
    label: b.label,
  }));
}

export async function upsertEntityBinding(input: unknown) {
  const parsed = upsertEntityBindingSchema.parse(input);

  const binding = await prisma.approvalEntityBinding.upsert({
    where: {
      entity_type_sub_type: {
        entity_type: parsed.entityType,
        sub_type: parsed.subType,
      },
    },
    update: {
      workflow_id: parsed.workflowId,
      label: parsed.label ?? null,
    },
    create: {
      entity_type: parsed.entityType,
      sub_type: parsed.subType,
      workflow_id: parsed.workflowId,
      label: parsed.label ?? null,
    },
  });

  return {
    id: binding.id,
    entityType: binding.entity_type,
    subType: binding.sub_type,
    workflowId: binding.workflow_id,
    label: binding.label,
  };
}

export async function deleteEntityBinding(entityType: string, subType: string = '') {
  await prisma.approvalEntityBinding.delete({
    where: {
      entity_type_sub_type: {
        entity_type: entityType,
        sub_type: subType,
      },
    },
  });
  return { success: true };
}

// =============================================================================
// MAPPERS
// =============================================================================

type WorkflowWithRelations = Awaited<ReturnType<typeof prisma.approvalWorkflow.findUnique>> & {
  transitions: Awaited<ReturnType<typeof prisma.approvalTransition.findMany>>;
  entity_bindings?: Awaited<ReturnType<typeof prisma.approvalEntityBinding.findMany>>;
};

function mapWorkflow(w: NonNullable<WorkflowWithRelations>) {
  return {
    id: w.id,
    entityType: w.entity_type,
    name: w.name,
    allowSelfApproval: w.allow_self_approval,
    isActive: w.is_active,
    isDefault: w.is_default,
    createdAt: w.created_at.toISOString(),
    updatedAt: w.updated_at.toISOString(),
    transitions: w.transitions.map(mapTransition),
    entityBindings: (w.entity_bindings ?? []).map((b) => ({
      id: b.id,
      entityType: b.entity_type,
      subType: b.sub_type,
      workflowId: b.workflow_id,
      label: b.label,
    })),
  };
}

type TransitionRow = Awaited<ReturnType<typeof prisma.approvalTransition.findMany>>[number];

function mapTransition(t: TransitionRow) {
  return {
    id: t.id,
    workflowId: t.workflow_id,
    fromStatus: t.from_status,
    toStatus: t.to_status,
    actionLabel: t.action_label,
    actionType: t.action_type,
    allowedRoles: t.allowed_roles as string[],
    sortOrder: t.sort_order,
    generatesSignoff: t.generates_signoff,
    signoffType: t.signoff_type,
  };
}
