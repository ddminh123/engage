"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Pencil, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { RiskFactorForm } from "./RiskFactorForm";
import {
  useRiskAssessmentFactors,
  useDeleteRiskAssessmentFactor,
} from "../hooks/useRiskFactors";
import type { RiskAssessmentFactor } from "../types";

const RELATES_TO_LABELS: Record<string, string> = {
  impact: "Mức độ ảnh hưởng",
  likelihood: "Khả năng xảy ra",
  control: "Môi trường kiểm soát",
};

function useRiskAssessmentFactorColumns(
  onEdit: (rf: RiskAssessmentFactor) => void,
  onDelete: (rf: RiskAssessmentFactor) => void,
): ColumnDef<RiskAssessmentFactor>[] {
  return React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tên yếu tố" />
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
        accessorKey: "relatesTo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Liên quan đến" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">
            {RELATES_TO_LABELS[row.original.relatesTo] ??
              row.original.relatesTo}
          </Badge>
        ),
      },
      {
        accessorKey: "isPositive",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tính chất" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            {row.original.isPositive ? (
              <>
                <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                <span className="text-sm text-green-600">Tích cực</span>
              </>
            ) : (
              <>
                <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
                <span className="text-sm text-red-600">Tiêu cực</span>
              </>
            )}
          </div>
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

export function RiskFactorList() {
  const { data: factors = [], isLoading } = useRiskAssessmentFactors(true);
  const deleteMutation = useDeleteRiskAssessmentFactor();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RiskAssessmentFactor | null>(null);
  const [deleting, setDeleting] = useState<RiskAssessmentFactor | null>(null);

  const handleEdit = React.useCallback((rf: RiskAssessmentFactor) => {
    setEditing(rf);
    setFormOpen(true);
  }, []);

  const handleDeleteClick = React.useCallback((rf: RiskAssessmentFactor) => {
    setDeleting(rf);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    await deleteMutation.mutateAsync(deleting.id);
    setDeleting(null);
  };

  const columns = useRiskAssessmentFactorColumns(handleEdit, handleDeleteClick);

  return (
    <>
      <DataTable
        columns={columns}
        data={factors}
        isLoading={isLoading}
        emptyMessage="Chưa có yếu tố đánh giá rủi ro nào. Thêm mới để bắt đầu."
        searchPlaceholder="Tìm yếu tố..."
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

      <RiskFactorForm
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
        title="Xóa yếu tố đánh giá rủi ro"
        description={`Bạn có chắc muốn xóa "${deleting?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </>
  );
}
