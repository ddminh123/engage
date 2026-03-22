"use client";

import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import {
  Layers,
  Target,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Copy,
} from "lucide-react";
import { useBatchAction } from "../../hooks/useEngagements";
import type { BatchEntityType } from "../../api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
import type {
  EngagementSection,
  EngagementObjective,
  EngagementProcedure,
} from "../../types";
import { type WpRow, type TopNode, WP_LABELS } from "./workProgramTypes";
import { useWorkProgramEditor, type WpMode } from "./useWorkProgramEditor";
import { useWpColumns } from "./workProgramColumns";
import { ProcedureDetailSheet } from "./ProcedureDetailSheet";
import { ObjectiveDetailSheet } from "./ObjectiveDetailSheet";
import { SectionDetailSheet } from "./SectionDetailSheet";
import { ProcedureFormSheet } from "./ProcedureFormSheet";
import { useUpdateProcedure } from "../../hooks/useEngagements";
import type { ProcedureUpdateInput } from "../../types";

// ── Props ──

interface WorkProgramTableProps {
  engagementId: string;
  sections: EngagementSection[];
  standaloneObjectives?: EngagementObjective[];
  findingCount?: number;
  mode: WpMode;
}

// ── Main Component ──

export function WorkProgramTable({
  engagementId,
  sections,
  standaloneObjectives = [],
  findingCount = 0,
  mode,
}: WorkProgramTableProps) {
  const editor = useWorkProgramEditor(
    engagementId,
    sections,
    standaloneObjectives,
    findingCount,
    mode,
  );

  const {
    state,
    dispatch,
    collapsed,
    collapseAll,
    expandAll,
    topNodes,
    stats,
    textRef,
    handleTextChange,
    handleAddSection,
    handleAddObjective,
    handleConfirmDelete,
    deleteTitle,
    deleteDesc,
    isDeleting,
    isCreatingSection,
    isCreatingObjective,
    handleMoveTopNode,
  } = editor;

  const allNodeIds = topNodes.map((n) => n.id);
  const allCollapsed =
    topNodes.length > 0 && allNodeIds.every((id) => collapsed.has(id));

  // Scroll into view when inline add form appears
  const addFormRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.addingTopType) {
      requestAnimationFrame(() => {
        addFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    }
  }, [state.addingTopType]);

  // ── Detail sheet state ──
  const [viewSection, setViewSection] = useState<EngagementSection | null>(
    null,
  );
  const [viewObjective, setViewObjective] =
    useState<EngagementObjective | null>(null);
  const [viewProcedure, setViewProcedure] =
    useState<EngagementProcedure | null>(null);

  // Build lookup maps for finding entities by ID
  const entityMaps = useMemo(() => {
    const sectionMap = new Map<string, EngagementSection>();
    const objectiveMap = new Map<string, EngagementObjective>();
    const procedureMap = new Map<string, EngagementProcedure>();

    for (const sec of sections) {
      sectionMap.set(sec.id, sec);
      for (const obj of sec.objectives) {
        objectiveMap.set(obj.id, obj);
        for (const proc of obj.procedures) procedureMap.set(proc.id, proc);
      }
      for (const proc of sec.procedures) procedureMap.set(proc.id, proc);
    }
    for (const obj of standaloneObjectives) {
      objectiveMap.set(obj.id, obj);
      for (const proc of obj.procedures) procedureMap.set(proc.id, proc);
    }

    return { sectionMap, objectiveMap, procedureMap };
  }, [sections, standaloneObjectives]);

  const handleViewItem = useCallback(
    (type: "objective" | "procedure", id: string) => {
      if (type === "objective") {
        setViewObjective(entityMaps.objectiveMap.get(id) ?? null);
      } else {
        setViewProcedure(entityMaps.procedureMap.get(id) ?? null);
      }
    },
    [entityMaps],
  );

  const handleViewSection = useCallback(
    (id: string) => {
      setViewSection(entityMaps.sectionMap.get(id) ?? null);
    },
    [entityMaps],
  );

  // ── Open full form from inline edit ──
  const [editProcedure, setEditProcedure] =
    useState<EngagementProcedure | null>(null);
  const updateProcMutation = useUpdateProcedure();

  const handleOpenForm = useCallback(
    (type: "objective" | "procedure", id: string) => {
      if (type === "procedure") {
        setEditProcedure(entityMaps.procedureMap.get(id) ?? null);
      }
    },
    [entityMaps],
  );

  const handleFormSubmit = useCallback(
    (data: ProcedureUpdateInput) => {
      if (!editProcedure) return;
      updateProcMutation.mutate(
        { engagementId, procedureId: editProcedure.id, data },
        { onSuccess: () => setEditProcedure(null) },
      );
    },
    [editProcedure, engagementId, updateProcMutation],
  );

  return (
    <div className="space-y-3 min-h-[60vh] pb-40">
      {/* ── Stats bar ── */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{stats.sections}</strong>{" "}
          {WP_LABELS.stats.sections}
        </span>
        <span>
          <strong className="text-foreground">{stats.objectives}</strong>{" "}
          {WP_LABELS.stats.objectives}
        </span>
        <span>
          <strong className="text-foreground">{stats.procedures}</strong>{" "}
          {WP_LABELS.stats.procedures}
        </span>
        {mode === "execution" && (
          <>
            <span>
              <strong className="text-foreground">{stats.completed}</strong>{" "}
              {WP_LABELS.stats.completed}
            </span>
            <span>
              <strong className="text-foreground">{stats.findings}</strong>{" "}
              {WP_LABELS.stats.findings}
            </span>
          </>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs"
            onClick={() => dispatch({ type: "START_ADD_SECTION" })}
          >
            <Plus className="mr-1 h-3 w-3" />
            {WP_LABELS.addSection}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => dispatch({ type: "START_ADD_TOP_OBJECTIVE" })}
          >
            <Target className="mr-1 h-3 w-3" />
            {WP_LABELS.addObjective}
          </Button>
        </div>
        {topNodes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (allCollapsed) expandAll();
              else collapseAll(allNodeIds);
            }}
          >
            <ChevronsUpDown className="mr-1.5 h-3.5 w-3.5" />
            {allCollapsed ? WP_LABELS.expandAll : WP_LABELS.collapseAll}
          </Button>
        )}
      </div>

      {/* ── Empty state ── */}
      {topNodes.length === 0 && !state.addingTopType && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {WP_LABELS.noData}
        </p>
      )}

      {/* ── Section / Objective cards ── */}
      <div className="space-y-3">
        {topNodes.map((node) => (
          <TopNodeCard
            key={node.id}
            node={node}
            editor={editor}
            onViewItem={handleViewItem}
            onViewSection={handleViewSection}
            onOpenForm={handleOpenForm}
            onMoveNode={handleMoveTopNode}
          />
        ))}
      </div>

      {/* ── Inline add section / top-level objective ── */}
      {state.addingTopType === "section" && (
        <div ref={addFormRef} className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 shrink-0 text-blue-600" />
            <InlineTableInput
              placeholder="Tên phần hành..."
              onChange={handleTextChange}
              onCancel={() => dispatch({ type: "CANCEL_ADD_TOP" })}
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleAddSection(textRef.current)}
              disabled={isCreatingSection}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => dispatch({ type: "CANCEL_ADD_TOP" })}
              disabled={isCreatingSection}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {state.addingTopType === "objective" && (
        <div ref={addFormRef} className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 shrink-0 text-emerald-600" />
            <InlineTableInput
              placeholder="Tên mục tiêu..."
              onChange={handleTextChange}
              onCancel={() => dispatch({ type: "CANCEL_ADD_TOP" })}
              autoFocus
            />
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
              onClick={() => dispatch({ type: "CANCEL_ADD_TOP" })}
              disabled={isCreatingObjective}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      <ConfirmDialog
        open={!!state.deleteTarget}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CLEAR_DELETE" });
        }}
        title={deleteTitle}
        description={deleteDesc}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* ── Detail sheets ── */}
      <SectionDetailSheet
        section={viewSection}
        open={!!viewSection}
        onOpenChange={(open) => {
          if (!open) setViewSection(null);
        }}
        onEdit={() => {
          if (viewSection) {
            setViewSection(null);
            dispatch({
              type: "START_EDIT_NODE",
              id: viewSection.id,
              title: viewSection.title,
            });
          }
        }}
        onDelete={() => {
          if (viewSection) {
            setViewSection(null);
            dispatch({
              type: "SET_DELETE",
              target: {
                type: "section",
                id: viewSection.id,
                title: viewSection.title.slice(0, 40),
              },
            });
          }
        }}
      />
      <ObjectiveDetailSheet
        objective={viewObjective}
        open={!!viewObjective}
        onOpenChange={(open) => {
          if (!open) setViewObjective(null);
        }}
        onEdit={() => {
          if (viewObjective) {
            setViewObjective(null);
            dispatch({
              type: "START_EDIT_OBJECTIVE",
              id: viewObjective.id,
              title: viewObjective.title,
            });
          }
        }}
        onDelete={() => {
          if (viewObjective) {
            setViewObjective(null);
            dispatch({
              type: "SET_DELETE",
              target: {
                type: "objective",
                id: viewObjective.id,
                title: viewObjective.title.slice(0, 40),
              },
            });
          }
        }}
      />
      <ProcedureDetailSheet
        procedure={viewProcedure}
        open={!!viewProcedure}
        onOpenChange={(open) => {
          if (!open) setViewProcedure(null);
        }}
        engagementId={engagementId}
      />

      {/* ── Full form sheet (opened from inline edit) ── */}
      <ProcedureFormSheet
        open={!!editProcedure}
        onOpenChange={(open) => {
          if (!open) setEditProcedure(null);
        }}
        initialData={editProcedure}
        onSubmit={handleFormSubmit}
        isLoading={updateProcMutation.isPending}
      />
    </div>
  );
}

// ── Top-level card (Section or standalone Objective) ──

function TopNodeCard({
  node,
  editor,
  onViewItem,
  onViewSection,
  onOpenForm,
  onMoveNode,
}: {
  node: TopNode;
  editor: ReturnType<typeof useWorkProgramEditor>;
  onViewItem?: (type: "objective" | "procedure", id: string) => void;
  onViewSection?: (id: string) => void;
  onOpenForm?: (type: "objective" | "procedure", id: string) => void;
  onMoveNode?: (
    nodeId: string,
    direction: "up" | "down" | "first" | "last",
  ) => void;
}) {
  const {
    state,
    dispatch,
    collapsed,
    toggleCollapse,
    textRef,
    handleTextChange,
    handleUpdateSection,
    handleUpdateTopObjective,
    treesMap,
    topNodes,
    isUpdatingSection,
    isUpdatingObjective,
  } = editor;

  const isCollapsed = collapsed.has(node.id);
  const isEditingHeader = state.editingNodeId === node.id;
  const treeData = treesMap.get(node.id) ?? [];

  const columns = useWpColumns(
    editor,
    node.id,
    node.type,
    onViewItem,
    onOpenForm,
  );
  const batchAction = useBatchAction();

  // Build flat ID→type lookup
  const rowTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (rows: WpRow[]) => {
      for (const r of rows) {
        map.set(r.id, r.type);
        if (r.children.length) walk(r.children);
      }
    };
    walk(treeData);
    return map;
  }, [treeData]);

  const canSelectWpRow = useCallback(
    (row: WpRow) => row.type === "objective" || row.type === "procedure",
    [],
  );

  const handleBatch = useCallback(
    (
      action: "delete" | "duplicate",
      selectedIds: string[],
      clear: () => void,
    ) => {
      const wpEntityTypeMap: Record<string, BatchEntityType> = {
        objective: "objective",
        procedure: "procedure",
      };
      const groups = new Map<BatchEntityType, string[]>();
      for (const id of selectedIds) {
        const rowType = rowTypeMap.get(id);
        if (!rowType) continue;
        const entityType = wpEntityTypeMap[rowType];
        if (!entityType) continue;
        const arr = groups.get(entityType) ?? [];
        arr.push(id);
        groups.set(entityType, arr);
      }
      for (const [entityType, ids] of groups) {
        batchAction.mutate({
          engagementId: editor.engagementId,
          action,
          entityType,
          ids,
        });
      }
      clear();
    },
    [editor.engagementId, batchAction, rowTypeMap],
  );

  const renderBatchBar = useCallback(
    (selectedIds: string[], clear: () => void) => (
      <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm mx-1">
        <span className="font-medium">{selectedIds.length} đã chọn</span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleBatch("duplicate", selectedIds, clear)}
            disabled={batchAction.isPending}
          >
            <Copy className="mr-1 h-3 w-3" />
            Nhân bản
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => handleBatch("delete", selectedIds, clear)}
            disabled={batchAction.isPending}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Xóa
          </Button>
        </div>
      </div>
    ),
    [handleBatch, batchAction.isPending],
  );

  const icon =
    node.type === "section" ? (
      <Layers className="h-4 w-4 shrink-0 text-blue-600" />
    ) : (
      <Target className="h-4 w-4 shrink-0 text-emerald-600" />
    );

  const isSavingHeader =
    node.type === "section" ? isUpdatingSection : isUpdatingObjective;

  // Position info for move buttons — unified across all top nodes
  const nodeIdx = topNodes.findIndex((n) => n.id === node.id);
  const isFirst = nodeIdx === 0;
  const isLast = nodeIdx === topNodes.length - 1;

  return (
    <div className="rounded-lg border" data-node-id={node.id}>
      {/* ── Card header ── */}
      <div
        className="flex items-center gap-2 px-3 py-2 group/header cursor-pointer select-none"
        onClick={() => !isEditingHeader && toggleCollapse(node.id)}
      >
        <span className="shrink-0">
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </span>
        {icon}

        {isEditingHeader ? (
          <span className="contents" onClick={(e) => e.stopPropagation()}>
            <InlineTableInput
              initialValue={state.editingNodeTitle}
              onChange={handleTextChange}
              onCancel={() => dispatch({ type: "CANCEL_EDIT_NODE" })}
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                if (node.type === "section")
                  handleUpdateSection(node.id, textRef.current);
                else handleUpdateTopObjective(node.id, textRef.current);
              }}
              disabled={isSavingHeader}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => dispatch({ type: "CANCEL_EDIT_NODE" })}
              disabled={isSavingHeader}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </span>
        ) : (
          <>
            <span
              className="text-sm font-medium cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                if (node.type === "section") onViewSection?.(node.id);
                else onViewItem?.("objective", node.id);
              }}
            >
              {node.title}
            </span>
            {/* Edit / Delete — hover only */}
            <span
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex items-center gap-0.5 opacity-0 group-hover/header:opacity-100 transition-opacity"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  dispatch({
                    type: "START_EDIT_NODE",
                    id: node.id,
                    title: node.title,
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
                    type: "SET_DELETE",
                    target: {
                      type: node.type,
                      id: node.id,
                      title: node.title.slice(0, 40),
                    },
                  })
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </span>
            {/* Move position — hover only */}
            {topNodes.length > 1 && (
              <span
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-0 opacity-0 group-hover/header:opacity-100 transition-opacity ml-1 border-l pl-1"
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isFirst}
                  onClick={() => onMoveNode?.(node.id, "first")}
                  title="Đưa lên đầu"
                >
                  <ArrowUpToLine className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isFirst}
                  onClick={() => onMoveNode?.(node.id, "up")}
                  title="Lên trên"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isLast}
                  onClick={() => onMoveNode?.(node.id, "down")}
                  title="Xuống dưới"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isLast}
                  onClick={() => onMoveNode?.(node.id, "last")}
                  title="Đưa xuống cuối"
                >
                  <ArrowDownToLine className="h-3 w-3" />
                </Button>
              </span>
            )}
          </>
        )}
      </div>

      {/* ── Card body (DataTable) ── */}
      {!isCollapsed && (
        <div className="border-t px-1 pb-1 [&>div]:space-y-0 [&_.rounded-md.border]:border-0 [&_.rounded-md.border]:rounded-none">
          <DataTable
            columns={columns}
            data={treeData}
            getSubRows={(row: WpRow) =>
              row.children.length > 0 ? row.children : undefined
            }
            emptyMessage="Chưa có mục nào."
            pageSize={100}
            hideToolbar
            defaultExpanded={false}
            enableRowSelection
            canSelectRow={canSelectWpRow}
            renderBatchBar={renderBatchBar}
          />
        </div>
      )}
    </div>
  );
}
