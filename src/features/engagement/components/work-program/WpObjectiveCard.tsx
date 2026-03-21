"use client";

import { useCallback, useState } from "react";
import {
  Target,
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
import type { EngagementObjective, EngagementSection } from "../../types";
import type { WpEditor } from "../tabs/useWorkProgramEditor";
import { WpProcedureItem } from "./WpProcedureItem";
import { WpAddButton } from "./WpAddButton";
import { WpInlineAdd } from "./WpInlineAdd";
import { MoveObjectiveMenu } from "./WpMoveMenu";
import { WpContextMenu } from "./WpContextMenu";
import { useBatchAction } from "../../hooks/useEngagements";

interface WpObjectiveCardProps {
  objective: EngagementObjective;
  editor: WpEditor;
  dragHandleProps: DragHandleRenderProps;
  isSelected: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[], selected: boolean) => void;
  onViewItem?: (type: "objective" | "procedure", id: string) => void;
  onOpenForm?: (type: "objective" | "procedure", id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function WpObjectiveCard({
  objective,
  editor,
  dragHandleProps,
  isSelected,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewItem,
  onOpenForm,
  open,
  onOpenChange,
  allSections,
  allStandaloneObjectives,
  onMoveObjective,
  onMoveProcedure,
}: WpObjectiveCardProps) {
  const {
    state,
    dispatch,
    textRef,
    handleTextChange,
    handleUpdateTopObjective,
    handleAddProcedure,
    handleReorderRows,
    isUpdatingObjective,
    isCreatingProcedure,
    engagementId,
  } = editor;

  const batchAction = useBatchAction();

  const handleDuplicate = () => {
    batchAction.mutate({
      engagementId,
      action: "duplicate",
      entityType: "objective",
      ids: [objective.id],
    });
  };

  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const isEditingHeader = state.editingNodeId === objective.id;
  const isAddingProcedure =
    state.addingType === "procedure" && state.addingForId === objective.id;

  // Collect all child IDs for select-all
  const getAllChildIds = useCallback(() => {
    return objective.procedures.map((p) => p.id);
  }, [objective]);

  const handleHeaderCheckbox = useCallback(() => {
    if (isSelected) {
      onToggleSelectAll([objective.id, ...getAllChildIds()], false);
    } else {
      onToggleSelectAll([objective.id, ...getAllChildIds()], true);
    }
  }, [isSelected, objective.id, getAllChildIds, onToggleSelectAll]);

  const isSavingHeader = isUpdatingObjective;

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

      <Target className="h-4 w-4 shrink-0 text-emerald-600" />

      {isEditingHeader ? (
        <span className="contents" onClick={(e) => e.stopPropagation()}>
          <InlineTableInput
            initialValue={state.editingNodeTitle}
            onChange={handleTextChange}
            onSubmit={(v) => handleUpdateTopObjective(objective.id, v)}
            onCancel={() => dispatch({ type: "CANCEL_EDIT_NODE" })}
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              handleUpdateTopObjective(objective.id, textRef.current)
            }
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
              onViewItem?.("objective", objective.id);
            }}
          >
            {objective.title}
          </span>

          {/* Procedure count */}
          {objective.procedures.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({objective.procedures.length})
            </span>
          )}

          {/* Expand/collapse — always visible */}
          <span onClick={(e) => e.stopPropagation()} className="ml-auto">
            <Button
              variant="ghost"
              size="icon-sm"
              title={open ? "Thu gọn" : "Mở rộng"}
              onClick={() => onOpenChange(!open)}
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
      <div className="rounded-lg border" data-node-id={objective.id}>
        {/* ── Card header ── */}
        {isEditingHeader ? (
          cardHeader
        ) : (
          <WpContextMenu
            onEdit={() =>
              dispatch({
                type: "START_EDIT_NODE",
                id: objective.id,
                title: objective.title,
              })
            }
            onDelete={() =>
              dispatch({
                type: "SET_DELETE",
                target: {
                  type: "objective",
                  id: objective.id,
                  title: objective.title.slice(0, 40),
                },
              })
            }
            onDuplicate={handleDuplicate}
            onMove={() => setShowMoveMenu(true)}
          >
            {cardHeader}
          </WpContextMenu>
        )}
        <MoveObjectiveMenu
          objectiveId={objective.id}
          currentSectionId={objective.sectionId}
          sections={allSections}
          onMove={onMoveObjective}
          open={showMoveMenu}
          onOpenChange={setShowMoveMenu}
        />

        {/* ── Card body ── */}
        <CollapsibleContent>
          <div className="border-t px-3 py-2 space-y-1">
            {objective.procedures.length > 0 && (
              <SortableList
                items={objective.procedures}
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

            {/* Inline add procedure */}
            {isAddingProcedure ? (
              <WpInlineAdd
                type="procedure"
                onChange={handleTextChange}
                onSubmit={(v) => handleAddProcedure(v, objective.id)}
                onCancel={() => dispatch({ type: "CANCEL_ADD" })}
                textRef={textRef}
                isSaving={isCreatingProcedure}
                onOpenForm={() => onOpenForm?.("procedure", objective.id)}
              />
            ) : (
              <WpAddButton
                showProcedure
                onAddProcedure={() =>
                  dispatch({
                    type: "START_ADD_PROCEDURE",
                    parentId: objective.id,
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
