"use client";

import * as React from "react";
import type { JSONContent } from "@tiptap/react";
import {
  useCommentThreads,
  useCreateCommentThread,
  useAddCommentReply,
  useUpdateThreadStatus,
  useDeleteCommentThread,
  useAvailableTransitions,
  useExecuteTransition,
  useWpSignoffs,
} from "@/features/engagement/hooks/useEngagements";
import { useWorkpaperContentSave } from "@/hooks/useWorkpaper";
import { WorkpaperViewer } from "@/components/shared/workpaper/WorkpaperViewer";
import { WpSignoffBar } from "@/components/shared/workpaper/WpSignoffBar";
import { WorkpaperActions } from "@/components/shared/workpaper/WorkpaperActions";
import { autoTransitionApi } from "@/features/engagement/api";
import type {
  WpThreadType,
  EngagementMember,
  WpSignoff,
} from "@/features/engagement/types";
import { useQueryClient } from "@tanstack/react-query";

interface InlineWorkpaperViewerProps {
  engagementId: string;
  entityId: string;
  content: unknown;
  entityType?: string;
  className?: string;
  approvalStatus?: string;
  currentVersion?: number;
  members?: EngagementMember[];
  wpSignoffs?: WpSignoff[];
  /** Optional edit button rendered inside the signoff bar */
  editButton?: React.ReactNode;
  /** Default right sidebar content shown when comments sidebar is closed */
  defaultSidebar?: React.ReactNode;
}

export function InlineWorkpaperViewer({
  engagementId,
  entityId,
  content,
  entityType = "planning_workpaper",
  className,
  approvalStatus,
  currentVersion = 0,
  members = [],
  wpSignoffs,
  editButton,
  defaultSidebar,
}: InlineWorkpaperViewerProps) {
  const queryClient = useQueryClient();
  const { data: threads = [] } = useCommentThreads(
    engagementId,
    entityType,
    entityId,
  );
  const createThread = useCreateCommentThread();
  const addReply = useAddCommentReply();
  const updateStatus = useUpdateThreadStatus();
  const deleteThread = useDeleteCommentThread();
  const contentMutation = useWorkpaperContentSave();

  // ── Transitions / Approval ──
  const { data: transitions = [] } = useAvailableTransitions(
    entityType,
    entityId,
  );
  const transitionMutation = useExecuteTransition();
  const { data: fetchedSignoffs = [] } = useWpSignoffs(engagementId);
  const signoffs = wpSignoffs ?? fetchedSignoffs;

  const handleTransition = React.useCallback(
    async (transitionId: string, comment?: string, nextAssigneeId?: string) => {
      await transitionMutation.mutateAsync({
        entityType,
        entityId,
        engagementId,
        transitionId,
        comment,
        nextAssigneeId,
      });
      // Fire auto-transition after manual transition
      try {
        await autoTransitionApi(entityType, entityId, "status_change");
      } catch {
        // non-critical
      }
      queryClient.invalidateQueries({
        queryKey: ["planning-workpapers", engagementId],
      });
    },
    [transitionMutation, entityType, entityId, engagementId, queryClient],
  );

  const handleCreateThread = React.useCallback(
    async (data: {
      quote: string;
      comment: string;
      threadType: WpThreadType;
    }) => {
      try {
        const t = await createThread.mutateAsync({
          engagementId,
          entityType,
          entityId,
          threadType: data.threadType,
          quote: data.quote,
          comment: data.comment,
        });
        return t.id;
      } catch {
        return undefined;
      }
    },
    [createThread, engagementId, entityType, entityId],
  );

  const handleReply = React.useCallback(
    (threadId: string, c: string) => {
      addReply.mutate({
        engagementId,
        threadId,
        content: c,
        entityType,
        entityId,
      });
    },
    [addReply, engagementId, entityType, entityId],
  );

  const handleResolve = React.useCallback(
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

  const handleReopen = React.useCallback(
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

  const handleDelete = React.useCallback(
    (threadId: string) => {
      deleteThread.mutate({ engagementId, threadId, entityType, entityId });
    },
    [deleteThread, engagementId, entityType, entityId],
  );

  const handleContentChange = React.useCallback(
    async (doc: JSONContent) => {
      await contentMutation.mutateAsync({
        entityType,
        engagementId,
        entityId,
        content: doc,
      });
    },
    [contentMutation, engagementId, entityType, entityId],
  );

  const signoffBar = approvalStatus ? (
    <WpSignoffBar
      entityType={entityType}
      entityId={entityId}
      engagementId={engagementId}
      signoffs={signoffs}
      currentVersion={currentVersion}
      compact
      actions={
        <WorkpaperActions
          transitions={transitions}
          onTransition={handleTransition}
          isTransitioning={transitionMutation.isPending}
          members={members}
          compact
        />
      }
      editButton={editButton}
    />
  ) : null;

  return (
    <WorkpaperViewer
      content={content as JSONContent | null}
      threads={threads}
      onCreateThread={handleCreateThread}
      onReplyToThread={handleReply}
      onResolveThread={handleResolve}
      onReopenThread={handleReopen}
      onDeleteThread={handleDelete}
      isCreatingThread={createThread.isPending}
      isReplying={addReply.isPending}
      onContentChange={handleContentChange}
      className={className}
      signoffBar={signoffBar}
      defaultSidebar={defaultSidebar}
    />
  );
}
