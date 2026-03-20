"use client";

import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import { Layers, Target, Plus, Check, X, ChevronsUpDown } from "lucide-react";
import { useBatchAction } from "../../hooks/useEngagements";
import type { BatchEntityType } from "../../api";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
import { SortableList } from "@/components/shared/SortableList";
import type {
  EngagementSection,
  EngagementObjective,
  EngagementProcedure,
  ProcedureUpdateInput,
} from "../../types";
import { WP_LABELS } from "../tabs/workProgramTypes";
import {
  useWorkProgramEditor,
  type WpMode,
} from "../tabs/useWorkProgramEditor";
import { ProcedureDetailSheet } from "../tabs/ProcedureDetailSheet";
import { ObjectiveDetailSheet } from "../tabs/ObjectiveDetailSheet";
import { SectionDetailSheet } from "../tabs/SectionDetailSheet";
import { ProcedureFormSheet } from "../tabs/ProcedureFormSheet";
import {
  useUpdateProcedure,
  useUpdateObjective,
} from "../../hooks/useEngagements";
import { WpSectionCard } from "./WpSectionCard";
import { WpObjectiveCard } from "./WpObjectiveCard";
import { WpBatchBar } from "./WpBatchBar";

// ── Props ──

interface WorkProgramV2Props {
  engagementId: string;
  sections: EngagementSection[];
  standaloneObjectives?: EngagementObjective[];
  findingCount?: number;
  mode: WpMode;
}

// ── Main Component ──

export function WorkProgramV2({
  engagementId,
  sections,
  standaloneObjectives = [],
  findingCount = 0,
  mode,
}: WorkProgramV2Props) {
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
    topNodes,
    stats,
    textRef,
    handleTextChange,
    handleAddSection,
    handleAddObjective,
    handleConfirmDelete,
    handleReorderTopNodes,
    deleteTitle,
    deleteDesc,
    isDeleting,
    isCreatingSection,
    isCreatingObjective,
  } = editor;

  // ── Selection state ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((ids: string[], selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (selected) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // ── Batch actions ──
  const batchAction = useBatchAction();

  // Build type lookup for selected IDs
  const entityTypeMap = useMemo(() => {
    const map = new Map<string, "section" | "objective" | "procedure">();
    for (const sec of sections) {
      map.set(sec.id, "section");
      for (const obj of sec.objectives) {
        map.set(obj.id, "objective");
        for (const proc of obj.procedures) map.set(proc.id, "procedure");
      }
      for (const proc of sec.procedures) map.set(proc.id, "procedure");
    }
    for (const obj of standaloneObjectives) {
      map.set(obj.id, "objective");
      for (const proc of obj.procedures) map.set(proc.id, "procedure");
    }
    return map;
  }, [sections, standaloneObjectives]);

  // Derive valid selection — auto-discards stale IDs when data changes
  const validSelectedIds = useMemo(() => {
    if (selectedIds.size === 0) return selectedIds;
    const valid = new Set<string>();
    for (const id of selectedIds) {
      if (entityTypeMap.has(id)) valid.add(id);
    }
    return valid.size === selectedIds.size ? selectedIds : valid;
  }, [selectedIds, entityTypeMap]);

  // Batch delete confirmation
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  const executeBatchAction = useCallback(
    (action: "delete" | "duplicate") => {
      const groups = new Map<BatchEntityType, string[]>();
      for (const id of validSelectedIds) {
        const entityType = entityTypeMap.get(id);
        if (!entityType) continue;
        const arr = groups.get(entityType) ?? [];
        arr.push(id);
        groups.set(entityType, arr);
      }
      for (const [entityType, ids] of groups) {
        batchAction.mutate({ engagementId, action, entityType, ids });
      }
      clearSelection();
    },
    [
      validSelectedIds,
      entityTypeMap,
      engagementId,
      batchAction,
      clearSelection,
    ],
  );

  const handleBatchDelete = useCallback(() => {
    setBatchDeleteOpen(true);
  }, []);

  const handleConfirmBatchDelete = useCallback(() => {
    executeBatchAction("delete");
    setBatchDeleteOpen(false);
  }, [executeBatchAction]);

  const handleBatchDuplicate = useCallback(() => {
    executeBatchAction("duplicate");
  }, [executeBatchAction]);

  // ── Expand / Collapse state (local — replaces editor.collapsed) ──
  const [openCardIds, setOpenCardIds] = useState<Set<string>>(new Set());
  const toggleCard = useCallback((id: string, open: boolean) => {
    setOpenCardIds((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  // Collect ALL collapsible IDs (top-level + nested objectives inside sections)
  const allCollapsibleIds = useMemo(() => {
    const ids: string[] = [];
    for (const node of topNodes) {
      ids.push(node.id);
      if (node.type === "section" && node.section) {
        for (const obj of node.section.objectives) ids.push(obj.id);
      }
    }
    return ids;
  }, [topNodes]);
  const allExpanded =
    allCollapsibleIds.length > 0 &&
    allCollapsibleIds.every((id) => openCardIds.has(id));
  const handleExpandCollapseAll = useCallback(() => {
    if (allExpanded) {
      setOpenCardIds(new Set());
    } else {
      setOpenCardIds(new Set(allCollapsibleIds));
    }
  }, [allExpanded, allCollapsibleIds]);

  // ── Scroll into view when inline add form appears ──
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

  // Build lookup maps
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

  // ── Cross-parent move handlers ──
  const updateObjMutation = useUpdateObjective();

  const handleMoveObjective = useCallback(
    (objectiveId: string, targetSectionId: string | null) => {
      updateObjMutation.mutate({
        engagementId,
        objectiveId,
        data: { sectionId: targetSectionId },
      });
    },
    [engagementId, updateObjMutation],
  );

  const handleMoveProcedure = useCallback(
    (
      procedureId: string,
      target: { sectionId: string | null; objectiveId: string | null },
    ) => {
      updateProcMutation.mutate({
        engagementId,
        procedureId,
        data: {
          sectionId: target.sectionId,
          objectiveId: target.objectiveId,
        },
      });
    },
    [engagementId, updateProcMutation],
  );

  // ── Build sortable items for top-level SortableList ──
  // SortableList needs items with { id } — topNodes already have id
  const sortableTopNodes = useMemo(
    () => topNodes.map((n) => ({ ...n })),
    [topNodes],
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
          <Button variant="ghost" size="sm" onClick={handleExpandCollapseAll}>
            <ChevronsUpDown className="mr-1.5 h-3.5 w-3.5" />
            {allExpanded ? WP_LABELS.collapseAll : WP_LABELS.expandAll}
          </Button>
        )}
      </div>

      {/* ── Batch action bar ── */}
      <WpBatchBar
        count={validSelectedIds.size}
        onDuplicate={handleBatchDuplicate}
        onDelete={handleBatchDelete}
        onClear={clearSelection}
        isPending={batchAction.isPending}
      />

      {/* ── Empty state ── */}
      {topNodes.length === 0 && !state.addingTopType && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {WP_LABELS.noData}
        </p>
      )}

      {/* ── Top-level cards (sortable) ── */}
      {sortableTopNodes.length > 0 && (
        <SortableList
          items={sortableTopNodes}
          onReorder={handleReorderTopNodes}
          className="space-y-3"
          renderItem={(node, dragHandleProps) => {
            if (node.type === "section" && node.section) {
              return (
                <WpSectionCard
                  section={node.section}
                  editor={editor}
                  dragHandleProps={dragHandleProps}
                  isSelected={validSelectedIds.has(node.id)}
                  selectedIds={validSelectedIds}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  onViewItem={handleViewItem}
                  onViewSection={handleViewSection}
                  onOpenForm={handleOpenForm}
                  open={openCardIds.has(node.id)}
                  onOpenChange={(o: boolean) => toggleCard(node.id, o)}
                  openCardIds={openCardIds}
                  onToggleCard={toggleCard}
                  allSections={sections}
                  allStandaloneObjectives={standaloneObjectives}
                  onMoveObjective={handleMoveObjective}
                  onMoveProcedure={handleMoveProcedure}
                />
              );
            }
            if (node.type === "objective" && node.objective) {
              return (
                <WpObjectiveCard
                  objective={node.objective}
                  editor={editor}
                  dragHandleProps={dragHandleProps}
                  isSelected={validSelectedIds.has(node.id)}
                  selectedIds={validSelectedIds}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  onViewItem={handleViewItem}
                  onOpenForm={handleOpenForm}
                  open={openCardIds.has(node.id)}
                  onOpenChange={(o: boolean) => toggleCard(node.id, o)}
                  allSections={sections}
                  allStandaloneObjectives={standaloneObjectives}
                  onMoveObjective={handleMoveObjective}
                  onMoveProcedure={handleMoveProcedure}
                />
              );
            }
            return null;
          }}
        />
      )}

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

      {/* ── Batch delete confirmation ── */}
      <ConfirmDialog
        open={batchDeleteOpen}
        onOpenChange={setBatchDeleteOpen}
        title={`Xóa ${validSelectedIds.size} mục đã chọn?`}
        description="Hành động này không thể hoàn tác. Tất cả các mục đã chọn sẽ bị xóa vĩnh viễn."
        onConfirm={handleConfirmBatchDelete}
        isLoading={batchAction.isPending}
      />

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
