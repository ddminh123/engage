import { prisma } from '@/lib/prisma';
import { logAudit } from './teams';
import { z } from 'zod';
import {
  AUDIT_CYCLES,
  ENTITY_STATUSES,
} from '@/features/universe/constants';

export { AUDIT_CYCLES, ENTITY_STATUSES };

// Risk level derived from score
function getRiskLevel(score: number | null): string | null {
  if (score === null) return null;
  if (score <= 4) return 'Low';
  if (score <= 9) return 'Medium';
  if (score <= 15) return 'High';
  return 'Critical';
}

// Mid-point score for each level — used when no numeric score is available
function levelToScore(level: string): number {
  if (level === 'Low') return 2;
  if (level === 'Medium') return 7;
  if (level === 'High') return 12;
  return 20; // Critical
}

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const createEntitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().max(50).nullable().optional(),
  description: z.string().nullable().optional(),
  entityTypeId: z.string().min(1, 'Type is required'),
  areaIds: z.array(z.string()).min(1, 'At least one area is required'),
  ownerUnitIds: z.array(z.string()).min(1, 'At least one owner unit is required'),
  participatingUnitIds: z.array(z.string()).optional(),
  status: z.enum(ENTITY_STATUSES).default('active'),
  auditCycle: z.string().nullable().optional(),
  lastAuditedAt: z.string().nullable().optional(),
  auditSponsorIds: z.array(z.string()).optional(),
  auditeeRepIds: z.array(z.string()).optional(),
  contactPointIds: z.array(z.string()).optional(),
});

export type CreateEntityInput = z.infer<typeof createEntitySchema>;

export const updateEntitySchema = createEntitySchema.partial();
export type UpdateEntityInput = z.infer<typeof updateEntitySchema>;

const CONTROL_EFFECTIVENESS = ['Strong', 'Medium', 'Weak'] as const;

export { CONTROL_EFFECTIVENESS };

const INHERENT_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
export { INHERENT_LEVELS };

const riskFactorsSchema = z.object({
  impact: z.array(z.string()).optional().default([]),
  likelihood: z.array(z.string()).optional().default([]),
  control: z.array(z.string()).optional().default([]),
}).optional();

export const createRiskAssessmentSchema = z.object({
  entityId: z.string().min(1),
  // Section 1: Inherent Risk
  inherentScore: z.number().int().min(1).max(25),
  inherentImpact: z.number().int().min(1).max(5).nullable().optional(),
  inherentLikelihood: z.number().int().min(1).max(5).nullable().optional(),
  impactRationale: z.string().nullable().optional(),
  likelihoodRationale: z.string().nullable().optional(),
  // Section 2: Control Environment
  controlEffectiveness: z.enum(CONTROL_EFFECTIVENESS).nullable().optional(),
  controlRationale: z.string().nullable().optional(),
  // Section 3: Assessment Info
  riskFactors: riskFactorsSchema,
  assessmentSourceId: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  managementRequest: z.boolean().optional().default(false),
  // Section 4: Residual Risk
  residualScore: z.number().int().min(1).max(25).nullable().optional(),
  residualLevel: z.enum(INHERENT_LEVELS).nullable().optional(),
  conclusion: z.string().nullable().optional(),
  // Section 5: Metadata
  evaluatedBy: z.string().nullable().optional(),
  approvedBy: z.string().nullable().optional(),
  evaluationDate: z.string().datetime().nullable().optional(),
});

export type CreateRiskAssessmentInput = z.infer<typeof createRiskAssessmentSchema>;

// =============================================================================
// HELPERS
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEntity(e: any) {
  return {
    id: e.id as string,
    name: e.name as string,
    code: e.code as string | null,
    description: e.description as string | null,
    entityTypeId: e.entity_type_id as string | null,
    entityType: e.entity_type ? { id: e.entity_type.id, name: e.entity_type.name } : null,
    areas: (e.areas ?? []).map((a: { area: { id: string; name: string } }) => ({
      id: a.area.id,
      name: a.area.name,
    })),
    ownerUnits: (e.owner_units ?? []).map((o: { unit: { id: string; name: string } }) => ({
      id: o.unit.id,
      name: o.unit.name,
    })),
    participatingUnits: (e.participating_units ?? []).map((p: { unit: { id: string; name: string } }) => ({
      id: p.unit.id,
      name: p.unit.name,
    })),
    status: e.status as 'active' | 'inactive' | 'archived',
    auditCycle: e.audit_cycle as string | null,
    riskScore: e.risk_score as number | null,
    riskLevel: e.risk_level as string | null,
    inherentRiskScore: e.inherent_risk_score as number | null,
    inherentRiskLevel: e.inherent_risk_level as string | null,
    auditSponsors: (e.audit_sponsors ?? []).map((s: { contact: { id: string; name: string; position: string | null } }) => ({
      id: s.contact.id,
      name: s.contact.name,
      position: s.contact.position,
    })),
    auditeeReps: (e.auditee_reps ?? []).map((r: { contact: { id: string; name: string; position: string | null } }) => ({
      id: r.contact.id,
      name: r.contact.name,
      position: r.contact.position,
    })),
    contactPoints: (e.contact_points ?? []).map((cp: { contact: { id: string; name: string; position: string | null } }) => ({
      id: cp.contact.id,
      name: cp.contact.name,
      position: cp.contact.position,
    })),
    lastAuditedAt: e.last_audited_at ? (e.last_audited_at as Date).toISOString() : null,
    createdAt: (e.created_at as Date).toISOString(),
    updatedAt: (e.updated_at as Date).toISOString(),
    // Latest risk assessment fields — source of truth for list/detail display
    latestAssessmentId: ((e.risk_assessments as unknown[] | undefined)?.[0] as { id?: string } | undefined)?.id ?? null,
    latestInherentLevel: ((e.risk_assessments as unknown[] | undefined)?.[0] as { inherent_level?: string | null } | undefined)?.inherent_level ?? null,
    latestInherentScore: ((e.risk_assessments as unknown[] | undefined)?.[0] as { inherent_score?: number | null } | undefined)?.inherent_score ?? null,
    latestControlEffectiveness: ((e.risk_assessments as unknown[] | undefined)?.[0] as { control_effectiveness?: string | null } | undefined)?.control_effectiveness ?? null,
    latestResidualLevel: ((e.risk_assessments as unknown[] | undefined)?.[0] as { residual_level?: string | null } | undefined)?.residual_level ?? null,
    latestInherentImpact: ((e.risk_assessments as unknown[] | undefined)?.[0] as { inherent_impact?: number | null } | undefined)?.inherent_impact ?? null,
    latestInherentLikelihood: ((e.risk_assessments as unknown[] | undefined)?.[0] as { inherent_likelihood?: number | null } | undefined)?.inherent_likelihood ?? null,
    latestResidualScore: ((e.risk_assessments as unknown[] | undefined)?.[0] as { residual_score?: number | null } | undefined)?.residual_score ?? null,
  };
}

const entityInclude = {
  entity_type: {
    select: { id: true, name: true },
  },
  areas: {
    include: { area: { select: { id: true, name: true } } },
  },
  owner_units: {
    include: { unit: { select: { id: true, name: true } } },
  },
  participating_units: {
    include: { unit: { select: { id: true, name: true } } },
  },
  audit_sponsors: {
    include: { contact: { select: { id: true, name: true, position: true } } },
  },
  auditee_reps: {
    include: { contact: { select: { id: true, name: true, position: true } } },
  },
  contact_points: {
    include: { contact: { select: { id: true, name: true, position: true } } },
  },
  // Latest risk assessment — used for list/detail display (source of truth)
  risk_assessments: {
    orderBy: { evaluation_date: 'desc' as const },
    take: 1,
    select: {
      id: true,
      inherent_level: true,
      inherent_score: true,
      inherent_impact: true,
      inherent_likelihood: true,
      control_effectiveness: true,
      residual_level: true,
      residual_score: true,
      evaluation_date: true,
    },
  },
} as const;

// =============================================================================
// ENTITY ACTIONS
// =============================================================================

export async function listEntities(query?: string) {
  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { name: { contains: query } },
      { code: { contains: query } },
      { description: { contains: query } },
    ];
  }

  const entities = await prisma.auditableEntity.findMany({
    where,
    include: entityInclude,
    orderBy: { name: 'asc' },
  });

  return entities.map(mapEntity);
}

export async function getEntityById(id: string) {
  const e = await prisma.auditableEntity.findUnique({
    where: { id },
    include: entityInclude,
  });

  if (!e) throw new Error('Entity not found');

  return mapEntity(e);
}

export async function createEntity(
  data: CreateEntityInput,
  userId: string,
  userName: string,
) {
  const parsed = createEntitySchema.parse(data);

  const entity = await prisma.auditableEntity.create({
    data: {
      name: parsed.name,
      code: parsed.code ?? null,
      description: parsed.description ?? null,
      entity_type_id: parsed.entityTypeId,
      status: parsed.status,
      audit_cycle: parsed.auditCycle ?? null,
      last_audited_at: parsed.lastAuditedAt ? new Date(parsed.lastAuditedAt) : null,
      updated_by: userId,
      areas: {
        create: parsed.areaIds.map((areaId) => ({ area_id: areaId })),
      },
      ...(parsed.auditSponsorIds && parsed.auditSponsorIds.length > 0 && {
        audit_sponsors: {
          create: parsed.auditSponsorIds.map((contactId) => ({ contact_id: contactId })),
        },
      }),
      ...(parsed.auditeeRepIds && parsed.auditeeRepIds.length > 0 && {
        auditee_reps: {
          create: parsed.auditeeRepIds.map((contactId) => ({ contact_id: contactId })),
        },
      }),
      ...(parsed.contactPointIds && parsed.contactPointIds.length > 0 && {
        contact_points: {
          create: parsed.contactPointIds.map((contactId) => ({ contact_id: contactId })),
        },
      }),
      owner_units: {
        create: parsed.ownerUnitIds.map((unitId) => ({ unit_id: unitId })),
      },
      ...(parsed.participatingUnitIds &&
        parsed.participatingUnitIds.length > 0 && {
          participating_units: {
            create: parsed.participatingUnitIds.map((unitId) => ({
              unit_id: unitId,
            })),
          },
        }),
    },
    include: entityInclude,
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'auditable_entity',
    entityId: entity.id,
  });

  return mapEntity(entity);
}

export async function updateEntity(
  id: string,
  data: UpdateEntityInput,
  userId: string,
  userName: string,
) {
  const parsed = updateEntitySchema.parse(data);

  const existing = await prisma.auditableEntity.findUnique({ where: { id } });
  if (!existing) throw new Error('Entity not found');

  // Build changes log
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  const fieldMap: Record<string, string> = {
    name: 'name',
    code: 'code',
    description: 'description',
    entityTypeId: 'entity_type_id',
    status: 'status',
    auditCycle: 'audit_cycle',
    lastAuditedAt: 'last_audited_at',
  };

  for (const [inputKey, dbKey] of Object.entries(fieldMap)) {
    const newVal = parsed[inputKey as keyof typeof parsed];
    if (newVal !== undefined) {
      const oldVal = existing[dbKey as keyof typeof existing];
      if ((newVal ?? null) !== (oldVal ?? null)) {
        changes[inputKey] = { old: oldVal, new: newVal };
      }
    }
  }

  const entity = await prisma.$transaction(async (tx) => {
    // Update owner units if provided
    if (parsed.ownerUnitIds !== undefined) {
      await tx.auditableEntityOwner.deleteMany({ where: { entity_id: id } });
      if (parsed.ownerUnitIds.length > 0) {
        await tx.auditableEntityOwner.createMany({
          data: parsed.ownerUnitIds.map((unitId) => ({
            entity_id: id,
            unit_id: unitId,
          })),
        });
      }
    }

    // Update participating units if provided
    if (parsed.participatingUnitIds !== undefined) {
      await tx.auditableEntityParticipant.deleteMany({ where: { entity_id: id } });
      if (parsed.participatingUnitIds.length > 0) {
        await tx.auditableEntityParticipant.createMany({
          data: parsed.participatingUnitIds.map((unitId) => ({
            entity_id: id,
            unit_id: unitId,
          })),
        });
      }
    }

    // Update audit sponsors if provided
    if (parsed.auditSponsorIds !== undefined) {
      await tx.auditableEntityAuditSponsor.deleteMany({ where: { entity_id: id } });
      if (parsed.auditSponsorIds.length > 0) {
        await tx.auditableEntityAuditSponsor.createMany({
          data: parsed.auditSponsorIds.map((contactId) => ({
            entity_id: id,
            contact_id: contactId,
          })),
        });
      }
    }

    // Update auditee reps if provided
    if (parsed.auditeeRepIds !== undefined) {
      await tx.auditableEntityAuditeeRep.deleteMany({ where: { entity_id: id } });
      if (parsed.auditeeRepIds.length > 0) {
        await tx.auditableEntityAuditeeRep.createMany({
          data: parsed.auditeeRepIds.map((contactId) => ({
            entity_id: id,
            contact_id: contactId,
          })),
        });
      }
    }

    // Update contact points if provided
    if (parsed.contactPointIds !== undefined) {
      await tx.auditableEntityContactPoint.deleteMany({ where: { entity_id: id } });
      if (parsed.contactPointIds.length > 0) {
        await tx.auditableEntityContactPoint.createMany({
          data: parsed.contactPointIds.map((contactId) => ({
            entity_id: id,
            contact_id: contactId,
          })),
        });
      }
    }

    // Update areas if provided
    if (parsed.areaIds !== undefined) {
      await tx.auditableEntityArea.deleteMany({ where: { entity_id: id } });
      if (parsed.areaIds.length > 0) {
        await tx.auditableEntityArea.createMany({
          data: parsed.areaIds.map((areaId) => ({
            entity_id: id,
            area_id: areaId,
          })),
        });
      }
    }

    return tx.auditableEntity.update({
      where: { id },
      data: {
        ...(parsed.name !== undefined && { name: parsed.name }),
        ...(parsed.code !== undefined && { code: parsed.code ?? null }),
        ...(parsed.description !== undefined && { description: parsed.description ?? null }),
        ...(parsed.entityTypeId !== undefined && { entity_type_id: parsed.entityTypeId }),
        ...(parsed.status !== undefined && { status: parsed.status }),
        ...(parsed.auditCycle !== undefined && { audit_cycle: parsed.auditCycle ?? null }),
        ...(parsed.lastAuditedAt !== undefined && { last_audited_at: parsed.lastAuditedAt ? new Date(parsed.lastAuditedAt) : null }),
        updated_by: userId,
      },
      include: entityInclude,
    });
  });

  if (Object.keys(changes).length > 0) {
    await logAudit({
      userId,
      userName,
      action: 'update',
      entityType: 'auditable_entity',
      entityId: id,
      changes,
    });
  }

  return mapEntity(entity);
}

export async function deleteEntity(
  id: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.auditableEntity.findUnique({ where: { id } });
  if (!existing) throw new Error('Entity not found');

  await prisma.auditableEntity.delete({ where: { id } });

  await logAudit({
    userId,
    userName,
    action: 'delete',
    entityType: 'auditable_entity',
    entityId: id,
  });

  return { success: true };
}

// =============================================================================
// RISK ASSESSMENT ACTIONS
// =============================================================================

function calcResidualScore(inherentScore: number, controlEffectiveness: string | null | undefined): number {
  if (controlEffectiveness === 'Strong') return Math.round(inherentScore * 0.4);
  if (controlEffectiveness === 'Medium') return Math.round(inherentScore * 0.7);
  return inherentScore;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRiskAssessment(a: any) {
  const riskFactors = a.risk_factors as { impact?: string[]; likelihood?: string[]; control?: string[] } | null;
  return {
    id: a.id as string,
    entityId: a.entity_id as string,
    inherentScore: a.inherent_score as number,
    inherentLevel: a.inherent_level as string,
    inherentImpact: a.inherent_impact as number | null,
    inherentLikelihood: a.inherent_likelihood as number | null,
    impactRationale: a.impact_rationale as string | null,
    likelihoodRationale: a.likelihood_rationale as string | null,
    controlEffectiveness: a.control_effectiveness as string | null,
    controlRationale: a.control_rationale as string | null,
    residualScore: a.residual_score as number | null,
    residualLevel: a.residual_level as string | null,
    riskFactors: {
      impact: riskFactors?.impact ?? [],
      likelihood: riskFactors?.likelihood ?? [],
      control: riskFactors?.control ?? [],
    },
    assessmentSourceId: a.assessment_source_id as string | null,
    note: a.note as string | null,
    managementRequest: a.management_request as boolean,
    conclusion: a.conclusion as string | null,
    evaluatedBy: a.evaluated_by as string | null,
    approvedBy: a.approved_by as string | null,
    evaluationDate: (a.evaluation_date as Date).toISOString(),
  };
}

export async function listRiskAssessments(entityId: string) {
  const assessments = await prisma.riskAssessment.findMany({
    where: { entity_id: entityId },
    orderBy: { evaluation_date: 'desc' },
  });
  return assessments.map(mapRiskAssessment);
}

export async function createRiskAssessment(
  data: CreateRiskAssessmentInput,
  userId: string,
  userName: string,
) {
  const parsed = createRiskAssessmentSchema.parse(data);

  const entity = await prisma.auditableEntity.findUnique({
    where: { id: parsed.entityId },
  });
  if (!entity) throw new Error('Entity not found');

  const inherentScore = parsed.inherentScore;
  const inherentLevel = getRiskLevel(inherentScore) ?? 'Medium';

  // Residual: use provided override, or auto-calculate
  const residualScore = parsed.residualScore ?? calcResidualScore(inherentScore, parsed.controlEffectiveness);
  const residualLevel = parsed.residualLevel ?? getRiskLevel(residualScore);

  const evaluationDate = parsed.evaluationDate ? new Date(parsed.evaluationDate) : new Date();

  const assessment = await prisma.$transaction(async (tx) => {
    const created = await tx.riskAssessment.create({
      data: {
        entity_id: parsed.entityId,
        inherent_score: inherentScore,
        inherent_level: inherentLevel,
        inherent_impact: parsed.inherentImpact ?? null,
        inherent_likelihood: parsed.inherentLikelihood ?? null,
        impact_rationale: parsed.impactRationale ?? null,
        likelihood_rationale: parsed.likelihoodRationale ?? null,
        control_effectiveness: parsed.controlEffectiveness ?? null,
        control_rationale: parsed.controlRationale ?? null,
        risk_factors: parsed.riskFactors ?? {},
        assessment_source_id: parsed.assessmentSourceId ?? null,
        note: parsed.note ?? null,
        management_request: parsed.managementRequest ?? false,
        residual_score: residualScore,
        residual_level: residualLevel,
        conclusion: parsed.conclusion ?? null,
        evaluated_by: parsed.evaluatedBy ?? null,
        approved_by: parsed.approvedBy ?? null,
        evaluation_date: evaluationDate,
      },
    });

    // Update denormalized fields on entity
    await tx.auditableEntity.update({
      where: { id: parsed.entityId },
      data: {
        risk_score: residualScore,
        risk_level: residualLevel ?? null,
        inherent_risk_score: inherentScore,
        inherent_risk_level: inherentLevel,
        updated_by: userId,
      },
    });

    return created;
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'risk_assessment',
    entityId: assessment.id,
    changes: {
      inherentLevel: { old: null, new: inherentLevel },
      inherentScore: { old: null, new: inherentScore },
      residualScore: { old: null, new: residualScore },
    },
  });

  return mapRiskAssessment(assessment);
}
