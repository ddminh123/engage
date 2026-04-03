"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchApprovalWorkflowsApi,
  fetchApprovalWorkflowApi,
  createApprovalWorkflowApi,
  updateApprovalWorkflowApi,
  deleteApprovalWorkflowApi,
  addApprovalTransitionApi,
  updateApprovalTransitionApi,
  deleteApprovalTransitionApi,
  reorderApprovalTransitionsApi,
  upsertEntityBindingApi,
  deleteEntityBindingApi,
} from "../api";
import type {
  ApprovalWorkflow,
  ApprovalWorkflowInput,
  ApprovalWorkflowUpdateInput,
  ApprovalTransitionInput,
  EntityBindingInput,
} from "../types";

const WORKFLOWS_KEY = ["approval-workflows"];

export function useApprovalWorkflows() {
  return useQuery<ApprovalWorkflow[]>({
    queryKey: WORKFLOWS_KEY,
    queryFn: () => fetchApprovalWorkflowsApi(),
  });
}

export function useApprovalWorkflow(id: string | null) {
  return useQuery<ApprovalWorkflow>({
    queryKey: [...WORKFLOWS_KEY, id],
    queryFn: () => fetchApprovalWorkflowApi(id!),
    enabled: !!id,
  });
}

export function useCreateApprovalWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ApprovalWorkflowInput) => createApprovalWorkflowApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
}

export function useUpdateApprovalWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApprovalWorkflowUpdateInput }) =>
      updateApprovalWorkflowApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
}

export function useDeleteApprovalWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApprovalWorkflowApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
}

export function useAddApprovalTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: ApprovalTransitionInput }) =>
      addApprovalTransitionApi(workflowId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
}

export function useUpdateApprovalTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workflowId,
      transitionId,
      data,
    }: {
      workflowId: string;
      transitionId: string;
      data: Partial<ApprovalTransitionInput>;
    }) => updateApprovalTransitionApi(workflowId, transitionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
}

export function useDeleteApprovalTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, transitionId }: { workflowId: string; transitionId: string }) =>
      deleteApprovalTransitionApi(workflowId, transitionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
}

export function useReorderApprovalTransitions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, orderedIds }: { workflowId: string; orderedIds: string[] }) =>
      reorderApprovalTransitionsApi(workflowId, orderedIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
}

// ── Entity Binding Hooks ──

export function useUpsertEntityBinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EntityBindingInput) => upsertEntityBindingApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
}

export function useDeleteEntityBinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entityType, subType }: { entityType: string; subType?: string }) =>
      deleteEntityBindingApi(entityType, subType),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
}
