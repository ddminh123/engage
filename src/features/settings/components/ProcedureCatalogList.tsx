"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ProcedureCatalogForm } from "./ProcedureCatalogForm";
import {
  useProcedureCatalogItems,
  useDeleteProcedureCatalogItem,
} from "../hooks/useRiskCatalog";
import { SETTINGS_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import type { ProcedureCatalogItem } from "../types/riskCatalog";

const L = SETTINGS_LABELS.riskCatalog;
const PL = ENGAGEMENT_LABELS.procedure;

interface ProcedureCatalogListProps {
  domainId?: string;
  categoryId?: string;
}

export function ProcedureCatalogList({ domainId, categoryId }: ProcedureCatalogListProps) {
  const filters = React.useMemo(
    () => ({ domainId, categoryId }),
    [domainId, categoryId],
  );
  const { data: items = [], isLoading } = useProcedureCatalogItems(filters);
  const deleteMutation = useDeleteProcedureCatalogItem();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<ProcedureCatalogItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    React.useState<ProcedureCatalogItem | null>(null);

  const handleEdit = (item: ProcedureCatalogItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const columns: ColumnDef<ProcedureCatalogItem>[] = React.useMemo(
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
        accessorKey: "procedureType",
        header: L.field.procedureType,
        cell: ({ row }) => {
          const val = row.original.procedureType;
          return val ? (
            <Badge variant="secondary" className="text-xs">
              {PL.procedureType[val] ?? val}
            </Badge>
          ) : (
            "-"
          );
        },
        size: 140,
      },
      {
        accessorKey: "procedureCategory",
        header: L.field.procedureCategory,
        cell: ({ row }) => {
          const val = row.original.procedureCategory;
          return val ? (PL.procedureCategory[val] ?? val) : "-";
        },
        size: 150,
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
              title={L.procedure.editTitle}
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
              title={L.procedure.deleteTitle}
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
        searchPlaceholder="Tìm kiếm thủ tục..."
        emptyMessage={L.procedure.noData}
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
            {L.procedure.createTitle}
          </Button>
        }
      />

      <ProcedureCatalogForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={L.procedure.deleteTitle}
        description={
          deleteTarget
            ? L.procedure.deleteDescription(deleteTarget.name)
            : ""
        }
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
