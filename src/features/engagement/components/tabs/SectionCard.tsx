"use client";

import {
  Plus,
  Pencil,
  Trash2,
  Target,
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { InlineInput } from "./InlineInput";
import { ObjectiveRow } from "./ObjectiveRow";
import { ProcedureRow } from "./ProcedureRow";
import type { EngagementSection, EngagementProcedure } from "../../types";
import type { Dispatch } from "react";

const LO = ENGAGEMENT_LABELS.objective;
const LP = ENGAGEMENT_LABELS.procedure;

interface SectionCardProps {
  section: EngagementSection;
  isCollapsed: boolean;
  // Inline rename
  editingId: string | null;
  editingTitle: string;
  // Inline add objective
  addingObjectiveFor: string | null;
  addingObjectiveTitle: string;
  // Inline add procedure
  addingProcFor: string | null;
  addingProcTitle: string;
  // Dispatch
  dispatch: Dispatch<any>;
  // Submit handlers
  onSubmitRenameSection: () => void;
  onSubmitRenameObjective: (objId: string) => void;
  onSubmitInlineObjective: () => void;
  onSubmitInlineProcedure: (sectionId?: string, objectiveId?: string) => void;
  // Procedure actions
  onEditProcedure: (p: EngagementProcedure) => void;
  onDeleteProcedure: (p: EngagementProcedure) => void;
  onProcStatusChange: (p: EngagementProcedure, status: string) => void;
}

export function SectionCard({
  section,
  isCollapsed,
  editingId,
  editingTitle,
  addingObjectiveFor,
  addingObjectiveTitle,
  addingProcFor,
  addingProcTitle,
  dispatch,
  onSubmitRenameSection,
  onSubmitRenameObjective,
  onSubmitInlineObjective,
  onSubmitInlineProcedure,
  onEditProcedure,
  onDeleteProcedure,
  onProcStatusChange,
}: SectionCardProps) {
  const isEditingSection = editingId === section.id;

  return (
    <Card className="overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => dispatch({ type: "TOGGLE_COLLAPSE", id: section.id })}
          className="shrink-0 rounded p-0.5 hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        <Layers className="h-4 w-4 shrink-0 text-blue-600" />
        {isEditingSection ? (
          <InlineInput
            value={editingTitle}
            onChange={(t) => dispatch({ type: "SET_EDITING_TITLE", title: t })}
            onSubmit={onSubmitRenameSection}
            onCancel={() => dispatch({ type: "CANCEL_EDIT" })}
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm font-semibold">{section.title}</span>
        )}

        {!isEditingSection && (
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                dispatch({
                  type: "START_EDIT",
                  id: section.id,
                  title: section.title,
                })
              }
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() =>
                dispatch({
                  type: "SET_DELETE_TARGET",
                  target: {
                    type: "section" as const,
                    id: section.id,
                    title: section.title,
                  },
                })
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Section body */}
      {!isCollapsed && (
        <div className="px-4 pb-3">
          <Separator className="mb-2" />

          {/* Objectives */}
          {section.objectives.map((obj) => (
            <ObjectiveRow
              key={obj.id}
              obj={obj}
              sectionId={section.id}
              isEditing={editingId === obj.id}
              editingTitle={editingTitle}
              onSetEditingTitle={(t) =>
                dispatch({ type: "SET_EDITING_TITLE", title: t })
              }
              onStartEdit={() =>
                dispatch({ type: "START_EDIT", id: obj.id, title: obj.title })
              }
              onSubmitRename={() => onSubmitRenameObjective(obj.id)}
              onCancelEdit={() => dispatch({ type: "CANCEL_EDIT" })}
              onDelete={() =>
                dispatch({
                  type: "SET_DELETE_TARGET",
                  target: {
                    type: "objective" as const,
                    id: obj.id,
                    title: obj.title,
                  },
                })
              }
              addingProcKey={addingProcFor}
              addingProcTitle={addingProcTitle}
              onSetProcTitle={(t) =>
                dispatch({ type: "SET_PROC_TITLE", title: t })
              }
              onStartAddProc={() =>
                dispatch({ type: "START_ADD_PROC", key: `obj:${obj.id}` })
              }
              onSubmitProc={() => onSubmitInlineProcedure(section.id, obj.id)}
              onCancelAddProc={() => dispatch({ type: "CANCEL_ADD_PROC" })}
              onExpandProcForm={() =>
                dispatch({
                  type: "EXPAND_PROCEDURE_FORM",
                  title: addingProcTitle,
                  parent: { sectionId: section.id, objectiveId: obj.id },
                })
              }
              onEditProcedure={onEditProcedure}
              onDeleteProcedure={onDeleteProcedure}
              onProcStatusChange={onProcStatusChange}
            />
          ))}

          {/* Direct section procedures */}
          {section.procedures.map((proc) => (
            <ProcedureRow
              key={proc.id}
              proc={proc}
              indent={1}
              onEdit={() => onEditProcedure(proc)}
              onDelete={() => onDeleteProcedure(proc)}
              onStatusChange={(s) => onProcStatusChange(proc, s)}
            />
          ))}

          {/* Inline add procedure under section */}
          {addingProcFor === `sec:${section.id}` && (
            <div className="py-1 pl-8">
              <InlineInput
                value={addingProcTitle}
                onChange={(t) => dispatch({ type: "SET_PROC_TITLE", title: t })}
                onSubmit={() => onSubmitInlineProcedure(section.id)}
                onCancel={() => dispatch({ type: "CANCEL_ADD_PROC" })}
                onExpand={() =>
                  dispatch({
                    type: "EXPAND_PROCEDURE_FORM",
                    title: addingProcTitle,
                    parent: { sectionId: section.id },
                  })
                }
                placeholder="Tên thủ tục..."
                autoFocus
              />
            </div>
          )}

          {/* Inline add objective */}
          {addingObjectiveFor === section.id && (
            <div className="py-1 pl-4">
              <InlineInput
                value={addingObjectiveTitle}
                onChange={(t) =>
                  dispatch({ type: "SET_OBJECTIVE_TITLE", title: t })
                }
                onSubmit={onSubmitInlineObjective}
                onCancel={() => dispatch({ type: "CANCEL_ADD_OBJECTIVE" })}
                onExpand={() =>
                  dispatch({
                    type: "EXPAND_OBJECTIVE_FORM",
                    title: addingObjectiveTitle,
                    sectionId: section.id,
                  })
                }
                placeholder="Tên mục tiêu..."
                icon={<Target className="h-3.5 w-3.5 text-emerald-600" />}
                autoFocus
              />
            </div>
          )}

          {/* Bottom action links */}
          <div className="flex items-center gap-3 pt-1 pl-4">
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() =>
                dispatch({ type: "START_ADD_OBJECTIVE", sectionId: section.id })
              }
            >
              <Target className="h-3 w-3 text-emerald-600" />
              {LO.createTitle}
            </button>
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() =>
                dispatch({ type: "START_ADD_PROC", key: `sec:${section.id}` })
              }
            >
              <Plus className="h-3 w-3" />
              {LP.createTitle}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
