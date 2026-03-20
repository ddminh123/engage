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
  createRcmObjectiveApi,
  updateRcmObjectiveApi,
  deleteRcmObjectiveApi,
  syncRcmObjectivesApi,
  reorderItemsApi,
  type ReorderEntityType,
} from '../api';
import type {
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
      riskId,
      data,
    }: {
      engagementId: string;
      riskId: string;
      data: EngagementControlInput;
    }) => createEngagementControlApi(engagementId, riskId, data),
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
      riskId,
      controlId,
      data,
    }: {
      engagementId: string;
      riskId: string;
      controlId: string;
      data: EngagementControlUpdateInput;
    }) => updateEngagementControlApi(engagementId, riskId, controlId, data),
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
      riskId,
      controlId,
    }: {
      engagementId: string;
      riskId: string;
      controlId: string;
    }) => deleteEngagementControlApi(engagementId, riskId, controlId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}

// ── Reorder ──

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
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: engagementKey(variables.engagementId) });
    },
  });
}
