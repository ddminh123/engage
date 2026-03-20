export interface PlannedAuditEntity {
  id: string;
  name: string;
  code: string | null;
  status: string;
  riskLevel: string | null;
  inherentRiskLevel: string | null;
  entityType: { id: string; name: string } | null;
  ownerUnits: { id: string; name: string }[];
}

export interface ContactRef {
  id: string;
  name: string;
  position: string | null;
}

export interface PlannedAudit {
  id: string;
  planId: string;
  entityId: string;
  title: string | null;
  objective: string | null;
  scope: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  priority: string | null;
  estimatedDays: number | null;
  notes: string | null;
  ownerUnits: { id: string; name: string }[];
  participatingUnits: { id: string; name: string }[];
  contactPoints: ContactRef[];
  auditeeReps: ContactRef[];
  createdAt: string;
  updatedAt: string;
  entity: PlannedAuditEntity | null;
}

export interface AuditPlan {
  id: string;
  title: string;
  description: string | null;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  createdBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  plannedAudits: PlannedAudit[];
  auditCount: number;
  completedCount: number;
}

export interface PlanSummary {
  id: string;
  title: string;
  description: string | null;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  createdBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  auditCount: number;
  completedCount: number;
}

export interface PlanInput {
  title: string;
  description?: string | null;
  periodType: string;
  periodStart: string;
  periodEnd: string;
}

export interface PlanUpdateInput extends Partial<PlanInput> {
  status?: string;
}

export interface PlannedAuditInput {
  entityId: string;
  title?: string | null;
  objective?: string | null;
  scope?: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  priority?: string | null;
  estimatedDays?: number | null;
  notes?: string | null;
  ownerUnitIds?: string[];
  participatingUnitIds?: string[];
  contactPointIds?: string[];
  auditeeRepIds?: string[];
}

export interface PlannedAuditUpdateInput extends Partial<PlannedAuditInput> {
  status?: string;
}
