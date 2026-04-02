"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCommentThreads,
  useCreateCommentThread,
  useAddCommentReply,
  useUpdateThreadStatus,
  useDeleteCommentThread,
  useAvailableTransitions,
  useExecuteTransition,
} from "@/features/engagement/hooks/useEngagements";
import {
  useWorkpaperContentSave,
  useWorkpaperVersions,
  useWorkpaperVersion,
  useRestoreWorkpaperVersion,
} from "@/hooks/useWorkpaper";
import { useTemplateForEntity } from "@/features/settings/hooks/useTemplates";
import { autoTransitionApi } from "@/features/engagement/api";
import type { JSONContent } from "@tiptap/react";
import type {
  WpThreadType,
} from "@/features/engagement/types";

// =============================================================================
// TYPES
// =============================================================================

export interface UseWorkpaperShellParams {
  entityType: string;
  entityId: string;
  engagementId: string;
  /** Current approval status of the entity (e.g. "not_started", "in_progress") */
  approvalStatus: string;
  /** Current version number from the entity */
  currentVersion: number;
  /** Initial content (Tiptap JSON) */
  content: JSONContent | null;
  /** Entity's updatedAt for the auto-save initial timestamp */
  updatedAt?: string | null;
  /** If provided and content is null, fetch the assigned template for this entity type */
  templateEntityType?: string | null;
  /** Sub-type for template lookup (e.g. planning step config key) */
  templateSubType?: string;
  /** Fallback content when both saved content and template are absent */
  fallbackContent?: JSONContent | null;
}

export interface UseWorkpaperShellReturn {
  // Comments
  threads: ReturnType<typeof useCommentThreads>["data"];
  handleCreateThread: (data: {
    quote: string;
    comment: string;
    threadType: WpThreadType;
  }) => Promise<string | undefined>;
  handleReplyToThread: (threadId: string, content: string) => void;
  handleResolveThread: (threadId: string) => void;
  handleReopenThread: (threadId: string) => void;
  handleDeleteThread: (threadId: string) => void;
  isCreatingThread: boolean;
  isReplying: boolean;

  // Versions
  versions: NonNullable<ReturnType<typeof useWorkpaperVersions>["data"]>;
  viewVersion: number | null;
  setViewVersion: React.Dispatch<React.SetStateAction<number | null>>;
  versionDetail: ReturnType<typeof useWorkpaperVersion>["data"];
  handleRestore: (version: number) => Promise<void>;
  isRestoring: boolean;

  // Transitions / Approval
  transitions: NonNullable<ReturnType<typeof useAvailableTransitions>["data"]>;
  handleTransition: (
    transitionId: string,
    comment?: string,
    nextAssigneeId?: string,
  ) => Promise<void>;
  isTransitioning: boolean;

  // Workflow chart
  workflowChartOpen: boolean;
  setWorkflowChartOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Auto-save handler
  handleAutoSave: (content: JSONContent) => Promise<void>;
  isSavingContent: boolean;

  // Initial content & meta
  initialContent: JSONContent | null;
  initialLastSavedAt: Date | null;
}

// =============================================================================
// HOOK
// =============================================================================

export function useWorkpaperShell(
  params: UseWorkpaperShellParams,
): UseWorkpaperShellReturn {
  const {
    entityType,
    entityId,
    engagementId,
    approvalStatus,
    content,
    updatedAt,
    templateEntityType,
    templateSubType,
    fallbackContent,
  } = params;

  // ── Template fetch (only when content is empty) ──
  const shouldFetchTemplate = !content && !!templateEntityType;
  const { data: templateData } = useTemplateForEntity(
    shouldFetchTemplate ? templateEntityType : null,
    templateSubType,
  );

  const queryClient = useQueryClient();
  const contentMutation = useWorkpaperContentSave();

  // ── Comments ──
  const { data: threads = [] } = useCommentThreads(
    engagementId,
    entityType,
    entityId,
  );
  const createThread = useCreateCommentThread();
  const addReply = useAddCommentReply();
  const updateStatus = useUpdateThreadStatus();
  const deleteThread = useDeleteCommentThread();

  // ── Versioning ──
  const { data: versions = [] } = useWorkpaperVersions(
    entityType,
    engagementId,
    entityId,
  );
  const [viewVersion, setViewVersion] = React.useState<number | null>(null);
  const { data: versionDetail } = useWorkpaperVersion(
    entityType,
    engagementId,
    entityId,
    viewVersion,
  );
  const restoreMutation = useRestoreWorkpaperVersion();

  // ── Transitions / Approval ──
  const { data: transitions = [] } = useAvailableTransitions(
    entityType,
    entityId,
  );
  const transitionMutation = useExecuteTransition();

  // ── Workflow chart ──
  const [workflowChartOpen, setWorkflowChartOpen] = React.useState(false);

  // ── Auto-transition tracking ──
  const autoTransitionFired = React.useRef(false);

  // ── Initial content (prefer entity content → template → fallback) ──
  const initialContent = React.useMemo<JSONContent | null>(() => {
    if (content) return content as JSONContent;
    if (templateData?.content) return templateData.content as JSONContent;
    if (fallbackContent) return fallbackContent as JSONContent;
    return null;
  }, [content, templateData, fallbackContent]);

  const initialLastSavedAt = React.useMemo<Date | null>(
    () => (updatedAt ? new Date(updatedAt) : null),
    [updatedAt],
  );

  // ── Auto-save handler ──
  const handleAutoSave = React.useCallback(
    async (doc: JSONContent) => {
      await contentMutation.mutateAsync({
        entityType,
        engagementId,
        entityId,
        content: doc,
      });

      // Auto-transition: not_started → in_progress on first edit
      if (
        !autoTransitionFired.current &&
        approvalStatus === "not_started"
      ) {
        autoTransitionFired.current = true;
        try {
          await autoTransitionApi(entityType, entityId, "start");
          queryClient.invalidateQueries({
            queryKey: ["approvalTransitions", entityType, entityId],
          });
          queryClient.invalidateQueries({
            queryKey: ["engagement", engagementId],
          });
          queryClient.invalidateQueries({
            queryKey: ["workpaperVersions", entityType, entityId],
          });
        } catch {
          // Non-critical
        }
      }
    },
    [contentMutation, entityType, entityId, engagementId, approvalStatus, queryClient],
  );

  // ── Transition handler ──
  const handleTransition = React.useCallback(
    async (
      transitionId: string,
      comment?: string,
      nextAssigneeId?: string,
    ) => {
      try {
        await transitionMutation.mutateAsync({
          entityType,
          entityId,
          transitionId,
          engagementId,
          comment,
          nextAssigneeId,
        });
      } catch {
        // Error handled by mutation state
      }
    },
    [transitionMutation, entityType, entityId, engagementId],
  );

  // ── Restore handler ──
  const handleRestore = React.useCallback(
    async (version: number) => {
      try {
        await restoreMutation.mutateAsync({
          entityType,
          engagementId,
          entityId,
          version,
        });
      } catch {
        // Error handled by mutation state
      }
    },
    [restoreMutation, entityType, engagementId, entityId],
  );

  // ── Comment handlers ──
  const handleCreateThread = React.useCallback(
    async (data: {
      quote: string;
      comment: string;
      threadType: WpThreadType;
    }): Promise<string | undefined> => {
      try {
        const thread = await createThread.mutateAsync({
          engagementId,
          entityType,
          entityId,
          threadType: data.threadType,
          quote: data.quote,
          comment: data.comment,
        });
        return thread.id;
      } catch {
        return undefined;
      }
    },
    [createThread, engagementId, entityType, entityId],
  );

  const handleReplyToThread = React.useCallback(
    (threadId: string, replyContent: string) => {
      addReply.mutate({
        engagementId,
        threadId,
        content: replyContent,
        entityType,
        entityId,
      });
    },
    [addReply, engagementId, entityType, entityId],
  );

  const handleResolveThread = React.useCallback(
    (threadId: string) => {
      updateStatus.mutate({
        engagementId,
        threadId,
        status: "resolved",
        entityType,
        entityId,
      });
    },
    [updateStatus, engagementId, entityType, entityId],
  );

  const handleReopenThread = React.useCallback(
    (threadId: string) => {
      updateStatus.mutate({
        engagementId,
        threadId,
        status: "open",
        entityType,
        entityId,
      });
    },
    [updateStatus, engagementId, entityType, entityId],
  );

  const handleDeleteThread = React.useCallback(
    (threadId: string) => {
      deleteThread.mutate({
        engagementId,
        threadId,
        entityType,
        entityId,
      });
    },
    [deleteThread, engagementId, entityType, entityId],
  );

  return {
    // Comments
    threads,
    handleCreateThread,
    handleReplyToThread,
    handleResolveThread,
    handleReopenThread,
    handleDeleteThread,
    isCreatingThread: createThread.isPending,
    isReplying: addReply.isPending,

    // Versions
    versions,
    viewVersion,
    setViewVersion,
    versionDetail,
    handleRestore,
    isRestoring: restoreMutation.isPending,

    // Transitions
    transitions,
    handleTransition,
    isTransitioning: transitionMutation.isPending,

    // Workflow chart
    workflowChartOpen,
    setWorkflowChartOpen,

    // Auto-save
    handleAutoSave,
    isSavingContent: contentMutation.isPending,

    // Initial data
    initialContent,
    initialLastSavedAt,
  };
}
