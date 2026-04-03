import { API_ROUTES } from '@/constants';
import { ApiError } from '@/lib/api-error';
import type {
  EngagementSummary,
  EngagementDetail,
  EngagementInput,
  EngagementUpdateInput,
  EngagementSection,
  EngagementProcedure,
  EngagementMember,
  WpAssignment,
  WpCommentThread,
  WpComment,
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
  EntityVersionSummary,
  EntityVersionDetail,
  AvailableTransition,
  WpSignoff,
} from './types';

interface ApiResponse<T> {
  data: T;
}


async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) {
    const err = json as { error: { code: string; message: string } };
    throw new ApiError(response.status, err.error?.message || 'Request failed', err.error?.code);
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

export async function syncPlanningToExecutionApi(
  engagementId: string,
): Promise<{ createdSections: number; createdObjectives: number; createdProcedures: number }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_SYNC_PLANNING_TO_EXEC(engagementId), {
    method: 'POST',
  });
  return handleResponse<{ createdSections: number; createdObjectives: number; createdProcedures: number }>(response);
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

// ── Engagement Control CRUD (engagement-level, M:N with risks) ──

export async function createEngagementControlApi(
  engagementId: string,
  data: EngagementControlInput & { linkToRiskId?: string },
): Promise<EngagementControl> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_CONTROLS(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementControl>(response);
}

export async function updateEngagementControlApi(
  engagementId: string,
  controlId: string,
  data: EngagementControlUpdateInput,
): Promise<EngagementControl> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_CONTROL_BY_ID(engagementId, controlId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<EngagementControl>(response);
}

export async function deleteEngagementControlApi(
  engagementId: string,
  controlId: string,
): Promise<{ id: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_CONTROL_BY_ID(engagementId, controlId), {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(response);
}

// ── Risk ↔ Control Link/Unlink ──

export async function linkControlToRiskApi(
  engagementId: string,
  riskId: string,
  controlId: string,
): Promise<{ riskId: string; controlId: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_RISK_CONTROL_LINK(engagementId, riskId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ controlId }),
  });
  return handleResponse<{ riskId: string; controlId: string }>(response);
}

export async function unlinkControlFromRiskApi(
  engagementId: string,
  riskId: string,
  controlId: string,
): Promise<{ riskId: string; controlId: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_RISK_CONTROL_LINK(engagementId, riskId), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ controlId }),
  });
  return handleResponse<{ riskId: string; controlId: string }>(response);
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

// ── WP Signoffs (immutable sign-off records) ──

export async function fetchWpSignoffs(engagementId: string): Promise<WpSignoff[]> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_WP_SIGNOFFS(engagementId));
  return handleResponse<WpSignoff[]>(response);
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

// ── WP Comments ──

export async function fetchCommentThreads(
  engagementId: string,
  entityType: string,
  entityId: string,
): Promise<WpCommentThread[]> {
  const url = `${API_ROUTES.ENGAGEMENT_WP_COMMENTS(engagementId)}?entityType=${entityType}&entityId=${entityId}`;
  const response = await fetch(url);
  return handleResponse<WpCommentThread[]>(response);
}

export async function createCommentThreadApi(
  engagementId: string,
  data: { entityType: string; entityId: string; threadType?: 'comment' | 'review_note'; quote?: string | null; contentAnchor?: string | null; comment: string },
): Promise<WpCommentThread> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_WP_COMMENTS(engagementId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<WpCommentThread>(response);
}

export async function addCommentReplyApi(
  engagementId: string,
  threadId: string,
  content: string,
): Promise<WpComment> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_WP_COMMENT_THREAD(engagementId, threadId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return handleResponse<WpComment>(response);
}

export async function updateThreadStatusApi(
  engagementId: string,
  threadId: string,
  status: 'open' | 'resolved' | 'detached',
): Promise<{ id: string; status: string }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_WP_COMMENT_THREAD(engagementId, threadId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse<{ id: string; status: string }>(response);
}

export async function deleteCommentThreadApi(
  engagementId: string,
  threadId: string,
): Promise<void> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_WP_COMMENT_THREAD(engagementId, threadId), {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

// ── Procedure Content (Tiptap JSON) ──

export async function updateProcedureContentApi(
  engagementId: string,
  procedureId: string,
  content: unknown,
): Promise<void> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_PROCEDURE_BY_ID(engagementId, procedureId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return handleResponse<void>(response);
}

// ── Versioning ──

export async function publishProcedureApi(
  engagementId: string,
  procedureId: string,
  comment?: string,
): Promise<EntityVersionSummary> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_PROCEDURE_PUBLISH(engagementId, procedureId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment }),
  });
  return handleResponse<EntityVersionSummary>(response);
}

export async function fetchProcedureVersionsApi(
  engagementId: string,
  procedureId: string,
): Promise<EntityVersionSummary[]> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_PROCEDURE_VERSIONS(engagementId, procedureId));
  return handleResponse<EntityVersionSummary[]>(response);
}

export async function fetchProcedureVersionApi(
  engagementId: string,
  procedureId: string,
  version: number,
): Promise<EntityVersionDetail> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_PROCEDURE_VERSION_BY_NUM(engagementId, procedureId, version));
  return handleResponse<EntityVersionDetail>(response);
}

export async function restoreProcedureVersionApi(
  engagementId: string,
  procedureId: string,
  version: number,
): Promise<{ success: boolean; restoredVersion: number }> {
  const response = await fetch(API_ROUTES.ENGAGEMENT_PROCEDURE_VERSION_RESTORE(engagementId, procedureId, version), {
    method: 'POST',
  });
  return handleResponse<{ success: boolean; restoredVersion: number }>(response);
}

// ── Generic Workpaper Content ──

/**
 * Route resolver: given entityType + IDs, returns the correct content-save URL.
 * Each entity keeps its own route structure (Option B).
 */
function workpaperContentUrl(entityType: string, engagementId: string, entityId: string): string {
  switch (entityType) {
    case 'procedure':
      return API_ROUTES.ENGAGEMENT_PROCEDURE_BY_ID(engagementId, entityId);
    case 'planning_workpaper':
      return API_ROUTES.ENGAGEMENT_PLANNING_WORKPAPER_BY_ID(engagementId, entityId);
    default:
      throw new Error(`Unknown workpaper entity type: ${entityType}`);
  }
}

export async function saveWorkpaperContentApi(
  entityType: string,
  engagementId: string,
  entityId: string,
  content: unknown,
): Promise<void> {
  const url = workpaperContentUrl(entityType, engagementId, entityId);
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return handleResponse<void>(response);
}

// ── Generic Workpaper Versions ──

function workpaperVersionsUrl(entityType: string, engagementId: string, entityId: string): string {
  switch (entityType) {
    case 'procedure':
      return API_ROUTES.ENGAGEMENT_PROCEDURE_VERSIONS(engagementId, entityId);
    case 'planning_workpaper':
      return API_ROUTES.ENGAGEMENT_PLANNING_WORKPAPER_VERSIONS(engagementId, entityId);
    default:
      throw new Error(`Unknown workpaper entity type: ${entityType}`);
  }
}

function workpaperVersionUrl(entityType: string, engagementId: string, entityId: string, version: number): string {
  switch (entityType) {
    case 'procedure':
      return API_ROUTES.ENGAGEMENT_PROCEDURE_VERSION_BY_NUM(engagementId, entityId, version);
    case 'planning_workpaper':
      return API_ROUTES.ENGAGEMENT_PLANNING_WORKPAPER_VERSION_BY_NUM(engagementId, entityId, version);
    default:
      throw new Error(`Unknown workpaper entity type: ${entityType}`);
  }
}

function workpaperVersionRestoreUrl(entityType: string, engagementId: string, entityId: string, version: number): string {
  switch (entityType) {
    case 'procedure':
      return API_ROUTES.ENGAGEMENT_PROCEDURE_VERSION_RESTORE(engagementId, entityId, version);
    case 'planning_workpaper':
      return API_ROUTES.ENGAGEMENT_PLANNING_WORKPAPER_VERSION_RESTORE(engagementId, entityId, version);
    default:
      throw new Error(`Unknown workpaper entity type: ${entityType}`);
  }
}

export async function fetchWorkpaperVersionsApi(
  entityType: string,
  engagementId: string,
  entityId: string,
): Promise<EntityVersionSummary[]> {
  const response = await fetch(workpaperVersionsUrl(entityType, engagementId, entityId));
  return handleResponse<EntityVersionSummary[]>(response);
}

export async function fetchWorkpaperVersionApi(
  entityType: string,
  engagementId: string,
  entityId: string,
  version: number,
): Promise<EntityVersionDetail> {
  const response = await fetch(workpaperVersionUrl(entityType, engagementId, entityId, version));
  return handleResponse<EntityVersionDetail>(response);
}

export async function restoreWorkpaperVersionApi(
  entityType: string,
  engagementId: string,
  entityId: string,
  version: number,
): Promise<{ success: boolean; restoredVersion: number }> {
  const response = await fetch(workpaperVersionRestoreUrl(entityType, engagementId, entityId, version), {
    method: 'POST',
  });
  return handleResponse<{ success: boolean; restoredVersion: number }>(response);
}

// ── Approval Signoff Types ──

export interface SignoffTypeInfo {
  type: string;
  count: number;
}

export async function fetchWorkflowSignoffTypes(entityType: string, subType: string = ''): Promise<SignoffTypeInfo[]> {
  const url = subType
    ? `${API_ROUTES.APPROVAL_SIGNOFF_TYPES(entityType)}?subType=${encodeURIComponent(subType)}`
    : API_ROUTES.APPROVAL_SIGNOFF_TYPES(entityType);
  const response = await fetch(url);
  return handleResponse<SignoffTypeInfo[]>(response);
}

// ── Approval Transitions ──

export async function fetchAvailableTransitionsApi(
  entityType: string,
  entityId: string,
  subType: string = '',
): Promise<AvailableTransition[]> {
  const url = subType
    ? `${API_ROUTES.APPROVAL_TRANSITIONS(entityType, entityId)}?subType=${encodeURIComponent(subType)}`
    : API_ROUTES.APPROVAL_TRANSITIONS(entityType, entityId);
  const response = await fetch(url);
  return handleResponse<AvailableTransition[]>(response);
}

export async function executeTransitionApi(
  entityType: string,
  entityId: string,
  transitionId: string,
  comment?: string,
  nextAssigneeId?: string,
  subType?: string,
): Promise<{ newStatus: string; actionType: string }> {
  const response = await fetch(API_ROUTES.APPROVAL_EXECUTE_TRANSITION(entityType, entityId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transitionId, comment, nextAssigneeId, subType }),
  });
  return handleResponse<{ newStatus: string; actionType: string }>(response);
}

export async function autoTransitionApi(
  entityType: string,
  entityId: string,
  actionType: string,
  subType?: string,
): Promise<{ newStatus: string } | null> {
  const response = await fetch(API_ROUTES.APPROVAL_AUTO_TRANSITION(entityType, entityId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actionType, subType }),
  });
  return handleResponse<{ newStatus: string } | null>(response);
}

// ── Manual Sign / Unsign ──

export async function manualSignApi(
  entityType: string,
  entityId: string,
  signoffType: string,
  signoffOrder: number,
  subType?: string,
): Promise<{ ok: true }> {
  const response = await fetch(API_ROUTES.APPROVAL_SIGN(entityType, entityId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signoffType, signoffOrder, subType }),
  });
  return handleResponse<{ ok: true }>(response);
}

export async function unsignApi(
  entityType: string,
  entityId: string,
  signoffType: string,
  signoffOrder: number,
): Promise<{ ok: true }> {
  const response = await fetch(API_ROUTES.APPROVAL_UNSIGN(entityType, entityId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signoffType, signoffOrder }),
  });
  return handleResponse<{ ok: true }>(response);
}
