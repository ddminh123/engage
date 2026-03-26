"use client";

import * as React from "react";
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
import { Switch } from "@/components/ui/switch";
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

const ACTION_TYPES = [
  { value: "start", label: "Bắt đầu" },
  { value: "submit", label: "Gửi" },
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
        <div className="border-t p-4 space-y-4 min-w-0">
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

  const [fromStatus, setFromStatus] = React.useState("");
  const [toStatus, setToStatus] = React.useState("");
  const [actionLabel, setActionLabel] = React.useState("");
  const [actionType, setActionType] = React.useState<string>("submit");
  const [allowedRoles, setAllowedRoles] = React.useState<string[]>(["*"]);
  const [sortOrder, setSortOrder] = React.useState(0);

  React.useEffect(() => {
    if (transition) {
      setFromStatus(transition.fromStatus);
      setToStatus(transition.toStatus);
      setActionLabel(transition.actionLabel);
      setActionType(transition.actionType);
      setAllowedRoles(transition.allowedRoles);
      setSortOrder(transition.sortOrder);
    } else {
      setFromStatus("");
      setToStatus("");
      setActionLabel("");
      setActionType("submit");
      setAllowedRoles(["*"]);
      setSortOrder(0);
    }
  }, [transition, open]);

  const toggleRole = (role: string) => {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSubmit = () => {
    const data: ApprovalTransitionInput = {
      fromStatus,
      toStatus,
      actionLabel,
      actionType: actionType as ApprovalTransitionInput["actionType"],
      allowedRoles,
      sortOrder,
    };

    if (isEdit && transition) {
      updateTransition.mutate(
        { workflowId, transitionId: transition.id, data },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      addTransition.mutate(
        { workflowId, data },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  const isPending = addTransition.isPending || updateTransition.isPending;
  const isValid =
    fromStatus &&
    toStatus &&
    actionLabel &&
    actionType &&
    allowedRoles.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa bước chuyển" : "Thêm bước chuyển"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Từ trạng thái</Label>
              <Select
                value={fromStatus}
                onValueChange={(v) => v && setFromStatus(v)}
              >
                <SelectTrigger className="h-9">
                  <span
                    className={cn(
                      "flex flex-1 text-left truncate",
                      !fromStatus && "text-muted-foreground",
                    )}
                  >
                    {fromStatus ? sLabel(fromStatus) : "Chọn..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value} label={s.label}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Đến trạng thái</Label>
              <Select
                value={toStatus}
                onValueChange={(v) => v && setToStatus(v)}
              >
                <SelectTrigger className="h-9">
                  <span
                    className={cn(
                      "flex flex-1 text-left truncate",
                      !toStatus && "text-muted-foreground",
                    )}
                  >
                    {toStatus ? sLabel(toStatus) : "Chọn..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value} label={s.label}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Nhãn nút</Label>
            <Input
              value={actionLabel}
              onChange={(e) => setActionLabel(e.target.value)}
              placeholder="Ví dụ: Gửi soát xét"
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Loại hành động</Label>
              <Select
                value={actionType}
                onValueChange={(v) => v && setActionType(v)}
              >
                <SelectTrigger className="h-9">
                  <span className="flex flex-1 text-left truncate">
                    {ACTION_TYPES.find((a) => a.value === actionType)?.label ??
                      actionType}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value} label={a.label}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Thứ tự</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(parseInt(e.target.value, 10) || 0)
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Vai trò được phép</Label>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_OPTIONS.map((role) => (
                <Badge
                  key={role.value}
                  variant={
                    allowedRoles.includes(role.value) ? "default" : "outline"
                  }
                  className="cursor-pointer text-xs"
                  onClick={() => toggleRole(role.value)}
                >
                  {role.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !isValid}>
            {isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {isEdit ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
