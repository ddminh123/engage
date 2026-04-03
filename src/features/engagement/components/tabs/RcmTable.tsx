"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Target,
  RefreshCw,
  BookOpen,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InlineInput } from "./InlineInput";
import { RiskWorkpaper } from "./RiskWorkpaper";
import { ControlWorkpaper } from "./ControlWorkpaper";
import { CatalogPickerDialog } from "./CatalogPickerDialog";
import { useRcmTable } from "./useRcmTable";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import type {
  RcmObjective,
  EngagementRisk,
  EngagementControl,
} from "../../types";

const L = ENGAGEMENT_LABELS;
const LR = L.risk;

// ─── Rating badge color helper ──────────────────────────────────────────────
function ratingColor(rating: string | null): string {
  switch (rating) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-300";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "";
  }
}

// ─── Control effectiveness left-accent ─────────────────────────────────────
function effectivenessAccent(eff: string | null): string {
  switch (eff) {
    case "strong":
      return "border-l-2 border-l-green-400";
    case "adequate":
      return "border-l-2 border-l-yellow-400";
    case "weak":
      return "border-l-2 border-l-red-400";
    case "none":
      return "border-l-2 border-l-gray-300";
    default:
      return "border-l-2 border-l-transparent";
  }
}

function controlTooltip(c: EngagementControl): string {
  const parts: string[] = [];
  if (c.controlType) parts.push(LR.controlType[c.controlType] ?? c.controlType);
  if (c.frequency) parts.push(LR.controlFrequency[c.frequency] ?? c.frequency);
  if (c.effectiveness) parts.push(LR.controlEffectiveness[c.effectiveness] ?? c.effectiveness);
  return parts.join(" · ") || c.description;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD ITEM POPOVER — shared for risk & control add flow
// ═══════════════════════════════════════════════════════════════════════════════

interface AddItemPopoverProps {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  onBrowseLibrary: () => void;
  placeholder: string;
  isAdding: boolean;
}

function AddItemPopover({
  value,
  onChange,
  onAdd,
  onCancel,
  onBrowseLibrary,
  placeholder,
  isAdding,
}: AddItemPopoverProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) onAdd();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="rounded-md border bg-popover p-2 shadow-sm space-y-2">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-sm border px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground bg-transparent"
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={onAdd}
          disabled={!value.trim() || isAdding}
        >
          Thêm
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            onCancel();
            onBrowseLibrary();
          }}
        >
          <BookOpen className="mr-1 h-3 w-3" />
          Tìm từ thư viện
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-1.5"
          onClick={onCancel}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface RcmTableProps {
  engagementId: string;
  rcmObjectives: RcmObjective[];
  controls: EngagementControl[];
}

export function RcmTable({
  engagementId,
  rcmObjectives,
  controls,
}: RcmTableProps) {
  const {
    state,
    dispatch,
    openRisk,
    openControl,
    riskMap,
    controlMap,
    handleAddRisk,
    handleAddControl,
    handleAddObjective,
    handleUpdateObjective,
    handleConfirmDelete,
    handleConfirmUnlink,
    handleSyncObjectives,
    isDeleting,
    isUnlinking,
    isSyncingObjectives,
    isAddingRisk,
    isAddingControl,
    isAddingObjective,
  } = useRcmTable({ engagementId, rcmObjectives, controls });

  // ── Compute linked risks for control workpaper ──
  const linkedRisksForControl = React.useMemo(() => {
    if (!state.openControlId) return [];
    const risks: EngagementRisk[] = [];
    for (const obj of rcmObjectives) {
      for (const risk of obj.risks) {
        if (risk.controls.some((c) => c.id === state.openControlId)) {
          risks.push(risk);
        }
      }
    }
    return risks;
  }, [state.openControlId, rcmObjectives]);

  // ── Risk workpaper overlay ──
  if (openRisk) {
    return (
      <RiskWorkpaper
        risk={openRisk}
        engagementId={engagementId}
        onBack={() => dispatch({ type: "CLOSE_RISK" })}
      />
    );
  }

  // ── Control workpaper overlay ──
  if (openControl) {
    return (
      <ControlWorkpaper
        control={openControl}
        engagementId={engagementId}
        linkedRisks={linkedRisksForControl}
        onBack={() => dispatch({ type: "CLOSE_CONTROL" })}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncObjectives}
            disabled={isSyncingObjectives}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            {L.planning.areas}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: "START_ADD_OBJECTIVE" })}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {L.auditObjective.createTitle}
        </Button>
      </div>

      {/* No data */}
      {rcmObjectives.length === 0 && !state.showAddObjective && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {L.planning.noAreas}
        </div>
      )}

      {/* Objective sections */}
      {rcmObjectives.map((obj) => (
        <ObjectiveSection
          key={obj.id}
          objective={obj}
          engagementId={engagementId}
          state={state}
          dispatch={dispatch}
          handleAddRisk={handleAddRisk}
          handleAddControl={handleAddControl}
          handleUpdateObjective={handleUpdateObjective}
          isAddingRisk={isAddingRisk}
          isAddingControl={isAddingControl}
        />
      ))}

      {/* Add objective inline */}
      {state.showAddObjective && (
        <div className="rounded-lg border border-dashed p-3">
          <InlineInput
            value={state.addingObjectiveTitle}
            onChange={(v) => dispatch({ type: "SET_ADD_OBJECTIVE_TITLE", value: v })}
            onSubmit={handleAddObjective}
            onCancel={() => dispatch({ type: "CANCEL_ADD_OBJECTIVE" })}
            placeholder={L.auditObjective.field.title}
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
            autoFocus
          />
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!state.deleteTarget}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CLEAR_DELETE" });
        }}
        title={
          state.deleteTarget?.type === "objective"
            ? L.auditObjective.deleteTitle
            : state.deleteTarget?.type === "risk"
              ? LR.deleteTitle
              : L.control.deleteTitle
        }
        description={
          state.deleteTarget?.type === "objective"
            ? L.auditObjective.deleteDescription(state.deleteTarget?.title ?? "")
            : state.deleteTarget?.type === "risk"
              ? LR.deleteDescription(state.deleteTarget?.title ?? "")
              : L.control.deleteDescription(state.deleteTarget?.title ?? "")
        }
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Unlink confirmation */}
      <ConfirmDialog
        open={!!state.unlinkTarget}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CLEAR_UNLINK" });
        }}
        title={L.control.unlinkTitle}
        description={L.control.unlinkDescription(state.unlinkTarget?.controlTitle ?? "")}
        onConfirm={handleConfirmUnlink}
        isLoading={isUnlinking}
        variant="destructive"
      />

      {/* Catalog picker dialog */}
      <CatalogPickerDialog
        open={state.catalogPickerOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CLOSE_CATALOG_PICKER" });
        }}
        entityType={state.catalogPickerType ?? "risk"}
        engagementId={engagementId}
        rcmObjectiveId={state.catalogPickerTargetObjectiveId ?? undefined}
        linkToRiskId={state.catalogPickerTargetRiskId ?? undefined}
        onItemsAdded={() => dispatch({ type: "CLOSE_CATALOG_PICKER" })}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBJECTIVE SECTION
// ═══════════════════════════════════════════════════════════════════════════════

interface ObjectiveSectionProps {
  objective: RcmObjective;
  engagementId: string;
  state: ReturnType<typeof useRcmTable>["state"];
  dispatch: ReturnType<typeof useRcmTable>["dispatch"];
  handleAddRisk: () => void;
  handleAddControl: () => void;
  handleUpdateObjective: () => void;
  isAddingRisk: boolean;
  isAddingControl: boolean;
}

function ObjectiveSection({
  objective,
  state,
  dispatch,
  handleAddRisk,
  handleAddControl,
  handleUpdateObjective,
  isAddingRisk,
  isAddingControl,
}: ObjectiveSectionProps) {
  const isCollapsed = state.collapsedObjectives.has(objective.id);
  const isEditing = state.editingObjectiveId === objective.id;

  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={() => dispatch({ type: "TOGGLE_COLLAPSE", objectiveId: objective.id })}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="shrink-0">
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          }
        />

        {isEditing ? (
          <InlineInput
            value={state.editingObjectiveTitle}
            onChange={(v) => dispatch({ type: "SET_EDIT_OBJECTIVE_TITLE", value: v })}
            onSubmit={handleUpdateObjective}
            onCancel={() => dispatch({ type: "CANCEL_EDIT_OBJECTIVE" })}
            placeholder={L.auditObjective.field.title}
            autoFocus
          />
        ) : (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <span className="flex-1 cursor-default text-sm font-medium">
                {objective.title}
              </span>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() =>
                  dispatch({
                    type: "START_EDIT_OBJECTIVE",
                    id: objective.id,
                    title: objective.title,
                  })
                }
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                {L.auditObjective.editTitle}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  dispatch({
                    type: "SET_DELETE",
                    target: {
                      type: "objective",
                      id: objective.id,
                      title: objective.title,
                    },
                  })
                }
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                {L.auditObjective.deleteTitle}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}

        <Badge variant="outline" className="ml-auto text-[10px]">
          {objective.risks.length} {LR.title.toLowerCase()}
        </Badge>
      </div>

      {/* Risks table */}
      <CollapsibleContent>
        <div className="ml-2 mt-1 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-80 min-w-80">{LR.field.riskDescription}</TableHead>
                <TableHead className="w-24 min-w-24">{LR.field.riskRating}</TableHead>
                <TableHead className="flex-1">{LR.field.linkedControls}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objective.risks.map((risk) => (
                <RiskRow
                  key={risk.id}
                  risk={risk}
                  state={state}
                  dispatch={dispatch}
                  handleAddControl={handleAddControl}
                  isAddingControl={isAddingControl}
                />
              ))}

              {/* Inline add risk — popover with text input + Thêm + Tìm từ thư viện */}
              {state.addingRiskForObjectiveId === objective.id ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <AddItemPopover
                      value={state.addingRiskDesc}
                      onChange={(v) => dispatch({ type: "SET_ADD_RISK_DESC", value: v })}
                      onAdd={handleAddRisk}
                      onCancel={() => dispatch({ type: "CANCEL_ADD_RISK" })}
                      onBrowseLibrary={() =>
                        dispatch({
                          type: "OPEN_CATALOG_PICKER",
                          pickerType: "risk",
                          objectiveId: objective.id,
                        })
                      }
                      placeholder="Mô tả rủi ro"
                      isAdding={isAddingRisk}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() =>
                        dispatch({ type: "START_ADD_RISK", objectiveId: objective.id })
                      }
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {LR.createTitle}
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISK ROW
// ═══════════════════════════════════════════════════════════════════════════════

interface RiskRowProps {
  risk: EngagementRisk;
  state: ReturnType<typeof useRcmTable>["state"];
  dispatch: ReturnType<typeof useRcmTable>["dispatch"];
  handleAddControl: () => void;
  isAddingControl: boolean;
}

function RiskRow({
  risk,
  state,
  dispatch,
  handleAddControl,
  isAddingControl,
}: RiskRowProps) {
  const isAddingControlHere = state.addingControlForRiskId === risk.id;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow className="group">
          {/* Risk description */}
          <TableCell className="w-80 min-w-80">
            <div className="flex items-start gap-1">
              <button
                className="flex-1 text-left text-sm hover:underline break-words line-clamp-3 whitespace-normal"
                onClick={() => dispatch({ type: "OPEN_RISK", riskId: risk.id })}
                title={risk.riskDescription}
              >
                {risk.riskDescription}
              </button>
              <button
                className="shrink-0 mt-0.5 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                onClick={() => dispatch({ type: "OPEN_RISK", riskId: risk.id })}
                title="Mở giấy tờ rủi ro"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </TableCell>

          {/* Risk rating */}
          <TableCell>
            {risk.riskRating && (
              <Badge
                variant="outline"
                className={`text-[10px] ${ratingColor(risk.riskRating)}`}
              >
                {LR.riskRating[risk.riskRating] ?? risk.riskRating}
              </Badge>
            )}
          </TableCell>

          {/* Controls — each on its own line with border */}
          <TableCell>
            <div className="space-y-1">
              {risk.controls.map((ctrl) => (
                <div
                  key={ctrl.id}
                  className={`group/ctrl flex items-center gap-2 rounded-sm bg-muted/30 px-2 py-1.5 text-sm transition-colors hover:bg-accent/30 ${effectivenessAccent(ctrl.effectiveness)}`}
                  title={controlTooltip(ctrl)}
                >
                  <button
                    className="flex-1 text-left truncate hover:underline"
                    onClick={() => dispatch({ type: "OPEN_CONTROL", controlId: ctrl.id })}
                  >
                    {ctrl.description}
                  </button>
                  {ctrl.effectiveness && (
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px]"
                    >
                      {LR.controlEffectiveness[ctrl.effectiveness] ?? ctrl.effectiveness}
                    </Badge>
                  )}
                  <button
                    className="shrink-0 hidden rounded p-0.5 text-muted-foreground hover:bg-muted group-hover/ctrl:inline-flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: "OPEN_CONTROL", controlId: ctrl.id });
                    }}
                    title="Mở giấy tờ kiểm soát"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </button>
                  <button
                    className="shrink-0 hidden rounded-full p-0.5 hover:bg-muted group-hover/ctrl:inline-flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: "SET_UNLINK",
                        target: {
                          riskId: risk.id,
                          controlId: ctrl.id,
                          controlTitle: ctrl.description,
                        },
                      });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Add control — popover with text input + Thêm + Tìm từ thư viện */}
              {isAddingControlHere ? (
                <AddItemPopover
                  value={state.addingControlDesc}
                  onChange={(v) => dispatch({ type: "SET_ADD_CONTROL_DESC", value: v })}
                  onAdd={handleAddControl}
                  onCancel={() => dispatch({ type: "CANCEL_ADD_CONTROL" })}
                  onBrowseLibrary={() =>
                    dispatch({
                      type: "OPEN_CATALOG_PICKER",
                      pickerType: "control",
                      riskId: risk.id,
                    })
                  }
                  placeholder="Mô tả kiểm soát"
                  isAdding={isAddingControl}
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-[10px] text-muted-foreground"
                  onClick={() =>
                    dispatch({ type: "START_ADD_CONTROL", riskId: risk.id })
                  }
                >
                  <Plus className="mr-0.5 h-3 w-3" />
                  {L.control.title}
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => dispatch({ type: "OPEN_RISK", riskId: risk.id })}
        >
          <Pencil className="mr-2 h-3.5 w-3.5" />
          {LR.editTitle}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            dispatch({
              type: "SET_DELETE",
              target: {
                type: "risk",
                id: risk.id,
                title: risk.riskDescription,
              },
            })
          }
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          {LR.deleteTitle}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
