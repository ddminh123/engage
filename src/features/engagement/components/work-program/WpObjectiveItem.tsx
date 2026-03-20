"use client";

import {
  Target,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
import {
  SortableList,
  DragHandle,
  type DragHandleRenderProps,
} from "@/components/shared/SortableList";
import { cn } from "@/lib/utils";
import type { EngagementObjective, EngagementSection } from "../../types";
import type { WpEditor } from "../tabs/useWorkProgramEditor";
import { WpProcedureItem } from "./WpProcedureItem";
import { WpAddButton } from "./WpAddButton";
import { WpInlineAdd } from "./WpInlineAdd";
import { MoveObjectiveMenu } from "./WpMoveMenu";

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
  } = editor;

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

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      {/* ── Objective header row ── */}
      <div className="group/row flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/30">
        <DragHandle {...dragHandleProps} />

        {/* Checkbox */}
        <button
          type="button"
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30 hover:border-primary",
          )}
          onClick={() => onToggleSelect(objective.id)}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </button>

        {/* Expand chevron */}
        <CollapsibleTrigger
          render={<Button variant="ghost" size="icon-sm" className="h-5 w-5" />}
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </CollapsibleTrigger>

        <Target className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

        <span
          className="text-sm font-medium cursor-pointer hover:underline"
          onClick={() => onViewItem?.("objective", objective.id)}
        >
          {objective.title}
        </span>

        {/* Procedure count badge */}
        {objective.procedures.length > 0 && (
          <span className="text-xs text-muted-foreground">
            ({objective.procedures.length})
          </span>
        )}

        {/* Actions — hover only */}
        <span className="ml-auto flex items-center gap-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              dispatch({
                type: "START_EDIT_OBJECTIVE",
                id: objective.id,
                title: objective.title,
              })
            }
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
                  type: "objective",
                  id: objective.id,
                  title: objective.title.slice(0, 40),
                },
              })
            }
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <MoveObjectiveMenu
            objectiveId={objective.id}
            currentSectionId={objective.sectionId}
            sections={allSections}
            onMove={onMoveObjective}
          />
        </span>
      </div>

      {/* ── Collapsible content: procedures ── */}
      <CollapsibleContent>
        <div className="pl-10 space-y-0">
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
  );
}
