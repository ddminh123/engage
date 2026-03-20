"use client";

import { Plus, ChevronDown, ChevronsUpDown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { COMMON_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import { useWorkProgramEditor } from "../../hooks/useWorkProgramEditor";
import { SectionCard } from "./SectionCard";
import { SectionFormDialog } from "./SectionFormDialog";
import { ObjectiveFormDialog } from "./ObjectiveFormDialog";
import { ProcedureFormSheet } from "./ProcedureFormSheet";
import { ProcedureRow } from "./ProcedureRow";
import { InlineInput } from "./InlineInput";
import type { EngagementDetail } from "../../types";

const C = COMMON_LABELS;
const LS = ENGAGEMENT_LABELS.section;
const LO = ENGAGEMENT_LABELS.objective;
const LP = ENGAGEMENT_LABELS.procedure;

interface ExecutionTabProps {
  engagement: EngagementDetail;
}

export function ExecutionTab({ engagement }: ExecutionTabProps) {
  const {
    state,
    dispatch,
    submitInlineSection,
    submitSectionForm,
    submitRenameSection,
    submitInlineObjective,
    submitObjectiveForm,
    submitRenameObjective,
    submitInlineProcedure,
    submitProcedureForm,
    changeProcedureStatus,
    confirmDelete,
    isDeleting,
    isSectionFormLoading,
    isObjectiveFormLoading,
    isProcedureFormLoading,
  } = useWorkProgramEditor(engagement);

  const totalObjectives = countAllObjectives(engagement);
  const totalProcs = countAllProcedures(engagement);
  const doneProcs = countCompletedProcedures(engagement);

  return (
    <div className="space-y-4">
      {/* Summary stats — single inline row */}
      <div className="flex items-center gap-6 px-4 py-2 text-sm">
        <Stat label={LS.title} value={engagement.sections.length} />
        <Stat label={LO.title} value={totalObjectives} />
        <Stat label={LP.title} value={totalProcs} />
        <Stat label="Hoàn thành" value={doneProcs} />
        <Stat
          label={ENGAGEMENT_LABELS.finding.title}
          value={engagement.findings.length}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => dispatch({ type: "SHOW_ADD_SECTION" })}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {LS.createTitle}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (engagement.sections.length > 0) {
              dispatch({
                type: "START_ADD_OBJECTIVE",
                sectionId: engagement.sections[0].id,
              });
            }
          }}
          disabled={engagement.sections.length === 0}
        >
          <Target className="mr-1.5 h-3.5 w-3.5" />
          {LO.createTitle}
        </Button>

        <div className="ml-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const allCollapsed =
                state.collapsed.size === engagement.sections.length &&
                engagement.sections.length > 0;
              if (allCollapsed) {
                dispatch({ type: "EXPAND_ALL" });
              } else {
                dispatch({
                  type: "COLLAPSE_ALL",
                  ids: engagement.sections.map((s) => s.id),
                });
              }
            }}
            disabled={engagement.sections.length === 0}
          >
            <ChevronsUpDown className="mr-1.5 h-3.5 w-3.5" />
            {state.collapsed.size === engagement.sections.length &&
            engagement.sections.length > 0
              ? "Mở rộng tất cả"
              : "Thu gọn tất cả"}
          </Button>
        </div>
      </div>

      {/* Sections */}
      {engagement.sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          isCollapsed={state.collapsed.has(section.id)}
          editingId={state.editingId}
          editingTitle={state.editingTitle}
          addingObjectiveFor={state.addingObjectiveFor}
          addingObjectiveTitle={state.addingObjectiveTitle}
          addingProcFor={state.addingProcFor}
          addingProcTitle={state.addingProcTitle}
          dispatch={dispatch}
          onSubmitRenameSection={() => submitRenameSection(section)}
          onSubmitRenameObjective={(objId) => {
            const obj = section.objectives.find((o) => o.id === objId);
            if (obj) submitRenameObjective(obj);
          }}
          onSubmitInlineObjective={() => submitInlineObjective(section.id)}
          onSubmitInlineProcedure={(sId, oId) =>
            submitInlineProcedure(sId, oId)
          }
          onEditProcedure={(p) =>
            dispatch({
              type: "OPEN_PROCEDURE_FORM",
              procedure: p,
              parent: {
                sectionId: p.sectionId ?? undefined,
                objectiveId: p.objectiveId ?? undefined,
              },
            })
          }
          onDeleteProcedure={(p) =>
            dispatch({
              type: "SET_DELETE_TARGET",
              target: { type: "procedure", id: p.id, title: p.title },
            })
          }
          onProcStatusChange={changeProcedureStatus}
        />
      ))}

      {/* Inline add section */}
      {state.showAddSection && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3">
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            <InlineInput
              value={state.addingSectionTitle}
              onChange={(t) =>
                dispatch({ type: "SET_SECTION_TITLE", title: t })
              }
              onSubmit={submitInlineSection}
              onCancel={() => dispatch({ type: "HIDE_ADD_SECTION" })}
              onExpand={() =>
                dispatch({
                  type: "EXPAND_SECTION_FORM",
                  title: state.addingSectionTitle,
                })
              }
              placeholder="Tên phần kiểm toán..."
              autoFocus
            />
          </div>
        </Card>
      )}

      {/* Ungrouped procedures */}
      {engagement.ungroupedProcedures.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3">
            <span className="text-sm font-semibold">Thủ tục chung</span>
          </div>
          <div className="px-4 pb-3">
            <Separator className="mb-2" />
            {engagement.ungroupedProcedures.map((proc) => (
              <ProcedureRow
                key={proc.id}
                proc={proc}
                indent={0}
                onEdit={() =>
                  dispatch({
                    type: "OPEN_PROCEDURE_FORM",
                    procedure: proc,
                    parent: {},
                  })
                }
                onDelete={() =>
                  dispatch({
                    type: "SET_DELETE_TARGET",
                    target: {
                      type: "procedure",
                      id: proc.id,
                      title: proc.title,
                    },
                  })
                }
                onStatusChange={(s) => changeProcedureStatus(proc, s)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {engagement.sections.length === 0 &&
        engagement.ungroupedProcedures.length === 0 &&
        !state.showAddSection && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Chưa có chương trình kiểm toán. Thêm phần và thủ tục để bắt đầu.
            </CardContent>
          </Card>
        )}

      {/* ── Full-form dialogs ── */}
      <SectionFormDialog
        open={state.sectionFormOpen}
        onOpenChange={(o) => !o && dispatch({ type: "CLOSE_SECTION_FORM" })}
        initialData={state.editingSectionData}
        onSubmit={submitSectionForm}
        isLoading={isSectionFormLoading}
      />
      <ObjectiveFormDialog
        open={state.objectiveFormOpen}
        onOpenChange={(o) => !o && dispatch({ type: "CLOSE_OBJECTIVE_FORM" })}
        initialData={state.editingObjectiveData}
        onSubmit={submitObjectiveForm}
        isLoading={isObjectiveFormLoading}
      />
      <ProcedureFormSheet
        open={state.procedureFormOpen}
        onOpenChange={(o) => !o && dispatch({ type: "CLOSE_PROCEDURE_FORM" })}
        initialData={state.editingProcedure}
        onSubmit={submitProcedureForm}
        isLoading={isProcedureFormLoading}
      />

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        open={!!state.deleteTarget}
        onOpenChange={(o) => !o && dispatch({ type: "CLEAR_DELETE_TARGET" })}
        title={C.confirm.deleteTitle}
        description={
          state.deleteTarget
            ? state.deleteTarget.type === "section"
              ? LS.deleteDescription(state.deleteTarget.title)
              : state.deleteTarget.type === "objective"
                ? LO.deleteDescription(state.deleteTarget.title)
                : LP.deleteDescription(state.deleteTarget.title)
            : ""
        }
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

// ── Inline stat (small presentational — stays here per FE.md §4) ──

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-semibold">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Helpers ──

function countAllObjectives(engagement: EngagementDetail): number {
  let count = 0;
  for (const s of engagement.sections) {
    count += s.objectives.length;
  }
  return count;
}

function countAllProcedures(engagement: EngagementDetail): number {
  let count = engagement.ungroupedProcedures.length;
  for (const s of engagement.sections) {
    count += s.procedures.length;
    for (const o of s.objectives) count += o.procedures.length;
  }
  return count;
}

function countCompletedProcedures(engagement: EngagementDetail): number {
  const done = (st: string) => st === "reviewed";
  let count = engagement.ungroupedProcedures.filter((p) =>
    done(p.status),
  ).length;
  for (const s of engagement.sections) {
    count += s.procedures.filter((p) => done(p.status)).length;
    for (const o of s.objectives)
      count += o.procedures.filter((p) => done(p.status)).length;
  }
  return count;
}
