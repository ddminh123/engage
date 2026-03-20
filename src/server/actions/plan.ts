import { prisma } from '@/lib/prisma';
import { logAudit } from './teams';
import { z } from 'zod';

// =============================================================================
// CONSTANTS
// =============================================================================

const PERIOD_TYPES = ['annual', 'quarterly', 'monthly', 'custom'] as const;
const PLAN_STATUSES = ['draft', 'approved', 'in_progress', 'closed'] as const;
const AUDIT_STATUSES = ['planned', 'in_progress', 'completed', 'deferred', 'cancelled'] as const;
const PRIORITIES = ['high', 'medium', 'low'] as const;

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const createPlanSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().nullable().optional(),
  periodType: z.enum(PERIOD_TYPES),
  periodStart: z.string().min(1, 'Period start is required'),
  periodEnd: z.string().min(1, 'Period end is required'),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = createPlanSchema.partial().extend({
  status: z.enum(PLAN_STATUSES).optional(),
});

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

export const createPlannedAuditSchema = z.object({
  entityId: z.string().min(1, 'Entity is required'),
  title: z.string().nullable().optional(),
  objective: z.string().nullable().optional(),
  scope: z.string().nullable().optional(),
  scheduledStart: z.string().min(1, 'Scheduled start is required'),
  scheduledEnd: z.string().min(1, 'Scheduled end is required'),
  priority: z.enum(PRIORITIES).nullable().optional(),
  estimatedDays: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  ownerUnitIds: z.array(z.string()).optional(),
  participatingUnitIds: z.array(z.string()).optional(),
  contactPointIds: z.array(z.string()).optional(),
  auditeeRepIds: z.array(z.string()).optional(),
});

export type CreatePlannedAuditInput = z.infer<typeof createPlannedAuditSchema>;

export const updatePlannedAuditSchema = createPlannedAuditSchema.partial().extend({
  status: z.enum(AUDIT_STATUSES).optional(),
});

export type UpdatePlannedAuditInput = z.infer<typeof updatePlannedAuditSchema>;

// =============================================================================
// INCLUDE HELPERS
// =============================================================================

const plannedAuditInclude = {
  entity: {
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      risk_level: true,
      inherent_risk_level: true,
      entity_type: { select: { id: true, name: true } },
      owner_units: {
        include: { unit: { select: { id: true, name: true } } },
      },
    },
  },
  owner_units: {
    include: { unit: { select: { id: true, name: true } } },
  },
  participating_units: {
    include: { unit: { select: { id: true, name: true } } },
  },
  contact_points: {
    include: { contact: { select: { id: true, name: true, position: true } } },
  },
  auditee_reps: {
    include: { contact: { select: { id: true, name: true, position: true } } },
  },
} as const;

const planInclude = {
  planned_audits: {
    include: plannedAuditInclude,
    orderBy: { scheduled_start: 'asc' as const },
  },
} as const;

// =============================================================================
// MAPPERS
// =============================================================================

function mapPlannedAudit(a: any) {
  return {
    id: a.id as string,
    planId: a.plan_id as string,
    entityId: a.entity_id as string,
    title: a.title as string | null,
    objective: a.objective as string | null,
    scope: a.scope as string | null,
    scheduledStart: (a.scheduled_start as Date).toISOString(),
    scheduledEnd: (a.scheduled_end as Date).toISOString(),
    status: a.status as string,
    priority: a.priority as string | null,
    estimatedDays: a.estimated_days as number | null,
    notes: a.notes as string | null,
    ownerUnits: (a.owner_units ?? []).map(
      (o: { unit: { id: string; name: string } }) => ({ id: o.unit.id, name: o.unit.name }),
    ),
    participatingUnits: (a.participating_units ?? []).map(
      (p: { unit: { id: string; name: string } }) => ({ id: p.unit.id, name: p.unit.name }),
    ),
    contactPoints: (a.contact_points ?? []).map(
      (cp: { contact: { id: string; name: string; position: string | null } }) => ({
        id: cp.contact.id, name: cp.contact.name, position: cp.contact.position,
      }),
    ),
    auditeeReps: (a.auditee_reps ?? []).map(
      (r: { contact: { id: string; name: string; position: string | null } }) => ({
        id: r.contact.id, name: r.contact.name, position: r.contact.position,
      }),
    ),
    createdAt: (a.created_at as Date).toISOString(),
    updatedAt: (a.updated_at as Date).toISOString(),
    entity: a.entity
      ? {
          id: a.entity.id as string,
          name: a.entity.name as string,
          code: a.entity.code as string | null,
          status: a.entity.status as string,
          riskLevel: a.entity.risk_level as string | null,
          inherentRiskLevel: a.entity.inherent_risk_level as string | null,
          entityType: a.entity.entity_type
            ? { id: a.entity.entity_type.id, name: a.entity.entity_type.name }
            : null,
          ownerUnits: (a.entity.owner_units ?? []).map(
            (o: { unit: { id: string; name: string } }) => ({
              id: o.unit.id,
              name: o.unit.name,
            }),
          ),
        }
      : null,
  };
}

function mapPlan(p: any) {
  const audits = (p.planned_audits ?? []).map(mapPlannedAudit);
  return {
    id: p.id as string,
    title: p.title as string,
    description: p.description as string | null,
    periodType: p.period_type as string,
    periodStart: (p.period_start as Date).toISOString(),
    periodEnd: (p.period_end as Date).toISOString(),
    status: p.status as string,
    createdBy: p.created_by as string | null,
    approvedBy: p.approved_by as string | null,
    approvedAt: p.approved_at ? (p.approved_at as Date).toISOString() : null,
    createdAt: (p.created_at as Date).toISOString(),
    updatedAt: (p.updated_at as Date).toISOString(),
    plannedAudits: audits,
    auditCount: audits.length,
    completedCount: audits.filter((a: any) => a.status === 'completed').length,
  };
}

function mapPlanSummary(p: any) {
  return {
    id: p.id as string,
    title: p.title as string,
    description: p.description as string | null,
    periodType: p.period_type as string,
    periodStart: (p.period_start as Date).toISOString(),
    periodEnd: (p.period_end as Date).toISOString(),
    status: p.status as string,
    createdBy: p.created_by as string | null,
    approvedBy: p.approved_by as string | null,
    approvedAt: p.approved_at ? (p.approved_at as Date).toISOString() : null,
    createdAt: (p.created_at as Date).toISOString(),
    updatedAt: (p.updated_at as Date).toISOString(),
    auditCount: p._count?.planned_audits ?? 0,
    completedCount: 0, // filled below
  };
}

// =============================================================================
// PLAN CRUD
// =============================================================================

export async function getPlans() {
  const plans = await prisma.auditPlan.findMany({
    include: {
      _count: { select: { planned_audits: true } },
      planned_audits: { select: { status: true } },
    },
    orderBy: { period_start: 'desc' },
  });

  return plans.map((p) => {
    const summary = mapPlanSummary(p);
    summary.completedCount = (p.planned_audits ?? []).filter(
      (a) => a.status === 'completed',
    ).length;
    return summary;
  });
}

export async function getPlanById(id: string) {
  const plan = await prisma.auditPlan.findUnique({
    where: { id },
    include: planInclude,
  });
  if (!plan) throw new Error('Plan not found');
  return mapPlan(plan);
}

export async function createPlan(
  input: unknown,
  userId: string,
  userName: string,
) {
  const parsed = createPlanSchema.parse(input);

  const periodStart = new Date(parsed.periodStart);
  const periodEnd = new Date(parsed.periodEnd);
  if (periodEnd <= periodStart) {
    throw new Error('Period end must be after period start');
  }

  const plan = await prisma.auditPlan.create({
    data: {
      title: parsed.title,
      description: parsed.description ?? null,
      period_type: parsed.periodType,
      period_start: periodStart,
      period_end: periodEnd,
      status: 'draft',
      created_by: userId,
      updated_by: userId,
    },
    include: planInclude,
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'audit_plan',
    entityId: plan.id,
  });

  return mapPlan(plan);
}

export async function updatePlan(
  id: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.auditPlan.findUnique({ where: { id } });
  if (!existing) throw new Error('Plan not found');

  const parsed = updatePlanSchema.parse(input);

  // Build changes tracking
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  const data: Record<string, unknown> = { updated_by: userId };

  if (parsed.title !== undefined && parsed.title !== existing.title) {
    changes.title = { old: existing.title, new: parsed.title };
    data.title = parsed.title;
  }
  if (parsed.description !== undefined) {
    data.description = parsed.description ?? null;
  }
  if (parsed.periodType !== undefined && parsed.periodType !== existing.period_type) {
    changes.period_type = { old: existing.period_type, new: parsed.periodType };
    data.period_type = parsed.periodType;
  }
  if (parsed.periodStart !== undefined) {
    const newStart = new Date(parsed.periodStart);
    data.period_start = newStart;
  }
  if (parsed.periodEnd !== undefined) {
    const newEnd = new Date(parsed.periodEnd);
    data.period_end = newEnd;
  }
  if (parsed.status !== undefined && parsed.status !== existing.status) {
    changes.status = { old: existing.status, new: parsed.status };
    data.status = parsed.status;

    // Set approved fields when transitioning to approved
    if (parsed.status === 'approved') {
      data.approved_by = userId;
      data.approved_at = new Date();
    }
  }

  const plan = await prisma.auditPlan.update({
    where: { id },
    data,
    include: planInclude,
  });

  if (Object.keys(changes).length > 0) {
    await logAudit({
      userId,
      userName,
      action: 'update',
      entityType: 'audit_plan',
      entityId: id,
      changes,
    });
  }

  return mapPlan(plan);
}

export async function deletePlan(
  id: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.auditPlan.findUnique({ where: { id } });
  if (!existing) throw new Error('Plan not found');

  await prisma.auditPlan.delete({ where: { id } });

  await logAudit({
    userId,
    userName,
    action: 'delete',
    entityType: 'audit_plan',
    entityId: id,
  });

  return { id };
}

// =============================================================================
// PLANNED AUDIT CRUD
// =============================================================================

export async function addPlannedAudit(
  planId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const plan = await prisma.auditPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error('Plan not found');

  const parsed = createPlannedAuditSchema.parse(input);

  const scheduledStart = new Date(parsed.scheduledStart);
  const scheduledEnd = new Date(parsed.scheduledEnd);
  if (scheduledEnd <= scheduledStart) {
    throw new Error('Scheduled end must be after scheduled start');
  }

  const audit = await prisma.plannedAudit.create({
    data: {
      plan_id: planId,
      entity_id: parsed.entityId,
      title: parsed.title ?? null,
      objective: parsed.objective ?? null,
      scope: parsed.scope ?? null,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      status: 'planned',
      priority: parsed.priority ?? null,
      estimated_days: parsed.estimatedDays ?? null,
      notes: parsed.notes ?? null,
      ...(parsed.ownerUnitIds && parsed.ownerUnitIds.length > 0 && {
        owner_units: { create: parsed.ownerUnitIds.map((uid) => ({ unit_id: uid })) },
      }),
      ...(parsed.participatingUnitIds && parsed.participatingUnitIds.length > 0 && {
        participating_units: { create: parsed.participatingUnitIds.map((uid) => ({ unit_id: uid })) },
      }),
      ...(parsed.contactPointIds && parsed.contactPointIds.length > 0 && {
        contact_points: { create: parsed.contactPointIds.map((cid) => ({ contact_id: cid })) },
      }),
      ...(parsed.auditeeRepIds && parsed.auditeeRepIds.length > 0 && {
        auditee_reps: { create: parsed.auditeeRepIds.map((cid) => ({ contact_id: cid })) },
      }),
    },
    include: plannedAuditInclude,
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'planned_audit',
    entityId: audit.id,
  });

  return mapPlannedAudit(audit);
}

export async function updatePlannedAudit(
  planId: string,
  auditId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.plannedAudit.findFirst({
    where: { id: auditId, plan_id: planId },
  });
  if (!existing) throw new Error('Planned audit not found');

  const parsed = updatePlannedAuditSchema.parse(input);

  const changes: Record<string, { old: unknown; new: unknown }> = {};
  const data: Record<string, unknown> = {};

  if (parsed.entityId !== undefined && parsed.entityId !== existing.entity_id) {
    changes.entity_id = { old: existing.entity_id, new: parsed.entityId };
    data.entity_id = parsed.entityId;
  }
  if (parsed.title !== undefined) data.title = parsed.title ?? null;
  if (parsed.objective !== undefined) data.objective = parsed.objective ?? null;
  if (parsed.scope !== undefined) data.scope = parsed.scope ?? null;
  if (parsed.scheduledStart !== undefined) {
    data.scheduled_start = new Date(parsed.scheduledStart);
  }
  if (parsed.scheduledEnd !== undefined) {
    data.scheduled_end = new Date(parsed.scheduledEnd);
  }
  if (parsed.status !== undefined && parsed.status !== existing.status) {
    changes.status = { old: existing.status, new: parsed.status };
    data.status = parsed.status;
  }
  if (parsed.priority !== undefined) data.priority = parsed.priority ?? null;
  if (parsed.estimatedDays !== undefined) data.estimated_days = parsed.estimatedDays ?? null;
  if (parsed.notes !== undefined) data.notes = parsed.notes ?? null;

  const audit = await prisma.$transaction(async (tx) => {
    // Update owner units
    if (parsed.ownerUnitIds !== undefined) {
      await tx.plannedAuditOwner.deleteMany({ where: { planned_audit_id: auditId } });
      if (parsed.ownerUnitIds.length > 0) {
        await tx.plannedAuditOwner.createMany({
          data: parsed.ownerUnitIds.map((uid) => ({ planned_audit_id: auditId, unit_id: uid })),
        });
      }
    }
    // Update participating units
    if (parsed.participatingUnitIds !== undefined) {
      await tx.plannedAuditParticipant.deleteMany({ where: { planned_audit_id: auditId } });
      if (parsed.participatingUnitIds.length > 0) {
        await tx.plannedAuditParticipant.createMany({
          data: parsed.participatingUnitIds.map((uid) => ({ planned_audit_id: auditId, unit_id: uid })),
        });
      }
    }
    // Update contact points
    if (parsed.contactPointIds !== undefined) {
      await tx.plannedAuditContactPoint.deleteMany({ where: { planned_audit_id: auditId } });
      if (parsed.contactPointIds.length > 0) {
        await tx.plannedAuditContactPoint.createMany({
          data: parsed.contactPointIds.map((cid) => ({ planned_audit_id: auditId, contact_id: cid })),
        });
      }
    }
    // Update auditee reps
    if (parsed.auditeeRepIds !== undefined) {
      await tx.plannedAuditAuditeeRep.deleteMany({ where: { planned_audit_id: auditId } });
      if (parsed.auditeeRepIds.length > 0) {
        await tx.plannedAuditAuditeeRep.createMany({
          data: parsed.auditeeRepIds.map((cid) => ({ planned_audit_id: auditId, contact_id: cid })),
        });
      }
    }

    return tx.plannedAudit.update({
      where: { id: auditId },
      data,
      include: plannedAuditInclude,
    });
  });

  if (Object.keys(changes).length > 0) {
    await logAudit({
      userId,
      userName,
      action: 'update',
      entityType: 'planned_audit',
      entityId: auditId,
      changes,
    });
  }

  return mapPlannedAudit(audit);
}

export async function removePlannedAudit(
  planId: string,
  auditId: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.plannedAudit.findFirst({
    where: { id: auditId, plan_id: planId },
  });
  if (!existing) throw new Error('Planned audit not found');

  await prisma.plannedAudit.delete({ where: { id: auditId } });

  await logAudit({
    userId,
    userName,
    action: 'delete',
    entityType: 'planned_audit',
    entityId: auditId,
  });

  return { id: auditId };
}
