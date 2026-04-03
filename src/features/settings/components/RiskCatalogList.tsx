"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { RiskCatalogForm } from "./RiskCatalogForm";
import {
  useRiskCatalogItems,
  useDeleteRiskCatalogItem,
} from "../hooks/useRiskCatalog";
import { SETTINGS_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import type { RiskCatalogItem } from "../types/riskCatalog";

const L = SETTINGS_LABELS.riskCatalog;
const RL = ENGAGEMENT_LABELS.risk;

const RATING_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

interface RiskCatalogListProps {
  domainId?: string;
  categoryId?: string;
}

export function RiskCatalogList({ domainId, categoryId }: RiskCatalogListProps) {
  const { data: items = [], isLoading } = useRiskCatalogItems({
    domainId,
    categoryId,
  });
  const deleteMutation = useDeleteRiskCatalogItem();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<RiskCatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<RiskCatalogItem | null>(
    null,
  );

  const handleEdit = (item: RiskCatalogItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const columns: ColumnDef<RiskCatalogItem>[] = React.useMemo(
    () => [
      {
        accessorKey: "code",
        header: L.field.code,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.code || "-"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "name",
        header: L.field.name,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "category",
        header: L.field.category,
        cell: ({ row }) => {
          const cat = row.original.category;
          return cat ? (
            <Badge variant="secondary" className="text-xs">
              {cat.name}
            </Badge>
          ) : (
            "-"
          );
        },
      },
      {
        accessorKey: "riskRating",
        header: L.field.riskRating,
        cell: ({ row }) => {
          const rating = row.original.riskRating;
          if (!rating) return "-";
          return (
            <Badge
              variant="outline"
              className={RATING_COLORS[rating] || ""}
            >
              {RL.riskRating[rating] ?? rating}
            </Badge>
          );
        },
        size: 120,
      },
      {
        accessorKey: "source",
        header: L.field.source,
        cell: ({ row }) => {
          const source = row.original.source;
          return source === "system" ? (
            <Badge variant="secondary" className="text-xs">
              {L.field.sourceSystem}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              {L.field.sourceCustom}
            </Badge>
          );
        },
        size: 100,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row.original);
              }}
              title={L.risk.editTitle}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row.original);
              }}
              title={L.risk.deleteTitle}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
        size: 80,
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Tìm kiếm rủi ro..."
        emptyMessage={L.risk.noData}
        onRowClick={handleEdit}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditItem(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {L.risk.createTitle}
          </Button>
        }
      />

      <RiskCatalogForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
        defaultCategoryId={categoryId}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={L.risk.deleteTitle}
        description={
          deleteTarget ? L.risk.deleteDescription(deleteTarget.name) : ""
        }
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
