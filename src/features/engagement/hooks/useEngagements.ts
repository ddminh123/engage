import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEngagements,
  fetchEngagementById,
  createEngagementApi,
  updateEngagementApi,
  deleteEngagementApi,
  createSectionApi,
  updateSectionApi,
  deleteSectionApi,
  createObjectiveApi,
  createStandaloneObjectiveApi,
  updateObjectiveApi,
  deleteObjectiveApi,
  createProcedureApi,
  updateProcedureApi,
  deleteProcedureApi,
  createFindingApi,
  updateFindingApi,
  deleteFindingApi,
  createAuditObjectiveApi,
  updateAuditObjectiveApi,
  deleteAuditObjectiveApi,
  createEngagementRiskApi,
  updateEngagementRiskApi,
  deleteEngagementRiskApi,
  createEngagementControlApi,
  updateEngagementControlApi,
  deleteEngagementControlApi,
  linkControlToRiskApi,
  unlinkControlFromRiskApi,
  createRcmObjectiveApi,
  updateRcmObjectiveApi,
  deleteRcmObjectiveApi,
  syncRcmObjectivesApi,
  syncRcmToWorkProgramApi,
  syncPlanningToExecutionApi,
  reorderItemsApi,
  type ReorderEntityType,
  batchActionApi,
  type BatchEntityType,
  type BatchActionType,
  fetchEngagementMembersApi,
  addEngagementMemberApi,
  updateEngagementMemberApi,
  removeEngagementMemberApi,
  updateProcedureAssigneeApi,
  fetchWpSignoffs,
  fetchWpAssignments,
  addWpAssignmentApi,
  removeWpAssignmentApi,
  fetchCommentThreads,
  createCommentThreadApi,
  addCommentReplyApi,
  updateThreadStatusApi,
  deleteCommentThreadApi,
  updateProcedureContentApi,
  publishProcedureApi,
  fetchProcedureVersionsApi,
  fetchProcedureVersionApi,
  restoreProcedureVersionApi,
  fetchAvailableTransitionsApi,
  executeTransitionApi,
  fetchWorkflowSignoffTypes,
  manualSignApi,
  unsignApi,
} from '../api';
import type {
  EngagementDetail,
  EngagementInput,
  EngagementUpdateInput,
  SectionInput,
  SectionUpdateInput,
  ObjectiveInput,
  ObjectiveUpdateInput,
  ProcedureInput,
  ProcedureUpdateInput,
  FindingInput,
  FindingUpdateInput,
  AuditObjectiveInput,
  AuditObjectiveUpdateInput,
  EngagementRiskInput,
  EngagementRiskUpdateInput,
  EngagementControlInput,
  EngagementControlUpdateInput,
  RcmObjectiveInput,
  RcmObjectiveUpdateInput,
} from '../types';

const ENGAGEMENTS_KEY = ['engagements'];
const engagementKey = (id: string | null) => ['engagement', id];

// ── Engagement list ──

export function useEngagements() {
  return useQuery({
    queryKey: ENGAGEMENTS_KEY,
    queryFn: fetchEngagements,
  });
}

// ── Single engagement with full detail ──

export function useEngagement(id: string | null) {
  return useQuery({
    queryKey: engagementKey(id),
    queryFn: () => fetchEngagementById(id!),
    enabled: !!id,
  });
}

// ── Engagement mutations ──

export function useCreateEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EngagementInput) => createEngagementApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENGAGEMENTS_KEY });
    },
  });
}

export function useUpdateEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EngagementUpdateInput }) =>
      updateEngagementApi(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ENGAGEMENTS_KEY });
      qc.invalidateQueries({ queryKey: engagementKey(variables.id) });
    },
  });
}

export function useDeleteEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEngagementApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENGAGEMENTS_KEY });
    },
  });
}

// ── Section mutations ──

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, data }: { engagementId: string; data: SectionInput }) =>
      createSectionApi(engagementId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      sectionId,
      data,
    }: {
      engagementId: string;
      sectionId: string;
      data: SectionUpdateInput;
    }) => updateSectionApi(engagementId, sectionId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, sectionId }: { engagementId: string; sectionId: string }) =>
      deleteSectionApi(engagementId, sectionId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── Objective mutations ──

export function useCreateObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      sectionId,
      data,
    }: {
      engagementId: string;
      sectionId: string;
      data: ObjectiveInput;
    }) => createObjectiveApi(engagementId, sectionId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useCreateStandaloneObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      data,
    }: {
      engagementId: string;
      data: ObjectiveInput;
    }) => createStandaloneObjectiveApi(engagementId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useUpdateObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      objectiveId,
      data,
    }: {
      engagementId: string;
      objectiveId: string;
      data: ObjectiveUpdateInput;
    }) => updateObjectiveApi(engagementId, objectiveId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useDeleteObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      objectiveId,
    }: {
      engagementId: string;
      objectiveId: string;
    }) => deleteObjectiveApi(engagementId, objectiveId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── Procedure mutations ──

export function useCreateProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, data }: { engagementId: string; data: ProcedureInput }) =>
      createProcedureApi(engagementId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useUpdateProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      procedureId,
      data,
    }: {
      engagementId: string;
      procedureId: string;
      data: ProcedureUpdateInput;
    }) => updateProcedureApi(engagementId, procedureId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useDeleteProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      procedureId,
    }: {
      engagementId: string;
      procedureId: string;
    }) => deleteProcedureApi(engagementId, procedureId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── Finding mutations ──

export function useCreateFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, data }: { engagementId: string; data: FindingInput }) =>
      createFindingApi(engagementId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useUpdateFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      findingId,
      data,
    }: {
      engagementId: string;
      findingId: string;
      data: FindingUpdateInput;
    }) => updateFindingApi(engagementId, findingId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useDeleteFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      findingId,
    }: {
      engagementId: string;
      findingId: string;
    }) => deleteFindingApi(engagementId, findingId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── Audit Objective mutations (Planning-level) ──

export function useCreateAuditObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, data }: { engagementId: string; data: AuditObjectiveInput }) =>
      createAuditObjectiveApi(engagementId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useUpdateAuditObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      objectiveId,
      data,
    }: {
      engagementId: string;
      objectiveId: string;
      data: AuditObjectiveUpdateInput;
    }) => updateAuditObjectiveApi(engagementId, objectiveId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useDeleteAuditObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      objectiveId,
    }: {
      engagementId: string;
      objectiveId: string;
    }) => deleteAuditObjectiveApi(engagementId, objectiveId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── RCM Objective mutations ──

export function useCreateRcmObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, data }: { engagementId: string; data: RcmObjectiveInput }) =>
      createRcmObjectiveApi(engagementId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useUpdateRcmObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      objectiveId,
      data,
    }: {
      engagementId: string;
      objectiveId: string;
      data: RcmObjectiveUpdateInput;
    }) => updateRcmObjectiveApi(engagementId, objectiveId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useDeleteRcmObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      objectiveId,
    }: {
      engagementId: string;
      objectiveId: string;
    }) => deleteRcmObjectiveApi(engagementId, objectiveId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useSyncRcmObjectives() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId }: { engagementId: string }) =>
      syncRcmObjectivesApi(engagementId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── Engagement Risk mutations (RACM light) ──

export function useCreateEngagementRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, data }: { engagementId: string; data: EngagementRiskInput }) =>
      createEngagementRiskApi(engagementId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useUpdateEngagementRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      riskId,
      data,
    }: {
      engagementId: string;
      riskId: string;
      data: EngagementRiskUpdateInput;
    }) => updateEngagementRiskApi(engagementId, riskId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useDeleteEngagementRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      riskId,
    }: {
      engagementId: string;
      riskId: string;
    }) => deleteEngagementRiskApi(engagementId, riskId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── Engagement Control mutations ──

export function useCreateEngagementControl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      data,
      linkToRiskId,
    }: {
      engagementId: string;
      data: EngagementControlInput;
      linkToRiskId?: string;
    }) => createEngagementControlApi(engagementId, { ...data, linkToRiskId }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useUpdateEngagementControl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      controlId,
      data,
    }: {
      engagementId: string;
      controlId: string;
      data: EngagementControlUpdateInput;
    }) => updateEngagementControlApi(engagementId, controlId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useDeleteEngagementControl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      controlId,
    }: {
      engagementId: string;
      controlId: string;
    }) => deleteEngagementControlApi(engagementId, controlId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useLinkControlToRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      riskId,
      controlId,
    }: {
      engagementId: string;
      riskId: string;
      controlId: string;
    }) => linkControlToRiskApi(engagementId, riskId, controlId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

export function useUnlinkControlFromRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      riskId,
      controlId,
    }: {
      engagementId: string;
      riskId: string;
      controlId: string;
    }) => unlinkControlFromRiskApi(engagementId, riskId, controlId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── Reorder (optimistic) ──

function applyReorder(
  detail: EngagementDetail,
  entityType: ReorderEntityType,
  items: { id: string; sortOrder: number }[],
): EngagementDetail {
  const orderMap = new Map(items.map((i) => [i.id, i.sortOrder]));
  const sortBy = <T extends { id: string }>(arr: T[]) =>
    [...arr].sort(
      (a, b) => (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity),
    );

  switch (entityType) {
    case 'audit_objective':
      return { ...detail, auditObjectives: sortBy(detail.auditObjectives) };
    case 'section':
      return { ...detail, sections: sortBy(detail.sections) };
    case 'rcm_objective':
      return { ...detail, rcmObjectives: sortBy(detail.rcmObjectives) };
    case 'objective':
      return {
        ...detail,
        sections: detail.sections.map((s) => ({
          ...s,
          objectives: sortBy(s.objectives),
        })),
        standaloneObjectives: sortBy(detail.standaloneObjectives),
      };
    case 'procedure':
      return {
        ...detail,
        sections: detail.sections.map((s) => ({
          ...s,
          objectives: s.objectives.map((o) => ({
            ...o,
            procedures: sortBy(o.procedures),
          })),
          procedures: sortBy(s.procedures),
        })),
        standaloneObjectives: detail.standaloneObjectives.map((o) => ({
          ...o,
          procedures: sortBy(o.procedures),
        })),
      };
    case 'risk':
      return {
        ...detail,
        rcmObjectives: detail.rcmObjectives.map((o) => ({
          ...o,
          risks: sortBy(o.risks),
        })),
      };
    case 'control':
      return {
        ...detail,
        rcmObjectives: detail.rcmObjectives.map((o) => ({
          ...o,
          risks: o.risks.map((r) => ({
            ...r,
            controls: sortBy(r.controls),
          })),
        })),
      };
    default:
      return detail;
  }
}

export function useReorderItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      entityType,
      items,
    }: {
      engagementId: string;
      entityType: ReorderEntityType;
      items: { id: string; sortOrder: number }[];
    }) => reorderItemsApi(engagementId, entityType, items),
    onMutate: async (variables) => {
      const key = engagementKey(variables.engagementId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<{ data: EngagementDetail }>(key);
      if (previous?.data) {
        qc.setQueryData(key, {
          ...previous,
          data: applyReorder(previous.data, variables.entityType, variables.items),
        });
      }
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        qc.setQueryData(engagementKey(variables.engagementId), context.previous);
      }
    },
    onSettled: (_, __, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── Batch Action (delete / duplicate) ──

export function useBatchAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      action,
      entityType,
      ids,
    }: {
      engagementId: string;
      action: BatchActionType;
      entityType: BatchEntityType;
      ids: string[];
    }) => batchActionApi(engagementId, action, entityType, ids),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── Sync RCM to Work Program ──

export function useSyncRcmToWorkProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (engagementId: string) => syncRcmToWorkProgramApi(engagementId),
    onSuccess: (_, engagementId) => {
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
    },
  });
}

// ── Sync Planning to Execution ──

export function useSyncPlanningToExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (engagementId: string) => syncPlanningToExecutionApi(engagementId),
    onSuccess: (_, engagementId) => {
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
    },
  });
}

// ── Engagement Members ──

const membersKey = (engagementId: string) => ['engagement-members', engagementId];

export function useEngagementMembers(engagementId: string) {
  return useQuery({
    queryKey: membersKey(engagementId),
    queryFn: () => fetchEngagementMembersApi(engagementId),
    enabled: !!engagementId,
  });
}

export function useAddEngagementMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, data }: { engagementId: string; data: { userId: string; role?: string } }) =>
      addEngagementMemberApi(engagementId, data),
    onSuccess: (_, { engagementId }) => {
      qc.invalidateQueries({ queryKey: membersKey(engagementId) });
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
    },
  });
}

export function useUpdateEngagementMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, userId, data }: { engagementId: string; userId: string; data: { role: string } }) =>
      updateEngagementMemberApi(engagementId, userId, data),
    onSuccess: (_, { engagementId }) => {
      qc.invalidateQueries({ queryKey: membersKey(engagementId) });
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
    },
  });
}

export function useRemoveEngagementMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, userId }: { engagementId: string; userId: string }) =>
      removeEngagementMemberApi(engagementId, userId),
    onSuccess: (_, { engagementId }) => {
      qc.invalidateQueries({ queryKey: membersKey(engagementId) });
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
    },
  });
}

// ── Procedure Assignee ──

export function useUpdateProcedureAssignee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      procedureId,
      field,
      assigneeId,
    }: {
      engagementId: string;
      procedureId: string;
      field: 'performed_by' | 'reviewed_by';
      assigneeId: string | null;
    }) => updateProcedureAssigneeApi(engagementId, procedureId, field, assigneeId),
    onSuccess: (_, { engagementId }) => {
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
    },
  });
}

// ── WP Signoffs (immutable sign-off records) ──

const wpSignoffsKey = (engagementId: string) => ['wp-signoffs', engagementId] as const;

export function useWpSignoffs(engagementId: string) {
  return useQuery({
    queryKey: wpSignoffsKey(engagementId),
    queryFn: () => fetchWpSignoffs(engagementId),
    enabled: !!engagementId,
  });
}

// ── WP Assignments (multi-assignee) ──

const wpAssignmentsKey = (engagementId: string) => ['wp-assignments', engagementId] as const;

export function useWpAssignments(engagementId: string) {
  return useQuery({
    queryKey: wpAssignmentsKey(engagementId),
    queryFn: () => fetchWpAssignments(engagementId),
    enabled: !!engagementId,
  });
}

export function useAddWpAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      entityType,
      entityId,
      userIds,
      cascade,
    }: {
      engagementId: string;
      entityType: string;
      entityId: string;
      userIds: string[];
      cascade?: boolean;
    }) => addWpAssignmentApi(engagementId, { entityType, entityId, userIds, cascade }),
    onSuccess: (data, { engagementId }) => {
      qc.setQueryData(wpAssignmentsKey(engagementId), data);
    },
  });
}

export function useRemoveWpAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      entityType,
      entityId,
      userId,
    }: {
      engagementId: string;
      entityType: string;
      entityId: string;
      userId: string;
    }) => removeWpAssignmentApi(engagementId, { entityType, entityId, userId }),
    onSuccess: (data, { engagementId }) => {
      qc.setQueryData(wpAssignmentsKey(engagementId), data);
    },
  });
}

// ── WP Comments ──

const wpCommentsKey = (engagementId: string, entityType: string, entityId: string) =>
  ['wp-comments', engagementId, entityType, entityId] as const;

export function useCommentThreads(engagementId: string, entityType: string, entityId: string) {
  return useQuery({
    queryKey: wpCommentsKey(engagementId, entityType, entityId),
    queryFn: () => fetchCommentThreads(engagementId, entityType, entityId),
    enabled: !!engagementId && !!entityType && !!entityId,
  });
}

export function useCreateCommentThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      ...data
    }: {
      engagementId: string;
      entityType: string;
      entityId: string;
      threadType?: 'comment' | 'review_note';
      quote?: string | null;
      contentAnchor?: string | null;
      comment: string;
    }) => createCommentThreadApi(engagementId, data),
    onSuccess: (_, { engagementId, entityType, entityId }) => {
      qc.invalidateQueries({ queryKey: wpCommentsKey(engagementId, entityType, entityId) });
    },
  });
}

export function useAddCommentReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      threadId,
      content,
      entityType,
      entityId,
    }: {
      engagementId: string;
      threadId: string;
      content: string;
      entityType: string;
      entityId: string;
    }) => addCommentReplyApi(engagementId, threadId, content),
    onSuccess: (_, { engagementId, entityType, entityId }) => {
      qc.invalidateQueries({ queryKey: wpCommentsKey(engagementId, entityType, entityId) });
    },
  });
}

export function useUpdateThreadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      threadId,
      status,
      entityType,
      entityId,
    }: {
      engagementId: string;
      threadId: string;
      status: 'open' | 'resolved' | 'detached';
      entityType: string;
      entityId: string;
    }) => updateThreadStatusApi(engagementId, threadId, status),
    onSuccess: (_, { engagementId, entityType, entityId }) => {
      qc.invalidateQueries({ queryKey: wpCommentsKey(engagementId, entityType, entityId) });
    },
  });
}

export function useDeleteCommentThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      threadId,
      entityType,
      entityId,
    }: {
      engagementId: string;
      threadId: string;
      entityType: string;
      entityId: string;
    }) => deleteCommentThreadApi(engagementId, threadId),
    onSuccess: (_, { engagementId, entityType, entityId }) => {
      qc.invalidateQueries({ queryKey: wpCommentsKey(engagementId, entityType, entityId) });
    },
  });
}

// ── Procedure Content (Tiptap JSON) ──

export function useUpdateProcedureContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      procedureId,
      content,
    }: {
      engagementId: string;
      procedureId: string;
      content: unknown;
    }) => updateProcedureContentApi(engagementId, procedureId, content),
    onSuccess: (_, { engagementId }) => {
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
    },
  });
}

// ── Versioning ──

const procedureVersionsKey = (engagementId: string, procedureId: string) =>
  ['procedureVersions', engagementId, procedureId];

export function useProcedureVersions(engagementId: string, procedureId: string) {
  return useQuery({
    queryKey: procedureVersionsKey(engagementId, procedureId),
    queryFn: () => fetchProcedureVersionsApi(engagementId, procedureId),
    enabled: !!engagementId && !!procedureId,
  });
}

export function useProcedureVersion(engagementId: string, procedureId: string, version: number | null) {
  return useQuery({
    queryKey: ['procedureVersion', engagementId, procedureId, version],
    queryFn: () => fetchProcedureVersionApi(engagementId, procedureId, version!),
    enabled: !!engagementId && !!procedureId && version !== null,
  });
}

export function usePublishProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      procedureId,
      comment,
    }: {
      engagementId: string;
      procedureId: string;
      comment?: string;
    }) => publishProcedureApi(engagementId, procedureId, comment),
    onSuccess: (_, { engagementId, procedureId }) => {
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
      qc.invalidateQueries({ queryKey: procedureVersionsKey(engagementId, procedureId) });
    },
  });
}

// ── Workflow Signoff Types ──

const workflowSignoffTypesKey = (entityType: string) =>
  ['workflowSignoffTypes', entityType];

export function useWorkflowSignoffTypes(entityType: string) {
  return useQuery({
    queryKey: workflowSignoffTypesKey(entityType),
    queryFn: () => fetchWorkflowSignoffTypes(entityType),
    enabled: !!entityType,
    staleTime: 5 * 60 * 1000, // signoff types rarely change
  });
}

// ── Approval Transitions ──

const approvalTransitionsKey = (entityType: string, entityId: string) =>
  ['approvalTransitions', entityType, entityId];

export function useAvailableTransitions(entityType: string, entityId: string) {
  return useQuery({
    queryKey: approvalTransitionsKey(entityType, entityId),
    queryFn: () => fetchAvailableTransitionsApi(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useExecuteTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
      transitionId,
      comment,
      nextAssigneeId,
      engagementId,
    }: {
      entityType: string;
      entityId: string;
      transitionId: string;
      comment?: string;
      nextAssigneeId?: string;
      engagementId: string;
    }) => executeTransitionApi(entityType, entityId, transitionId, comment, nextAssigneeId),
    onSuccess: (_, { entityType, entityId, engagementId }) => {
      qc.invalidateQueries({ queryKey: approvalTransitionsKey(entityType, entityId) });
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
      qc.invalidateQueries({ queryKey: wpSignoffsKey(engagementId) });
    },
  });
}

export function useManualSign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
      signoffType,
      signoffOrder,
    }: {
      entityType: string;
      entityId: string;
      signoffType: string;
      signoffOrder: number;
      engagementId: string;
    }) => manualSignApi(entityType, entityId, signoffType, signoffOrder),
    onSuccess: (_, { entityType, entityId, engagementId }) => {
      qc.invalidateQueries({ queryKey: wpSignoffsKey(engagementId) });
      qc.invalidateQueries({ queryKey: approvalTransitionsKey(entityType, entityId) });
    },
  });
}

export function useUnsign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
      signoffType,
      signoffOrder,
    }: {
      entityType: string;
      entityId: string;
      signoffType: string;
      signoffOrder: number;
      engagementId: string;
    }) => unsignApi(entityType, entityId, signoffType, signoffOrder),
    onSuccess: (_, { entityType, entityId, engagementId }) => {
      qc.invalidateQueries({ queryKey: wpSignoffsKey(engagementId) });
      qc.invalidateQueries({ queryKey: approvalTransitionsKey(entityType, entityId) });
    },
  });
}

export function useRestoreProcedureVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      engagementId,
      procedureId,
      version,
    }: {
      engagementId: string;
      procedureId: string;
      version: number;
    }) => restoreProcedureVersionApi(engagementId, procedureId, version),
    onSuccess: (_, { engagementId, procedureId }) => {
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
      qc.invalidateQueries({ queryKey: procedureVersionsKey(engagementId, procedureId) });
      qc.invalidateQueries({ queryKey: approvalTransitionsKey('procedure', procedureId) });
    },
  });
}
