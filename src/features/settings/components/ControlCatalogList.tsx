"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ControlCatalogForm } from "./ControlCatalogForm";
import {
  useControlCatalogItems,
  useDeleteControlCatalogItem,
} from "../hooks/useRiskCatalog";
import { SETTINGS_LABELS, ENGAGEMENT_LABELS } from "@/constants/labels";
import type { ControlCatalogItem } from "../types/riskCatalog";

const L = SETTINGS_LABELS.riskCatalog;
const EL = ENGAGEMENT_LABELS.risk;

export function ControlCatalogList() {
  const { data: items = [], isLoading } = useControlCatalogItems();
  const deleteMutation = useDeleteControlCatalogItem();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<ControlCatalogItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    React.useState<ControlCatalogItem | null>(null);

  const handleEdit = (item: ControlCatalogItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const columns: ColumnDef<ControlCatalogItem>[] = React.useMemo(
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
        accessorKey: "controlType",
        header: L.field.controlType,
        cell: ({ row }) => {
          const val = row.original.controlType;
          return val ? (
            <Badge variant="secondary" className="text-xs">
              {EL.controlType[val] ?? val}
            </Badge>
          ) : (
            "-"
          );
        },
        size: 120,
      },
      {
        accessorKey: "controlNature",
        header: L.field.controlNature,
        cell: ({ row }) => {
          const val = row.original.controlNature;
          return val ? (EL.controlNature[val] ?? val) : "-";
        },
        size: 120,
      },
      {
        accessorKey: "frequency",
        header: L.field.frequency,
        cell: ({ row }) => {
          const val = row.original.frequency;
          return val ? (EL.controlFrequency[val] ?? val) : "-";
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
              title={L.control.editTitle}
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
              title={L.control.deleteTitle}
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
        searchPlaceholder="Tìm kiếm kiểm soát..."
        emptyMessage={L.control.noData}
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
            {L.control.createTitle}
          </Button>
        }
      />

      <ControlCatalogForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={L.control.deleteTitle}
        description={
          deleteTarget
            ? L.control.deleteDescription(deleteTarget.name)
            : ""
        }
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
