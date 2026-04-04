"use client";

import * as React from "react";
import { StatusBadge } from "@/components/shared/workpaper/StatusBadge";
import { WorkpaperActions } from "@/components/shared/workpaper/WorkpaperActions";
import { HistorySheet } from "@/components/shared/workpaper/HistorySheet";
import { WpSignoffBar } from "@/components/shared/workpaper/WpSignoffBar";
import { WorkpaperDocument } from "@/components/shared/workpaper/WorkpaperDocument";
import { WorkflowChartDialog } from "@/components/shared/workpaper/WorkflowChartDialog";
import { VersionPreviewDialog } from "@/components/shared/workpaper/VersionPreviewDialog";
import { useWorkpaperShell } from "@/components/shared/workpaper/useWorkpaperShell";
import { VersionSaveContent } from "./VersionDescriptionDialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const isScope = stepConfigKey === "scope";

  const [pendingObjective, setPendingObjective] =
    React.useState<PendingObjectiveData | null>(null);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = React.useState(false);
  const saveNowRef = React.useRef<(() => void) | null>(null);

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

  // Keyboard shortcut: Ctrl/Cmd+S → save content then open version popover
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && !descriptionDialogOpen) {
        e.preventDefault();
        e.stopImmediatePropagation();
        saveNowRef.current?.();
        setDescriptionDialogOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [descriptionDialogOpen]);

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
        headerExtra={(autoSave) => {
          saveNowRef.current = autoSave.saveNow ?? null;
          return (
          <>
            <StatusBadge status={workpaper.approvalStatus} />

            <div className="flex-1" />

            <Popover
              open={descriptionDialogOpen}
              onOpenChange={(o) => {
                if (!o) setDescriptionDialogOpen(false);
              }}
            >
              <PopoverTrigger
                render={
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      autoSave.saveNow?.();
                      setDescriptionDialogOpen(true);
                    }}
                    disabled={shell.isSavingVersion}
                  />
                }
              >
                Lưu phiên bản
              </PopoverTrigger>

              <PopoverContent align="end" className="w-80 p-0">
                <VersionSaveContent
                  onConfirm={async (description) => {
                    await shell.saveVersion(description);
                    setDescriptionDialogOpen(false);
                  }}
                  onCancel={() => setDescriptionDialogOpen(false)}
                  isLoading={shell.isSavingVersion}
                />
              </PopoverContent>
            </Popover>

            <HistorySheet
              versions={shell.versions}
              currentVersion={workpaper.currentVersion}
              onViewVersion={shell.setViewVersion}
              autoSaveStatus={autoSave.status}
              autoSaveLastSavedAt={autoSave.lastSavedAt}
              signoffs={wpSignoffs}
            />
          </>
          );
        }}
        tabs={isScope ? [objectivesTab] : []}
        defaultTab={isScope ? "objectives" : undefined}
        commentsTabLabel="Soát xét"
        onAddObjective={isScope ? handleAddObjective : undefined}
        objectiveTabKey={isScope ? "objectives" : undefined}
        threads={shell.threads}
        onCreateThread={shell.handleCreateThread}
        onReplyToThread={shell.handleReplyToThread}
        onResolveThread={shell.handleResolveThread}
        onReopenThread={shell.handleReopenThread}
        onDeleteThread={shell.handleDeleteThread}
        isCreatingThread={shell.isCreatingThread}
        isReplying={shell.isReplying}
      />

      <VersionPreviewDialog
        entityType="planning_workpaper"
        entityId={workpaper.id}
        engagementId={engagementId}
        version={shell.viewVersion}
        onClose={() => shell.setViewVersion(null)}
        onRestore={shell.handleRestore}
        isRestoring={shell.isRestoring}
        currentVersion={workpaper.currentVersion}
        signoffs={wpSignoffs}
      />

      <WorkflowChartDialog
        open={shell.workflowChartOpen}
        onOpenChange={shell.setWorkflowChartOpen}
        entityType="planning_workpaper"
        currentStatus={workpaper.approvalStatus}
        subType={stepConfigKey ?? ""}
      />

    </>
  );
}
