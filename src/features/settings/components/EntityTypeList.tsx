"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumnHeader } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EntityTypeForm } from "./EntityTypeForm";
import {
  useEntityTypes,
  useDeleteEntityType,
} from "../hooks/useEntityTypes";
import type { EntityType } from "../types";

function useEntityTypeColumns(
  onEdit: (item: EntityType) => void,
  onDelete: (item: EntityType) => void,
): ColumnDef<EntityType>[] {
  return React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tên loại" />
        ),
        cell: ({ row }) => (
          <div className="leading-tight">
            <div className="font-medium">{row.original.name}</div>
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
          <DataTableColumnHeader column={column} title="Mã" />
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
        accessorKey: "isActive",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Đang dùng" : "Ẩn"}
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

export function EntityTypeList() {
  const { data: entityTypes = [], isLoading } = useEntityTypes(true);
  const deleteMutation = useDeleteEntityType();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EntityType | null>(null);
  const [deleting, setDeleting] = useState<EntityType | null>(null);

  const handleEdit = React.useCallback((item: EntityType) => {
    setEditing(item);
    setFormOpen(true);
  }, []);

  const handleDeleteClick = React.useCallback((item: EntityType) => {
    setDeleting(item);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // Error handled by mutation
    }
  };

  const columns = useEntityTypeColumns(handleEdit, handleDeleteClick);

  return (
    <>
      <DataTable
        columns={columns}
        data={entityTypes}
        isLoading={isLoading}
        emptyMessage="Chưa có loại đối tượng nào. Thêm mới để bắt đầu."
        searchPlaceholder="Tìm loại đối tượng..."
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

      <EntityTypeForm
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
        title="Xóa loại đối tượng"
        description={
          deleteMutation.error
            ? deleteMutation.error.message
            : `Bạn có chắc muốn xóa "${deleting?.name}"? Hành động này không thể hoàn tác.`
        }
        confirmLabel="Xóa"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </>
  );
}
