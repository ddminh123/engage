"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { WorkflowFlowChart as SharedWorkflowFlowChart } from "@/components/shared/WorkflowFlowChart";
import {
  ArrowRight,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormDialog } from "@/components/shared/FormDialog";
import { COMMON_LABELS } from "@/constants/labels";
import { DataTable } from "@/components/shared/DataTable";
import { computeReorder } from "@/components/shared/SortableList";
import {
  useApprovalWorkflows,
  useCreateApprovalWorkflow,
  useUpdateApprovalWorkflow,
  useDeleteApprovalWorkflow,
  useAddApprovalTransition,
  useUpdateApprovalTransition,
  useDeleteApprovalTransition,
  useReorderApprovalTransitions,
} from "../hooks/useApprovalWorkflows";
import type {
  ApprovalWorkflow,
  ApprovalWorkflowTransition,
  ApprovalTransitionInput,
} from "../types";
import {
  useApprovalStatuses,
  useActiveStatuses,
} from "../hooks/useApprovalStatuses";

const C = COMMON_LABELS;

const ACTION_TYPES = [
  { value: "start", label: "Bắt đầu" },
  { value: "submit", label: "Gửi" },
  { value: "review", label: "Soát xét" },
  { value: "approve", label: "Phê duyệt" },
  { value: "reject", label: "Từ chối" },
  { value: "revise", label: "Sửa lại" },
];

const ROLE_OPTIONS = [
  { value: "*", label: "Tất cả (*)" },
  { value: "cae", label: "Trưởng KTNB" },
  { value: "admin", label: "Quản trị viên" },
  { value: "audit_director", label: "Giám đốc kiểm toán" },
  { value: "audit_manager", label: "Trưởng phòng kiểm toán" },
  { value: "senior_auditor", label: "Kiểm toán viên chính" },
  { value: "auditor", label: "Kiểm toán viên" },
  { value: "reviewer", label: "Soát xét viên" },
  { value: "lead", label: "Trưởng nhóm" },
];

// ── Main Component ──

export function ApprovalWorkflowList() {
  const { data: workflows = [], isLoading } = useApprovalWorkflows();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Tạo quy trình
        </Button>
      </div>

      {workflows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Chưa có quy trình soát xét nào.
        </p>
      ) : (
        workflows.map((wf) => (
          <WorkflowCard
            key={wf.id}
            workflow={wf}
            isExpanded={expandedId === wf.id}
            onToggle={() => setExpandedId(expandedId === wf.id ? null : wf.id)}
          />
        ))
      )}

      <CreateWorkflowDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

// ── Workflow Card ──

function WorkflowCard({
  workflow,
  isExpanded,
  onToggle,
}: {
  workflow: ApprovalWorkflow;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const updateWorkflow = useUpdateApprovalWorkflow();
  const deleteWorkflow = useDeleteApprovalWorkflow();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [editingName, setEditingName] = React.useState(false);
  const [nameValue, setNameValue] = React.useState(workflow.name);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const saveName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== workflow.name) {
      updateWorkflow.mutate({ id: workflow.id, data: { name: trimmed } });
    } else {
      setNameValue(workflow.name);
    }
    setEditingName(false);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {editingName ? (
              <Input
                ref={nameInputRef}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") {
                    setNameValue(workflow.name);
                    setEditingName(false);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-7 w-auto min-w-[200px] text-sm font-medium"
              />
            ) : (
              <span
                className="font-medium text-sm hover:underline cursor-text"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setNameValue(workflow.name);
                  setEditingName(true);
                }}
                title="Nhấp đúp để đổi tên"
              >
                {workflow.name}
              </span>
            )}
            {workflow.isDefault && (
              <Badge variant="default" className="text-xs font-normal">
                Mặc định
              </Badge>
            )}
            {!workflow.isActive && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                Tắt
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {workflow.transitions.length} bước chuyển
            {workflow.allowSelfApproval && " · Cho phép tự phê duyệt"}
            {workflow.entityBindings.length > 0 &&
              ` · ${workflow.entityBindings.length} thực thể`}
          </p>
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            <Label
              htmlFor={`active-${workflow.id}`}
              className="text-xs text-muted-foreground"
            >
              Kích hoạt
            </Label>
            <Switch
              id={`active-${workflow.id}`}
              checked={workflow.isActive}
              onCheckedChange={(checked) =>
                updateWorkflow.mutate({
                  id: workflow.id,
                  data: { isActive: checked },
                })
              }
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label
              htmlFor={`self-${workflow.id}`}
              className="text-xs text-muted-foreground"
            >
              Tự phê duyệt
            </Label>
            <Switch
              id={`self-${workflow.id}`}
              checked={workflow.allowSelfApproval}
              onCheckedChange={(checked) =>
                updateWorkflow.mutate({
                  id: workflow.id,
                  data: { allowSelfApproval: checked },
                })
              }
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label
              htmlFor={`default-${workflow.id}`}
              className="text-xs text-muted-foreground"
            >
              Mặc định
            </Label>
            <Switch
              id={`default-${workflow.id}`}
              checked={workflow.isDefault}
              onCheckedChange={(checked) =>
                updateWorkflow.mutate({
                  id: workflow.id,
                  data: { isDefault: checked },
                })
              }
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
            title="Xóa quy trình"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded content — flow chart + edit transitions */}
      {isExpanded && (
        <div className="border-t p-4 space-y-4 min-w-0 overflow-hidden">
          {workflow.transitions.length > 0 && (
            <WorkflowFlowChart transitions={workflow.transitions} />
          )}
          <TransitionSection
            workflowId={workflow.id}
            transitions={workflow.transitions}
          />
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Xóa quy trình?"
        description={`Bạn có chắc chắn muốn xóa quy trình "${workflow.name}"? Thao tác này không thể hoàn tác.`}
        variant="destructive"
        confirmLabel="Xóa"
        onConfirm={() => deleteWorkflow.mutate(workflow.id)}
        isLoading={deleteWorkflow.isPending}
      />
    </div>
  );
}

// ── Flow Chart — uses shared component ──

function WorkflowFlowChart({
  transitions,
}: {
  transitions: ApprovalWorkflowTransition[];
}) {
  return <SharedWorkflowFlowChart transitions={transitions} />;
}

// ── Transition Section (collapsible via edit button) ──

function TransitionSection({
  workflowId,
  transitions,
}: {
  workflowId: string;
  transitions: ApprovalWorkflowTransition[];
}) {
  const [showTable, setShowTable] = React.useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => setShowTable(!showTable)}
        >
          <Pencil className="h-3 w-3" />
          {showTable ? "Ẩn" : "Chỉnh sửa quy trình"}
          {showTable ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      </div>

      {showTable && (
        <TransitionTable workflowId={workflowId} transitions={transitions} />
      )}
    </div>
  );
}

// ── Transition Table (DataTable with DnD) ──

function TransitionTable({
  workflowId,
  transitions,
}: {
  workflowId: string;
  transitions: ApprovalWorkflowTransition[];
}) {
  const { data: statuses = [] } = useApprovalStatuses();
  const sLabel = React.useCallback(
    (key: string) => statuses.find((s) => s.key === key)?.label ?? key,
    [statuses],
  );
  const deleteTransition = useDeleteApprovalTransition();
  const reorderTransitions = useReorderApprovalTransitions();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [editTarget, setEditTarget] =
    React.useState<ApprovalWorkflowTransition | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const handleReorder = React.useCallback(
    (activeId: string, overId: string) => {
      const newOrder = computeReorder(transitions, activeId, overId);
      if (newOrder.length === 0) return;
      reorderTransitions.mutate({
        workflowId,
        orderedIds: newOrder.map((o) => o.id),
      });
    },
    [transitions, workflowId, reorderTransitions],
  );

  const columns: ColumnDef<ApprovalWorkflowTransition, unknown>[] =
    React.useMemo(
      () => [
        {
          id: "transition",
          header: "Bước chuyển",
          meta: { label: "Bước chuyển" },
          cell: ({ row }) => {
            const t = row.original;
            return (
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-xs font-normal">
                  {sLabel(t.fromStatus)}
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <Badge variant="secondary" className="text-xs font-normal">
                  {sLabel(t.toStatus)}
                </Badge>
              </div>
            );
          },
        },
        {
          accessorKey: "actionLabel",
          header: "Thao tác",
          meta: { label: "Thao tác" },
          cell: ({ row }) => (
            <span className="text-sm font-medium">
              {row.original.actionLabel}
            </span>
          ),
        },
        {
          id: "roles",
          header: "Vai trò được phép",
          meta: { label: "Vai trò" },
          cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
              {row.original.allowedRoles.map((r) => (
                <Badge
                  key={r}
                  variant="outline"
                  className="text-[10px] h-5 font-normal"
                >
                  {ROLE_OPTIONS.find((ro) => ro.value === r)?.label ?? r}
                </Badge>
              ))}
            </div>
          ),
        },
        {
          id: "_actions",
          header: "",
          cell: ({ row }) => (
            <div className="flex items-center gap-1 justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setEditTarget(row.original)}
                title="Sửa"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(row.original.id)}
                title="Xóa"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ),
        },
      ],
      [sLabel],
    );

  return (
    <>
      <DataTable
        columns={columns}
        data={transitions}
        emptyMessage="Chưa có bước chuyển nào."
        pageSize={50}
        hideToolbar={false}
        enableRowReorder
        onRowReorder={handleReorder}
        getRowId={(t) => t.id}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Thêm bước
          </Button>
        }
      />

      {/* Add transition dialog */}
      <TransitionFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        workflowId={workflowId}
        transition={null}
      />

      {/* Edit transition dialog */}
      <TransitionFormDialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        workflowId={workflowId}
        transition={editTarget}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Xóa bước chuyển?"
        description="Bạn có chắc chắn muốn xóa bước chuyển này?"
        variant="destructive"
        confirmLabel="Xóa"
        onConfirm={() => {
          if (deleteTarget) {
            deleteTransition.mutate(
              { workflowId, transitionId: deleteTarget },
              { onSuccess: () => setDeleteTarget(null) },
            );
          }
        }}
        isLoading={deleteTransition.isPending}
      />
    </>
  );
}

// ── Transition Form Dialog ──

const SIGNOFF_TYPES = [
  { value: "prepare", label: "Thực hiện (Prepare)" },
  { value: "review", label: "Soát xét (Review)" },
  { value: "approve", label: "Phê duyệt (Approve)" },
];

const transitionSchema = z.object({
  fromStatus: z.string().min(1, "Bắt buộc"),
  toStatus: z.string().min(1, "Bắt buộc"),
  actionLabel: z.string().min(1, "Bắt buộc"),
  actionType: z.enum([
    "start",
    "submit",
    "review",
    "approve",
    "reject",
    "revise",
  ]),
  sortOrder: z.number().int().min(0),
  allowedRoles: z.array(z.string()).min(1, "Chọn ít nhất 1 vai trò"),
  generatesSignoff: z.boolean(),
  signoffType: z.string().nullable(),
});

type TransitionFormValues = z.infer<typeof transitionSchema>;

function TransitionFormDialog({
  open,
  onOpenChange,
  workflowId,
  transition,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  transition: ApprovalWorkflowTransition | null;
}) {
  const { data: allStatuses = [] } = useApprovalStatuses();
  const activeStatuses = useActiveStatuses();
  const statusOptions = React.useMemo(
    () => activeStatuses.map((s) => ({ value: s.key, label: s.label })),
    [activeStatuses],
  );
  const sLabel = React.useCallback(
    (key: string) => allStatuses.find((s) => s.key === key)?.label ?? key,
    [allStatuses],
  );
  const addTransition = useAddApprovalTransition();
  const updateTransition = useUpdateApprovalTransition();
  const isEdit = transition !== null;

  const form = useForm<TransitionFormValues>({
    resolver: zodResolver(transitionSchema),
    defaultValues: {
      fromStatus: "",
      toStatus: "",
      actionLabel: "",
      actionType: "submit",
      sortOrder: 0,
      allowedRoles: ["*"],
      generatesSignoff: false,
      signoffType: null,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        fromStatus: transition?.fromStatus ?? "",
        toStatus: transition?.toStatus ?? "",
        actionLabel: transition?.actionLabel ?? "",
        actionType: (transition?.actionType ??
          "submit") as TransitionFormValues["actionType"],
        sortOrder: transition?.sortOrder ?? 0,
        allowedRoles: transition?.allowedRoles ?? ["*"],
        generatesSignoff: transition?.generatesSignoff ?? false,
        signoffType: transition?.signoffType ?? null,
      });
      addTransition.reset();
      updateTransition.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isPending = addTransition.isPending || updateTransition.isPending;
  const mutationError =
    addTransition.error?.message ?? updateTransition.error?.message ?? null;

  const handleSubmit = async (values: TransitionFormValues) => {
    const data: ApprovalTransitionInput = {
      ...values,
      actionType: values.actionType as ApprovalTransitionInput["actionType"],
    };
    try {
      if (isEdit && transition) {
        await updateTransition.mutateAsync({
          workflowId,
          transitionId: transition.id,
          data,
        });
      } else {
        await addTransition.mutateAsync({ workflowId, data });
      }
      onOpenChange(false);
    } catch {
      // Error captured by mutation state
    }
  };

  const toggleRole = (role: string) => {
    const current = form.getValues("allowedRoles");
    form.setValue(
      "allowedRoles",
      current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role],
      { shouldValidate: true },
    );
  };
  const watchedRoles = form.watch("allowedRoles");
  const watchedGeneratesSignoff = form.watch("generatesSignoff");

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Sửa bước chuyển" : "Thêm bước chuyển"}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {C.action.cancel}
          </Button>
          <Button type="submit" form="transition-form" disabled={isPending}>
            {isPending
              ? C.action.saving
              : isEdit
                ? C.action.update
                : C.action.create}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
          id="transition-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="fromStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Từ trạng thái *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => v && field.onChange(v)}
                    >
                      <SelectTrigger>
                        <span
                          className={cn(
                            "flex flex-1 text-left truncate",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? sLabel(field.value) : "Chọn..."}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem
                            key={s.value}
                            value={s.value}
                            label={s.label}
                          >
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đến trạng thái *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => v && field.onChange(v)}
                    >
                      <SelectTrigger>
                        <span
                          className={cn(
                            "flex flex-1 text-left truncate",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? sLabel(field.value) : "Chọn..."}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem
                            key={s.value}
                            value={s.value}
                            label={s.label}
                          >
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="actionLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhãn nút *</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Gửi soát xét" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="actionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại hành động *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => v && field.onChange(v)}
                    >
                      <SelectTrigger>
                        <span className="flex flex-1 text-left truncate">
                          {ACTION_TYPES.find((a) => a.value === field.value)
                            ?.label ?? field.value}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map((a) => (
                          <SelectItem
                            key={a.value}
                            value={a.value}
                            label={a.label}
                          >
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thứ tự</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="allowedRoles"
            render={() => (
              <FormItem>
                <FormLabel>Vai trò được phép *</FormLabel>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_OPTIONS.map((role) => (
                    <Badge
                      key={role.value}
                      variant={
                        watchedRoles.includes(role.value)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer text-xs"
                      onClick={() => toggleRole(role.value)}
                    >
                      {role.label}
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="generatesSignoff"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => {
                      const checked = !!v;
                      field.onChange(checked);
                      if (!checked) form.setValue("signoffType", null);
                    }}
                  />
                </FormControl>
                <FormLabel className="!mt-0 text-sm font-normal">
                  Tạo chữ ký (signoff) cho bước này
                </FormLabel>
              </FormItem>
            )}
          />

          {watchedGeneratesSignoff && (
            <FormField
              control={form.control}
              name="signoffType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại chữ ký *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => v && field.onChange(v)}
                    >
                      <SelectTrigger>
                        <span
                          className={cn(
                            "flex flex-1 text-left truncate",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? (SIGNOFF_TYPES.find(
                                (s) => s.value === field.value,
                              )?.label ?? field.value)
                            : "Chọn loại chữ ký..."}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {SIGNOFF_TYPES.map((s) => (
                          <SelectItem
                            key={s.value}
                            value={s.value}
                            label={s.label}
                          >
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {mutationError && (
            <p className="text-sm font-medium text-destructive">
              {mutationError}
            </p>
          )}
        </form>
      </Form>
    </FormDialog>
  );
}

// ── Create Workflow Dialog ──

function CreateWorkflowDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createWorkflow = useCreateApprovalWorkflow();
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (open) setName("");
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    createWorkflow.mutate(
      { name: name.trim(), isActive: true },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Tạo quy trình soát xét</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Tên quy trình</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Soát xét chương trình kiểm toán"
              className="h-9"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createWorkflow.isPending || !name.trim()}
          >
            {createWorkflow.isPending && (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            )}
            Tạo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
