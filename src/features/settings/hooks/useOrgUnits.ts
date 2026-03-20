import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrgUnits, fetchOrgUnitById, createOrgUnit, updateOrgUnit, deleteOrgUnit } from '../api';
import type { OrgUnitFilters, OrgUnitCreateInput, OrgUnitUpdateInput } from '../types';

export const orgUnitKeys = {
  all: ['org-units'] as const,
  lists: () => [...orgUnitKeys.all, 'list'] as const,
  list: (filters?: OrgUnitFilters) => [...orgUnitKeys.lists(), filters] as const,
  searches: () => [...orgUnitKeys.all, 'search'] as const,
  search: (query: string) => [...orgUnitKeys.searches(), query] as const,
  details: () => [...orgUnitKeys.all, 'detail'] as const,
  detail: (id: string) => [...orgUnitKeys.details(), id] as const,
};

export function useOrgUnits(filters?: OrgUnitFilters) {
  return useQuery({
    queryKey: orgUnitKeys.list(filters),
    queryFn: () => fetchOrgUnits(filters),
  });
}

export function useOrgUnitSearch(query: string) {
  return useQuery({
    queryKey: orgUnitKeys.search(query),
    queryFn: () => fetchOrgUnits({ status: 'active', search: query }),
    staleTime: 30_000,
  });
}

export function useOrgUnit(id: string | null) {
  return useQuery({
    queryKey: orgUnitKeys.detail(id!),
    queryFn: () => fetchOrgUnitById(id!),
    enabled: !!id,
  });
}

export function useCreateOrgUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrgUnitCreateInput) => createOrgUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgUnitKeys.lists() });
    },
  });
}

export function useUpdateOrgUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrgUnitUpdateInput }) =>
      updateOrgUnit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orgUnitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgUnitKeys.detail(variables.id) });
    },
  });
}

export function useDeleteOrgUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrgUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgUnitKeys.lists() });
    },
  });
}
