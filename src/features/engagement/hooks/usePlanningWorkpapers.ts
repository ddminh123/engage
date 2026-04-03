"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ROUTES } from "@/constants";
import { ApiError } from "@/lib/api-error";

interface PlanningWorkpaperData {
  id: string;
  engagementId: string;
  stepConfigId: string;
  content: unknown;
  approvalStatus: string;
  currentVersion: number;
  approvedBy: string | null;
  approvedAt: string | null;
  approvedVersion: number | null;
  createdAt: string;
  updatedAt: string;
  stepConfig?: {
    id: string;
    key: string;
    title: string;
    icon: string | null;
    stepType: string;
    sortOrder: number;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) throw new ApiError(response.status, json.error?.message ?? "Request failed", json.error?.code);
  return json.data;
}

export function usePlanningWorkpapers(engagementId: string) {
  return useQuery<PlanningWorkpaperData[]>({
    queryKey: ["planning-workpapers", engagementId],
    queryFn: async () => {
      const res = await fetch(API_ROUTES.ENGAGEMENT_PLANNING_WORKPAPERS(engagementId));
      return handleResponse<PlanningWorkpaperData[]>(res);
    },
  });
}

export function useGetOrCreatePlanningWorkpaper(engagementId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stepConfigId: string) => {
      const res = await fetch(API_ROUTES.ENGAGEMENT_PLANNING_WORKPAPERS(engagementId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepConfigId }),
      });
      return handleResponse<PlanningWorkpaperData>(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["planning-workpapers", engagementId] });
    },
  });
}

export function useUpdatePlanningWorkpaper(engagementId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ wpId, content }: { wpId: string; content: unknown }) => {
      const res = await fetch(
        API_ROUTES.ENGAGEMENT_PLANNING_WORKPAPER_BY_ID(engagementId, wpId),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      );
      return handleResponse<PlanningWorkpaperData>(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["planning-workpapers", engagementId] });
    },
  });
}
