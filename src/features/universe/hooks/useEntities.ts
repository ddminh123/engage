import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEntities,
  fetchEntityById,
  createEntityApi,
  updateEntityApi,
  deleteEntityApi,
  fetchRiskAssessments,
  createRiskAssessmentApi,
} from '../api';
import type { EntityInput, RiskAssessmentInput } from '../types';

const ENTITIES_KEY = ['entities'];
const entityKey = (id: string | null) => ['entity', id];
const riskKey = (entityId: string) => ['risk-assessments', entityId];

export function useEntities(query?: string) {
  return useQuery({
    queryKey: [...ENTITIES_KEY, query],
    queryFn: () => fetchEntities(query),
  });
}

export function useEntity(id: string | null) {
  return useQuery({
    queryKey: entityKey(id),
    queryFn: () => fetchEntityById(id!),
    enabled: !!id,
  });
}

export function useCreateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EntityInput) => createEntityApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTITIES_KEY });
    },
  });
}

export function useUpdateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EntityInput> }) =>
      updateEntityApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTITIES_KEY });
    },
  });
}

export function useDeleteEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEntityApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTITIES_KEY });
    },
  });
}

// ── Risk Assessment ──

export function useRiskAssessments(entityId: string | null) {
  return useQuery({
    queryKey: riskKey(entityId!),
    queryFn: () => fetchRiskAssessments(entityId!),
    enabled: !!entityId,
  });
}

export function useCreateRiskAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RiskAssessmentInput) => createRiskAssessmentApi(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: riskKey(variables.entityId) });
      qc.invalidateQueries({ queryKey: ENTITIES_KEY });
    },
  });
}
