"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  saveWorkpaperContentApi,
  fetchWorkpaperVersionsApi,
  fetchWorkpaperVersionApi,
  restoreWorkpaperVersionApi,
  createManualVersionApi,
} from '@/features/engagement/api';

// =============================================================================
// QUERY KEYS
// =============================================================================

const workpaperVersionsKey = (entityType: string, entityId: string) =>
  ['workpaperVersions', entityType, entityId];

const workpaperVersionKey = (entityType: string, entityId: string, version: number | null) =>
  ['workpaperVersion', entityType, entityId, version];

const engagementKey = (engagementId: string) => ['engagement', engagementId];

// =============================================================================
// CONTENT SAVE
// =============================================================================

export function useWorkpaperContentSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityType,
      engagementId,
      entityId,
      content,
    }: {
      entityType: string;
      engagementId: string;
      entityId: string;
      content: unknown;
    }) => saveWorkpaperContentApi(entityType, engagementId, entityId, content),
    onSuccess: (_, { engagementId, entityType }) => {
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
      // Also invalidate planning workpapers cache when saving planning workpapers
      // This causes inline viewers to auto-refresh with new content
      if (entityType === 'planning_workpaper') {
        qc.invalidateQueries({
          queryKey: ['planning-workpapers', engagementId]
        });
      }
    },
  });
}

// =============================================================================
// VERSION LIST
// =============================================================================

export function useWorkpaperVersions(
  entityType: string,
  engagementId: string,
  entityId: string,
) {
  return useQuery({
    queryKey: workpaperVersionsKey(entityType, entityId),
    queryFn: () => fetchWorkpaperVersionsApi(entityType, engagementId, entityId),
    enabled: !!entityType && !!engagementId && !!entityId,
  });
}

// =============================================================================
// SINGLE VERSION (with snapshot)
// =============================================================================

export function useWorkpaperVersion(
  entityType: string,
  engagementId: string,
  entityId: string,
  version: number | null,
) {
  return useQuery({
    queryKey: workpaperVersionKey(entityType, entityId, version),
    queryFn: () => fetchWorkpaperVersionApi(entityType, engagementId, entityId, version!),
    enabled: !!entityType && !!engagementId && !!entityId && version !== null,
  });
}

// =============================================================================
// RESTORE VERSION
// =============================================================================

// =============================================================================
// CREATE MANUAL VERSION
// =============================================================================

export function useCreateManualVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityType,
      engagementId,
      entityId,
      description,
    }: {
      entityType: string;
      engagementId: string;
      entityId: string;
      description?: string;
    }) => createManualVersionApi(entityType, engagementId, entityId, description),
    onSuccess: (_, { entityType, entityId, engagementId }) => {
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
      qc.invalidateQueries({ queryKey: workpaperVersionsKey(entityType, entityId) });
    },
  });
}

// =============================================================================
// RESTORE VERSION
// =============================================================================

export function useRestoreWorkpaperVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityType,
      engagementId,
      entityId,
      version,
    }: {
      entityType: string;
      engagementId: string;
      entityId: string;
      version: number;
    }) => restoreWorkpaperVersionApi(entityType, engagementId, entityId, version),
    onSuccess: (_, { entityType, entityId, engagementId }) => {
      qc.invalidateQueries({ queryKey: engagementKey(engagementId) });
      qc.invalidateQueries({ queryKey: workpaperVersionsKey(entityType, entityId) });
      qc.invalidateQueries({ queryKey: ['approvalTransitions', entityType, entityId] });
    },
  });
}
