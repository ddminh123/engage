"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Target,
  ShieldAlert,
  Shield,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
import { cn } from "@/lib/utils";
import type { RcmEditor } from "./useRcmEditor";
import {
  type RcmRow,
  LR,
  RATING_DOT,
  RATING_OPTIONS,
  EFFECTIVENESS_OPTIONS,
  renderRatingDot,
} from "./rcmTypes";

export function useRcmColumns(editor: RcmEditor): ColumnDef<RcmRow>[] {
  const {
    state,
    dispatch,
    textRef,
    handleTextChange,
    handleAddObjective,
    handleUpdateObjective,
    handleAddRisk,
    handleAddControl,
    handleUpdateRisk,
    handleUpdateControl,
    handleRiskRatingChange,
    handleEffectivenessChange,
    riskMap,
    controlMap,
    isCreatingObjective,
    isUpdatingObjective,
    isCreatingRisk,
    isUpdatingRisk,
    isCreatingControl,
    isUpdatingControl,
  } = editor;

  return useMemo(
    () => [
      // ────────────────────── Description column ──────────────────────
      {
        id: "description",
        header: "Mô tả",
        cell: ({ row }) => {
          const r = row.original;
          const depth = row.depth;
          const indent = depth * 24;

          // ── Phantom add_objective ──
          if (r.type === "add_objective") {
            return (
              <InlineTableInput
                onChange={handleTextChange}
                onCancel={() => dispatch({ type: "CANCEL_ADD" })}
                placeholder="Tên mục tiêu..."
                icon={<Target className="h-4 w-4 shrink-0 text-emerald-600" />}
              />
            );
          }

          // ── Phantom add_risk ──
          if (r.type === "add_risk") {
            return (
              <div style={{ paddingLeft: indent }}>
                <InlineTableInput
                  onChange={handleTextChange}
                  onCancel={() => dispatch({ type: "CANCEL_ADD" })}
                  placeholder="Mô tả rủi ro..."
                  icon={
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  }
                />
              </div>
            );
          }

          // ── Phantom add_control ──
          if (r.type === "add_control") {
            return (
              <div style={{ paddingLeft: indent }}>
                <InlineTableInput
                  onChange={handleTextChange}
                  onCancel={() => dispatch({ type: "CANCEL_ADD" })}
                  placeholder="Mô tả kiểm soát..."
                  icon={
                    <Shield className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                  }
                />
              </div>
            );
          }

          // ── Persistent "add" buttons at bottom of each group ──
          // Extra offset accounts for the chevron + icon space that siblings have
          if (r.type === "btn_add_risk") {
            return (
              <div
                className="flex items-center"
                style={{ paddingLeft: indent }}
              >
                {/* spacer matching chevron(18px) + gap(8px) + icon(14px) + gap(8px) */}
                <span style={{ width: 48 }} className="shrink-0" />
                <button
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (r.parentId)
                      dispatch({
                        type: "START_ADD_RISK",
                        objectiveId: r.parentId,
                      });
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Thêm rủi ro
                </button>
              </div>
            );
          }

          if (r.type === "btn_add_control") {
            return (
              <div
                className="flex items-center"
                style={{ paddingLeft: indent }}
              >
                {/* spacer matching spacer(w-4=16px) + gap(8px) + icon(14px) + gap(8px) */}
                <span style={{ width: 46 }} className="shrink-0" />
                <button
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (r.parentId)
                      dispatch({
                        type: "START_ADD_CONTROL",
                        riskId: r.parentId,
                      });
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Thêm kiểm soát
                </button>
              </div>
            );
          }

          // ── Editing objective ──
          if (state.editingId === r.id && state.editingType === "objective") {
            return (
              <InlineTableInput
                initialValue={r.description}
                onChange={handleTextChange}
                onCancel={() => dispatch({ type: "CANCEL_EDIT" })}
                icon={<Target className="h-4 w-4 shrink-0 text-emerald-600" />}
              />
            );
          }

          // ── Editing risk ──
          if (state.editingId === r.id && state.editingType === "risk") {
            return (
              <div style={{ paddingLeft: indent }}>
                <InlineTableInput
                  initialValue={r.description}
                  onChange={handleTextChange}
                  onCancel={() => dispatch({ type: "CANCEL_EDIT" })}
                  icon={
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  }
                />
              </div>
            );
          }

          // ── Editing control ──
          if (state.editingId === r.id && state.editingType === "control") {
            return (
              <div style={{ paddingLeft: indent }}>
                <InlineTableInput
                  initialValue={r.description}
                  onChange={handleTextChange}
                  onCancel={() => dispatch({ type: "CANCEL_EDIT" })}
                  icon={
                    <Shield className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                  }
                />
              </div>
            );
          }

          // ── Normal objective ──
          if (r.type === "objective") {
            return (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    row.toggleExpanded();
                  }}
                  className="shrink-0 rounded p-0.5 hover:bg-muted"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
                <Target className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="font-medium text-sm">{r.description}</span>
              </div>
            );
          }

          // ── Normal risk ──
          if (r.type === "risk") {
            const hasControls = r.children.some(
              (c) => c.type !== "btn_add_control",
            );
            return (
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: indent }}
              >
                {hasControls ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      row.toggleExpanded();
                    }}
                    className="shrink-0 rounded p-0.5 hover:bg-muted"
                  >
                    {row.getIsExpanded() ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                ) : (
                  <span className="w-4" />
                )}
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                <span className="text-sm">{r.description}</span>
              </div>
            );
          }

          // ── Normal control ──
          return (
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: indent }}
            >
              <span className="w-4" />
              <Shield className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              <span className="text-sm text-muted-foreground">
                {r.description}
              </span>
            </div>
          );
        },
        meta: { label: "Mô tả" },
      },

      // ────────────────────── Rating / Effectiveness (merged) column ──────────────────────
      {
        id: "rating",
        header: "Đánh giá",
        size: 160,
        cell: ({ row }) => {
          const r = row.original;

          // ── Risk: rating ──

          // Phantom add_risk
          if (r.type === "add_risk") {
            return (
              <div onClick={(e) => e.stopPropagation()}>
                <LabeledSelect
                  value={state.addingRating}
                  onChange={(v) =>
                    dispatch({ type: "SET_ADD_RATING", value: v })
                  }
                  options={RATING_OPTIONS}
                  placeholder="Mức rủi ro"
                  className="h-7 text-xs"
                  renderValue={renderRatingDot}
                  renderOption={renderRatingDot}
                />
              </div>
            );
          }

          // Editing risk
          if (
            r.type === "risk" &&
            state.editingId === r.id &&
            state.editingType === "risk"
          ) {
            return (
              <div onClick={(e) => e.stopPropagation()}>
                <LabeledSelect
                  value={state.editingRating}
                  onChange={(v) =>
                    dispatch({ type: "SET_EDIT_RATING", value: v })
                  }
                  options={RATING_OPTIONS}
                  placeholder="Mức rủi ro"
                  className="h-7 text-xs"
                  renderValue={renderRatingDot}
                  renderOption={renderRatingDot}
                />
              </div>
            );
          }

          // Normal risk display
          if (r.type === "risk" && r.riskRating) {
            const dot = RATING_DOT[r.riskRating];
            const label = LR.riskRating[r.riskRating] ?? r.riskRating;
            return (
              <Badge variant="outline" className="gap-1.5 text-xs">
                <span className={cn("inline-block size-2 rounded-full", dot)} />
                {label}
              </Badge>
            );
          }

          if (r.type === "risk") {
            return <span className="text-xs text-muted-foreground">—</span>;
          }

          // ── Control: effectiveness ──

          // Phantom add_control
          if (r.type === "add_control") {
            return (
              <div onClick={(e) => e.stopPropagation()}>
                <LabeledSelect
                  value={state.addingEffectiveness}
                  onChange={(v) =>
                    dispatch({ type: "SET_ADD_EFFECTIVENESS", value: v })
                  }
                  options={EFFECTIVENESS_OPTIONS}
                  placeholder="Hiệu quả..."
                  className="h-7 text-xs"
                />
              </div>
            );
          }

          // Editing control
          if (
            r.type === "control" &&
            state.editingId === r.id &&
            state.editingType === "control"
          ) {
            return (
              <div onClick={(e) => e.stopPropagation()}>
                <LabeledSelect
                  value={state.editingEffectiveness}
                  onChange={(v) =>
                    dispatch({ type: "SET_EDIT_EFFECTIVENESS", value: v })
                  }
                  options={EFFECTIVENESS_OPTIONS}
                  placeholder="Hiệu quả..."
                  className="h-7 text-xs"
                />
              </div>
            );
          }

          // Normal control display
          if (r.type === "control" && r.effectiveness) {
            return (
              <Badge variant="outline" className="text-xs">
                {LR.controlEffectiveness[r.effectiveness] ?? r.effectiveness}
              </Badge>
            );
          }

          if (r.type === "control") {
            return <span className="text-xs text-muted-foreground">—</span>;
          }

          return null;
        },
        meta: { label: "Đánh giá" },
      },

      // ────────────────────── Actions column ──────────────────────
      {
        id: "_actions",
        header: "",
        size: 120,
        enableHiding: false,
        cell: ({ row }) => {
          const r = row.original;

          // Phantom add_objective — confirm/cancel
          if (r.type === "add_objective") {
            return (
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleAddObjective(textRef.current)}
                  disabled={isCreatingObjective}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dispatch({ type: "CANCEL_ADD" })}
                  disabled={isCreatingObjective}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          }

          // Phantom add_risk — confirm/cancel
          if (r.type === "add_risk") {
            return (
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleAddRisk(textRef.current)}
                  disabled={isCreatingRisk}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dispatch({ type: "CANCEL_ADD" })}
                  disabled={isCreatingRisk}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          }

          // Phantom add_control — confirm/cancel
          if (r.type === "add_control") {
            return (
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleAddControl(textRef.current)}
                  disabled={isCreatingControl}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dispatch({ type: "CANCEL_ADD" })}
                  disabled={isCreatingControl}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          }

          // Editing objective — confirm/cancel
          if (state.editingId === r.id && state.editingType === "objective") {
            return (
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleUpdateObjective(textRef.current)}
                  disabled={isUpdatingObjective}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dispatch({ type: "CANCEL_EDIT" })}
                  disabled={isUpdatingObjective}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          }

          // Editing risk — confirm/cancel
          if (state.editingId === r.id && state.editingType === "risk") {
            return (
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleUpdateRisk(textRef.current)}
                  disabled={isUpdatingRisk}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dispatch({ type: "CANCEL_EDIT" })}
                  disabled={isUpdatingRisk}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          }

          // Editing control — confirm/cancel
          if (state.editingId === r.id && state.editingType === "control") {
            return (
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleUpdateControl(textRef.current)}
                  disabled={isUpdatingControl}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dispatch({ type: "CANCEL_EDIT" })}
                  disabled={isUpdatingControl}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          }

          // Objective — edit/delete on hover
          if (r.type === "objective") {
            return (
              <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                      type: "START_EDIT_OBJECTIVE",
                      id: r.id,
                      title: r.description,
                    });
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                      type: "SET_DELETE",
                      target: {
                        type: "objective",
                        id: r.id,
                        title: r.description.slice(0, 40),
                      },
                    });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          }

          // Risk — edit/delete on hover
          if (r.type === "risk") {
            return (
              <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const risk = riskMap.get(r.id);
                    if (risk) dispatch({ type: "START_EDIT_RISK", risk });
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                      type: "SET_DELETE",
                      target: {
                        type: "risk",
                        id: r.id,
                        title: r.description.slice(0, 40),
                      },
                    });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          }

          // Control — edit/delete on hover
          if (r.type === "control") {
            const lookup = controlMap.get(r.id);
            return (
              <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (lookup)
                      dispatch({
                        type: "START_EDIT_CONTROL",
                        control: lookup.control,
                        riskId: lookup.riskId,
                      });
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                      type: "SET_DELETE",
                      target: {
                        type: "control",
                        id: r.id,
                        riskId: lookup?.riskId,
                        title: r.description.slice(0, 40),
                      },
                    });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          }

          return null;
        },
      },
    ],
    [
      state,
      dispatch,
      handleAddObjective,
      handleUpdateObjective,
      handleAddRisk,
      handleAddControl,
      handleUpdateRisk,
      handleUpdateControl,
      handleRiskRatingChange,
      handleEffectivenessChange,
      riskMap,
      controlMap,
      handleTextChange,
      textRef,
      isCreatingObjective,
      isUpdatingObjective,
      isCreatingRisk,
      isUpdatingRisk,
      isCreatingControl,
      isUpdatingControl,
    ],
  );
}
