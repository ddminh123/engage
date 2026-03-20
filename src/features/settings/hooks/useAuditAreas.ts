"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAuditAreas,
  createAuditAreaApi,
  updateAuditAreaApi,
  deleteAuditAreaApi,
} from "../api";
import type { AuditArea, AuditAreaInput } from "../types";

const QUERY_KEY = ["audit-areas"];

export function useAuditAreas(includeInactive = false) {
  return useQuery<AuditArea[]>({
    queryKey: [...QUERY_KEY, { includeInactive }],
    queryFn: () => fetchAuditAreas(includeInactive),
  });
}

export function useCreateAuditArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AuditAreaInput) => createAuditAreaApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateAuditArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AuditAreaInput> }) =>
      updateAuditAreaApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteAuditArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAuditAreaApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
