"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TemplateForm } from "./TemplateForm";
import { TemplateEditorOverlay } from "./TemplateEditorOverlay";
import { useTemplates, useDeleteTemplate } from "../hooks/useTemplates";
import { templateEntityTypeLabel } from "@/constants/entityTypes";
import type { Template } from "../types";

function useTemplateColumns(
  onEdit: (item: Template) => void,
  onDelete: (item: Template) => void,
): ColumnDef<Template>[] {
  return React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tên mẫu" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="leading-tight">
              <div className="font-medium">{row.original.name}</div>
              {row.original.description && (
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {row.original.description}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "entityType",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Loại" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-xs font-normal">
            {templateEntityTypeLabel(row.original.entityType)}
          </Badge>
        ),
        filterFn: "equals",
      },
      {
        accessorKey: "categoryName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Danh mục" />
        ),
        cell: ({ row }) =>
          row.original.categoryName ? (
            <span className="text-sm">{row.original.categoryName}</span>
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
        accessorKey: "creatorName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Người tạo" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.creatorName ?? "—"}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              title="Chỉnh sửa"
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
              title="Xóa"
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

export function TemplateList() {
  const { data: templates = [], isLoading } = useTemplates();
  const deleteMutation = useDeleteTemplate();

  const [formOpen, setFormOpen] = useState(false);
  const [overlayTemplate, setOverlayTemplate] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState<Template | null>(null);

  const handleEdit = React.useCallback((item: Template) => {
    setOverlayTemplate(item);
  }, []);

  const handleDeleteClick = React.useCallback((item: Template) => {
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

  const columns = useTemplateColumns(handleEdit, handleDeleteClick);

  // After creating a template, open it in the fullscreen overlay
  const handleCreated = React.useCallback((created: Template) => {
    setFormOpen(false);
    setOverlayTemplate(created);
  }, []);

  return (
    <>
      <DataTable
        columns={columns}
        data={templates}
        isLoading={isLoading}
        emptyMessage="Chưa có mẫu nào. Thêm mới để bắt đầu."
        searchPlaceholder="Tìm mẫu..."
        actions={
          <Button size="sm" className="h-8" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm mẫu
          </Button>
        }
      />

      <TemplateForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={handleCreated}
      />

      {overlayTemplate && (
        <TemplateEditorOverlay
          template={overlayTemplate}
          onClose={() => setOverlayTemplate(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa mẫu"
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
