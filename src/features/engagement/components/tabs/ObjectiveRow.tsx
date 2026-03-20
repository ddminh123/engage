"use client";

import { Plus, Pencil, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { InlineInput } from "./InlineInput";
import { ProcedureRow } from "./ProcedureRow";
import type { EngagementObjective, EngagementProcedure } from "../../types";

const LP = ENGAGEMENT_LABELS.procedure;

interface ObjectiveRowProps {
  obj: EngagementObjective;
  sectionId: string;
  // Inline rename
  isEditing: boolean;
  editingTitle: string;
  onSetEditingTitle: (t: string) => void;
  onStartEdit: () => void;
  onSubmitRename: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  // Inline add procedure
  addingProcKey: string | null;
  addingProcTitle: string;
  onSetProcTitle: (t: string) => void;
  onStartAddProc: () => void;
  onSubmitProc: () => void;
  onCancelAddProc: () => void;
  onExpandProcForm: () => void;
  // Procedure actions
  onEditProcedure: (p: EngagementProcedure) => void;
  onDeleteProcedure: (p: EngagementProcedure) => void;
  onProcStatusChange: (p: EngagementProcedure, status: string) => void;
}

export function ObjectiveRow({
  obj,
  sectionId,
  isEditing,
  editingTitle,
  onSetEditingTitle,
  onStartEdit,
  onSubmitRename,
  onCancelEdit,
  onDelete,
  addingProcKey,
  addingProcTitle,
  onSetProcTitle,
  onStartAddProc,
  onSubmitProc,
  onCancelAddProc,
  onExpandProcForm,
  onEditProcedure,
  onDeleteProcedure,
  onProcStatusChange,
}: ObjectiveRowProps) {
  const procKey = `obj:${obj.id}`;
  const isAddingProc = addingProcKey === procKey;

  return (
    <div className="mb-1">
      {/* Objective header row */}
      <div className="group flex items-center gap-2 py-1.5 pl-4">
        <Target className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
        {isEditing ? (
          <InlineInput
            value={editingTitle}
            onChange={onSetEditingTitle}
            onSubmit={onSubmitRename}
            onCancel={onCancelEdit}
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm font-medium">{obj.title}</span>
        )}
        {!isEditing && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
            <Button variant="ghost" size="icon-sm" onClick={onStartEdit}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Procedures under objective */}
      {obj.procedures.map((proc) => (
        <ProcedureRow
          key={proc.id}
          proc={proc}
          indent={2}
          onEdit={() => onEditProcedure(proc)}
          onDelete={() => onDeleteProcedure(proc)}
          onStatusChange={(s) => onProcStatusChange(proc, s)}
        />
      ))}

      {/* Inline add procedure */}
      {isAddingProc ? (
        <div className="py-1 pl-12">
          <InlineInput
            value={addingProcTitle}
            onChange={onSetProcTitle}
            onSubmit={onSubmitProc}
            onCancel={onCancelAddProc}
            onExpand={onExpandProcForm}
            placeholder="Tên thủ tục..."
            autoFocus
          />
        </div>
      ) : (
        <button
          className="flex items-center gap-1 py-1 pl-12 text-xs text-muted-foreground hover:text-foreground"
          onClick={onStartAddProc}
        >
          <Plus className="h-3 w-3" />
          {LP.createTitle}
        </button>
      )}
    </div>
  );
}
