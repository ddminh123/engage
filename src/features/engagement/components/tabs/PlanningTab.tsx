"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Target,
  ShieldAlert,
  ClipboardList,
  BookOpen,
  FileText,
  Check,
  X,
  Shield,
  Layers,
  ArrowUpToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import {
  SortableList,
  DragHandle,
  type DragHandleRenderProps,
} from "@/components/shared/SortableList";
import { RichTextDisplay } from "@/components/shared/RichTextEditor";
import { InlineWorkpaperViewer } from "./InlineWorkpaperViewer";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { Building2, User } from "lucide-react";
import { OrgUnitCardPopover } from "@/features/settings/components/OrgUnitCard";
import { ContactCardPopoverById } from "@/features/settings/components/ContactCard";
import { usePlanningEditor } from "../../hooks/usePlanningEditor";
import { useIsReviewMode } from "@/features/settings/hooks/useApprovalStatuses";
import { StatusBadge } from "@/components/shared/workpaper/StatusBadge";
import { HistorySheet } from "@/components/shared/workpaper/HistorySheet";
import { useWorkpaperVersions } from "@/hooks/useWorkpaper";
import { useSyncRcmToWorkProgram } from "../../hooks/useEngagements";
import { usePlanningSteps } from "@/features/settings/hooks/usePlanningSteps";
import { usePlanningWorkpapers } from "../../hooks/usePlanningWorkpapers";
import type {
  PlanningState,
  PlanningAction,
} from "../../hooks/usePlanningEditor";
import { InlineInput } from "./InlineInput";
import { RcmDataTable } from "./RcmDataTable";
import { RcmTable } from "./RcmTable";
import { WorkpaperEmptyState } from "@/components/shared/workpaper/WorkpaperEmptyState";
import { WorkProgramV2 } from "../work-program";
import { PlanningCardStatus } from "./PlanningCardStatus";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import type {
  EngagementDetail,
  AuditObjective,
  EngagementRisk,
  EngagementControl,
  EngagementSection,
  EngagementObjective,
  EngagementProcedure,
} from "../../types";

const L = ENGAGEMENT_LABELS.engagement;
const LP = ENGAGEMENT_LABELS.planning;
const LAO = ENGAGEMENT_LABELS.auditObjective;
const LR = ENGAGEMENT_LABELS.risk;
const LPROC = ENGAGEMENT_LABELS.procedure;
const LS = ENGAGEMENT_LABELS.section;
const LO = ENGAGEMENT_LABELS.objective;

interface PlanningTabProps {
  engagement: EngagementDetail;
  section?: string; // If provided, only render this specific section
  onOpenWorkpaper?: (procedureId: string) => void;
  onOpenPlanningWp?: (stepConfigId: string) => void;
}

// Icon map: string name → Lucide component
const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Target,
  BookOpen,
  ShieldAlert,
  ShieldCheck: Shield,
  ClipboardList,
};

function StepIcon({ name }: { name: string | null | undefined }) {
  const Icon = name ? ICON_MAP[name] : FileText;
  return Icon ? <Icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
}

export function PlanningTab({
  engagement,
  section,
  onOpenWorkpaper,
  onOpenPlanningWp,
}: PlanningTabProps) {
  const {
    state,
    dispatch,
    handleAddObjective,
    handleUpdateObjective,
    handleAddRisk,
    handleUpdateRisk,
    handleAddControl,
    handleUpdateControl,
    handleAddSection,
    handleUpdateSection,
    handleAddWpObjective,
    handleUpdateWpObjective,
    handleAddProcedure,
    handleUpdateProcedure,
    handleConfirmDelete,
    handleReorderAuditObjectives,
    handleMoveToTopAuditObjective,
  } = usePlanningEditor(engagement);

  const syncRcmToWp = useSyncRcmToWorkProgram();
  const [syncResult, setSyncResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch configurable step order
  const { data: stepConfigs } = usePlanningSteps();
  const { data: planningWorkpapers } = usePlanningWorkpapers(engagement.id);

  // Filter to planning-phase WP items only
  const planningSections = useMemo(
    () => engagement.sections.filter((s) => s.phase === "planning"),
    [engagement.sections],
  );
  const planningObjectives = useMemo(
    () =>
      (engagement.standaloneObjectives ?? []).filter(
        (o) => o.phase === "planning",
      ),
    [engagement.standaloneObjectives],
  );
  const planningProcedures = useMemo(
    () =>
      (engagement.ungroupedProcedures ?? []).filter(
        (p) => p.addedFrom === "planning",
      ),
    [engagement.ungroupedProcedures],
  );

  // Active steps sorted by sort_order, filtered by section if provided
  const activeSteps = useMemo(
    () =>
      (stepConfigs ?? [])
        .filter((s) => s.isActive)
        .filter((s) => !section || s.key === section)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [stepConfigs, section],
  );

  // Map workpapers by stepConfigId for quick lookup
  const wpByStep = useMemo(() => {
    const map = new Map<
      string,
      typeof planningWorkpapers extends (infer T)[] | undefined ? T : never
    >();
    for (const wp of planningWorkpapers ?? []) {
      map.set(wp.stepConfigId, wp);
    }
    return map;
  }, [planningWorkpapers]);

  // Review mode: read-only when WP is in a review/done category
  const isReviewMode = useIsReviewMode(engagement.wpApprovalStatus);

  // Helper: build headerRight content for a planning card
  const cardHeaderRight = (
    entityType: string,
    entityId: string | undefined,
    status: string,
  ) => (
    <>
      <MemberAvatarGroup members={engagement.members} max={3} />
      {entityId ? (
        <PlanningCardStatus
          entityType={entityType}
          entityId={entityId}
          engagementId={engagement.id}
          status={status}
        />
      ) : (
        <StaticStatusBadge status={status} />
      )}
    </>
  );

  return (
    <div className="space-y-3">
      {/* ── Dynamic step rendering ── */}
      {activeSteps.map((step) => {
        switch (step.key) {
          case "scope": {
            const scopeWp = wpByStep.get(step.id);
            const scopeStatus = scopeWp?.approvalStatus ?? "not_started";
            const scopeHeaderRight = cardHeaderRight(
              "planning_workpaper",
              scopeWp?.id,
              scopeStatus,
            );

            // Section page view: show header + content directly
            if (section) {
              const scopeSectionHeaderRight = scopeWp ? (
                <ViewerVersionInfo
                  entityType="planning_workpaper"
                  entityId={scopeWp.id}
                  engagementId={engagement.id}
                  currentVersion={scopeWp.currentVersion}
                  updatedAt={scopeWp.updatedAt}
                />
              ) : null;

              const scopeEditButton = !isReviewMode ? (
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onOpenPlanningWp?.(step.id)}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Chỉnh sửa
                </Button>
              ) : null;

              return (
                <div key={step.key}>
                  <SectionPageHeader
                    title={step.title}
                    icon={<StepIcon name={step.icon} />}
                    titleExtra={<StatusBadge status={scopeStatus} />}
                    headerRight={scopeSectionHeaderRight}
                  />
                  {scopeWp?.content ? (
                    <InlineWorkpaperViewer
                      engagementId={engagement.id}
                      entityId={scopeWp.id}
                      content={scopeWp.content}
                      approvalStatus={scopeWp.approvalStatus}
                      currentVersion={scopeWp.currentVersion}
                      members={engagement.members}
                      editButton={scopeEditButton}
                      auditObjectives={engagement.auditObjectives}
                      showObjectives
                    />
                  ) : (
                    <ScopeSection
                      engagement={engagement}
                      onStart={() => onOpenPlanningWp?.(step.id)}
                    />
                  )}
                </div>
              );
            }

            // Main view: show navigable card
            return (
              <NavigableCard
                key={step.key}
                title={step.title}
                icon={<StepIcon name={step.icon} />}
                href={`/engagement/${engagement.id}?tab=planning&section=${step.key}`}
                headerRight={scopeHeaderRight}
              />
            );
          }

          case "objectives": {
            const objHeaderRight = cardHeaderRight(
              "work_program",
              undefined,
              "not_started",
            );

            // Main view: show navigable card
            if (!section) {
              return (
                <NavigableCard
                  key={step.key}
                  title={step.title}
                  icon={<StepIcon name={step.icon} />}
                  href={`/engagement/${engagement.id}?tab=planning&section=${step.key}`}
                  headerRight={objHeaderRight}
                />
              );
            }

            // Section page view: show header + content directly
            return (
              <div key={step.key}>
                <SectionPageHeader
                  title={step.title}
                  icon={<StepIcon name={step.icon} />}
                  headerRight={objHeaderRight}
                />
                {!isReviewMode && (
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => dispatch({ type: "START_ADD_OBJECTIVE" })}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {LAO.createTitle}
                    </Button>
                  </div>
                )}
                {engagement.auditObjectives.length === 0 &&
                  !state.addingObjective && (
                    <p className="py-2 text-sm text-muted-foreground">
                      {LAO.noData}
                    </p>
                  )}

                <SortableList
                  items={engagement.auditObjectives}
                  onReorder={handleReorderAuditObjectives}
                  renderItem={(obj, dragHandle) => {
                    const idx = engagement.auditObjectives.findIndex(
                      (o) => o.id === obj.id,
                    );
                    return (
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div className="group/row flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
                            <DragHandle {...dragHandle} />
                            <span className="w-6 text-center text-xs text-muted-foreground">
                              {idx + 1}
                            </span>

                            {state.editingObjectiveId === obj.id ? (
                              <InlineInput
                                value={state.editingObjectiveTitle}
                                onChange={(t) =>
                                  dispatch({
                                    type: "SET_EDITING_OBJECTIVE_TITLE",
                                    title: t,
                                  })
                                }
                                onSubmit={() => handleUpdateObjective(obj.id)}
                                onCancel={() =>
                                  dispatch({ type: "CANCEL_EDIT_OBJECTIVE" })
                                }
                                autoFocus
                              />
                            ) : (
                              <>
                                <span className="flex-1 text-sm">
                                  {obj.title}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() =>
                                    dispatch({
                                      type: "START_EDIT_OBJECTIVE",
                                      id: obj.id,
                                      title: obj.title,
                                    })
                                  }
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() =>
                                    dispatch({
                                      type: "SET_DELETE_TARGET",
                                      target: {
                                        type: "objective",
                                        id: obj.id,
                                        title: obj.title,
                                      },
                                    })
                                  }
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() =>
                              handleMoveToTopAuditObjective(obj.id)
                            }
                            disabled={idx === 0}
                          >
                            <ArrowUpToLine className="mr-2 h-3.5 w-3.5" />
                            Đưa lên đầu
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  }}
                />

                {state.addingObjective && (
                  <div className="px-2 py-1.5">
                    <InlineInput
                      value={state.addingObjectiveTitle}
                      onChange={(t) =>
                        dispatch({ type: "SET_OBJECTIVE_TITLE", title: t })
                      }
                      onSubmit={handleAddObjective}
                      onCancel={() =>
                        dispatch({ type: "CANCEL_ADD_OBJECTIVE" })
                      }
                      placeholder="Tên mục tiêu kiểm toán..."
                      icon={
                        <Target className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                      autoFocus
                    />
                  </div>
                )}
              </div>
            );
          }

          case "understanding": {
            const undWp = wpByStep.get(step.id);
            const undStatus = undWp?.approvalStatus ?? "not_started";
            const undHeaderRight = cardHeaderRight(
              "planning_workpaper",
              undWp?.id,
              undStatus,
            );

            // Main view: show navigable card
            if (!section) {
              return (
                <NavigableCard
                  key={step.key}
                  title={step.title}
                  icon={<StepIcon name={step.icon} />}
                  href={`/engagement/${engagement.id}?tab=planning&section=${step.key}`}
                  headerRight={undHeaderRight}
                />
              );
            }

            // Section page: version info right-aligned
            const undSectionHeaderRight = undWp ? (
              <ViewerVersionInfo
                entityType="planning_workpaper"
                entityId={undWp.id}
                engagementId={engagement.id}
                currentVersion={undWp.currentVersion}
                updatedAt={undWp.updatedAt}
              />
            ) : null;

            const undEditButton = !isReviewMode ? (
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => onOpenPlanningWp?.(step.id)}
              >
                <Pencil className="mr-1 h-3 w-3" />
                Chỉnh sửa
              </Button>
            ) : null;

            // Section page view: show header + inline viewer
            return (
              <div key={step.key}>
                <SectionPageHeader
                  title={step.title}
                  icon={<StepIcon name={step.icon} />}
                  titleExtra={<StatusBadge status={undStatus} />}
                  headerRight={undSectionHeaderRight}
                />
                {undWp?.content ? (
                  <InlineWorkpaperViewer
                    engagementId={engagement.id}
                    entityId={undWp.id}
                    content={undWp.content}
                    approvalStatus={undWp.approvalStatus}
                    currentVersion={undWp.currentVersion}
                    members={engagement.members}
                    editButton={undEditButton}
                  />
                ) : engagement.understanding ? (
                  <RichTextDisplay content={engagement.understanding} />
                ) : (
                  <WorkpaperEmptyState
                    onStart={() => onOpenPlanningWp?.(step.id)}
                  />
                )}
              </div>
            );
          }

          case "rcm": {
            const rcmHeaderRight = cardHeaderRight(
              "work_program",
              undefined,
              "not_started",
            );

            // Main view: show navigable card
            if (!section) {
              return (
                <NavigableCard
                  key={step.key}
                  title={step.title}
                  icon={<StepIcon name={step.icon} />}
                  href={`/engagement/${engagement.id}?tab=planning&section=${step.key}`}
                  headerRight={rcmHeaderRight}
                />
              );
            }

            // Section page view: show header + content directly
            return (
              <div key={step.key}>
                <SectionPageHeader
                  title={step.title}
                  icon={<StepIcon name={step.icon} />}
                  headerRight={rcmHeaderRight}
                />
                <RcmTable
                  engagementId={engagement.id}
                  rcmObjectives={engagement.rcmObjectives}
                  controls={engagement.controls}
                />
              </div>
            );
          }

          case "work_program": {
            const wpHeaderRight = cardHeaderRight(
              "work_program",
              engagement.id,
              engagement.wpApprovalStatus,
            );

            // Main view: show navigable card
            if (!section) {
              return (
                <NavigableCard
                  key={step.key}
                  title={step.title}
                  icon={<StepIcon name={step.icon} />}
                  href={`/engagement/${engagement.id}?tab=planning&section=${step.key}`}
                  headerRight={wpHeaderRight}
                />
              );
            }

            // Section page view: show header + content directly
            return (
              <div key={step.key}>
                <SectionPageHeader
                  title={step.title}
                  icon={<StepIcon name={step.icon} />}
                  headerRight={wpHeaderRight}
                />
                {!isReviewMode && (
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        syncRcmToWp.mutate(engagement.id, {
                          onSuccess: (data) => {
                            setSyncResult({
                              success: true,
                              message: `Đã tạo ${data.createdObjectives} mục tiêu và ${data.createdProcedures} thủ tục từ RCM`,
                            });
                          },
                          onError: () => {
                            setSyncResult({
                              success: false,
                              message: "Lỗi khi đồng bộ RCM sang Work Program",
                            });
                          },
                        });
                      }}
                      disabled={syncRcmToWp.isPending}
                    >
                      {syncRcmToWp.isPending ? "Đang tạo..." : "Tạo từ RCM"}
                    </Button>
                  </div>
                )}
                <WorkProgramV2
                  engagementId={engagement.id}
                  sections={planningSections}
                  standaloneObjectives={planningObjectives}
                  standaloneProcedures={planningProcedures}
                  findingCount={engagement.findings?.length ?? 0}
                  mode="planning"
                  rcmObjectives={engagement.rcmObjectives}
                  members={engagement.members}
                  readOnly={isReviewMode}
                  onOpenWorkpaper={onOpenWorkpaper}
                />
              </div>
            );
          }

          default: {
            // Custom workpaper step
            if (step.stepType !== "workpaper") return null;
            const wp = wpByStep.get(step.id);
            const customStatus = wp?.approvalStatus ?? "not_started";
            const customHeaderRight = cardHeaderRight(
              "planning_workpaper",
              wp?.id,
              customStatus,
            );

            // Main view: show navigable card
            if (!section) {
              return (
                <NavigableCard
                  key={step.key}
                  title={step.title}
                  icon={<StepIcon name={step.icon} />}
                  href={`/engagement/${engagement.id}?tab=planning&section=${step.key}`}
                  headerRight={customHeaderRight}
                />
              );
            }

            // Section page: version info right-aligned
            const customSectionHeaderRight = wp ? (
              <ViewerVersionInfo
                entityType="planning_workpaper"
                entityId={wp.id}
                engagementId={engagement.id}
                currentVersion={wp.currentVersion}
                updatedAt={wp.updatedAt}
              />
            ) : null;

            const customEditButton = !isReviewMode ? (
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => onOpenPlanningWp?.(step.id)}
              >
                <Pencil className="mr-1 h-3 w-3" />
                Chỉnh sửa
              </Button>
            ) : null;

            // Section page view: show header + full workpaper viewer
            return (
              <div key={step.key}>
                <SectionPageHeader
                  title={step.title}
                  icon={<StepIcon name={step.icon} />}
                  titleExtra={<StatusBadge status={customStatus} />}
                  headerRight={customSectionHeaderRight}
                />
                {wp?.content ? (
                  <InlineWorkpaperViewer
                    engagementId={engagement.id}
                    entityId={wp.id}
                    content={wp.content}
                    approvalStatus={wp.approvalStatus}
                    currentVersion={wp.currentVersion}
                    members={engagement.members}
                    editButton={customEditButton}
                  />
                ) : (
                  <WorkpaperEmptyState
                    onStart={() => onOpenPlanningWp?.(step.id)}
                  />
                )}
              </div>
            );
          }
        }
      })}

      {/* ── Delete confirmation ── */}
      <ConfirmDialog
        open={!!state.deleteTarget}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CLEAR_DELETE_TARGET" });
        }}
        title={
          state.deleteTarget?.type === "objective"
            ? LAO.deleteTitle
            : state.deleteTarget?.type === "risk"
              ? LR.deleteTitle
              : state.deleteTarget?.type === "control"
                ? "Xóa kiểm soát"
                : state.deleteTarget?.type === "section"
                  ? LS.deleteTitle
                  : state.deleteTarget?.type === "wp_objective"
                    ? LO.deleteTitle
                    : LPROC.deleteTitle
        }
        description={
          state.deleteTarget?.type === "objective"
            ? LAO.deleteDescription(state.deleteTarget?.title ?? "")
            : state.deleteTarget?.type === "risk"
              ? LR.deleteDescription(state.deleteTarget?.title ?? "")
              : state.deleteTarget?.type === "control"
                ? `Bạn có chắc chắn muốn xóa kiểm soát "${state.deleteTarget?.title ?? ""}"?`
                : state.deleteTarget?.type === "section"
                  ? LS.deleteDescription(state.deleteTarget?.title ?? "")
                  : state.deleteTarget?.type === "wp_objective"
                    ? LO.deleteDescription(state.deleteTarget?.title ?? "")
                    : LPROC.deleteDescription(state.deleteTarget?.title ?? "")
        }
        onConfirm={handleConfirmDelete}
      />

      {/* ── Sync RCM to WP result ── */}
      <ConfirmDialog
        open={!!syncResult}
        onOpenChange={(open) => {
          if (!open) setSyncResult(null);
        }}
        title={syncResult?.success ? "Thành công" : "Lỗi"}
        description={syncResult?.message ?? ""}
        onConfirm={() => setSyncResult(null)}
        variant={syncResult?.success ? "info" : "destructive"}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Sub-components
// ════════════════════════════════════════════════════════════════════════════════

function StaticStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

function MemberAvatarGroup({
  members,
  max = 3,
}: {
  members: {
    userId: string;
    role: string;
    user: { id: string; name: string; avatarUrl?: string | null };
  }[];
  max?: number;
}) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <UserAvatar
          key={m.userId}
          user={{
            id: m.user.id,
            name: m.user.name,
            avatarUrl: m.user.avatarUrl,
          }}
          size="sm"
          className={cn("ring-2 ring-background", i > 0 && "-ml-1.5")}
        />
      ))}
      {overflow > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium ring-2 ring-background -ml-1.5">
          +{overflow}
        </span>
      )}
    </div>
  );
}

// ── Collapsible Card ──

// Clickable card that navigates to a section page (used in main view)
function NavigableCard({
  title,
  icon,
  href,
  headerRight,
}: {
  title: string;
  icon?: React.ReactNode;
  href: string;
  headerRight?: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <Link
        href={href}
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-muted/50 transition-colors"
      >
        <span className="shrink-0 rounded p-0.5">
          <ChevronRight className="h-4 w-4" />
        </span>
        {icon}
        <span className="flex-1 text-sm font-semibold">{title}</span>
        {headerRight && (
          <span
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {headerRight}
          </span>
        )}
      </Link>
    </Card>
  );
}

// Header for section page view (no card wrapper)
function SectionPageHeader({
  title,
  icon,
  titleExtra,
  headerRight,
}: {
  title: string;
  icon?: React.ReactNode;
  /** Rendered immediately after the title (e.g. StatusBadge) */
  titleExtra?: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-lg font-semibold">{title}</h2>
      {titleExtra}
      <div className="flex-1" />
      {headerRight && (
        <div className="flex items-center gap-2">{headerRight}</div>
      )}
    </div>
  );
}

// ── Viewer Version Info (self-sustained sub-component for section view) ──

function ViewerVersionInfo({
  entityType,
  entityId,
  engagementId,
  currentVersion,
  updatedAt,
}: {
  entityType: string;
  entityId: string;
  engagementId: string;
  currentVersion: number;
  updatedAt?: string | null;
}) {
  const { data: versions = [] } = useWorkpaperVersions(
    entityType,
    engagementId,
    entityId,
  );

  return (
    <HistorySheet
      versions={versions}
      currentVersion={currentVersion}
      autoSaveStatus="idle"
      autoSaveLastSavedAt={updatedAt ? new Date(updatedAt) : null}
    />
  );
}

// ── Scope Section (simplified - general info moved to OverviewTab) ──

function ScopeSection({
  engagement,
  onStart,
}: {
  engagement: EngagementDetail;
  onStart?: () => void;
}) {
  const hasContent = engagement.objective || engagement.scope;

  if (!hasContent) {
    return (
      <WorkpaperEmptyState
        title="Chưa có thông tin phạm vi kiểm toán"
        onStart={onStart}
      />
    );
  }

  return (
    <div className="text-sm space-y-4">
      {engagement.objective && (
        <div>
          <div className="text-muted-foreground text-xs mb-1">
            {L.field.objective}
          </div>
          <div className="whitespace-pre-wrap">{engagement.objective}</div>
        </div>
      )}
      {engagement.scope && (
        <div>
          <div className="text-muted-foreground text-xs mb-1">
            {L.field.scope}
          </div>
          <div className="whitespace-pre-wrap">{engagement.scope}</div>
        </div>
      )}
    </div>
  );
}

// ── Risk & Control Section (3-level: Objective → Risk → Control) ──

const EFFECTIVENESS_OPTIONS = [
  { value: "", label: "— Chưa đánh giá —" },
  { value: "strong", label: LR.controlEffectiveness.strong },
  { value: "adequate", label: LR.controlEffectiveness.adequate },
  { value: "weak", label: LR.controlEffectiveness.weak },
  { value: "none", label: LR.controlEffectiveness.none },
];

const RISK_RATING_OPTIONS = [
  { value: "", label: "— Không chọn —" },
  { value: "low", label: LR.riskRating.low },
  { value: "medium", label: LR.riskRating.medium },
  { value: "high", label: LR.riskRating.high },
  { value: "critical", label: LR.riskRating.critical },
];

const RISK_RATING_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

function RiskControlSection({
  risks,
  objectives,
  state,
  dispatch,
  onAddRisk,
  onUpdateRisk,
  onAddControl,
  onUpdateControl,
}: {
  risks: EngagementRisk[];
  objectives: AuditObjective[];
  state: PlanningState;
  dispatch: React.Dispatch<PlanningAction>;
  onAddRisk: () => void;
  onUpdateRisk: (id: string) => void;
  onAddControl: (riskId: string) => void;
  onUpdateControl: (controlId: string, riskId: string) => void;
}) {
  const risksByObjective = useMemo(() => {
    const map = new Map<string | null, EngagementRisk[]>();
    for (const risk of risks) {
      const key = risk.rcmObjectiveId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(risk);
    }
    return map;
  }, [risks]);

  const ungroupedRisks = risksByObjective.get(null) ?? [];

  if (objectives.length === 0 && risks.length === 0 && !state.addingRisk) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <p className="text-sm text-muted-foreground">{LR.noData}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: "START_ADD_RISK" })}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {LR.createTitle}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {risks.length} {LR.title.toLowerCase()}
        </span>
      </div>

      {/* Objectives as bordered cards */}
      {objectives.map((obj) => {
        const objRisks = risksByObjective.get(obj.id) ?? [];
        const isAdding =
          state.addingRisk && state.addingRiskObjectiveId === obj.id;

        return (
          <div key={obj.id} className="rounded-lg border">
            {/* Objective header */}
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-2">
              <Target className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="flex-1 text-sm font-medium">{obj.title}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() =>
                  dispatch({ type: "START_ADD_RISK", objectiveId: obj.id })
                }
              >
                <Plus className="mr-1 h-3 w-3" />
                {LR.createTitle}
              </Button>
            </div>

            {/* Objective body — risks */}
            <div className="px-3 py-2 space-y-2">
              {objRisks.length === 0 && !isAdding && (
                <p className="py-1 text-xs text-muted-foreground">
                  {LR.noData}
                </p>
              )}

              {objRisks.map((risk) => (
                <RiskCard
                  key={risk.id}
                  risk={risk}
                  state={state}
                  dispatch={dispatch}
                  onUpdateRisk={onUpdateRisk}
                  onAddControl={onAddControl}
                  onUpdateControl={onUpdateControl}
                />
              ))}

              {isAdding && (
                <RiskAddRow
                  state={state}
                  dispatch={dispatch}
                  onAddRisk={onAddRisk}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Ungrouped risks */}
      {(ungroupedRisks.length > 0 ||
        (state.addingRisk && !state.addingRiskObjectiveId)) && (
        <div className="rounded-lg border">
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-xs font-medium text-muted-foreground">
              Rủi ro chung (không gắn mục tiêu)
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => dispatch({ type: "START_ADD_RISK" })}
            >
              <Plus className="mr-1 h-3 w-3" />
              {LR.createTitle}
            </Button>
          </div>
          <div className="px-3 py-2 space-y-2">
            {ungroupedRisks.map((risk) => (
              <RiskCard
                key={risk.id}
                risk={risk}
                state={state}
                dispatch={dispatch}
                onUpdateRisk={onUpdateRisk}
                onAddControl={onAddControl}
                onUpdateControl={onUpdateControl}
              />
            ))}

            {state.addingRisk && !state.addingRiskObjectiveId && (
              <RiskAddRow
                state={state}
                dispatch={dispatch}
                onAddRisk={onAddRisk}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Risk Add Row (inline) ──

function RiskAddRow({
  state,
  dispatch,
  onAddRisk,
}: {
  state: PlanningState;
  dispatch: React.Dispatch<PlanningAction>;
  onAddRisk: () => void;
}) {
  return (
    <div className="ml-2 border-l-2 border-orange-200 pl-3">
      <div className="flex items-center gap-2 py-1">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-orange-500" />
        <Input
          value={state.addingRiskDesc}
          onChange={(e) =>
            dispatch({ type: "SET_ADD_RISK_DESC", value: e.target.value })
          }
          placeholder="Mô tả rủi ro..."
          className="h-7 flex-1 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddRisk();
            if (e.key === "Escape") dispatch({ type: "CANCEL_ADD_RISK" });
          }}
          autoFocus
        />
        <LabeledSelect
          value={state.addingRiskRating}
          onChange={(v) => dispatch({ type: "SET_ADD_RISK_RATING", value: v })}
          options={RISK_RATING_OPTIONS}
          placeholder="Mức rủi ro..."
          className="h-7 w-36 text-xs"
        />
        <Button variant="ghost" size="icon-sm" onClick={onAddRisk}>
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => dispatch({ type: "CANCEL_ADD_RISK" })}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Single Risk Card with nested controls ──

function RiskCard({
  risk,
  state,
  dispatch,
  onUpdateRisk,
  onAddControl,
  onUpdateControl,
}: {
  risk: EngagementRisk;
  state: PlanningState;
  dispatch: React.Dispatch<PlanningAction>;
  onUpdateRisk: (id: string) => void;
  onAddControl: (riskId: string) => void;
  onUpdateControl: (controlId: string, riskId: string) => void;
}) {
  const isEditing = state.editingRiskId === risk.id;

  return (
    <div className="ml-2 border-l-2 border-orange-200 pl-3">
      {/* Risk header */}
      <div className="flex items-start gap-2 py-1.5">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={state.editingRiskDesc}
                onChange={(e) =>
                  dispatch({
                    type: "SET_EDIT_RISK_DESC",
                    value: e.target.value,
                  })
                }
                className="h-7 flex-1 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onUpdateRisk(risk.id);
                  if (e.key === "Escape")
                    dispatch({ type: "CANCEL_EDIT_RISK" });
                }}
                autoFocus
              />
              <LabeledSelect
                value={state.editingRiskRating}
                onChange={(v) =>
                  dispatch({ type: "SET_EDIT_RISK_RATING", value: v })
                }
                options={RISK_RATING_OPTIONS}
                placeholder="Mức rủi ro..."
                className="h-7 w-36 text-xs"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onUpdateRisk(risk.id)}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => dispatch({ type: "CANCEL_EDIT_RISK" })}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div>
              <span className="text-sm">{risk.riskDescription}</span>
              {risk.riskRating && (
                <Badge
                  variant="outline"
                  className={`ml-2 text-[10px] ${RISK_RATING_COLORS[risk.riskRating] ?? ""}`}
                >
                  {LR.riskRating[risk.riskRating] ?? risk.riskRating}
                </Badge>
              )}
            </div>
          )}
        </div>
        {!isEditing && (
          <div className="flex shrink-0 gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => dispatch({ type: "START_EDIT_RISK", risk })}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() =>
                dispatch({
                  type: "SET_DELETE_TARGET",
                  target: {
                    type: "risk",
                    id: risk.id,
                    title: risk.riskDescription.slice(0, 40),
                  },
                })
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="ml-4 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Kiểm soát ({risk.controls.length})
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() =>
              dispatch({ type: "START_ADD_CONTROL", riskId: risk.id })
            }
          >
            <Plus className="mr-1 h-3 w-3" />
            Thêm kiểm soát
          </Button>
        </div>

        {risk.controls.length === 0 &&
          state.addingControlForRiskId !== risk.id && (
            <p className="py-1 text-xs text-muted-foreground">
              Chưa có kiểm soát.
            </p>
          )}

        {risk.controls.map((ctrl) => (
          <ControlRow
            key={ctrl.id}
            control={ctrl}
            riskId={risk.id}
            state={state}
            dispatch={dispatch}
            onUpdateControl={onUpdateControl}
          />
        ))}

        {state.addingControlForRiskId === risk.id && (
          <div className="flex items-center gap-2 rounded bg-muted/30 p-1.5">
            <Shield className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <Input
              value={state.addingControlDesc}
              onChange={(e) =>
                dispatch({
                  type: "SET_ADD_CONTROL_DESC",
                  value: e.target.value,
                })
              }
              placeholder="Mô tả kiểm soát..."
              className="h-7 flex-1 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddControl(risk.id);
                if (e.key === "Escape")
                  dispatch({ type: "CANCEL_ADD_CONTROL" });
              }}
              autoFocus
            />
            <LabeledSelect
              value={state.addingControlEffectiveness}
              onChange={(v) =>
                dispatch({ type: "SET_ADD_CONTROL_EFFECTIVENESS", value: v })
              }
              options={EFFECTIVENESS_OPTIONS}
              placeholder="Đánh giá..."
              className="h-7 w-36 text-xs"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onAddControl(risk.id)}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => dispatch({ type: "CANCEL_ADD_CONTROL" })}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Single Control Row ──

function ControlRow({
  control,
  riskId,
  state,
  dispatch,
  onUpdateControl,
}: {
  control: EngagementControl;
  riskId: string;
  state: PlanningState;
  dispatch: React.Dispatch<PlanningAction>;
  onUpdateControl: (controlId: string, riskId: string) => void;
}) {
  const isEditing = state.editingControlId === control.id;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 rounded bg-muted/30 p-1.5">
        <Shield className="h-3.5 w-3.5 shrink-0 text-blue-400" />
        <Input
          value={state.editingControlDesc}
          onChange={(e) =>
            dispatch({ type: "SET_EDIT_CONTROL_DESC", value: e.target.value })
          }
          className="h-7 flex-1 text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") onUpdateControl(control.id, riskId);
            if (e.key === "Escape") dispatch({ type: "CANCEL_EDIT_CONTROL" });
          }}
          autoFocus
        />
        <LabeledSelect
          value={state.editingControlEffectiveness}
          onChange={(v) =>
            dispatch({ type: "SET_EDIT_CONTROL_EFFECTIVENESS", value: v })
          }
          options={EFFECTIVENESS_OPTIONS}
          placeholder="Đánh giá..."
          className="h-7 w-36 text-xs"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onUpdateControl(control.id, riskId)}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => dispatch({ type: "CANCEL_EDIT_CONTROL" })}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-muted/50">
      <Shield className="h-3.5 w-3.5 shrink-0 text-blue-400" />
      <span className="flex-1 text-xs">{control.description}</span>
      {control.effectiveness && (
        <Badge variant="outline" className="text-[10px]">
          {LR.controlEffectiveness[control.effectiveness] ??
            control.effectiveness}
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() =>
          dispatch({ type: "START_EDIT_CONTROL", control, riskId })
        }
      >
        <Pencil className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        onClick={() =>
          dispatch({
            type: "SET_DELETE_TARGET",
            target: {
              type: "control",
              id: control.id,
              riskId,
              title: control.description.slice(0, 40),
            },
          })
        }
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

// ── Work Program Section (Section → Objective → Procedure) ──

function WorkProgramSection({
  sections,
  state,
  dispatch,
  onAddSection,
  onUpdateSection,
  onAddWpObjective,
  onUpdateWpObjective,
  onAddProcedure,
  onUpdateProcedure,
}: {
  sections: EngagementSection[];
  state: PlanningState;
  dispatch: React.Dispatch<PlanningAction>;
  onAddSection: () => void;
  onUpdateSection: (id: string) => void;
  onAddWpObjective: (sectionId: string) => void;
  onUpdateWpObjective: (id: string) => void;
  onAddProcedure: (key: string) => void;
  onUpdateProcedure: (id: string) => void;
}) {
  if (sections.length === 0 && !state.addingSection) {
    return (
      <div>
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => dispatch({ type: "START_ADD_SECTION" })}
          >
            <Plus className="mr-1 h-3 w-3" />
            {LS.createTitle}
          </Button>
        </div>
        <p className="py-4 text-center text-sm text-muted-foreground">
          Chưa có phần nào. Nhấn &quot;{LS.createTitle}&quot; để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => dispatch({ type: "START_ADD_SECTION" })}
        >
          <Plus className="mr-1 h-3 w-3" />
          {LS.createTitle}
        </Button>
      </div>
      {sections.map((sec) => (
        <div key={sec.id} className="rounded-lg border">
          {/* Section header */}
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-2">
            <Layers className="h-4 w-4 shrink-0 text-blue-600" />
            {state.editingSectionId === sec.id ? (
              <InlineInput
                value={state.editingSectionTitle}
                onChange={(t) =>
                  dispatch({ type: "SET_EDITING_SECTION_TITLE", title: t })
                }
                onSubmit={() => onUpdateSection(sec.id)}
                onCancel={() => dispatch({ type: "CANCEL_EDIT_SECTION" })}
                autoFocus
              />
            ) : (
              <>
                <span className="flex-1 text-sm font-medium">{sec.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() =>
                    dispatch({ type: "START_ADD_WP_OBJ", sectionId: sec.id })
                  }
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {LO.createTitle}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() =>
                    dispatch({
                      type: "START_ADD_PROCEDURE",
                      key: `sec:${sec.id}`,
                    })
                  }
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {LPROC.createTitle}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    dispatch({
                      type: "START_EDIT_SECTION",
                      id: sec.id,
                      title: sec.title,
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() =>
                    dispatch({
                      type: "SET_DELETE_TARGET",
                      target: { type: "section", id: sec.id, title: sec.title },
                    })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>

          {/* Section body */}
          <div className="px-3 py-2 space-y-2">
            {/* Objectives under this section */}
            {sec.objectives.map((obj) => (
              <div key={obj.id} className="ml-2 border-l-2 border-muted pl-3">
                {/* Objective header */}
                <div className="flex items-center gap-2 py-1">
                  {state.editingWpObjId === obj.id ? (
                    <InlineInput
                      value={state.editingWpObjTitle}
                      onChange={(t) =>
                        dispatch({ type: "SET_EDITING_WP_OBJ_TITLE", title: t })
                      }
                      onSubmit={() => onUpdateWpObjective(obj.id)}
                      onCancel={() => dispatch({ type: "CANCEL_EDIT_WP_OBJ" })}
                      autoFocus
                    />
                  ) : (
                    <>
                      <Target className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="flex-1 text-sm">{obj.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() =>
                          dispatch({
                            type: "START_ADD_PROCEDURE",
                            key: `obj:${obj.id}`,
                          })
                        }
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {LPROC.createTitle}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          dispatch({
                            type: "START_EDIT_WP_OBJ",
                            id: obj.id,
                            title: obj.title,
                          })
                        }
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          dispatch({
                            type: "SET_DELETE_TARGET",
                            target: {
                              type: "wp_objective",
                              id: obj.id,
                              title: obj.title,
                            },
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Procedures under this objective */}
                {obj.procedures.map((proc, idx) => (
                  <ProcedureRow
                    key={proc.id}
                    proc={proc}
                    idx={idx}
                    state={state}
                    dispatch={dispatch}
                    onUpdate={onUpdateProcedure}
                  />
                ))}

                {/* Add procedure under objective */}
                {state.addingProcForKey === `obj:${obj.id}` && (
                  <div className="ml-5 py-1">
                    <InlineInput
                      value={state.addingProcTitle}
                      onChange={(t) =>
                        dispatch({ type: "SET_PROC_TITLE", title: t })
                      }
                      onSubmit={() => onAddProcedure(`obj:${obj.id}`)}
                      onCancel={() =>
                        dispatch({ type: "CANCEL_ADD_PROCEDURE" })
                      }
                      placeholder="Tên thủ tục..."
                      icon={
                        <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                      autoFocus
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Add WP objective inline */}
            {state.addingWpObjForSectionId === sec.id && (
              <div className="ml-2 pl-3 py-1">
                <InlineInput
                  value={state.addingWpObjTitle}
                  onChange={(t) =>
                    dispatch({ type: "SET_WP_OBJ_TITLE", title: t })
                  }
                  onSubmit={() => onAddWpObjective(sec.id)}
                  onCancel={() => dispatch({ type: "CANCEL_ADD_WP_OBJ" })}
                  placeholder="Tên mục tiêu..."
                  icon={
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  }
                  autoFocus
                />
              </div>
            )}

            {/* Procedures directly under section (no objective) */}
            {sec.procedures.map((proc, idx) => (
              <ProcedureRow
                key={proc.id}
                proc={proc}
                idx={idx}
                state={state}
                dispatch={dispatch}
                onUpdate={onUpdateProcedure}
              />
            ))}

            {/* Add procedure under section */}
            {state.addingProcForKey === `sec:${sec.id}` && (
              <div className="py-1">
                <InlineInput
                  value={state.addingProcTitle}
                  onChange={(t) =>
                    dispatch({ type: "SET_PROC_TITLE", title: t })
                  }
                  onSubmit={() => onAddProcedure(`sec:${sec.id}`)}
                  onCancel={() => dispatch({ type: "CANCEL_ADD_PROCEDURE" })}
                  placeholder="Tên thủ tục..."
                  icon={
                    <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                  }
                  autoFocus
                />
              </div>
            )}

            {/* Empty state for section */}
            {sec.objectives.length === 0 &&
              sec.procedures.length === 0 &&
              !state.addingWpObjForSectionId &&
              !state.addingProcForKey && (
                <p className="py-1 text-xs text-muted-foreground">
                  Chưa có mục tiêu hoặc thủ tục nào.
                </p>
              )}
          </div>
        </div>
      ))}

      {/* Add section inline */}
      {state.addingSection && (
        <div className="px-2 py-1.5">
          <InlineInput
            value={state.addingSectionTitle}
            onChange={(t) => dispatch({ type: "SET_SECTION_TITLE", title: t })}
            onSubmit={onAddSection}
            onCancel={() => dispatch({ type: "CANCEL_ADD_SECTION" })}
            placeholder="Tên phần..."
            icon={
              <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
            }
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

// ── Procedure Row (shared for WorkProgramSection) ──

function ProcedureRow({
  proc,
  idx,
  state,
  dispatch,
  onUpdate,
}: {
  proc: EngagementProcedure;
  idx: number;
  state: PlanningState;
  dispatch: React.Dispatch<PlanningAction>;
  onUpdate: (id: string) => void;
}) {
  return (
    <div className="ml-5 flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/50">
      <span className="w-5 text-center text-xs text-muted-foreground">
        {idx + 1}
      </span>
      {state.editingProcId === proc.id ? (
        <InlineInput
          value={state.editingProcTitle}
          onChange={(t) =>
            dispatch({ type: "SET_EDITING_PROC_TITLE", title: t })
          }
          onSubmit={() => onUpdate(proc.id)}
          onCancel={() => dispatch({ type: "CANCEL_EDIT_PROCEDURE" })}
          autoFocus
        />
      ) : (
        <>
          <ClipboardList className="h-3 w-3 text-violet-500 shrink-0" />
          <span className="flex-1 text-sm">{proc.title}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              dispatch({
                type: "START_EDIT_PROCEDURE",
                id: proc.id,
                title: proc.title,
              })
            }
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() =>
              dispatch({
                type: "SET_DELETE_TARGET",
                target: {
                  type: "procedure",
                  id: proc.id,
                  title: proc.title,
                },
              })
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
}
