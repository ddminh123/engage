import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';
import type { CreateExpertiseInput, UpdateExpertiseInput } from '../types';

const EXPERTISE_KEY = ['expertise'];

export function useExpertises() {
  return useQuery({
    queryKey: EXPERTISE_KEY,
    queryFn: () => api.fetchExpertises(),
  });
}

export function useCreateExpertise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpertiseInput) => api.createExpertise(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: EXPERTISE_KEY }),
  });
}

export function useUpdateExpertise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpertiseInput }) =>
      api.updateExpertise(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: EXPERTISE_KEY }),
  });
}

export function useDeleteExpertise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteExpertise(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EXPERTISE_KEY }),
  });
}
