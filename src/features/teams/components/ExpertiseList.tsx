"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumnHeader } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ExpertiseForm } from "./ExpertiseForm";
import { useExpertises, useDeleteExpertise } from "../hooks/useExpertise";
import { TEAMS_LABELS } from "@/constants/labels/teams";
import type { Expertise } from "../types";

const L = TEAMS_LABELS;

function useExpertiseColumns(
  onEdit: (item: Expertise) => void,
  onDelete: (item: Expertise) => void,
): ColumnDef<Expertise>[] {
  return React.useMemo(
    () => [
      {
        accessorKey: "label",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={L.EXPERTISE_LABEL} />
        ),
        cell: ({ row }) => (
          <div className="leading-tight">
            <div className="font-medium">{row.original.label}</div>
            {row.original.description && (
              <div className="text-xs text-muted-foreground">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={L.EXPERTISE_CODE} />
        ),
        cell: ({ row }) =>
          row.original.code ? (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {row.original.code}
            </code>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? "Đang dùng" : "Ẩn"}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.original);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.original);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
        meta: { label: "Thao tác" },
      },
    ],
    [onEdit, onDelete],
  );
}

export function ExpertiseList() {
  const { data: expertises = [], isLoading } = useExpertises();
  const deleteMutation = useDeleteExpertise();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expertise | null>(null);
  const [deleting, setDeleting] = useState<Expertise | null>(null);

  const handleEdit = React.useCallback((item: Expertise) => {
    setEditing(item);
    setFormOpen(true);
  }, []);

  const handleDeleteClick = React.useCallback((item: Expertise) => {
    setDeleting(item);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // handled by mutation
    }
  };

  const columns = useExpertiseColumns(handleEdit, handleDeleteClick);

  return (
    <>
      <DataTable
        columns={columns}
        data={expertises}
        isLoading={isLoading}
        emptyMessage="Chưa có chuyên môn nào. Thêm mới để bắt đầu."
        searchPlaceholder="Tìm chuyên môn..."
        actions={
          <Button
            size="sm"
            className="h-8"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        }
      />

      <ExpertiseForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        initialData={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa chuyên môn"
        description={
          deleteMutation.error
            ? deleteMutation.error.message
            : `Bạn có chắc muốn xóa "${deleting?.label}"? Hành động này không thể hoàn tác.`
        }
        confirmLabel="Xóa"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </>
  );
}
