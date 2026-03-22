import { API_ROUTES } from '@/constants';
import type {
  EngagementSummary,
  EngagementDetail,
  EngagementInput,
  EngagementUpdateInput,
  EngagementSection,
  EngagementProcedure,
  EngagementMember,
  WpAssignment,
  DraftFinding,
  SectionInput,
  SectionUpdateInput,
  ObjectiveInput,
  ObjectiveUpdateInput,
  ProcedureInput,
  ProcedureUpdateInput,
  FindingInput,
  FindingUpdateInput,
  EngagementObjective,
  AuditObjective,
  AuditObjectiveInput,
  AuditObjectiveUpdateInput,
  EngagementRisk,
  EngagementRiskInput,
  EngagementRiskUpdateInput,
  EngagementControl,
  EngagementControlInput,
  EngagementControlUpdateInput,
  RcmObjective,
  RcmObjectiveInput,
  RcmObjectiveUpdateInput,
} from './types';

interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) {
    const error = json as ApiError;
    throw new Error(error.error?.message || 'Request failed');
  }
  return (json as ApiResponse<T>).data;
}

// ── Engagement CRUD ──

export async function fetchEngagements(): Promise<EngagementSummary[]> {
  const response = await fetch(API_ROUTES.ENGAGEMENT);
  return handleResponse<EngagementSummary[]>(response);
}

export async function fetchEngagementById(id: string): Promise<EngagementDetail> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_BY_ID(id));
  return handleResponse<EngagementDetail>(response);
}

export async function createEngagementApi(data: EngagementInput): Promise<EngagementDetail> {
  const response = await fetch(API_ROUTES.ENGAGEMENT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementDetail>(response);
}

export async function updateEngagementApi(
  id: string,
  data: EngagementUpdateInput,
): Promise<EngagementDetail> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_BY_ID(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementDetail>(response);
}

export async function deleteEngagementApi(id: string): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_BY_ID(id), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

// ── Section CRUD ──

export async function createSectionApi(
  engagementId: string,
  data: SectionInput,
): Promise<EngagementSection> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_SECTIONS(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementSection>(response);
}

export async function updateSectionApi(
  engagementId: string,
  sectionId: string,
  data: SectionUpdateInput,
): Promise<EngagementSection> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_SECTION_BY_ID(engagementId, sectionId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementSection>(response);
}

export async function deleteSectionApi(
  engagementId: string,
  sectionId: string,
): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_SECTION_BY_ID(engagementId, sectionId), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

// ── Objective CRUD ──

export async function createObjectiveApi(
  engagementId: string,
  sectionId: string,
  data: ObjectiveInput,
): Promise<EngagementObjective> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_OBJECTIVES(engagementId, sectionId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementObjective>(response);
}

export async function createStandaloneObjectiveApi(
  engagementId: string,
  data: ObjectiveInput,
): Promise<EngagementObjective> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_STANDALONE_OBJECTIVES(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementObjective>(response);
}

export async function updateObjectiveApi(
  engagementId: string,
  objectiveId: string,
  data: ObjectiveUpdateInput,
): Promise<EngagementObjective> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_OBJECTIVE_BY_ID(engagementId, objectiveId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementObjective>(response);
}

export async function deleteObjectiveApi(engagementId: string, objectiveId: string): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_OBJECTIVE_BY_ID(engagementId, objectiveId), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

// ── Procedure CRUD ──

export async function createProcedureApi(
  engagementId: string,
  data: ProcedureInput,
): Promise<EngagementProcedure> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_PROCEDURES(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementProcedure>(response);
}

export async function updateProcedureApi(
  engagementId: string,
  procedureId: string,
  data: ProcedureUpdateInput,
): Promise<EngagementProcedure> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_PROCEDURE_BY_ID(engagementId, procedureId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementProcedure>(response);
}

export async function deleteProcedureApi(engagementId: string, procedureId: string): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_PROCEDURE_BY_ID(engagementId, procedureId), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

// ── Finding CRUD ──

export async function createFindingApi(
  engagementId: string,
  data: FindingInput,
): Promise<DraftFinding> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_FINDINGS(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<DraftFinding>(response);
}

export async function updateFindingApi(
  engagementId: string,
  findingId: string,
  data: FindingUpdateInput,
): Promise<DraftFinding> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_FINDING_BY_ID(engagementId, findingId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<DraftFinding>(response);
}

export async function deleteFindingApi(engagementId: string, findingId: string): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_FINDING_BY_ID(engagementId, findingId), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

// ── Audit Objective CRUD (Planning-level) ──

export async function createAuditObjectiveApi(
  engagementId: string,
  data: AuditObjectiveInput,
): Promise<AuditObjective> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_AUDIT_OBJECTIVES(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuditObjective>(response);
}

export async function updateAuditObjectiveApi(
  engagementId: string,
  objectiveId: string,
  data: AuditObjectiveUpdateInput,
): Promise<AuditObjective> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_AUDIT_OBJECTIVE_BY_ID(engagementId, objectiveId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuditObjective>(response);
}

export async function deleteAuditObjectiveApi(
  engagementId: string,
  objectiveId: string,
): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_AUDIT_OBJECTIVE_BY_ID(engagementId, objectiveId), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

// ── RCM Objective CRUD (detached from AuditObjective) ──

export async function createRcmObjectiveApi(
  engagementId: string,
  data: RcmObjectiveInput,
): Promise<RcmObjective> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_RCM_OBJECTIVES(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RcmObjective>(response);
}

export async function updateRcmObjectiveApi(
  engagementId: string,
  objectiveId: string,
  data: RcmObjectiveUpdateInput,
): Promise<RcmObjective> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_RCM_OBJECTIVE_BY_ID(engagementId, objectiveId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RcmObjective>(response);
}

export async function deleteRcmObjectiveApi(
  engagementId: string,
  objectiveId: string,
): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_RCM_OBJECTIVE_BY_ID(engagementId, objectiveId), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

export async function syncRcmObjectivesApi(
  engagementId: string,
): Promise<{ synced: number }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_RCM_OBJECTIVES(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sync: true }),
  });
  return handleResponse<{ synced: number }>(response);
}

export async function syncRcmToWorkProgramApi(
  engagementId: string,
): Promise<{ createdObjectives: number; createdProcedures: number }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_SYNC_RCM_TO_WP(engagementId), {
    method: 'POST',
  });
  return handleResponse<{ createdObjectives: number; createdProcedures: number }>(response);
}

// ── Engagement Risk CRUD (RACM light) ──

export async function createEngagementRiskApi(
  engagementId: string,
  data: EngagementRiskInput,
): Promise<EngagementRisk> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_RISKS(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementRisk>(response);
}

export async function updateEngagementRiskApi(
  engagementId: string,
  riskId: string,
  data: EngagementRiskUpdateInput,
): Promise<EngagementRisk> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_RISK_BY_ID(engagementId, riskId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementRisk>(response);
}

export async function deleteEngagementRiskApi(
  engagementId: string,
  riskId: string,
): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_RISK_BY_ID(engagementId, riskId), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

// ── Engagement Control CRUD (under a risk) ──

export async function createEngagementControlApi(
  engagementId: string,
  riskId: string,
  data: EngagementControlInput,
): Promise<EngagementControl> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_CONTROLS(engagementId, riskId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementControl>(response);
}

export async function updateEngagementControlApi(
  engagementId: string,
  riskId: string,
  controlId: string,
  data: EngagementControlUpdateInput,
): Promise<EngagementControl> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_CONTROL_BY_ID(engagementId, riskId, controlId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementControl>(response);
}

export async function deleteEngagementControlApi(
  engagementId: string,
  riskId: string,
  controlId: string,
): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_CONTROL_BY_ID(engagementId, riskId, controlId), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

// ── Reorder ──

export type ReorderEntityType =
  | 'section' | 'objective' | 'procedure'
  | 'audit_objective' | 'rcm_objective' | 'risk' | 'control';

// ── Batch Actions ──

export type BatchEntityType =
  | 'section' | 'objective' | 'procedure'
  | 'rcm_objective' | 'risk' | 'control';

export type BatchActionType = 'delete' | 'duplicate';

export async function batchActionApi(
  engagementId: string,
  action: BatchActionType,
  entityType: BatchEntityType,
  ids: string[],
): Promise<{ deleted?: number; duplicated?: number }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_BATCH(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, entityType, ids }),
  });
  return handleResponse<{ deleted?: number; duplicated?: number }>(response);
}

export async function reorderItemsApi(
  engagementId: string,
  entityType: ReorderEntityType,
  items: { id: string; sortOrder: number }[],
): Promise<{ reordered: number }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_REORDER(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entityType, items }),
  });
  return handleResponse<{ reordered: number }>(response);
}

// ── Engagement Members ──

export async function fetchEngagementMembersApi(
  engagementId: string,
): Promise<EngagementMember[]> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_MEMBERS(engagementId));
  return handleResponse<EngagementMember[]>(response);
}

export async function addEngagementMemberApi(
  engagementId: string,
  data: { userId: string; role?: string },
): Promise<EngagementMember> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_MEMBERS(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementMember>(response);
}

export async function updateEngagementMemberApi(
  engagementId: string,
  userId: string,
  data: { role: string },
): Promise<EngagementMember> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_MEMBER_BY_ID(engagementId, userId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementMember>(response);
}

export async function removeEngagementMemberApi(
  engagementId: string,
  userId: string,
): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_MEMBER_BY_ID(engagementId, userId), {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

// ── Procedure Assignee ──

export async function updateProcedureAssigneeApi(
  engagementId: string,
  procedureId: string,
  field: 'performed_by' | 'reviewed_by',
  assigneeId: string | null,
): Promise<void> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_PROCEDURE_ASSIGNEE(engagementId, procedureId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, assigneeId }),
  });
  return handleResponse<void>(response);
}

// ── WP Assignments (multi-assignee) ──

export async function fetchWpAssignments(engagementId: string): Promise<WpAssignment[]> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_WP_ASSIGNMENTS(engagementId));
  return handleResponse<WpAssignment[]>(response);
}

export async function addWpAssignmentApi(
  engagementId: string,
  data: { entityType: string; entityId: string; userIds: string[]; cascade?: boolean },
): Promise<WpAssignment[]> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_WP_ASSIGNMENTS(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<WpAssignment[]>(response);
}

export async function removeWpAssignmentApi(
  engagementId: string,
  data: { entityType: string; entityId: string; userId: string },
): Promise<WpAssignment[]> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_WP_ASSIGNMENTS(engagementId), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<WpAssignment[]>(response);
}
