"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Target,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Maximize2,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
import { cn } from "@/lib/utils";
import type { WpEditor } from "./useWorkProgramEditor";
import {
  type WpRow,
  WP_LABELS,
  PROCEDURE_STATUS_OPTIONS,
  PROCEDURE_STATUS_DOT,
} from "./workProgramTypes";

// ── Status badge renderer ──

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const dot = PROCEDURE_STATUS_DOT[status] ?? "bg-muted-foreground/30";
  const label = WP_LABELS.procedure.status[status] ?? status;
  return (
    <Badge variant="outline" className="text-[10px] gap-1.5">
      <span className={cn("inline-block size-2 shrink-0 rounded-full", dot)} />
      {label}
    </Badge>
  );
}

// ── Column factory ──

export function useWpColumns(
  editor: WpEditor,
  cardId: string,
  cardType: "section" | "objective",
  onViewItem?: (type: "objective" | "procedure", id: string) => void,
  onOpenForm?: (type: "objective" | "procedure", id: string) => void,
): ColumnDef<WpRow>[] {
  const {
    state,
    dispatch,
    mode,
    textRef,
    handleTextChange,
    handleAddObjective,
    handleUpdateObjective,
    handleAddProcedure,
    handleUpdateProcedure,
    handleUpdateProcedureStatus,
    isCreatingObjective,
    isCreatingProcedure,
    isUpdatingObjective,
    isUpdatingProcedure,
    handleMoveRow,
  } = editor;

  return useMemo(
    () => [
      // ────────────────────── Title column (includes inline edit/delete on hover) ──────────────────────
      {
        id: "title",
        header: "Mô tả",
        cell: ({ row }) => {
          const r = row.original;
          const depth = row.depth;

          // ── Phantom add_objective ──
          if (r.type === "add_objective") {
            return (
              <div className="flex items-center gap-2 pl-1">
                <Target className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <InlineTableInput
                  placeholder="Tên mục tiêu..."
                  onChange={handleTextChange}
                  onSubmit={(v) => handleAddObjective(v, cardId)}
                  onCancel={() => dispatch({ type: "CANCEL_ADD" })}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleAddObjective(textRef.current, cardId)}
                  disabled={isCreatingObjective}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
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

          // ── Phantom add_procedure ──
          if (r.type === "add_procedure") {
            return (
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: `${depth * 24 + 4}px` }}
              >
                <ClipboardList className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                <InlineTableInput
                  placeholder="Tên thủ tục..."
                  onChange={handleTextChange}
                  onSubmit={(v) => handleAddProcedure(v, r.parentId ?? cardId)}
                  onCancel={() => dispatch({ type: "CANCEL_ADD" })}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    handleAddProcedure(textRef.current, r.parentId ?? cardId)
                  }
                  disabled={isCreatingProcedure}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dispatch({ type: "CANCEL_ADD" })}
                  disabled={isCreatingProcedure}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          }

          // ── Button: add objective + add procedure (section bottom) ──
          if (r.type === "btn_add_objective") {
            return (
              <div className="flex items-center gap-3 pl-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    dispatch({ type: "START_ADD_OBJECTIVE", sectionId: cardId })
                  }
                >
                  <Target className="mr-1 h-3 w-3 text-emerald-600" />
                  {WP_LABELS.addObjective}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    dispatch({
                      type: "START_ADD_PROCEDURE",
                      parentId: `sec:${cardId}`,
                    })
                  }
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {WP_LABELS.addProcedure}
                </Button>
              </div>
            );
          }

          // ── Button: add procedure (objective bottom) ──
          if (r.type === "btn_add_procedure") {
            return (
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: `${depth * 24 + 4}px` }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    dispatch({
                      type: "START_ADD_PROCEDURE",
                      parentId: r.parentId ?? cardId,
                    })
                  }
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {WP_LABELS.addProcedure}
                </Button>
              </div>
            );
          }

          // ── Editing objective ──
          if (
            r.type === "objective" &&
            state.editingId === r.id &&
            state.editingType === "objective"
          ) {
            return (
              <div className="flex items-center gap-2 pl-1">
                <Target className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <InlineTableInput
                  initialValue={r.title}
                  onChange={handleTextChange}
                  onSubmit={(v) => handleUpdateObjective(r.id, v)}
                  onCancel={() => dispatch({ type: "CANCEL_EDIT" })}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleUpdateObjective(r.id, textRef.current)}
                  disabled={isUpdatingObjective}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
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

          // ── Editing procedure ──
          if (
            r.type === "procedure" &&
            state.editingId === r.id &&
            state.editingType === "procedure"
          ) {
            return (
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: `${depth * 24 + 4}px` }}
              >
                <ClipboardList className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                <InlineTableInput
                  initialValue={r.title}
                  onChange={handleTextChange}
                  onSubmit={(v) => handleUpdateProcedure(r.id, v)}
                  onCancel={() => dispatch({ type: "CANCEL_EDIT" })}
                  autoFocus
                />
                {mode === "execution" && (
                  <LabeledSelect
                    value={state.editingStatus || r.status || "not_started"}
                    onChange={(v) =>
                      dispatch({ type: "SET_EDIT_STATUS", value: v })
                    }
                    options={PROCEDURE_STATUS_OPTIONS}
                    className="h-7 w-32 text-xs"
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    dispatch({ type: "CANCEL_EDIT" });
                    onOpenForm?.("procedure", r.id);
                  }}
                  title="Mở biểu mẫu đầy đủ"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleUpdateProcedure(r.id, textRef.current)}
                  disabled={isUpdatingProcedure}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dispatch({ type: "CANCEL_EDIT" })}
                  disabled={isUpdatingProcedure}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          }

          // ── Normal objective ──
          if (r.type === "objective") {
            return (
              <div className="flex items-center gap-2 pl-1 group/title">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    row.toggleExpanded();
                  }}
                  className="h-5 w-5"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Target className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span
                  className="text-sm font-medium cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewItem?.("objective", r.id);
                  }}
                >
                  {r.title}
                </span>
              </div>
            );
          }

          // ── Normal procedure ──
          if (r.type === "procedure") {
            return (
              <div
                className="flex items-center gap-2 group/title"
                style={{ paddingLeft: `${depth * 24 + 4}px` }}
              >
                <ClipboardList className="h-3 w-3 shrink-0 text-violet-500" />
                <span
                  className="text-sm cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewItem?.("procedure", r.id);
                  }}
                >
                  {r.title}
                </span>
              </div>
            );
          }

          return null;
        },
      },

      // ────────────────────── Status column — always visible for procedures ──────────────────────
      {
        id: "status",
        header: "",
        size: mode === "execution" ? 160 : 100,
        cell: ({ row }) => {
          const r = row.original;
          if (r.type !== "procedure") return null;
          if (state.editingId === r.id && state.editingType === "procedure")
            return null;

          if (mode === "execution") {
            return (
              <LabeledSelect
                value={r.status ?? "not_started"}
                onChange={(v) => handleUpdateProcedureStatus(r.id, v)}
                options={PROCEDURE_STATUS_OPTIONS}
                className="h-7 w-36 text-xs"
              />
            );
          }
          return <StatusBadge status={r.status} />;
        },
      },
      // ────────────────────── Actions column — edit/delete + reorder, hover only ──────────────────────
      {
        id: "_actions",
        header: "",
        size: 160,
        cell: ({ row, table }) => {
          const r = row.original;
          if (r.type !== "objective" && r.type !== "procedure") return null;
          if (state.editingId === r.id) return null;

          const parentRow = row.getParentRow();
          const pool = parentRow ? parentRow.subRows : table.getRowModel().rows;
          const sameType = pool.filter((sr) => sr.original.type === r.type);
          const idx = sameType.findIndex((sr) => sr.id === row.id);
          const isFirst = idx <= 0;
          const isLast = idx >= sameType.length - 1;

          return (
            <span
              className="flex items-center justify-end gap-0 opacity-0 group-hover/row:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  if (r.type === "objective") {
                    dispatch({
                      type: "START_EDIT_OBJECTIVE",
                      id: r.id,
                      title: r.title,
                    });
                  } else {
                    dispatch({
                      type: "START_EDIT_PROCEDURE",
                      id: r.id,
                      title: r.title,
                      status: r.status ?? "not_started",
                    });
                  }
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() =>
                  dispatch({
                    type: "SET_DELETE",
                    target: {
                      type: r.type as "objective" | "procedure",
                      id: r.id,
                      title: r.title.slice(0, 40),
                    },
                  })
                }
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              {sameType.length > 1 && (
                <>
                  <span className="mx-0.5 h-4 w-px bg-border" />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isFirst}
                    onClick={() => handleMoveRow(r.id, "first")}
                    title="Đưa lên đầu"
                  >
                    <ArrowUpToLine className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isFirst}
                    onClick={() => handleMoveRow(r.id, "up")}
                    title="Lên trên"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isLast}
                    onClick={() => handleMoveRow(r.id, "down")}
                    title="Xuống dưới"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isLast}
                    onClick={() => handleMoveRow(r.id, "last")}
                    title="Đưa xuống cuối"
                  >
                    <ArrowDownToLine className="h-3 w-3" />
                  </Button>
                </>
              )}
            </span>
          );
        },
      },
    ],
    [
      state,
      dispatch,
      mode,
      cardId,
      textRef,
      handleTextChange,
      handleAddObjective,
      handleUpdateObjective,
      handleAddProcedure,
      handleUpdateProcedure,
      handleUpdateProcedureStatus,
      handleMoveRow,
      isCreatingObjective,
      isCreatingProcedure,
      isUpdatingObjective,
      isUpdatingProcedure,
      onViewItem,
      onOpenForm,
    ],
  );
}
