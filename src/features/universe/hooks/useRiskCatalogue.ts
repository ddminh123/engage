import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRiskCatalogueItems,
  createRiskCatalogueItemApi,
  updateRiskCatalogueItemApi,
  deleteRiskCatalogueItemApi,
} from '../api';
import type { RiskCatalogueItemInput } from '../types';

export const riskCatalogueKeys = {
  all: ['risk-catalogue'] as const,
  list: (includeInactive: boolean) => [...riskCatalogueKeys.all, { includeInactive }] as const,
};

export function useRiskCatalogueItems(includeInactive = false) {
  return useQuery({
    queryKey: riskCatalogueKeys.list(includeInactive),
    queryFn: () => fetchRiskCatalogueItems(includeInactive),
  });
}

export function useCreateRiskCatalogueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RiskCatalogueItemInput) => createRiskCatalogueItemApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: riskCatalogueKeys.all }),
  });
}

export function useUpdateRiskCatalogueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RiskCatalogueItemInput> & { isActive?: boolean } }) =>
      updateRiskCatalogueItemApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: riskCatalogueKeys.all }),
  });
}

export function useDeleteRiskCatalogueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRiskCatalogueItemApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: riskCatalogueKeys.all }),
  });
}
