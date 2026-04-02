import { prisma } from '@/lib/prisma';
import { logAudit } from './teams';
import { invalidateSignoffs, hasAuditRelevantChanges } from './approvalEngine';
import { z } from 'zod';

// =============================================================================
// CONSTANTS
// =============================================================================

const ENGAGEMENT_STATUSES = ['planning', 'fieldwork', 'review', 'reporting', 'closed'] as const;
const WORK_ITEM_STATUSES = ['not_started', 'in_progress', 'waiting_review', 'reviewed'] as const;
const PRIORITIES = ['high', 'medium', 'low'] as const;
const PROCEDURE_TYPES = [
  'inquiry', 'observation', 'inspection', 're_performance',
  'analytical', 'walkthrough', 'other',
] as const;
const FINDING_STATUSES = ['draft', 'to_review', 'reviewed', 'accepted', 'rejected'] as const;
const PROCEDURE_CATEGORIES = ['toc', 'substantive'] as const;
const RISK_RATINGS = ['low', 'medium', 'high', 'critical'] as const;
const RISK_CATEGORIES = ['operational', 'financial', 'compliance', 'strategic', 'it'] as const;
const LIKELIHOOD_LEVELS = ['rare', 'unlikely', 'possible', 'likely', 'almost_certain'] as const;
const IMPACT_LEVELS = ['insignificant', 'minor', 'moderate', 'major', 'catastrophic'] as const;
const CONTROL_TYPES = ['preventive', 'detective', 'corrective'] as const;
const CONTROL_NATURES = ['manual', 'automated', 'it_dependent'] as const;
const CONTROL_FREQUENCIES = ['continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'event_driven'] as const;

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const createEngagementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  entityId: z.string().min(1, 'Entity is required'),
  plannedAuditId: z.string().nullable().optional(),
  objective: z.string().nullable().optional(),
  scope: z.string().nullable().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  estimatedDays: z.number().int().positive().nullable().optional(),
  priority: z.enum(PRIORITIES).nullable().optional(),
  notes: z.string().nullable().optional(),
  ownerUnitIds: z.array(z.string()).optional(),
  participatingUnitIds: z.array(z.string()).optional(),
  contactPointIds: z.array(z.string()).optional(),
  auditeeRepIds: z.array(z.string()).optional(),
});

export type CreateEngagementInput = z.infer<typeof createEngagementSchema>;

export const updateEngagementSchema = createEngagementSchema
  .omit({ entityId: true, plannedAuditId: true })
  .partial()
  .extend({
    status: z.enum(ENGAGEMENT_STATUSES).optional(),
    understanding: z.string().nullable().optional(),
    ownerUnitIds: z.array(z.string()).optional(),
    participatingUnitIds: z.array(z.string()).optional(),
    contactPointIds: z.array(z.string()).optional(),
    auditeeRepIds: z.array(z.string()).optional(),
  });

export type UpdateEngagementInput = z.infer<typeof updateEngagementSchema>;

const ADDED_FROM = ['planning', 'execution'] as const;
const PHASE = ['planning', 'execution'] as const;

export const createSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().nullable().optional(),
  addedFrom: z.enum(ADDED_FROM).optional(),
  phase: z.enum(PHASE).optional(),
  sortOrder: z.number().int().optional(),
});

export const updateSectionSchema = createSectionSchema.partial().extend({
  status: z.enum(WORK_ITEM_STATUSES).optional(),
  reviewNotes: z.string().nullable().optional(),
});

export const createObjectiveSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().nullable().optional(),
  addedFrom: z.enum(ADDED_FROM).optional(),
  phase: z.enum(PHASE).optional(),
  sortOrder: z.number().int().optional(),
});

export const updateObjectiveSchema = createObjectiveSchema.partial().extend({
  status: z.enum(WORK_ITEM_STATUSES).optional(),
  reviewNotes: z.string().nullable().optional(),
  sectionId: z.string().nullable().optional(),
});

export const createProcedureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().nullable().optional(),
  procedures: z.string().nullable().optional(),
  procedureType: z.enum(PROCEDURE_TYPES).nullable().optional(),
  procedureCategory: z.enum(PROCEDURE_CATEGORIES).nullable().optional(),
  sectionId: z.string().nullable().optional(),
  objectiveId: z.string().nullable().optional(),
  priority: z.enum(PRIORITIES).nullable().optional(),
  addedFrom: z.enum(ADDED_FROM).optional(),
  sortOrder: z.number().int().optional(),
  controlRefIds: z.array(z.string()).optional(),
  riskRefIds: z.array(z.string()).optional(),
  objectiveRefIds: z.array(z.string()).optional(),
});

export const updateProcedureSchema = createProcedureSchema
  .partial()
  .extend({
    status: z.enum(WORK_ITEM_STATUSES).optional(),
    observations: z.string().nullable().optional(),
    conclusion: z.string().nullable().optional(),
    effectiveness: z.enum(['effective', 'ineffective']).nullable().optional(),
    sampleSize: z.number().int().nullable().optional(),
    exceptions: z.number().int().nullable().optional(),
    reviewNotes: z.string().nullable().optional(),
    content: z.any().optional(),
    controlRefIds: z.array(z.string()).optional(),
    riskRefIds: z.array(z.string()).optional(),
    objectiveRefIds: z.array(z.string()).optional(),
  });

export const createFindingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().nullable().optional(),
  riskRating: z.enum(RISK_RATINGS).nullable().optional(),
  evidence: z.string().nullable().optional(),
  recommendation: z.string().nullable().optional(),
  managementResponse: z.string().nullable().optional(),
  rootCause: z.string().nullable().optional(),
  procedureIds: z.array(z.string()).optional(),
  riskOwnerIds: z.array(z.string()).optional(),
  unitOwnerIds: z.array(z.string()).optional(),
});

export const updateFindingSchema = createFindingSchema.partial().extend({
  status: z.enum(FINDING_STATUSES).optional(),
  riskOwnerIds: z.array(z.string()).optional(),
  unitOwnerIds: z.array(z.string()).optional(),
});

const CONTROL_EFFECTIVENESS = ['strong', 'adequate', 'weak', 'none'] as const;

export const createAuditObjectiveSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateAuditObjectiveSchema = createAuditObjectiveSchema.partial();

export const createRcmObjectiveSchema = z.object({
  auditObjectiveId: z.string().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateRcmObjectiveSchema = createRcmObjectiveSchema.omit({ auditObjectiveId: true }).partial();

export const createEngagementRiskSchema = z.object({
  rcmObjectiveId: z.string().nullable().optional(),
  riskDescription: z.string().min(1, 'Risk description is required'),
  riskRating: z.enum(RISK_RATINGS).nullable().optional(),
  riskCategory: z.enum(RISK_CATEGORIES).nullable().optional(),
  likelihood: z.enum(LIKELIHOOD_LEVELS).nullable().optional(),
  impact: z.enum(IMPACT_LEVELS).nullable().optional(),
  workpaperContent: z.any().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateEngagementRiskSchema = createEngagementRiskSchema.partial();

export const createEngagementControlSchema = z.object({
  description: z.string().min(1, 'Control description is required'),
  effectiveness: z.enum(CONTROL_EFFECTIVENESS).nullable().optional(),
  controlType: z.enum(CONTROL_TYPES).nullable().optional(),
  controlNature: z.enum(CONTROL_NATURES).nullable().optional(),
  frequency: z.enum(CONTROL_FREQUENCIES).nullable().optional(),
  workpaperContent: z.any().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateEngagementControlSchema = createEngagementControlSchema.partial();

// =============================================================================
// INCLUDE HELPERS
// =============================================================================

const engagementListInclude = {
  entity: {
    select: {
      id: true,
      name: true,
      code: true,
      entity_type: { select: { id: true, name: true } },
    },
  },
  planned_audit: {
    select: { id: true, plan_id: true },
  },
  _count: {
    select: {
      sections: true,
      procedures: true,
      findings: true,
    },
  },
} as const;

const procedureInclude = {
  findings: { include: { finding: { select: { id: true, title: true, risk_rating: true, description: true, evidence: true } } } },
  ref_controls: { include: { control: { select: { id: true, description: true } } } },
  ref_risks: { include: { risk: { select: { id: true, risk_description: true } } } },
  ref_objectives: { include: { rcmObjective: { select: { id: true, title: true } } } },
} as const;

const findingInclude = {
  procedures: {
    include: { procedure: { select: { id: true, title: true } } },
  },
  risk_owners: {
    include: { contact: { select: { id: true, name: true, position: true } } },
  },
  unit_owners: {
    include: { unit: { select: { id: true, name: true } } },
  },
} as const;

const engagementDetailInclude = {
  entity: {
    select: {
      id: true,
      name: true,
      code: true,
      risk_level: true,
      inherent_risk_level: true,
      entity_type: { select: { id: true, name: true } },
      owner_units: {
        include: { unit: { select: { id: true, name: true } } },
      },
      areas: {
        include: { area: { select: { id: true, name: true } } },
      },
    },
  },
  planned_audit: {
    select: { id: true, plan_id: true, plan: { select: { id: true, title: true } } },
  },
  audit_objectives: {
    orderBy: { sort_order: 'asc' as const },
  },
  rcm_objectives: {
    include: {
      risks: {
        include: {
          control_refs: {
            include: { control: true },
            orderBy: { control: { sort_order: 'asc' as const } },
          },
        },
        orderBy: { sort_order: 'asc' as const },
      },
    },
    orderBy: { sort_order: 'asc' as const },
  },
  risks: {
    include: {
      rcm_objective: { select: { id: true, title: true } },
      control_refs: {
        include: { control: true },
        orderBy: { control: { sort_order: 'asc' as const } },
      },
    },
    orderBy: { sort_order: 'asc' as const },
  },
  controls: {
    orderBy: { sort_order: 'asc' as const },
  },
  members: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          title: true,
          avatar_url: true,
          role: true,
        },
      },
    },
    orderBy: { joined_at: 'asc' as const },
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
  sections: {
    include: {
      objectives: {
        include: {
          procedures: {
            include: procedureInclude,
            orderBy: { sort_order: 'asc' as const },
          },
        },
        orderBy: { sort_order: 'asc' as const },
      },
      procedures: {
        where: { objective_id: null },
        include: procedureInclude,
        orderBy: { sort_order: 'asc' as const },
      },
    },
    orderBy: { sort_order: 'asc' as const },
  },
  objectives: {
    where: { section_id: null },
    include: {
      procedures: {
        include: procedureInclude,
        orderBy: { sort_order: 'asc' as const },
      },
    },
    orderBy: { sort_order: 'asc' as const },
  },
  procedures: {
    where: { section_id: null, objective_id: null },
    include: procedureInclude,
    orderBy: { sort_order: 'asc' as const },
  },
  findings: {
    include: findingInclude,
    orderBy: { created_at: 'desc' as const },
  },
} as const;

// =============================================================================
// MAPPERS
// =============================================================================

function mapProcedure(p: any) {
  return {
    id: p.id as string,
    engagementId: p.engagement_id as string,
    sectionId: p.section_id as string | null,
    objectiveId: p.objective_id as string | null,
    title: p.title as string,
    description: p.description as string | null,
    procedures: p.procedures as string | null,
    procedureType: p.procedure_type as string | null,
    procedureCategory: p.procedure_category as string | null,
    status: p.status as string,
    approvalStatus: (p.approval_status as string) ?? 'draft',
    currentVersion: (p.current_version as number) ?? 0,
    approvedBy: p.approved_by as string | null,
    approvedAt: p.approved_at ? (p.approved_at as Date).toISOString() : null,
    approvedVersion: p.approved_version as number | null,
    addedFrom: (p.added_from as string) ?? 'execution',
    phase: (p.phase as string) ?? 'planning',
    planningRefId: p.planning_ref_id as string | null,
    source: (p.source as string) ?? 'planned',
    observations: p.observations as string | null,
    conclusion: p.conclusion as string | null,
    effectiveness: p.effectiveness as string | null,
    sampleSize: p.sample_size as number | null,
    exceptions: p.exceptions as number | null,
    sortOrder: p.sort_order as number,
    priority: p.priority as string | null,
    content: p.content ?? null,
    reviewNotes: p.review_notes as string | null,
    performedBy: p.performed_by as string | null,
    reviewedBy: p.reviewed_by as string | null,
    performedAt: p.performed_at ? (p.performed_at as Date).toISOString() : null,
    reviewedAt: p.reviewed_at ? (p.reviewed_at as Date).toISOString() : null,
    createdAt: (p.created_at as Date).toISOString(),
    updatedAt: (p.updated_at as Date).toISOString(),
    linkedFindings: (p.findings ?? []).map((f: any) => ({
      id: f.finding.id,
      title: f.finding.title,
      riskRating: f.finding.risk_rating ?? null,
      description: f.finding.description ?? null,
      evidence: f.finding.evidence ?? null,
    })),
    linkedControls: (p.ref_controls ?? []).map((r: any) => ({
      id: r.control.id,
      description: r.control.description,
    })),
    linkedRisks: (p.ref_risks ?? []).map((r: any) => ({
      id: r.risk.id,
      riskDescription: r.risk.risk_description,
    })),
    linkedObjectives: (p.ref_objectives ?? []).map((r: any) => ({
      id: r.rcmObjective.id,
      title: r.rcmObjective.title,
    })),
  };
}

function mapObjective(o: any) {
  return {
    id: o.id as string,
    sectionId: (o.section_id as string | null) ?? null,
    title: o.title as string,
    description: o.description as string | null,
    status: o.status as string,
    addedFrom: (o.added_from as string) ?? 'execution',
    phase: (o.phase as string) ?? 'planning',
    planningRefId: o.planning_ref_id as string | null,
    source: (o.source as string) ?? 'planned',
    sortOrder: o.sort_order as number,
    reviewNotes: o.review_notes as string | null,
    reviewedBy: o.reviewed_by as string | null,
    reviewedAt: o.reviewed_at ? (o.reviewed_at as Date).toISOString() : null,
    procedures: (o.procedures ?? []).map(mapProcedure),
  };
}

function mapSection(s: any) {
  return {
    id: s.id as string,
    engagementId: s.engagement_id as string,
    title: s.title as string,
    description: s.description as string | null,
    status: s.status as string,
    addedFrom: (s.added_from as string) ?? 'execution',
    phase: (s.phase as string) ?? 'planning',
    planningRefId: s.planning_ref_id as string | null,
    source: (s.source as string) ?? 'planned',
    sortOrder: s.sort_order as number,
    reviewNotes: s.review_notes as string | null,
    reviewedBy: s.reviewed_by as string | null,
    reviewedAt: s.reviewed_at ? (s.reviewed_at as Date).toISOString() : null,
    objectives: (s.objectives ?? []).map(mapObjective),
    procedures: (s.procedures ?? []).map(mapProcedure), // procedures directly under section
  };
}

function mapFinding(f: any) {
  return {
    id: f.id as string,
    engagementId: f.engagement_id as string,
    title: f.title as string,
    description: f.description as string | null,
    riskRating: f.risk_rating as string | null,
    status: f.status as string,
    recommendation: f.recommendation as string | null,
    managementResponse: f.management_response as string | null,
    rootCause: f.root_cause as string | null,
    createdBy: f.created_by as string | null,
    createdAt: (f.created_at as Date).toISOString(),
    updatedAt: (f.updated_at as Date).toISOString(),
    linkedProcedures: (f.procedures ?? []).map((p: any) => ({
      id: p.procedure.id,
      title: p.procedure.title,
    })),
    riskOwners: (f.risk_owners ?? []).map((o: any) => ({
      id: o.contact.id,
      name: o.contact.name,
      position: o.contact.position ?? null,
    })),
    unitOwners: (f.unit_owners ?? []).map((o: any) => ({
      id: o.unit.id,
      name: o.unit.name,
    })),
  };
}

function mapEngagementSummary(e: any) {
  return {
    id: e.id as string,
    title: e.title as string,
    entityId: e.entity_id as string,
    plannedAuditId: e.planned_audit_id as string | null,
    status: e.status as string,
    objective: e.objective as string | null,
    startDate: (e.start_date as Date).toISOString(),
    endDate: (e.end_date as Date).toISOString(),
    estimatedDays: e.estimated_days as number | null,
    priority: e.priority as string | null,
    createdAt: (e.created_at as Date).toISOString(),
    updatedAt: (e.updated_at as Date).toISOString(),
    entity: e.entity
      ? {
          id: e.entity.id,
          name: e.entity.name,
          code: e.entity.code,
          entityType: e.entity.entity_type
            ? { id: e.entity.entity_type.id, name: e.entity.entity_type.name }
            : null,
        }
      : null,
    plannedAudit: e.planned_audit
      ? { id: e.planned_audit.id, planId: e.planned_audit.plan_id }
      : null,
    counts: {
      sections: e._count?.sections ?? 0,
      procedures: e._count?.procedures ?? 0,
      findings: e._count?.findings ?? 0,
    },
  };
}

function mapEngagementDetail(e: any) {
  return {
    id: e.id as string,
    title: e.title as string,
    entityId: e.entity_id as string,
    plannedAuditId: e.planned_audit_id as string | null,
    status: e.status as string,
    objective: e.objective as string | null,
    scope: e.scope as string | null,
    startDate: (e.start_date as Date).toISOString(),
    endDate: (e.end_date as Date).toISOString(),
    estimatedDays: e.estimated_days as number | null,
    priority: e.priority as string | null,
    notes: e.notes as string | null,
    createdBy: e.created_by as string | null,
    createdAt: (e.created_at as Date).toISOString(),
    updatedAt: (e.updated_at as Date).toISOString(),
    entity: e.entity
      ? {
          id: e.entity.id,
          name: e.entity.name,
          code: e.entity.code,
          riskLevel: e.entity.risk_level,
          inherentRiskLevel: e.entity.inherent_risk_level,
          entityType: e.entity.entity_type
            ? { id: e.entity.entity_type.id, name: e.entity.entity_type.name }
            : null,
          ownerUnits: (e.entity.owner_units ?? []).map(
            (o: { unit: { id: string; name: string } }) => ({
              id: o.unit.id,
              name: o.unit.name,
            }),
          ),
          areas: (e.entity.areas ?? []).map(
            (a: { area: { id: string; name: string } }) => ({
              id: a.area.id,
              name: a.area.name,
            }),
          ),
        }
      : null,
    plannedAudit: e.planned_audit
      ? {
          id: e.planned_audit.id,
          planId: e.planned_audit.plan_id,
          plan: e.planned_audit.plan
            ? { id: e.planned_audit.plan.id, title: e.planned_audit.plan.title }
            : null,
        }
      : null,
    understanding: e.understanding as string | null,
    wpApprovalStatus: (e.wp_approval_status as string) ?? 'draft',
    wpApprovedBy: e.wp_approved_by as string | null,
    wpApprovedAt: e.wp_approved_at ? (e.wp_approved_at as Date).toISOString() : null,
    wpApprovedVersion: e.wp_approved_version as number | null,
    ownerUnits: (e.owner_units ?? []).map(
      (o: { unit: { id: string; name: string } }) => ({ id: o.unit.id, name: o.unit.name }),
    ),
    participatingUnits: (e.participating_units ?? []).map(
      (p: { unit: { id: string; name: string } }) => ({ id: p.unit.id, name: p.unit.name }),
    ),
    contactPoints: (e.contact_points ?? []).map(
      (cp: { contact: { id: string; name: string; position: string | null } }) => ({
        id: cp.contact.id, name: cp.contact.name, position: cp.contact.position,
      }),
    ),
    auditeeReps: (e.auditee_reps ?? []).map(
      (r: { contact: { id: string; name: string; position: string | null } }) => ({
        id: r.contact.id, name: r.contact.name, position: r.contact.position,
      }),
    ),
    members: (e.members ?? []).map((m: { user_id: string; role: string; joined_at: Date; user: { id: string; name: string; email: string; title: string | null; avatar_url: string | null; role: string } }) => ({
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at.toISOString(),
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        title: m.user.title,
        avatarUrl: m.user.avatar_url,
        role: m.user.role,
      },
    })),
    sections: (e.sections ?? []).map(mapSection),
    standaloneObjectives: (e.objectives ?? []).map(mapObjective),
    ungroupedProcedures: (e.procedures ?? []).map(mapProcedure),
    findings: (e.findings ?? []).map(mapFinding),
    auditObjectives: (e.audit_objectives ?? []).map(mapAuditObjective),
    rcmObjectives: (e.rcm_objectives ?? []).map(mapRcmObjective),
    risks: (e.risks ?? []).map(mapEngagementRisk),
    controls: (e.controls ?? []).map(mapEngagementControl),
  };
}

function mapAuditObjective(o: any) {
  return {
    id: o.id as string,
    engagementId: o.engagement_id as string,
    title: o.title as string,
    description: o.description as string | null,
    sortOrder: o.sort_order as number,
  };
}

function mapRcmObjective(o: any) {
  return {
    id: o.id as string,
    engagementId: o.engagement_id as string,
    auditObjectiveId: o.audit_objective_id as string | null,
    title: o.title as string,
    description: o.description as string | null,
    sortOrder: o.sort_order as number,
    risks: (o.risks ?? []).map(mapEngagementRisk),
  };
}

function mapEngagementRisk(r: any) {
  // controls may come from M:N control_refs or legacy direct controls
  const controls = r.control_refs
    ? r.control_refs.map((ref: any) => mapEngagementControl(ref.control))
    : (r.controls ?? []).map(mapEngagementControl);
  return {
    id: r.id as string,
    engagementId: r.engagement_id as string,
    rcmObjectiveId: r.rcm_objective_id as string | null,
    riskDescription: r.risk_description as string,
    riskRating: r.risk_rating as string | null,
    riskCategory: r.risk_category as string | null,
    likelihood: r.likelihood as string | null,
    impact: r.impact as string | null,
    workpaperContent: r.workpaper_content ?? null,
    sortOrder: r.sort_order as number,
    rcmObjective: r.rcm_objective
      ? { id: r.rcm_objective.id, title: r.rcm_objective.title }
      : null,
    controls,
  };
}

function mapEngagementControl(c: any) {
  return {
    id: c.id as string,
    engagementId: c.engagement_id as string,
    description: c.description as string,
    effectiveness: c.effectiveness as string | null,
    controlType: c.control_type as string | null,
    controlNature: c.control_nature as string | null,
    frequency: c.frequency as string | null,
    workpaperContent: c.workpaper_content ?? null,
    sortOrder: c.sort_order as number,
  };
}

// =============================================================================
// ENGAGEMENT CRUD
// =============================================================================

export async function getEngagements() {
  const engagements = await prisma.engagement.findMany({
    include: engagementListInclude,
    orderBy: { created_at: 'desc' },
  });
  return engagements.map(mapEngagementSummary);
}

export async function getEngagementById(id: string) {
  const engagement = await prisma.engagement.findUnique({
    where: { id },
    include: engagementDetailInclude,
  });
  if (!engagement) throw new Error('Engagement not found');
  return mapEngagementDetail(engagement);
}

export async function createEngagement(
  input: unknown,
  userId: string,
  userName: string,
) {
  const parsed = createEngagementSchema.parse(input);

  const startDate = new Date(parsed.startDate);
  const endDate = new Date(parsed.endDate);
  if (endDate <= startDate) {
    throw new Error('End date must be after start date');
  }

  // Verify entity exists
  const entity = await prisma.auditableEntity.findUnique({
    where: { id: parsed.entityId },
  });
  if (!entity) throw new Error('Entity not found');

  // If linking to planned audit, verify it exists and isn't already linked
  if (parsed.plannedAuditId) {
    const pa = await prisma.plannedAudit.findUnique({
      where: { id: parsed.plannedAuditId },
    });
    if (!pa) throw new Error('Planned audit not found');

    const existingLink = await prisma.engagement.findUnique({
      where: { planned_audit_id: parsed.plannedAuditId },
    });
    if (existingLink) throw new Error('An engagement already exists for this planned audit');
  }

  const engagement = await prisma.engagement.create({
    data: {
      title: parsed.title,
      entity_id: parsed.entityId,
      planned_audit_id: parsed.plannedAuditId ?? null,
      objective: parsed.objective ?? null,
      scope: parsed.scope ?? null,
      start_date: startDate,
      end_date: endDate,
      estimated_days: parsed.estimatedDays ?? null,
      priority: parsed.priority ?? null,
      notes: parsed.notes ?? null,
      status: 'planning',
      created_by: userId,
      updated_by: userId,
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
    include: engagementDetailInclude,
  });

  // Auto-add creator + all CAE users to the engagement team
  const caeUsers = await prisma.user.findMany({
    where: { role: 'cae', status: 'active' },
    select: { id: true },
  });

  const autoMembers = new Map<string, string>(); // userId -> role
  autoMembers.set(userId, 'lead'); // creator as lead
  for (const cae of caeUsers) {
    if (!autoMembers.has(cae.id)) {
      autoMembers.set(cae.id, 'reviewer');
    }
  }

  await prisma.engagementMember.createMany({
    data: Array.from(autoMembers.entries()).map(([uid, role]) => ({
      engagement_id: engagement.id,
      user_id: uid,
      role,
    })),
    skipDuplicates: true,
  });

  // If linked to a planned audit, update its status to in_progress
  if (parsed.plannedAuditId) {
    await prisma.plannedAudit.update({
      where: { id: parsed.plannedAuditId },
      data: { status: 'in_progress' },
    });
  }

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'engagement',
    entityId: engagement.id,
  });

  // Re-fetch to include the auto-added members
  const result = await prisma.engagement.findUnique({
    where: { id: engagement.id },
    include: engagementDetailInclude,
  });

  return mapEngagementDetail(result!);
}

export async function updateEngagement(
  id: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagement.findUnique({ where: { id } });
  if (!existing) throw new Error('Engagement not found');

  const parsed = updateEngagementSchema.parse(input);

  const changes: Record<string, { old: unknown; new: unknown }> = {};
  const data: Record<string, unknown> = { updated_by: userId };

  if (parsed.title !== undefined && parsed.title !== existing.title) {
    changes.title = { old: existing.title, new: parsed.title };
    data.title = parsed.title;
  }
  if (parsed.objective !== undefined) data.objective = parsed.objective ?? null;
  if (parsed.scope !== undefined) data.scope = parsed.scope ?? null;
  if (parsed.startDate !== undefined) data.start_date = new Date(parsed.startDate);
  if (parsed.endDate !== undefined) data.end_date = new Date(parsed.endDate);
  if (parsed.estimatedDays !== undefined) data.estimated_days = parsed.estimatedDays ?? null;
  if (parsed.priority !== undefined) data.priority = parsed.priority ?? null;
  if (parsed.notes !== undefined) data.notes = parsed.notes ?? null;
  if (parsed.understanding !== undefined) data.understanding = parsed.understanding ?? null;

  if (parsed.status !== undefined && parsed.status !== existing.status) {
    changes.status = { old: existing.status, new: parsed.status };
    data.status = parsed.status;
  }

  const engagement = await prisma.$transaction(async (tx) => {
    // Update owner units
    if (parsed.ownerUnitIds !== undefined) {
      await tx.engagementOwner.deleteMany({ where: { engagement_id: id } });
      if (parsed.ownerUnitIds.length > 0) {
        await tx.engagementOwner.createMany({
          data: parsed.ownerUnitIds.map((uid) => ({ engagement_id: id, unit_id: uid })),
        });
      }
    }
    // Update participating units
    if (parsed.participatingUnitIds !== undefined) {
      await tx.engagementParticipant.deleteMany({ where: { engagement_id: id } });
      if (parsed.participatingUnitIds.length > 0) {
        await tx.engagementParticipant.createMany({
          data: parsed.participatingUnitIds.map((uid) => ({ engagement_id: id, unit_id: uid })),
        });
      }
    }
    // Update contact points
    if (parsed.contactPointIds !== undefined) {
      await tx.engagementContactPoint.deleteMany({ where: { engagement_id: id } });
      if (parsed.contactPointIds.length > 0) {
        await tx.engagementContactPoint.createMany({
          data: parsed.contactPointIds.map((cid) => ({ engagement_id: id, contact_id: cid })),
        });
      }
    }
    // Update auditee reps
    if (parsed.auditeeRepIds !== undefined) {
      await tx.engagementAuditeeRep.deleteMany({ where: { engagement_id: id } });
      if (parsed.auditeeRepIds.length > 0) {
        await tx.engagementAuditeeRep.createMany({
          data: parsed.auditeeRepIds.map((cid) => ({ engagement_id: id, contact_id: cid })),
        });
      }
    }

    return tx.engagement.update({
      where: { id },
      data,
      include: engagementDetailInclude,
    });
  });

  // Sync status to planned audit if linked
  if (existing.planned_audit_id && parsed.status) {
    const paStatus = parsed.status === 'closed' ? 'completed' : 'in_progress';
    await prisma.plannedAudit.update({
      where: { id: existing.planned_audit_id },
      data: { status: paStatus },
    });
  }

  if (Object.keys(changes).length > 0) {
    await logAudit({
      userId,
      userName,
      action: 'update',
      entityType: 'engagement',
      entityId: id,
      changes,
    });
  }

  return mapEngagementDetail(engagement);
}

export async function deleteEngagement(
  id: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagement.findUnique({ where: { id } });
  if (!existing) throw new Error('Engagement not found');

  await prisma.engagement.delete({ where: { id } });

  // If linked to planned audit, reset its status to planned
  if (existing.planned_audit_id) {
    await prisma.plannedAudit.update({
      where: { id: existing.planned_audit_id },
      data: { status: 'planned' },
    });
  }

  await logAudit({
    userId,
    userName,
    action: 'delete',
    entityType: 'engagement',
    entityId: id,
  });

  return { id };
}

// =============================================================================
// SECTION CRUD
// =============================================================================

export async function createSection(
  engagementId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  await verifyEngagement(engagementId);
  const parsed = createSectionSchema.parse(input);

  const maxOrder = await prisma.engagementSection.aggregate({
    where: { engagement_id: engagementId },
    _max: { sort_order: true },
  });

  const section = await prisma.engagementSection.create({
    data: {
      engagement_id: engagementId,
      title: parsed.title,
      description: parsed.description ?? null,
      added_from: parsed.addedFrom ?? 'execution',
      phase: parsed.phase ?? 'planning',
      sort_order: parsed.sortOrder ?? (maxOrder._max.sort_order ?? 0) + 1,
    },
    include: {
      objectives: { include: { procedures: true }, orderBy: { sort_order: 'asc' } },
      procedures: { where: { objective_id: null }, orderBy: { sort_order: 'asc' } },
    },
  });

  await logAudit({
    userId, userName, action: 'create',
    entityType: 'engagement_section', entityId: section.id,
  });

  return mapSection(section);
}

export async function updateSection(
  engagementId: string,
  sectionId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementSection.findFirst({
    where: { id: sectionId, engagement_id: engagementId },
  });
  if (!existing) throw new Error('Section not found');

  const parsed = updateSectionSchema.parse(input);
  const data: Record<string, unknown> = {};

  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.description !== undefined) data.description = parsed.description ?? null;
  if (parsed.status !== undefined) data.status = parsed.status;
  if (parsed.sortOrder !== undefined) data.sort_order = parsed.sortOrder;
  if (parsed.reviewNotes !== undefined) data.review_notes = parsed.reviewNotes ?? null;

  const section = await prisma.engagementSection.update({
    where: { id: sectionId },
    data,
    include: {
      objectives: {
        include: { procedures: { orderBy: { sort_order: 'asc' } } },
        orderBy: { sort_order: 'asc' },
      },
      procedures: { where: { objective_id: null }, orderBy: { sort_order: 'asc' } },
    },
  });

  await logAudit({
    userId, userName, action: 'update',
    entityType: 'engagement_section', entityId: sectionId,
  });

  return mapSection(section);
}

export async function deleteSection(
  engagementId: string,
  sectionId: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementSection.findFirst({
    where: { id: sectionId, engagement_id: engagementId },
  });
  if (!existing) throw new Error('Section not found');

  await prisma.engagementSection.delete({ where: { id: sectionId } });

  await logAudit({
    userId, userName, action: 'delete',
    entityType: 'engagement_section', entityId: sectionId,
  });

  return { id: sectionId };
}

// =============================================================================
// OBJECTIVE CRUD
// =============================================================================

export async function createObjective(
  sectionId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const section = await prisma.engagementSection.findUnique({ where: { id: sectionId } });
  if (!section) throw new Error('Section not found');

  const parsed = createObjectiveSchema.parse(input);

  const maxOrder = await prisma.engagementObjective.aggregate({
    where: { section_id: sectionId },
    _max: { sort_order: true },
  });

  const objective = await prisma.engagementObjective.create({
    data: {
      engagement_id: section.engagement_id,
      section_id: sectionId,
      title: parsed.title,
      description: parsed.description ?? null,
      added_from: parsed.addedFrom ?? 'execution',
      phase: parsed.phase ?? section.phase,
      sort_order: parsed.sortOrder ?? (maxOrder._max.sort_order ?? 0) + 1,
    },
    include: { procedures: { orderBy: { sort_order: 'asc' } } },
  });

  await logAudit({
    userId, userName, action: 'create',
    entityType: 'engagement_objective', entityId: objective.id,
  });

  return mapObjective(objective);
}

export async function createStandaloneObjective(
  engagementId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const engagement = await prisma.engagement.findUnique({ where: { id: engagementId } });
  if (!engagement) throw new Error('Engagement not found');

  const parsed = createObjectiveSchema.parse(input);

  // sortOrder shared with sections for interleaving
  const maxSectionOrder = await prisma.engagementSection.aggregate({
    where: { engagement_id: engagementId },
    _max: { sort_order: true },
  });
  const maxObjOrder = await prisma.engagementObjective.aggregate({
    where: { engagement_id: engagementId, section_id: null },
    _max: { sort_order: true },
  });
  const nextOrder = Math.max(maxSectionOrder._max.sort_order ?? 0, maxObjOrder._max.sort_order ?? 0) + 1;

  const objective = await prisma.engagementObjective.create({
    data: {
      engagement_id: engagementId,
      section_id: null,
      title: parsed.title,
      description: parsed.description ?? null,
      added_from: parsed.addedFrom ?? 'execution',
      phase: parsed.phase ?? 'planning',
      sort_order: parsed.sortOrder ?? nextOrder,
    },
    include: { procedures: { orderBy: { sort_order: 'asc' } } },
  });

  await logAudit({
    userId, userName, action: 'create',
    entityType: 'engagement_objective', entityId: objective.id,
  });

  return mapObjective(objective);
}

export async function updateObjective(
  objectiveId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementObjective.findUnique({ where: { id: objectiveId } });
  if (!existing) throw new Error('Objective not found');

  const parsed = updateObjectiveSchema.parse(input);
  const data: Record<string, unknown> = {};

  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.description !== undefined) data.description = parsed.description ?? null;
  if (parsed.status !== undefined) data.status = parsed.status;
  if (parsed.sortOrder !== undefined) data.sort_order = parsed.sortOrder;
  if (parsed.reviewNotes !== undefined) data.review_notes = parsed.reviewNotes ?? null;
  if (parsed.sectionId !== undefined) data.section_id = parsed.sectionId;

  const objective = await prisma.engagementObjective.update({
    where: { id: objectiveId },
    data,
    include: { procedures: { orderBy: { sort_order: 'asc' } } },
  });

  await logAudit({
    userId, userName, action: 'update',
    entityType: 'engagement_objective', entityId: objectiveId,
  });

  return mapObjective(objective);
}

export async function deleteObjective(
  objectiveId: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementObjective.findUnique({ where: { id: objectiveId } });
  if (!existing) throw new Error('Objective not found');

  await prisma.engagementObjective.delete({ where: { id: objectiveId } });

  await logAudit({
    userId, userName, action: 'delete',
    entityType: 'engagement_objective', entityId: objectiveId,
  });

  return { id: objectiveId };
}

// =============================================================================
// PROCEDURE CRUD
// =============================================================================

export async function createProcedure(
  engagementId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  await verifyEngagement(engagementId);
  const parsed = createProcedureSchema.parse(input);

  // Determine parent for sort order
  const whereClause: Record<string, unknown> = { engagement_id: engagementId };
  if (parsed.objectiveId) {
    whereClause.objective_id = parsed.objectiveId;
  } else if (parsed.sectionId) {
    whereClause.section_id = parsed.sectionId;
    whereClause.objective_id = null;
  } else {
    whereClause.section_id = null;
    whereClause.objective_id = null;
  }

  const maxOrder = await prisma.engagementProcedure.aggregate({
    where: whereClause,
    _max: { sort_order: true },
  });

  const procedure = await prisma.engagementProcedure.create({
    data: {
      engagement_id: engagementId,
      section_id: parsed.sectionId ?? null,
      objective_id: parsed.objectiveId ?? null,
      title: parsed.title,
      description: parsed.description ?? null,
      procedures: parsed.procedures ?? null,
      procedure_type: parsed.procedureType ?? null,
      procedure_category: parsed.procedureCategory ?? null,
      priority: parsed.priority ?? null,
      added_from: parsed.addedFrom ?? 'execution',
      sort_order: parsed.sortOrder ?? (maxOrder._max.sort_order ?? 0) + 1,
      ...(parsed.controlRefIds && parsed.controlRefIds.length > 0 && {
        ref_controls: { create: parsed.controlRefIds.map((cid) => ({ control_id: cid })) },
      }),
      ...(parsed.riskRefIds && parsed.riskRefIds.length > 0 && {
        ref_risks: { create: parsed.riskRefIds.map((rid) => ({ risk_id: rid })) },
      }),
      ...(parsed.objectiveRefIds && parsed.objectiveRefIds.length > 0 && {
        ref_objectives: { create: parsed.objectiveRefIds.map((oid) => ({ rcm_objective_id: oid })) },
      }),
    },
    include: procedureInclude,
  });

  await logAudit({
    userId, userName, action: 'create',
    entityType: 'engagement_procedure', entityId: procedure.id,
  });

  // Auto-push engagement status if procedure implies fieldwork
  await autoAdvanceEngagementStatus(engagementId);

  return mapProcedure(procedure);
}

export async function updateProcedure(
  procedureId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementProcedure.findUnique({ where: { id: procedureId } });
  if (!existing) throw new Error('Procedure not found');

  const parsed = updateProcedureSchema.parse(input);
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  const data: Record<string, unknown> = {};

  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.description !== undefined) data.description = parsed.description ?? null;
  if (parsed.procedures !== undefined) data.procedures = parsed.procedures ?? null;
  if (parsed.procedureType !== undefined) data.procedure_type = parsed.procedureType ?? null;
  if (parsed.procedureCategory !== undefined) data.procedure_category = parsed.procedureCategory ?? null;
  if (parsed.priority !== undefined) data.priority = parsed.priority ?? null;
  if (parsed.sortOrder !== undefined) data.sort_order = parsed.sortOrder;
  if (parsed.observations !== undefined) data.observations = parsed.observations ?? null;
  if (parsed.conclusion !== undefined) data.conclusion = parsed.conclusion ?? null;
  if (parsed.effectiveness !== undefined) data.effectiveness = parsed.effectiveness ?? null;
  if (parsed.sampleSize !== undefined) data.sample_size = parsed.sampleSize ?? null;
  if (parsed.exceptions !== undefined) data.exceptions = parsed.exceptions ?? null;
  if (parsed.reviewNotes !== undefined) data.review_notes = parsed.reviewNotes ?? null;
  if (parsed.content !== undefined) data.content = parsed.content ?? undefined;
  if (parsed.sectionId !== undefined) data.section_id = parsed.sectionId;
  if (parsed.objectiveId !== undefined) data.objective_id = parsed.objectiveId;

  if (parsed.status !== undefined && parsed.status !== existing.status) {
    changes.status = { old: existing.status, new: parsed.status };
    data.status = parsed.status;

    // Set performed/reviewed timestamps
    if (parsed.status === 'in_progress' && !existing.performed_at) {
      data.performed_at = new Date();
      data.performed_by = userId;
    }
    if (parsed.status === 'reviewed' && !existing.reviewed_at) {
      data.reviewed_at = new Date();
      data.reviewed_by = userId;
    }
  }

  // Update procedure refs if provided
  if (parsed.controlRefIds !== undefined) {
    await prisma.procedureControlRef.deleteMany({ where: { procedure_id: procedureId } });
    if (parsed.controlRefIds.length > 0) {
      await prisma.procedureControlRef.createMany({
        data: parsed.controlRefIds.map((cid) => ({ procedure_id: procedureId, control_id: cid })),
      });
    }
  }
  if (parsed.riskRefIds !== undefined) {
    await prisma.procedureRiskRef.deleteMany({ where: { procedure_id: procedureId } });
    if (parsed.riskRefIds.length > 0) {
      await prisma.procedureRiskRef.createMany({
        data: parsed.riskRefIds.map((rid) => ({ procedure_id: procedureId, risk_id: rid })),
      });
    }
  }
  if (parsed.objectiveRefIds !== undefined) {
    await prisma.procedureObjectiveRef.deleteMany({ where: { procedure_id: procedureId } });
    if (parsed.objectiveRefIds.length > 0) {
      await prisma.procedureObjectiveRef.createMany({
        data: parsed.objectiveRefIds.map((oid) => ({ procedure_id: procedureId, rcm_objective_id: oid })),
      });
    }
  }

  const procedure = await prisma.engagementProcedure.update({
    where: { id: procedureId },
    data,
    include: procedureInclude,
  });

  // Invalidate review/approve sign-offs if audit-relevant fields changed
  const changedDbFields = Object.keys(data);
  if (hasAuditRelevantChanges(changedDbFields)) {
    await invalidateSignoffs('procedure', procedureId, userId);
  }

  if (Object.keys(changes).length > 0) {
    await logAudit({
      userId, userName, action: 'update',
      entityType: 'engagement_procedure', entityId: procedureId,
      changes,
    });
  }

  // Auto-push engagement status based on procedure status
  if (parsed.status) {
    await autoAdvanceEngagementStatus(existing.engagement_id);
  }

  return mapProcedure(procedure);
}

export async function deleteProcedure(
  procedureId: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementProcedure.findUnique({ where: { id: procedureId } });
  if (!existing) throw new Error('Procedure not found');

  await prisma.engagementProcedure.delete({ where: { id: procedureId } });

  await logAudit({
    userId, userName, action: 'delete',
    entityType: 'engagement_procedure', entityId: procedureId,
  });

  return { id: procedureId };
}

// =============================================================================
// DRAFT FINDING CRUD
// =============================================================================

export async function createFinding(
  engagementId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  await verifyEngagement(engagementId);
  const parsed = createFindingSchema.parse(input);

  const finding = await prisma.draftFinding.create({
    data: {
      engagement_id: engagementId,
      title: parsed.title,
      description: parsed.description ?? null,
      risk_rating: parsed.riskRating ?? null,
      evidence: parsed.evidence ?? null,
      recommendation: parsed.recommendation ?? null,
      management_response: parsed.managementResponse ?? null,
      root_cause: parsed.rootCause ?? null,
      created_by: userId,
      procedures: parsed.procedureIds && parsed.procedureIds.length > 0
        ? {
            create: parsed.procedureIds.map((pid) => ({
              procedure_id: pid,
            })),
          }
        : undefined,
      risk_owners: parsed.riskOwnerIds && parsed.riskOwnerIds.length > 0
        ? {
            create: parsed.riskOwnerIds.map((cid) => ({ contact_id: cid })),
          }
        : undefined,
      unit_owners: parsed.unitOwnerIds && parsed.unitOwnerIds.length > 0
        ? {
            create: parsed.unitOwnerIds.map((uid) => ({ unit_id: uid })),
          }
        : undefined,
    },
    include: findingInclude,
  });

  await logAudit({
    userId, userName, action: 'create',
    entityType: 'draft_finding', entityId: finding.id,
  });

  return mapFinding(finding);
}

export async function updateFinding(
  findingId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.draftFinding.findUnique({ where: { id: findingId } });
  if (!existing) throw new Error('Finding not found');

  const parsed = updateFindingSchema.parse(input);
  const data: Record<string, unknown> = {};

  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.description !== undefined) data.description = parsed.description ?? null;
  if (parsed.riskRating !== undefined) data.risk_rating = parsed.riskRating ?? null;
  if (parsed.status !== undefined) data.status = parsed.status;
  if (parsed.evidence !== undefined) data.evidence = parsed.evidence ?? null;
  if (parsed.recommendation !== undefined) data.recommendation = parsed.recommendation ?? null;
  if (parsed.managementResponse !== undefined) data.management_response = parsed.managementResponse ?? null;
  if (parsed.rootCause !== undefined) data.root_cause = parsed.rootCause ?? null;

  // Update procedure links if provided
  if (parsed.procedureIds !== undefined) {
    await prisma.draftFindingProcedure.deleteMany({ where: { finding_id: findingId } });
    if (parsed.procedureIds.length > 0) {
      await prisma.draftFindingProcedure.createMany({
        data: parsed.procedureIds.map((pid) => ({
          finding_id: findingId,
          procedure_id: pid,
        })),
      });
    }
  }
  // Update risk owners if provided
  if (parsed.riskOwnerIds !== undefined) {
    await prisma.draftFindingRiskOwner.deleteMany({ where: { finding_id: findingId } });
    if (parsed.riskOwnerIds.length > 0) {
      await prisma.draftFindingRiskOwner.createMany({
        data: parsed.riskOwnerIds.map((cid) => ({ finding_id: findingId, contact_id: cid })),
      });
    }
  }
  // Update unit owners if provided
  if (parsed.unitOwnerIds !== undefined) {
    await prisma.draftFindingUnitOwner.deleteMany({ where: { finding_id: findingId } });
    if (parsed.unitOwnerIds.length > 0) {
      await prisma.draftFindingUnitOwner.createMany({
        data: parsed.unitOwnerIds.map((uid) => ({ finding_id: findingId, unit_id: uid })),
      });
    }
  }

  const finding = await prisma.draftFinding.update({
    where: { id: findingId },
    data,
    include: findingInclude,
  });

  await logAudit({
    userId, userName, action: 'update',
    entityType: 'draft_finding', entityId: findingId,
  });

  return mapFinding(finding);
}

export async function deleteFinding(
  findingId: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.draftFinding.findUnique({ where: { id: findingId } });
  if (!existing) throw new Error('Finding not found');

  await prisma.draftFinding.delete({ where: { id: findingId } });

  await logAudit({
    userId, userName, action: 'delete',
    entityType: 'draft_finding', entityId: findingId,
  });

  return { id: findingId };
}

// =============================================================================
// HELPERS
// =============================================================================

async function verifyEngagement(id: string) {
  const e = await prisma.engagement.findUnique({ where: { id } });
  if (!e) throw new Error('Engagement not found');
  return e;
}

/**
 * Auto-advance engagement status based on procedure activity.
 * If any procedure is in_progress and engagement is in 'planning' → push to 'fieldwork'.
 * Does NOT downgrade — user must manually push back.
 */
async function autoAdvanceEngagementStatus(engagementId: string) {
  const engagement = await prisma.engagement.findUnique({ where: { id: engagementId } });
  if (!engagement) return;

  // Only auto-advance from planning to fieldwork
  if (engagement.status === 'planning') {
    const hasActive = await prisma.engagementProcedure.findFirst({
      where: {
        engagement_id: engagementId,
        status: { not: 'not_started' },
      },
    });
    if (hasActive) {
      await prisma.engagement.update({
        where: { id: engagementId },
        data: { status: 'fieldwork' },
      });

      // Also sync to planned audit
      if (engagement.planned_audit_id) {
        await prisma.plannedAudit.update({
          where: { id: engagement.planned_audit_id },
          data: { status: 'in_progress' },
        });
      }
    }
  }
}

// =============================================================================
// AUDIT OBJECTIVE CRUD (Planning-level)
// =============================================================================

export async function createAuditObjective(
  engagementId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  await verifyEngagement(engagementId);
  const parsed = createAuditObjectiveSchema.parse(input);

  const maxOrder = await prisma.auditObjective.aggregate({
    where: { engagement_id: engagementId },
    _max: { sort_order: true },
  });

  const sortOrderVal = parsed.sortOrder ?? (maxOrder._max.sort_order ?? 0) + 1;

  const obj = await prisma.auditObjective.create({
    data: {
      engagement_id: engagementId,
      title: parsed.title,
      description: parsed.description ?? null,
      sort_order: sortOrderVal,
    },
  });

  // Auto-sync: create a corresponding RCM objective
  const rcmMaxOrder = await prisma.engagementRcmObjective.aggregate({
    where: { engagement_id: engagementId },
    _max: { sort_order: true },
  });
  await prisma.engagementRcmObjective.create({
    data: {
      engagement_id: engagementId,
      audit_objective_id: obj.id,
      title: parsed.title,
      description: parsed.description ?? null,
      sort_order: (rcmMaxOrder._max.sort_order ?? 0) + 1,
    },
  });

  await logAudit({
    userId, userName, action: 'create',
    entityType: 'audit_objective', entityId: obj.id,
  });

  return mapAuditObjective(obj);
}

export async function updateAuditObjective(
  objectiveId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.auditObjective.findUnique({ where: { id: objectiveId } });
  if (!existing) throw new Error('Audit objective not found');

  const parsed = updateAuditObjectiveSchema.parse(input);
  const data: Record<string, unknown> = {};

  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.description !== undefined) data.description = parsed.description ?? null;
  if (parsed.sortOrder !== undefined) data.sort_order = parsed.sortOrder;

  const obj = await prisma.auditObjective.update({
    where: { id: objectiveId },
    data,
  });

  await logAudit({
    userId, userName, action: 'update',
    entityType: 'audit_objective', entityId: objectiveId,
  });

  return mapAuditObjective(obj);
}

export async function deleteAuditObjective(
  objectiveId: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.auditObjective.findUnique({ where: { id: objectiveId } });
  if (!existing) throw new Error('Audit objective not found');

  await prisma.auditObjective.delete({ where: { id: objectiveId } });

  await logAudit({
    userId, userName, action: 'delete',
    entityType: 'audit_objective', entityId: objectiveId,
  });

  return { id: objectiveId };
}

// =============================================================================
// ENGAGEMENT RISK CRUD (RACM light)
// =============================================================================

export async function createEngagementRisk(
  engagementId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  await verifyEngagement(engagementId);
  const parsed = createEngagementRiskSchema.parse(input);

  const maxOrder = await prisma.engagementRisk.aggregate({
    where: { engagement_id: engagementId },
    _max: { sort_order: true },
  });

  const risk = await prisma.engagementRisk.create({
    data: {
      engagement_id: engagementId,
      rcm_objective_id: parsed.rcmObjectiveId ?? null,
      risk_description: parsed.riskDescription,
      risk_rating: parsed.riskRating ?? null,
      risk_category: parsed.riskCategory ?? null,
      likelihood: parsed.likelihood ?? null,
      impact: parsed.impact ?? null,
      workpaper_content: parsed.workpaperContent ?? undefined,
      sort_order: parsed.sortOrder ?? (maxOrder._max.sort_order ?? 0) + 1,
    },
    include: {
      rcm_objective: { select: { id: true, title: true } },
      control_refs: {
        include: { control: true },
        orderBy: { control: { sort_order: 'asc' } },
      },
    },
  });

  await logAudit({
    userId, userName, action: 'create',
    entityType: 'engagement_risk', entityId: risk.id,
  });

  return mapEngagementRisk(risk);
}

export async function updateEngagementRisk(
  riskId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementRisk.findUnique({ where: { id: riskId } });
  if (!existing) throw new Error('Engagement risk not found');

  const parsed = updateEngagementRiskSchema.parse(input);
  const data: Record<string, unknown> = {};

  if (parsed.rcmObjectiveId !== undefined) data.rcm_objective_id = parsed.rcmObjectiveId ?? null;
  if (parsed.riskDescription !== undefined) data.risk_description = parsed.riskDescription;
  if (parsed.riskRating !== undefined) data.risk_rating = parsed.riskRating ?? null;
  if (parsed.riskCategory !== undefined) data.risk_category = parsed.riskCategory ?? null;
  if (parsed.likelihood !== undefined) data.likelihood = parsed.likelihood ?? null;
  if (parsed.impact !== undefined) data.impact = parsed.impact ?? null;
  if (parsed.workpaperContent !== undefined) data.workpaper_content = parsed.workpaperContent ?? null;
  if (parsed.sortOrder !== undefined) data.sort_order = parsed.sortOrder;

  const risk = await prisma.engagementRisk.update({
    where: { id: riskId },
    data,
    include: {
      rcm_objective: { select: { id: true, title: true } },
      control_refs: {
        include: { control: true },
        orderBy: { control: { sort_order: 'asc' } },
      },
    },
  });

  await logAudit({
    userId, userName, action: 'update',
    entityType: 'engagement_risk', entityId: riskId,
  });

  return mapEngagementRisk(risk);
}

export async function deleteEngagementRisk(
  riskId: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementRisk.findUnique({ where: { id: riskId } });
  if (!existing) throw new Error('Engagement risk not found');

  await prisma.engagementRisk.delete({ where: { id: riskId } });

  await logAudit({
    userId, userName, action: 'delete',
    entityType: 'engagement_risk', entityId: riskId,
  });

  return { id: riskId };
}

// =============================================================================
// ENGAGEMENT CONTROL CRUD (engagement-level, M:N with risks)
// =============================================================================

export async function createEngagementControl(
  engagementId: string,
  input: unknown,
  userId: string,
  userName: string,
  /** Optional: link to a risk immediately after creation */
  linkToRiskId?: string,
) {
  await verifyEngagement(engagementId);
  const parsed = createEngagementControlSchema.parse(input);

  const maxOrder = await prisma.engagementControl.aggregate({
    where: { engagement_id: engagementId },
    _max: { sort_order: true },
  });

  const control = await prisma.engagementControl.create({
    data: {
      engagement_id: engagementId,
      description: parsed.description,
      effectiveness: parsed.effectiveness ?? null,
      control_type: parsed.controlType ?? null,
      control_nature: parsed.controlNature ?? null,
      frequency: parsed.frequency ?? null,
      workpaper_content: parsed.workpaperContent ?? undefined,
      sort_order: parsed.sortOrder ?? (maxOrder._max.sort_order ?? 0) + 1,
    },
  });

  // Link to risk if specified
  if (linkToRiskId) {
    await prisma.riskControlRef.create({
      data: { risk_id: linkToRiskId, control_id: control.id },
    });
  }

  await logAudit({
    userId, userName, action: 'create',
    entityType: 'engagement_control', entityId: control.id,
  });

  return mapEngagementControl(control);
}

export async function updateEngagementControl(
  controlId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementControl.findUnique({ where: { id: controlId } });
  if (!existing) throw new Error('Engagement control not found');

  const parsed = updateEngagementControlSchema.parse(input);
  const data: Record<string, unknown> = {};

  if (parsed.description !== undefined) data.description = parsed.description;
  if (parsed.effectiveness !== undefined) data.effectiveness = parsed.effectiveness ?? null;
  if (parsed.controlType !== undefined) data.control_type = parsed.controlType ?? null;
  if (parsed.controlNature !== undefined) data.control_nature = parsed.controlNature ?? null;
  if (parsed.frequency !== undefined) data.frequency = parsed.frequency ?? null;
  if (parsed.workpaperContent !== undefined) data.workpaper_content = parsed.workpaperContent ?? null;
  if (parsed.sortOrder !== undefined) data.sort_order = parsed.sortOrder;

  const control = await prisma.engagementControl.update({
    where: { id: controlId },
    data,
  });

  await logAudit({
    userId, userName, action: 'update',
    entityType: 'engagement_control', entityId: controlId,
  });

  return mapEngagementControl(control);
}

export async function deleteEngagementControl(
  controlId: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementControl.findUnique({ where: { id: controlId } });
  if (!existing) throw new Error('Engagement control not found');

  await prisma.engagementControl.delete({ where: { id: controlId } });

  await logAudit({
    userId, userName, action: 'delete',
    entityType: 'engagement_control', entityId: controlId,
  });

  return { id: controlId };
}

// =============================================================================
// RISK ↔ CONTROL LINK/UNLINK (M:N)
// =============================================================================

export async function linkControlToRisk(
  riskId: string,
  controlId: string,
  userId: string,
  userName: string,
) {
  // Verify both exist
  const risk = await prisma.engagementRisk.findUnique({ where: { id: riskId } });
  if (!risk) throw new Error('Engagement risk not found');
  const control = await prisma.engagementControl.findUnique({ where: { id: controlId } });
  if (!control) throw new Error('Engagement control not found');

  // Upsert to avoid duplicate key errors
  await prisma.riskControlRef.upsert({
    where: { risk_id_control_id: { risk_id: riskId, control_id: controlId } },
    create: { risk_id: riskId, control_id: controlId },
    update: {},
  });

  await logAudit({
    userId, userName, action: 'create',
    entityType: 'risk_control_ref', entityId: `${riskId}:${controlId}`,
  });

  return { riskId, controlId };
}

export async function unlinkControlFromRisk(
  riskId: string,
  controlId: string,
  userId: string,
  userName: string,
) {
  await prisma.riskControlRef.deleteMany({
    where: { risk_id: riskId, control_id: controlId },
  });

  await logAudit({
    userId, userName, action: 'delete',
    entityType: 'risk_control_ref', entityId: `${riskId}:${controlId}`,
  });

  return { riskId, controlId };
}

// =============================================================================
// RCM OBJECTIVE CRUD (detached copy for RCM)
// =============================================================================

const rcmObjectiveInclude = {
  risks: {
    include: {
      control_refs: {
        include: { control: true },
        orderBy: { control: { sort_order: 'asc' as const } },
      },
    },
    orderBy: { sort_order: 'asc' as const },
  },
} as const;

export async function createRcmObjective(
  engagementId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  await verifyEngagement(engagementId);
  const parsed = createRcmObjectiveSchema.parse(input);

  const maxOrder = await prisma.engagementRcmObjective.aggregate({
    where: { engagement_id: engagementId },
    _max: { sort_order: true },
  });

  const obj = await prisma.engagementRcmObjective.create({
    data: {
      engagement_id: engagementId,
      audit_objective_id: parsed.auditObjectiveId ?? null,
      title: parsed.title,
      description: parsed.description ?? null,
      sort_order: parsed.sortOrder ?? (maxOrder._max.sort_order ?? 0) + 1,
    },
    include: rcmObjectiveInclude,
  });

  await logAudit({
    userId, userName, action: 'create',
    entityType: 'rcm_objective', entityId: obj.id,
  });

  return mapRcmObjective(obj);
}

export async function updateRcmObjective(
  objectiveId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementRcmObjective.findUnique({ where: { id: objectiveId } });
  if (!existing) throw new Error('RCM objective not found');

  const parsed = updateRcmObjectiveSchema.parse(input);
  const data: Record<string, unknown> = {};

  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.description !== undefined) data.description = parsed.description ?? null;
  if (parsed.sortOrder !== undefined) data.sort_order = parsed.sortOrder;

  const obj = await prisma.engagementRcmObjective.update({
    where: { id: objectiveId },
    data,
    include: rcmObjectiveInclude,
  });

  await logAudit({
    userId, userName, action: 'update',
    entityType: 'rcm_objective', entityId: objectiveId,
  });

  return mapRcmObjective(obj);
}

export async function deleteRcmObjective(
  objectiveId: string,
  userId: string,
  userName: string,
) {
  const existing = await prisma.engagementRcmObjective.findUnique({ where: { id: objectiveId } });
  if (!existing) throw new Error('RCM objective not found');

  await prisma.engagementRcmObjective.delete({ where: { id: objectiveId } });

  await logAudit({
    userId, userName, action: 'delete',
    entityType: 'rcm_objective', entityId: objectiveId,
  });

  return { id: objectiveId };
}

/**
 * Sync RCM objectives from audit objectives.
 * Creates RCM objectives for any audit objectives that don't have a corresponding one yet.
 */
export async function syncRcmObjectives(
  engagementId: string,
  userId: string,
  userName: string,
) {
  await verifyEngagement(engagementId);

  const auditObjs = await prisma.auditObjective.findMany({
    where: { engagement_id: engagementId },
    orderBy: { sort_order: 'asc' },
  });

  const existingRcmObjs = await prisma.engagementRcmObjective.findMany({
    where: { engagement_id: engagementId },
    select: { audit_objective_id: true },
  });

  const linkedAoIds = new Set(
    existingRcmObjs.map((r) => r.audit_objective_id).filter(Boolean),
  );

  const maxOrder = await prisma.engagementRcmObjective.aggregate({
    where: { engagement_id: engagementId },
    _max: { sort_order: true },
  });
  let nextOrder = (maxOrder._max.sort_order ?? 0) + 1;

  const created: string[] = [];
  for (const ao of auditObjs) {
    if (!linkedAoIds.has(ao.id)) {
      const rcmObj = await prisma.engagementRcmObjective.create({
        data: {
          engagement_id: engagementId,
          audit_objective_id: ao.id,
          title: ao.title,
          description: ao.description,
          sort_order: nextOrder++,
        },
      });
      created.push(rcmObj.id);
    }
  }

  if (created.length > 0) {
    await logAudit({
      userId, userName, action: 'create',
      entityType: 'rcm_objective', entityId: created.join(','),
    });
  }

  return { synced: created.length };
}

// =============================================================================
// REORDER (generic batch sort_order update)
// =============================================================================

const reorderSchema = z.object({
  entityType: z.enum([
    'section', 'objective', 'procedure',
    'audit_objective', 'rcm_objective', 'risk', 'control',
  ]),
  items: z.array(z.object({ id: z.string(), sortOrder: z.number().int() })).min(1),
});

const REORDER_MODEL_MAP: Record<string, string> = {
  section: 'engagementSection',
  objective: 'engagementObjective',
  procedure: 'engagementProcedure',
  audit_objective: 'auditObjective',
  rcm_objective: 'engagementRcmObjective',
  risk: 'engagementRisk',
  control: 'engagementControl',
};

export async function reorderItems(
  input: unknown,
  userId: string,
  userName: string,
) {
  const { entityType, items } = reorderSchema.parse(input);
  const modelName = REORDER_MODEL_MAP[entityType];

  await prisma.$transaction(
    items.map((item) =>
      (prisma as any)[modelName].update({
        where: { id: item.id },
        data: { sort_order: item.sortOrder },
      }),
    ),
  );

  await logAudit({
    userId, userName, action: 'reorder',
    entityType, entityId: items.map((i) => i.id).join(','),
  });

  return { reordered: items.length };
}

// =============================================================================
// BATCH ACTIONS (delete / duplicate)
// =============================================================================

export type BatchEntityType =
  | 'section' | 'objective' | 'procedure'
  | 'rcm_objective' | 'risk' | 'control';

const batchSchema = z.object({
  action: z.enum(['delete', 'duplicate']),
  entityType: z.enum(['section', 'objective', 'procedure', 'rcm_objective', 'risk', 'control']),
  ids: z.array(z.string()).min(1),
});

const BATCH_MODEL_MAP: Record<string, string> = {
  section: 'engagementSection',
  objective: 'engagementObjective',
  procedure: 'engagementProcedure',
  rcm_objective: 'engagementRcmObjective',
  risk: 'engagementRisk',
  control: 'engagementControl',
};

const BATCH_ENTITY_TYPE_MAP: Record<string, string> = {
  section: 'engagement_section',
  objective: 'engagement_objective',
  procedure: 'engagement_procedure',
  rcm_objective: 'engagement_rcm_objective',
  risk: 'engagement_risk',
  control: 'engagement_control',
};

// Include maps for duplication (which nested relations to copy)
const DUPLICATE_INCLUDE: Record<string, object | undefined> = {
  section: {
    objectives: { include: { procedures: true } },
    procedures: true,
  },
  objective: { procedures: true },
  procedure: undefined,
  rcm_objective: { risks: { include: { controls: true } } },
  risk: { controls: true },
  control: undefined,
};

export async function batchAction(
  engagementId: string,
  input: unknown,
  userId: string,
  userName: string,
) {
  const { action, entityType, ids } = batchSchema.parse(input);

  if (action === 'delete') {
    return batchDelete(engagementId, entityType, ids, userId, userName);
  }
  return batchDuplicate(engagementId, entityType, ids, userId, userName);
}

async function batchDelete(
  engagementId: string,
  entityType: string,
  ids: string[],
  userId: string,
  userName: string,
) {
  const modelName = BATCH_MODEL_MAP[entityType];
  const auditType = BATCH_ENTITY_TYPE_MAP[entityType];

  // Prisma cascade handles children automatically
  await (prisma as any)[modelName].deleteMany({
    where: { id: { in: ids } },
  });

  // Audit log each deletion
  await Promise.all(
    ids.map((id) =>
      logAudit({ userId, userName, action: 'delete', entityType: auditType, entityId: id }),
    ),
  );

  return { deleted: ids.length };
}

async function batchDuplicate(
  engagementId: string,
  entityType: string,
  ids: string[],
  userId: string,
  userName: string,
) {
  const modelName = BATCH_MODEL_MAP[entityType];
  const auditType = BATCH_ENTITY_TYPE_MAP[entityType];
  const include = DUPLICATE_INCLUDE[entityType];

  // Fetch originals with nested relations
  const originals = await (prisma as any)[modelName].findMany({
    where: { id: { in: ids } },
    ...(include ? { include } : {}),
  });

  // Find max sort_order for positioning duplicates
  const maxResult = await (prisma as any)[modelName].aggregate({
    where: getParentFilter(entityType, originals[0]),
    _max: { sort_order: true },
  });
  let nextOrder = (maxResult._max?.sort_order ?? 0) + 1;

  const created: string[] = [];

  for (const orig of originals) {
    const newId = await duplicateEntity(
      entityType, modelName, orig, engagementId, nextOrder++,
    );
    created.push(newId);

    await logAudit({
      userId, userName, action: 'create', entityType: auditType, entityId: newId,
      changes: { duplicated_from: orig.id },
    });
  }

  return { duplicated: created.length };
}

function getParentFilter(entityType: string, sample: any): object {
  switch (entityType) {
    case 'section': return { engagement_id: sample.engagement_id };
    case 'objective': return sample.section_id
      ? { section_id: sample.section_id }
      : { engagement_id: sample.engagement_id, section_id: null };
    case 'procedure': return sample.objective_id
      ? { objective_id: sample.objective_id }
      : sample.section_id
        ? { section_id: sample.section_id }
        : { engagement_id: sample.engagement_id };
    case 'rcm_objective': return { engagement_id: sample.engagement_id };
    case 'risk': return { rcm_objective_id: sample.rcm_objective_id };
    case 'control': return { risk_id: sample.risk_id };
    default: return {};
  }
}

async function duplicateEntity(
  entityType: string,
  modelName: string,
  orig: any,
  engagementId: string,
  sortOrder: number,
): Promise<string> {
  // Strip IDs and timestamps for the copy
  const { id, created_at, updated_at, ...rest } = orig;

  switch (entityType) {
    case 'section': {
      const { objectives, procedures, ...sectionData } = rest;
      const dup = await prisma.engagementSection.create({
        data: { ...sectionData, sort_order: sortOrder, title: `Copy - ${sectionData.title}` },
      });
      // Duplicate nested objectives + their procedures
      for (const obj of (objectives || [])) {
        const { id: _oid, created_at: _oc, updated_at: _ou, procedures: procs, section_id: _sid, ...objData } = obj;
        const dupObj = await prisma.engagementObjective.create({
          data: { ...objData, section_id: dup.id, sort_order: obj.sort_order },
        });
        for (const proc of (procs || [])) {
          const { id: _pid, created_at: _pc, updated_at: _pu, findings: _f, section_id: _psid, objective_id: _poid, ...procData } = proc;
          await prisma.engagementProcedure.create({
            data: { ...procData, section_id: dup.id, objective_id: dupObj.id, sort_order: proc.sort_order },
          });
        }
      }
      // Duplicate section-level procedures (no objective)
      for (const proc of (procedures || [])) {
        const { id: _pid, created_at: _pc, updated_at: _pu, findings: _f, section_id: _psid, objective_id: _poid, ...procData } = proc;
        await prisma.engagementProcedure.create({
          data: { ...procData, section_id: dup.id, objective_id: null, sort_order: proc.sort_order },
        });
      }
      return dup.id;
    }
    case 'objective': {
      const { procedures, section_id, ...objData } = rest;
      const dup = await prisma.engagementObjective.create({
        data: { ...objData, section_id, sort_order: sortOrder, title: `Copy - ${objData.title}` },
      });
      for (const proc of (procedures || [])) {
        const { id: _pid, created_at: _pc, updated_at: _pu, findings: _f, section_id: _psid, objective_id: _poid, ...procData } = proc;
        await prisma.engagementProcedure.create({
          data: { ...procData, section_id: dup.section_id, objective_id: dup.id, sort_order: proc.sort_order },
        });
      }
      return dup.id;
    }
    case 'procedure': {
      const { findings, ...procData } = rest;
      const dup = await prisma.engagementProcedure.create({
        data: { ...procData, sort_order: sortOrder, title: `Copy - ${procData.title}` },
      });
      return dup.id;
    }
    case 'rcm_objective': {
      const { risks, ...objData } = rest;
      const dup = await prisma.engagementRcmObjective.create({
        data: { ...objData, sort_order: sortOrder, title: `Copy - ${objData.title}` },
      });
      for (const risk of (risks || [])) {
        const { id: _rid, created_at: _rc, updated_at: _ru, controls, rcm_objective_id: _roid, ...riskData } = risk;
        const dupRisk = await prisma.engagementRisk.create({
          data: { ...riskData, rcm_objective_id: dup.id, sort_order: risk.sort_order },
        });
        for (const ctrl of (controls || [])) {
          const { id: _cid, created_at: _cc, updated_at: _cu, risk_id: _crid, ...ctrlData } = ctrl;
          await prisma.engagementControl.create({
            data: { ...ctrlData, risk_id: dupRisk.id, sort_order: ctrl.sort_order },
          });
        }
      }
      return dup.id;
    }
    case 'risk': {
      const { controls, ...riskData } = rest;
      const dup = await prisma.engagementRisk.create({
        data: { ...riskData, sort_order: sortOrder, risk_description: `Copy - ${riskData.risk_description}` },
      });
      for (const ctrl of (controls || [])) {
        const { id: _cid, created_at: _cc, updated_at: _cu, risk_id: _crid, ...ctrlData } = ctrl;
        await prisma.engagementControl.create({
          data: { ...ctrlData, risk_id: dup.id, sort_order: ctrl.sort_order },
        });
      }
      return dup.id;
    }
    case 'control': {
      const dup = await prisma.engagementControl.create({
        data: { ...rest, sort_order: sortOrder, description: `Copy - ${rest.description}` },
      });
      return dup.id;
    }
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}

// =============================================================================
// SYNC RCM TO WORK PROGRAM
// =============================================================================

/**
 * Sync RCM objectives and controls to Work Program.
 * Creates WP objectives from RCM objectives and procedures from RCM controls.
 */
export async function syncRcmToWorkProgram(
  engagementId: string,
  userId: string,
  userName: string,
) {
  await verifyEngagement(engagementId);

  // Fetch RCM objectives with risks and linked controls (M:N)
  const rcmObjectives = await prisma.engagementRcmObjective.findMany({
    where: { engagement_id: engagementId },
    include: {
      risks: {
        include: {
          control_refs: { include: { control: true } },
        },
        orderBy: { sort_order: 'asc' },
      },
    },
    orderBy: { sort_order: 'asc' },
  });

  let createdObjectives = 0;
  let createdProcedures = 0;
  const objectiveIds: string[] = [];
  const procedureIds: string[] = [];

  // Get max sort order for objectives
  const maxObjOrder = await prisma.engagementObjective.aggregate({
    where: { engagement_id: engagementId, section_id: null },
    _max: { sort_order: true },
  });
  let nextObjOrder = (maxObjOrder._max.sort_order ?? 0) + 1;

  // Process each RCM objective
  for (const rcmObj of rcmObjectives) {
    // Create WP Objective (standalone) from RCM Objective
    const wpObjective = await prisma.engagementObjective.create({
      data: {
        engagement_id: engagementId,
        title: rcmObj.title,
        description: rcmObj.description,
        status: 'not_started',
        added_from: 'manual',
        sort_order: nextObjOrder++,
      },
    });
    createdObjectives++;
    objectiveIds.push(wpObjective.id);

    // Get max sort order for procedures under this objective
    const maxProcOrder = await prisma.engagementProcedure.aggregate({
      where: { engagement_id: engagementId, objective_id: wpObjective.id },
      _max: { sort_order: true },
    });
    let nextProcOrder = (maxProcOrder._max.sort_order ?? 0) + 1;

    // Process each control under this objective's risks (1 procedure per control)
    for (const risk of rcmObj.risks) {
      const controls = risk.control_refs.map((ref: { control: any }) => ref.control);
      for (const control of controls) {
        // Create WP Procedure from RCM Control
        const procedure = await prisma.engagementProcedure.create({
          data: {
            engagement_id: engagementId,
            objective_id: wpObjective.id,
            title: `Kiểm thử ${control.description}`,
            status: 'not_started',
            added_from: 'manual',
            sort_order: nextProcOrder++,
          },
        });
        procedureIds.push(procedure.id);
        createdProcedures++;

        // Link procedure to control
        await prisma.procedureControlRef.create({
          data: { procedure_id: procedure.id, control_id: control.id },
        });

        // Link procedure to parent risk for traceability
        await prisma.procedureRiskRef.create({
          data: { procedure_id: procedure.id, risk_id: risk.id },
        });
      }
    }
  }

  // Audit log for objectives
  if (objectiveIds.length > 0) {
    await logAudit({
      userId,
      userName,
      action: 'create',
      entityType: 'engagement_objective',
      entityId: objectiveIds.join(','),
    });
  }

  // Audit log for procedures
  if (procedureIds.length > 0) {
    await logAudit({
      userId,
      userName,
      action: 'create',
      entityType: 'engagement_procedure',
      entityId: procedureIds.join(','),
    });
  }

  return {
    createdObjectives,
    createdProcedures,
  };
}

// =============================================================================
// SYNC PLANNING → EXECUTION
// =============================================================================

/**
 * Clone all planning-phase sections, objectives, and procedures into
 * execution-phase copies. Each execution item gets `planning_ref_id`
 * pointing back to the original planning item.
 * Skips items that already have an execution clone (idempotent).
 */
export async function syncPlanningToExecution(
  engagementId: string,
  userId: string,
  userName: string,
) {
  await verifyEngagement(engagementId);

  let createdSections = 0;
  let createdObjectives = 0;
  let createdProcedures = 0;

  // 1. Clone sections (planning → execution)
  const planningSections = await prisma.engagementSection.findMany({
    where: { engagement_id: engagementId, phase: 'planning' },
    include: {
      objectives: {
        include: { procedures: true },
        orderBy: { sort_order: 'asc' },
      },
      procedures: {
        where: { objective_id: null },
        orderBy: { sort_order: 'asc' },
      },
    },
    orderBy: { sort_order: 'asc' },
  });

  for (const sec of planningSections) {
    // Check if execution clone already exists
    const existing = await prisma.engagementSection.findFirst({
      where: { engagement_id: engagementId, planning_ref_id: sec.id, phase: 'execution' },
    });
    if (existing) continue;

    const execSec = await prisma.engagementSection.create({
      data: {
        engagement_id: engagementId,
        title: sec.title,
        description: sec.description,
        status: 'not_started',
        added_from: 'planning',
        phase: 'execution',
        planning_ref_id: sec.id,
        source: 'planned',
        sort_order: sec.sort_order,
      },
    });
    createdSections++;

    // Clone objectives under section
    for (const obj of sec.objectives) {
      const execObj = await prisma.engagementObjective.create({
        data: {
          engagement_id: engagementId,
          section_id: execSec.id,
          title: obj.title,
          description: obj.description,
          status: 'not_started',
          added_from: 'planning',
          phase: 'execution',
          planning_ref_id: obj.id,
          source: 'planned',
          sort_order: obj.sort_order,
        },
      });
      createdObjectives++;

      // Clone procedures under objective
      for (const proc of obj.procedures) {
        await prisma.engagementProcedure.create({
          data: {
            engagement_id: engagementId,
            section_id: execSec.id,
            objective_id: execObj.id,
            title: proc.title,
            description: proc.description,
            procedures: proc.procedures,
            procedure_type: proc.procedure_type,
            procedure_category: proc.procedure_category,
            status: 'not_started',
            added_from: 'planning',
            phase: 'execution',
            planning_ref_id: proc.id,
            source: 'planned',
            sort_order: proc.sort_order,
            priority: proc.priority,
          },
        });
        createdProcedures++;
      }
    }

    // Clone direct procedures under section (no objective)
    for (const proc of sec.procedures) {
      await prisma.engagementProcedure.create({
        data: {
          engagement_id: engagementId,
          section_id: execSec.id,
          title: proc.title,
          description: proc.description,
          procedures: proc.procedures,
          procedure_type: proc.procedure_type,
          procedure_category: proc.procedure_category,
          status: 'not_started',
          added_from: 'planning',
          phase: 'execution',
          planning_ref_id: proc.id,
          source: 'planned',
          sort_order: proc.sort_order,
          priority: proc.priority,
        },
      });
      createdProcedures++;
    }
  }

  // 2. Clone standalone objectives (no section)
  const planningObjectives = await prisma.engagementObjective.findMany({
    where: { engagement_id: engagementId, section_id: null, phase: 'planning' },
    include: { procedures: { orderBy: { sort_order: 'asc' } } },
    orderBy: { sort_order: 'asc' },
  });

  for (const obj of planningObjectives) {
    const existing = await prisma.engagementObjective.findFirst({
      where: { engagement_id: engagementId, planning_ref_id: obj.id, phase: 'execution' },
    });
    if (existing) continue;

    const execObj = await prisma.engagementObjective.create({
      data: {
        engagement_id: engagementId,
        title: obj.title,
        description: obj.description,
        status: 'not_started',
        added_from: 'planning',
        phase: 'execution',
        planning_ref_id: obj.id,
        source: 'planned',
        sort_order: obj.sort_order,
      },
    });
    createdObjectives++;

    for (const proc of obj.procedures) {
      await prisma.engagementProcedure.create({
        data: {
          engagement_id: engagementId,
          objective_id: execObj.id,
          title: proc.title,
          description: proc.description,
          procedures: proc.procedures,
          procedure_type: proc.procedure_type,
          procedure_category: proc.procedure_category,
          status: 'not_started',
          added_from: 'planning',
          phase: 'execution',
          planning_ref_id: proc.id,
          source: 'planned',
          sort_order: proc.sort_order,
          priority: proc.priority,
        },
      });
      createdProcedures++;
    }
  }

  // 3. Clone standalone procedures (no section, no objective)
  const planningStandaloneProcedures = await prisma.engagementProcedure.findMany({
    where: { engagement_id: engagementId, section_id: null, objective_id: null, added_from: 'planning' },
    orderBy: { sort_order: 'asc' },
  });

  for (const proc of planningStandaloneProcedures) {
    const existing = await prisma.engagementProcedure.findFirst({
      where: { engagement_id: engagementId, planning_ref_id: proc.id, phase: 'execution' },
    });
    if (existing) continue;

    await prisma.engagementProcedure.create({
      data: {
        engagement_id: engagementId,
        section_id: null,
        objective_id: null,
        title: proc.title,
        description: proc.description,
        procedures: proc.procedures,
        procedure_type: proc.procedure_type,
        procedure_category: proc.procedure_category,
        status: 'not_started',
        added_from: 'planning',
        phase: 'execution',
        planning_ref_id: proc.id,
        source: 'planned',
        sort_order: proc.sort_order,
        priority: proc.priority,
      },
    });
    createdProcedures++;
  }

  await logAudit({
    userId,
    userName,
    action: 'sync_planning_to_execution',
    entityType: 'engagement',
    entityId: engagementId,
    changes: {
      createdSections: { old: 0, new: createdSections },
      createdObjectives: { old: 0, new: createdObjectives },
      createdProcedures: { old: 0, new: createdProcedures },
    },
  });

  return { createdSections, createdObjectives, createdProcedures };
}

// =============================================================================
// ENGAGEMENT MEMBERS
// =============================================================================

const MEMBER_ROLES = ['lead', 'member', 'reviewer', 'observer'] as const;

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(MEMBER_ROLES).optional().default('member'),
});

export const updateMemberSchema = z.object({
  role: z.enum(MEMBER_ROLES),
});

export async function getEngagementMembers(engagementId: string) {
  const members = await prisma.engagementMember.findMany({
    where: { engagement_id: engagementId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          title: true,
          avatar_url: true,
          role: true,
        },
      },
    },
    orderBy: { joined_at: 'asc' },
  });

  return members.map((m) => ({
    userId: m.user_id,
    role: m.role,
    joinedAt: m.joined_at.toISOString(),
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      title: m.user.title,
      avatarUrl: m.user.avatar_url,
      role: m.user.role,
    },
  }));
}

export async function addEngagementMember(
  engagementId: string,
  data: z.infer<typeof addMemberSchema>,
  userId: string,
  userName: string,
) {
  const parsed = addMemberSchema.parse(data);

  // Check engagement exists
  const engagement = await prisma.engagement.findUnique({ where: { id: engagementId } });
  if (!engagement) throw new Error('Engagement not found');

  // Check user exists
  const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
  if (!user) throw new Error('User not found');

  // Upsert — if already member, update role
  const member = await prisma.engagementMember.upsert({
    where: {
      engagement_id_user_id: {
        engagement_id: engagementId,
        user_id: parsed.userId,
      },
    },
    create: {
      engagement_id: engagementId,
      user_id: parsed.userId,
      role: parsed.role,
    },
    update: {
      role: parsed.role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          title: true,
          avatar_url: true,
          role: true,
        },
      },
    },
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'engagement_member',
    entityId: `${engagementId}:${parsed.userId}`,
  });

  return {
    userId: member.user_id,
    role: member.role,
    joinedAt: member.joined_at.toISOString(),
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      title: member.user.title,
      avatarUrl: member.user.avatar_url,
      role: member.user.role,
    },
  };
}

export async function updateEngagementMember(
  engagementId: string,
  memberId: string,
  data: z.infer<typeof updateMemberSchema>,
  userId: string,
  userName: string,
) {
  const parsed = updateMemberSchema.parse(data);

  const member = await prisma.engagementMember.update({
    where: {
      engagement_id_user_id: {
        engagement_id: engagementId,
        user_id: memberId,
      },
    },
    data: { role: parsed.role },
  });

  await logAudit({
    userId,
    userName,
    action: 'update',
    entityType: 'engagement_member',
    entityId: `${engagementId}:${memberId}`,
    changes: { role: { old: null, new: parsed.role } },
  });

  return member;
}

export async function removeEngagementMember(
  engagementId: string,
  memberId: string,
  userId: string,
  userName: string,
) {
  await prisma.engagementMember.delete({
    where: {
      engagement_id_user_id: {
        engagement_id: engagementId,
        user_id: memberId,
      },
    },
  });

  await logAudit({
    userId,
    userName,
    action: 'delete',
    entityType: 'engagement_member',
    entityId: `${engagementId}:${memberId}`,
  });

  return { success: true };
}

// =============================================================================
// PROCEDURE ASSIGNEE (performed_by / reviewed_by)
// =============================================================================

export async function updateProcedureAssignee(
  procedureId: string,
  field: 'performed_by' | 'reviewed_by',
  assigneeId: string | null,
  userId: string,
  userName: string,
) {
  const procedure = await prisma.engagementProcedure.findUnique({
    where: { id: procedureId },
    select: { performed_by: true, reviewed_by: true },
  });
  if (!procedure) throw new Error('Procedure not found');

  const oldValue = procedure[field];
  const dateField = field === 'performed_by' ? 'performed_at' : 'reviewed_at';

  const updated = await prisma.engagementProcedure.update({
    where: { id: procedureId },
    data: {
      [field]: assigneeId,
      [dateField]: assigneeId ? new Date() : null,
    },
  });

  await logAudit({
    userId,
    userName,
    action: 'update',
    entityType: 'engagement_procedure',
    entityId: procedureId,
    changes: { [field]: { old: oldValue, new: assigneeId } },
  });

  return updated;
}

// =============================================================================
// WP ASSIGNMENTS (multi-assignee for sections, objectives, procedures)
// =============================================================================

const WP_ENTITY_TYPES = ['section', 'objective', 'procedure'] as const;

export async function getWpAssignments(engagementId: string) {
  return prisma.wpAssignment.findMany({
    where: { engagement_id: engagementId },
    include: {
      user: {
        select: { id: true, name: true, email: true, title: true, avatar_url: true },
      },
    },
    orderBy: { created_at: 'asc' },
  });
}

export async function addWpAssignment(
  engagementId: string,
  entityType: string,
  entityId: string,
  userIds: string[],
  userId: string,
  userName: string,
) {
  if (!WP_ENTITY_TYPES.includes(entityType as typeof WP_ENTITY_TYPES[number])) {
    throw new Error('Invalid entity type');
  }

  const created = await prisma.wpAssignment.createMany({
    data: userIds.map((uid) => ({
      engagement_id: engagementId,
      user_id: uid,
      entity_type: entityType,
      entity_id: entityId,
    })),
    skipDuplicates: true,
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'wp_assignment',
    entityId: entityId,
    changes: { assignees: { old: null, new: userIds } },
  });

  return created;
}

export async function removeWpAssignment(
  engagementId: string,
  entityType: string,
  entityId: string,
  targetUserId: string,
  userId: string,
  userName: string,
) {
  await prisma.wpAssignment.deleteMany({
    where: {
      engagement_id: engagementId,
      entity_type: entityType,
      entity_id: entityId,
      user_id: targetUserId,
    },
  });

  await logAudit({
    userId,
    userName,
    action: 'delete',
    entityType: 'wp_assignment',
    entityId: entityId,
    changes: { assignee: { old: targetUserId, new: null } },
  });
}

export async function bulkAssignChildren(
  engagementId: string,
  parentType: 'section' | 'objective',
  parentId: string,
  userIds: string[],
  userId: string,
  userName: string,
) {
  // Find all child entity IDs
  const childIds: { type: string; id: string }[] = [];

  if (parentType === 'section') {
    const section = await prisma.engagementSection.findUnique({
      where: { id: parentId },
      include: {
        objectives: { select: { id: true, procedures: { select: { id: true } } } },
        procedures: { select: { id: true } },
      },
    });
    if (section) {
      for (const obj of section.objectives) {
        childIds.push({ type: 'objective', id: obj.id });
        for (const proc of obj.procedures) {
          childIds.push({ type: 'procedure', id: proc.id });
        }
      }
      for (const proc of section.procedures) {
        childIds.push({ type: 'procedure', id: proc.id });
      }
    }
  } else {
    const objective = await prisma.engagementObjective.findUnique({
      where: { id: parentId },
      include: { procedures: { select: { id: true } } },
    });
    if (objective) {
      for (const proc of objective.procedures) {
        childIds.push({ type: 'procedure', id: proc.id });
      }
    }
  }

  if (childIds.length === 0) return { count: 0 };

  const data = childIds.flatMap((child) =>
    userIds.map((uid) => ({
      engagement_id: engagementId,
      user_id: uid,
      entity_type: child.type,
      entity_id: child.id,
    })),
  );

  const result = await prisma.wpAssignment.createMany({
    data,
    skipDuplicates: true,
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'wp_assignment',
    entityId: parentId,
    changes: { assignees: { old: null, new: userIds } },
  });

  return { count: result.count };
}

// =============================================================================
// WORKPAPER COMMENTS
// =============================================================================

const createThreadSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  threadType: z.enum(['comment', 'review_note']).optional().default('comment'),
  quote: z.string().nullable().optional(),
  contentAnchor: z.string().nullable().optional(),
  comment: z.string().min(1),
});

export async function getCommentThreads(entityType: string, entityId: string) {
  return prisma.wpCommentThread.findMany({
    where: { entity_type: entityType, entity_id: entityId },
    include: {
      creator: { select: { id: true, name: true, avatar_url: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatar_url: true } },
        },
        orderBy: { created_at: 'asc' },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function createCommentThread(
  data: z.infer<typeof createThreadSchema>,
  userId: string,
  userName: string,
) {
  const parsed = createThreadSchema.parse(data);

  const thread = await prisma.wpCommentThread.create({
    data: {
      entity_type: parsed.entityType,
      entity_id: parsed.entityId,
      thread_type: parsed.threadType,
      quote: parsed.quote ?? null,
      content_anchor: parsed.contentAnchor ?? null,
      created_by: userId,
      comments: {
        create: {
          content: parsed.comment,
          author_id: userId,
        },
      },
    },
    include: {
      creator: { select: { id: true, name: true, avatar_url: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatar_url: true } },
        },
        orderBy: { created_at: 'asc' },
      },
    },
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'wp_comment_thread',
    entityId: thread.id,
    changes: { thread: { old: null, new: { entityType: parsed.entityType, entityId: parsed.entityId, quote: parsed.quote } } },
  });

  return thread;
}

export async function addCommentToThread(
  threadId: string,
  content: string,
  userId: string,
  userName: string,
) {
  const comment = await prisma.wpComment.create({
    data: {
      thread_id: threadId,
      content,
      author_id: userId,
    },
    include: {
      author: { select: { id: true, name: true, avatar_url: true } },
    },
  });

  await logAudit({
    userId,
    userName,
    action: 'create',
    entityType: 'wp_comment',
    entityId: comment.id,
    changes: { comment: { old: null, new: { threadId, content } } },
  });

  return comment;
}

export async function updateThreadStatus(
  threadId: string,
  status: 'open' | 'resolved' | 'detached',
  userId: string,
  userName: string,
) {
  const existing = await prisma.wpCommentThread.findUniqueOrThrow({ where: { id: threadId } });

  const thread = await prisma.wpCommentThread.update({
    where: { id: threadId },
    data: { status },
    include: {
      creator: { select: { id: true, name: true, avatar_url: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatar_url: true } },
        },
        orderBy: { created_at: 'asc' },
      },
    },
  });

  await logAudit({
    userId,
    userName,
    action: 'update',
    entityType: 'wp_comment_thread',
    entityId: threadId,
    changes: { status: { old: existing.status, new: status } },
  });

  return thread;
}

export async function deleteComment(
  commentId: string,
  userId: string,
  userName: string,
) {
  const comment = await prisma.wpComment.findUniqueOrThrow({ where: { id: commentId } });

  await prisma.wpComment.delete({ where: { id: commentId } });

  await logAudit({
    userId,
    userName,
    action: 'delete',
    entityType: 'wp_comment',
    entityId: commentId,
    changes: { comment: { old: { threadId: comment.thread_id, content: comment.content }, new: null } },
  });
}

export async function deleteCommentThread(
  threadId: string,
  userId: string,
  userName: string,
) {
  await prisma.wpCommentThread.delete({ where: { id: threadId } });

  await logAudit({
    userId,
    userName,
    action: 'delete',
    entityType: 'wp_comment_thread',
    entityId: threadId,
    changes: { thread: { old: threadId, new: null } },
  });
}

// =============================================================================
// PROCEDURE CONTENT (Tiptap JSON)
// =============================================================================

export async function updateProcedureContent(
  procedureId: string,
  content: unknown,
  userId: string,
  userName: string,
) {
  const { saveWorkpaperContent } = await import('./workpaperContent');
  await saveWorkpaperContent('procedure', procedureId, content, userId, userName);
}
