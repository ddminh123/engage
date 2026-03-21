"use client";

import { useCallback } from "react";
import {
  Layers,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
import {
  SortableList,
  type DragHandleRenderProps,
} from "@/components/shared/SortableList";
import { cn } from "@/lib/utils";
import type { EngagementSection, EngagementObjective } from "../../types";
import type { WpEditor } from "../tabs/useWorkProgramEditor";
import { WpObjectiveItem } from "./WpObjectiveItem";
import { WpProcedureItem } from "./WpProcedureItem";
import { WpAddButton } from "./WpAddButton";
import { WpInlineAdd } from "./WpInlineAdd";
import { WpContextMenu } from "./WpContextMenu";
import { useBatchAction } from "../../hooks/useEngagements";
// Move menus are rendered by WpObjectiveItem and WpProcedureItem children

interface WpSectionCardProps {
  section: EngagementSection;
  editor: WpEditor;
  dragHandleProps: DragHandleRenderProps;
  isSelected: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[], selected: boolean) => void;
  onViewItem?: (type: "objective" | "procedure", id: string) => void;
  onViewSection?: (id: string) => void;
  onOpenForm?: (type: "objective" | "procedure", id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openCardIds: Set<string>;
  onToggleCard: (id: string, open: boolean) => void;
  allSections: EngagementSection[];
  allStandaloneObjectives: EngagementObjective[];
  onMoveObjective: (
    objectiveId: string,
    targetSectionId: string | null,
  ) => void;
  onMoveProcedure: (
    procedureId: string,
    target: { sectionId: string | null; objectiveId: string | null },
  ) => void;
}

export function WpSectionCard({
  section,
  editor,
  dragHandleProps,
  isSelected,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewItem,
  onViewSection,
  onOpenForm,
  open,
  onOpenChange,
  openCardIds,
  onToggleCard,
  allSections,
  allStandaloneObjectives,
  onMoveObjective,
  onMoveProcedure,
}: WpSectionCardProps) {
  const {
    state,
    dispatch,
    textRef,
    handleTextChange,
    handleUpdateSection,
    handleAddObjective,
    handleAddProcedure,
    handleReorderRows,
    isUpdatingSection,
    isCreatingObjective,
    isCreatingProcedure,
    engagementId,
  } = editor;

  const batchAction = useBatchAction();

  const isEditingHeader = state.editingNodeId === section.id;
  const isAddingObjective =
    state.addingType === "objective" && state.addingForId === section.id;
  const isAddingProcedure =
    state.addingType === "procedure" &&
    state.addingForId === `sec:${section.id}`;

  // Collect all child IDs for select-all
  const getAllChildIds = useCallback(() => {
    const ids: string[] = [];
    for (const obj of section.objectives) {
      ids.push(obj.id);
      for (const proc of obj.procedures) ids.push(proc.id);
    }
    for (const proc of section.procedures) ids.push(proc.id);
    return ids;
  }, [section]);

  const handleHeaderCheckbox = useCallback(() => {
    if (isSelected) {
      // Deselect section + all children
      onToggleSelectAll([section.id, ...getAllChildIds()], false);
    } else {
      // Select section + all children
      onToggleSelectAll([section.id, ...getAllChildIds()], true);
    }
  }, [isSelected, section.id, getAllChildIds, onToggleSelectAll]);

  const isSavingHeader = isUpdatingSection;

  // Check if all nested objectives are expanded
  const allChildrenExpanded =
    section.objectives.length > 0 &&
    section.objectives.every((o) => openCardIds.has(o.id));

  const handleDuplicate = useCallback(() => {
    batchAction.mutate({
      engagementId,
      action: "duplicate",
      entityType: "section",
      ids: [section.id],
    });
  }, [batchAction, engagementId, section.id]);

  const cardHeader = (
    <div
      className="group/header flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
      onClick={() => !isEditingHeader && onOpenChange(!open)}
      {...dragHandleProps.attributes}
      {...dragHandleProps.listeners}
    >
      {/* Checkbox */}
      <button
        type="button"
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 hover:border-primary",
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleHeaderCheckbox();
        }}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </button>

      <span className="shrink-0">
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </span>

      <Layers className="h-4 w-4 shrink-0 text-blue-600" />

      {isEditingHeader ? (
        <span className="contents" onClick={(e) => e.stopPropagation()}>
          <InlineTableInput
            initialValue={state.editingNodeTitle}
            onChange={handleTextChange}
            onSubmit={(v) => handleUpdateSection(section.id, v)}
            onCancel={() => dispatch({ type: "CANCEL_EDIT_NODE" })}
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleUpdateSection(section.id, textRef.current)}
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
              onViewSection?.(section.id);
            }}
          >
            {section.title}
          </span>

          {/* Item count */}
          {(section.objectives.length > 0 || section.procedures.length > 0) && (
            <span className="text-xs text-muted-foreground">
              ({section.objectives.length + section.procedures.length})
            </span>
          )}

          {/* Expand/collapse all children — always visible */}
          <span onClick={(e) => e.stopPropagation()} className="ml-auto">
            <Button
              variant="ghost"
              size="icon-sm"
              title={allChildrenExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}
              onClick={() => {
                const objIds = section.objectives.map((o) => o.id);
                if (allChildrenExpanded && open) {
                  onOpenChange(false);
                  for (const id of objIds) onToggleCard(id, false);
                } else {
                  if (!open) onOpenChange(true);
                  for (const id of objIds) onToggleCard(id, true);
                }
              }}
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
            </Button>
          </span>
        </>
      )}
    </div>
  );

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="rounded-lg border" data-node-id={section.id}>
        {/* ── Card header ── */}
        {isEditingHeader ? (
          cardHeader
        ) : (
          <WpContextMenu
            onEdit={() =>
              dispatch({
                type: "START_EDIT_NODE",
                id: section.id,
                title: section.title,
              })
            }
            onDelete={() =>
              dispatch({
                type: "SET_DELETE",
                target: {
                  type: "section",
                  id: section.id,
                  title: section.title.slice(0, 40),
                },
              })
            }
            onDuplicate={handleDuplicate}
            showMove={false}
          >
            {cardHeader}
          </WpContextMenu>
        )}

        {/* ── Card body ── */}
        <CollapsibleContent>
          <div className="border-t px-3 py-2 space-y-1">
            {/* Objectives (with their procedures nested) */}
            {section.objectives.length > 0 && (
              <SortableList
                items={section.objectives}
                onReorder={handleReorderRows}
                renderItem={(obj, dh) => (
                  <WpObjectiveItem
                    objective={obj}
                    editor={editor}
                    dragHandleProps={dh}
                    isSelected={selectedIds.has(obj.id)}
                    selectedIds={selectedIds}
                    onToggleSelect={onToggleSelect}
                    onViewItem={onViewItem}
                    onOpenForm={onOpenForm}
                    open={openCardIds.has(obj.id)}
                    onOpenChange={(o: boolean) => onToggleCard(obj.id, o)}
                    allSections={allSections}
                    allStandaloneObjectives={allStandaloneObjectives}
                    onMoveObjective={onMoveObjective}
                    onMoveProcedure={onMoveProcedure}
                  />
                )}
              />
            )}

            {/* Direct procedures under section */}
            {section.procedures.length > 0 && (
              <SortableList
                items={section.procedures}
                onReorder={handleReorderRows}
                renderItem={(proc, dh) => (
                  <WpProcedureItem
                    procedure={proc}
                    editor={editor}
                    dragHandleProps={dh}
                    isSelected={selectedIds.has(proc.id)}
                    onToggleSelect={onToggleSelect}
                    onViewItem={onViewItem}
                    onOpenForm={onOpenForm}
                    allSections={allSections}
                    allStandaloneObjectives={allStandaloneObjectives}
                    onMoveProcedure={onMoveProcedure}
                  />
                )}
              />
            )}

            {/* Inline add forms */}
            {isAddingObjective && (
              <WpInlineAdd
                type="objective"
                onChange={handleTextChange}
                onSubmit={(v) => handleAddObjective(v, section.id)}
                onCancel={() => dispatch({ type: "CANCEL_ADD" })}
                textRef={textRef}
                isSaving={isCreatingObjective}
              />
            )}

            {isAddingProcedure && (
              <WpInlineAdd
                type="procedure"
                onChange={handleTextChange}
                onSubmit={(v) => handleAddProcedure(v, `sec:${section.id}`)}
                onCancel={() => dispatch({ type: "CANCEL_ADD" })}
                textRef={textRef}
                isSaving={isCreatingProcedure}
                onOpenForm={() => onOpenForm?.("procedure", section.id)}
              />
            )}

            {/* Add buttons */}
            {!isAddingObjective && !isAddingProcedure && (
              <WpAddButton
                showObjective
                showProcedure
                onAddObjective={() =>
                  dispatch({
                    type: "START_ADD_OBJECTIVE",
                    sectionId: section.id,
                  })
                }
                onAddProcedure={() =>
                  dispatch({
                    type: "START_ADD_PROCEDURE",
                    parentId: `sec:${section.id}`,
                  })
                }
              />
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
