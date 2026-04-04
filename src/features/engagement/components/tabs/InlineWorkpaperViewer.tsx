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
import { WorkpaperEmptyState } from "@/components/shared/workpaper/WorkpaperEmptyState";
import { WpSignoffBar } from "@/components/shared/workpaper/WpSignoffBar";
import { WorkpaperActions } from "@/components/shared/workpaper/WorkpaperActions";
import { WorkflowChartDialog } from "@/components/shared/workpaper/WorkflowChartDialog";
import { autoTransitionApi } from "@/features/engagement/api";
import type {
  WpThreadType,
  EngagementMember,
  WpSignoff,
  AuditObjective,
} from "@/features/engagement/types";
import {
  ObjectivesTabContent,
  type PendingObjectiveData,
} from "./ObjectivesTabContent";
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
  /** Audit objectives for objective mark + sidebar support */
  auditObjectives?: AuditObjective[];
  /** Enable objectives feature (sidebar + bubble menu) */
  showObjectives?: boolean;
  /** If provided and content is null, shows WorkpaperEmptyState with this callback */
  onStart?: () => void;
  /** Loading state for the empty-state CTA button */
  isStartLoading?: boolean;
  /** Sub-type for workflow resolution (e.g. planning step key) */
  subType?: string;
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
  auditObjectives = [],
  showObjectives = false,
  onStart,
  isStartLoading = false,
  subType = "",
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
        subType,
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
    [
      transitionMutation,
      entityType,
      entityId,
      engagementId,
      queryClient,
      subType,
    ],
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

  // ── Workflow chart dialog ──
  const [workflowChartOpen, setWorkflowChartOpen] = React.useState(false);

  // ── Objectives state (optional) ──
  const [pendingObjective, setPendingObjective] =
    React.useState<PendingObjectiveData | null>(null);

  const handleAddObjective = React.useCallback(
    (quote: string, _from: number, _to: number) => {
      setPendingObjective({ quote, selection: { from: _from, to: _to } });
    },
    [],
  );

  const handleObjectiveCreated = React.useCallback(
    (_objectiveId: string, _from: number, _to: number) => {
      setPendingObjective(null);
    },
    [],
  );

  const handleCancelPendingObjective = React.useCallback(() => {
    setPendingObjective(null);
  }, []);

  // Show empty state when no content and onStart is provided
  if (!content && onStart) {
    return <WorkpaperEmptyState onStart={onStart} isLoading={isStartLoading} />;
  }

  const objectivesSidebar = showObjectives ? (
    <ObjectivesTabContent
      engagementId={engagementId}
      objectives={auditObjectives}
      pendingObjective={pendingObjective}
      onObjectiveCreated={handleObjectiveCreated}
      onCancelPendingObjective={handleCancelPendingObjective}
    />
  ) : undefined;

  const signoffBar = approvalStatus ? (
    <WpSignoffBar
      entityType={entityType}
      entityId={entityId}
      engagementId={engagementId}
      signoffs={signoffs}
      currentVersion={currentVersion}
      compact
      subType={subType}
      actions={
        <WorkpaperActions
          transitions={transitions}
          onTransition={handleTransition}
          isTransitioning={transitionMutation.isPending}
          onViewWorkflow={() => setWorkflowChartOpen(true)}
          members={members}
          compact
        />
      }
      editButton={editButton}
    />
  ) : null;

  return (
    <>
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
        onAddObjective={showObjectives ? handleAddObjective : undefined}
        defaultSidebar={objectivesSidebar}
      />
      <WorkflowChartDialog
        open={workflowChartOpen}
        onOpenChange={setWorkflowChartOpen}
        entityType={entityType}
        currentStatus={approvalStatus ?? "not_started"}
        subType={subType}
      />
    </>
  );
}
