"use client";

import * as React from "react";
import { Check, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import {
  MultiSelectCommand,
  type MultiSelectOption,
} from "@/components/shared/MultiSelectCommand";
import { FileInput } from "@/components/shared/FileInput";
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
} from "../../hooks/useEngagements";
import type {
  EngagementProcedure,
  EngagementMember,
  WpAssignment,
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

  const handleSave = async (content: JSONContent) => {
    try {
      // Save document content + metadata in parallel
      await Promise.all([
        contentMutation.mutateAsync({
          engagementId,
          procedureId: procedure.id,
          content,
        }),
        form.handleSaveAsync(),
      ]);
      // Auto-close after successful save
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

  return (
    <WorkpaperDocument
      entityType="procedure"
      entityId={procedure.id}
      engagementId={engagementId}
      title={state.title}
      content={initialContent}
      onSave={handleSave}
      onTitleChange={handleTitleChange}
      onBack={onBack}
      isSaving={form.isSaving || contentMutation.isPending}
      headerExtra={
        <div className="flex items-center gap-2">
          <LabeledSelect
            value={state.status}
            onChange={(v) => setField("status", v)}
            options={STATUS_OPTIONS}
            placeholder="Trạng thái"
          />
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
        </div>
      }
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
