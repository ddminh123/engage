"use client";

import * as React from "react";
import { Check, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { StatusBadge } from "@/components/shared/workpaper/StatusBadge";
import { WorkpaperActions } from "@/components/shared/workpaper/WorkpaperActions";
import { HistorySheet } from "@/components/shared/workpaper/HistorySheet";
import { WpSignoffBar } from "@/components/shared/workpaper/WpSignoffBar";
import {
  MultiSelectCommand,
  type MultiSelectOption,
} from "@/components/shared/MultiSelectCommand";
import { FileInput } from "@/components/shared/FileInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkflowChartDialog } from "@/components/shared/workpaper/WorkflowChartDialog";
import { WorkpaperDocument } from "@/components/shared/workpaper/WorkpaperDocument";
import { useWorkpaperShell } from "@/components/shared/workpaper/useWorkpaperShell";
import { FieldRow } from "@/components/shared/workpaper/WorkpaperFieldsTab";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { cn } from "@/lib/utils";
import { useProcedureForm } from "./useProcedureForm";
import { WpAssigneePicker } from "./WpAssigneePicker";
import {
  LinkedFindingsList,
  type PendingFindingData,
} from "./LinkedFindingsList";
import type {
  EngagementProcedure,
  EngagementMember,
  WpAssignment,
  WpSignoff,
} from "../../types";
import type { JSONContent } from "@tiptap/react";

const LP = ENGAGEMENT_LABELS.procedure;

const TYPE_OPTIONS = Object.entries(LP.procedureType).map(([v, l]) => ({
  value: v,
  label: l,
}));
const CATEGORY_OPTIONS = Object.entries(LP.procedureCategory).map(([v, l]) => ({
  value: v,
  label: l,
}));
const PRIORITY_OPTIONS = [
  { value: "high", label: "Cao" },
  { value: "medium", label: "Trung bình" },
  { value: "low", label: "Thấp" },
];
const EFFECTIVENESS_VALUES = ["effective", "ineffective"] as const;
const EFFECTIVENESS_LABEL: Record<string, string> = {
  ineffective: "Không hiệu quả",
  effective: "Hiệu quả",
};
const EFFECTIVENESS_ICON: Record<string, React.ReactNode> = {
  ineffective: <XCircle className="h-4 w-4" />,
  effective: <Check className="h-4 w-4" />,
};

interface ProcedureWorkpaperProps {
  procedure: EngagementProcedure;
  engagementId: string;
  onBack: () => void;
  controlOptions?: MultiSelectOption[];
  riskOptions?: MultiSelectOption[];
  objectiveOptions?: MultiSelectOption[];
  members?: EngagementMember[];
  wpAssignments?: WpAssignment[];
  wpSignoffs?: WpSignoff[];
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

export function ProcedureWorkpaper({
  procedure,
  engagementId,
  onBack,
  controlOptions = [],
  riskOptions = [],
  objectiveOptions = [],
  members = [],
  wpAssignments = [],
  wpSignoffs = [],
  onAssign,
  onUnassign,
}: ProcedureWorkpaperProps) {
  const form = useProcedureForm(engagementId, procedure);
  const { state, setField } = form;

  // ── Generic workpaper shell (comments, versions, transitions, auto-save) ──
  const shell = useWorkpaperShell({
    entityType: "procedure",
    entityId: procedure.id,
    engagementId,
    approvalStatus: procedure.approvalStatus,
    currentVersion: procedure.currentVersion,
    content: procedure.content ? (procedure.content as JSONContent) : null,
    updatedAt: procedure.updatedAt,
    templateEntityType: procedure.content ? null : "procedure",
    fallbackContent: procedure.content ? null : buildInitialContent(procedure),
  });

  // Full save: content + metadata + close
  const handleSave = async (content: JSONContent) => {
    try {
      await Promise.all([
        shell.handleAutoSave(content),
        form.handleSaveAsync(),
      ]);
      onBack();
    } catch {
      // Error handled by mutation state — stay on page
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setField("title", newTitle);
  };

  const procedureAssignees = wpAssignments.filter(
    (a) => a.entityType === "procedure" && a.entityId === procedure.id,
  );

  // ── Finding flow (context menu → sidebar) ──
  const [pendingFinding, setPendingFinding] =
    React.useState<PendingFindingData | null>(null);

  const handleAddFinding = React.useCallback(
    (quote: string, _from: number, _to: number) => {
      setPendingFinding({ quote, selection: { from: _from, to: _to } });
    },
    [],
  );

  const handleFindingCreated = React.useCallback(
    (_findingId: string, _from: number, _to: number) => {
      setPendingFinding(null);
    },
    [],
  );

  const handleCancelPendingFinding = React.useCallback(() => {
    setPendingFinding(null);
  }, []);

  // Build configurable tabs
  const conclusionTab = React.useMemo(
    () => ({
      key: "conclusion",
      label: "Kết luận",
      content: (
        <ConclusionTabContent
          state={state}
          setField={setField}
          procedure={procedure}
          engagementId={engagementId}
          pendingFinding={pendingFinding}
          onFindingCreated={handleFindingCreated}
          onCancelPendingFinding={handleCancelPendingFinding}
        />
      ),
    }),
    [
      state,
      setField,
      procedure,
      engagementId,
      pendingFinding,
      handleFindingCreated,
      handleCancelPendingFinding,
    ],
  );

  const infoTab = React.useMemo(
    () => ({
      key: "info",
      label: "Thông tin",
      content: (
        <InfoTabContent
          state={state}
          setField={setField}
          controlOptions={controlOptions}
          riskOptions={riskOptions}
          objectiveOptions={objectiveOptions}
          members={members}
          assignments={procedureAssignees}
          onAssign={(userId: string) =>
            onAssign?.("procedure", procedure.id, userId)
          }
          onUnassign={(userId: string) =>
            onUnassign?.("procedure", procedure.id, userId)
          }
          entityId={procedure.id}
        />
      ),
    }),
    [
      state,
      setField,
      controlOptions,
      riskOptions,
      objectiveOptions,
      members,
      procedureAssignees,
      onAssign,
      onUnassign,
      procedure.id,
    ],
  );

  return (
    <>
      <WorkpaperDocument
        entityType="procedure"
        entityId={procedure.id}
        engagementId={engagementId}
        title={state.title}
        content={shell.initialContent}
        onAutoSave={shell.handleAutoSave}
        onSave={handleSave}
        onTitleChange={handleTitleChange}
        onBack={onBack}
        isSaving={form.isSaving || shell.isSavingContent}
        isLoadingContent={shell.isLoadingTemplate}
        initialLastSavedAt={shell.initialLastSavedAt}
        signoffBar={
          <WpSignoffBar
            entityType="procedure"
            entityId={procedure.id}
            engagementId={engagementId}
            signoffs={wpSignoffs}
            currentVersion={procedure.currentVersion}
            onViewVersion={shell.setViewVersion}
            actions={
              <WorkpaperActions
                transitions={shell.transitions}
                onTransition={shell.handleTransition}
                isTransitioning={shell.isTransitioning}
                onViewWorkflow={() => shell.setWorkflowChartOpen(true)}
                members={members}
              />
            }
          />
        }
        headerExtra={(autoSave) => (
          <>
            <StatusBadge status={procedure.approvalStatus} />

            <WpAssigneePicker
              entityType="procedure"
              entityId={procedure.id}
              members={members}
              assignments={wpAssignments}
              onAdd={(userId) => onAssign?.("procedure", procedure.id, userId)}
              onRemove={(userId) =>
                onUnassign?.("procedure", procedure.id, userId)
              }
              label=""
            />

            <div className="flex-1" />

            <HistorySheet
              versions={shell.versions}
              currentVersion={procedure.currentVersion}
              onViewVersion={shell.setViewVersion}
              onRestoreVersion={(v) => shell.handleRestore(v)}
              isRestoring={shell.isRestoring}
              autoSaveStatus={autoSave.status}
              autoSaveLastSavedAt={autoSave.lastSavedAt}
            />
          </>
        )}
        tabs={[conclusionTab, infoTab]}
        defaultTab="conclusion"
        commentsTabLabel="Soát xét"
        threads={shell.threads}
        onCreateThread={shell.handleCreateThread}
        onReplyToThread={shell.handleReplyToThread}
        onResolveThread={shell.handleResolveThread}
        onReopenThread={shell.handleReopenThread}
        onDeleteThread={shell.handleDeleteThread}
        isCreatingThread={shell.isCreatingThread}
        isReplying={shell.isReplying}
        onAddFinding={handleAddFinding}
        findingTabKey="conclusion"
      />

      {/* Version detail dialog */}
      <Dialog
        open={shell.viewVersion !== null}
        onOpenChange={(open) => {
          if (!open) shell.setViewVersion(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Phiên bản {shell.viewVersion}</DialogTitle>
            {shell.versionDetail?.comment && (
              <DialogDescription>
                {shell.versionDetail.comment}
              </DialogDescription>
            )}
          </DialogHeader>
          {shell.versionDetail?.snapshot ? (
            <div className="space-y-3 text-sm">
              {Object.entries(
                shell.versionDetail.snapshot as Record<string, unknown>,
              ).map(([key, value]) =>
                value != null && value !== "" ? (
                  <div key={key}>
                    <span className="font-medium text-muted-foreground">
                      {key}
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap break-words">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2).slice(0, 500)
                        : String(value)}
                    </p>
                  </div>
                ) : null,
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          )}
        </DialogContent>
      </Dialog>

      <WorkflowChartDialog
        open={shell.workflowChartOpen}
        onOpenChange={shell.setWorkflowChartOpen}
        entityType="procedure"
        currentStatus={procedure.approvalStatus}
      />
    </>
  );
}

// ── Conclusion Tab ── (Effectiveness + Findings)

function ConclusionTabContent({
  state,
  setField,
  procedure,
  engagementId,
  pendingFinding,
  onFindingCreated,
  onCancelPendingFinding,
}: {
  state: ReturnType<typeof useProcedureForm>["state"];
  setField: ReturnType<typeof useProcedureForm>["setField"];
  procedure: EngagementProcedure;
  engagementId: string;
  pendingFinding?: PendingFindingData | null;
  onFindingCreated?: (findingId: string, from: number, to: number) => void;
  onCancelPendingFinding?: () => void;
}) {
  const [evidenceFiles, setEvidenceFiles] = React.useState<File[]>([]);
  const [wpAttachments, setWpAttachments] = React.useState<File[]>([]);

  return (
    <div className="space-y-4">
      <FieldRow label={LP.field.effectiveness}>
        <ButtonGroup>
          {EFFECTIVENESS_VALUES.map((v) => {
            const isSelected = state.effectiveness === v;
            return (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "gap-1.5",
                  !isSelected && "text-muted-foreground",
                )}
                onClick={() => setField("effectiveness", isSelected ? null : v)}
              >
                {EFFECTIVENESS_ICON[v]}
                {EFFECTIVENESS_LABEL[v]}
              </Button>
            );
          })}
        </ButtonGroup>
      </FieldRow>

      <Separator className="my-1" />

      {/* Evidence files */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Bằng chứng
        </h3>
        <FileInput
          id={`evidence-${procedure.id}`}
          multiple
          compact
          files={evidenceFiles}
          onChange={setEvidenceFiles}
          placeholder="Tải lên bằng chứng"
        />
      </div>

      {/* Workpaper attachments */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tài liệu đính kèm
        </h3>
        <FileInput
          id={`wp-attach-${procedure.id}`}
          multiple
          compact
          files={wpAttachments}
          onChange={setWpAttachments}
          placeholder="Tải lên tài liệu"
        />
      </div>

      <Separator className="my-1" />

      <LinkedFindingsList
        findings={procedure.linkedFindings}
        engagementId={engagementId}
        procedureId={procedure.id}
        pendingFinding={pendingFinding}
        onFindingCreated={onFindingCreated}
        onCancelPendingFinding={onCancelPendingFinding}
      />
    </div>
  );
}

// ── Info Tab ── (Type, Category, Priority, RCM refs)

function InfoTabContent({
  state,
  setField,
  controlOptions,
  riskOptions,
  objectiveOptions,
  members,
  assignments,
  onAssign,
  onUnassign,
  entityId,
}: {
  state: ReturnType<typeof useProcedureForm>["state"];
  setField: ReturnType<typeof useProcedureForm>["setField"];
  controlOptions: MultiSelectOption[];
  riskOptions: MultiSelectOption[];
  objectiveOptions: MultiSelectOption[];
  members: EngagementMember[];
  assignments: WpAssignment[];
  onAssign?: (userId: string) => void;
  onUnassign?: (userId: string) => void;
  entityId: string;
}) {
  return (
    <div className="space-y-4">
      <FieldRow label="Người phụ trách">
        <WpAssigneePicker
          entityType="procedure"
          entityId={entityId}
          members={members}
          assignments={assignments}
          onAdd={(userId: string) => onAssign?.(userId)}
          onRemove={(userId: string) => onUnassign?.(userId)}
        />
      </FieldRow>

      <Separator className="my-1" />

      <FieldRow label={LP.field.procedureType}>
        <LabeledSelect
          value={state.procedureType ?? ""}
          onChange={(v) => setField("procedureType", v || null)}
          options={TYPE_OPTIONS}
          placeholder="Chọn loại"
        />
      </FieldRow>

      <FieldRow label="Phân loại">
        <RadioGroup
          value={state.procedureCategory ?? ""}
          onValueChange={(v) => setField("procedureCategory", v || null)}
          className="gap-2"
        >
          {CATEGORY_OPTIONS.map((option) => {
            const itemId = `wp-proc-cat-${option.value}`;
            return (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem id={itemId} value={option.value} />
                <Label htmlFor={itemId} className="font-normal">
                  {option.label}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </FieldRow>

      <FieldRow label={LP.field.priority}>
        <LabeledSelect
          value={state.priority ?? ""}
          onChange={(v) => setField("priority", v || null)}
          options={PRIORITY_OPTIONS}
          placeholder="Chọn mức"
        />
      </FieldRow>

      <Separator className="my-1" />

      {objectiveOptions.length > 0 && (
        <FieldRow label="Mục tiêu RCM">
          <MultiSelectCommand
            options={objectiveOptions}
            selected={state.objectiveRefIds}
            onChange={(ids) => setField("objectiveRefIds", ids)}
            placeholder="Chọn mục tiêu..."
            searchPlaceholder="Tìm mục tiêu..."
          />
        </FieldRow>
      )}

      {riskOptions.length > 0 && (
        <FieldRow label="Rủi ro">
          <MultiSelectCommand
            options={riskOptions}
            selected={state.riskRefIds}
            onChange={(ids) => setField("riskRefIds", ids)}
            placeholder="Chọn rủi ro..."
            searchPlaceholder="Tìm rủi ro..."
          />
        </FieldRow>
      )}

      {controlOptions.length > 0 && (
        <FieldRow label="Kiểm soát">
          <MultiSelectCommand
            options={controlOptions}
            selected={state.controlRefIds}
            onChange={(ids) => setField("controlRefIds", ids)}
            placeholder="Chọn kiểm soát..."
            searchPlaceholder="Tìm kiểm soát..."
          />
        </FieldRow>
      )}
    </div>
  );
}

// ── Content Migration ──

function buildInitialContent(procedure: EngagementProcedure): JSONContent {
  const sections: JSONContent[] = [];

  const addSection = (title: string, html: string | null) => {
    sections.push({
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: title }],
    });
    if (html && html.trim()) {
      // Store raw HTML as a paragraph — the editor will parse it
      sections.push({
        type: "paragraph",
        content: [{ type: "text", text: stripHtml(html) }],
      });
    } else {
      sections.push({ type: "paragraph" });
    }
  };

  addSection("Mô tả chi tiết", procedure.description);
  addSection("Thủ tục thực hiện", procedure.procedures);
  addSection("Quan sát / Kết quả", procedure.observations);
  addSection("Kết luận", procedure.conclusion);

  return {
    type: "doc",
    content: sections,
  };
}

function stripHtml(html: string): string {
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }
  return html.replace(/<[^>]+>/g, "");
}

// WorkflowChartDialog is now shared from @/components/shared/workpaper/WorkflowChartDialog
