"use client";

import { useState } from "react";
import { Target, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
import {
  SortableList,
  type DragHandleRenderProps,
} from "@/components/shared/SortableList";
import { cn } from "@/lib/utils";
import type {
  EngagementObjective,
  EngagementSection,
  EngagementMember,
  WpAssignment,
} from "../../types";
import { WpAssigneePicker } from "./WpAssigneePicker";
import type { WpEditor } from "../tabs/useWorkProgramEditor";
import { WpProcedureItem } from "./WpProcedureItem";
import { WpAddButton } from "./WpAddButton";
import { WpInlineAdd } from "./WpInlineAdd";
import { MoveObjectiveMenu } from "./WpMoveMenu";
import { WpContextMenu } from "./WpContextMenu";
import { CatalogPickerDialog } from "../tabs/CatalogPickerDialog";
import { useBatchAction } from "../../hooks/useEngagements";

interface WpObjectiveItemProps {
  objective: EngagementObjective;
  editor: WpEditor;
  dragHandleProps: DragHandleRenderProps;
  isSelected: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
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
  wpAssignments?: WpAssignment[];
  members?: EngagementMember[];
  onAssign?: (
    entityType: "section" | "objective" | "procedure",
    entityId: string,
    userId: string,
  ) => void;
  onUnassign?: (
    entityType: "section" | "objective" | "procedure",
    entityId: string,
    userId: string,
  ) => void;
}

export function WpObjectiveItem({
  objective,
  editor,
  dragHandleProps,
  isSelected,
  selectedIds,
  onToggleSelect,
  onViewItem,
  onOpenForm,
  open,
  onOpenChange,
  allSections,
  allStandaloneObjectives,
  onMoveObjective,
  onMoveProcedure,
  wpAssignments = [],
  members = [],
  onAssign,
  onUnassign,
}: WpObjectiveItemProps) {
  const {
    state,
    dispatch,
    textRef,
    handleTextChange,
    handleUpdateObjective,
    handleAddProcedure,
    handleReorderRows,
    isUpdatingObjective,
    isCreatingProcedure,
    engagementId,
  } = editor;

  const [catalogPickerOpen, setCatalogPickerOpen] = useState(false);

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

  const isEditing =
    state.editingId === objective.id && state.editingType === "objective";
  const isAddingProcedure =
    state.addingType === "procedure" && state.addingForId === objective.id;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/30">
        <Target className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
        <InlineTableInput
          initialValue={objective.title}
          onChange={handleTextChange}
          onSubmit={(v) => handleUpdateObjective(objective.id, v)}
          onCancel={() => dispatch({ type: "CANCEL_EDIT" })}
          autoFocus
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleUpdateObjective(objective.id, textRef.current)}
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

  const objectiveRow = (
    <div
      className={cn(
        "group/row flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/30",
        dragHandleProps.isDragging ? "cursor-grabbing" : "cursor-pointer",
      )}
      onClick={() => onOpenChange(!open)}
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
          onToggleSelect(objective.id);
        }}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </button>

      {/* Expand chevron */}
      {open ? (
        <ChevronDown className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      )}

      <Target className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

      <span
        className="text-sm font-medium cursor-pointer hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          onViewItem?.("objective", objective.id);
        }}
      >
        {objective.title}
      </span>

      {/* Procedure count badge */}
      {objective.procedures.length > 0 && (
        <span className="text-xs text-muted-foreground">
          ({objective.procedures.length})
        </span>
      )}

      {/* Assignees */}
      {onAssign && onUnassign && (
        <span className="ml-auto" onClick={(e) => e.stopPropagation()}>
          <WpAssigneePicker
            entityType="objective"
            entityId={objective.id}
            assignments={wpAssignments}
            members={members}
            onAdd={(userId) => onAssign("objective", objective.id, userId)}
            onRemove={(userId) => onUnassign("objective", objective.id, userId)}
          />
        </span>
      )}
    </div>
  );

  return (
    <>
    <Collapsible open={open} onOpenChange={onOpenChange}>
      {/* ── Objective header row ── */}
      {isEditing ? (
        objectiveRow
      ) : (
        <WpContextMenu
          onEdit={() =>
            dispatch({
              type: "START_EDIT_OBJECTIVE",
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
          {objectiveRow}
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

      {/* ── Collapsible content: procedures ── */}
      <CollapsibleContent>
        <div className="pl-12 space-y-0">
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
                  wpAssignments={wpAssignments}
                  members={members}
                  onAssign={onAssign}
                  onUnassign={onUnassign}
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
              onBrowseLibrary={() => setCatalogPickerOpen(true)}
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
    </Collapsible>

      <CatalogPickerDialog
        open={catalogPickerOpen}
        onOpenChange={setCatalogPickerOpen}
        entityType="procedure"
        engagementId={engagementId}
        objectiveId={objective.id}
        onItemsAdded={() => setCatalogPickerOpen(false)}
      />
    </>
  );
}
