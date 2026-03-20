"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEntityTypes,
  createEntityTypeApi,
  updateEntityTypeApi,
  deleteEntityTypeApi,
} from "../api";
import type { EntityType, EntityTypeInput } from "../types";

const QUERY_KEY = ["entity-types"];

export function useEntityTypes(includeInactive = false) {
  return useQuery<EntityType[]>({
    queryKey: [...QUERY_KEY, { includeInactive }],
    queryFn: () => fetchEntityTypes(includeInactive),
  });
}

export function useCreateEntityType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EntityTypeInput) => createEntityTypeApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateEntityType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EntityTypeInput> }) =>
      updateEntityTypeApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteEntityType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEntityTypeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
