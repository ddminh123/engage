import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAssessmentSources,
  createAssessmentSourceApi,
  updateAssessmentSourceApi,
  deleteAssessmentSourceApi,
} from '../api';
import type { AssessmentSourceInput } from '../types';

const assessmentSourceKeys = {
  all: ['assessment-sources'] as const,
  active: ['assessment-sources', 'active'] as const,
};

export function useAssessmentSources(includeInactive = false) {
  return useQuery({
    queryKey: includeInactive ? assessmentSourceKeys.all : assessmentSourceKeys.active,
    queryFn: () => fetchAssessmentSources(includeInactive),
  });
}

export function useCreateAssessmentSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AssessmentSourceInput) => createAssessmentSourceApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: assessmentSourceKeys.all }),
  });
}

export function useUpdateAssessmentSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssessmentSourceInput> }) =>
      updateAssessmentSourceApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: assessmentSourceKeys.all }),
  });
}

export function useDeleteAssessmentSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssessmentSourceApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: assessmentSourceKeys.all }),
  });
}
