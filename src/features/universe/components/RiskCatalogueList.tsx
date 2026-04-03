"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { RiskCatalogueForm, RISK_TYPE_LABELS, RISK_DOMAIN_LABELS } from "./RiskCatalogueForm";
import {
  useRiskCatalogueItems,
  useDeleteRiskCatalogueItem,
} from "../hooks/useRiskCatalogue";
import type { RiskCatalogueItem } from "../types";

function useRiskCatalogueColumns(
  onEdit: (item: RiskCatalogueItem) => void,
  onDelete: (item: RiskCatalogueItem) => void,
): ColumnDef<RiskCatalogueItem>[] {
  return React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tên rủi ro" />
        ),
        cell: ({ row }) => (
          <div className="leading-tight">
            <div className="font-medium">{row.original.name}</div>
            {row.original.code && (
              <div className="text-xs text-muted-foreground">
                {row.original.code}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "riskType",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Loại rủi ro" />
        ),
        cell: ({ row }) =>
          row.original.riskType ? (
            <Badge variant="outline">
              {RISK_TYPE_LABELS[row.original.riskType] ?? row.original.riskType}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        filterFn: "equals",
      },
      {
        accessorKey: "riskDomain",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Lĩnh vực" />
        ),
        cell: ({ row }) =>
          row.original.riskDomain ? (
            <Badge variant="secondary">
              {RISK_DOMAIN_LABELS[row.original.riskDomain] ??
                row.original.riskDomain}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        filterFn: "equals",
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

export function RiskCatalogueList() {
  const { data: items = [], isLoading } = useRiskCatalogueItems(true);
  const deleteMutation = useDeleteRiskCatalogueItem();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RiskCatalogueItem | null>(null);
  const [deleting, setDeleting] = useState<RiskCatalogueItem | null>(null);

  const handleEdit = React.useCallback((item: RiskCatalogueItem) => {
    setEditing(item);
    setFormOpen(true);
  }, []);

  const handleDeleteClick = React.useCallback((item: RiskCatalogueItem) => {
    setDeleting(item);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    await deleteMutation.mutateAsync(deleting.id);
    setDeleting(null);
  };

  const columns = useRiskCatalogueColumns(handleEdit, handleDeleteClick);

  return (
    <>
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        emptyMessage="Chưa có rủi ro nào trong thư viện. Thêm mới để bắt đầu."
        searchPlaceholder="Tìm rủi ro..."
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

      <RiskCatalogueForm
        open={formOpen}
        onOpenChange={(open: boolean) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        initialData={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open: boolean) => !open && setDeleting(null)}
        title="Xóa rủi ro khỏi thư viện"
        description={`Bạn có chắc muốn xóa "${deleting?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </>
  );
}
