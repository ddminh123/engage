"use client";

import * as React from "react";
import { Check, XCircle, Plus, Upload, Loader2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { StatusBadge } from "@/components/shared/workpaper/StatusBadge";
import { AutoSaveIndicator } from "@/components/shared/workpaper/AutoSaveStatus";
import { WorkpaperActions } from "@/components/shared/workpaper/WorkpaperActions";
import {
  MultiSelectCommand,
  type MultiSelectOption,
} from "@/components/shared/MultiSelectCommand";
import { FileInput } from "@/components/shared/FileInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { WorkflowFlowChart } from "@/components/shared/WorkflowFlowChart";
import { useApprovalWorkflows } from "@/features/settings/hooks/useApprovalWorkflows";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkpaperDocument } from "@/components/shared/workpaper/WorkpaperDocument";
import { FieldRow } from "@/components/shared/workpaper/WorkpaperFieldsTab";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { cn } from "@/lib/utils";
import { useProcedureForm } from "./useProcedureForm";
import { WpAssigneePicker } from "./WpAssigneePicker";
import {
  useCommentThreads,
  useCreateCommentThread,
  useAddCommentReply,
  useUpdateThreadStatus,
  useDeleteCommentThread,
  useUpdateProcedureContent,
  usePublishProcedure,
  useProcedureVersions,
  useProcedureVersion,
  useRestoreProcedureVersion,
  useAvailableTransitions,
  useExecuteTransition,
} from "../../hooks/useEngagements";
import type {
  EngagementProcedure,
  EngagementMember,
  WpAssignment,
  EntityVersionSummary,
} from "../../types";
import type { JSONContent } from "@tiptap/react";
import { autoTransitionApi } from "../../api";

const LP = ENGAGEMENT_LABELS.procedure;

const TYPE_OPTIONS = Object.entries(LP.procedureType).map(([v, l]) => ({
  value: v,
  label: l,
}));
const CATEGORY_OPTIONS = Object.entries(LP.procedureCategory).map(([v, l]) => ({
  value: v,
  label: l,
}));
const STATUS_OPTIONS = Object.entries(LP.status).map(([v, l]) => ({
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
  onAssign,
  onUnassign,
}: ProcedureWorkpaperProps) {
  const form = useProcedureForm(engagementId, procedure);
  const { state, setField } = form;

  const contentMutation = useUpdateProcedureContent();

  // Comments
  const { data: threads = [] } = useCommentThreads(
    engagementId,
    "procedure",
    procedure.id,
  );
  const createThread = useCreateCommentThread();
  const addReply = useAddCommentReply();
  const updateStatus = useUpdateThreadStatus();
  const deleteThread = useDeleteCommentThread();

  // Versioning & Approval
  const publishMutation = usePublishProcedure();
  const { data: versions = [] } = useProcedureVersions(
    engagementId,
    procedure.id,
  );
  const { data: transitions = [] } = useAvailableTransitions(
    "procedure",
    procedure.id,
  );
  const transitionMutation = useExecuteTransition();
  const restoreMutation = useRestoreProcedureVersion();

  const [publishDialogOpen, setPublishDialogOpen] = React.useState(false);
  const [publishComment, setPublishComment] = React.useState("");
  const [workflowChartOpen, setWorkflowChartOpen] = React.useState(false);

  const VL = ENGAGEMENT_LABELS.versioning;

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync({
        engagementId,
        procedureId: procedure.id,
        comment: publishComment || undefined,
      });
      setPublishDialogOpen(false);
      setPublishComment("");
    } catch {
      // Error handled by mutation state
    }
  };

  const handleTransition = async (transitionId: string) => {
    try {
      await transitionMutation.mutateAsync({
        entityType: "procedure",
        entityId: procedure.id,
        transitionId,
        engagementId,
      });
    } catch {
      // Error handled by mutation state
    }
  };

  // Inline finding form
  const [showFindingForm, setShowFindingForm] = React.useState(false);
  const [findingTitle, setFindingTitle] = React.useState("");
  const [findingRating, setFindingRating] = React.useState("");

  // Build initial document content from old fields if no `content` exists
  const initialContent = React.useMemo<JSONContent | null>(() => {
    if (procedure.content) {
      return procedure.content as JSONContent;
    }
    // Migrate from old fields
    return buildInitialContent(procedure);
  }, [procedure]);

  // Track whether we've already fired the auto-transition this session
  const autoTransitionFired = React.useRef(false);

  // Auto-save: content only (no metadata, no close)
  // Also triggers not_started → in_progress on first save
  const handleAutoSave = React.useCallback(
    async (content: JSONContent) => {
      await contentMutation.mutateAsync({
        engagementId,
        procedureId: procedure.id,
        content,
      });

      // Auto-transition: not_started → in_progress on first edit
      if (
        !autoTransitionFired.current &&
        procedure.approvalStatus === "not_started"
      ) {
        autoTransitionFired.current = true;
        try {
          await autoTransitionApi("procedure", procedure.id, "start");
        } catch {
          // Non-critical — don't block auto-save
        }
      }
    },
    [contentMutation, engagementId, procedure.id, procedure.approvalStatus],
  );

  // Full save: content + metadata + close
  const handleSave = async (content: JSONContent) => {
    try {
      await Promise.all([
        contentMutation.mutateAsync({
          engagementId,
          procedureId: procedure.id,
          content,
        }),
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

  const handleCreateThread = async (data: {
    quote: string;
    comment: string;
    threadType: import("../../types").WpThreadType;
  }): Promise<string | undefined> => {
    try {
      const thread = await createThread.mutateAsync({
        engagementId,
        entityType: "procedure",
        entityId: procedure.id,
        threadType: data.threadType,
        quote: data.quote,
        comment: data.comment,
      });
      return thread.id;
    } catch {
      return undefined;
    }
  };

  const procedureAssignees = wpAssignments.filter(
    (a) => a.entityType === "procedure" && a.entityId === procedure.id,
  );

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
          showFindingForm={showFindingForm}
          setShowFindingForm={setShowFindingForm}
          findingTitle={findingTitle}
          setFindingTitle={setFindingTitle}
          findingRating={findingRating}
          setFindingRating={setFindingRating}
        />
      ),
    }),
    [state, setField, procedure, showFindingForm, findingTitle, findingRating],
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
        />
      ),
    }),
    [state, setField, controlOptions, riskOptions, objectiveOptions],
  );

  const handleRestore = async (version: number) => {
    try {
      await restoreMutation.mutateAsync({
        engagementId,
        procedureId: procedure.id,
        version,
      });
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <>
      <WorkpaperDocument
        entityType="procedure"
        entityId={procedure.id}
        engagementId={engagementId}
        title={state.title}
        content={initialContent}
        onAutoSave={handleAutoSave}
        onSave={handleSave}
        onTitleChange={handleTitleChange}
        onBack={onBack}
        isSaving={form.isSaving || contentMutation.isPending}
        headerExtra={(autoSave) => (
          <>
            <StatusBadge status={procedure.approvalStatus} />

            <AutoSaveIndicator
              status={autoSave.status}
              lastSavedAt={autoSave.lastSavedAt}
            />

            {/* Version link */}
            {versions.length > 0 && (
              <Popover>
                <PopoverTrigger className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <History className="h-3 w-3" />
                  Xem phiên bản
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-80 max-h-96 overflow-y-auto p-0"
                >
                  <VersionHistoryDropdown
                    versions={versions}
                    currentVersion={procedure.currentVersion}
                    engagementId={engagementId}
                    procedureId={procedure.id}
                    onRestore={handleRestore}
                    isRestoring={restoreMutation.isPending}
                  />
                </PopoverContent>
              </Popover>
            )}

            <div className="flex-1" />

            <WpAssigneePicker
              entityType="procedure"
              entityId={procedure.id}
              members={members}
              assignments={procedureAssignees}
              onAdd={(userId: string) =>
                onAssign?.("procedure", procedure.id, userId)
              }
              onRemove={(userId: string) =>
                onUnassign?.("procedure", procedure.id, userId)
              }
            />

            <WorkpaperActions
              transitions={transitions}
              onTransition={handleTransition}
              isTransitioning={transitionMutation.isPending}
              onViewWorkflow={() => setWorkflowChartOpen(true)}
            />
          </>
        )}
        tabs={[conclusionTab, infoTab]}
        defaultTab="conclusion"
        commentsTabLabel="Soát xét"
        threads={threads}
        onCreateThread={handleCreateThread}
        onReplyToThread={(threadId, content) =>
          addReply.mutate({
            engagementId,
            threadId,
            content,
            entityType: "procedure",
            entityId: procedure.id,
          })
        }
        onResolveThread={(threadId) =>
          updateStatus.mutate({
            engagementId,
            threadId,
            status: "resolved",
            entityType: "procedure",
            entityId: procedure.id,
          })
        }
        onReopenThread={(threadId) =>
          updateStatus.mutate({
            engagementId,
            threadId,
            status: "open",
            entityType: "procedure",
            entityId: procedure.id,
          })
        }
        onDeleteThread={(threadId) =>
          deleteThread.mutate({
            engagementId,
            threadId,
            entityType: "procedure",
            entityId: procedure.id,
          })
        }
        isCreatingThread={createThread.isPending}
        isReplying={addReply.isPending}
      />

      <WorkflowChartDialog
        open={workflowChartOpen}
        onOpenChange={setWorkflowChartOpen}
        entityType="procedure"
        currentStatus={procedure.approvalStatus}
      />

      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{VL.publishTitle}</DialogTitle>
            <DialogDescription>{VL.publishDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{VL.publishComment}</Label>
            <Textarea
              value={publishComment}
              onChange={(e) => setPublishComment(e.target.value)}
              placeholder={VL.publishCommentPlaceholder}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPublishDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-3.5 w-3.5" />
              )}
              {VL.publish}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Conclusion Tab ── (Effectiveness + Findings)

function ConclusionTabContent({
  state,
  setField,
  procedure,
  showFindingForm,
  setShowFindingForm,
  findingTitle,
  setFindingTitle,
  findingRating,
  setFindingRating,
}: {
  state: ReturnType<typeof useProcedureForm>["state"];
  setField: ReturnType<typeof useProcedureForm>["setField"];
  procedure: EngagementProcedure;
  showFindingForm: boolean;
  setShowFindingForm: (v: boolean) => void;
  findingTitle: string;
  setFindingTitle: (v: string) => void;
  findingRating: string;
  setFindingRating: (v: string) => void;
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

      {/* Linked Findings */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Phát hiện liên quan
        </h3>
        {procedure.linkedFindings.length > 0 ? (
          <ul className="space-y-1 pl-1">
            {procedure.linkedFindings.map((f) => (
              <li key={f.id} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-red-500" />
                <span className="text-red-600">{f.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Chưa có phát hiện.</p>
        )}

        {!showFindingForm ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={() => setShowFindingForm(true)}
          >
            <Plus className="mr-1.5 h-3 w-3" />
            Thêm phát hiện
          </Button>
        ) : (
          <div className="mt-2 space-y-2 rounded-md border p-2">
            <div className="space-y-1">
              <Label className="text-xs">Tiêu đề</Label>
              <Input
                value={findingTitle}
                onChange={(e) => setFindingTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mức độ rủi ro</Label>
              <LabeledSelect
                value={findingRating}
                onChange={setFindingRating}
                options={[
                  { value: "", label: "— Chọn —" },
                  { value: "low", label: "Thấp" },
                  { value: "medium", label: "Trung bình" },
                  { value: "high", label: "Cao" },
                  { value: "critical", label: "Nghiêm trọng" },
                ]}
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  console.log("Create finding:", {
                    title: findingTitle,
                    riskRating: findingRating || null,
                  });
                  setFindingTitle("");
                  setFindingRating("");
                  setShowFindingForm(false);
                }}
                disabled={!findingTitle.trim()}
              >
                Lưu
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => {
                  setFindingTitle("");
                  setFindingRating("");
                  setShowFindingForm(false);
                }}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}
      </div>
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
}: {
  state: ReturnType<typeof useProcedureForm>["state"];
  setField: ReturnType<typeof useProcedureForm>["setField"];
  controlOptions: MultiSelectOption[];
  riskOptions: MultiSelectOption[];
  objectiveOptions: MultiSelectOption[];
}) {
  return (
    <div className="space-y-4">
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

// ── Version History Dropdown (Confluence-style, inside Popover) ──

function VersionHistoryDropdown({
  versions,
  currentVersion,
  engagementId,
  procedureId,
  onRestore,
  isRestoring,
}: {
  versions: EntityVersionSummary[];
  currentVersion: number;
  engagementId: string;
  procedureId: string;
  onRestore: (version: number) => Promise<void>;
  isRestoring: boolean;
}) {
  const VL = ENGAGEMENT_LABELS.versioning;
  const [restoreTarget, setRestoreTarget] = React.useState<number | null>(null);
  const [viewVersion, setViewVersion] = React.useState<number | null>(null);

  const { data: versionDetail } = useProcedureVersion(
    engagementId,
    procedureId,
    viewVersion,
  );

  if (versions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        {VL.noVersions}
      </p>
    );
  }

  return (
    <>
      <div className="px-3 py-2 border-b">
        <span className="text-xs font-medium text-muted-foreground">
          {VL.versionHistory} ({versions.length})
        </span>
      </div>
      <div className="divide-y">
        {versions.map((v) => (
          <div
            key={v.id}
            className={cn(
              "px-3 py-2 space-y-0.5",
              v.version === currentVersion && "bg-primary/5",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                v{v.version}
                {v.version === currentVersion && (
                  <Badge variant="secondary" className="text-[10px] h-4 ml-1.5">
                    Hiện tại
                  </Badge>
                )}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[11px] px-1.5"
                  onClick={() => setViewVersion(v.version)}
                  title={VL.viewVersion}
                >
                  {VL.viewVersion}
                </Button>
                {v.version !== currentVersion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 text-[11px] px-1.5 text-orange-600 hover:text-orange-700"
                    onClick={() => setRestoreTarget(v.version)}
                    title={VL.restoreVersion}
                  >
                    {VL.restoreVersion}
                  </Button>
                )}
              </div>
            </div>
            {v.comment && (
              <p className="text-xs text-muted-foreground truncate">
                {v.comment}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>{v.publisher.name}</span>
              <span>·</span>
              <span>
                {new Date(v.publishedAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Restore confirmation dialog */}
      <ConfirmDialog
        open={restoreTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
        title={VL.restoreTitle}
        description={
          restoreTarget !== null ? VL.restoreDescription(restoreTarget) : ""
        }
        variant="confirm"
        confirmLabel={VL.restoreVersion}
        onConfirm={async () => {
          if (restoreTarget !== null) {
            await onRestore(restoreTarget);
            setRestoreTarget(null);
          }
        }}
        isLoading={isRestoring}
      />

      {/* Version detail dialog */}
      <Dialog
        open={viewVersion !== null}
        onOpenChange={(open) => {
          if (!open) setViewVersion(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {VL.version} {viewVersion}
            </DialogTitle>
            {versionDetail?.comment && (
              <DialogDescription>{versionDetail.comment}</DialogDescription>
            )}
          </DialogHeader>
          {versionDetail?.snapshot ? (
            <div className="space-y-3 text-sm">
              {Object.entries(
                versionDetail.snapshot as Record<string, unknown>,
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
    </>
  );
}

// ── Workflow Chart Dialog ──

function WorkflowChartDialog({
  open,
  onOpenChange,
  entityType,
  currentStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  currentStatus: string;
}) {
  const { data: workflows = [] } = useApprovalWorkflows();

  // Find the workflow bound to this entity type, or fall back to default
  const workflow = React.useMemo(() => {
    const bound = workflows.find((w) =>
      w.entityBindings.some((b) => b.entityType === entityType),
    );
    if (bound) return bound;
    return workflows.find((w) => w.isDefault && w.isActive) ?? null;
  }, [workflows, entityType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Quy trình phê duyệt</DialogTitle>
          <DialogDescription>
            {workflow?.name ?? "Không tìm thấy quy trình"}
          </DialogDescription>
        </DialogHeader>
        {workflow ? (
          <WorkflowFlowChart
            transitions={workflow.transitions}
            highlightStatus={currentStatus}
            showLabel={false}
          />
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Chưa có quy trình nào được gán cho loại thực thể này.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
