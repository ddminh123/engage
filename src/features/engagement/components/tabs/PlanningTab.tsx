"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Target,
  ShieldAlert,
  ClipboardList,
  BookOpen,
  FileText,
  Check,
  X,
  Shield,
  ChevronsUpDown,
  Layers,
  ArrowUpToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  RichTextEditor,
  RichTextDisplay,
} from "@/components/shared/RichTextEditor";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { usePlanningEditor } from "../../hooks/usePlanningEditor";
import type {
  PlanningState,
  PlanningAction,
} from "../../hooks/usePlanningEditor";
import { InlineInput } from "./InlineInput";
import { RcmDataTable } from "./RcmDataTable";
import { WorkProgramV2 } from "../work-program";
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
}

export function PlanningTab({ engagement }: PlanningTabProps) {
  const {
    state,
    dispatch,
    collapsed,
    toggleCollapse,
    expandAll,
    collapseAll,
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
    handleSaveUnderstanding,
    isSavingUnderstanding,
    handleReorderAuditObjectives,
    handleMoveToTopAuditObjective,
  } = usePlanningEditor(engagement);

  const isCollapsed = (key: string) => collapsed.has(key);

  const SECTION_KEYS = [
    "scope",
    "objectives",
    "understanding",
    "racm",
    "racm_table",
    "procedures",
  ];
  const allCollapsed = SECTION_KEYS.every((k) => collapsed.has(k));

  return (
    <div className="space-y-3">
      {/* ── Expand / Collapse all ── */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (allCollapsed) {
              expandAll();
            } else {
              collapseAll(SECTION_KEYS);
            }
          }}
        >
          <ChevronsUpDown className="mr-1.5 h-3.5 w-3.5" />
          {allCollapsed ? "Mở rộng tất cả" : "Thu gọn tất cả"}
        </Button>
      </div>

      {/* ── 1. Scope & Basics ── */}
      <CollapsibleCard
        title={LP.scopeBasics}
        icon={<FileText className="h-4 w-4" />}
        collapsed={isCollapsed("scope")}
        onToggle={() => toggleCollapse("scope")}
      >
        <ScopeSection engagement={engagement} />
      </CollapsibleCard>

      {/* ── 1b. Audit Objectives ── */}
      <CollapsibleCard
        title={LAO.title}
        icon={<Target className="h-4 w-4" />}
        collapsed={isCollapsed("objectives")}
        onToggle={() => toggleCollapse("objectives")}
      >
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
        {engagement.auditObjectives.length === 0 && !state.addingObjective && (
          <p className="py-2 text-sm text-muted-foreground">{LAO.noData}</p>
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
                        <span className="flex-1 text-sm">{obj.title}</span>
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
                    onClick={() => handleMoveToTopAuditObjective(obj.id)}
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
              onCancel={() => dispatch({ type: "CANCEL_ADD_OBJECTIVE" })}
              placeholder="Tên mục tiêu kiểm toán..."
              icon={<Target className="h-3.5 w-3.5 text-muted-foreground" />}
              autoFocus
            />
          </div>
        )}
      </CollapsibleCard>

      {/* ── 2. Understanding ── */}
      <CollapsibleCard
        title={LP.understanding}
        icon={<BookOpen className="h-4 w-4" />}
        collapsed={isCollapsed("understanding")}
        onToggle={() => toggleCollapse("understanding")}
      >
        {!state.understandingEditorOpen && (
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => dispatch({ type: "OPEN_UNDERSTANDING_EDITOR" })}
            >
              <Pencil className="mr-1 h-3 w-3" />
              {engagement.understanding ? "Sửa" : "Thêm"}
            </Button>
          </div>
        )}
        <UnderstandingSection
          content={engagement.understanding ?? ""}
          isEditing={state.understandingEditorOpen}
          onSave={handleSaveUnderstanding}
          onCancel={() => dispatch({ type: "CLOSE_UNDERSTANDING_EDITOR" })}
          onStartEdit={() => dispatch({ type: "OPEN_UNDERSTANDING_EDITOR" })}
          isSaving={isSavingUnderstanding}
        />
      </CollapsibleCard>

      {/* ── 3. Risk & Control Matrix (DataTable) ── */}
      <CollapsibleCard
        title={LP.riskControl}
        icon={<ShieldAlert className="h-4 w-4" />}
        collapsed={isCollapsed("racm_table")}
        onToggle={() => toggleCollapse("racm_table")}
      >
        <RcmDataTable
          engagementId={engagement.id}
          rcmObjectives={engagement.rcmObjectives}
        />
      </CollapsibleCard>

      {/* ── 4. Work Program (Section / Objective / Procedure) ── */}
      <CollapsibleCard
        title={LP.procedures}
        icon={<ClipboardList className="h-4 w-4" />}
        collapsed={isCollapsed("procedures")}
        onToggle={() => toggleCollapse("procedures")}
      >
        <WorkProgramV2
          engagementId={engagement.id}
          sections={engagement.sections}
          standaloneObjectives={engagement.standaloneObjectives}
          findingCount={engagement.findings?.length ?? 0}
          mode="planning"
        />
      </CollapsibleCard>

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
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Sub-components
// ════════════════════════════════════════════════════════════════════════════════

// ── Collapsible Card ──

function CollapsibleCard({
  title,
  icon,
  collapsed,
  onToggle,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <span className="shrink-0 rounded p-0.5">
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
        {icon}
        <span className="flex-1 text-sm font-semibold">{title}</span>
        {action && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
      </div>
      {!collapsed && (
        <div className="px-4 pb-4">
          <Separator className="mb-3" />
          {children}
        </div>
      )}
    </Card>
  );
}

// ── Scope Section ──

function ScopeSection({ engagement }: { engagement: EngagementDetail }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-muted-foreground">{L.field.entity}</div>
          <div className="font-medium">
            {engagement.entity?.name ?? "—"}
            {engagement.entity?.entityType && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({engagement.entity.entityType.name})
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">{L.field.schedule}</div>
          <div className="font-medium">
            {new Date(engagement.startDate).toLocaleDateString("vi-VN")} —{" "}
            {new Date(engagement.endDate).toLocaleDateString("vi-VN")}
          </div>
        </div>
        {engagement.estimatedDays != null && (
          <div>
            <div className="text-muted-foreground">{L.field.estimatedDays}</div>
            <div className="font-medium">{engagement.estimatedDays} ngày</div>
          </div>
        )}
        {engagement.priority && (
          <div>
            <div className="text-muted-foreground">{L.field.priority}</div>
            <div className="font-medium">
              {L.priority[engagement.priority] ?? engagement.priority}
            </div>
          </div>
        )}
      </div>

      {/* Areas (Lĩnh vực) */}
      <div>
        <div className="text-muted-foreground">{LP.areas}</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {engagement.entity?.areas && engagement.entity.areas.length > 0 ? (
            engagement.entity.areas.map((a) => (
              <Badge key={a.id} variant="secondary">
                {a.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{LP.noAreas}</span>
          )}
        </div>
      </div>

      {/* Linked plan */}
      {engagement.plannedAudit?.plan && (
        <div>
          <div className="text-muted-foreground">{L.field.linkedPlan}</div>
          <div className="mt-1 font-medium">
            {engagement.plannedAudit.plan.title}
          </div>
        </div>
      )}

      {/* Entity risk */}
      {engagement.entity &&
        (engagement.entity.riskLevel ||
          engagement.entity.inherentRiskLevel) && (
          <div className="grid grid-cols-2 gap-4">
            {engagement.entity.inherentRiskLevel && (
              <div>
                <div className="text-muted-foreground">Rủi ro vốn có</div>
                <div className="font-medium">
                  {engagement.entity.inherentRiskLevel}
                </div>
              </div>
            )}
            {engagement.entity.riskLevel && (
              <div>
                <div className="text-muted-foreground">Mức rủi ro tổng hợp</div>
                <div className="font-medium">{engagement.entity.riskLevel}</div>
              </div>
            )}
          </div>
        )}

      {engagement.objective && (
        <div>
          <div className="text-muted-foreground">{L.field.objective}</div>
          <div className="mt-1 whitespace-pre-wrap">{engagement.objective}</div>
        </div>
      )}

      {engagement.scope && (
        <div>
          <div className="text-muted-foreground">{L.field.scope}</div>
          <div className="mt-1 whitespace-pre-wrap">{engagement.scope}</div>
        </div>
      )}

      {/* Owner units */}
      <div>
        <div className="text-muted-foreground">Đơn vị chủ quản</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {engagement.ownerUnits.length > 0 ? (
            engagement.ownerUnits.map((u) => (
              <Badge key={u.id} variant="secondary">
                {u.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {/* Participating units */}
      <div>
        <div className="text-muted-foreground">Đơn vị phối hợp</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {engagement.participatingUnits.length > 0 ? (
            engagement.participatingUnits.map((u) => (
              <Badge key={u.id} variant="outline">
                {u.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {/* Auditee reps */}
      <div>
        <div className="text-muted-foreground">Đại diện đơn vị kiểm toán</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {engagement.auditeeReps.length > 0 ? (
            engagement.auditeeReps.map((c) => (
              <Badge key={c.id} variant="secondary">
                {c.name}
                {c.position && (
                  <span className="ml-1 text-muted-foreground">
                    — {c.position}
                  </span>
                )}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {/* Contact points */}
      <div>
        <div className="text-muted-foreground">Đầu mối liên hệ</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {engagement.contactPoints.length > 0 ? (
            engagement.contactPoints.map((c) => (
              <Badge key={c.id} variant="secondary">
                {c.name}
                {c.position && (
                  <span className="ml-1 text-muted-foreground">
                    — {c.position}
                  </span>
                )}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </div>
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

// ── Understanding Section (inline editor) ──

function UnderstandingSection({
  content,
  isEditing,
  onSave,
  onCancel,
  onStartEdit,
  isSaving,
}: {
  content: string;
  isEditing: boolean;
  onSave: (html: string) => void;
  onCancel: () => void;
  onStartEdit: () => void;
  isSaving: boolean;
}) {
  const [html, setHtml] = useState(content);

  if (isEditing) {
    return (
      <div className="space-y-2">
        <RichTextEditor
          content={content}
          onChange={setHtml}
          placeholder="Nhập nội dung tìm hiểu đối tượng kiểm toán..."
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Hủy
          </Button>
          <Button size="sm" onClick={() => onSave(html)} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <BookOpen className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{LP.noUnderstanding}</p>
        <Button variant="outline" size="sm" onClick={onStartEdit}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Thêm nội dung
        </Button>
      </div>
    );
  }

  return <RichTextDisplay content={content} />;
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
