import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  fetchApprovalStatusesApi,
  createApprovalStatusApi,
  updateApprovalStatusApi,
  deleteApprovalStatusApi,
  restoreApprovalStatusApi,
} from '../api';
import type {
  ApprovalStatusItem,
  ApprovalStatusInput,
  ApprovalStatusUpdateInput,
  StatusCategory,
} from '../types';

// =============================================================================
// QUERY KEY
// =============================================================================

const STATUSES_KEY = ['approval-statuses'] as const;

// =============================================================================
// QUERIES
// =============================================================================

export function useApprovalStatuses() {
  return useQuery<ApprovalStatusItem[]>({
    queryKey: STATUSES_KEY,
    queryFn: fetchApprovalStatusesApi,
    staleTime: Infinity,
  });
}

/**
 * Returns only non-archived statuses.
 * Used by config UIs (transition form dropdowns, workflow setup).
 */
export function useActiveStatuses() {
  const { data: statuses = [] } = useApprovalStatuses();
  return useMemo(() => statuses.filter((s) => !s.isArchived), [statuses]);
}

/**
 * Returns a Map<statusKey, ApprovalStatusItem> for O(1) lookup.
 * Includes archived statuses so historical data always resolves.
 * Used by StatusBadge, PlanningCardStatus, WpApprovalBar, etc.
 */
export function useStatusMap() {
  const { data: statuses = [] } = useApprovalStatuses();
  return useMemo(() => {
    const map = new Map<string, ApprovalStatusItem>();
    for (const s of statuses) {
      map.set(s.key, s);
    }
    return map;
  }, [statuses]);
}

/**
 * Returns the status category for a given status key.
 * Falls back to 'active' for unknown statuses (editable by default).
 */
export function useStatusCategory(statusKey: string): StatusCategory {
  const map = useStatusMap();
  return map.get(statusKey)?.category ?? 'active';
}

/**
 * Returns whether the entity is in a read-only state (review or done category).
 */
export function useIsReviewMode(statusKey: string): boolean {
  const category = useStatusCategory(statusKey);
  return category === 'review' || category === 'done';
}

// =============================================================================
// MUTATIONS
// =============================================================================

export function useCreateApprovalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ApprovalStatusInput) => createApprovalStatusApi(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUSES_KEY }),
  });
}

export function useUpdateApprovalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApprovalStatusUpdateInput }) =>
      updateApprovalStatusApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUSES_KEY }),
  });
}

export function useDeleteApprovalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApprovalStatusApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUSES_KEY }),
  });
}

export function useRestoreApprovalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreApprovalStatusApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUSES_KEY }),
  });
}
