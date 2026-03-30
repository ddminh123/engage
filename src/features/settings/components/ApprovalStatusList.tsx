"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Pencil,
  Loader2,
  Shield,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import {
  useApprovalStatuses,
  useCreateApprovalStatus,
  useUpdateApprovalStatus,
  useDeleteApprovalStatus,
  useRestoreApprovalStatus,
} from "../hooks/useApprovalStatuses";
import type { ApprovalStatusItem, StatusCategory } from "../types";

// ── Constants ──

const CATEGORY_ORDER: StatusCategory[] = ["open", "active", "review", "done"];

const CATEGORY_LABELS: Record<StatusCategory, string> = {
  open: "Mở",
  active: "Đang thực hiện",
  review: "Soát xét",
  done: "Hoàn thành",
};

const CATEGORY_DESCRIPTIONS: Record<StatusCategory, string> = {
  open: "Trạng thái ban đầu — thực thể có thể chỉnh sửa",
  active: "Đang xử lý — thực thể có thể chỉnh sửa",
  review: "Đang soát xét — thực thể chỉ đọc",
  done: "Hoàn tất — thực thể bị khóa",
};

const COLOR_PALETTE = [
  "#94a3b8",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
];

function slugify(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

// ── Main Component ──

export function ApprovalStatusList() {
  const { data: statuses = [], isLoading } = useApprovalStatuses();
  const restoreMutation = useRestoreApprovalStatus();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingStatus, setEditingStatus] =
    React.useState<ApprovalStatusItem | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<ApprovalStatusItem | null>(null);

  const { activeStatuses, archivedStatuses } = React.useMemo(() => {
    const active: ApprovalStatusItem[] = [];
    const archived: ApprovalStatusItem[] = [];
    for (const s of statuses) {
      if (s.isArchived) archived.push(s);
      else active.push(s);
    }
    return { activeStatuses: active, archivedStatuses: archived };
  }, [statuses]);

  const activeColumns = useActiveColumns({
    onEdit: (s) => {
      setEditingStatus(s);
      setFormOpen(true);
    },
    onArchive: setDeleteTarget,
  });

  const archivedColumns = useArchivedColumns({
    onEdit: (s) => {
      setEditingStatus(s);
      setFormOpen(true);
    },
    onRestore: (s) => restoreMutation.mutate(s.id),
    isRestoring: restoreMutation.isPending,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Định nghĩa các trạng thái phê duyệt. Trạng thái hệ thống không thể xóa
          hoặc đổi danh mục.
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditingStatus(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Thêm trạng thái
        </Button>
      </div>

      <DataTable
        columns={activeColumns}
        data={activeStatuses}
        isLoading={isLoading}
        emptyMessage="Chưa có trạng thái nào."
        hideToolbar
        pageSize={50}
      />

      {archivedStatuses.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">
              Đã lưu trữ
            </h3>
            <span className="text-xs text-muted-foreground">
              Ẩn khỏi cấu hình nhưng vẫn hiển thị cho dữ liệu lịch sử
            </span>
          </div>
          <DataTable
            columns={archivedColumns}
            data={archivedStatuses}
            hideToolbar
            pageSize={50}
            emptyMessage=""
          />
        </div>
      )}

      <StatusFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editingStatus}
      />

      <ArchiveStatusDialog
        status={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Column Definitions ──

function useActiveColumns({
  onEdit,
  onArchive,
}: {
  onEdit: (s: ApprovalStatusItem) => void;
  onArchive: (s: ApprovalStatusItem) => void;
}): ColumnDef<ApprovalStatusItem, unknown>[] {
  return React.useMemo(
    () => [
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <span
              className="inline-block size-3 shrink-0 rounded-full"
              style={{ backgroundColor: row.original.color }}
            />
            <span className="text-sm font-medium">{row.original.label}</span>
          </div>
        ),
      },
      {
        accessorKey: "key",
        header: "Khóa",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono">
            {row.original.key}
          </span>
        ),
      },
      {
        id: "category",
        header: "Danh mục",
        accessorFn: (row) => row.category,
        cell: ({ row }) => {
          const cat = row.original.category as StatusCategory;
          return (
            <Badge variant="outline" className="text-xs font-normal">
              {CATEGORY_LABELS[cat] ?? cat}
            </Badge>
          );
        },
      },
      {
        id: "flags",
        header: "",
        cell: ({ row }) =>
          row.original.isSystem ? (
            <Badge
              variant="secondary"
              className="text-[10px] h-5 font-normal gap-1"
            >
              <Shield className="h-3 w-3" />
              Hệ thống
            </Badge>
          ) : null,
      },
      {
        id: "_actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(row.original)}
              title="Chỉnh sửa"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {!row.original.isSystem && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-amber-600 hover:text-amber-700"
                onClick={() => onArchive(row.original)}
                title="Lưu trữ"
              >
                <Archive className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [onEdit, onArchive],
  );
}

function useArchivedColumns({
  onEdit,
  onRestore,
  isRestoring,
}: {
  onEdit: (s: ApprovalStatusItem) => void;
  onRestore: (s: ApprovalStatusItem) => void;
  isRestoring: boolean;
}): ColumnDef<ApprovalStatusItem, unknown>[] {
  return React.useMemo(
    () => [
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5 opacity-60">
            <span
              className="inline-block size-3 shrink-0 rounded-full"
              style={{ backgroundColor: row.original.color }}
            />
            <span className="text-sm font-medium">{row.original.label}</span>
          </div>
        ),
      },
      {
        accessorKey: "key",
        header: "Khóa",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono opacity-60">
            {row.original.key}
          </span>
        ),
      },
      {
        id: "category",
        header: "Danh mục",
        cell: ({ row }) => {
          const cat = row.original.category as StatusCategory;
          return (
            <Badge variant="outline" className="text-xs font-normal opacity-60">
              {CATEGORY_LABELS[cat] ?? cat}
            </Badge>
          );
        },
      },
      {
        id: "_actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(row.original)}
              title="Chỉnh sửa"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onRestore(row.original)}
              disabled={isRestoring}
              title="Khôi phục"
            >
              <ArchiveRestore className="h-3.5 w-3.5" />
              Khôi phục
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onRestore, isRestoring],
  );
}

// ── Status Form Dialog ──

function StatusFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ApprovalStatusItem | null;
}) {
  const createMutation = useCreateApprovalStatus();
  const updateMutation = useUpdateApprovalStatus();

  const [label, setLabel] = React.useState("");
  const [key, setKey] = React.useState("");
  const [color, setColor] = React.useState(COLOR_PALETTE[0]);
  const [category, setCategory] = React.useState<StatusCategory>("active");
  const [keyManuallyEdited, setKeyManuallyEdited] = React.useState(false);

  const isEditing = !!editing;
  const isSystem = editing?.isSystem ?? false;

  React.useEffect(() => {
    if (open) {
      if (editing) {
        setLabel(editing.label);
        setKey(editing.key);
        setColor(editing.color);
        setCategory(editing.category as StatusCategory);
        setKeyManuallyEdited(true);
      } else {
        setLabel("");
        setKey("");
        setColor(COLOR_PALETTE[0]);
        setCategory("active");
        setKeyManuallyEdited(false);
      }
    }
  }, [open, editing]);

  const handleLabelChange = (val: string) => {
    setLabel(val);
    if (!isEditing && !keyManuallyEdited) {
      setKey(slugify(val));
    }
  };

  const handleSubmit = () => {
    if (isEditing && editing) {
      const data: Record<string, unknown> = { label, color };
      if (!isSystem) {
        data.category = category;
      }
      updateMutation.mutate(
        { id: editing.id, data },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        { key, label, color, category },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const canSubmit = label.trim() && key.trim() && color;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa trạng thái" : "Thêm trạng thái mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Tên hiển thị</Label>
            <Input
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="VD: Kiểm tra nội bộ"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Khóa (slug)</Label>
            <Input
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setKeyManuallyEdited(true);
              }}
              placeholder="VD: kiem_tra_noi_bo"
              disabled={isEditing}
              className={isEditing ? "opacity-60" : ""}
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Không thể thay đổi khóa sau khi tạo.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Danh mục</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as StatusCategory)}
              disabled={isSystem}
            >
              <SelectTrigger>
                <span
                  className={cn(
                    "flex flex-1 text-left truncate",
                    !category && "text-muted-foreground",
                  )}
                >
                  {category ? CATEGORY_LABELS[category] : "Chọn danh mục..."}
                </span>
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ORDER.map((c) => (
                  <SelectItem key={c} value={c} label={CATEGORY_LABELS[c]}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSystem && (
              <p className="text-xs text-muted-foreground">
                Trạng thái hệ thống không thể đổi danh mục.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Màu sắc</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "size-7 rounded-full border-2 transition-all cursor-pointer",
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent hover:border-muted-foreground/40",
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEditing ? "Lưu" : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Archive Confirm Dialog ──

function ArchiveStatusDialog({
  status,
  onClose,
}: {
  status: ApprovalStatusItem | null;
  onClose: () => void;
}) {
  const archiveMutation = useDeleteApprovalStatus();

  const handleClose = () => {
    archiveMutation.reset();
    onClose();
  };

  if (!status) return null;

  return (
    <ConfirmDialog
      open={!!status}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title="Lưu trữ trạng thái"
      description={
        archiveMutation.isError
          ? archiveMutation.error.message
          : `Lưu trữ trạng thái "${status.label}"? Trạng thái sẽ bị ẩn khỏi cấu hình nhưng vẫn hiển thị cho dữ liệu lịch sử. Bạn có thể khôi phục sau.`
      }
      confirmLabel="Lưu trữ"
      variant="destructive"
      isLoading={archiveMutation.isPending}
      onConfirm={() => {
        archiveMutation.mutate(status.id, { onSuccess: handleClose });
      }}
    />
  );
}
