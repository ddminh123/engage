"use client";

import { useCallback } from "react";
import { ClipboardList, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineTableInput } from "@/components/shared/InlineTableInput";
import { cn } from "@/lib/utils";
import { type DragHandleRenderProps } from "@/components/shared/SortableList";
import type {
  EngagementProcedure,
  EngagementMember,
  WpAssignment,
} from "../../types";
import { StatusBadge } from "@/components/shared/workpaper/StatusBadge";
import { WpAssigneePicker } from "./WpAssigneePicker";
import type { WpEditor } from "../tabs/useWorkProgramEditor";
import { WpContextMenu } from "./WpContextMenu";
import { useBatchAction } from "../../hooks/useEngagements";

interface WpProcedureCardProps {
  procedure: EngagementProcedure;
  editor: WpEditor;
  dragHandleProps: DragHandleRenderProps;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewItem?: (type: "objective" | "procedure", id: string) => void;
  onOpenForm?: (type: "objective" | "procedure", id: string) => void;
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
  readOnly?: boolean;
}

export function WpProcedureCard({
  procedure,
  editor,
  dragHandleProps,
  isSelected,
  onToggleSelect,
  onViewItem,
  onOpenForm,
  wpAssignments = [],
  members = [],
  onAssign,
  onUnassign,
  readOnly = false,
}: WpProcedureCardProps) {
  const {
    state,
    dispatch,
    textRef,
    handleTextChange,
    handleUpdateTopProcedure,
    isUpdatingProcedure,
    engagementId,
  } = editor;

  const batchAction = useBatchAction();

  const isEditingHeader = state.editingNodeId === procedure.id;

  const handleDuplicate = useCallback(() => {
    batchAction.mutate({
      engagementId,
      action: "duplicate",
      entityType: "procedure",
      ids: [procedure.id],
    });
  }, [batchAction, engagementId, procedure.id]);

  const cardHeader = (
    <div
      className={cn(
        "group/header flex items-center gap-2 px-3 py-2 select-none",
        dragHandleProps.isDragging ? "cursor-grabbing" : "cursor-pointer",
      )}
      onClick={() => {
        if (!isEditingHeader) {
          if (onOpenForm) onOpenForm("procedure", procedure.id);
          else onViewItem?.("procedure", procedure.id);
        }
      }}
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
          onToggleSelect(procedure.id);
        }}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </button>

      <ClipboardList className="h-4 w-4 shrink-0 text-violet-600" />

      {isEditingHeader ? (
        <span className="contents" onClick={(e) => e.stopPropagation()}>
          <InlineTableInput
            initialValue={state.editingNodeTitle}
            onChange={handleTextChange}
            onSubmit={(v) => handleUpdateTopProcedure(procedure.id, v)}
            onCancel={() => dispatch({ type: "CANCEL_EDIT_NODE" })}
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              handleUpdateTopProcedure(procedure.id, textRef.current)
            }
            disabled={isUpdatingProcedure}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => dispatch({ type: "CANCEL_EDIT_NODE" })}
            disabled={isUpdatingProcedure}
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
              if (onOpenForm) onOpenForm("procedure", procedure.id);
              else onViewItem?.("procedure", procedure.id);
            }}
          >
            {procedure.title}
          </span>

          {/* Status badge */}
          <StatusBadge status={procedure.approvalStatus} />

          {/* Assignees */}
          {onAssign && onUnassign && (
            <span className="ml-auto" onClick={(e) => e.stopPropagation()}>
              <WpAssigneePicker
                entityType="procedure"
                entityId={procedure.id}
                assignments={wpAssignments}
                members={members}
                onAdd={(userId) => onAssign("procedure", procedure.id, userId)}
                onRemove={(userId) =>
                  onUnassign("procedure", procedure.id, userId)
                }
              />
            </span>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="rounded-lg border" data-node-id={procedure.id}>
      {isEditingHeader && !readOnly ? (
        cardHeader
      ) : readOnly ? (
        cardHeader
      ) : (
        <WpContextMenu
          onEdit={() =>
            dispatch({
              type: "START_EDIT_NODE",
              id: procedure.id,
              title: procedure.title,
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
          showMove={false}
        >
          {cardHeader}
        </WpContextMenu>
      )}
    </div>
  );
}
