"use client";

import * as React from "react";
import { StatusBadge } from "@/components/shared/workpaper/StatusBadge";
import { WorkpaperActions } from "@/components/shared/workpaper/WorkpaperActions";
import { HistorySheet } from "@/components/shared/workpaper/HistorySheet";
import { WpSignoffBar } from "@/components/shared/workpaper/WpSignoffBar";
import { WorkpaperDocument } from "@/components/shared/workpaper/WorkpaperDocument";
import { WorkflowChartDialog } from "@/components/shared/workpaper/WorkflowChartDialog";
import { useWorkpaperShell } from "@/components/shared/workpaper/useWorkpaperShell";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EngagementMember, WpSignoff, AuditObjective } from "../../types";
import type { JSONContent } from "@tiptap/react";
import type { WorkpaperTab } from "@/components/shared/workpaper/WorkpaperDocument";
import {
  ObjectivesTabContent,
  type PendingObjectiveData,
} from "./ObjectivesTabContent";

interface PlanningWorkpaperOverlayProps {
  workpaper: {
    id: string;
    content: unknown;
    approvalStatus: string;
    currentVersion: number;
    updatedAt: string;
  };
  engagementId: string;
  stepTitle: string;
  stepConfigKey?: string;
  onClose: () => void;
  members?: EngagementMember[];
  wpSignoffs?: WpSignoff[];
  auditObjectives?: AuditObjective[];
}

export function PlanningWorkpaperOverlay({
  workpaper,
  engagementId,
  stepTitle,
  stepConfigKey,
  onClose,
  members = [],
  wpSignoffs = [],
  auditObjectives = [],
}: PlanningWorkpaperOverlayProps) {
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
  const shell = useWorkpaperShell({
    entityType: "planning_workpaper",
    entityId: workpaper.id,
    engagementId,
    approvalStatus: workpaper.approvalStatus,
    currentVersion: workpaper.currentVersion,
    content: (workpaper.content as JSONContent) ?? null,
    updatedAt: workpaper.updatedAt,
    templateEntityType: workpaper.content ? null : "planning_workpaper",
    templateSubType: stepConfigKey,
    subType: stepConfigKey ?? "",
  });

  const objectivesTab: WorkpaperTab = React.useMemo(
    () => ({
      key: "objectives",
      label: "Mục tiêu",
      content: (
        <ObjectivesTabContent
          engagementId={engagementId}
          objectives={auditObjectives}
          pendingObjective={pendingObjective}
          onObjectiveCreated={handleObjectiveCreated}
          onCancelPendingObjective={handleCancelPendingObjective}
        />
      ),
      badge: auditObjectives.length || undefined,
    }),
    [
      engagementId,
      auditObjectives,
      pendingObjective,
      handleObjectiveCreated,
      handleCancelPendingObjective,
    ],
  );

  return (
    <>
      <WorkpaperDocument
        entityType="planning_workpaper"
        entityId={workpaper.id}
        engagementId={engagementId}
        title={stepTitle}
        content={shell.initialContent}
        onAutoSave={shell.handleAutoSave}
        onSave={async (content: JSONContent) => {
          await shell.handleAutoSave(content);
          onClose();
        }}
        onBack={onClose}
        isSaving={shell.isSavingContent}
        isLoadingContent={shell.isLoadingTemplate}
        initialLastSavedAt={shell.initialLastSavedAt}
        signoffBar={
          <WpSignoffBar
            entityType="planning_workpaper"
            entityId={workpaper.id}
            engagementId={engagementId}
            signoffs={wpSignoffs}
            currentVersion={workpaper.currentVersion}
            onViewVersion={shell.setViewVersion}
            subType={stepConfigKey ?? ""}
            actions={
              <WorkpaperActions
                transitions={shell.transitions}
                onTransition={shell.handleTransition}
                isTransitioning={shell.isTransitioning}
                onViewWorkflow={() => shell.setWorkflowChartOpen(true)}
                members={members}
              />
            }
          />
        }
        headerExtra={(autoSave) => (
          <>
            <StatusBadge status={workpaper.approvalStatus} />

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await autoSave.saveNow?.();
                shell.saveVersion();
              }}
              disabled={shell.isSavingVersion}
              title="Lưu phiên bản"
            >
              <Save className="h-4 w-4" />
            </Button>

            <HistorySheet
              versions={shell.versions}
              currentVersion={workpaper.currentVersion}
              onViewVersion={shell.setViewVersion}
              onRestoreVersion={(v) => shell.handleRestore(v)}
              isRestoring={shell.isRestoring}
              autoSaveStatus={autoSave.status}
              autoSaveLastSavedAt={autoSave.lastSavedAt}
            />
          </>
        )}
        tabs={[objectivesTab]}
        defaultTab="objectives"
        commentsTabLabel="Soát xét"
        onAddObjective={handleAddObjective}
        objectiveTabKey="objectives"
        threads={shell.threads}
        onCreateThread={shell.handleCreateThread}
        onReplyToThread={shell.handleReplyToThread}
        onResolveThread={shell.handleResolveThread}
        onReopenThread={shell.handleReopenThread}
        onDeleteThread={shell.handleDeleteThread}
        isCreatingThread={shell.isCreatingThread}
        isReplying={shell.isReplying}
      />

      {/* Version detail dialog */}
      <Dialog
        open={shell.viewVersion !== null}
        onOpenChange={(open) => {
          if (!open) shell.setViewVersion(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Phiên bản {shell.viewVersion}</DialogTitle>
            {shell.versionDetail?.comment && (
              <DialogDescription>
                {shell.versionDetail.comment}
              </DialogDescription>
            )}
          </DialogHeader>
          {shell.versionDetail?.snapshot ? (
            <div className="space-y-3 text-sm">
              {Object.entries(
                shell.versionDetail.snapshot as Record<string, unknown>,
              ).map(([key, value]) =>
                value != null && value !== "" ? (
                  <div key={key}>
                    <span className="font-medium text-muted-foreground">
                      {key}
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap break-words">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2).slice(0, 500)
                        : String(value)}
                    </p>
                  </div>
                ) : null,
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          )}
        </DialogContent>
      </Dialog>

      <WorkflowChartDialog
        open={shell.workflowChartOpen}
        onOpenChange={shell.setWorkflowChartOpen}
        entityType="planning_workpaper"
        currentStatus={workpaper.approvalStatus}
      />
    </>
  );
}
