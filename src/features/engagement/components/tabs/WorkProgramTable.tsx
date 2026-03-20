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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
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
      {topNodes.map((node) => (
        <TopNodeCard key={node.id} node={node} editor={editor} />
      ))}

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
}: {
  node: TopNode;
  editor: ReturnType<typeof useWorkProgramEditor>;
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

  return (
    <div className="rounded-lg border">
      {/* ── Card header ── */}
      <div className="flex items-center gap-2 px-3 py-2 group/header">
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-5 w-5"
          onClick={() => toggleCollapse(node.id)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>
        {icon}

        {isEditingHeader ? (
          <>
            <InlineTableInput
              initialValue={state.editingNodeTitle}
              onChange={handleTextChange}
              onSubmit={(v) => {
                if (node.type === "section") handleUpdateSection(node.id, v);
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
          </>
        ) : (
          <>
            <span className="flex-1 text-sm font-medium">{node.title}</span>
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
          />
        </div>
      )}
    </div>
  );
}
