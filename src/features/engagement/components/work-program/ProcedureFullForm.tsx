"use client";

import * as React from "react";
import {
  X,
  Plus,
  Loader2,
  ClipboardList,
  Check,
  XCircle,
  Save,
} from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import {
  MultiSelectCommand,
  type MultiSelectOption,
} from "@/components/shared/MultiSelectCommand";
import { InlineRichText } from "@/components/shared/InlineRichText";
import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { useProcedureForm } from "./useProcedureForm";
import { cn } from "@/lib/utils";
import type {
  EngagementProcedure,
  EngagementMember,
  WpAssignment,
} from "../../types";
import { WpAssigneePicker } from "./WpAssigneePicker";
import { FileInput } from "@/components/shared/FileInput";
import { AssigneePicker } from "@/components/shared/AssigneePicker";
import { useUpdateProcedureAssignee } from "../../hooks/useEngagements";

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

interface ProcedureFullFormProps {
  procedure: EngagementProcedure | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagementId: string;
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

export function ProcedureFullForm({
  procedure,
  open,
  onOpenChange,
  engagementId,
  controlOptions = [],
  riskOptions = [],
  objectiveOptions = [],
  members = [],
  wpAssignments = [],
  onAssign,
  onUnassign,
}: ProcedureFullFormProps) {
  // Keep local copy so closing animation doesn't blank out content
  const [local, setLocal] = React.useState<EngagementProcedure | null>(null);
  React.useEffect(() => {
    if (procedure) setLocal(procedure);
  }, [procedure]);

  const p = local;
  const form = useProcedureForm(engagementId, p);
  const { state, setField } = form;
  const assigneeMutation = useUpdateProcedureAssignee();

  // Only one rich-text editor active at a time
  const [activeEditor, setActiveEditor] = React.useState<string | null>(null);

  // Inline finding form state
  const [showFindingForm, setShowFindingForm] = React.useState(false);
  const [findingTitle, setFindingTitle] = React.useState("");
  const [findingRating, setFindingRating] = React.useState("");

  if (!p) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-0 z-50 flex flex-col bg-background data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 outline-none">
          {/* ── Sticky header: "Thủ tục: {title}" + status + X ── */}
          <div className="flex-none flex items-center justify-between border-b bg-background px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-4 w-4 text-violet-500" />
                <span className="text-foreground">
                  Thủ tục:{" "}
                  <span className="font-medium">
                    {state.title || "Chưa đặt tên"}
                  </span>
                </span>
              </div>
              <LabeledSelect
                value={state.status}
                onChange={(v) => setField("status", v)}
                options={STATUS_OPTIONS}
                className="w-[160px] h-8"
              />

              <Separator orientation="vertical" className="h-5" />

              {/* Assignees in header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Thực hiện:
                  </span>
                  <AssigneePicker
                    value={p.performedBy}
                    onSelect={(userId) =>
                      assigneeMutation.mutate({
                        engagementId,
                        procedureId: p.id,
                        field: "performed_by",
                        assigneeId: userId,
                      })
                    }
                    members={members.map((m) => ({
                      userId: m.userId,
                      user: {
                        id: m.user.id,
                        name: m.user.name,
                        email: m.user.email,
                        avatarUrl: m.user.avatarUrl,
                        title: m.user.title,
                      },
                    }))}
                    placeholder="—"
                    disabled={assigneeMutation.isPending}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Soát xét:
                  </span>
                  <AssigneePicker
                    value={p.reviewedBy}
                    onSelect={(userId) =>
                      assigneeMutation.mutate({
                        engagementId,
                        procedureId: p.id,
                        field: "reviewed_by",
                        assigneeId: userId,
                      })
                    }
                    members={members.map((m) => ({
                      userId: m.userId,
                      user: {
                        id: m.user.id,
                        name: m.user.name,
                        email: m.user.email,
                        avatarUrl: m.user.avatarUrl,
                        title: m.user.title,
                      },
                    }))}
                    placeholder="—"
                    disabled={assigneeMutation.isPending}
                  />
                </div>
                {onAssign && onUnassign && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      Phân công:
                    </span>
                    <WpAssigneePicker
                      entityType="procedure"
                      entityId={p.id}
                      assignments={wpAssignments}
                      members={members}
                      onAdd={(userId) => onAssign("procedure", p.id, userId)}
                      onRemove={(userId) =>
                        onUnassign("procedure", p.id, userId)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogPrimitive.Close
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Đóng</span>
            </DialogPrimitive.Close>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-6 py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* ══════ LEFT COLUMN (9/12) ══════ */}
                <div className="col-span-12 lg:col-span-9 space-y-5">
                  <LeftBodyRow label={LP.field.title} alignStart>
                    <input
                      type="text"
                      value={state.title}
                      onChange={(e) => setField("title", e.target.value)}
                      placeholder="Nhấn để nhập tên thủ tục..."
                      className="w-full rounded-md px-4 py-3 text-lg font-bold bg-muted/40 border-none outline-none placeholder:text-muted-foreground/50 transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:ring-0"
                    />
                  </LeftBodyRow>

                  {/* Rich text sections — side-by-side label/content */}
                  <LeftBodyRow label={LP.field.description} alignStart>
                    <InlineRichText
                      name="description"
                      label={LP.field.description}
                      content={state.description}
                      onChange={(html) => setField("description", html || null)}
                      placeholder="Nhấn để nhập mô tả chi tiết..."
                      activeEditor={activeEditor}
                      onActivate={setActiveEditor}
                      hideLabel
                      className="flex-1"
                    />
                  </LeftBodyRow>

                  <LeftBodyRow label={LP.field.procedures} alignStart>
                    <InlineRichText
                      name="procedures"
                      label={LP.field.procedures}
                      content={state.procedures}
                      onChange={(html) => setField("procedures", html || null)}
                      placeholder="Nhấn để nhập thủ tục thực hiện..."
                      activeEditor={activeEditor}
                      onActivate={setActiveEditor}
                      hideLabel
                      className="flex-1"
                    />
                  </LeftBodyRow>

                  <LeftBodyRow label={LP.field.observations} alignStart>
                    <InlineRichText
                      name="observations"
                      label={LP.field.observations}
                      content={state.observations}
                      onChange={(html) =>
                        setField("observations", html || null)
                      }
                      placeholder="Nhấn để nhập quan sát / kết quả..."
                      activeEditor={activeEditor}
                      onActivate={setActiveEditor}
                      hideLabel
                      className="flex-1"
                    />
                  </LeftBodyRow>
                  <LeftBodyRow label={LP.field.evidences} alignStart>
                    <FileInput id="evidence-1" multiple />
                  </LeftBodyRow>
                  <LeftBodyRow label={LP.field.workpaper} alignStart>
                    <FileInput id="workpaper-1" multiple />
                  </LeftBodyRow>
                  <LeftBodyRow label={LP.field.conclusion} alignStart>
                    <InlineRichText
                      name="conclusion"
                      label={LP.field.conclusion}
                      content={state.conclusion}
                      onChange={(html) => setField("conclusion", html || null)}
                      placeholder="Nhấn để nhập kết luận..."
                      activeEditor={activeEditor}
                      onActivate={setActiveEditor}
                      hideLabel
                      className="flex-1"
                    />
                  </LeftBodyRow>

                  {/* Effectiveness — ButtonGroup */}
                  <LeftBodyRow label={LP.field.effectiveness}>
                    <ButtonGroup>
                      {EFFECTIVENESS_VALUES.map((v) => {
                        const isSelected = state.effectiveness === v;
                        return (
                          <Button
                            key={v}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "gap-1.5",
                              !isSelected && "text-muted-foreground",
                            )}
                            onClick={() =>
                              setField("effectiveness", isSelected ? null : v)
                            }
                          >
                            {EFFECTIVENESS_ICON[v]}
                            {EFFECTIVENESS_LABEL[v]}
                          </Button>
                        );
                      })}
                    </ButtonGroup>
                  </LeftBodyRow>
                </div>

                {/* ══════ RIGHT COLUMN (3/12) ══════ */}
                <div className="col-span-12 lg:col-span-3 pt-2">
                  {/* Metadata fields — standard Label layout */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{LP.field.procedureType}</Label>
                      <LabeledSelect
                        value={state.procedureType ?? ""}
                        onChange={(v) => setField("procedureType", v || null)}
                        options={TYPE_OPTIONS}
                        placeholder="Chọn loại"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phân loại</Label>
                      <RadioGroup
                        value={state.procedureCategory ?? ""}
                        onValueChange={(v) =>
                          setField("procedureCategory", v || null)
                        }
                        className="gap-2"
                      >
                        {CATEGORY_OPTIONS.map((option) => {
                          const itemId = `procedure-category-${option.value}`;
                          return (
                            <div
                              key={option.value}
                              className="flex items-center gap-2"
                            >
                              <RadioGroupItem
                                id={itemId}
                                value={option.value}
                              />
                              <Label htmlFor={itemId} className="font-normal">
                                {option.label}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>{LP.field.priority}</Label>
                      <LabeledSelect
                        value={state.priority ?? ""}
                        onChange={(v) => setField("priority", v || null)}
                        options={PRIORITY_OPTIONS}
                        placeholder="Chọn mức"
                      />
                    </div>

                    <Separator className="my-2" />

                    {/* RCM References */}
                    {objectiveOptions.length > 0 && (
                      <div className="space-y-2">
                        <Label>Mục tiêu RCM</Label>
                        <MultiSelectCommand
                          options={objectiveOptions}
                          selected={state.objectiveRefIds}
                          onChange={(ids) => setField("objectiveRefIds", ids)}
                          placeholder="Chọn mục tiêu..."
                          searchPlaceholder="Tìm mục tiêu..."
                        />
                      </div>
                    )}

                    {riskOptions.length > 0 && (
                      <div className="space-y-2">
                        <Label>Rủi ro</Label>
                        <MultiSelectCommand
                          options={riskOptions}
                          selected={state.riskRefIds}
                          onChange={(ids) => setField("riskRefIds", ids)}
                          placeholder="Chọn rủi ro..."
                          searchPlaceholder="Tìm rủi ro..."
                        />
                      </div>
                    )}

                    {controlOptions.length > 0 && (
                      <div className="space-y-2">
                        <Label>Kiểm soát</Label>
                        <MultiSelectCommand
                          options={controlOptions}
                          selected={state.controlRefIds}
                          onChange={(ids) => setField("controlRefIds", ids)}
                          placeholder="Chọn kiểm soát..."
                          searchPlaceholder="Tìm kiểm soát..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Divider between metadata and findings */}
                  <Separator className="my-5" />

                  {/* Findings — red bullet list */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      Phát hiện liên quan
                    </h3>

                    {p.linkedFindings.length > 0 ? (
                      <ul className="space-y-1.5 pl-1">
                        {p.linkedFindings.map((f) => (
                          <li
                            key={f.id}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-red-500" />
                            <span className="text-red-600">{f.title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Chưa có phát hiện nào.
                      </p>
                    )}

                    {!showFindingForm ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowFindingForm(true)}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Thêm phát hiện
                      </Button>
                    ) : (
                      <div className="mt-3 space-y-3 rounded-md border p-3">
                        <div className="space-y-2">
                          <Label>Tiêu đề phát hiện</Label>
                          <Input
                            value={findingTitle}
                            onChange={(e) => setFindingTitle(e.target.value)}
                            placeholder="Nhập tiêu đề..."
                            autoFocus
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Mức độ rủi ro (tùy chọn)</Label>
                          <LabeledSelect
                            value={findingRating}
                            onChange={setFindingRating}
                            options={[
                              { value: "", label: "— Chọn mức độ —" },
                              { value: "low", label: "Thấp" },
                              { value: "medium", label: "Trung bình" },
                              { value: "high", label: "Cao" },
                              { value: "critical", label: "Nghiêm trọng" },
                            ]}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              // TODO: Call create finding API
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
              </div>
            </div>
          </div>

          {/* ── Sticky footer — Save only ── */}
          <div className="flex-none border-t bg-background px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-end">
              <div className="flex items-center gap-2">
                {form.isSaving && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang lưu...
                  </span>
                )}
                <Button
                  onClick={async () => {
                    await form.handleSave();
                    if (!form.isSaving) {
                      onOpenChange(false);
                    }
                  }}
                  disabled={form.isSaving}
                >
                  {form.isSaving ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-4 w-4" />
                  )}
                  Lưu
                </Button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function LeftBodyRow({
  label,
  children,
  alignStart = false,
}: {
  label: string;
  children: React.ReactNode;
  alignStart?: boolean;
}) {
  return (
    <div
      className={cn("flex gap-4", alignStart ? "items-start" : "items-center")}
    >
      <p className="w-36 shrink-0 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
