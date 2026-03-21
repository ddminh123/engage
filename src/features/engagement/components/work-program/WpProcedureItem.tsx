"use client";

import { useState } from "react";
import { ClipboardList, Check, X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { type DragHandleRenderProps } from "@/components/shared/SortableList";
import { cn } from "@/lib/utils";
import type {
  EngagementProcedure,
  EngagementSection,
  EngagementObjective,
} from "../../types";
import type { WpEditor } from "../tabs/useWorkProgramEditor";
import { PROCEDURE_STATUS_OPTIONS } from "../tabs/workProgramTypes";
import { WpStatusBadge } from "./WpStatusBadge";
import { MoveProcedureMenu } from "./WpMoveMenu";
import { WpContextMenu } from "./WpContextMenu";
import { useBatchAction } from "../../hooks/useEngagements";

interface WpProcedureItemProps {
  procedure: EngagementProcedure;
  editor: WpEditor;
  dragHandleProps: DragHandleRenderProps;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewItem?: (type: "objective" | "procedure", id: string) => void;
  onOpenForm?: (type: "objective" | "procedure", id: string) => void;
  allSections: EngagementSection[];
  allStandaloneObjectives: EngagementObjective[];
  onMoveProcedure: (
    procedureId: string,
    target: { sectionId: string | null; objectiveId: string | null },
  ) => void;
}

export function WpProcedureItem({
  procedure,
  editor,
  dragHandleProps,
  isSelected,
  onToggleSelect,
  onViewItem,
  onOpenForm,
  allSections,
  allStandaloneObjectives,
  onMoveProcedure,
}: WpProcedureItemProps) {
  const {
    state,
    dispatch,
    mode,
    engagementId,
    textRef,
    handleTextChange,
    handleUpdateProcedure,
    handleUpdateProcedureStatus,
    isUpdatingProcedure,
  } = editor;

  const batchAction = useBatchAction();

  const handleDuplicate = () => {
    batchAction.mutate({
      engagementId,
      action: "duplicate",
      entityType: "procedure",
      ids: [procedure.id],
    });
  };

  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const isEditing =
    state.editingId === procedure.id && state.editingType === "procedure";

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/30">
        <ClipboardList className="h-3.5 w-3.5 shrink-0 text-violet-500" />
        <InlineTableInput
          initialValue={procedure.title}
          onChange={handleTextChange}
          onSubmit={(v) => handleUpdateProcedure(procedure.id, v)}
          onCancel={() => dispatch({ type: "CANCEL_EDIT" })}
          autoFocus
        />
        {mode === "execution" && (
          <LabeledSelect
            value={state.editingStatus || procedure.status || "not_started"}
            onChange={(v) => dispatch({ type: "SET_EDIT_STATUS", value: v })}
            options={PROCEDURE_STATUS_OPTIONS}
            className="h-7 w-32 text-xs"
          />
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            dispatch({ type: "CANCEL_EDIT" });
            onOpenForm?.("procedure", procedure.id);
          }}
          title="Mở biểu mẫu đầy đủ"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleUpdateProcedure(procedure.id, textRef.current)}
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

  const procedureRow = (
    <div
      className="group/row flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/30"
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
        onClick={() => onToggleSelect(procedure.id)}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </button>

      <ClipboardList className="h-3 w-3 shrink-0 text-violet-500" />

      <span
        className="text-sm cursor-pointer hover:underline"
        onClick={() => onViewItem?.("procedure", procedure.id)}
      >
        {procedure.title}
      </span>

      {/* Status — always visible */}
      <span className="ml-auto shrink-0">
        {mode === "execution" ? (
          <LabeledSelect
            value={procedure.status ?? "not_started"}
            onChange={(v) =>
              editor.handleUpdateProcedureStatus(procedure.id, v)
            }
            options={PROCEDURE_STATUS_OPTIONS}
            className="h-7 w-36 text-xs"
          />
        ) : (
          <WpStatusBadge status={procedure.status} />
        )}
      </span>
    </div>
  );

  return (
    <>
      {isEditing ? (
        procedureRow
      ) : (
        <WpContextMenu
          onEdit={() =>
            dispatch({
              type: "START_EDIT_PROCEDURE",
              id: procedure.id,
              title: procedure.title,
              status: procedure.status ?? "not_started",
            })
          }
          onDelete={() =>
            dispatch({
              type: "SET_DELETE",
              target: {
                type: "procedure",
                id: procedure.id,
                title: procedure.title.slice(0, 40),
              },
            })
          }
          onDuplicate={handleDuplicate}
          onMove={() => setShowMoveMenu(true)}
        >
          {procedureRow}
        </WpContextMenu>
      )}
      <MoveProcedureMenu
        procedureId={procedure.id}
        currentObjectiveId={procedure.objectiveId}
        currentSectionId={procedure.sectionId}
        sections={allSections}
        standaloneObjectives={allStandaloneObjectives}
        onMove={onMoveProcedure}
        open={showMoveMenu}
        onOpenChange={setShowMoveMenu}
      />
    </>
  );
}
