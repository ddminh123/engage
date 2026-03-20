import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRiskAssessmentFactors,
  createRiskAssessmentFactorApi,
  updateRiskAssessmentFactorApi,
  deleteRiskAssessmentFactorApi,
} from '../api';
import type { RiskAssessmentFactorInput } from '../types';

export const riskAssessmentFactorKeys = {
  all: ['risk-assessment-factors'] as const,
  list: (includeInactive: boolean) => [...riskAssessmentFactorKeys.all, { includeInactive }] as const,
};

export function useRiskAssessmentFactors(includeInactive = false) {
  return useQuery({
    queryKey: riskAssessmentFactorKeys.list(includeInactive),
    queryFn: () => fetchRiskAssessmentFactors(includeInactive),
  });
}

export function useCreateRiskAssessmentFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RiskAssessmentFactorInput) => createRiskAssessmentFactorApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: riskAssessmentFactorKeys.all }),
  });
}

export function useUpdateRiskAssessmentFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RiskAssessmentFactorInput> }) =>
      updateRiskAssessmentFactorApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: riskAssessmentFactorKeys.all }),
  });
}

export function useDeleteRiskAssessmentFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRiskAssessmentFactorApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: riskAssessmentFactorKeys.all }),
  });
}

// Backward-compatible aliases
export const useRiskFactors = useRiskAssessmentFactors;
export const useCreateRiskFactor = useCreateRiskAssessmentFactor;
export const useUpdateRiskFactor = useUpdateRiskAssessmentFactor;
export const useDeleteRiskFactor = useDeleteRiskAssessmentFactor;
