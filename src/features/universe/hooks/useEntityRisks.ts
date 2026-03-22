import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEntityRisks,
  createEntityRiskApi,
  copyRisksFromCatalogueApi,
  updateEntityRiskApi,
  deleteEntityRiskApi,
} from '../api';
import type { EntityRiskInput } from '../types';

export const entityRiskKeys = {
  all: ['entity-risks'] as const,
  byEntity: (entityId: string) => [...entityRiskKeys.all, entityId] as const,
};

export function useEntityRisks(entityId: string | null) {
  return useQuery({
    queryKey: entityRiskKeys.byEntity(entityId!),
    queryFn: () => fetchEntityRisks(entityId!),
    enabled: !!entityId,
  });
}

export function useCreateEntityRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entityId, data }: { entityId: string; data: EntityRiskInput }) =>
      createEntityRiskApi(entityId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: entityRiskKeys.byEntity(variables.entityId) });
    },
  });
}

export function useCopyRisksFromCatalogue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entityId, catalogueItemIds }: { entityId: string; catalogueItemIds: string[] }) =>
      copyRisksFromCatalogueApi(entityId, catalogueItemIds),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: entityRiskKeys.byEntity(variables.entityId) });
    },
  });
}

export function useUpdateEntityRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entityId, riskId, data }: { entityId: string; riskId: string; data: Partial<EntityRiskInput> }) =>
      updateEntityRiskApi(entityId, riskId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: entityRiskKeys.byEntity(variables.entityId) });
    },
  });
}

export function useDeleteEntityRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entityId, riskId }: { entityId: string; riskId: string }) =>
      deleteEntityRiskApi(entityId, riskId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: entityRiskKeys.byEntity(variables.entityId) });
    },
  });
}
