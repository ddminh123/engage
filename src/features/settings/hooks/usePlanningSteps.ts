"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPlanningStepsApi,
  createPlanningStepApi,
  updatePlanningStepApi,
  deletePlanningStepApi,
  reorderPlanningStepsApi,
} from "../api";
import type {
  PlanningStepConfig,
  PlanningStepConfigInput,
  PlanningStepConfigUpdateInput,
} from "../types";

const STEPS_KEY = ["planning-steps"];

export function usePlanningSteps() {
  return useQuery<PlanningStepConfig[]>({
    queryKey: STEPS_KEY,
    queryFn: () => fetchPlanningStepsApi(),
  });
}

export function useCreatePlanningStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PlanningStepConfigInput) => createPlanningStepApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STEPS_KEY });
    },
  });
}

export function useUpdatePlanningStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlanningStepConfigUpdateInput }) =>
      updatePlanningStepApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STEPS_KEY });
    },
  });
}

export function useDeletePlanningStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlanningStepApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STEPS_KEY });
    },
  });
}

export function useReorderPlanningSteps() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderPlanningStepsApi(orderedIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STEPS_KEY });
    },
  });
}
