"use client";

import { useRef, useEffect } from "react";
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
  ArrowUpToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
import {
  SortableList,
  DragHandle,
  type DragHandleRenderProps,
} from "@/components/shared/SortableList";
import type { EngagementSection, EngagementObjective } from "../../types";
import { type WpRow, type TopNode, WP_LABELS } from "./workProgramTypes";
import { useWorkProgramEditor, type WpMode } from "./useWorkProgramEditor";
import { useWpColumns } from "./workProgramColumns";

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
    toggleCollapse,
    collapseAll,
    expandAll,
    topNodes,
    treesMap,
    stats,
    textRef,
    handleTextChange,
    handleAddSection,
    handleUpdateSection,
    handleAddObjective,
    handleUpdateTopObjective,
    handleConfirmDelete,
    deleteTitle,
    deleteDesc,
    isDeleting,
    isCreatingSection,
    isCreatingObjective,
    handleReorderTopNodes,
    handleMoveToTopNode,
    handleReorderRows,
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

  return (
    <div className="space-y-3">
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
      <SortableList
        items={topNodes}
        onReorder={handleReorderTopNodes}
        className="space-y-3"
        renderItem={(node, dragHandle) => (
          <TopNodeCard
            node={node}
            editor={editor}
            dragHandleProps={dragHandle}
          />
        )}
      />

      {/* ── Inline add section / top-level objective ── */}
      {state.addingTopType === "section" && (
        <div ref={addFormRef} className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 shrink-0 text-blue-600" />
            <InlineTableInput
              placeholder="Tên phần hành..."
              onChange={handleTextChange}
              onSubmit={(v) => handleAddSection(v)}
              onCancel={() => dispatch({ type: "CANCEL_ADD_TOP" })}
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleAddSection(textRef.current)}
              disabled={isCreatingSection}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
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
              onSubmit={(v) => handleAddObjective(v)}
              onCancel={() => dispatch({ type: "CANCEL_ADD_TOP" })}
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleAddObjective(textRef.current)}
              disabled={isCreatingObjective}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
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
    </div>
  );
}

// ── Top-level card (Section or standalone Objective) ──

function TopNodeCard({
  node,
  editor,
  dragHandleProps,
}: {
  node: TopNode;
  editor: ReturnType<typeof useWorkProgramEditor>;
  dragHandleProps: DragHandleRenderProps;
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
    handleMoveToTopNode,
    handleReorderRows,
    treesMap,
    topNodes,
    isUpdatingSection,
    isUpdatingObjective,
  } = editor;

  const isCollapsed = collapsed.has(node.id);
  const isEditingHeader = state.editingNodeId === node.id;
  const treeData = treesMap.get(node.id) ?? [];

  const columns = useWpColumns(editor, node.id, node.type);

  const icon =
    node.type === "section" ? (
      <Layers className="h-4 w-4 shrink-0 text-blue-600" />
    ) : (
      <Target className="h-4 w-4 shrink-0 text-emerald-600" />
    );

  const isSavingHeader =
    node.type === "section" ? isUpdatingSection : isUpdatingObjective;

  const sameTypeNodes = topNodes.filter((n) => n.type === node.type);
  const isFirstOfType = sameTypeNodes[0]?.id === node.id;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="rounded-lg border">
          {/* ── Card header ── */}
          <div
            className="flex items-center gap-2 px-3 py-2 group/header cursor-pointer select-none"
            onClick={() => !isEditingHeader && toggleCollapse(node.id)}
          >
            <span onClick={(e) => e.stopPropagation()}>
              <DragHandle {...dragHandleProps} />
            </span>
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
                  onSubmit={(v) => {
                    if (node.type === "section")
                      handleUpdateSection(node.id, v);
                    else handleUpdateTopObjective(node.id, v);
                  }}
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
                <span className="flex-1 text-sm font-medium">{node.title}</span>
                <span
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-0.5"
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover/header:opacity-100 transition-opacity"
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
                    className="text-destructive hover:text-destructive opacity-0 group-hover/header:opacity-100 transition-opacity"
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
                enableRowReorder
                onRowReorder={handleReorderRows}
              />
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => handleMoveToTopNode(node.id)}
          disabled={isFirstOfType}
        >
          <ArrowUpToLine className="mr-2 h-3.5 w-3.5" />
          Đưa lên đầu
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
