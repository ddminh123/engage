import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPlans,
  fetchPlanById,
  createPlanApi,
  updatePlanApi,
  deletePlanApi,
  addPlannedAuditApi,
  updatePlannedAuditApi,
  removePlannedAuditApi,
} from '../api';
import type {
  PlanInput,
  PlanUpdateInput,
  PlannedAuditInput,
  PlannedAuditUpdateInput,
} from '../types';

const PLANS_KEY = ['plans'];
const planKey = (id: string | null) => ['plan', id];

// ── Plan list ──

export function usePlans() {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: fetchPlans,
  });
}

// ── Single plan with audits ──

export function usePlan(id: string | null) {
  return useQuery({
    queryKey: planKey(id),
    queryFn: () => fetchPlanById(id!),
    enabled: !!id,
  });
}

// ── Plan mutations ──

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PlanInput) => createPlanApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLANS_KEY });
    },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlanUpdateInput }) =>
      updatePlanApi(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: PLANS_KEY });
      qc.invalidateQueries({ queryKey: planKey(variables.id) });
    },
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlanApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLANS_KEY });
    },
  });
}

// ── Planned audit mutations ──

export function useAddPlannedAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: PlannedAuditInput }) =>
      addPlannedAuditApi(planId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: planKey(variables.planId) });
      qc.invalidateQueries({ queryKey: PLANS_KEY });
    },
  });
}

export function useUpdatePlannedAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      auditId,
      data,
    }: {
      planId: string;
      auditId: string;
      data: PlannedAuditUpdateInput;
    }) => updatePlannedAuditApi(planId, auditId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: planKey(variables.planId) });
      qc.invalidateQueries({ queryKey: PLANS_KEY });
    },
  });
}

export function useRemovePlannedAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, auditId }: { planId: string; auditId: string }) =>
      removePlannedAuditApi(planId, auditId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: planKey(variables.planId) });
      qc.invalidateQueries({ queryKey: PLANS_KEY });
    },
  });
}
