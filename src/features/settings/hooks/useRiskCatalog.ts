"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/riskCatalog";
import type {
  RiskCatalogItemFilters,
  ControlCatalogItemFilters,
  ProcedureCatalogItemFilters,
  CopyRisksToEngagementInput,
  CopyControlsToEngagementInput,
} from "../types/riskCatalog";

const KEYS = {
  tree: ["risk-catalog-tree"] as const,
  risks: (filters?: RiskCatalogItemFilters) => ["risk-catalog-risks", filters] as const,
  controls: (filters?: ControlCatalogItemFilters) => ["risk-catalog-controls", filters] as const,
  procedures: (filters?: ProcedureCatalogItemFilters) => ["risk-catalog-procedures", filters] as const,
};

// =============================================================================
// Tree
// =============================================================================

export function useRiskCatalogTree() {
  return useQuery({
    queryKey: KEYS.tree,
    queryFn: api.fetchRiskCatalogTree,
  });
}

// =============================================================================
// Risks
// =============================================================================

export function useRiskCatalogItems(filters?: RiskCatalogItemFilters) {
  return useQuery({
    queryKey: KEYS.risks(filters),
    queryFn: () => api.fetchRiskCatalogItems(filters),
  });
}

export function useCreateRiskCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createRiskCatalogItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useUpdateRiskCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateRiskCatalogItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useDeleteRiskCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRiskCatalogItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

// =============================================================================
// Controls
// =============================================================================

export function useControlCatalogItems(filters?: ControlCatalogItemFilters) {
  return useQuery({
    queryKey: KEYS.controls(filters),
    queryFn: () => api.fetchControlCatalogItems(filters),
  });
}

export function useCreateControlCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createControlCatalogItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useUpdateControlCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateControlCatalogItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useDeleteControlCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteControlCatalogItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

// =============================================================================
// Procedures
// =============================================================================

export function useProcedureCatalogItems(filters?: ProcedureCatalogItemFilters) {
  return useQuery({
    queryKey: KEYS.procedures(filters),
    queryFn: () => api.fetchProcedureCatalogItems(filters),
  });
}

export function useCreateProcedureCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createProcedureCatalogItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useUpdateProcedureCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateProcedureCatalogItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useDeleteProcedureCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProcedureCatalogItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

// =============================================================================
// Domains
// =============================================================================

export function useCreateRiskCatalogDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createRiskCatalogDomain(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useUpdateRiskCatalogDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateRiskCatalogDomain(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useDeleteRiskCatalogDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRiskCatalogDomain(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

// =============================================================================
// Categories
// =============================================================================

export function useCreateRiskCatalogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createRiskCatalogCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useUpdateRiskCatalogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateRiskCatalogCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useDeleteRiskCatalogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRiskCatalogCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

// =============================================================================
// Copy to Engagement
// =============================================================================

export function useCopyRisksToEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CopyRisksToEngagementInput) => api.copyRisksToEngagement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}

export function useCopyControlsToEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CopyControlsToEngagementInput) => api.copyControlsToEngagement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-catalog"] });
    },
  });
}
